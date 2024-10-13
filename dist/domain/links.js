export function nextLink(globalInfo, origin) {
    const { index, orderedLinkables } = globalInfo;
    const dest = orderedLinkables[index[origin.toString()] + 1];
    if (dest == null) {
        return "";
    }
    const href = origin.relativePathOf(dest.path);
    return `<a href="${href}" class="mdsite-next-link">Next</a>`;
}
export function prevLink(globalInfo, origin) {
    const { index, orderedLinkables } = globalInfo;
    const dest = orderedLinkables[index[origin.toString()] - 1];
    if (dest == null) {
        return "";
    }
    const href = origin.relativePathOf(dest.path);
    return `<a href="${href}" class="mdsite-prev-link">Prev</a>`;
}
export function upLink(origin) {
    return relativeLink(origin, origin.parentIndexPath(), "Up");
}
export function homeLink(origin) {
    const href = origin.relativePathOf("/index.html");
    return `<a href="${href}">Home</a>`;
}
export function relativeLink(from, to, text) {
    return `<a href="${from.relativePathOf(to)}">${text}</a>`;
}
