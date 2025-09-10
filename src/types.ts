export type ThreatEntry = {
  name: string;
  badRanges: string[]; // semver ranges marking compromised versions
  lastSafe: string; // latest known safe version
  notes?: string;
  advisoryUrl?: string;
};

export type DetectorPattern = {
  regex: string; // string form; compiled at runtime
  flags?: string;
  hint?: string;
};

export type Detector = {
  id: string;
  severity: "low" | "med" | "high" | "critical";
  description: string;
  fileGlobs?: string[];
  patterns: DetectorPattern[];
  packageNameFilters?: string[];
  onlyInDist?: boolean;
};

export type InstalledPackage = {
  name: string;
  version: string;
  source: string; // lockfile path
  pathHint?: string; // optional path inside lockfile (e.g., packages key)
};

export type Finding = {
  file: string;
  line: number;
  detectorId: string;
  severity: "low" | "med" | "high" | "critical";
  snippet: string;
  package?: string; // if under node_modules/<name>/...
  hint?: string;
};

export type DepEdge = {
  parentName: string;
  parentVersion: string;
  childName: string;
  childVersion: string;
  source: string; // lockfile path
};
