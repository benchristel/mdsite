import { FileSet } from "../lib/files";
import { htmlFromMarkdown } from "../lib/markdown";
import { intoObject } from "../lib/objects";
import { test, expect, equals, which } from "@benchristel/taste";
import { trimMargin } from "../testing/formatting";
import { basename, dirname, join, relative } from "path";
import { isAnything } from "../testing/matchers";
import "./toc";
import { htmlToc } from "./toc";
import { contains } from "../lib/strings";
import { title } from "./title";

export function buildProject(files: FileSet): FileSet {
  files = addMissingIndexFiles(files);

  files = Object.entries(files)
    .map(([srcPath, srcContents]) => {
      if (srcPath.endsWith(".md")) {
        const htmlPath = srcPath.replace(/\.md$/, ".html");
        let htmlContents = defaultTemplate.replace(
          "{{markdown}}",
          htmlFromMarkdown(srcContents).trim()
        );
        htmlContents = htmlContents.replace(
          "{{title}}",
          title(htmlPath, htmlContents)
        );

        return [htmlPath, htmlContents] as [string, string];
      } else {
        return [srcPath, srcContents] as [string, string];
      }
    })
    .reduce(intoObject, {});

  files = Object.entries(files)
    .map(([path, contents]) => {
      return [
        path,
        contents.replace("{{toc}}", htmlToc(files, dirname(path))),
      ] as [string, string];
    })
    .reduce(intoObject, {});
  return files;
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
            <title>Hello</title>
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

  "creates a default index.html file with a table of contents"() {
    const input = {
      "/foo.md": "# This Is Foo",
    };

    const expected = {
      "/foo.html": which(contains("This Is Foo")),
      "/index.html": which(contains(`<a href="foo.html">This Is Foo</a>`)),
    };

    expect(buildProject(input), equals, expected);
  },
});

function addMissingIndexFiles(files: FileSet): FileSet {
  files = { ...files };
  if (!("/index.md" in files)) {
    files["/index.md"] = "# Homepage\n\n{{toc}}";
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
      files[indexPath] = "# Index of " + relative("/", dir) + "\n\n{{toc}}";
    }
  }
  return files;
}

test("addMissingIndexFiles", {
  "adds an index file to the root directory"() {
    expect(addMissingIndexFiles({}), equals, {
      "/index.md": "# Homepage\n\n{{toc}}",
    });
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
        "/foo/index.md": "# Index of foo\n\n{{toc}}",
        "/foo/bar/baz.md": "hi",
        "/foo/bar/index.md": "# Index of foo/bar\n\n{{toc}}",
      }
    );
  },
});
