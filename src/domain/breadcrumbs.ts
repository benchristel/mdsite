import { parentOf, relativeLink } from "./links.js";
import { OutputPath } from "./output-path.js";
import { ProjectGlobalInfo } from "./project-global-info.js";

export function htmlBreadcrumb(
  outputPath: OutputPath,
  globalInfo: ProjectGlobalInfo
): string {
  const crumbs = [];
  let path = outputPath.toString();
  while (path !== "/index.html") {
    path = parentOf(path);
    crumbs.push(htmlCrumb(outputPath, path, globalInfo));
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
