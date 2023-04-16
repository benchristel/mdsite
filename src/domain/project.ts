import { join } from "path";
import { Tree, file, directory } from "../lib/files";
import { htmlFromMarkdown } from "../lib/markdown";
import { test, expect, equals, which, curry } from "@benchristel/taste";
import { trimMargin } from "../testing/formatting";
import { Project as P, toProjectTree } from "./project-tree";

export interface Project {
  build(): Tree;
}

export function Project(input: Tree): Project {
  return {
    build,
  };

  function build() {
    let projectTree = toProjectTree(input);

    projectTree = addIndexMdIfMissing(projectTree, "/");
    projectTree = P.mapDirectoriesInTree(projectTree, (dir) => {
      return {
        ...dir,
        entries: addIndexMdIfMissing(dir.entries, join(dir.dirname, dir.name)),
      };
    });

    projectTree = P.mapFilesInTree(projectTree, (file) => {
      const name = file.name.replace(/\.md$/, ".html");
      return {
        ...file,
        name,
        contents: defaultTemplateHtml
          .replace("{{markdown}}", htmlFromMarkdown(file.contents).trim())
          .replace("{{title}}", name),
      };
    });

    return projectTree;
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
      P.file(
        "/",
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
      P.file("/", "foo.html", which(contains("Hello, world!"))),
      P.file(
        "/",
        "index.html",
        which(
          contains(trimMargin`
          <h1 id="index-of-">Index of /</h1>
        `)
        )
      ),
    ];

    expect(Project(input).build(), equals, expected);
  },

  "creates an index.html file in a subdirectory that lacks one"() {
    const input: Tree = [directory("a-directory"), file("index.md", "")];

    const expected: Tree = [
      P.directory(
        "/",
        "a-directory",
        P.file(
          "/a-directory",
          "index.html",
          which(contains("Index of /a-directory"))
        )
      ),
      P.file("/", "index.html", which(contains(""))),
    ];

    expect(Project(input).build(), equals, expected);
  },
});

const contains = curry((needle: string, haystack: string): boolean => {
  return haystack.includes(needle);
}, "contains");

function addIndexMdIfMissing(entries: P.Tree, dirname: string): P.Tree {
  if (!entries.find((e) => e.type === "file" && e.name === "index.md")) {
    return [...entries, P.file(dirname, "index.md", "# Index of " + dirname)];
  }
  return entries;
}
