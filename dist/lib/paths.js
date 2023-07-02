export function ensureTrailingSlash(path) {
    if (!path.endsWith("/"))
        return path + "/";
    else
        return path;
}
