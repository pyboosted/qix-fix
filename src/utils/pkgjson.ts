import { backupFile, join, pathExists, readJson, writeJson } from "./fsx";

export type PackageJson = {
  name?: string;
  overrides?: Record<string, unknown>;
  resolutions?: Record<string, string>;
};

export async function readPackageJson(cwd: string): Promise<PackageJson | null> {
  const p = join(cwd, "package.json");
  if (!(await pathExists(p))) return null;
  try {
    return (await readJson(p)) as PackageJson;
  } catch {
    return null;
  }
}

export function isPinnedByOverrides(pkg: PackageJson | null, name: string): boolean {
  if (!pkg || !pkg.overrides || typeof pkg.overrides !== "object") return false;
  const ov = pkg.overrides as Record<string, unknown>;
  for (const [k, v] of Object.entries(ov)) {
    if (k === name || k.startsWith(`${name}@`)) return true;
    if (v && typeof v === "object" && !Array.isArray(v)) {
      const inner = v as Record<string, unknown>;
      if (typeof inner[name] === "string") return true;
    }
  }
  return false;
}

export function isPinnedByResolutions(pkg: PackageJson | null, name: string): boolean {
  if (!pkg || !pkg.resolutions || typeof pkg.resolutions !== "object") return false;
  const r = pkg.resolutions as Record<string, string>;
  for (const k of Object.keys(r)) {
    if (k === name || k.startsWith(`${name}@`)) return true;
  }
  return false;
}

export function getPinnedVersionOverrides(pkg: PackageJson | null, name: string): string | null {
  if (!pkg || !pkg.overrides || typeof pkg.overrides !== "object") return null;
  const ov = pkg.overrides as Record<string, unknown>;
  const direct = ov[name];
  if (typeof direct === "string") return direct;
  // look for keys like "name@range"
  for (const [k, v] of Object.entries(ov)) {
    if (k === name || k.startsWith(`${name}@`)) {
      if (typeof v === "string") return v;
    }
  }
  // nested objects may pin transitive deps under another key
  for (const v of Object.values(ov)) {
    if (v && typeof v === "object" && !Array.isArray(v)) {
      const inner = v as Record<string, unknown>;
      const iv = inner[name];
      if (typeof iv === "string") return iv;
    }
  }
  return null;
}

export function getPinnedVersionResolutions(pkg: PackageJson | null, name: string): string | null {
  if (!pkg || !pkg.resolutions || typeof pkg.resolutions !== "object") return null;
  const r = pkg.resolutions as Record<string, string>;
  if (typeof r[name] === "string") return r[name];
  for (const [k, v] of Object.entries(r)) {
    if (k === name || k.startsWith(`${name}@`)) return v;
  }
  return null;
}

export function getPinnedVersion(pkg: PackageJson | null, name: string): string | null {
  return getPinnedVersionOverrides(pkg, name) ?? getPinnedVersionResolutions(pkg, name);
}

export async function applyPinsToPackageJson(
  cwd: string,
  pins: Record<string, string>,
  opts?: { alsoResolutions?: boolean; backup?: boolean },
): Promise<{ updated: string[]; path: string; backupPath?: string }> {
  const file = join(cwd, "package.json");
  if (!(await pathExists(file))) throw new Error("package.json not found");
  const pkg = (await readJson<PackageJson>(file)) as PackageJson & Record<string, unknown>;
  const updated: string[] = [];
  pkg.overrides =
    pkg.overrides && typeof pkg.overrides === "object"
      ? (pkg.overrides as Record<string, unknown>)
      : {};
  const ov = pkg.overrides as Record<string, unknown>;
  for (const [name, ver] of Object.entries(pins)) {
    if (typeof ov[name] === "string") continue; // already pinned directly
    // Skip if there is any key like name@... present
    const hasScoped = Object.keys(ov).some((k) => k === name || k.startsWith(`${name}@`));
    if (hasScoped) continue;
    ov[name] = ver;
    updated.push(name);
  }
  if (opts?.alsoResolutions) {
    pkg.resolutions = pkg.resolutions && typeof pkg.resolutions === "object" ? pkg.resolutions : {};
    const rs = pkg.resolutions as Record<string, string>;
    for (const [name, ver] of Object.entries(pins)) {
      if (typeof rs[name] === "string") continue;
      if (Object.keys(rs).some((k) => k === name || k.startsWith(`${name}@`))) continue;
      rs[name] = ver;
    }
  }
  let backupPath: string | undefined;
  if (opts?.backup !== false) backupPath = await backupFile(file);
  await writeJson(file, pkg);
  return { updated, path: file, backupPath };
}
