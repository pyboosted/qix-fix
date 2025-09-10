import type { DepEdge, InstalledPackage } from "../types";
import { join, pathExists, readText } from "../utils/fsx";
import { readBunEdges, readBunLock, readBunLockb, readBunTextEdges } from "./readers/bun";
import { readNpmEdges, readNpmLock } from "./readers/npm";
import { parseYarnLockEdges, readYarnLock } from "./readers/yarn";

export async function scanLockfiles(cwd: string): Promise<{
  paths: string[];
  byFile: Record<string, InstalledPackage[]>;
  aggregate: Map<string, Set<string>>;
  edgesByFile: Record<string, DepEdge[]>;
  edgesAll: DepEdge[];
}> {
  const candidates = [
    join(cwd, "package-lock.json"),
    join(cwd, "yarn.lock"),
    join(cwd, "bun.lock"),
    join(cwd, "bun.lockb"),
  ];
  const paths: string[] = [];
  for (const p of candidates) if (await pathExists(p)) paths.push(p);

  const byFile: Record<string, InstalledPackage[]> = {};
  const aggregate: Map<string, Set<string>> = new Map();
  const edgesByFile: Record<string, DepEdge[]> = {};
  const edgesAll: DepEdge[] = [];

  const add = (items: InstalledPackage[] | null) => {
    if (!items) return;
    for (const it of items) {
      const set = aggregate.get(it.name) || new Set<string>();
      set.add(it.version);
      aggregate.set(it.name, set);
      let arr = byFile[it.source];
      if (!arr) {
        arr = [];
        byFile[it.source] = arr;
      }
      arr.push(it);
    }
  };

  add(await readNpmLock(cwd));
  add(await readYarnLock(cwd));
  add(await readBunLock(cwd));
  add(await readBunLockb(cwd));

  // Edges pass 1: yarn + bun.lockb
  const yarnFile = join(cwd, "yarn.lock");
  if (await pathExists(yarnFile)) {
    const txt = await readText(yarnFile);
    const edges = parseYarnLockEdges(txt, yarnFile);
    edgesByFile[yarnFile] = edges;
    edgesAll.push(...edges);
  }
  const bunLockbFile = join(cwd, "bun.lockb");
  if (await pathExists(bunLockbFile)) {
    const edges = await readBunEdges(cwd);
    if (edges) {
      edgesByFile[bunLockbFile] = edges;
      edgesAll.push(...edges);
    }
  }
  const bunTextFile = join(cwd, "bun.lock");
  if (await pathExists(bunTextFile)) {
    const edges = await readBunTextEdges(cwd);
    if (edges) {
      edgesByFile[bunTextFile] = edges;
      edgesAll.push(...edges);
    }
  }

  // Edges pass 2: npm package-lock
  const npmEdges = await readNpmEdges(cwd);
  if (npmEdges) {
    edgesByFile[join(cwd, "package-lock.json")] = npmEdges;
    edgesAll.push(...npmEdges);
  }

  return { paths, byFile, aggregate, edgesByFile, edgesAll };
}
