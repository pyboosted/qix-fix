import { promises as fs } from "node:fs";
import * as path from "node:path";
import type { Finding } from "../types";
import type { CompiledDetector } from "./compile";
import { defaultFileFilter, walkDir } from "./walker";

async function scanFile(
  file: string,
  detectors: CompiledDetector[],
  maxSnippet = 200,
): Promise<Finding[]> {
  let text: string;
  try {
    text = await fs.readFile(file, "utf8");
  } catch {
    return [];
  }
  const lines = text.split(/\r?\n/);
  const out: Finding[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (const d of detectors) {
      for (const rx of d.regexes) {
        const m = rx.re.exec(line);
        if (m) {
          const pkg = packageNameFromNodeModules(file);
          out.push({
            file,
            line: i + 1,
            detectorId: d.id,
            severity: d.severity,
            snippet: line.slice(0, maxSnippet),
            package: pkg,
          });
        }
      }
    }
  }
  return out;
}

export async function scanPaths(
  roots: string[],
  detectors: CompiledDetector[],
  onlyInDist = false,
  opts: {
    onProgress?: (processed: number, findings: number, file: string) => void;
    progressEvery?: number;
  } = {},
): Promise<Finding[]> {
  const _ignore = [".git", "node_modules", "dist", "build", "out", "public", "lib"];
  const results: Finding[] = [];
  let processed = 0;
  const progressEvery = opts.progressEvery ?? 250;
  for (const root of roots) {
    for await (const file of walkDir(root, {
      ignoreDirs: [".git"],
      fileFilter: defaultFileFilter,
    })) {
      const dirSeg = lowerTopDir(file, root);
      if (onlyInDist && !(dirSeg && ["dist", "build", "out", "public", "lib"].includes(dirSeg))) {
        continue;
      }
      const found = await scanFile(file, detectors);
      if (found.length) results.push(...found);
      processed++;
      if (opts.onProgress && processed % progressEvery === 0) {
        opts.onProgress(processed, results.length, file);
      }
    }
  }
  if (opts.onProgress) opts.onProgress(processed, results.length, "");
  return results;
}

export function packageNameFromNodeModules(p: string): string | undefined {
  const nm = `${path.sep}node_modules${path.sep}`;
  const idx = p.lastIndexOf(nm);
  if (idx === -1) return undefined;
  const rest = p.slice(idx + nm.length);
  const segs = rest.split(path.sep);
  if (!segs.length) return undefined;
  if (segs[0].startsWith("@")) return segs.slice(0, 2).join("/");
  return segs[0];
}

function lowerTopDir(file: string, root: string): string | undefined {
  const rel = path.relative(root, file);
  const seg = rel.split(path.sep)[0];
  return seg ? seg.toLowerCase() : undefined;
}
