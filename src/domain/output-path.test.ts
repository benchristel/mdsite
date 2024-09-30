import { test, expect, is } from "@benchristel/taste";
import { OutputPath } from "./output-path";

test("the OutputPath of an HTML file", {
  "stringifies to the input path"() {
    const path = OutputPath.of("/foo/bar.html");
    expect(path.toString(), is, "/foo/bar.html");
  },

  "removes duplicate slashes"() {
    const path = OutputPath.of("//foo//bar.html");
    expect(path.toString(), is, "/foo/bar.html");
  },

  "computes relative paths"() {
    const path = OutputPath.of("/foo/bar/baz.html");
    expect(path.relativePathOf("/qux.html"), is, "../../qux.html");
    expect(path.relativePathOf("/foo/index.html"), is, "../index.html");
    expect(path.relativePathOf("/foo/bar/index.html"), is, "index.html");
    expect(
      path.relativePathOf("/foo/kludge/index.html"),
      is,
      "../kludge/index.html"
    );
  },

  "does nothing to an already-relative path"() {
    const path = OutputPath.of("/foo/bar/baz.html");
    expect(path.relativePathOf("../index.html"), is, "../index.html");
    expect(path.relativePathOf("index.html"), is, "index.html");
  },
});

test("the OutputPath of a Markdown file", {
  "is HTML"() {
    const path = OutputPath.of("/foo.md");
    expect(path.toString(), is, "/foo.html");
  },
});

test("the OutputPath of a CSS file", {
  "is CSS"() {
    const path = OutputPath.of("/foo.css");
    expect(path.toString(), is, "/foo.css");
  },
});
