export function ensureTrailingSlash(path: string): string {
  if (!path.endsWith("/")) return path + "/";
  else return path;
}

export function isRelative(path: string): boolean {
  return !path.startsWith("/");
}
