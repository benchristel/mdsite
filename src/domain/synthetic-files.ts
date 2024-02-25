import { dirname, join } from "path";
import { buffer } from "../lib/buffer.js";
import { FileSet } from "../lib/files.js";
import { defaultIndexMdContent } from "../policy/defaults.js";

export function addSyntheticFiles(files: FileSet): FileSet {
  files = { ...files };
  const directories: Record<string, true> = { "/": true };
  for (let path of Object.keys(files)) {
    if (!(path.endsWith(".html") || path.endsWith(".md"))) {
      continue;
    }
    while (path.length > 1) {
      path = dirname(path);
      directories[path] = true;
    }
  }
  for (const dir in directories) {
    const indexMdPath = join(dir, "index.md");
    const indexHtmlPath = join(dir, "index.html");
    const orderTxtPath = join(dir, "order.txt");
    if (!(indexMdPath in files) && !(indexHtmlPath in files)) {
      files[indexMdPath] = buffer(defaultIndexMdContent(dir));
    }
    if (!(orderTxtPath in files)) {
      files[orderTxtPath] = buffer("");
    }
  }
  return files;
}
