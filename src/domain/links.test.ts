import { test, expect, is } from "@benchristel/taste";
import { parentOf, upLink } from "./links.js";
import { OutputPath } from "./output-path.js";

const of = OutputPath.of;

test("upLink", {
  "given /index.html"() {
    expect(upLink(of("/index.html")), is, `<a href="index.html">Up</a>`);
  },

  "given a subdirectory's index.html"() {
    expect(upLink(of("/foo/index.html")), is, `<a href="../index.html">Up</a>`);
  },

  "given any other path"() {
    expect(upLink(of("/foo.html")), is, `<a href="index.html">Up</a>`);
  },
});

test("parentOf", {
  "given /index.html"() {
    expect(parentOf("/index.html"), is, "/index.html");
  },

  "given /foo/index.html"() {
    expect(parentOf("/foo/index.html"), is, "/index.html");
  },

  "given /foo/bar/index.html"() {
    expect(parentOf("/foo/bar/index.html"), is, "/foo/index.html");
  },

  "given /foo/bar/baz.html"() {
    expect(parentOf("/foo/bar/baz.html"), is, "/foo/bar/index.html");
  },
});
