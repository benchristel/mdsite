import * as fs from "fs/promises";
import path from "path";
import { expect, test, equals } from "@benchristel/taste";

{
  readTree satisfies (path: string) => Promise<Tree>;
  writeTree satisfies (path: string, files: Tree) => Promise<void>;
  mapTree satisfies (tree: Tree, fn: (f: File) => File) => Tree;
}

type Tree = {
  path: string;
  entries: Array<Entry>;
};

type Entry = Directory | File;

type Directory = {
  type: "directory";
  name: string;
  entries: Array<Entry>;
};

type File = {
  type: "file";
  name: string;
  contents: string;
};

test("readTree", {
  async "reads a tree of files"() {
    const tmpDir = await fs.mkdtemp("/tmp/readTree");
    await fs.writeFile(path.join(tmpDir, "foo.txt"), "this is foo");
    await fs.mkdir(path.join(tmpDir, "bar"));
    await fs.writeFile(path.join(tmpDir, "bar", "baz.txt"), "this is baz");
    expect(await readTree(tmpDir), equals, {
      path: tmpDir,
      entries: [
        {
          type: "directory",
          name: "bar",
          entries: [{ type: "file", name: "baz.txt", contents: "this is baz" }],
        },
        { type: "file", name: "foo.txt", contents: "this is foo" },
      ],
    });
  },
});

test("writeTree", {
  async "writes a tree of files"() {
    const tmpDir = await fs.mkdtemp("/tmp/writeTree");

    await writeTree(tmpDir, {
      path: "",
      entries: [
        {
          type: "directory",
          name: "bar",
          entries: [{ type: "file", name: "baz.txt", contents: "this is baz" }],
        },
        { type: "file", name: "foo.txt", contents: "this is foo" },
      ],
    });

    expect(
      (await fs.readFile(path.join(tmpDir, "foo.txt"))).toString(),
      equals,
      "this is foo"
    );
    expect(
      (await fs.readFile(path.join(tmpDir, "bar", "baz.txt"))).toString(),
      equals,
      "this is baz"
    );
  },
});

export function readTree(path: string): Promise<Tree> {
  return readEntries(path).then((entries) => ({ path, entries }));
}

export function writeTree(path: string, tree: Tree): Promise<void> {
  return writeEntries(path, tree.entries);
}

export function mapTree(input: Tree, fn: (f: File) => File): Tree {
  return { ...input, entries: mapEntries(input.entries, fn) };
}

function readEntries(path: string): Promise<Array<Entry>> {
  return fs
    .readdir(path, { withFileTypes: true })
    .then((entries) =>
      Promise.all(
        entries.map((e) => (e.isDirectory() ? readDir : readFile)(path, e.name))
      )
    );
}

function readDir(parentDirPath: string, name: string): Promise<Directory> {
  return readEntries(path.join(parentDirPath, name)).then((entries) => ({
    type: "directory",
    name,
    entries,
  }));
}

function readFile(parentDirPath: string, name: string): Promise<File> {
  return fs.readFile(path.join(parentDirPath, name)).then((contents) => ({
    type: "file",
    name,
    contents: contents.toString(),
  }));
}

function writeEntries(path: string, entries: Array<Entry>): Promise<void> {
  return fs
    .mkdir(path, { recursive: true })
    .then(() =>
      Promise.all(
        entries.map((e) =>
          e.type === "directory" ? writeDir(path, e) : writeFile(path, e)
        )
      ).then()
    );
}

function writeDir(parentDirPath: string, directory: Directory): Promise<void> {
  const myPath = path.join(parentDirPath, directory.name);
  return fs.mkdir(myPath).then(() => writeEntries(myPath, directory.entries));
}

function writeFile(parentDirPath: string, file: File): Promise<void> {
  const myPath = path.join(parentDirPath, file.name);
  return fs.writeFile(myPath, file.contents);
}

function mapEntries(
  entries: Array<Entry>,
  fn: (f: File) => File
): Array<Entry> {
  return entries.map((e) => {
    if (e.type === "directory") {
      return mapDirectory(e, fn);
    } else {
      return mapFile(e, fn);
    }
  });
}

function mapDirectory(directory: Directory, fn: (f: File) => File): Directory {
  return { ...directory, entries: mapEntries(directory.entries, fn) };
}

function mapFile(file: File, fn: (f: File) => File): File {
  return fn(file);
}
