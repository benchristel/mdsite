import { join, relative, dirname } from "path";
import * as fs from "fs/promises";
import { FileSet } from "./files";

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
    } else if (entry.isDirectory()) {
      return listDeep(path, root).then((listing) => {
        fileSet = { ...fileSet, ...listing };
      });
    } else {
      return Promise.resolve();
    }
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
