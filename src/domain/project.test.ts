import { test, expect, equals, which } from "@benchristel/taste";
export { buildProject } from "./project.js";
import { isAnything } from "../testing/matchers.js";
import { contains } from "../lib/strings.js";
import { buffer } from "../lib/buffer.js";
import { valuesToStrings } from "../lib/objects.js";
import { buildProject } from "./project.js";

test("buildProject", {
  "converts a markdown file to an HTML file"() {
    const input = {
      "/index.md": buffer("# Hello"),
    };

    const template = "- {{content}} -";

    const expected = {
      "/index.html": `- <h1 id="hello">Hello</h1> -`,
      "/order.txt": which(isAnything),
    };

    expect(valuesToStrings(buildProject(input, template)), equals, expected);
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

    expect(valuesToStrings(buildProject(input, "")), equals, expected);
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

    expect(
      valuesToStrings(buildProject(input, "{{content}}")),
      equals,
      expected
    );
  },
});
