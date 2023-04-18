import { basename, dirname, join } from "path";
import { FileSet, buffer } from "../lib/files";
import { htmlFromMarkdown } from "../lib/markdown";
import { mapEntries, valuesToStrings } from "../lib/objects";
import { removeSuffix } from "../lib/strings";
import { title } from "./title";
import { test, expect, equals } from "@benchristel/taste";
import { trimMargin } from "../testing/formatting";

export type ProjectFileSet = Record<string, ProjectFile>;

export type ProjectFile = OpaqueFile | MarkdownFile | HtmlFile;

export type OpaqueFile = {
  type: "opaque";
  outputPath: string;
  contents: Buffer;
};

export type MarkdownFile = {
  type: "markdown";
  markdown: string;
  rawHtml: string;
  title: string;
  outputPath: string;
};

export type HtmlFile = {
  type: "html";
  rawHtml: string;
  title: string;
  outputPath: string;
};

export function MarkdownFile(path: string, markdown: string): MarkdownFile {
  const rawHtml = replaceMarkdownHrefs(htmlFromMarkdown(markdown).trim());
  const htmlPath = removeSuffix(path, ".md") + ".html";
  return {
    type: "markdown",
    markdown,
    rawHtml,
    title: title(htmlPath, rawHtml),
    outputPath: htmlPath,
  };
}

export function HtmlFile(path: string, rawHtml: string): HtmlFile {
  return {
    type: "html",
    rawHtml,
    title: title(path, rawHtml),
    outputPath: path,
  };
}

export function OpaqueFile(path: string, contents: Buffer): OpaqueFile {
  return {
    type: "opaque",
    outputPath: path,
    contents,
  };
}

export function ProjectFile(path: string, contents: Buffer): ProjectFile {
  if (path.endsWith(".md")) {
    return MarkdownFile(path, contents.toString());
  } else if (path.endsWith(".html")) {
    return HtmlFile(path, contents.toString());
  } else {
    return OpaqueFile(path, contents);
  }
}

export function parseProjectFiles(files: FileSet): ProjectFileSet {
  return mapEntries(addMissingIndexFiles(files), ([srcPath, srcContents]) => {
    const projectFile = ProjectFile(srcPath, srcContents);
    return [projectFile.outputPath, projectFile];
  });
}

function addMissingIndexFiles(files: FileSet): FileSet {
  files = { ...files };
  if (!("/index.md" in files) && !("/index.html" in files)) {
    files["/index.md"] = buffer("# Homepage\n\n{{toc}}");
  }
  const directories: Record<string, true> = {};
  for (let path of Object.keys(files)) {
    if (!(path.endsWith(".html") || path.endsWith(".md"))) {
      continue;
    }
    while (path.length > 1) {
      path = dirname(path);
      directories[path] = true;
    }
  }
  for (const dir in directories) {
    const indexMdPath = join(dir, "index.md");
    const indexHtmlPath = join(dir, "index.html");
    if (!(indexMdPath in files) && !(indexHtmlPath in files)) {
      files[indexMdPath] = buffer("# " + basename(dir) + "\n\n{{toc}}");
    }
  }
  return files;
}

function replaceMarkdownHrefs(html: string): string {
  return html.replace(/(<a[^>]+href="[^"]+\.)md(")/g, "$1html$2");
}

test("replaceMarkdownHrefs", {
  "converts a .md link to a .html link"() {
    expect(
      replaceMarkdownHrefs(`<a href="foo/bar.md">link</a>`),
      equals,
      `<a href="foo/bar.html">link</a>`
    );
  },

  "converts several .md links"() {
    expect(
      replaceMarkdownHrefs(trimMargin`
        <a href="one.md">one</a>
        <a href="two.md">two</a>
      `),
      equals,
      trimMargin`
        <a href="one.html">one</a>
        <a href="two.html">two</a>
      `
    );
  },
});

test("addMissingIndexFiles", {
  "adds an index file to the root directory"() {
    expect(valuesToStrings(addMissingIndexFiles({})), equals, {
      "/index.md": "# Homepage\n\n{{toc}}",
    });
  },

  "leaves existing index.md files alone"() {
    expect(
      valuesToStrings(
        addMissingIndexFiles({
          "/index.md": buffer("hi"),
          "/foo/index.md": buffer("foo"),
        })
      ),
      equals,
      {
        "/index.md": "hi",
        "/foo/index.md": "foo",
      }
    );
  },

  "leaves existing index.html files alone"() {
    expect(
      valuesToStrings(
        addMissingIndexFiles({
          "/index.html": buffer("hi"),
          "/foo/index.html": buffer("foo"),
        })
      ),
      equals,
      {
        "/index.html": "hi",
        "/foo/index.html": "foo",
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
        "/foo/index.md": "# foo\n\n{{toc}}",
        "/foo/bar/baz.md": "hi",
        "/foo/bar/index.md": "# bar\n\n{{toc}}",
      }
    );
  },

  "does not add index files to directories containing only non-htmlable files"() {
    expect(
      valuesToStrings(
        addMissingIndexFiles({
          "/foo/bar.png": buffer(""),
          "/foo/baz/kludge.png": buffer(""),
        })
      ),
      equals,
      {
        "/foo/bar.png": "",
        "/foo/baz/kludge.png": "",
        "/index.md": "# Homepage\n\n{{toc}}",
      }
    );
  },
});
