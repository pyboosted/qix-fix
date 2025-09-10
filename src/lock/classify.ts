import type { ThreatEntry } from "../types";
import { compare, maxVersion, satisfies } from "../utils/semver";

export type VersionStatus = "safe" | "compromised" | "unknown";

export type PackageReport = {
  name: string;
  versions: string[];
  statuses: { version: string; status: VersionStatus }[];
  lastSafe?: string;
  compromised: boolean;
  safeInstalledMax?: string; // max safe version among installed versions
};

export function buildThreatIndex(threats: ThreatEntry[]): Map<string, ThreatEntry> {
  const map = new Map<string, ThreatEntry>();
  for (const t of threats) map.set(t.name, t);
  return map;
}

function versionStatus(v: string, t: ThreatEntry | undefined): VersionStatus {
  if (!t) return "unknown";
  for (const r of t.badRanges) {
    try {
      if (satisfies(v, r)) return "compromised";
    } catch {
      /* ignore */
    }
  }
  if (t.lastSafe && compare(v, t.lastSafe) <= 0) return "safe";
  return "unknown";
}

export function classify(
  installed: Map<string, Set<string>>,
  threats: ThreatEntry[],
): PackageReport[] {
  const idx = buildThreatIndex(threats);
  const out: PackageReport[] = [];
  for (const [name, vers] of installed) {
    const versions = Array.from(vers).sort((a, b) => compare(a, b));
    const t = idx.get(name);
    const statuses = versions.map((v) => ({ version: v, status: versionStatus(v, t) }));
    const compromised = statuses.some((s) => s.status === "compromised");
    let safeInstalledMax: string | undefined;
    if (t) {
      const safeCandidates = versions.filter((v) => versionStatus(v, t) === "safe");
      safeInstalledMax = maxVersion(safeCandidates);
    }
    out.push({ name, versions, statuses, lastSafe: t?.lastSafe, compromised, safeInstalledMax });
  }
  // stable order
  out.sort((a, b) => a.name.localeCompare(b.name));
  return out;
}
