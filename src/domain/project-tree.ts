import { test, expect, equals } from "@benchristel/taste";
import { Tree, Entry, file, directory } from "../lib/files";
import { join } from "path";

export namespace Project {
  export type Tree = Array<Entry>;
  export type Entry = File | Directory;
  export type File = {
    type: "file";
    name: string;
    dirname: string;
    contents: string;
  };

  export type Directory = {
    type: "directory";
    name: string;
    dirname: string;
    entries: Tree;
  };

  export function file(dirname: string, name: string, contents: string): File {
    return {
      type: "file",
      name,
      dirname,
      contents,
    };
  }

  export function directory(
    dirname: string,
    name: string,
    ...entries: Array<Entry>
  ): Directory {
    return {
      type: "directory",
      name,
      dirname,
      entries,
    };
  }

  export function mapFilesInTree(entries: Tree, fn: (f: File) => File): Tree {
    return entries.map((e) => {
      if (e.type === "directory") {
        return mapDirectory(e, fn);
      } else {
        return mapFile(e, fn);
      }
    });
  }

  export function mapDirectoriesInTree(
    entries: Tree,
    fn: (f: Directory) => Directory
  ): Tree {
    return entries.map((e) => {
      if (e.type === "directory") {
        return fn({ ...e, entries: mapDirectoriesInTree(e.entries, fn) });
      } else {
        return e;
      }
    });
  }

  function mapDirectory(
    directory: Directory,
    fn: (f: File) => File
  ): Directory {
    return { ...directory, entries: mapFilesInTree(directory.entries, fn) };
  }

  function mapFile(file: File, fn: (f: File) => File): File {
    return fn(file);
  }
}

export function toProjectTree(raw: Tree): Project.Tree {
  const dirname = "/";
  const addDirname =
    (dirname: string) =>
    (e: Entry): Project.Entry => {
      if (e.type === "directory") {
        return {
          ...e,
          entries: e.entries.map(addDirname(join(dirname, e.name))),
          dirname,
        };
      } else {
        return { ...e, dirname };
      }
    };
  return raw.map(addDirname(dirname));
}

test("toProjectTree", {
  "does nothing to an empty list of entries"() {
    expect(toProjectTree([]), equals, []);
  },

  "associates a file at the top level with the dirname '/'"() {
    expect(toProjectTree([file("index.md", "")]), equals, [
      { type: "file", name: "index.md", dirname: "/", contents: "" },
    ]);
  },

  "adds a dirname to a file in a directory"() {
    const result = toProjectTree([directory("foo", file("index.md", ""))]);
    expect(result, equals, [
      {
        type: "directory",
        name: "foo",
        dirname: "/",
        entries: [
          { type: "file", name: "index.md", dirname: "/foo", contents: "" },
        ],
      },
    ]);
  },

  "adds a dirname to a directory in a directory"() {
    const result = toProjectTree([directory("foo", directory("bar"))]);
    expect(result, equals, [
      {
        type: "directory",
        name: "foo",
        dirname: "/",
        entries: [
          { type: "directory", name: "bar", dirname: "/foo", entries: [] },
        ],
      },
    ]);
  },
});
