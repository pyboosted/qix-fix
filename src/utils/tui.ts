export type StatusInfo = {
  overall?: { done: number; total: number };
  now?: string;
  lines?: string[]; // full footer lines to render (no truncation guaranteed)
};

export class TUI {
  private enabled: boolean;
  private q: Promise<void> = Promise.resolve();
  private footerLines: string[] = [];
  private footerHeight = 0;
  private get cols() {
    // Try multiple methods to get terminal width
    if (process.stdout.columns) return process.stdout.columns;

    // Try environment variables
    const envCols = process.env.COLUMNS;
    if (envCols) {
      const parsed = parseInt(envCols, 10);
      if (!Number.isNaN(parsed) && parsed > 0) return parsed;
    }

    // Try tput if available
    try {
      const { execSync } = require("child_process");
      const result = execSync("tput cols", { encoding: "utf8", timeout: 1000 });
      const parsed = parseInt(result.trim(), 10);
      if (!Number.isNaN(parsed) && parsed > 0) return parsed;
    } catch {
      // tput failed, ignore
    }

    // Fall back to safe default
    return 50; // Safe default to avoid wrapping in most terminals
  }

  constructor() {
    this.enabled = Boolean(process.stdout.isTTY) && process.env.NO_TUI !== "1";
  }

  // Append one or more lines above the footer, then redraw the footer.
  append(lines: string | string[]) {
    const items = Array.isArray(lines) ? lines : [lines];
    if (items.length === 0) return;
    this.enqueue(() => {
      if (!this.enabled || this.footerHeight === 0) {
        process.stdout.write(`${items.join("\n")}\n`);
        return;
      }
      let s = "\x1b[?25l"; // hide cursor
      // Move to top of footer and carriage return
      s += `\x1b[${this.footerHeight}A\r`;
      // Write the lines (clear line first, fit to width)
      for (const line of items) {
        const fitted = this.fit(line);
        s += `\r\x1b[2K${fitted}\n`;
      }
      // Redraw footer (clear then write)
      s += this.composeClearFooter();
      s += this.composeWriteFooter();
      s += "\x1b[?25h"; // show cursor
      process.stdout.write(s);
    });
  }

  // Replace footer with provided lines
  setFooter(lines: string[]) {
    const safe = lines.slice();
    this.enqueue(() => {
      const oldHeight = this.footerHeight;
      // Calculate new height based on non-empty lines only
      const newHeight = this.enabled
        ? safe.filter((line) => this.stripAnsi(line).trim().length > 0).length
        : safe.length;
      this.footerLines = safe;
      if (!this.enabled) {
        this.footerHeight = newHeight;
        return;
      }
      let s = "\x1b[?25l";
      // Move to top of old footer using old height
      if (oldHeight > 0) s += `\x1b[${oldHeight}A\r`;
      // Clear old footer and write new one
      s += this.composeClearFooter(oldHeight);
      s += this.composeWriteFooter();
      s += "\x1b[?25h";
      // Update height after drawing
      this.footerHeight = newHeight;
      process.stdout.write(s);
    });
  }

  finalize() {
    this.enqueue(() => {
      if (!this.enabled) return;
      process.stdout.write("\n");
    });
  }

  // Compose sequences to clear exactly footerHeight lines starting here
  private composeClearFooter(height: number = this.footerHeight): string {
    let s = "";
    if (height <= 0) return s;
    for (let i = 0; i < height; i++) {
      s += "\r\x1b[2K"; // clear line
      if (i < height - 1) s += "\n"; // go to next line
    }
    // Move back to top of footer
    if (height > 1) s += `\x1b[${height - 1}A`;
    return s;
  }

  private composeWriteFooter(): string {
    if (this.footerLines.length === 0) return "";
    let out = "";
    for (const line of this.footerLines) {
      // Skip lines that are empty or contain only whitespace/ANSI codes
      const stripped = this.stripAnsi(line).trim();
      if (stripped.length === 0) continue;
      out += `\r\x1b[2K${this.fit(line)}\n`;
    }
    return out;
  }

  private enqueue(fn: () => void | Promise<void>) {
    this.q = this.q.then(async () => {
      try {
        await fn();
      } catch {
        // ignore
      }
    });
  }

  private fit(input: string): string {
    const cols = this.cols;
    const plain = this.stripAnsi(input);
    const width = plain.length;
    if (width === cols) return input;
    if (width < cols) {
      // Don't pad lines that are mostly delimiter characters
      const isDelimiterLine = plain.match(/^[\u2500\-=_]{10,}$/);
      if (isDelimiterLine) return input;
      return input + " ".repeat(cols - width);
    }
    // truncate without ANSI awareness (simple, safe)
    // If you need perfect ANSI-safe truncation, we can upgrade this.
    const delta = width - cols;
    return input.slice(0, input.length - delta);
  }

  private stripAnsi(s: string): string {
    // Simple ANSI CSI pattern; good enough for our use
    // Use string concatenation to avoid direct control character
    const escapeChar = String.fromCharCode(27); // ESC character
    const ansiRegex = new RegExp(`${escapeChar}\\[[0-9;?]*[ -/]*[@-~]`, "g");
    return s.replace(ansiRegex, "");
  }
}
