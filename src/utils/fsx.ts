import { promises as fs } from "node:fs";
import * as path from "node:path";

export async function pathExists(p: string): Promise<boolean> {
  try {
    await fs.stat(p);
    return true;
  } catch {
    return false;
  }
}

export async function readText(p: string): Promise<string> {
  return await fs.readFile(p, "utf8");
}

export async function readJson<T = unknown>(p: string): Promise<T> {
  const txt = await readText(p);
  return JSON.parse(txt) as T;
}

export async function readBuffer(p: string): Promise<Uint8Array> {
  const buf = await fs.readFile(p);
  return new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
}

export function join(...segs: string[]): string {
  return path.join(...segs);
}

export async function writeText(p: string, data: string): Promise<void> {
  await fs.writeFile(p, data, "utf8");
}

export async function writeJson(p: string, data: unknown): Promise<void> {
  const txt = `${JSON.stringify(data, null, 2)}\n`;
  await writeText(p, txt);
}

export async function backupFile(p: string, suffix = ".qixfix.bak"): Promise<string> {
  const dir = path.dirname(p);
  const base = path.basename(p);
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const target = path.join(dir, `${base}${suffix}.${stamp}`);
  await fs.copyFile(p, target);
  return target;
}
