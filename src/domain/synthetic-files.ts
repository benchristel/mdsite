import { basename, dirname, join } from "path";
import { buffer } from "../lib/buffer";
import { FileSet } from "../lib/files";
import { test, expect, equals } from "@benchristel/taste";
import { valuesToStrings } from "../lib/objects";

export function addSyntheticFiles(files: FileSet): FileSet {
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

test("addSyntheticFiles", {
  "adds an index file to the root directory"() {
    expect(valuesToStrings(addSyntheticFiles({})), equals, {
      "/index.md": "# Homepage\n\n{{toc}}",
    });
  },

  "leaves existing index.md files alone"() {
    expect(
      valuesToStrings(
        addSyntheticFiles({
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
        addSyntheticFiles({
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
        addSyntheticFiles({
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
        addSyntheticFiles({
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
