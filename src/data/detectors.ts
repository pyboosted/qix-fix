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

export const detectors: Detector[] = [
  {
    id: "eth-drain-address",
    severity: "critical",
    description: "Hardcoded attacker ETH address observed in the payload.",
    fileGlobs: ["**/*.js", "**/*.mjs", "**/*.cjs"],
    onlyInDist: true,
    patterns: [
      {
        regex: "0xFc4a4858bafef54D1b1d7697bfb5c52F4c166976",
        flags: "i",
        hint: "Attacker ETH address (with 0x)",
      },
      {
        regex:
          '"Fc4a4858bafef54D1b1d7697bfb5c52F4c166976"\\s*\\.\\s*padStart\\(\\s*64\\s*,\\s*["\']0["\']\\)',
        flags: "i",
        hint: "Calldata address assembled via padStart(64,'0')",
      },
      {
        regex: "\\bto\\b\\s*[:=]\\s*[\"']0xFc4a4858bafef54D1b1d7697bfb5c52F4c166976[\"']",
        flags: "i",
        hint: "Destination forced to attacker address",
      },
    ],
  },

  {
    id: "unique-identifiers",
    severity: "high",
    description: "Unique function/object identifiers specific to this malware.",
    fileGlobs: ["**/*.js", "**/*.mjs", "**/*.cjs"],
    onlyInDist: true,
    patterns: [
      { regex: "\\bstealthProxyControl\\b", flags: "i", hint: "Global control object" },
      { regex: "\\bcheckethereumw\\b", flags: "i", hint: "Activation probe" },
      { regex: "\\bnewdlocal\\b", flags: "i", hint: "Core mutation routine" },
    ],
  },
  {
    id: "solana-sentinel",
    severity: "high",
    description: "Solana-specific indicators used by the payload to rewrite transaction keys.",
    fileGlobs: ["**/*.js", "**/*.mjs", "**/*.cjs"],
    onlyInDist: true,
    patterns: [
      {
        regex: "[\"']19111111111111111111111111111111[\"']",
        flags: "i",
        hint: "Sentinel pubkey constant",
      },
      {
        regex: "solana_sign(?:AndSend)?Transaction",
        flags: "i",
        hint: "Interception of Solana sign/send methods",
      },
    ],
  },
];

export default detectors;
