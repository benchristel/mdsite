import { parentOf, relativeLink } from "./links.js";
export function htmlBreadcrumb(outputPath, globalInfo) {
    const crumbs = [];
    let path = outputPath;
    while (path !== "/index.html") {
        path = parentOf(path);
        crumbs.push(htmlCrumb(outputPath, path, globalInfo));
    }
    return `<nav aria-label="Breadcrumb" class="mdsite-breadcrumb">${crumbs
        .reverse()
        .join("")}</nav>`;
}
function htmlCrumb(from, to, globalInfo) {
    return relativeLink(from, to, globalInfo.orderedLinkables[globalInfo.index[to]].title);
}
