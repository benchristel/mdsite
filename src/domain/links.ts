import { ProjectGlobalInfo } from "./project-global-info.js";
import type { OutputPath } from "./output-path.js";

export function nextLink(globalInfo: ProjectGlobalInfo, origin: OutputPath) {
  const { index, orderedLinkables } = globalInfo;
  const dest = orderedLinkables[index[origin.toString()] + 1];
  if (dest == null) {
    return "";
  }
  const href = origin.relativePathOf(dest.path);
  return `<a href="${href}" class="mdsite-next-link">Next</a>`;
}

export function prevLink(globalInfo: ProjectGlobalInfo, origin: OutputPath) {
  const { index, orderedLinkables } = globalInfo;
  const dest = orderedLinkables[index[origin.toString()] - 1];
  if (dest == null) {
    return "";
  }
  const href = origin.relativePathOf(dest.path);
  return `<a href="${href}" class="mdsite-prev-link">Prev</a>`;
}

export function upLink(origin: OutputPath) {
  return relativeLink(origin, origin.parentIndexPath(), "Up");
}

export function homeLink(origin: OutputPath) {
  const href = origin.relativePathOf("/index.html");
  return `<a href="${href}">Home</a>`;
}

export function relativeLink(
  from: OutputPath,
  to: OutputPath | string,
  text: string
) {
  return `<a href="${from.relativePathOf(to)}">${text}</a>`;
}
