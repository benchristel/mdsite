import { dirname } from "path";
import { buffer } from "../lib/buffer";
import { ensureTrailingSlash } from "../lib/paths";
import { parse } from "./order";
import { ProjectFileSet } from "./project-file-set";

export type OrderFile = {
  type: "order";
  contents: string;
  outputPath: string;
  render: (files: ProjectFileSet) => [string, Buffer];
};

export function OrderFile(path: string, contents: string): OrderFile {
  const dir = ensureTrailingSlash(dirname(path));
  const self: OrderFile = {
    type: "order",
    outputPath: path,
    contents,
    render,
  };
  return self;

  function render(files: ProjectFileSet): [string, Buffer] {
    const names = Object.keys(files)
      .filter((p) => p.startsWith(dir))
      .map((p) => p.slice(dir.length).replace(/\/.*/, ""));
    const ordering = parse(contents, new Set(names));
    return [
      self.outputPath,
      buffer(
        Object.keys(ordering.indexForName).join("\n") +
          (ordering.entriesWithUnspecifiedOrder.length
            ? "\n\n!unspecified\n" +
              ordering.entriesWithUnspecifiedOrder.join("\n")
            : "")
      ),
    ];
  }
}
