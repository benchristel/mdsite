import { test, expect, equals, which } from "@benchristel/taste";
import { ProjectGlobalInfo, indexLinkables } from "./project-global-info";
import { isAnything } from "../testing/matchers";
import { HtmlFile } from "./files/html-file";

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
      "/a.html": new HtmlFile("/a.html", ""),
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
      "/b.html": new HtmlFile("/b.html", ""),
      "/d.html": new HtmlFile("/d.html", ""),
      "/c.html": new HtmlFile("/c.html", ""),
      "/a.html": new HtmlFile("/a.html", ""),
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
