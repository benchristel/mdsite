import { contains, removePrefix, removeSuffix } from "../lib/strings";
import { basename, join, relative } from "path";
import { HtmlFile, ProjectFileSet, MarkdownFile } from "./project-file-set";
import { by } from "../lib/sorting";
import { EntryOrdering } from "./entry-ordering";
import { ensureTrailingSlash } from "../lib/files";

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

const tocSortKey = (n: Node) => n.title;

export function branch(
  params: { path: string; title: string },
  ...contents: TreeOfContents
): Branch {
  return { type: "branch", contents, ...params };
}

export function leaf(params: { path: string; title: string }): Leaf {
  return { type: "leaf", ...params };
}

export function toc(files: ProjectFileSet, root: string = "/"): TreeOfContents {
  root = ensureTrailingSlash(root);
  const ordering = getOrdering(files, root);
  return Object.values(files)
    .flatMap(
      (file): Array<MarkdownFile | HtmlFile> =>
        file.type === "markdown" || file.type === "html" ? [file] : []
    )
    .filter(
      ({ outputPath: path }) =>
        path.startsWith(root) &&
        path.endsWith(".html") &&
        path !== root + "index.html" &&
        !contains("/", removeSuffix(removePrefix(path, root), "/index.html"))
    )
    .map(
      ({ outputPath: path, title }): Node =>
        path.endsWith("/index.html")
          ? branch(
              { path, title },
              ...toc(files, removeSuffix(path, "index.html"))
            )
          : leaf({ path, title })
    )
    .sort(by(indexIn(ordering), tocSortKey));
}

export function indexIn(
  ordering: EntryOrdering
): (node: { path: string }) => number {
  return ({ path }) => {
    return (
      ordering.indexForName[basename(removeSuffix(path, "/index.html"))] ??
      Infinity
    );
  };
}

function getOrdering(files: ProjectFileSet, root: string): EntryOrdering {
  const orderFile = files[join(root, "order.txt")];
  if (orderFile?.type === "order") {
    return orderFile.ordering;
  } else {
    return {
      indexForName: {},
    };
  }
}

export function htmlToc(
  files: ProjectFileSet,
  linkOrigin: string,
  root: string = linkOrigin
): string {
  const theToc = toc(files, root);
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
        const subToc =
          node.type === "leaf" ? "" : htmlForToc(node.contents, linkOrigin);
        const relativePath = relative(linkOrigin, node.path);
        return `<li><a href="${relativePath}">${node.title}</a>${subToc}</li>`;
      })
      .join("") +
    "</ul>"
  );
}
