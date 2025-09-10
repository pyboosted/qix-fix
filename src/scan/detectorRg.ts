import * as path from "node:path";
import type { Finding } from "../types";
import type { CompiledDetector } from "./compile";
import { rgSearch } from "./rg";

const DEFAULT_GLOBS = ["**/*.{js,jsx,ts,tsx,json}"];

// Verbose, detector-by-detector scan with per-root progress and match streaming.
export type DetectorStats = {
  rootsScanned: number;
  regexesProcessed: number;
  matchesCount: number;
};
export type RootSummary = { root: string; matches: number };

export async function scanDetectorParallel(
  roots: string[],
  detector: CompiledDetector,
  opts: {
    onStep?: (info: { detectorId: string; root: string; index: number; total: number }) => void;
    onMatch?: (f: Finding) => void;
  } = {},
): Promise<{ findings: Finding[]; stats: DetectorStats; rootSummary: RootSummary[] }> {
  const findings: Finding[] = [];
  const glob = detector.fileGlobs?.length ? detector.fileGlobs : DEFAULT_GLOBS;
  const totalRegex = detector.regexes.length;
  let regexesProcessed = 0;
  let matchesCount = 0;
  const rootSummary: RootSummary[] = [];

  await Promise.all(
    roots.map(async (root) => {
      let matchesForRoot = 0;
      for (let i = 0; i < detector.regexes.length; i++) {
        const rx = detector.regexes[i];
        const matches = await rgSearch([root], rx.re.source, {
          usePcre2: true,
          glob,
          caseInsensitive: (rx.flags ?? rx.re.flags)?.includes?.("i") ?? false,
        });
        for (const m of matches) {
          // Skip qix-fix's own files to prevent self-detection
          if (isQixFixPath(m.path)) continue;

          const pkg = pkgFromPath(m.path);
          if (detector.packageNameFilters?.length) {
            if (!pkg || !detector.packageNameFilters.includes(pkg)) continue;
          }
          const f: Finding = {
            file: m.path,
            line: m.line,
            detectorId: detector.id,
            severity: detector.severity,
            snippet: m.text.slice(0, 200),
            package: pkg,
            hint: rx.hint,
          };
          findings.push(f);
          matchesForRoot++;
          matchesCount++;
          if (opts.onMatch) opts.onMatch(f);
        }
        regexesProcessed++;
        if (opts.onStep)
          opts.onStep({ detectorId: detector.id, root, index: i + 1, total: totalRegex });
      }
      rootSummary.push({ root, matches: matchesForRoot });
    }),
  );

  return {
    findings,
    stats: { rootsScanned: roots.length, regexesProcessed, matchesCount },
    rootSummary,
  };
}

export async function scanWithRipgrep(
  scanRoots: string[],
  detectors: CompiledDetector[],
  opts: {
    onStep?: (info: { detectorId: string; root: string; index: number; total: number }) => void;
    onMatch?: (f: Finding) => void;
  } = {},
): Promise<{
  findings: Finding[];
  summary: { detectors: number; roots: number; regexes: number; matches: number };
  perRoot: RootSummary[];
}> {
  const findings: Finding[] = [];
  let detectorsCount = 0;
  let roots = 0;
  let regexes = 0;
  let matches = 0;
  const perRootAll: RootSummary[] = [];
  for (const d of detectors) {
    const {
      findings: f,
      stats,
      rootSummary,
    } = await scanDetectorParallel(scanRoots, d, {
      onStep: opts.onStep,
      onMatch: opts.onMatch,
    });
    findings.push(...f);
    detectorsCount += 1;
    roots += stats.rootsScanned;
    regexes += stats.regexesProcessed;
    matches += stats.matchesCount;
    perRootAll.push(...rootSummary);
  }
  // Merge per-root counts across detectors
  const perRootMap = new Map<string, number>();
  for (const r of perRootAll) perRootMap.set(r.root, (perRootMap.get(r.root) ?? 0) + r.matches);
  const perRoot = Array.from(perRootMap.entries()).map(([root, matches]) => ({ root, matches }));
  return { findings, summary: { detectors: detectorsCount, roots, regexes, matches }, perRoot };
}

function pkgFromNodeModules(p: string): string | undefined {
  const nm = `${path.sep}node_modules${path.sep}`;
  const idx = p.lastIndexOf(nm);
  if (idx === -1) return undefined;
  const rest = p.slice(idx + nm.length);
  const segs = rest.split(path.sep);
  if (!segs.length) return undefined;
  if (segs[0].startsWith("@")) return segs.slice(0, 2).join("/");
  return segs[0];
}

function pkgFromPath(p: string): string | undefined {
  const fromNM = pkgFromNodeModules(p);
  if (fromNM) return fromNM;
  // Bun/Yarn/npm caches often have segments like <name>@<version>
  const m = p.match(/[/\\](?:cache|_cacache|_npx)[/\\]((?:@[^/\\]+[/\\][^@/\\]+)|[^@/\\]+)@[0-9]/);
  if (m) return m[1].replace(/\\/g, "/");
  return undefined;
}

function isQixFixPath(filePath: string): boolean {
  // Check if path belongs to qix-fix (handles both Unix and Windows paths)
  return (
    filePath.includes("/qix-fix/dist/") ||
    filePath.includes("/qix-fix/src/") ||
    filePath.includes("\\qix-fix\\dist\\") ||
    filePath.includes("\\qix-fix\\src\\") ||
    filePath.includes("/qix-fix\\dist\\") || // Mixed separators
    filePath.includes("\\qix-fix/src/") ||
    filePath.includes("\\qix-fix/dist/") ||
    filePath.includes("/qix-fix\\src\\")
  );
}
