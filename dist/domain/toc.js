import { contains, removePrefix, removeSuffix } from "../lib/strings.js";
import { dirname, relative } from "path";
import { ensureTrailingSlash } from "../lib/paths.js";
export function branch(params, ...contents) {
    return Object.assign({ type: "branch", contents }, params);
}
export function leaf(params) {
    return Object.assign({ type: "leaf" }, params);
}
export function toc(orderedLinkables, root = "/") {
    root = ensureTrailingSlash(root);
    return Object.values(orderedLinkables)
        .filter(({ path }) => path.startsWith(root) &&
        path.endsWith(".html") &&
        path !== root + "index.html" &&
        !contains("/", removeSuffix(removePrefix(path, root), "/index.html")))
        .map(({ path, title }) => path.endsWith("/index.html")
        ? branch({ path, title }, ...toc(orderedLinkables, removeSuffix(path, "index.html")))
        : leaf({ path, title }));
}
export function htmlToc(orderedLinkables, linkOrigin, root = dirname(linkOrigin)) {
    const theToc = toc(orderedLinkables, root);
    if (theToc.length === 0) {
        return "";
    }
    return htmlForToc(theToc, linkOrigin);
}
function htmlForToc(toc, linkOrigin) {
    return ("<ul>" +
        toc
            .map((node) => {
            const cssClass = linkOrigin === node.path ? ` class="mdsite-current-file"` : "";
            const subToc = node.type === "leaf" ? "" : htmlForToc(node.contents, linkOrigin);
            const relativePath = relative(dirname(linkOrigin), node.path);
            return `<li${cssClass}><a href="${relativePath}">${node.title}</a>${subToc}</li>`;
        })
            .join("") +
        "</ul>");
}
