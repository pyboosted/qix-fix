import { type ExecFileException, execFile } from "node:child_process";

export async function run(
  cmd: string,
  args: string[] = [],
  timeoutMs = 180000,
): Promise<{ code: number; stdout: string; stderr: string }> {
  return new Promise((resolve) => {
    const child = execFile(
      cmd,
      args,
      { encoding: "utf8", timeout: timeoutMs, maxBuffer: 10 * 1024 * 1024 },
      (err: ExecFileException | null, stdout: string, stderr: string) => {
        const code = err ? (typeof err.code === "number" ? (err.code as number) : 1) : 0;
        resolve({ code, stdout: stdout ?? "", stderr: stderr ?? "" });
      },
    );
    child.on("error", () => {
      resolve({ code: 127, stdout: "", stderr: "spawn error" });
    });
  });
}
