import { relativeLink } from "./links.js";
import { OutputPath } from "./output-path.js";
import { ProjectGlobalInfo } from "./project-global-info.js";

export function htmlBreadcrumb(
  outputPath: OutputPath,
  globalInfo: ProjectGlobalInfo,
  options: { omitNavWrapper?: boolean } = {}
): string {
  const wrap = options.omitNavWrapper
    ? (s: string) => s
    : (s: string) =>
        `<nav aria-label="Breadcrumb" class="mdsite-breadcrumb">${s}</nav>`;

  const crumbs = [];
  let path = outputPath;
  while (path.hasParent()) {
    path = path.parentIndexPath();
    crumbs.push(htmlCrumb(outputPath, path.toString(), globalInfo));
  }

  return wrap(crumbs.reverse().join(""));
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
