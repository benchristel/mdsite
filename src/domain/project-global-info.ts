import { sortHtmlFiles } from "./order.js";
import type { ProjectFile, ProjectFileSet } from "./project-file-set.js";

export type ProjectGlobalInfo = {
  // orderedLinkables contains the information about each HTML page needed
  // to construct a user-friendly link to it. The array is in "page order",
  // i.e. the order in which you'd visit the pages if you repeatedly clicked
  // the "next" link.
  orderedLinkables: Array<Linkable>;
  // index maps each output path to the position in orderedLinkables where
  // information about that path can be found. This is most useful when
  // combined with pointer arithmetic; e.g. orderedLinkables[index[path] + 1]
  // gets the information needed to construct the "next" link on the page
  // at `path`.
  index: Record<string, number>;
  // template is the HTML template into which to render content
  template: string;
};

export type Linkable = {
  path: string;
  title: string;
};

export const dummyProjectGlobalInfo = {
  orderedLinkables: [],
  index: {},
  template: "dummy template",
};

export function indexLinkables(linkables: Linkable[]): {
  index: Record<string, number>;
  orderedLinkables: Linkable[];
} {
  const index: Record<string, number> = {};
  linkables.forEach((linkable, i) => {
    index[linkable.path] = i;
  });
  return {
    orderedLinkables: linkables,
    index,
  };
}

export function ProjectGlobalInfo(
  files: ProjectFileSet,
  template: string
): ProjectGlobalInfo {
  const order = sortHtmlFiles(files);
  return {
    ...indexLinkables(order.map((path) => Linkable(files[path]))),
    template,
  };
}

function Linkable(file: ProjectFile) {
  return {
    path: file.outputPath,
    title: file.type === "html" ? file.title : "",
  };
}
