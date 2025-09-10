#!/usr/bin/env node
import { detectors } from "./data/detectors";
import { threats } from "./data/threats";
import { scanLockfiles } from "./lock/aggregator";
import { classify } from "./lock/classify";
import { compileDetectors } from "./scan/compile";
import { scanWithRipgrep } from "./scan/detectorRg";
import { rgListInstalledPackages } from "./scan/packagesRg";
import type { Finding } from "./types";
import { color, labelBySeverity } from "./utils/color";
import { applyPinsToPackageJson, getPinnedVersion, readPackageJson } from "./utils/pkgjson";
import { compare, satisfies } from "./utils/semver";
import { TUI } from "./utils/tui";

function isQixFixPath(filePath: string): boolean {
  // Check if path belongs to qix-fix (handles both Unix and Windows paths)
  return (
    filePath.includes("/qix-fix/dist/") ||
    filePath.includes("/qix-fix/src/") ||
    filePath.includes("\\qix-fix\\dist\\") ||
    filePath.includes("\\qix-fix\\src\\") ||
    filePath.includes("/qix-fix\\dist\\") || // Mixed separators
    filePath.includes("\\qix-fix/src/") ||
    filePath.includes("\\qix-fix/dist/") ||
    filePath.includes("/qix-fix\\src\\")
  );
}

function printIntro() {
  console.log(color.bold(color.cyan("qix-fix")));
}

function printDatabases() {
  console.log(`Built-in threats: ${threats.length}`);
  console.log(`Built-in detectors: ${detectors.length}`);
  console.log("\nNext: implement 'lock', 'scan', 'sysscan' subcommands.");
}

