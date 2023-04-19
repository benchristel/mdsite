import { TmpDir } from "../testing/tmp-dir";
import { test, expect, equals, is } from "@benchristel/taste";
import { join, relative, dirname } from "path";
import * as fs from "fs/promises";
import { valuesToStrings } from "./objects";

export type FileSet = Record<string, Buffer>;

export async function listDeep(
  dir: string,
  root: string = dir
): Promise<FileSet> {
  let fileSet: FileSet = {};
  const entries = await fs.readdir(dir, { withFileTypes: true });

  const promises: Array<Promise<unknown>> = entries.map((entry) => {
    const path = join(dir, entry.name);
    const pathFromRoot = "/" + relative(root, path);

    if (entry.isFile()) {
      return fs.readFile(path).then((contents) => {
        fileSet[pathFromRoot] = contents;
      });
    }

    if (entry.isDirectory()) {
      return listDeep(path, root).then((listing) => {
        fileSet = { ...fileSet, ...listing };
      });
    }

    return Promise.resolve();
  });

  await Promise.all(promises);
  return fileSet;
}

export async function writeDeep(dir: string, fileSet: FileSet): Promise<void> {
  const promises = Object.entries(fileSet).map(([path, contents]) => {
    return fs
      .mkdir(join(dir, dirname(path)), { recursive: true })
      .then(() => fs.writeFile(join(dir, path), contents));
  });
  await Promise.all(promises);
}

export function ensureTrailingSlash(path: string): string {
  if (!path.endsWith("/")) return path + "/";
  else return path;
}

test("listDeep", {
  async "on an empty directory"() {
    const tmpDir = TmpDir();

    const listing = await tmpDir.path().then(listDeep);
    expect(listing, equals, {});
  },

  async "on a dirctory with one file"() {
    const tmpDir = TmpDir();
    await tmpDir.write("/foo.txt", "Hello");

    const listing = await tmpDir.path().then(listDeep).then(valuesToStrings);
    expect(listing, equals, {
      "/foo.txt": "Hello",
    });
  },

  async "on multiple files"() {
    const tmpDir = TmpDir();
    await tmpDir.write("/foo.txt", "this is foo");
    await tmpDir.write("/bar.txt", "this is bar");
    await tmpDir.write("/baz.txt", "this is baz");

    const listing = await tmpDir.path().then(listDeep).then(valuesToStrings);
    expect(listing, equals, {
      "/foo.txt": "this is foo",
      "/bar.txt": "this is bar",
      "/baz.txt": "this is baz",
    });
  },

  async "on subdirectories"() {
    const tmpDir = TmpDir();
    await tmpDir.write("/foo/one.txt", "1");
    await tmpDir.write("/bar/baz/two.txt", "2");
    await tmpDir.write("/three.txt", "3");

    const listing = await tmpDir.path().then(listDeep).then(valuesToStrings);
    expect(listing, equals, {
      "/foo/one.txt": "1",
      "/bar/baz/two.txt": "2",
      "/three.txt": "3",
    });
  },

  async "on subdirectories with multiple files"() {
    const tmpDir = TmpDir();
    await tmpDir.write("/food/recipes/chili.txt", "chili");
    await tmpDir.write("/food/recipes/lentils.txt", "lentils");
    await tmpDir.write("/food/index.txt", "food index");
    await tmpDir.write("/food/restaurants/darbar.txt", "darbar");
    await tmpDir.write("/food/restaurants/da.txt", "da");
    await tmpDir.write("/index.txt", "top index");

    const listing = await tmpDir.path().then(listDeep).then(valuesToStrings);
    expect(listing, equals, {
      "/food/recipes/chili.txt": "chili",
      "/food/recipes/lentils.txt": "lentils",
      "/food/index.txt": "food index",
      "/food/restaurants/da.txt": "da",
      "/food/restaurants/darbar.txt": "darbar",
      "/index.txt": "top index",
    });
  },
});

test("writeDeep", {
  async "writes a fileset to disk"() {
    const fileSet = {
      "/food/recipes/chili.txt": buffer("chili"),
      "/food/recipes/lentils.txt": buffer("lentils"),
      "/food/index.txt": buffer("food index"),
      "/index.txt": buffer("top index"),
    };
    const tmpDir = TmpDir();
    const path = await tmpDir.path();

    await writeDeep(path, fileSet);

    expect(await tmpDir.read("index.txt"), is, "top index");
    expect(await tmpDir.read("food/index.txt"), is, "food index");
    expect(await tmpDir.read("food/recipes/chili.txt"), is, "chili");
    expect(await tmpDir.read("food/recipes/lentils.txt"), is, "lentils");
  },
});

export function buffer(s: string): Buffer {
  return Buffer.from(s, "utf8");
}
