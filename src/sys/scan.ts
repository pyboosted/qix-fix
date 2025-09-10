import type { CompiledDetector } from "../scan/compile";
import { scanWithRipgrep } from "../scan/detectorRg";
import type { Finding } from "../types";
import { getBunCacheDir, getNpmCacheDir, getYarnCacheDir } from "./paths";

export async function scanSystemCaches(
  detectors: CompiledDetector[],
  opts: { progress?: boolean } = {},
): Promise<{
  roots: string[];
  findings: Finding[];
  summary: { detectors: number; roots: number; regexes: number; matches: number };
}> {
  const roots: string[] = [];
  const npm = await getNpmCacheDir();
  if (npm) roots.push(npm);
  const yarn = await getYarnCacheDir();
  if (yarn) roots.push(yarn);
  const bun = getBunCacheDir();
  if (bun) roots.push(bun);

  const compiled = detectors; // already compiled by caller
  let done = 0;
  const total = compiled.reduce((s, d) => s + d.regexes.length, 0);
  const { findings, summary } = await scanWithRipgrep(roots.filter(Boolean), compiled, {
    onStep: ({ detectorId }: { detectorId: string }) => {
      if (!opts.progress) return;
      done++;
      process.stderr.write(`\r${detectorId}: ${done}/${total}`);
    },
  });
  if (opts.progress) process.stderr.write("\n");
  return { roots, findings, summary };
}