function main() {
  printIntro();
  const [, , subcmd] = process.argv;
  switch (subcmd) {
    case undefined:
    case "--help":
    case "-h":
      console.log("Usage: qix-fix <lock|scan|sys> [options]\n");
      console.log("Options:");
      console.log("  --text     Use simple text output instead of TUI progress display");
      console.log("  --update   Auto-apply pins to package.json (lock command only)");
      console.log("  --id <id>  Filter detectors by comma-separated IDs");
      printDatabases();
      break;
    case "lock":
      (async () => {
        const cwd = process.cwd();
        const args = process.argv.slice(3);
        const chainsLimit = parseChainsArg(args);
        const doUpdate = args.includes("--update");
        const { paths, aggregate, edgesAll } = await scanLockfiles(cwd);
        if (paths.length === 0) {
          console.warn("No lockfiles found (package-lock.json, yarn.lock, bun.lock, bun.lockb)");
        } else {
          console.log(`Lockfiles: ${paths.join(", ")}`);
        }
        const distinctCount = aggregate.size;
        const pkg = await readPackageJson(cwd);

        // Build threat index
        const threatIndex = new Map<string, (typeof threats)[number]>();
        for (const t of threats) threatIndex.set(t.name, t);

        const threatened = Array.from(aggregate.keys()).filter((n) => threatIndex.has(n));
        console.log(
          `\nSummary: distinct packages ${distinctCount}; threatened present ${threatened.length}`,
        );

        if (threatened.length === 0) {
          console.log(color.green("\n✓ No known threats found in your lockfile!"));
          console.log(
            color.dim(
              "Hint: run `qix-fix lock --update` to auto-pin any future threats when they're discovered.",
            ),
          );
          return;
        }

        // Show only threatened packages with colored versions
        threatened.sort((a, b) => a.localeCompare(b));
        const rev = buildReverseIndex(edgesAll);
        for (const name of threatened) {
          const t = threatIndex.get(name)!;
          const versions = Array.from(aggregate.get(name)!).sort((a, b) => compare(a, b));
          const pinnedTo = getPinnedVersion(pkg, name);

          // Build occurrence details from edges: version -> parents
          const details = new Map<string, Set<string>>();
          for (const v of versions) details.set(v, new Set<string>());
          for (const e of edgesAll) {
            if (e.childName !== name) continue;
            if (e.childVersion && details.has(e.childVersion)) {
              details.get(e.childVersion)!.add(`${e.parentName}@${e.parentVersion}`);
            } else if (!e.childVersion) {
              // version unknown (e.g., yarn ranges) — attribute to all versions present
              for (const v of versions) details.get(v)!.add(`${e.parentName}@${e.parentVersion}`);
            }
          }

          const hasMulti = versions.length > 1;
          const nameStyled = hasMulti ? color.yellow(color.bold(name)) : color.bold(name);
          const head = pinnedTo
            ? `${nameStyled} ${color.green(`(pinned to ${pinnedTo})`)}`
            : nameStyled;
          const multiTag = hasMulti ? ` ${color.yellow("(multiple versions)")}` : "";
          console.log(`${head}${multiTag}:`);
          for (const v of versions) {
            const badRanges =
              t.badRanges?.filter((r) => {
                try {
                  return satisfies(v, r);
                } catch {
                  return false;
                }
              }) ?? [];
            const bad = badRanges.length > 0;
            const vColor = pinnedTo ? color.green : bad ? color.red : color.yellow;
            const parents = details.get(v) ?? new Set<string>();
            const byList = (parents.size ? Array.from(parents) : ["unknown"])
              .map((s) => color.dim(s))
              .join(", ");

            let versionLine = `- ${vColor(v)} by ${byList}`;
            if (bad && badRanges.length > 0) {
              const rangeList = badRanges.map((r) => color.red(r)).join(", ");
              versionLine += ` ${color.red("(matches:")} ${rangeList}${color.red(")")}`;
            }
            console.log(versionLine);

            // Optional chains
            if (chainsLimit > 0 && parents.size) {
              const targetKey = `${name}@${v}`;
              const chains = findChainsToRoot(targetKey, rev, chainsLimit, 6);
              for (const chain of chains) {
                console.log(`  ${color.gray("via:")} ${formatChain(chain)}`);
              }
            }
          }
        }

        // Instructions: pin with overrides using max safe versions already present
        const recommended: Record<string, string> = {};
        const noSafe: string[] = [];
        for (const name of threatened) {
          const t = threatIndex.get(name)!;
          const pinnedTo = getPinnedVersion(pkg, name);
          if (pinnedTo) continue; // already pinned
          const versions = Array.from(aggregate.get(name) || []);
          const safe = versions.filter(
            (v) =>
              !t.badRanges?.some((r) => {
                try {
                  return satisfies(v, r);
                } catch {
                  return false;
                }
              }),
          );
          if (safe.length === 0) {
            noSafe.push(name);
            continue;
          }
          safe.sort((a, b) => compare(a, b));
          recommended[name] = safe[safe.length - 1];
        }
        const recKeys = Object.keys(recommended);
        if (recKeys.length) {
          // Show which packages have multiple versions (warning)
          const multiVersionPackages = recKeys.filter((name) => {
            const versions = Array.from(aggregate.get(name) || []);
            return versions.length > 1;
          });

          if (multiVersionPackages.length > 0) {
            console.log(
              `\n${color.yellow("⚠ Warning:")} The following packages have multiple versions in lockfile:`,
            );
            console.log(color.yellow(`   ${multiVersionPackages.join(", ")}`));
            console.log(color.yellow("   Pinning may cause build issues. Test thoroughly."));
          }

          console.log("\nPin these with overrides (using max safe versions found):\n");
          console.log(JSON.stringify({ overrides: recommended }, null, 2));
          console.log("\nIf you use Yarn, also add to resolutions:\n");
          console.log(JSON.stringify({ resolutions: recommended }, null, 2));
          if (doUpdate) {
            try {
              const res = await applyPinsToPackageJson(cwd, recommended, {
                alsoResolutions: true,
                backup: true,
              });
              console.log(
                `\nUpdated ${res.path} with overrides${color.gray(` (backup: ${res.backupPath ?? "-"})`)}`,
              );
              console.log(`Pinned: ${res.updated.join(", ") || "(nothing)"}`);
              console.log("\nRun install: npm install | yarn install | bun install");
            } catch (e) {
              console.error("Failed to update package.json:", (e as Error).message);
            }
          } else {
            console.log("\nThen reinstall (one of): npm install | yarn install | bun install");
            console.log(color.dim("\nHint: run `qix-fix lock --update` to auto-apply these pins"));
          }
        } else if (threatened.length > 0) {
          console.log(
            color.dim(
              "\nHint: run `qix-fix lock --update` to auto-add overrides/resolutions with max safe versions present.",
            ),
          );
        }
        if (noSafe.length) {
          console.warn(
            "\nNo safe version present in your lock for: " +
              noSafe.join(", ") +
              ". Consider upgrading dependencies that bring them in.",
          );
        }
      })();
      break;
    case "scan":
      (async () => {
        const cwd = process.cwd();
        const args = process.argv.slice(3);
        const { includeIds, rest } = parseDetectorFilter(args);
        const useTextMode = args.includes("--text");
        const extraDirs = rest.filter((a) => !a.startsWith("-") && a !== "--text");
        const defaultDirs = ["dist", "build", "out", "public", "lib"].map((d) =>
          require("node:path").join(cwd, d),
        );

        // Collect installed packages from node_modules via ripgrep (fast)
        const installed = await rgListInstalledPackages(cwd);
        const installedMap = new Map<string, Set<string>>();
        for (const it of installed) {
          const set = installedMap.get(it.name) || new Set<string>();
          set.add(it.version);
          installedMap.set(it.name, set);
        }
        const reports = classify(installedMap, threats);
        console.log(`Installed packages scanned: ${installed.length}`);
        const compromised = reports.filter((r) => r.compromised);
        if (compromised.length) {
          console.log(`Compromised detected (${compromised.length}):`);
          for (const r of compromised) {
            console.log(`- ${r.name} [${r.versions.join(", ")}]`);
          }
        } else {
          console.log("No compromised versions found in node_modules (based on local DB).");
        }

        // Detector scanning with ripgrep
        let compiled = compileDetectors(detectors);
        if (includeIds?.size) {
          compiled = compiled.filter((d) => includeIds.has(d.id));
          if (compiled.length === 0) {
            console.error(
              `No detectors matched --id filter. Available ids: ${detectors.map((d) => d.id).join(", ")}`,
            );
            return;
          }
        }
        const rootsAll = [
          require("node:path").join(cwd, "node_modules"),
          ...defaultDirs,
          ...extraDirs,
        ];
        const rootsDist = [...defaultDirs, ...extraDirs];
        const detDist = compiled.filter((d) => d.onlyInDist);
        const detOther = compiled.filter((d) => !d.onlyInDist);

        if (useTextMode) {
          // Simple text mode - just print findings as they're found
          const ignorePkgs = new Set(["qix-fix"]);
          const onMatch = (f: Finding) => {
            if (f.package && ignorePkgs.has(f.package)) return; // ignore our own package
            if (isQixFixPath(f.file)) return; // also ignore by file path
            const sevKey = normalizeSeverity(f.severity);
            const sev = labelBySeverity(sevKey, sevKey.toUpperCase());
            const where = `${color.cyan(f.file)}:${color.yellow(String(f.line))}`;
            const hintPart = f.hint ? ` ${color.gray(`(${f.hint})`)}` : "";
            const pkgPart = f.package ? ` ${color.blue(f.package)}` : "";
            console.log(`${sev} ${color.bold(f.detectorId)}${hintPart}${pkgPart}`);
            console.log(`  ${where}`);
            if (f.snippet) {
              console.log(`  ${color.dim(f.snippet.slice(0, 100))}`);
            }
            console.log(); // blank line
          };

          await scanWithRipgrep(rootsAll, detOther, { onMatch });
          if (detDist.length) {
            await scanWithRipgrep(rootsDist, detDist, { onMatch });
          }
        } else {
          // Full TUI mode with progress
          const sumRegex = (arr: typeof compiled) => arr.reduce((s, d) => s + d.regexes.length, 0);
          const total = sumRegex(detOther) * rootsAll.length + sumRegex(detDist) * rootsDist.length;
          let done = 0;
          const tui = new TUI();
          const countsBySeverity: Record<string, number> = { low: 0, med: 0, high: 0, critical: 0 };
          const render = (now?: string) => {
            const counters = formatCounters(countsBySeverity);
            const pct = total ? Math.floor((done / total) * 100) : 100;
            const nowLine = formatNowLine(now);
            // Try multiple methods to get terminal width
            let cols = process.stdout.columns;
            if (!cols) {
              const envCols = process.env.COLUMNS;
              if (envCols) {
                const parsed = parseInt(envCols, 10);
                if (!Number.isNaN(parsed) && parsed > 0) cols = parsed;
              }
            }
            if (!cols) {
              try {
                const { execSync } = require("child_process");
                const result = execSync("tput cols", { encoding: "utf8", timeout: 1000 });
                const parsed = parseInt(result.trim(), 10);
                if (!Number.isNaN(parsed) && parsed > 0) cols = parsed;
              } catch {
                // tput failed, ignore
              }
            }
            if (!cols) cols = 50; // Safe default
            const delim = color.gray("\u2500".repeat(Math.max(20, Math.min(cols, 120))));
            const footer = [
              delim,
              counters,
              nowLine,
              `${color.bold("Overall:")} ${color.green(String(done))}/${color.green(String(total))} (${color.green(String(pct))}%)`,
            ];
            tui.setFooter(footer);
          };
          render();
          let currentNow = "";
          const onStep = (info: {
            detectorId: string;
            root: string;
            index: number;
            total: number;
          }) => {
            done += 1;
            currentNow = `Scanning ${info.detectorId} • ${info.root} ${info.index}/${info.total}`;
            render(currentNow);
          };
          const ignorePkgs = new Set(["qix-fix"]);
          const onMatch = (f: Finding) => {
            if (f.package && ignorePkgs.has(f.package)) return; // ignore our own package
            if (isQixFixPath(f.file)) return; // also ignore by file path
            const sevKey = normalizeSeverity(f.severity);
            countsBySeverity[sevKey] = (countsBySeverity[sevKey] ?? 0) + 1;
            const sev = labelBySeverity(sevKey, sevKey.toUpperCase());
            const where = `${color.cyan(f.file)}:${color.yellow(String(f.line))}`;
            const hintPart = f.hint ? ` ${color.gray(`(${f.hint})`)}` : "";
            const pkgPart = f.package ? ` ${color.blue(f.package)}` : "";
            // Two-line append, then redraw footer
            tui.append([`${sev} ${color.bold(f.detectorId)}${hintPart}${pkgPart}`, where]);
            render(currentNow);
          };

          const resOther = await scanWithRipgrep(rootsAll, detOther, { onStep, onMatch });
          const resDist = detDist.length
            ? await scanWithRipgrep(rootsDist, detDist, { onStep, onMatch })
            : {
                findings: [],
                summary: { detectors: 0, roots: 0, regexes: 0, matches: 0 },
                perRoot: [],
              };
          // Final footer: Done
          currentNow = "Done";
          render(currentNow);
          // delimiter between stream and report
          {
            // Try multiple methods to get terminal width
            let cols = process.stdout.columns;
            if (!cols) {
              const envCols = process.env.COLUMNS;
              if (envCols) {
                const parsed = parseInt(envCols, 10);
                if (!Number.isNaN(parsed) && parsed > 0) cols = parsed;
              }
            }
            if (!cols) {
              try {
                const { execSync } = require("child_process");
                const result = execSync("tput cols", { encoding: "utf8", timeout: 1000 });
                const parsed = parseInt(result.trim(), 10);
                if (!Number.isNaN(parsed) && parsed > 0) cols = parsed;
              } catch {
                // tput failed, ignore
              }
            }
            if (!cols) cols = 50; // Safe default
            const delim = color.gray("\u2500".repeat(Math.max(20, Math.min(cols, 120))));
            tui.append(delim);
          }
          const rootLines = [...resOther.perRoot, ...resDist.perRoot]
            .sort((a, b) => a.root.localeCompare(b.root))
            .map((r) => `${symbolForCount(r.matches)} ${r.root}: ${r.matches} matches`);
          if (rootLines.length) tui.append(rootLines);
          render(currentNow);
        }
      })();
      break;
    case "sys":
      (async () => {
        const args = process.argv.slice(3);
        const { includeIds } = parseDetectorFilter(args);
        const useTextMode = args.includes("--text");
        let compiled = compileDetectors(detectors);
        if (includeIds?.size) {
          compiled = compiled.filter((d) => includeIds.has(d.id));
          if (compiled.length === 0) {
            console.error(
              `No detectors matched --id filter. Available ids: ${detectors.map((d) => d.id).join(", ")}`,
            );
            return;
          }
        }
        // Resolve cache roots early for progress math
        const { getNpmCacheDir, getYarnCacheDir, getBunCacheDir } = await import("./sys/paths");
        const roots: string[] = [];
        const rNpm = await getNpmCacheDir();
        if (rNpm) roots.push(rNpm);
        const rYarn = await getYarnCacheDir();
        if (rYarn) roots.push(rYarn);
        const rBun = getBunCacheDir();
        if (rBun) roots.push(rBun);

        if (useTextMode) {
          // Simple text mode - just print findings as they're found
          const ignorePkgs = new Set(["qix-fix"]);
          const onMatch = (f: Finding) => {
            if (f.package && ignorePkgs.has(f.package)) return; // ignore our own package
            if (isQixFixPath(f.file)) return; // also ignore by file path
            const sevKey = normalizeSeverity(f.severity);
            const sev = labelBySeverity(sevKey, sevKey.toUpperCase());
            const where = `${color.cyan(f.file)}:${color.yellow(String(f.line))}`;
            const hintPart = f.hint ? ` ${color.gray(`(${f.hint})`)}` : "";
            const pkgPart = f.package ? ` ${color.blue(f.package)}` : "";
            console.log(`${sev} ${color.bold(f.detectorId)}${hintPart}${pkgPart}`);
            console.log(`  ${where}`);
            if (f.snippet) {
              console.log(`  ${color.dim(f.snippet.slice(0, 100))}`);
            }
            console.log(); // blank line
          };

          await scanWithRipgrep(roots, compiled, { onMatch });
          return;
        }

        const total = compiled.reduce((s, d) => s + d.regexes.length, 0) * roots.length;
        let done = 0;
        const tui = new TUI();
        const countsBySeverity: Record<string, number> = { low: 0, med: 0, high: 0, critical: 0 };
        const render = (now?: string) => {
          const counters = formatCounters(countsBySeverity);
          const pct = total ? Math.floor((done / total) * 100) : 100;
          const nowLine = formatNowLine(now);
          // Try multiple methods to get terminal width
          let cols = process.stdout.columns;
          if (!cols) {
            const envCols = process.env.COLUMNS;
            if (envCols) {
              const parsed = parseInt(envCols, 10);
              if (!Number.isNaN(parsed) && parsed > 0) cols = parsed;
            }
          }
          if (!cols) {
            try {
              const { execSync } = require("child_process");
              const result = execSync("tput cols", { encoding: "utf8", timeout: 1000 });
              const parsed = parseInt(result.trim(), 10);
              if (!Number.isNaN(parsed) && parsed > 0) cols = parsed;
            } catch {
              // tput failed, ignore
            }
          }
          if (!cols) cols = 50; // Safe default
          const delim = color.gray("\u2500".repeat(Math.max(20, Math.min(cols, 120))));
          const footer = [
            delim,
            counters,
            nowLine,
            `${color.bold("Overall:")} ${color.green(String(done))}/${color.green(String(total))} (${color.green(String(pct))}%)`,
          ];
          tui.setFooter(footer);
        };
        render();
        let currentNow2 = "";
        const onStep = (info: {
          detectorId: string;
          root: string;
          index: number;
          total: number;
        }) => {
          done += 1;
          currentNow2 = `Scanning ${info.detectorId} • ${info.root} ${info.index}/${info.total}`;
          render(currentNow2);
        };
        const ignorePkgs2 = new Set(["qix-fix"]);
        const onMatch = (f: Finding) => {
          if (f.package && ignorePkgs2.has(f.package)) return;
          if (isQixFixPath(f.file)) return; // also ignore by file path
          const sevKey = normalizeSeverity(f.severity);
          countsBySeverity[sevKey] = (countsBySeverity[sevKey] ?? 0) + 1;
          const sev = labelBySeverity(sevKey, sevKey.toUpperCase());
          const where = `${color.cyan(f.file)}:${color.yellow(String(f.line))}`;
          const hintPart = f.hint ? ` ${color.gray(`(${f.hint})`)}` : "";
          const pkgPart = f.package ? ` ${color.blue(f.package)}` : "";
          tui.append([`${sev} ${color.bold(f.detectorId)}${hintPart}${pkgPart}`, where]);
          render(currentNow2);
        };

        const { perRoot } = await scanWithRipgrep(roots, compiled, {
          onStep,
          onMatch,
        });
        // Final footer: Done
        currentNow2 = "Done";
        render(currentNow2);
        // delimiter between stream and report
        {
          // Try multiple methods to get terminal width
          let cols = process.stdout.columns;
          if (!cols) {
            const envCols = process.env.COLUMNS;
            if (envCols) {
              const parsed = parseInt(envCols, 10);
              if (!Number.isNaN(parsed) && parsed > 0) cols = parsed;
            }
          }
          if (!cols) {
            try {
              const { execSync } = require("child_process");
              const result = execSync("tput cols", { encoding: "utf8", timeout: 1000 });
              const parsed = parseInt(result.trim(), 10);
              if (!Number.isNaN(parsed) && parsed > 0) cols = parsed;
            } catch {
              // tput failed, ignore
            }
          }
          if (!cols) cols = 50; // Safe default
          const delim = color.gray("\u2500".repeat(Math.max(20, Math.min(cols, 120))));
          tui.append(delim);
        }
        const lines = perRoot
          .sort((a, b) => a.root.localeCompare(b.root))
          .map((r) => `${symbolForCount(r.matches)} ${r.root}: ${r.matches} matches`);
        if (lines.length) tui.append(lines);
        render(currentNow2);
      })();
      break;
    default:
      console.log(`Subcommand '${subcmd}' not yet implemented.`);
      printDatabases();
  }
}
function normalizeSeverity(s: string): "low" | "med" | "high" | "critical" {
  const t = (s || "").toLowerCase();
  if (t === "critical" || t === "crit") return "critical";
  if (t === "high") return "high";
  if (t === "medium" || t === "moderate" || t === "med" || t === "warn") return "med";
  // default bucket to low (includes info/notice)
  return "low";
}

