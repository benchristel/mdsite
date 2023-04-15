import {
  Tree,
  file,
  mapFilesInTree,
  directory,
  mapDirectoriesInTree,
} from "../lib/files";
import { htmlFromMarkdown } from "../lib/markdown";
import { test, expect, equals, which, curry } from "@benchristel/taste";
import { trimMargin } from "../testing/formatting";

export interface Project {
  build(): Tree;
}

export function Project(input: Tree): Project {
  return {
    build,
  };

  function build() {
    let wip = input;

    wip = addIndexMdIfMissing(wip);
    wip = mapDirectoriesInTree(wip, (dir) => {
      return { ...dir, entries: addIndexMdIfMissing(dir.entries) };
    });

    wip = mapFilesInTree(wip, (file) => {
      const name = file.name.replace(/\.md$/, ".html");
      return {
        ...file,
        name,
        contents: defaultTemplateHtml
          .replace("{{markdown}}", htmlFromMarkdown(file.contents).trim())
          .replace("{{title}}", name),
      };
    });

    return wip;
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

  "creates an index.html file if the root directory lacks one"() {
    const input: Tree = [file("foo.md", "Hello, world!")];

    const expected: Tree = [
      file("foo.html", which(contains("Hello, world!"))),
      file(
        "index.html",
        which(
          contains(trimMargin`
          <h1 id="index">Index</h1>
        `)
        )
      ),
    ];

    expect(Project(input).build(), equals, expected);
  },

  "creates an index.html file in a subdirectory that lacks one"() {
    const input: Tree = [directory("a-directory"), file("index.md", "")];

    const expected: Tree = [
      directory("a-directory", file("index.html", which(contains("Index")))),
      file("index.html", which(contains(""))),
    ];

    expect(Project(input).build(), equals, expected);
  },
});

const contains = curry((needle: string, haystack: string): boolean => {
  return haystack.includes(needle);
}, "contains");

function addIndexMdIfMissing(entries: Tree): Tree {
  if (!entries.find((e) => e.type === "file" && e.name === "index.md")) {
    return [...entries, file("index.md", "# Index")];
  }
  return entries;
}
