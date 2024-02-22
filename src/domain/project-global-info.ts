import { isAnything } from "../testing/matchers.js";
import { HtmlFile } from "./html-file.js";
import { sortHtmlFiles } from "./order.js";
import type { ProjectFile, ProjectFileSet } from "./project-file-set.js";
import { test, expect, equals, which } from "@benchristel/taste";

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

test("indexLinkables", {
  "given an empty array"() {
    expect(indexLinkables([]), equals, { index: {}, orderedLinkables: [] });
  },

  "assigns the first item in the array an index of 0"() {
    expect(indexLinkables([{ path: "foo" } as any]), equals, {
      index: { foo: 0 },
      orderedLinkables: [{ path: "foo" }],
    });
  },

  "assigns the second item in the array an index of 1"() {
    expect(
      indexLinkables([{ path: "foo" } as any, { path: "bar" } as any]),
      equals,
      {
        index: { foo: 0, bar: 1 },
        orderedLinkables: [{ path: "foo" }, { path: "bar" }],
      }
    );
  },
});

function Linkable(file: ProjectFile) {
  return {
    path: file.outputPath,
    title: file.type === "html" ? file.title : "",
  };
}

test("ProjectGlobalInfo", {
  "is empty given no files"() {
    const files = {};
    expect(ProjectGlobalInfo(files, ""), equals, {
      orderedLinkables: [],
      index: {},
      template: which(isAnything),
    });
  },

  "given one file"() {
    const files = {
      "/a.html": HtmlFile("/a.html", ""),
    };
    expect(ProjectGlobalInfo(files, ""), equals, {
      orderedLinkables: [{ path: "/a.html", title: "a.html" }],
      index: { "/a.html": 0 },
      template: which(isAnything),
    });
  },

  "given a template"() {
    const files = {};
    expect(
      ProjectGlobalInfo(files, "the-template").template,
      equals,
      "the-template"
    );
  },

  "given several files"() {
    const files = {
      "/b.html": HtmlFile("/b.html", ""),
      "/d.html": HtmlFile("/d.html", ""),
      "/c.html": HtmlFile("/c.html", ""),
      "/a.html": HtmlFile("/a.html", ""),
    };
    expect(ProjectGlobalInfo(files, ""), equals, {
      orderedLinkables: [
        { path: "/a.html", title: "a.html" },
        { path: "/b.html", title: "b.html" },
        { path: "/c.html", title: "c.html" },
        { path: "/d.html", title: "d.html" },
      ],
      index: {
        "/a.html": 0,
        "/b.html": 1,
        "/c.html": 2,
        "/d.html": 3,
      },
      template: which(isAnything),
    });
  },
});