function formatCounters(counts: Record<string, number>): string {
  const crit = `${color.magenta("critical")} ${color.bold(color.magenta(String(counts.critical ?? 0)))}`;
  const high = `${color.red("high")} ${color.bold(color.red(String(counts.high ?? 0)))}`;
  const med = `${color.yellow("med")} ${color.bold(color.yellow(String(counts.med ?? 0)))}`;
  const low = `${color.gray("low")} ${color.bold(color.gray(String(counts.low ?? 0)))}`;
  return `${color.bold("Findings:")} ${crit} ${color.gray("|")} ${high} ${color.gray("|")} ${med} ${color.gray("|")} ${low}`;
}

function formatNowLine(now?: string): string {
  const label = color.cyan("Now:");
  if (!now) return "";
  const m = now.match(/^(.*\s)(\d+\/\d+)\s*$/);
  if (m) {
    return `${label} ${m[1]}${color.green(m[2])}`;
  }
  return `${label} ${now}`;
}

function symbolForCount(n: number): string {
  return n > 0 ? color.yellow("!") : color.green("✓");
}

function parseDetectorFilter(args: string[]): { includeIds: Set<string> | null; rest: string[] } {
  const includeIds = new Set<string>();
  const rest: string[] = [];
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--id" || a === "--only" || a === "-i") {
      const val = args[i + 1];
      if (val && !val.startsWith("-")) {
        for (const id of val.split(",")) includeIds.add(id.trim());
        i++;
      }
    } else {
      rest.push(a);
    }
  }
  return { includeIds: includeIds.size ? includeIds : null, rest };
}

