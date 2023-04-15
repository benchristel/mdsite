import * as fs from "fs/promises";
import path from "path";
import { expect, test, equals } from "@benchristel/taste";

{
  readTree satisfies (path: string) => Promise<Tree>;
  writeTree satisfies (path: string, files: Tree) => Promise<void>;
  mapTree satisfies (tree: Tree, fn: (f: File) => File) => Tree;
  file satisfies (name: string, contents: string) => File;
  directory satisfies (name: string, ...entries: Array<Entry>) => Directory;
}

export type Tree = Array<Entry>;

type Entry = Directory | File;

type Directory = {
  type: "directory";
  name: string;
  entries: Tree;
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
    expect(await readTree(tmpDir), equals, [
      directory("bar", file("baz.txt", "this is baz")),
      file("foo.txt", "this is foo"),
    ]);
  },
});

test("writeTree", {
  async "writes a tree of files"() {
    const tmpDir = await fs.mkdtemp("/tmp/writeTree");

    await writeTree(tmpDir, [
      directory("bar", file("baz.txt", "this is baz")),
      file("foo.txt", "this is foo"),
    ]);

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
  return fs
    .readdir(path, { withFileTypes: true })
    .then((entries) =>
      Promise.all(
        entries.map((e) => (e.isDirectory() ? readDir : readFile)(path, e.name))
      )
    );
}

export function writeTree(path: string, tree: Tree): Promise<void> {
  return fs
    .mkdir(path, { recursive: true })
    .then(() =>
      Promise.all(
        tree.map((e) =>
          e.type === "directory" ? writeDir(path, e) : writeFile(path, e)
        )
      ).then()
    );
}

export function mapTree(entries: Tree, fn: (f: File) => File): Tree {
  return entries.map((e) => {
    if (e.type === "directory") {
      return mapDirectory(e, fn);
    } else {
      return mapFile(e, fn);
    }
  });
}

export function file(name: string, contents: string): File {
  return { type: "file", name, contents };
}

export function directory(name: string, ...entries: Array<Entry>): Directory {
  return { type: "directory", name, entries };
}

function readDir(parentDirPath: string, name: string): Promise<Directory> {
  return readTree(path.join(parentDirPath, name)).then((entries) =>
    directory(name, ...entries)
  );
}

function readFile(parentDirPath: string, name: string): Promise<File> {
  return fs
    .readFile(path.join(parentDirPath, name))
    .then((contents) => file(name, contents.toString()));
}

function writeDir(parentDirPath: string, directory: Directory): Promise<void> {
  const myPath = path.join(parentDirPath, directory.name);
  return fs.mkdir(myPath).then(() => writeTree(myPath, directory.entries));
}

function writeFile(parentDirPath: string, file: File): Promise<void> {
  const myPath = path.join(parentDirPath, file.name);
  return fs.writeFile(myPath, file.contents);
}

function mapDirectory(directory: Directory, fn: (f: File) => File): Directory {
  return { ...directory, entries: mapTree(directory.entries, fn) };
}

function mapFile(file: File, fn: (f: File) => File): File {
  return fn(file);
}
