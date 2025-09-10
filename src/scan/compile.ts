import type { Detector } from "../types";

export type CompiledDetector = Detector & {
  regexes: { re: RegExp; hint?: string; flags?: string }[];
};

export function compileDetectors(detectors: Detector[]): CompiledDetector[] {
  return detectors.map((d) => ({
    ...d,
    regexes: d.patterns.map((p) => ({
      re: new RegExp(p.regex, p.flags ?? ""),
      hint: p.hint,
      flags: p.flags,
    })),
  }));
}
