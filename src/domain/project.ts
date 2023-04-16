import { FileSet } from "../lib/files";
import { htmlFromMarkdown } from "../lib/markdown";
import { intoObject } from "../lib/objects";
import { test, expect, equals } from "@benchristel/taste";
import { trimMargin } from "../testing/formatting";
import { basename } from "path";

export function buildProject(files: FileSet): FileSet {
  return Object.entries(files)
    .map(([srcPath, srcContents]) => {
      if (srcPath.endsWith(".md")) {
        const htmlPath = srcPath.replace(/\.md$/, ".html");
        const htmlContents = defaultTemplate
          .replace("{{markdown}}", htmlFromMarkdown(srcContents).trim())
          .replace("{{title}}", basename(htmlPath));

        return [htmlPath, htmlContents] as [string, string];
      } else {
        return [srcPath, srcContents] as [string, string];
      }
    })
    .reduce(intoObject, {});
}

const defaultTemplate = trimMargin`
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

test("buildProject", {
  "converts a markdown file to an HTML file"() {
    const input = {
      "/foo.md": "# Hello",
    };

    const expected = {
      "/foo.html": trimMargin`
        <!DOCTYPE html>
        <html>
          <head>
            <title>foo.html</title>
          </head>
          <body>
            <h1 id="hello">Hello</h1>
          </body>
        </html>
      `,
    };

    expect(buildProject(input), equals, expected);
  },

  "does nothing to a .txt file"() {
    const input = {
      "/foo.txt": "# Hello",
    };

    const expected = {
      "/foo.txt": "# Hello",
    };

    expect(buildProject(input), equals, expected);
  },
});
