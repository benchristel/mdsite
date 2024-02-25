import { dirname, join, relative } from "path";
export function nextLink(globalInfo, origin) {
    const { index, orderedLinkables } = globalInfo;
    const dest = orderedLinkables[index[origin] + 1];
    if (dest == null) {
        return "";
    }
    const href = relative(dirname(origin), dest.path);
    return `<a href="${href}" class="mdsite-next-link">Next</a>`;
}
export function prevLink(globalInfo, origin) {
    const { index, orderedLinkables } = globalInfo;
    const dest = orderedLinkables[index[origin] - 1];
    if (dest == null) {
        return "";
    }
    const href = relative(dirname(origin), dest.path);
    return `<a href="${href}" class="mdsite-prev-link">Prev</a>`;
}
export function upLink(origin) {
    return relativeLink(origin, parentOf(origin), "Up");
}
export function homeLink(origin) {
    const href = relative(dirname(origin), "/index.html");
    return `<a href="${href}">Home</a>`;
}
export function relativeLink(from, to, text) {
    return `<a href="${relative(dirname(from), to)}">${text}</a>`;
}
export function parentOf(path) {
    if (path === "/index.html") {
        return "/index.html";
    }
    else if (path.endsWith("/index.html")) {
        return join(dirname(dirname(path)), "index.html");
    }
    else {
        return join(dirname(path), "index.html");
    }
}
