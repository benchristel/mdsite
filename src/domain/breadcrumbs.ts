import { parentOf, relativeLink } from "./links.js";
import { ProjectGlobalInfo } from "./project-global-info.js";

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
  return relativeLink(
    from,
    to,
    globalInfo.orderedLinkables[globalInfo.index[to]].title
  );
}
