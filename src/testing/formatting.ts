import { curry } from "@benchristel/taste";

export function trimMargin(s: string | TemplateStringsArray): string {
  const lns = lines(s.toString());
  if (isBlank(firstOf(lns, ""))) lns.shift();
  if (isBlank(lastOf(lns, ""))) lns.pop();
  const initialIndent = /^[ \t]*/.exec(firstOf(lns, ""))?.[0] ?? "";
  return lns.map(removePrefix(initialIndent)).join("\n");
}

export function lines(s: string): Array<string> {
  return String(s).split(/\r?\n/);
}

export const removePrefix = curry(function removePrefix(
  prefix: string,
  s: string
): string {
  const hasPrefix = s.slice(0, prefix.length) === prefix;
  return hasPrefix ? s.slice(prefix.length) : s;
},
"removePrefix");

export const isBlank = curry(function (s: string | undefined) {
  if (!s) return true;
  return /^\s*$/.test(s);
}, "isBlank");

function firstOf<T>(a: Array<T>, _default: T): T {
  return a[0] ?? _default;
}

function lastOf<T>(a: Array<T>, _default: T): T {
  return a[a.length - 1] ?? _default;
}
