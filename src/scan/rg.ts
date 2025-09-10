import { run } from "../utils/exec";

export type RgMatch = { path: string; line: number; text: string };

export async function detectSearchTool(): Promise<{ cmd: "rg" | "grep" | null; pcre2: boolean }> {
  const rg = await run("rg", ["--version"]);
  if (rg.code === 0) {
    const pcre2 = /PCRE2/i.test(rg.stdout);
    return { cmd: "rg", pcre2 };
  }
  const grep = await run("grep", ["--version"]);
  if (grep.code === 0) return { cmd: "grep", pcre2: false };
  return { cmd: null, pcre2: false };
}

export async function rgSearch(
  roots: string[],
  pattern: string,
  opts?: { glob?: string[]; caseInsensitive?: boolean; usePcre2?: boolean },
): Promise<RgMatch[]> {
  const { cmd, pcre2 } = await detectSearchTool();
  const insensitive = opts?.caseInsensitive ?? true;
  const globs = opts?.glob ?? [];
  if (cmd === "rg") {
    const args: string[] = ["--no-config", "--json", "-n", "-H"]; // machine-readable
    if (insensitive) args.push("-i");
    if (opts?.usePcre2 ?? pcre2) args.push("-P");
    for (const g of globs) args.push("-g", g);
    args.push(pattern);
    args.push(...roots);
    const res = await run("rg", args, 180000);
    if (res.code !== 0 && res.code !== 2) {
      // 2 means no matches
    }
    return parseRgJson(res.stdout);
  }
  if (cmd === "grep") {
    const args: string[] = ["-RInH"]; // recursive, line numbers, filenames
    if (insensitive) args.push("-i");
    // emulate globs by appending directories; kept simple
    args.push(pattern);
    args.push(...roots);
    const res = await run("grep", args, 180000);
    if (res.code !== 0 && res.code !== 1) {
      // 1 means no matches
    }
    return parseGrep(res.stdout);
  }
  return [];
}

function parseRgJson(output: string): RgMatch[] {
  const out: RgMatch[] = [];
  for (const line of output.split(/\r?\n/)) {
    if (!line) continue;
    try {
      const evt = JSON.parse(line) as {
        type?: string;
        data?: { path?: { text?: string }; line_number?: number; lines?: { text?: string } };
      };
      if (evt.type === "match") {
        const path = evt.data?.path?.text as string;
        const lineNumber = evt.data?.line_number as number;
        const text = evt.data?.lines?.text as string;
        if (path && lineNumber && typeof text === "string")
          out.push({ path, line: lineNumber, text });
      }
    } catch {}
  }
  return out;
}

function parseGrep(output: string): RgMatch[] {
  const out: RgMatch[] = [];
  for (const line of output.split(/\r?\n/)) {
    if (!line) continue;
    const idx1 = line.indexOf(":");
    const idx2 = idx1 >= 0 ? line.indexOf(":", idx1 + 1) : -1;
    if (idx1 < 0 || idx2 < 0) continue;
    const path = line.slice(0, idx1);
    const num = Number(line.slice(idx1 + 1, idx2));
    const text = line.slice(idx2 + 1);
    if (Number.isFinite(num)) out.push({ path, line: num, text });
  }
  return out;
}
