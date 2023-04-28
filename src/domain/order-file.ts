import { basename, dirname } from "path";
import { buffer } from "../lib/buffer";
import { ensureTrailingSlash } from "../lib/paths";
import { test, expect, equals, not } from "@benchristel/taste";
import { isBlank, trimMargin } from "../testing/formatting";
import { ProjectGlobalInfo } from "./project-global-info";
import { diff } from "../lib/sets";
import { line } from "../lib/strings";

export type OrderFile = {
  type: "order";
  filenames: Array<string>;
  outputPath: string;
  render: (globalInfo: ProjectGlobalInfo) => [string, Buffer];
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
      .map((f) => basename(f.replace(/\.md$/, ".html").trim())),
    render,
  };
  return self;

  function render(globalInfo: ProjectGlobalInfo): [string, Buffer] {
    const extantEntries = globalInfo.orderedLinkables
      .map((l) => l.path)
      .filter((path) => path.startsWith(dir))
      .map((p) => p.slice(dir.length).replace(/\/.*/, ""));

    const unspecified = diff(new Set(extantEntries), new Set(self.filenames));
    unspecified.delete("index.html");

    return [
      self.outputPath,
      buffer(
        self.filenames
          .filter((name) => name !== "index.html")
          .map(line)
          .join("") +
          (unspecified.size
            ? "\n!unspecified\n" + [...unspecified].sort().map(line).join("")
            : "")
      ),
    ];
  }
}

export function isOrderFile(path: string): boolean {
  return basename(path) === "order.txt";
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

  "ignores leading/trailing slashes"() {
    const orderFile = OrderFile(
      "",
      trimMargin`
      /a.html
      b/
    `
    );
    expect(orderFile.filenames, equals, ["a.html", "b"]);
  },

  "removes index.html (which has no effect) when rendering"() {
    const orderFile = OrderFile(
      "/order.txt",
      trimMargin`
      a
      index.html
      b
    `
    );
    const globalProjectInfo = {
      index: {},
      template: "",
      orderedLinkables: [
        { path: "/a", title: "" },
        { path: "/b", title: "" },
        { path: "/index.html", title: "" },
      ],
    };
    expect(String(orderFile.render(globalProjectInfo)[1]), equals, "a\nb\n");
  },

  "removes index.md (which has no effect) when rendering"() {
    const orderFile = OrderFile(
      "/order.txt",
      trimMargin`
      a
      index.md
      b
    `
    );
    const globalProjectInfo = {
      index: {},
      template: "",
      orderedLinkables: [
        { path: "/a", title: "" },
        { path: "/b", title: "" },
        { path: "/index.html", title: "" },
      ],
    };
    expect(String(orderFile.render(globalProjectInfo)[1]), equals, "a\nb\n");
  },

  "does not list index.html in the !unspecified section"() {
    const orderFile = OrderFile("/order.txt", "");
    const globalProjectInfo = {
      index: {},
      template: "",
      orderedLinkables: [
        { path: "/a", title: "" },
        { path: "/b", title: "" },
        { path: "/index.html", title: "" },
      ],
    };
    expect(
      String(orderFile.render(globalProjectInfo)[1]),
      equals,
      trimMargin`
      
      !unspecified
      a
      b
      
    `
    );
  },
});

test("isOrderFile", {
  "is true given /order.txt"() {
    expect("/order.txt", isOrderFile);
  },

  "is false given /foo.txt"() {
    expect("/foo.txt", not(isOrderFile));
  },

  "is true given /foo/order.txt"() {
    expect("/foo/order.txt", isOrderFile);
  },

  "is false given /order.html"() {
    expect("/order.html", not(isOrderFile));
  },
});
