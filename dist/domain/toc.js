import { contains, removePrefix, removeSuffix } from "../lib/strings.js";
import { dirname, relative } from "path";
import { ensureTrailingSlash } from "../lib/paths.js";
import { unreachable } from "../lib/unreachable.js";
export function branch(params, ...contents) {
    return Object.assign({ type: "branch", contents }, params);
}
export function leaf(params) {
    return Object.assign({ type: "leaf" }, params);
}
export function bud({ path, title }) {
    return { type: "bud", path, title };
}
export function toc(entries, options = {}) {
    const { root: rawRoot = "/", includeLatent = false } = options;
    const root = ensureTrailingSlash(rawRoot);
    return entries
        .filter((e) => e.type !== "latent-entry" || includeLatent)
        .filter(({ path }) => path.startsWith(root) &&
        path.endsWith(".html") &&
        path !== root + "index.html" &&
        !contains("/", removeSuffix(removePrefix(path, root), "/index.html")))
        .map(({ type, path, title }) => type === "latent-entry"
        ? bud({ path, title })
        : path.endsWith("/index.html")
            ? branch({ path, title }, ...toc(entries, {
                root: removeSuffix(path, "index.html"),
                includeLatent,
            }))
            : leaf({ path, title }));
}
export function htmlToc(entries, linkOrigin, options = {}) {
    const { root = dirname(linkOrigin), includeLatent = false } = options;
    const theToc = toc(entries, { root, includeLatent });
    if (theToc.length === 0) {
        return "";
    }
    return htmlForToc(theToc, linkOrigin);
}
function htmlForToc(toc, linkOrigin) {
    return ("<ul>" + toc.map((node) => htmlTocNode(node, linkOrigin)).join("") + "</ul>");
}
function htmlTocNode(node, linkOrigin) {
    const relativePath = relative(dirname(linkOrigin), node.path);
    const cssClass = linkOrigin === node.path ? ` class="mdsite-current-file"` : "";
    switch (node.type) {
        case "branch":
            return `<li${cssClass}><a href="${relativePath}">${node.title}</a>${htmlForToc(node.contents, linkOrigin)}</li>`;
        case "leaf":
            return `<li${cssClass}><a href="${relativePath}">${node.title}</a></li>`;
        case "bud":
            return `<li${cssClass}>${node.title}</li>`;
        default:
            throw unreachable("unrecognized node type", node);
    }
}
