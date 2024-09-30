import { test, expect, is } from "@benchristel/taste";
import { contains } from "../lib/strings.js";
import { htmlBreadcrumb } from "./breadcrumbs.js";
import { Project } from "./project.js";
import { buffer } from "../lib/buffer.js";
import { OutputPath } from "./output-path.js";

const of = OutputPath.of;

test("htmlBreadcrumb", {
  "is empty on the top-level index page"() {
    const project = new Project({});
    expect(
      htmlBreadcrumb(of("/index.html"), project),
      is,
      `<nav aria-label="Breadcrumb" class="mdsite-breadcrumb"></nav>`
    );
  },

  "displays the title of the parent index page"() {
    const project = new Project({
      "/index.html": buffer("<h1>The Index Page</h1>"),
      "/leaf.html": buffer(""),
    });
    expect(
      htmlBreadcrumb(of("/leaf.html"), project),
      contains,
      `<a href="index.html">The Index Page</a>`
    );
  },

  "creates multiple breadcrumbs for a file in a directory"() {
    const project = new Project({
      "/index.html": buffer("<h1>The Index Page</h1>"),
      "/tree/index.html": buffer("<h1>A Nice Tree</h1>"),
      "/tree/leaf.html": buffer(""),
    });
    expect(
      htmlBreadcrumb(of("/tree/leaf.html"), project),
      contains,
      `<a href="../index.html">The Index Page</a>` +
        `<a href="index.html">A Nice Tree</a>`
    );
  },
});