main();

// Helpers for lock parent inference
function _inferParent(
  items: { name: string; version: string; source: string; pathHint?: string }[],
  it: { name: string; version: string; source: string; pathHint?: string },
): string | null {
  if (it.pathHint) {
    // npm v2: node_modules/a/node_modules/b
    const m = it.pathHint.match(/node_modules\/(.+)\/node_modules\/[^/]+$/);
    if (m) {
      const parentPath = m[1];
      const parentName = parentPath.split("/").pop()!;
      const parentEntry = items.find((x) => x.pathHint === `node_modules/${parentPath}`);
      if (parentEntry) return `${parentName}@${parentEntry.version}`;
      return parentName;
    }
    // npm v1 chain: a>b>c
    if (it.pathHint.includes(">")) {
      const parts = it.pathHint.split(">");
      parts.pop();
      const parentPath = parts.join(">");
      const parentName = parts[parts.length - 1];
      const parentEntry = items.find((x) => x.pathHint === parentPath);
      if (parentEntry) return `${parentName}@${parentEntry.version}`;
      return parentName ?? null;
    }
  }
  return null;
}

function _shortFile(p: string): string {
  // show just filename for lockfile fallback
  const idx = p.lastIndexOf("/");
  return idx >= 0 ? p.slice(idx + 1) : p;
}

