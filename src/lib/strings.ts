import { curry } from "@benchristel/taste";

export function removeSuffix(s: string, suffix: string): string {
  if (s.endsWith(suffix)) {
    return s.slice(0, s.length - suffix.length);
  } else {
    return s;
  }
}

export function removePrefix(s: string, prefix: string): string {
  if (s.startsWith(prefix)) {
    return s.slice(prefix.length);
  } else {
    return s;
  }
}

export const contains = curry((needle: string, haystack: string): boolean => {
  return haystack.includes(needle);
}, "contains");

export function line(s: string): string {
  return s + "\n";
}
