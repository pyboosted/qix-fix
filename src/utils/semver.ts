export type Semver = {
  major: number;
  minor: number;
  patch: number;
  prerelease: (string | number)[];
  build: string[];
};

export function parseVersion(v: string): Semver | null {
  const m = v.trim().match(/^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?(?:\+([0-9A-Za-z.-]+))?$/);
  if (!m) return null;
  const prerelease = m[4] ? m[4].split(".").map((x) => (/^\d+$/.test(x) ? Number(x) : x)) : [];
  const build = m[5] ? m[5].split(".") : [];
  return { major: Number(m[1]), minor: Number(m[2]), patch: Number(m[3]), prerelease, build };
}

export function compare(a: string, b: string): number {
  const pa = parseVersion(a);
  const pb = parseVersion(b);
  if (!pa || !pb) return a.localeCompare(b);
  if (pa.major !== pb.major) return pa.major - pb.major;
  if (pa.minor !== pb.minor) return pa.minor - pb.minor;
  if (pa.patch !== pb.patch) return pa.patch - pb.patch;
  // prerelease: absence > presence
  const apr = pa.prerelease,
    bpr = pb.prerelease;
  if (apr.length === 0 && bpr.length === 0) return 0;
  if (apr.length === 0) return 1;
  if (bpr.length === 0) return -1;
  const len = Math.max(apr.length, bpr.length);
  for (let i = 0; i < len; i++) {
    const ai = apr[i];
    const bi = bpr[i];
    if (ai === undefined) return -1;
    if (bi === undefined) return 1;
    if (typeof ai === "number" && typeof bi === "number") {
      if (ai !== bi) return ai - bi;
    } else if (typeof ai === "number") {
      return -1;
    } else if (typeof bi === "number") {
      return 1;
    } else {
      if (ai !== bi) return String(ai).localeCompare(String(bi));
    }
  }
  return 0;
}

export function maxVersion(versions: Iterable<string>): string | undefined {
  let max: string | undefined;
  for (const v of versions) {
    if (!max || compare(v, max) > 0) max = v;
  }
  return max;
}

function parseComparatorToken(tok: string): ((v: string) => boolean) | null {
  tok = tok.trim();
  if (!tok) return null;
  // caret
  if (tok.startsWith("^")) {
    const base = tok.slice(1);
    const p = parseVersion(normalizeSimple(base));
    if (!p) return null;
    let upper: Semver;
    if (p.major > 0)
      upper = { ...p, major: p.major + 1, minor: 0, patch: 0, prerelease: [], build: [] };
    else if (p.minor > 0) upper = { ...p, minor: p.minor + 1, patch: 0, prerelease: [], build: [] };
    else upper = { ...p, patch: p.patch + 1, prerelease: [], build: [] };
    const lowerStr = formatBase(p);
    const upperStr = formatBase(upper);
    return (v) => compare(v, lowerStr) >= 0 && compare(v, upperStr) < 0;
  }
  // tilde
  if (tok.startsWith("~")) {
    const base = tok.slice(1);
    const p = parseVersion(normalizeSimple(base));
    if (!p) return null;
    const upper: Semver = { ...p, minor: p.minor + 1, patch: 0, prerelease: [], build: [] };
    const lowerStr = formatBase(p);
    const upperStr = formatBase(upper);
    return (v) => compare(v, lowerStr) >= 0 && compare(v, upperStr) < 0;
  }
  // comparators
  const m = tok.match(/^(<=|>=|<|>|=)?\s*(\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?)/);
  if (m) {
    const op = m[1] ?? "=";
    const ver = m[2];
    return (v) => {
      const cmp = compare(v, ver);
      switch (op) {
        case "<":
          return cmp < 0;
        case "<=":
          return cmp <= 0;
        case ">":
          return cmp > 0;
        case ">=":
          return cmp >= 0;
        default:
          return cmp === 0;
      }
    };
  }
  // exact version token like 1.2.3
  const p = parseVersion(tok);
  if (p) return (v) => compare(v, tok) === 0;
  return null;
}

function normalizeSimple(input: string): string {
  // Accept forms like 1.2 or 1; coerce to 1.2.0 or 1.0.0
  const parts = input.split(".");
  while (parts.length < 3) parts.push("0");
  return parts.slice(0, 3).join(".");
}

function formatBase(p: Semver): string {
  return `${p.major}.${p.minor}.${p.patch}`;
}

export function satisfies(version: string, range: string): boolean {
  // Split on || for OR groups
  const groups = range
    .split("||")
    .map((g) => g.trim())
    .filter(Boolean);
  if (groups.length === 0) return true;
  for (const g of groups) {
    const tokens = g.split(/\s+/).filter(Boolean);
    let ok = true;
    for (const tok of tokens) {
      const cmp = parseComparatorToken(tok);
      if (!cmp) continue;
      if (!cmp(version)) {
        ok = false;
        break;
      }
    }
    if (ok) return true;
  }
  return false;
}
