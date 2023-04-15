export { readTree, writeTree, mapTree, file, directory } from "./files.impl";
import { readTree, writeTree, mapTree, file, directory } from "./files.impl";
import { expect, test, equals } from "@benchristel/taste";
import { TmpDir } from "../testing/tmp-dir";

{
  readTree satisfies (path: string) => Promise<Tree>;
  writeTree satisfies (path: string, files: Tree) => Promise<void>;
  mapTree satisfies (tree: Tree, fn: (f: File) => File) => Tree;
  file satisfies (name: string, contents: string) => File;
  directory satisfies (name: string, ...entries: Array<Entry>) => Directory;
}

export type Tree = Array<Entry>;

export type Entry = Directory | File;

export type Directory = {
  type: "directory";
  name: string;
  entries: Tree;
};

export type File = {
  type: "file";
  name: string;
  contents: string;
};

test("readTree", {
  async "reads a tree of files"() {
    const tmpDir = TmpDir();
    await tmpDir.write("foo.txt", "this is foo");
    await tmpDir.write("bar/baz.txt", "this is baz");
    expect(await tmpDir.path().then(readTree), equals, [
      directory("bar", file("baz.txt", "this is baz")),
      file("foo.txt", "this is foo"),
    ]);
  },

  async "reads an empty directory"() {
    const tmpDir = TmpDir();
    expect(await tmpDir.path().then(readTree), equals, []);
  },
});

test("writeTree", {
  async "writes a tree of files"() {
    const tmpDir = TmpDir();

    await writeTree(await tmpDir.path(), [
      directory("bar", file("baz.txt", "this is baz")),
      file("foo.txt", "this is foo"),
    ]);

    expect(await tmpDir.ls(), equals, ["bar", "foo.txt"]);
    expect(await tmpDir.read("foo.txt"), equals, "this is foo");
    expect(await tmpDir.read("bar/baz.txt"), equals, "this is baz");
  },

  async "writes an empty tree"() {
    const tmpDir = TmpDir();

    await writeTree(await tmpDir.path(), []);

    expect(await tmpDir.ls(), equals, []);
  },

  async "overwrites existing files"() {
    const tmpDir = TmpDir();
    const path = await tmpDir.path();

    await writeTree(path, [file("foo.txt", "original foo")]);

    await writeTree(path, [file("foo.txt", "changed foo")]);

    expect(await tmpDir.read("foo.txt"), equals, "changed foo");
  },

  async "does not delete existing files"() {
    const tmpDir = TmpDir();
    const path = await tmpDir.path();

    await writeTree(path, [file("foo.txt", "this is foo")]);

    await writeTree(path, [file("bar.txt", "this is bar")]);

    expect(await tmpDir.read("foo.txt"), equals, "this is foo");

    expect(await tmpDir.read("bar.txt"), equals, "this is bar");
  },
});
