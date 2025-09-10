import type { DepEdge, InstalledPackage } from "../../types";
import { join, pathExists, readBuffer, readText } from "../../utils/fsx";
import { stripJsonComments, stripTrailingCommas } from "../../utils/jsonc";
import { parseYarnLockEdges, parseYarnLockString } from "./yarn";

// bun.lockb -> yarn.lock text via maintained parser, then reuse yarn parser
export async function readBunLockb(cwd: string): Promise<InstalledPackage[] | null> {
  const file = join(cwd, "bun.lockb");
  if (!(await pathExists(file))) return null;
  let parseFn: ((buf: Uint8Array | ArrayBuffer) => string) | undefined;
  try {
    type LockbModule = { parse: (buf: Uint8Array | ArrayBuffer) => string };
    const mod = (await import("@hyrious/bun.lockb")) as unknown as LockbModule;
    parseFn = mod.parse;
  } catch {
    return [];
  }
  if (!parseFn) return [];
  const buf = await readBuffer(file);
  const yarnText = parseFn(buf);
  return parseYarnLockString(yarnText, file);
}

// bun.lock (text/JSONC): best-effort parse to find objects with name+version
export async function readBunLock(cwd: string): Promise<InstalledPackage[] | null> {
  const file = join(cwd, "bun.lock");
  if (!(await pathExists(file))) return null;
  const txt = await readText(file);
  let json: unknown;
  try {
    json = JSON.parse(stripTrailingCommas(stripJsonComments(txt)));
  } catch {
    // As a fallback, if bun.lock happens to be yarn-like, try yarn parser
    try {
      return parseYarnLockString(txt, file);
    } catch {
      return [];
    }
  }
  const out: InstalledPackage[] = [];
  // Bun text lock format (as of Bun 1.2+) organizes packages under packages:{ name: [specifier, resolved, meta, integrity] }
  const obj = json as { packages?: Record<string, unknown> };
  if (obj?.packages && typeof obj.packages === "object") {
    for (const [name, value] of Object.entries(obj.packages)) {
      if (!Array.isArray(value) || value.length === 0) continue;
      const spec = String(value[0]); // e.g., "@scope/name@1.2.3" or "name@npm:1.2.3"
      // Extract version from specifier: take substring after the last '@'
      const lastAt = spec.lastIndexOf("@");
      if (lastAt <= 0 || lastAt === spec.length - 1) continue;
      const version = spec.slice(lastAt + 1).replace(/^npm:/, "");
      // Skip workspace/root entries without semantic version
      if (!/^[0-9]+\./.test(version)) continue;
      out.push({ name, version, source: file });
    }
    return out;
  }
  // Fallback: generic traversal
  const visit = (val: unknown) => {
    if (!val || typeof val !== "object") return;
    if (Array.isArray(val)) {
      for (const v of val) visit(v);
      return;
    }
    const o = val as Record<string, unknown>;
    const n = typeof o.name === "string" ? o.name : undefined;
    const v = typeof o.version === "string" ? o.version : undefined;
    if (n && v) out.push({ name: n, version: v, source: file });
    for (const v2 of Object.values(o)) visit(v2);
  };
  visit(json);
  return out;
}

export async function readBunEdges(cwd: string): Promise<DepEdge[] | null> {
  const file = join(cwd, "bun.lockb");
  if (!(await pathExists(file))) return null;
  let parseFn: ((buf: Uint8Array | ArrayBuffer) => string) | undefined;
  try {
    type LockbModule = { parse: (buf: Uint8Array | ArrayBuffer) => string };
    const mod = (await import("@hyrious/bun.lockb")) as unknown as LockbModule;
    parseFn = mod.parse;
  } catch {
    return [];
  }
  if (!parseFn) return [];
  const buf = await readBuffer(file);
  const yarnText = parseFn(buf);
  return parseYarnLockEdges(yarnText, file);
}

export async function readBunTextEdges(cwd: string): Promise<DepEdge[] | null> {
  const file = join(cwd, "bun.lock");
  if (!(await pathExists(file))) return null;
  const txt = await readText(file);
  let json: unknown;
  try {
    json = JSON.parse(stripTrailingCommas(stripJsonComments(txt)));
  } catch {
    return [];
  }
  const pkgs: Record<string, unknown> | undefined = (json as { packages?: Record<string, unknown> })
    ?.packages;
  if (!pkgs || typeof pkgs !== "object") return [];
  const edges: DepEdge[] = [];
  const getNameVersion = (entry: unknown, keyName: string): { name: string; version: string } => {
    if (Array.isArray(entry) && typeof entry[0] === "string") {
      const s = String(entry[0]);
      const at = s.lastIndexOf("@");
      if (at > 0) return { name: s.slice(0, at), version: s.slice(at + 1) };
    }
    return { name: keyName, version: "" };
  };
  for (const [pname, entry] of Object.entries(pkgs)) {
    const { name: parentName, version: parentVersion } = getNameVersion(entry, pname);
    const meta = Array.isArray(entry) && typeof entry[2] === "object" ? entry[2] : {};
    for (const group of ["dependencies", "devDependencies", "optionalDependencies"]) {
      const deps = meta[group] as Record<string, string> | undefined;
      if (!deps) continue;
      for (const childName of Object.keys(deps)) {
        const childEntry = pkgs[childName];
        const { version: childVersion } = getNameVersion(childEntry, childName);
        edges.push({ parentName, parentVersion, childName, childVersion, source: file });
      }
    }
  }
  return edges;
}
