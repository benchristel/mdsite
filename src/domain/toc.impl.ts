import { contains, removePrefix, removeSuffix } from "../lib/strings";
import { relative } from "path";
import { ensureTrailingSlash } from "../lib/paths";
import { ProjectGlobalInfo } from "./project-global-info";

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
  globalInfo: ProjectGlobalInfo,
  root: string = "/"
): TreeOfContents {
  root = ensureTrailingSlash(root);
  return Object.values(globalInfo.orderedLinkables)
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
              ...toc(globalInfo, removeSuffix(path, "index.html"))
            )
          : leaf({ path, title })
    );
}

export function htmlToc(
  globalInfo: ProjectGlobalInfo,
  linkOrigin: string,
  root: string = linkOrigin
): string {
  const theToc = toc(globalInfo, root);
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
