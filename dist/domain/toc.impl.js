import { contains, removePrefix, removeSuffix } from "../lib/strings.js";
import { relative } from "path";
import { ensureTrailingSlash } from "../lib/paths.js";
export function branch(params, ...contents) {
    return Object.assign({ type: "branch", contents }, params);
}
export function leaf(params) {
    return Object.assign({ type: "leaf" }, params);
}
export function toc(globalInfo, root = "/") {
    root = ensureTrailingSlash(root);
    return Object.values(globalInfo.orderedLinkables)
        .filter(({ path }) => path.startsWith(root) &&
        path.endsWith(".html") &&
        path !== root + "index.html" &&
        !contains("/", removeSuffix(removePrefix(path, root), "/index.html")))
        .map(({ path, title }) => path.endsWith("/index.html")
        ? branch({ path, title }, ...toc(globalInfo, removeSuffix(path, "index.html")))
        : leaf({ path, title }));
}
export function htmlToc(globalInfo, linkOrigin, root = linkOrigin) {
    const theToc = toc(globalInfo, root);
    if (theToc.length === 0) {
        return "";
    }
    return htmlForToc(theToc, linkOrigin);
}
function htmlForToc(toc, linkOrigin) {
    return ("<ul>" +
        toc
            .map((node) => {
            const subToc = node.type === "leaf" ? "" : htmlForToc(node.contents, linkOrigin);
            const relativePath = relative(linkOrigin, node.path);
            return `<li><a href="${relativePath}">${node.title}</a>${subToc}</li>`;
        })
            .join("") +
        "</ul>");
}
