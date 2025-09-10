import type { DepEdge, InstalledPackage } from "../../types";
import { join, pathExists, readText } from "../../utils/fsx";

function unquote(s: string): string {
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    return s.slice(1, -1);
  }
  return s;
}

function extractNameFromSpecifier(spec: string): string | undefined {
  // Handle common patterns:
  // - "name@^1.2.3"
  // - "@scope/name@^1.2.3"
  // - "name@npm:^1.2.3" (Yarn Berry)
  // - "name@npm:1.2.3"
  // - "name@workspace:..", "name@patch:..", etc.
  let s = spec.trim();
  s = unquote(s);
  // Prefer to cut at known protocols
  const protoIdx = s.search(/@(?:npm:|patch:|workspace:|link:|file:|https?:|git(?:hub|lab)?:)/);
  if (protoIdx > 0) {
    return s.slice(0, protoIdx);
  }
  // Fallback: last '@' separates name and range; preserve scoped names
  if (s.startsWith("@")) {
    // find second '@'
    const secondAt = s.indexOf("@", 1);
    if (secondAt > 1) return s.slice(0, secondAt);
    return undefined;
  }
  const at = s.lastIndexOf("@");
  if (at > 0) return s.slice(0, at);
  return s || undefined;
}

export function parseYarnLockString(content: string, source: string): InstalledPackage[] {
  const out: InstalledPackage[] = [];
  const lines = content.split(/\r?\n/);
  let currentKeys: string[] = [];
  let currentVersion: string | undefined;
  let currentResolution: string | undefined;

  function flush() {
    if (!currentKeys.length) return;
    // Attempt to derive name
    let name: string | undefined;
    if (currentResolution) {
      const m = currentResolution.match(/^\s*resolution\s*[:]\s*"?([^"\n]+)"?/);
      if (m) {
        const res = m[1];
        const atIdx = res.indexOf("@");
        if (atIdx > 0) name = res.slice(0, atIdx);
      }
    }
    if (!name) {
      const firstKey = currentKeys[0];
      name = extractNameFromSpecifier(firstKey);
    }
    if (name && currentVersion) {
      out.push({ name, version: currentVersion, source });
    }
    currentKeys = [];
    currentVersion = undefined;
    currentResolution = undefined;
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) {
      continue;
    }
    if (!/^\s/.test(line) && /:\s*$/.test(line)) {
      // New block
      flush();
      const head = line.trim().replace(/:\s*$/, "");
      // head may contain multiple comma-separated specifiers
      const parts = head
        .split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/) // split on top-level commas
        .map((s) => s.trim());
      currentKeys = parts;
      continue;
    }
    if (/^\s{2,}version\s+/.test(line) || /^\s{2,}version\s*:\s*/.test(line)) {
      const m = line.match(/version\s*[:]?\s*"?([^"\n]+)"?/);
      if (m) currentVersion = m[1];
      continue;
    }
    if (/^\s{2,}resolution\s*[:]\s*/.test(line)) {
      currentResolution = line;
    }
  }
  flush();
  return out;
}

export async function readYarnLock(cwd: string): Promise<InstalledPackage[] | null> {
  const file = join(cwd, "yarn.lock");
  if (!(await pathExists(file))) return null;
  const txt = await readText(file);
  return parseYarnLockString(txt, file);
}

export function parseYarnLockEdges(content: string, source: string): DepEdge[] {
  const out: DepEdge[] = [];
  const lines = content.split(/\r?\n/);
  let currentName: string | undefined;
  let currentVersion: string | undefined;
  let collecting = false;
  const newBlock = (line: string) => /:\s*$/.test(line) && !/^\s/.test(line);
  function flush() {
    currentName = undefined;
    currentVersion = undefined;
    collecting = false;
  }
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;
    if (newBlock(line)) {
      flush();
      // head like: "name@^1.2.3", another@npm:^3
      const head = line.trim().replace(/:$/, "");
      const m = head.match(/^(?:"|')?([^@\s:'"]+\/?[^@\s:'"]*)@/);
      if (m) currentName = m[1];
      continue;
    }
    if (/^\s{2,}version\s*[:]\s*/.test(line) || /^\s{2,}version\s+/.test(line)) {
      const m = line.match(/version\s*[:]?\s*"?([^"\n]+)"?/);
      if (m) currentVersion = m[1];
      continue;
    }
    if (/^\s{2,}(dependencies|devDependencies|optionalDependencies)\s*:\s*$/.test(line)) {
      collecting = true;
      continue;
    }
    if (collecting && /^\s{4,}[^\s:]+\s+"?[^"\n]+"?/.test(line)) {
      const m = line.match(/^\s{4,}([^\s:]+)\s+"?([^"\n]+)"?/);
      if (m && currentName && currentVersion) {
        const childName = m[1];
        let childVersion = m[2].replace(/^npm:/, "");
        if (!/^\d/.test(childVersion)) childVersion = ""; // range, unknown exact
        out.push({
          parentName: currentName,
          parentVersion: currentVersion,
          childName,
          childVersion,
          source,
        });
      }
    }
  }
  flush();
  return out;
}

export async function readYarnEdges(cwd: string): Promise<DepEdge[] | null> {
  const file = join(cwd, "yarn.lock");
  if (!(await pathExists(file))) return null;
  const txt = await readText(file);
  return parseYarnLockEdges(txt, file);
}
