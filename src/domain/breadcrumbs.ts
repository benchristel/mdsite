import { relativeLink } from "./links.js";
import { OutputPath } from "./output-path.js";
import { ProjectGlobalInfo } from "./project-global-info.js";

export function htmlBreadcrumb(
  outputPath: OutputPath,
  globalInfo: ProjectGlobalInfo
): string {
  const crumbs = [];
  let path = outputPath;
  while (path.isNot("/index.html")) {
    path = path.parentIndexPath();
    crumbs.push(htmlCrumb(outputPath, path.toString(), globalInfo));
  }
  return `<nav aria-label="Breadcrumb" class="mdsite-breadcrumb">${crumbs
    .reverse()
    .join("")}</nav>`;
}

function htmlCrumb(
  from: OutputPath,
  to: string,
  globalInfo: ProjectGlobalInfo
): string {
  return relativeLink(
    from,
    to,
    globalInfo.orderedLinkables[globalInfo.index[to]].title
  );
}