// Chains helpers
function parseChainsArg(args: string[]): number {
  let limit = 0;
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--chains") {
      const n = Number(args[i + 1]);
      if (Number.isFinite(n)) limit = Math.max(1, Math.floor(n));
    } else if (a.startsWith("--chains=")) {
      const n = Number(a.split("=", 2)[1]);
      if (Number.isFinite(n)) limit = Math.max(1, Math.floor(n));
      else limit = 1;
    }
  }
  return limit;
}

function buildReverseIndex(
  edges: { parentName: string; parentVersion: string; childName: string; childVersion: string }[],
) {
  const rev = new Map<string, Set<string>>();
  for (const e of edges) {
    if (!e.childVersion) continue; // skip unknown child versions
    const childKey = `${e.childName}@${e.childVersion}`;
    const parentKey = `${e.parentName}@${e.parentVersion}`;
    const set = rev.get(childKey) || new Set<string>();
    set.add(parentKey);
    rev.set(childKey, set);
  }
  return rev;
}

function findChainsToRoot(
  targetKey: string,
  rev: Map<string, Set<string>>,
  maxChains: number,
  maxDepth: number,
): string[][] {
  const results: string[][] = [];
  const seenPath = new Set<string>();
  const dfs = (node: string, path: string[], depth: number) => {
    if (results.length >= maxChains) return;
    if (depth > maxDepth) return;
    const parents = rev.get(node);
    if (!parents || parents.size === 0) {
      results.push([...path]);
      return;
    }
    for (const p of parents) {
      const key = `${node}|${p}`;
      if (seenPath.has(key)) continue;
      seenPath.add(key);
      dfs(p, [p, ...path], depth + 1);
      if (results.length >= maxChains) return;
    }
  };
  dfs(targetKey, [targetKey], 0);
  return results;
}

function formatChain(chain: string[]): string {
  // chain is [root..., target]; render root > ... > target
  const pretty = chain.map(fmtNode).join(` ${color.gray("»")} `);
  return pretty;
}

function fmtNode(key: string): string {
  const at = key.lastIndexOf("@");
  if (at > 0) {
    const name = key.slice(0, at);
    const ver = key.slice(at + 1);
    return `${color.cyan(name)}@${color.yellow(ver)}`;
  }
  return key;
}
