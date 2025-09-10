import type { Dirent } from "node:fs";
import { promises as fs } from "node:fs";
import * as path from "node:path";
import type { InstalledPackage } from "../types";

export async function scanInstalledNodeModules(root: string): Promise<InstalledPackage[]> {
  const nm = path.join(root, "node_modules");
  const out: InstalledPackage[] = [];
  async function tryPkgJson(dir: string) {
    try {
      const txt = await fs.readFile(path.join(dir, "package.json"), "utf8");
      const pkg = JSON.parse(txt) as { name?: string; version?: string };
      if (pkg.name && pkg.version)
        out.push({
          name: pkg.name,
          version: pkg.version,
          source: nm,
          pathHint: path.relative(nm, dir),
        });
    } catch {}
  }
  async function walk(dir: string, depth: number) {
    let ents: Dirent[];
    try {
      ents = await fs.readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of ents) {
      if (!e.isDirectory()) continue;
      const full = path.join(dir, e.name);
      if (e.name.startsWith("@")) {
        // scoped packages
        let scoped: Dirent[];
        try {
          scoped = await fs.readdir(full, { withFileTypes: true });
        } catch {
          continue;
        }
        for (const s of scoped) {
          if (!s.isDirectory()) continue;
          await tryPkgJson(path.join(full, s.name));
        }
      } else {
        await tryPkgJson(full);
      }
      // look for nested node_modules (depth limited to 2)
      if (depth < 2) {
        const nested = path.join(full, "node_modules");
        await walk(nested, depth + 1);
      }
    }
  }
  await walk(nm, 0);
  return out;
}
