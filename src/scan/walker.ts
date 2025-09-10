import { promises as fs } from "node:fs";
import * as path from "node:path";

export type WalkOptions = {
  followSymlinks?: boolean;
  ignoreDirs?: string[];
  fileFilter?: (file: string) => boolean;
  maxDepth?: number;
};

export async function* walkDir(
  root: string,
  opts: WalkOptions = {},
  depth = 0,
): AsyncGenerator<string> {
  const ignore = new Set(opts.ignoreDirs ?? []);
  const entries: { name: string; isDir: boolean; isSymlink: boolean }[] = [];
  try {
    for (const dirent of await fs.readdir(root, { withFileTypes: true })) {
      entries.push({
        name: dirent.name,
        isDir: dirent.isDirectory(),
        isSymlink: dirent.isSymbolicLink(),
      });
    }
  } catch {
    return;
  }
  for (const e of entries) {
    const full = path.join(root, e.name);
    if (e.isDir) {
      if (ignore.has(e.name)) continue;
      if (opts.maxDepth !== undefined && depth >= opts.maxDepth) continue;
      if (e.isSymlink && !opts.followSymlinks) continue;
      yield* walkDir(full, opts, depth + 1);
    } else {
      if (opts.fileFilter && !opts.fileFilter(full)) continue;
      yield full;
    }
  }
}

export function defaultFileFilter(file: string): boolean {
  const exts = [".js", ".ts", ".jsx", ".tsx", ".json", ".mjs", ".cjs"];
  const ext = path.extname(file).toLowerCase();
  if (exts.includes(ext)) return true;
  return false;
}
