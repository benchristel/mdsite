export { buildProject } from "./project.impl";
import { buildProject } from "./project.impl";
import { test, expect, equals, which } from "@benchristel/taste";
import { trimMargin } from "../testing/formatting";
import { isAnything } from "../testing/matchers";
import { contains } from "../lib/strings";
import { buffer } from "../lib/buffer";
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
      "/order.txt": which(isAnything),
    };

    expect(valuesToStrings(buildProject(input)), equals, expected);
  },

  "does nothing to a .txt file"() {
    const input = {
      "/foo.txt": buffer("# Hello"),
    };

    const expected = {
      "/foo.txt": "# Hello",
      "/index.html": which(isAnything),
      "/order.txt": which(isAnything),
    };

    expect(valuesToStrings(buildProject(input)), equals, expected);
  },

  "creates a default index.html file with a table of contents"() {
    const input = {
      "/foo.md": buffer("# This Is Foo"),
    };

    const expected = {
      "/foo.html": which(contains("This Is Foo")),
      "/index.html": which(contains(`<a href="foo.html">This Is Foo</a>`)),
      "/order.txt": which(isAnything),
    };

    expect(valuesToStrings(buildProject(input)), equals, expected);
  },
});
