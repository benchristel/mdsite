import { contains, removePrefix, removeSuffix } from "../lib/strings.js";
import { dirname, relative } from "path";
import { ensureTrailingSlash } from "../lib/paths.js";
import { Linkable } from "./project-global-info.js";

export type TreeOfContents = Array<Node>;

export type Node = Branch | Leaf;

export type Branch = {
  type: "branch";
  path: string;
  title: string;
  contents: TreeOfContents;
};

export type Leaf = {
  type: "leaf";
  path: string;
  title: string;
};

export function branch(
  params: { path: string; title: string },
  ...contents: TreeOfContents
): Branch {
  return { type: "branch", contents, ...params };
}

export function leaf(params: { path: string; title: string }): Leaf {
  return { type: "leaf", ...params };
}

export function toc(
  orderedLinkables: Linkable[],
  root: string = "/"
): TreeOfContents {
  root = ensureTrailingSlash(root);
  return Object.values(orderedLinkables)
    .filter(
      ({ path }) =>
        path.startsWith(root) &&
        path.endsWith(".html") &&
        path !== root + "index.html" &&
        !contains("/", removeSuffix(removePrefix(path, root), "/index.html"))
    )
    .map(
      ({ path, title }): Node =>
        path.endsWith("/index.html")
          ? branch(
              { path, title },
              ...toc(orderedLinkables, removeSuffix(path, "index.html"))
            )
          : leaf({ path, title })
    );
}

export function htmlToc(
  orderedLinkables: Linkable[],
  linkOrigin: string,
  root: string = dirname(linkOrigin)
): string {
  const theToc = toc(orderedLinkables, root);
  if (theToc.length === 0) {
    return "";
  }

  return htmlForToc(theToc, linkOrigin);
}

function htmlForToc(toc: TreeOfContents, linkOrigin: string): string {
  return (
    "<ul>" +
    toc
      .map((node) => {
        const cssClass =
          linkOrigin === node.path ? ` class="mdsite-current-file"` : "";
        const subToc =
          node.type === "leaf" ? "" : htmlForToc(node.contents, linkOrigin);
        const relativePath = relative(dirname(linkOrigin), node.path);
        return `<li${cssClass}><a href="${relativePath}">${node.title}</a>${subToc}</li>`;
      })
      .join("") +
    "</ul>"
  );
}
