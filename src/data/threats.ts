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
  // Tinycolor campaign - September 2025
  {
    name: "angulartics2",
    badRanges: ["14.1.2"],
    lastSafe: "14.1.0",
    notes:
      "Trojanized in the @ctrl/tinycolor supply-chain campaign (September 2025); revert to prior known-good release and rotate tokens if installed.",
    advisoryUrl: "https://socket.dev/blog/tinycolor-supply-chain-attack-affects-40-packages",
  },
  {
    name: "@ctrl/deluge",
    badRanges: ["7.2.2"],
    lastSafe: "7.2.0",
    notes:
      "Trojanized in the @ctrl/tinycolor supply-chain campaign (September 2025); revert to prior known-good release and rotate tokens if installed.",
    advisoryUrl: "https://socket.dev/blog/tinycolor-supply-chain-attack-affects-40-packages",
  },
  {
    name: "@ctrl/golang-template",
    badRanges: ["1.4.3"],
    lastSafe: "1.4.1",
    notes:
      "Trojanized in the @ctrl/tinycolor supply-chain campaign (September 2025); revert to prior known-good release and rotate tokens if installed.",
    advisoryUrl: "https://socket.dev/blog/tinycolor-supply-chain-attack-affects-40-packages",
  },
  {
    name: "@ctrl/magnet-link",
    badRanges: ["4.0.4"],
    lastSafe: "4.0.2",
    notes:
      "Trojanized in the @ctrl/tinycolor supply-chain campaign (September 2025); revert to prior known-good release and rotate tokens if installed.",
    advisoryUrl: "https://socket.dev/blog/tinycolor-supply-chain-attack-affects-40-packages",
  },
  {
    name: "@ctrl/ngx-codemirror",
    badRanges: ["7.0.2"],
    lastSafe: "7.0.0",
    notes:
      "Trojanized in the @ctrl/tinycolor supply-chain campaign (September 2025); revert to prior known-good release and rotate tokens if installed.",
    advisoryUrl: "https://socket.dev/blog/tinycolor-supply-chain-attack-affects-40-packages",
  },
  {
    name: "@ctrl/ngx-csv",
    badRanges: ["6.0.2"],
    lastSafe: "6.0.0",
    notes:
      "Trojanized in the @ctrl/tinycolor supply-chain campaign (September 2025); revert to prior known-good release and rotate tokens if installed.",
    advisoryUrl: "https://socket.dev/blog/tinycolor-supply-chain-attack-affects-40-packages",
  },
  {
    name: "@ctrl/ngx-emoji-mart",
    badRanges: ["9.2.2"],
    lastSafe: "9.2.0",
    notes:
      "Trojanized in the @ctrl/tinycolor supply-chain campaign (September 2025); revert to prior known-good release and rotate tokens if installed.",
    advisoryUrl: "https://socket.dev/blog/tinycolor-supply-chain-attack-affects-40-packages",
  },
  {
    name: "@ctrl/ngx-rightclick",
    badRanges: ["4.0.2"],
    lastSafe: "4.0.0",
    notes:
      "Trojanized in the @ctrl/tinycolor supply-chain campaign (September 2025); revert to prior known-good release and rotate tokens if installed.",
    advisoryUrl: "https://socket.dev/blog/tinycolor-supply-chain-attack-affects-40-packages",
  },
  {
    name: "@ctrl/qbittorrent",
    badRanges: ["9.7.2"],
    lastSafe: "9.7.0",
    notes:
      "Trojanized in the @ctrl/tinycolor supply-chain campaign (September 2025); revert to prior known-good release and rotate tokens if installed.",
    advisoryUrl: "https://socket.dev/blog/tinycolor-supply-chain-attack-affects-40-packages",
  },
  {
    name: "@ctrl/react-adsense",
    badRanges: ["2.0.2"],
    lastSafe: "2.0.0",
    notes:
      "Trojanized in the @ctrl/tinycolor supply-chain campaign (September 2025); revert to prior known-good release and rotate tokens if installed.",
    advisoryUrl: "https://socket.dev/blog/tinycolor-supply-chain-attack-affects-40-packages",
  },
  {
    name: "@ctrl/shared-torrent",
    badRanges: ["6.3.2"],
    lastSafe: "6.3.0",
    notes:
      "Trojanized in the @ctrl/tinycolor supply-chain campaign (September 2025); revert to prior known-good release and rotate tokens if installed.",
    advisoryUrl: "https://socket.dev/blog/tinycolor-supply-chain-attack-affects-40-packages",
  },
  {
    name: "@ctrl/tinycolor",
    badRanges: ["4.1.2", "4.1.1"],
    lastSafe: "4.2.0",
    notes:
      "Trojanized in the @ctrl/tinycolor supply-chain campaign (September 2025); revert to prior known-good release and rotate tokens if installed.",
    advisoryUrl: "https://socket.dev/blog/tinycolor-supply-chain-attack-affects-40-packages",
  },
  {
    name: "@ctrl/torrent-file",
    badRanges: ["4.1.2"],
    lastSafe: "4.1.0",
    notes:
      "Trojanized in the @ctrl/tinycolor supply-chain campaign (September 2025); revert to prior known-good release and rotate tokens if installed.",
    advisoryUrl: "https://socket.dev/blog/tinycolor-supply-chain-attack-affects-40-packages",
  },
  {
    name: "@ctrl/transmission",
    badRanges: ["7.3.1"],
    lastSafe: "7.3.0",
    notes:
      "Trojanized in the @ctrl/tinycolor supply-chain campaign (September 2025); revert to prior known-good release and rotate tokens if installed.",
    advisoryUrl: "https://socket.dev/blog/tinycolor-supply-chain-attack-affects-40-packages",
  },
  {
    name: "@ctrl/ts-base32",
    badRanges: ["4.0.2"],
    lastSafe: "4.0.0",
    notes:
      "Trojanized in the @ctrl/tinycolor supply-chain campaign (September 2025); revert to prior known-good release and rotate tokens if installed.",
    advisoryUrl: "https://socket.dev/blog/tinycolor-supply-chain-attack-affects-40-packages",
  },
  {
    name: "encounter-playground",
    badRanges: ["0.0.5"],
    lastSafe: "0.0.4",
    notes:
      "Trojanized in the @ctrl/tinycolor supply-chain campaign (September 2025); revert to prior known-good release and rotate tokens if installed.",
    advisoryUrl: "https://socket.dev/blog/tinycolor-supply-chain-attack-affects-40-packages",
  },
  {
    name: "fast.unique",
    badRanges: ["0.2.3", "0.2.1"],
    lastSafe: "0.0.0",
    notes:
      "Typosquatted package created for the @ctrl/tinycolor campaign; remove entirely and audit systems for unauthorized publishes.",
    advisoryUrl: "https://socket.dev/blog/tinycolor-supply-chain-attack-affects-40-packages",
  },
  {
    name: "graphql-depth-limit",
    badRanges: ["1.2.1", "1.2.0"],
    lastSafe: "1.1.0",
    notes:
      "Trojanized in the @ctrl/tinycolor supply-chain campaign (September 2025); revert to prior known-good release and rotate tokens if installed.",
    advisoryUrl: "https://socket.dev/blog/tinycolor-supply-chain-attack-affects-40-packages",
  },
  {
    name: "json-rules-engine-simplified",
    badRanges: ["0.2.4", "0.2.1"],
    lastSafe: "0.2.3",
    notes:
      "Trojanized in the @ctrl/tinycolor supply-chain campaign (September 2025); revert to prior known-good release and rotate tokens if installed.",
    advisoryUrl: "https://socket.dev/blog/tinycolor-supply-chain-attack-affects-40-packages",
  },
  {
    name: "jsonlint",
    badRanges: ["1.6.4", "1.6.3"],
    lastSafe: "1.6.2",
    notes:
      "Trojanized in the @ctrl/tinycolor supply-chain campaign (September 2025); revert to prior known-good release and rotate tokens if installed.",
    advisoryUrl: "https://socket.dev/blog/tinycolor-supply-chain-attack-affects-40-packages",
  },
  {
    name: "koa2-swagger-ui",
    badRanges: ["5.11.2", "5.11.1"],
    lastSafe: "5.11.0",
    notes:
      "Trojanized in the @ctrl/tinycolor supply-chain campaign (September 2025); revert to prior known-good release and rotate tokens if installed.",
    advisoryUrl: "https://socket.dev/blog/tinycolor-supply-chain-attack-affects-40-packages",
  },
  {
    name: "ngx-color",
    badRanges: ["10.0.2"],
    lastSafe: "10.0.0",
    notes:
      "Trojanized in the @ctrl/tinycolor supply-chain campaign (September 2025); revert to prior known-good release and rotate tokens if installed.",
    advisoryUrl: "https://socket.dev/blog/tinycolor-supply-chain-attack-affects-40-packages",
  },
  {
    name: "ngx-toastr",
    badRanges: ["19.0.2"],
    lastSafe: "19.0.0",
    notes:
      "Trojanized in the @ctrl/tinycolor supply-chain campaign (September 2025); revert to prior known-good release and rotate tokens if installed.",
    advisoryUrl: "https://socket.dev/blog/tinycolor-supply-chain-attack-affects-40-packages",
  },
  {
    name: "ngx-trend",
    badRanges: ["8.0.1"],
    lastSafe: "8.0.0",
    notes:
      "Trojanized in the @ctrl/tinycolor supply-chain campaign (September 2025); revert to prior known-good release and rotate tokens if installed.",
    advisoryUrl: "https://socket.dev/blog/tinycolor-supply-chain-attack-affects-40-packages",
  },
  {
    name: "react-complaint-image",
    badRanges: ["0.0.35"],
    lastSafe: "0.0.34",
    notes:
      "Trojanized in the @ctrl/tinycolor supply-chain campaign (September 2025); revert to prior known-good release and rotate tokens if installed.",
    advisoryUrl: "https://socket.dev/blog/tinycolor-supply-chain-attack-affects-40-packages",
  },
  {
    name: "react-jsonschema-form-conditionals",
    badRanges: ["0.3.21"],
    lastSafe: "0.3.20",
    notes:
      "Trojanized in the @ctrl/tinycolor supply-chain campaign (September 2025); revert to prior known-good release and rotate tokens if installed.",
    advisoryUrl: "https://socket.dev/blog/tinycolor-supply-chain-attack-affects-40-packages",
  },
  {
    name: "react-jsonschema-form-extras",
    badRanges: ["1.0.4"],
    lastSafe: "1.0.3",
    notes:
      "Trojanized in the @ctrl/tinycolor supply-chain campaign (September 2025); revert to prior known-good release and rotate tokens if installed.",
    advisoryUrl: "https://socket.dev/blog/tinycolor-supply-chain-attack-affects-40-packages",
  },
  {
    name: "rxnt-authentication",
    badRanges: ["0.0.6"],
    lastSafe: "0.0.5",
    notes:
      "Trojanized in the @ctrl/tinycolor supply-chain campaign (September 2025); revert to prior known-good release and rotate tokens if installed.",
    advisoryUrl: "https://socket.dev/blog/tinycolor-supply-chain-attack-affects-40-packages",
  },
  {
    name: "rxnt-healthchecks-nestjs",
    badRanges: ["1.0.5"],
    lastSafe: "1.0.4",
    notes:
      "Trojanized in the @ctrl/tinycolor supply-chain campaign (September 2025); revert to prior known-good release and rotate tokens if installed.",
    advisoryUrl: "https://socket.dev/blog/tinycolor-supply-chain-attack-affects-40-packages",
  },
  {
    name: "rxnt-kue",
    badRanges: ["1.0.7"],
    lastSafe: "1.0.6",
    notes:
      "Trojanized in the @ctrl/tinycolor supply-chain campaign (September 2025); revert to prior known-good release and rotate tokens if installed.",
    advisoryUrl: "https://socket.dev/blog/tinycolor-supply-chain-attack-affects-40-packages",
  },
  {
    name: "searchjs",
    badRanges: ["0.13.1", "0.13.0"],
    lastSafe: "1.1.2",
    notes:
      "Trojanized in the @ctrl/tinycolor supply-chain campaign (September 2025); revert to prior known-good release and rotate tokens if installed.",
    advisoryUrl: "https://socket.dev/blog/tinycolor-supply-chain-attack-affects-40-packages",
  },
  {
    name: "source-map-resolve",
    badRanges: ["0.6.1", "0.6.0"],
    lastSafe: "0.5.3",
    notes:
      "Trojanized in the @ctrl/tinycolor supply-chain campaign (September 2025); revert to prior known-good release and rotate tokens if installed.",
    advisoryUrl: "https://socket.dev/blog/tinycolor-supply-chain-attack-affects-40-packages",
  },
  {
    name: "string-kit",
    badRanges: ["0.17.6", "0.17.5"],
    lastSafe: "0.19.3",
    notes:
      "Trojanized in the @ctrl/tinycolor supply-chain campaign (September 2025); revert to prior known-good release and rotate tokens if installed.",
    advisoryUrl: "https://socket.dev/blog/tinycolor-supply-chain-attack-affects-40-packages",
  },
  {
    name: "styles",
    badRanges: ["0.7.4", "0.7.3"],
    lastSafe: "0.7.2",
    notes:
      "Trojanized in the @ctrl/tinycolor supply-chain campaign (September 2025); revert to prior known-good release and rotate tokens if installed.",
    advisoryUrl: "https://socket.dev/blog/tinycolor-supply-chain-attack-affects-40-packages",
  },
  {
    name: "swc-plugin-component-annotate",
    badRanges: ["1.9.2"],
    lastSafe: "1.9.0",
    notes:
      "Trojanized in the @ctrl/tinycolor supply-chain campaign (September 2025); revert to prior known-good release and rotate tokens if installed.",
    advisoryUrl: "https://socket.dev/blog/tinycolor-supply-chain-attack-affects-40-packages",
  },
  {
    name: "ts-gaussian",
    badRanges: ["3.0.6"],
    lastSafe: "3.0.4",
    notes:
      "Trojanized in the @ctrl/tinycolor supply-chain campaign (September 2025); revert to prior known-good release and rotate tokens if installed.",
    advisoryUrl: "https://socket.dev/blog/tinycolor-supply-chain-attack-affects-40-packages",
  },
  {
    name: "twin.macro",
    badRanges: ["3.4.0"],
    lastSafe: "3.4.1",
    notes:
      "Trojanized in the @ctrl/tinycolor supply-chain campaign (September 2025); revert to prior known-good release and rotate tokens if installed.",
    advisoryUrl: "https://socket.dev/blog/tinycolor-supply-chain-attack-affects-40-packages",
  },
  {
    name: "utilium",
    badRanges: ["4.0.1", "4.0.0"],
    lastSafe: "2.5.4",
    notes:
      "Trojanized in the @ctrl/tinycolor supply-chain campaign (September 2025); revert to prior known-good release and rotate tokens if installed.",
    advisoryUrl: "https://socket.dev/blog/tinycolor-supply-chain-attack-affects-40-packages",
  },
  {
    name: "@nativescript-community/gesturehandler",
    badRanges: ["2.0.35"],
    lastSafe: "2.0.34",
    notes:
      "Trojanized in the @ctrl/tinycolor supply-chain campaign (September 2025); revert to prior known-good release and rotate tokens if installed.",
    advisoryUrl: "https://socket.dev/blog/tinycolor-supply-chain-attack-affects-40-packages",
  },
  {
    name: "@nativescript-community/sentry",
    badRanges: ["4.6.43"],
    lastSafe: "4.6.42",
    notes:
      "Trojanized in the @ctrl/tinycolor supply-chain campaign (September 2025); revert to prior known-good release and rotate tokens if installed.",
    advisoryUrl: "https://socket.dev/blog/tinycolor-supply-chain-attack-affects-40-packages",
  },
  {
    name: "@nativescript-community/text",
    badRanges: ["1.6.13"],
    lastSafe: "1.6.8",
    notes:
      "Trojanized in the @ctrl/tinycolor supply-chain campaign (September 2025); revert to prior known-good release and rotate tokens if installed.",
    advisoryUrl: "https://socket.dev/blog/tinycolor-supply-chain-attack-affects-40-packages",
  },
  {
    name: "@nativescript-community/ui-collectionview",
    badRanges: ["6.0.6"],
    lastSafe: "6.0.5",
    notes:
      "Trojanized in the @ctrl/tinycolor supply-chain campaign (September 2025); revert to prior known-good release and rotate tokens if installed.",
    advisoryUrl: "https://socket.dev/blog/tinycolor-supply-chain-attack-affects-40-packages",
  },
  {
    name: "@nativescript-community/ui-drawer",
    badRanges: ["0.1.30"],
    lastSafe: "0.1.29",
    notes:
      "Trojanized in the @ctrl/tinycolor supply-chain campaign (September 2025); revert to prior known-good release and rotate tokens if installed.",
    advisoryUrl: "https://socket.dev/blog/tinycolor-supply-chain-attack-affects-40-packages",
  },
  {
    name: "@nativescript-community/ui-image",
    badRanges: ["4.5.6"],
    lastSafe: "4.5.5",
    notes:
      "Trojanized in the @ctrl/tinycolor supply-chain campaign (September 2025); revert to prior known-good release and rotate tokens if installed.",
    advisoryUrl: "https://socket.dev/blog/tinycolor-supply-chain-attack-affects-40-packages",
  },
  {
    name: "@nativescript-community/ui-material-bottomsheet",
    badRanges: ["7.2.72"],
    lastSafe: "7.2.71",
    notes:
      "Trojanized in the @ctrl/tinycolor supply-chain campaign (September 2025); revert to prior known-good release and rotate tokens if installed.",
    advisoryUrl: "https://socket.dev/blog/tinycolor-supply-chain-attack-affects-40-packages",
  },
  {
    name: "@nativescript-community/ui-material-core",
    badRanges: ["7.2.76"],
    lastSafe: "7.2.71",
    notes:
      "Trojanized in the @ctrl/tinycolor supply-chain campaign (September 2025); revert to prior known-good release and rotate tokens if installed.",
    advisoryUrl: "https://socket.dev/blog/tinycolor-supply-chain-attack-affects-40-packages",
  },
  {
    name: "@nativescript-community/ui-material-core-tabs",
    badRanges: ["7.2.76"],
    lastSafe: "7.2.71",
    notes:
      "Trojanized in the @ctrl/tinycolor supply-chain campaign (September 2025); revert to prior known-good release and rotate tokens if installed.",
    advisoryUrl: "https://socket.dev/blog/tinycolor-supply-chain-attack-affects-40-packages",
  },
  {
    name: "@pmmmwh/react-refresh-webpack-plugin",
    badRanges: ["0.5.12", "0.5.11"],
    lastSafe: "0.6.1",
    notes:
      "Trojanized in the @ctrl/tinycolor supply-chain campaign (September 2025); revert to prior known-good release and rotate tokens if installed.",
    advisoryUrl: "https://socket.dev/blog/tinycolor-supply-chain-attack-affects-40-packages",
  },
];

export default threats;
