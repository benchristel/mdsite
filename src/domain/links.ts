import { dirname, join, relative } from "path";
import { ProjectGlobalInfo } from "./project-global-info.js";

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
  return relativeLink(origin, parentOf(origin), "Up");
}

export function homeLink(origin: string) {
  const href = relative(dirname(origin), "/index.html");
  return `<a href="${href}">Home</a>`;
}

export function relativeLink(from: string, to: string, text: string) {
  return `<a href="${relative(dirname(from), to)}">${text}</a>`;
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
