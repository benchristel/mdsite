import { test, expect, equals, which } from "@benchristel/taste";
import { isAnything } from "../testing/matchers.js";
import { contains } from "../lib/strings.js";
import { buffer } from "../lib/buffer.js";
import { valuesToStrings } from "../lib/objects.js";
import { Project, indexLinkables } from "./project.js";
import { OutputPath } from "./output-path.js";

const of = OutputPath.of;

test("Project.build()", {
  "converts a markdown file to an HTML file"() {
    const project = new Project(
      {
        "/index.md": buffer("# Hello"),
      },
      "- {{content}} -"
    );

    const expected = {
      "/index.html": `- <h1 id="hello">Hello</h1> -`,
      "/order.txt": which(isAnything),
    };

    expect(valuesToStrings(project.build()), equals, expected);
  },

  "does nothing to a .txt file"() {
    const project = new Project({
      "/foo.txt": buffer("# Hello"),
    });

    const expected = {
      "/foo.txt": "# Hello",
      "/index.html": which(isAnything),
      "/order.txt": which(isAnything),
    };

    expect(valuesToStrings(project.build()), equals, expected);
  },

  "creates a default index.html file with a table of contents"() {
    const project = new Project(
      {
        "/foo.md": buffer("# This Is Foo"),
      },
      "{{content}}"
    );

    const expected = {
      "/foo.html": which(contains("This Is Foo")),
      "/index.html": which(contains(`<a href="foo.html">This Is Foo</a>`)),
      "/order.txt": which(isAnything),
    };

    expect(valuesToStrings(project.build()), equals, expected);
  },
});

test("Project", {
  "has a synthetic index.html given no files"() {
    const files = {};
    const project = new Project(files);
    expect(project.orderedLinkables, equals, [
      { path: of("/index.html"), title: "Homepage" },
    ]);
    expect(project.index, equals, {
      "/index.html": 0,
    });
  },

  "given one file"() {
    const files = {
      "/a.html": buffer(""),
    };
    const project = new Project(files);

    expect(project.orderedLinkables, equals, [
      { path: of("/index.html"), title: "Homepage" },
      { path: of("/a.html"), title: "a.html" },
    ]);
    expect(project.index, equals, { "/index.html": 0, "/a.html": 1 });
  },

  "given a template"() {
    const files = {};
    expect(new Project(files, "the-template").template, equals, "the-template");
  },

  "given several files"() {
    const files = {
      "/b.html": buffer(""),
      "/d.html": buffer(""),
      "/c.html": buffer(""),
      "/a.html": buffer(""),
    };

    const project = new Project(files);

    expect(project.orderedLinkables, equals, [
      { path: of("/index.html"), title: "Homepage" },
      { path: of("/a.html"), title: "a.html" },
      { path: of("/b.html"), title: "b.html" },
      { path: of("/c.html"), title: "c.html" },
      { path: of("/d.html"), title: "d.html" },
    ]);
    expect(project.index, equals, {
      "/index.html": 0,
      "/a.html": 1,
      "/b.html": 2,
      "/c.html": 3,
      "/d.html": 4,
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
