import * as fs from "fs/promises";
import path from "path";
import { Tree, File, Directory, Entry } from "./files";
import { Dir } from "fs";

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
