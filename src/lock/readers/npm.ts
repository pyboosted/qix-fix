import type { DepEdge, InstalledPackage } from "../../types";
import { join, pathExists, readJson } from "../../utils/fsx";

type NpmLockV2PackageEntry = {
  name?: string;
  version?: string;
};

type NpmLockV2 = {
  lockfileVersion: number;
  packages?: Record<string, NpmLockV2PackageEntry>;
};

type NpmLockV1Dep = {
  version?: string;
  dependencies?: Record<string, NpmLockV1Dep>;
};

type NpmLockV1 = {
  lockfileVersion?: number;
  dependencies?: Record<string, NpmLockV1Dep>;
};

function nameFromNodeModulesPath(p: string): string | undefined {
  // Examples: "", "node_modules/name", "node_modules/@scope/name", "node_modules/name/node_modules/other"
  const nm = "node_modules";
  const idx = p.indexOf(nm);
  if (idx === -1) return undefined;
  let rest = p.slice(idx + nm.length);
  if (rest.startsWith("/")) rest = rest.slice(1);
  if (!rest) return undefined;
  const parts = rest.split("/");
  if (parts[0] === "@" || parts[0].startsWith("@")) {
    // handle accidental split producing ["@scope", "name", ...]
    if (parts.length >= 2) return `${parts[0]}/${parts[1]}`;
    return undefined;
  }
  return parts[0];
}

export async function readNpmLock(cwd: string): Promise<InstalledPackage[] | null> {
  const file = join(cwd, "package-lock.json");
  if (!(await pathExists(file))) return null;
  let data: NpmLockV2 | NpmLockV1;
  try {
    data = await readJson(file);
  } catch {
    return [];
  }
  const out: InstalledPackage[] = [];
  const _v = (data as NpmLockV2).packages
    ? (data as NpmLockV2).lockfileVersion
    : (data as NpmLockV1).lockfileVersion || 1;

  const v2Packages = (data as NpmLockV2).packages;
  if (v2Packages && typeof v2Packages === "object") {
    for (const [pkgPath, entry] of Object.entries(v2Packages)) {
      if (!entry || !entry.version) continue;
      let name = entry.name;
      if (!name) {
        name = nameFromNodeModulesPath(pkgPath);
        if (!name) continue;
      }
      if (pkgPath === "") continue; // skip root project
      out.push({ name, version: entry.version, source: file, pathHint: pkgPath });
    }
  } else if ((data as NpmLockV1).dependencies) {
    const walk = (deps: Record<string, NpmLockV1Dep>, parentPath: string) => {
      for (const [name, dep] of Object.entries(deps)) {
        if (!dep || !dep.version) continue;
        out.push({
          name,
          version: dep.version,
          source: file,
          pathHint: parentPath ? `${parentPath}>${name}` : name,
        });
        if (dep.dependencies) walk(dep.dependencies, parentPath ? `${parentPath}>${name}` : name);
      }
    };
    const v1Deps = (data as NpmLockV1).dependencies;
    if (v1Deps) walk(v1Deps, "");
  }

  return out;
}

export async function readNpmEdges(cwd: string): Promise<DepEdge[] | null> {
  const file = join(cwd, "package-lock.json");
  if (!(await pathExists(file))) return null;
  let data: unknown;
  try {
    data = await readJson(file);
  } catch {
    return [];
  }
  const edges: DepEdge[] = [];
  if (
    data &&
    typeof data === "object" &&
    data !== null &&
    "packages" in data &&
    typeof data.packages === "object"
  ) {
    // v2+ packages map with paths
    const pkgs: Record<string, unknown> = data.packages as Record<string, unknown>;
    const getName = (pkgPath: string, entry: unknown): string | undefined =>
      (entry as { name?: string })?.name ?? nameFromNodeModulesPath(pkgPath);
    const getChildVersion = (parentPath: string, childName: string): string | "" => {
      // Try nested under parent
      const nested = `${parentPath.replace(/\/$/, "")}/node_modules/${childName}`.replace(
        /^\/*/,
        "",
      );
      const e1 = pkgs[nested] as { version?: string } | undefined;
      if (e1?.version) return e1.version;
      const top = `node_modules/${childName}`;
      const e2 = pkgs[top] as { version?: string } | undefined;
      if (e2?.version) return e2.version;
      return "";
    };
    for (const [pkgPath, entry] of Object.entries(pkgs)) {
      if (!entry || typeof entry !== "object") continue;
      const entryObj = entry as { version?: string; dependencies?: Record<string, string> };
      if (typeof entryObj.version !== "string") continue;
      const parentName = getName(pkgPath, entry);
      const parentVersion = entryObj.version;
      if (!parentName) continue;
      const deps = entryObj.dependencies;
      if (!deps) continue;
      for (const childName of Object.keys(deps)) {
        const childVersion = getChildVersion(pkgPath, childName);
        edges.push({ parentName, parentVersion, childName, childVersion, source: file });
      }
    }
    return edges;
  }
  // v1: nested dependencies
  const walk = (name: string, v: unknown) => {
    const vObj = v as { version?: string; dependencies?: Record<string, unknown> };
    if (!v || typeof vObj.version !== "string") return;
    const parentName = name;
    const parentVersion = vObj.version;
    const deps = vObj.dependencies;
    if (!deps) return;
    for (const [childName, child] of Object.entries(deps)) {
      const childObj = child as { version?: string };
      const childVersion = typeof childObj?.version === "string" ? childObj.version : "";
      edges.push({ parentName, parentVersion, childName, childVersion, source: file });
      walk(childName, child);
    }
  };
  if (
    data &&
    typeof data === "object" &&
    data !== null &&
    "dependencies" in data &&
    typeof data.dependencies === "object"
  ) {
    for (const [name, dep] of Object.entries(data.dependencies as Record<string, unknown>)) {
      walk(name, dep);
    }
  }
  return edges;
}
