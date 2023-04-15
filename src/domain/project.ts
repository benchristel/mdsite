import { Tree, file, mapTree } from "../lib/files";
import { htmlFromMarkdown } from "../lib/markdown";
import { test, expect, equals } from "@benchristel/taste";
import { trimMargin } from "../testing/formatting";

export interface Project {
  build(): Tree;
}

export function Project(input: Tree): Project {
  return {
    build,
  };

  function build() {
    return mapTree(input, (file) => {
      const name = file.name.replace(/\.md$/, ".html");
      return {
        ...file,
        name,
        contents: defaultTemplateHtml
          .replace("{{markdown}}", htmlFromMarkdown(file.contents).trim())
          .replace("{{title}}", name),
      };
    });
  }
}

const defaultTemplateHtml = trimMargin`
  <!DOCTYPE html>
  <html>
    <head>
      <title>{{title}}</title>
    </head>
    <body>
      {{markdown}}
    </body>
  </html>
`;

test("Project", {
  "builds a file with the default template"() {
    const input: Tree = [file("index.md", "Hello, world!")];

    const expected: Tree = [
      file(
        "index.html",
        trimMargin`
          <!DOCTYPE html>
          <html>
            <head>
              <title>index.html</title>
            </head>
            <body>
              <p>Hello, world!</p>
            </body>
          </html>
        `
      ),
    ];

    expect(Project(input).build(), equals, expected);
  },
});
