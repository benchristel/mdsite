import { FileSet } from "../lib/files";
import { htmlFromMarkdown } from "../lib/markdown";
import { intoObject } from "../lib/objects";
import { test, expect, equals, which } from "@benchristel/taste";
import { trimMargin } from "../testing/formatting";
import { basename, dirname, join, relative } from "path";
import { isAnything } from "../testing/matchers";
import "./toc";

export function buildProject(files: FileSet): FileSet {
  files = addMissingIndexFiles(files);

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
      "/index.md": "# Hello",
    };

    const expected = {
      "/index.html": trimMargin`
        <!DOCTYPE html>
        <html>
          <head>
            <title>index.html</title>
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
      "/index.html": which(isAnything),
    };

    expect(buildProject(input), equals, expected);
  },
});

function addMissingIndexFiles(files: FileSet): FileSet {
  files = { ...files };
  if (!("/index.md" in files)) {
    files["/index.md"] = "# Homepage";
  }
  const directories = [];
  for (let path of Object.keys(files)) {
    while (path.length > 1) {
      path = dirname(path);
      directories.push(path);
    }
  }
  for (const dir of directories) {
    const indexPath = join(dir, "index.md");
    if (!(indexPath in files)) {
      files[indexPath] = "# Index of " + relative("/", dir);
    }
  }
  return files;
}

test("addMissingIndexFiles", {
  "adds an index file to the root directory"() {
    expect(addMissingIndexFiles({}), equals, { "/index.md": "# Homepage" });
  },

  "leaves an existing index file alone"() {
    expect(addMissingIndexFiles({ "/index.md": "hi" }), equals, {
      "/index.md": "hi",
    });
  },

  "adds index files to subdirectories"() {
    expect(
      addMissingIndexFiles({
        "/index.md": "hi",
        "/foo/bar.md": "hi",
        "/foo/bar/baz.md": "hi",
      }),
      equals,
      {
        "/index.md": "hi",
        "/foo/bar.md": "hi",
        "/foo/index.md": "# Index of foo",
        "/foo/bar/baz.md": "hi",
        "/foo/bar/index.md": "# Index of foo/bar",
      }
    );
  },
});
