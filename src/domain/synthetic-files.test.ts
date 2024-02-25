import { buffer } from "../lib/buffer.js";
import { test, expect, equals } from "@benchristel/taste";
import { valuesToStrings } from "../lib/objects.js";
import { addSyntheticFiles } from "./synthetic-files.js";

test("addSyntheticFiles", {
  "adds an index file and an order.txt file to the root directory"() {
    expect(valuesToStrings(addSyntheticFiles({})), equals, {
      "/index.md": "# Homepage\n\n{{toc}}",
      "/order.txt": "",
    });
  },

  "leaves existing index.md files alone"() {
    expect(
      valuesToStrings(
        addSyntheticFiles({
          "/index.md": buffer("hi"),
          "/foo/index.md": buffer("foo"),
          "/order.txt": buffer(""),
          "/foo/order.txt": buffer(""),
        })
      ),
      equals,
      {
        "/index.md": "hi",
        "/foo/index.md": "foo",
        "/order.txt": "",
        "/foo/order.txt": "",
      }
    );
  },

  "leaves existing index.html files alone"() {
    expect(
      valuesToStrings(
        addSyntheticFiles({
          "/index.html": buffer("hi"),
          "/foo/index.html": buffer("foo"),
          "/order.txt": buffer(""),
          "/foo/order.txt": buffer(""),
        })
      ),
      equals,
      {
        "/index.html": "hi",
        "/foo/index.html": "foo",
        "/order.txt": "",
        "/foo/order.txt": "",
      }
    );
  },

  "leaves existing order.txt files alone"() {
    expect(
      valuesToStrings(
        addSyntheticFiles({
          "/index.html": buffer(""),
          "/order.txt": buffer("hi"),
          "/foo/order.txt": buffer("foo"),
        })
      ),
      equals,
      {
        "/index.html": "",
        "/order.txt": "hi",
        "/foo/order.txt": "foo",
      }
    );
  },

  "adds files to subdirectories"() {
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
        "/order.txt": "",
        "/foo/bar.md": "hi",
        "/foo/index.md": "# foo\n\n{{toc}}",
        "/foo/order.txt": "",
        "/foo/bar/baz.md": "hi",
        "/foo/bar/index.md": "# bar\n\n{{toc}}",
        "/foo/bar/order.txt": "",
      }
    );
  },

  "does not add files to directories containing only non-htmlable files"() {
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
        "/order.txt": "",
      }
    );
  },
});
