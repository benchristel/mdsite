import { relativeLink } from "./links.js";
export function htmlBreadcrumb(outputPath, globalInfo, options = {}) {
    const wrap = options.omitNavWrapper
        ? (s) => s
        : (s) => `<nav aria-label="Breadcrumb" class="mdsite-breadcrumb">${s}</nav>`;
    const crumbs = [];
    let path = outputPath;
    while (path.hasParent()) {
        path = path.parentIndexPath();
        crumbs.push(htmlCrumb(outputPath, path.toString(), globalInfo));
    }
    return wrap(crumbs.reverse().join(""));
}
function htmlCrumb(from, to, globalInfo) {
    return relativeLink(from, to, globalInfo.orderedLinkables[globalInfo.index[to]].title);
}
