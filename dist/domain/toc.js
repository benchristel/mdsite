import { contains, removePrefix, removeSuffix } from "../lib/strings.js";
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
        .filter(({ path }) => path.isIn(root) &&
        path.isHtml() &&
        path.toString() !== root + "index.html" &&
        !contains("/", removeSuffix(removePrefix(path.toString(), root), "/index.html")))
        .map(({ type, path, title }) => type === "latent-entry"
        ? bud({ path, title })
        : path.isIndexHtml()
            ? branch({ path, title }, ...toc(entries, {
                root: removeSuffix(path.toString(), "index.html"),
                includeLatent,
            }))
            : leaf({ path, title }));
}
export function htmlToc(entries, linkOrigin, options = {}) {
    const { root = linkOrigin.dirname(), includeLatent = false } = options;
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
    const relativePath = linkOrigin.relativePathOf(node.path.toString());
    const cssClass = node.path.is(linkOrigin)
        ? ` class="mdsite-current-file"`
        : "";
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
