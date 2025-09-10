import type { ThreatEntry } from "../types";

// Built-in threat database.
// Replace or extend with your entries. You can also supply an external JSON
// file via CLI flags later; this module serves as the default in-repo source.
export const threats: ThreatEntry[] = [
  {
    name: "ansi-styles",
    badRanges: ["6.2.2"],
    lastSafe: "6.2.1",
    notes: "ANSI escape codes for styling strings in the terminal - compromised on 2025-09-08",
    advisoryUrl: "https://github.com/debug-js/debug/issues/1005#issuecomment-3266868187",
  },
  {
    name: "debug",
    badRanges: ["4.4.2"],
    lastSafe: "4.4.1",
    notes: "JavaScript debugging utility - compromised on 2025-09-08",
    advisoryUrl: "https://github.com/debug-js/debug/issues/1005#issuecomment-3266868187",
  },
  {
    name: "chalk",
    badRanges: ["5.6.1"],
    lastSafe: "5.6.0",
    notes: "Terminal string styling - compromised on 2025-09-08",
    advisoryUrl: "https://github.com/debug-js/debug/issues/1005#issuecomment-3266868187",
  },
  {
    name: "supports-color",
    badRanges: ["10.2.1"],
    lastSafe: "10.2.0",
    notes: "Detect whether a terminal supports color - compromised on 2025-09-08",
    advisoryUrl: "https://github.com/debug-js/debug/issues/1005#issuecomment-3266868187",
  },
  {
    name: "strip-ansi",
    badRanges: ["7.1.1"],
    lastSafe: "7.1.0",
    notes: "Strip ANSI escape codes from a string - compromised on 2025-09-08",
    advisoryUrl: "https://github.com/debug-js/debug/issues/1005#issuecomment-3266868187",
  },
  {
    name: "ansi-regex",
    badRanges: ["6.2.1"],
    lastSafe: "6.2.0",
    notes: "Regular expression for matching ANSI escape codes - compromised on 2025-09-08",
    advisoryUrl: "https://github.com/debug-js/debug/issues/1005#issuecomment-3266868187",
  },
  {
    name: "wrap-ansi",
    badRanges: ["9.0.1"],
    lastSafe: "9.0.0",
    notes: "Wordwrap a string with ANSI escape codes - compromised on 2025-09-08",
    advisoryUrl: "https://github.com/debug-js/debug/issues/1005#issuecomment-3266868187",
  },
  {
    name: "color-convert",
    badRanges: ["3.1.1"],
    lastSafe: "3.1.0",
    notes: "Plain color conversion functions - compromised on 2025-09-08",
    advisoryUrl: "https://github.com/debug-js/debug/issues/1005#issuecomment-3266868187",
  },
  {
    name: "color-name",
    badRanges: ["2.0.1"],
    lastSafe: "1.1.4",
    notes: "A list of color names and their values - compromised on 2025-09-08",
    advisoryUrl: "https://github.com/debug-js/debug/issues/1005#issuecomment-3266868187",
  },
  {
    name: "is-arrayish",
    badRanges: ["0.3.3"],
    lastSafe: "0.3.2",
    notes: "Determines if an object can be used like an Array - compromised on 2025-09-08",
    advisoryUrl: "https://github.com/debug-js/debug/issues/1005#issuecomment-3266868187",
  },
  {
    name: "slice-ansi",
    badRanges: ["7.1.1"],
    lastSafe: "7.0.0",
    notes: "Slice a string with ANSI escape codes - compromised on 2025-09-08",
    advisoryUrl: "https://github.com/debug-js/debug/issues/1005#issuecomment-3266868187",
  },
  {
    name: "color",
    badRanges: ["5.0.1"],
    lastSafe: "4.2.3",
    notes: "Color conversion and manipulation library - compromised on 2025-09-08",
    advisoryUrl: "https://github.com/debug-js/debug/issues/1005#issuecomment-3266868187",
  },
  {
    name: "color-string",
    badRanges: ["2.1.1"],
    lastSafe: "1.9.1",
    notes: "Parser and generator for CSS color strings - compromised on 2025-09-08",
    advisoryUrl: "https://github.com/debug-js/debug/issues/1005#issuecomment-3266868187",
  },
  {
    name: "simple-swizzle",
    badRanges: ["0.2.3"],
    lastSafe: "0.2.2",
    notes: "Simply swizzle your objects - compromised on 2025-09-08",
    advisoryUrl: "https://github.com/debug-js/debug/issues/1005#issuecomment-3266868187",
  },
  {
    name: "supports-hyperlinks",
    badRanges: ["4.1.1"],
    lastSafe: "4.1.0",
    notes: "Detect whether a terminal supports hyperlinks - compromised on 2025-09-08",
    advisoryUrl: "https://github.com/debug-js/debug/issues/1005#issuecomment-3266868187",
  },
  {
    name: "has-ansi",
    badRanges: ["6.0.1"],
    lastSafe: "6.0.0",
    notes: "Check if a string has ANSI escape codes - compromised on 2025-09-08",
    advisoryUrl: "https://github.com/debug-js/debug/issues/1005#issuecomment-3266868187",
  },
  {
    name: "chalk-template",
    badRanges: ["1.1.1"],
    lastSafe: "1.1.0",
    notes: "Terminal string styling with tagged template literals - compromised on 2025-09-08",
    advisoryUrl: "https://github.com/debug-js/debug/issues/1005#issuecomment-3266868187",
  },
  {
    name: "backslash",
    badRanges: ["0.2.1"],
    lastSafe: "0.2.0",
    notes: "Backslash utility - compromised on 2025-09-08",
    advisoryUrl: "https://github.com/debug-js/debug/issues/1005#issuecomment-3266868187",
  },
  {
    name: "@duckdb/node-api",
    badRanges: ["1.3.3"],
    lastSafe: "1.3.2",
    notes:
      "Malicious code to interfere with cryptocoin transactions - compromised through phishing attack",
    advisoryUrl: "https://github.com/duckdb/duckdb-node/security/advisories/GHSA-w62p-hx95-gf2c",
  },
  {
    name: "@duckdb/node-bindings",
    badRanges: ["1.3.3"],
    lastSafe: "1.3.2",
    notes:
      "Malicious code to interfere with cryptocoin transactions - compromised through phishing attack",
    advisoryUrl: "https://github.com/duckdb/duckdb-node/security/advisories/GHSA-w62p-hx95-gf2c",
  },
  {
    name: "duckdb",
    badRanges: ["1.3.3"],
    lastSafe: "1.3.2",
    notes:
      "Malicious code to interfere with cryptocoin transactions - compromised through phishing attack",
    advisoryUrl: "https://github.com/duckdb/duckdb-node/security/advisories/GHSA-w62p-hx95-gf2c",
  },
  {
    name: "@duckdb/duckdb-wasm",
    badRanges: ["1.29.2"],
    lastSafe: "1.29.1",
    notes:
      "Malicious code to interfere with cryptocoin transactions - compromised through phishing attack",
    advisoryUrl: "https://github.com/duckdb/duckdb-node/security/advisories/GHSA-w62p-hx95-gf2c",
  },
];

export default threats;
