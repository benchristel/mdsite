export { buildProject } from "./project.impl";
import { buildProject, addMissingIndexFiles } from "./project.impl";
import { test, expect, equals, which } from "@benchristel/taste";
import { trimMargin } from "../testing/formatting";
import { isAnything } from "../testing/matchers";
import "./toc";
import { contains } from "../lib/strings";
import { buffer } from "../lib/files";
import { valuesToStrings } from "../lib/objects";

test("buildProject", {
  "converts a markdown file to an HTML file"() {
    const input = {
      "/index.md": buffer("# Hello"),
    };

    const expected = {
      "/index.html": trimMargin`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Hello</title>
          </head>
          <body>
            <h1 id="hello">Hello</h1>
          </body>
        </html>
      `,
    };

    expect(valuesToStrings(buildProject(input)), equals, expected);
  },

  "does nothing to a .txt file"() {
    const input = {
      "/foo.txt": buffer("# Hello"),
    };

    const expected = {
      "/foo.txt": buffer("# Hello"),
      "/index.html": which(isAnything),
    };

    expect(buildProject(input), equals, expected);
  },

  "creates a default index.html file with a table of contents"() {
    const input = {
      "/foo.md": buffer("# This Is Foo"),
    };

    const expected = {
      "/foo.html": which(contains("This Is Foo")),
      "/index.html": which(contains(`<a href="foo.html">This Is Foo</a>`)),
    };

    expect(buildProject(input), equals, expected);
  },
});

test("addMissingIndexFiles", {
  "adds an index file to the root directory"() {
    expect(valuesToStrings(addMissingIndexFiles({})), equals, {
      "/index.md": "# Homepage\n\n{{toc}}",
    });
  },

  "leaves an existing index file alone"() {
    expect(
      valuesToStrings(addMissingIndexFiles({ "/index.md": buffer("hi") })),
      equals,
      {
        "/index.md": "hi",
      }
    );
  },

  "adds index files to subdirectories"() {
    expect(
      valuesToStrings(
        addMissingIndexFiles({
          "/index.md": buffer("hi"),
          "/foo/bar.md": buffer("hi"),
          "/foo/bar/baz.md": buffer("hi"),
        })
      ),
      equals,
      {
        "/index.md": "hi",
        "/foo/bar.md": "hi",
        "/foo/index.md": "# Index of foo\n\n{{toc}}",
        "/foo/bar/baz.md": "hi",
        "/foo/bar/index.md": "# Index of foo/bar\n\n{{toc}}",
      }
    );
  },
});
