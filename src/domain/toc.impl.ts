import { contains, removePrefix, removeSuffix } from "../lib/strings";
import { relative } from "path";
import { HtmlFile, ProjectFileSet, MarkdownFile } from "./project-file-set";

export type TreeOfContents = Array<Node>;

export type Node = Branch | Leaf;

export type Branch = { type: "branch"; path: string; contents: TreeOfContents };

export type Leaf = { type: "leaf"; path: string };

export function toc(files: ProjectFileSet, root: string = "/"): TreeOfContents {
  root = ensureTrailingSlash(root);
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
    .map(({ outputPath: path }) =>
      path.endsWith("/index.html")
        ? {
            type: "branch",
            path,
            contents: toc(files, removeSuffix(path, "index.html")),
          }
        : { type: "leaf", path }
    );
}

function ensureTrailingSlash(path: string): string {
  if (!path.endsWith("/")) return path + "/";
  else return path;
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

  return htmlForToc(files, theToc, linkOrigin);
}

function htmlForToc(
  files: ProjectFileSet,
  toc: TreeOfContents,
  linkOrigin: string
): string {
  return (
    "<ul>" +
    toc
      .map((node) => {
        const subToc =
          node.type === "leaf"
            ? ""
            : htmlForToc(files, node.contents, linkOrigin);
        const relativePath = relative(linkOrigin, node.path);
        const file = files[node.path];
        const linkTitle =
          ((file.type === "markdown" || file.type === "html") && file.title) ||
          relativePath;
        return `<li><a href="${relativePath}">${linkTitle}</a>${subToc}</li>`;
      })
      .join("") +
    "</ul>"
  );
}
