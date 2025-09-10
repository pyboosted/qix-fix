export function stripJsonComments(input: string): string {
  // Remove // and /* */ comments conservatively (not inside strings)
  let out = "";
  let inStr: false | '"' | "'" = false;
  let inBlock = false;
  let inLine = false;
  for (let i = 0; i < input.length; i++) {
    const c = input[i];
    const next = input[i + 1];
    if (inLine) {
      if (c === "\n") {
        inLine = false;
        out += c;
      }
      continue;
    }
    if (inBlock) {
      if (c === "*" && next === "/") {
        inBlock = false;
        i++;
      }
      continue;
    }
    if (!inStr && c === "/" && next === "/") {
      inLine = true;
      i++;
      continue;
    }
    if (!inStr && c === "/" && next === "*") {
      inBlock = true;
      i++;
      continue;
    }
    if (!inStr && (c === '"' || c === "'")) {
      inStr = c as '"' | "'";
      out += c;
      continue;
    }
    if (inStr) {
      out += c;
      if (c === inStr && input[i - 1] !== "\\") inStr = false;
      continue;
    }
    out += c;
  }
  return out;
}

export function stripTrailingCommas(input: string): string {
  let out = "";
  let inStr: false | '"' | "'" = false;
  for (let i = 0; i < input.length; i++) {
    const c = input[i];
    const _next = input[i + 1];
    if (!inStr && c === ",") {
      // lookahead for closing } or ]
      let j = i + 1;
      while (j < input.length && /\s/.test(input[j])) j++;
      const closer = input[j];
      if (closer === "}" || closer === "]") {
        // skip this comma
        continue;
      }
    }
    out += c;
    if (!inStr && (c === '"' || c === "'")) inStr = c as '"' | "'";
    else if (inStr && c === inStr && input[i - 1] !== "\\") inStr = false;
  }
  return out;
}
