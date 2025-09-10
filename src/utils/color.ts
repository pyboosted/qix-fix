const RESET = "\x1b[0m";
const codes = {
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  gray: "\x1b[90m",
};

function enabled(): boolean {
  if (process.env.NO_COLOR === "1" || process.env.NO_COLOR === "true") return false;
  // Prefer stderr for progress; enable if either is a TTY
  return Boolean(process.stderr.isTTY || process.stdout.isTTY);
}

function wrap(code: string) {
  return (s: string) => (enabled() ? code + s + RESET : s);
}

export const color = {
  bold: wrap(codes.bold),
  dim: wrap(codes.dim),
  red: wrap(codes.red),
  green: wrap(codes.green),
  yellow: wrap(codes.yellow),
  blue: wrap(codes.blue),
  magenta: wrap(codes.magenta),
  cyan: wrap(codes.cyan),
  gray: wrap(codes.gray),
};

export function labelBySeverity(sev: "low" | "med" | "high" | "critical", text: string): string {
  switch (sev) {
    case "low":
      return color.gray(text);
    case "med":
      return color.yellow(text);
    case "high":
      return color.red(text);
    case "critical":
      return color.magenta(text);
  }
}

export const symbols = {
  tick: () => color.green("✓"),
  cross: () => color.red("✗"),
  bullet: () => color.cyan("•"),
};
