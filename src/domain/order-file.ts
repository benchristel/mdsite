import { dirname } from "path";
import { buffer } from "../lib/buffer";
import { ensureTrailingSlash } from "../lib/paths";
import { parse } from "./order";
import { ProjectFileSet } from "./project-file-set";
import { test, expect, equals, not } from "@benchristel/taste";
import { isBlank, trimMargin } from "../testing/formatting";

export type OrderFile = {
  type: "order";
  filenames: Array<string>;
  outputPath: string;
  render: (files: ProjectFileSet) => [string, Buffer];
};

export function OrderFile(path: string, contents: string): OrderFile {
  const dir = ensureTrailingSlash(dirname(path));
  const self: OrderFile = {
    type: "order",
    outputPath: path,
    filenames: contents
      .split("!unspecified")[0]
      .split("\n")
      .filter(not(isBlank))
      .map((f) => f.replace(/\.md$/, ".html").trim()),
    render,
  };
  return self;

  function render(files: ProjectFileSet): [string, Buffer] {
    const names = Object.keys(files)
      .filter((p) => p.startsWith(dir))
      .map((p) => p.slice(dir.length).replace(/\/.*/, ""));
    const ordering = parse(self.filenames, new Set(names));
    return [
      self.outputPath,
      buffer(
        Object.keys(ordering.indexForName).join("\n") +
          (ordering.entriesWithUnspecifiedOrder.length
            ? "\n\n!unspecified\n" +
              ordering.entriesWithUnspecifiedOrder.join("\n")
            : "")
      ),
    ];
  }
}

test("OrderFile", {
  "parses a blank file"() {
    const orderFile = OrderFile("/order.txt", "");
    expect(orderFile.filenames, equals, []);
  },

  "parses a file with one filename"() {
    const orderFile = OrderFile("", "foo.html");
    expect(orderFile.filenames, equals, ["foo.html"]);
  },

  "converts .md filenames to .html"() {
    const orderFile = OrderFile("", "foo.md");
    expect(orderFile.filenames, equals, ["foo.html"]);
  },

  "ignores files below the '!unspecified' line"() {
    const orderFile = OrderFile(
      "",
      trimMargin`
      in.html
      !unspecified
      out.html
    `
    );
    expect(orderFile.filenames, equals, ["in.html"]);
  },

  "handles input that starts with '!unspecified'"() {
    const orderFile = OrderFile(
      "",
      trimMargin`
      !unspecified
      out.html
    `
    );
    expect(orderFile.filenames, equals, []);
  },

  "ignores blank lines"() {
    const orderFile = OrderFile(
      "",
      trimMargin`
      a.html
      
      b.html

    `
    );
    expect(orderFile.filenames, equals, ["a.html", "b.html"]);
  },

  "trims space from each line"() {
    const orderFile = OrderFile("", "  a.html  ");
    expect(orderFile.filenames, equals, ["a.html"]);
  },
});
