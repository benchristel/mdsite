import { test, expect, is } from "@benchristel/taste";
import {
  dummyProjectGlobalInfo,
  indexLinkables,
} from "./project-global-info.js";
import { contains } from "../lib/strings.js";
import { htmlBreadcrumb, parentOf } from "./breadcrumbs.js";

test("htmlBreadcrumb", {
  "is empty on the top-level index page"() {
    const outputPath = "/index.html";
    const globalInfo = dummyProjectGlobalInfo;
    expect(
      htmlBreadcrumb(outputPath, globalInfo),
      is,
      `<nav aria-label="Breadcrumb" class="mdsite-breadcrumb"></nav>`
    );
  },

  "displays the title of the parent index page"() {
    const outputPath = "/leaf.html";
    const globalInfo = {
      ...dummyProjectGlobalInfo,
      ...indexLinkables([
        { path: "/index.html", title: "The Index Page" },
        { path: "/leaf.html", title: "A Leaf" },
      ]),
    };
    expect(
      htmlBreadcrumb(outputPath, globalInfo),
      contains,
      `<a href="index.html">The Index Page</a>`
    );
  },

  "creates multiple breadcrumbs for a file in a directory"() {
    const outputPath = "/tree/leaf.html";
    const globalInfo = {
      ...dummyProjectGlobalInfo,
      ...indexLinkables([
        { path: "/index.html", title: "The Index Page" },
        { path: "/tree/index.html", title: "A Nice Tree" },
        { path: "/tree/leaf.html", title: "A Leaf" },
      ]),
    };
    expect(
      htmlBreadcrumb(outputPath, globalInfo),
      contains,
      `<a href="../index.html">The Index Page</a>` +
        `<a href="index.html">A Nice Tree</a>`
    );
  },
});

test("parentOf", {
  "given /index.html"() {
    expect(parentOf("/index.html"), is, "/index.html");
  },

  "given /foo/index.html"() {
    expect(parentOf("/foo/index.html"), is, "/index.html");
  },

  "given /foo/bar/index.html"() {
    expect(parentOf("/foo/bar/index.html"), is, "/foo/index.html");
  },

  "given /foo/bar/baz.html"() {
    expect(parentOf("/foo/bar/baz.html"), is, "/foo/bar/index.html");
  },
});
