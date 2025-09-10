import type { PackageReport } from "../lock/classify";
import type { PackageJson } from "../utils/pkgjson";
import { isPinnedByOverrides, isPinnedByResolutions } from "../utils/pkgjson";

export type PinPlan = {
  overrides: Record<string, string>;
  resolutions: Record<string, string>;
  warnings: string[];
};

export function computePins(
  reports: PackageReport[],
  pkg: PackageJson | null,
): { plan: PinPlan; alreadyPinned: Set<string> } {
  const overrides: Record<string, string> = {};
  const resolutions: Record<string, string> = {};
  const warnings: string[] = [];
  const alreadyPinned = new Set<string>();

  for (const r of reports) {
    if (!r.compromised) continue;
    const pinned = isPinnedByOverrides(pkg, r.name) || isPinnedByResolutions(pkg, r.name);
    if (pinned) {
      alreadyPinned.add(r.name);
      continue;
    }
    // Choose target: prefer installed max safe; else lastSafe if known
    const target = r.safeInstalledMax ?? r.lastSafe;
    if (!target) {
      warnings.push(`No safe target known for ${r.name}`);
      continue;
    }
    // Multi-version warning
    if (r.versions.length > 1) {
      warnings.push(
        `${r.name} appears at multiple versions (${r.versions.join(", ")}); pinning to ${target} may break dependents.`,
      );
    }
    overrides[r.name] = target;
    resolutions[r.name] = target;
  }

  return { plan: { overrides, resolutions, warnings }, alreadyPinned };
}
