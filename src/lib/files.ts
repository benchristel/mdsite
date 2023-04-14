import * as fs from "fs/promises";
import path from "path";
import { expect, test, equals } from "@benchristel/taste";

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
  async "reads a tree"() {
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

export function readTree(path: string): Promise<Tree> {
  return readEntries(path).then((entries) => ({ path, entries }));
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
  return fs
    .readFile(path.join(parentDirPath, name))
    .then((contents) => ({
      type: "file",
      name,
      contents: contents.toString(),
    }));
}
