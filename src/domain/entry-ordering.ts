import { test, expect, equals, not } from "@benchristel/taste";
import { isBlank, trimMargin } from "../testing/formatting";
import { intoObject } from "../lib/objects";
import { diff } from "../lib/sets";

// An EntryOrdering specifies a partial order of the entries in a directory.
export type EntryOrdering = {
  // A mapping of output filenames (e.g. foo.html) to index numbers
  indexForName: Record<string, number>;
  // The list of entries that exist in this directory, but for which the user
  // did not specify an order in order.txt
  entriesWithUnspecifiedOrder: Array<string>;
};

export function parse(
  orderFile: string,
  sourceFiles: Set<string>
): EntryOrdering {
  const names = orderFile
    .split("\n!unspecified\n")[0]
    .split("\n")
    .filter(not(isBlank))
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

function htmlize(name: string): string {
  return name.replace(/\.md$/, ".html");
}

function markdownize(name: string): string {
  return name.replace(/\.html$/, ".md");
}

test("parse(orderFile)", {
  "handles an empty file"() {
    const input = "";
    const expected = {
      indexForName: {},
      entriesWithUnspecifiedOrder: [],
    };
    expect(parse(input, new Set([])), equals, expected);
  },

  "handles a file with only whitespace"() {
    const input = "\n\n";
    const expected = {
      indexForName: {},
      entriesWithUnspecifiedOrder: [],
    };
    expect(parse(input, new Set([])), equals, expected);
  },

  "parses a one-line file"() {
    const input = "foo.html";
    const expected = {
      indexForName: { "foo.html": 0 },
      entriesWithUnspecifiedOrder: [],
    };
    expect(parse(input, new Set(["foo.html"])), equals, expected);
  },

  "parses a multi-line file"() {
    const input = trimMargin`
      foo.html
      bar.html

      a-directory
    `;
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
    const input = "foo.md";
    const expected = {
      indexForName: {
        "foo.html": 0,
      },
      entriesWithUnspecifiedOrder: [],
    };
    expect(parse(input, new Set(["foo.md"])), equals, expected);
  },

  "ignores names that don't appear in the given set of source files"() {
    const input = "bar.md";
    const expected = {
      indexForName: {},
      entriesWithUnspecifiedOrder: [],
    };
    expect(parse(input, new Set()), equals, expected);
  },

  "accepts .html names whose .md versions appear in the given set of source files"() {
    const input = "foo.html";
    const expected = {
      indexForName: {
        "foo.html": 0,
      },
      entriesWithUnspecifiedOrder: [],
    };
    expect(parse(input, new Set(["foo.md"])), equals, expected);
  },

  "puts any source files that don't appear in the order file in the 'unspecified' section"() {
    const input = "";
    const sourceFiles = new Set(["foo.md", "bar.html"]);
    const expected = {
      indexForName: {},
      entriesWithUnspecifiedOrder: ["foo.md", "bar.html"],
    };
    expect(parse(input, sourceFiles), equals, expected);
  },

  "puts any source files below the !unspecified line in the 'unspecified' section"() {
    const input = trimMargin`
      foo.md
      !unspecified
      bar.md
    `;
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
