import { basename, dirname, join } from "path";
import { FileSet } from "../lib/files";
import { ensureTrailingSlash } from "../lib/paths";
import { buffer } from "../lib/buffer";
import { mapEntries, valuesToStrings } from "../lib/objects";
import { test, expect, equals } from "@benchristel/taste";
import { EntryOrdering, parse } from "./order";
import { OpaqueFile } from "./opaque-file";
import { HtmlFile, MarkdownFile } from "./html-file";

export type ProjectFileSet = Record<string, ProjectFile>;

export type ProjectFile = OpaqueFile | HtmlFile | OrderFile;

export type OrderFile = {
  type: "order";
  ordering: EntryOrdering;
  outputPath: string;
};

export function OrderFile(
  path: string,
  contents: string,
  files: Array<string>
): OrderFile {
  const dir = ensureTrailingSlash(dirname(path));
  const names = files
    .filter((p) => p.startsWith(dir))
    .map((p) => p.slice(dir.length).replace(/\/.*/, ""));
  return {
    type: "order",
    outputPath: path,
    ordering: parse(contents, new Set(names)),
  };
}

export function ProjectFile(
  path: string,
  contents: Buffer,
  files: FileSet
): ProjectFile {
  if (path.endsWith(".md")) {
    return MarkdownFile(path, contents.toString());
  } else if (path.endsWith(".html")) {
    return HtmlFile(path, contents.toString());
  } else if (path.endsWith("/order.txt")) {
    return OrderFile(path, contents.toString(), Object.keys(files));
  } else {
    return OpaqueFile(path, contents);
  }
}

export function parseProjectFiles(files: FileSet): ProjectFileSet {
  return mapEntries(addMissingIndexFiles(files), ([srcPath, srcContents]) => {
    const projectFile = ProjectFile(srcPath, srcContents, files);
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
