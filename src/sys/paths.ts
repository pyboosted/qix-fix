import * as os from "node:os";
import * as path from "node:path";
import { run } from "../utils/exec";

export async function getNpmCacheDir(): Promise<string | null> {
  const res = await run("npm", ["config", "get", "cache"]);
  const p = res.code === 0 ? res.stdout.trim() : null;
  return p && p !== "null" ? p : path.join(os.homedir(), ".npm");
}

export async function getYarnCacheDir(): Promise<string | null> {
  const res = await run("yarn", ["cache", "dir"]);
  if (res.code === 0) return res.stdout.trim();
  // Fallback common locations
  const home = os.homedir();
  return path.join(home, ".cache", "yarn");
}

export function getBunCacheDir(): string {
  const home = os.homedir();
  const env = process.env.BUN_INSTALL_CACHE_DIR;
  return env ?? path.join(home, ".bun", "install", "cache");
}
