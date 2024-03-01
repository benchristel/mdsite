import { contains, removePrefix, removeSuffix } from "../lib/strings.js";
import { dirname, relative } from "path";
import { ensureTrailingSlash } from "../lib/paths.js";
import { Entry } from "./order.js";
import { unreachable } from "../lib/unreachable.js";

export type TreeOfContents = Array<Node>;

export type Node = Branch | Leaf | Bud;

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

export type Bud = {
  // a latent leaf
  type: "bud";
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

export function bud({ path, title }: { path: string; title: string }): Bud {
  return { type: "bud", path, title };
}

export type TocOptions = {
  root?: string;
  includeLatent?: boolean;
};

export function toc(
  entries: Entry[],
  options: TocOptions = {}
): TreeOfContents {
  const { root: rawRoot = "/", includeLatent = false } = options;
  const root = ensureTrailingSlash(rawRoot);
  return entries
    .filter((e) => e.type !== "latent-entry" || includeLatent)
    .filter(
      ({ path }) =>
        path.startsWith(root) &&
        path.endsWith(".html") &&
        path !== root + "index.html" &&
        !contains("/", removeSuffix(removePrefix(path, root), "/index.html"))
    )
    .map(
      ({ type, path, title }): Node =>
        type === "latent-entry"
          ? bud({ path, title })
          : path.endsWith("/index.html")
          ? branch(
              { path, title },
              ...toc(entries, {
                root: removeSuffix(path, "index.html"),
                includeLatent,
              })
            )
          : leaf({ path, title })
    );
}

export function htmlToc(
  entries: Entry[],
  linkOrigin: string,
  options: TocOptions = {}
): string {
  const { root = dirname(linkOrigin), includeLatent = false } = options;
  const theToc = toc(entries, { root, includeLatent });
  if (theToc.length === 0) {
    return "";
  }

  return htmlForToc(theToc, linkOrigin);
}

function htmlForToc(toc: TreeOfContents, linkOrigin: string): string {
  return (
    "<ul>" + toc.map((node) => htmlTocNode(node, linkOrigin)).join("") + "</ul>"
  );
}

function htmlTocNode(node: Node, linkOrigin: string): string {
  const relativePath = relative(dirname(linkOrigin), node.path);
  const cssClass =
    linkOrigin === node.path ? ` class="mdsite-current-file"` : "";

  switch (node.type) {
    case "branch":
      return `<li${cssClass}><a href="${relativePath}">${
        node.title
      }</a>${htmlForToc(node.contents, linkOrigin)}</li>`;
    case "leaf":
      return `<li${cssClass}><a href="${relativePath}">${node.title}</a></li>`;
    case "bud":
      return `<li${cssClass}>${node.title}</li>`;
    default:
      throw unreachable("unrecognized node type", node);
  }
}
