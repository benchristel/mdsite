import { dirname, join, relative } from "path";
import { ProjectGlobalInfo } from "./project-global-info";

export function nextLink(globalInfo: ProjectGlobalInfo, origin: string) {
  const { index, orderedLinkables } = globalInfo;
  const dest = orderedLinkables[index[origin] + 1];
  if (dest == null) {
    return "";
  }
  const href = relative(dirname(origin), dest.path);
  return `<a href="${href}" class="mdsite-next-link">Next</a>`;
}

export function prevLink(globalInfo: ProjectGlobalInfo, origin: string) {
  const { index, orderedLinkables } = globalInfo;
  const dest = orderedLinkables[index[origin] - 1];
  if (dest == null) {
    return "";
  }
  const href = relative(dirname(origin), dest.path);
  return `<a href="${href}" class="mdsite-prev-link">Prev</a>`;
}

export function upLink(origin: string) {
  const dest = origin.endsWith("/index.html")
    ? join(dirname(dirname(origin)), "index.html")
    : join(dirname(origin), "index.html");
  const href = relative(dirname(origin), dest);
  return `<a href="${href}">Up</a>`;
}

export function homeLink(origin: string) {
  const href = relative(dirname(origin), "/index.html");
  return `<a href="${href}">Home</a>`;
}
