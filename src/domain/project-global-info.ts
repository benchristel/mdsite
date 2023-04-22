import { HtmlFile } from "./html-file";
import { Order, sortHtmlFiles } from "./order";
import { ProjectFile, ProjectFileSet } from "./project-file-set";
import { test, expect, equals } from "@benchristel/taste";

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
};

export type Linkable = {
  path: string;
  title: string;
};

export function ProjectGlobalInfo(files: ProjectFileSet): ProjectGlobalInfo {
  const order = Order(sortHtmlFiles(files));
  return {
    orderedLinkables: order.items.map((path) => Linkable(files[path])),
    index: order.index,
  };
}

function Linkable(file: ProjectFile) {
  return {
    path: file.outputPath,
    title: file.type === "html" ? file.title : "",
  };
}

test("ProjectGlobalInfo", {
  "is empty given no files"() {
    const files = {};
    expect(ProjectGlobalInfo(files), equals, {
      orderedLinkables: [],
      index: {},
    });
  },

  "given one file"() {
    const files = {
      "/a.html": HtmlFile("/a.html", ""),
    };
    expect(ProjectGlobalInfo(files), equals, {
      orderedLinkables: [{ path: "/a.html", title: "a.html" }],
      index: { "/a.html": 0 },
    });
  },

  "given several files"() {
    const files = {
      "/b.html": HtmlFile("/b.html", ""),
      "/d.html": HtmlFile("/d.html", ""),
      "/c.html": HtmlFile("/c.html", ""),
      "/a.html": HtmlFile("/a.html", ""),
    };
    expect(ProjectGlobalInfo(files), equals, {
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
    });
  },
});
