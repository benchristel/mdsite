import { Tree, mapTree } from "../lib/files";
import { htmlFromMarkdown } from "../lib/markdown";
import { test, expect, equals } from "@benchristel/taste";

export interface Project {
  build(): Tree;
}

export function Project(input: Tree): Project {
  return {
    build,
  };

  function build() {
    return mapTree(input, (file) => {
      return {
        ...file,
        name: file.name.replace(/\.md$/, ".html"),
        contents: htmlFromMarkdown(file.contents),
      };
    });
  }
}

test("Project", {
  "builds a file"() {
    const input: Tree = {
      path: "",
      entries: [{ type: "file", name: "index.md", contents: "Hello, world!" }],
    };

    const expected: Tree = {
      path: "",
      entries: [
        {
          type: "file",
          name: "index.html",
          contents: "<p>Hello, world!</p>\n",
        },
      ],
    };

    expect(Project(input).build(), equals, expected);
  },
});
