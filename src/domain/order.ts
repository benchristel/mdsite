import { test, expect, equals, not } from "@benchristel/taste";
import { intoObject } from "../lib/objects";
import { diff } from "../lib/sets";
import { basename } from "path";

// An EntryOrdering specifies a partial order of the entries in a directory.
export type EntryOrdering = {
  // A mapping of output filenames (e.g. foo.html) to index numbers
  indexForName: Record<string, number>;
  // The list of entries that exist in this directory, but for which the user
  // did not specify an order in order.txt
  entriesWithUnspecifiedOrder: Array<string>;
};

export function parse(
  orderedFiles: Array<string>,
  sourceFiles: Set<string>
): EntryOrdering {
  const names = orderedFiles
    .filter(
      (name) => sourceFiles.has(name) || sourceFiles.has(markdownize(name))
    )
    .map(htmlize);

  const entriesWithUnspecifiedOrder = [
    ...diff(sourceFiles, new Set([...names, ...names.map(markdownize)])),
  ];

  return {
    indexForName: names
      .map((name, i) => [name, i] as [string, number])
      .reduce(intoObject, {}),
    entriesWithUnspecifiedOrder: entriesWithUnspecifiedOrder,
  };
}

export function isOrderFile(path: string): boolean {
  return basename(path) === "order.txt";
}

function htmlize(name: string): string {
  return name.replace(/\.md$/, ".html");
}

function markdownize(name: string): string {
  return name.replace(/\.html$/, ".md");
}

test("parse(orderFile)", {
  "handles an empty set of files"() {
    const input: Array<string> = [];
    const expected = {
      indexForName: {},
      entriesWithUnspecifiedOrder: [],
    };
    expect(parse(input, new Set([])), equals, expected);
  },

  "parses one file"() {
    const input = ["foo.html"];
    const expected = {
      indexForName: { "foo.html": 0 },
      entriesWithUnspecifiedOrder: [],
    };
    expect(parse(input, new Set(["foo.html"])), equals, expected);
  },

  "parses multiple files"() {
    const input = ["foo.html", "bar.html", "a-directory"];
    const expected = {
      indexForName: {
        "foo.html": 0,
        "bar.html": 1,
        "a-directory": 2,
      },
      entriesWithUnspecifiedOrder: [],
    };
    expect(
      parse(input, new Set(["foo.html", "bar.html", "a-directory"])),
      equals,
      expected
    );
  },

  "converts .md extensions to .html"() {
    const input = ["foo.md"];
    const expected = {
      indexForName: {
        "foo.html": 0,
      },
      entriesWithUnspecifiedOrder: [],
    };
    expect(parse(input, new Set(["foo.md"])), equals, expected);
  },

  "ignores names that don't appear in the given set of source files"() {
    const input = ["bar.md"];
    const expected = {
      indexForName: {},
      entriesWithUnspecifiedOrder: [],
    };
    expect(parse(input, new Set()), equals, expected);
  },

  "accepts .html names whose .md versions appear in the given set of source files"() {
    const input = ["foo.html"];
    const expected = {
      indexForName: {
        "foo.html": 0,
      },
      entriesWithUnspecifiedOrder: [],
    };
    expect(parse(input, new Set(["foo.md"])), equals, expected);
  },

  "puts any source files that don't appear in the order file in the 'unspecified' section"() {
    const input: Array<string> = [];
    const sourceFiles = new Set(["foo.md", "bar.html"]);
    const expected = {
      indexForName: {},
      entriesWithUnspecifiedOrder: ["foo.md", "bar.html"],
    };
    expect(parse(input, sourceFiles), equals, expected);
  },

  "puts any unordered source files in the 'unspecified' section"() {
    const input = ["foo.md"];
    const sourceFiles = new Set(["foo.md", "bar.md"]);
    const expected = {
      indexForName: {
        "foo.html": 0,
      },
      entriesWithUnspecifiedOrder: ["bar.md"],
    };
    expect(parse(input, sourceFiles), equals, expected);
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
