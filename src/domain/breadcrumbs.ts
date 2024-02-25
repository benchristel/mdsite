import { ProjectGlobalInfo } from "./project-global-info.js";
import { dirname, join, relative } from "path";

export function htmlBreadcrumb(
  outputPath: string,
  globalInfo: ProjectGlobalInfo
): string {
  const crumbs = [];
  let path = outputPath;
  while (path !== "/index.html") {
    path = parentOf(path);
    crumbs.push(htmlCrumb(outputPath, path, globalInfo));
  }
  return `<nav aria-label="Breadcrumb" class="mdsite-breadcrumb">${crumbs
    .reverse()
    .join("")}</nav>`;
}

function htmlCrumb(
  from: string,
  to: string,
  globalInfo: ProjectGlobalInfo
): string {
  return `<a href="${relative(dirname(from), to)}">${
    globalInfo.orderedLinkables[globalInfo.index[to]].title
  }</a>`;
}

export function parentOf(path: string): string {
  if (path === "/index.html") {
    return "/index.html";
  } else if (path.endsWith("/index.html")) {
    return join(dirname(dirname(path)), "index.html");
  } else {
    return join(dirname(path), "index.html");
  }
}
