import * as path from "node:path";
import type { InstalledPackage } from "../types";
import { rgSearch } from "./rg";

// Uses ripgrep/grep to harvest name + version from node_modules/**/package.json without opening files in Node.
export async function rgListInstalledPackages(projectRoot: string): Promise<InstalledPackage[]> {
  const roots = [path.join(projectRoot, "node_modules")];
  // Only scan package.json files
  const glob = ["node_modules/**/package.json"];
  const nameMatches = await rgSearch(roots, String.raw`^[\s\t]*"name"\s*:\s*"([^"\n]+)"`, {
    glob,
    usePcre2: true,
  });
  const verMatches = await rgSearch(roots, String.raw`^[\s\t]*"version"\s*:\s*"([^"\n]+)"`, {
    glob,
    usePcre2: true,
  });
  // Group results by file
  const names = new Map<string, string>();
  for (const m of nameMatches) {
    const name = captureFirst(m.text);
    if (name) names.set(m.path, name);
  }
  const vers = new Map<string, string>();
  for (const m of verMatches) {
    const version = captureFirst(m.text);
    if (version) vers.set(m.path, version);
  }
  const out: InstalledPackage[] = [];
  for (const [file, name] of names) {
    const version = vers.get(file);
    if (!name || !version) continue;
    // Skip project root package.json
    const rel = path.relative(projectRoot, file);
    if (!rel.startsWith(`node_modules${path.sep}`)) continue;
    out.push({ name, version, source: file });
  }
  return out;
}

function captureFirst(line: string): string | undefined {
  const m = line.match(/"([^"]+)"\s*$/);
  return m ? m[1] : undefined;
}
