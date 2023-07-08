import { dirname, relative } from "path";
import { ProjectGlobalInfo } from "./project-global-info.js";
import { expect, is, test } from "@benchristel/taste";

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
  const href = ((): string => {
    switch (true) {
      case origin === "/index.html":
        return "index.html";
      case origin.endsWith("/index.html"):
        return "../index.html";
      default:
        return "index.html";
    }
  })();
  return `<a href="${href}">Up</a>`;
}

export function homeLink(origin: string) {
  const href = relative(dirname(origin), "/index.html");
  return `<a href="${href}">Home</a>`;
}

test("upLink", {
  "given /index.html"() {
    expect(upLink("/index.html"), is, `<a href="index.html">Up</a>`);
  },

  "given a subdirectory's index.html"() {
    expect(upLink("/foo/index.html"), is, `<a href="../index.html">Up</a>`);
  },

  "given any other path"() {
    expect(upLink("/foo.html"), is, `<a href="index.html">Up</a>`);
  },
});
