import { test, expect, is } from "@benchristel/taste";
import { upLink } from "./links.js";
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
