import { dirname } from "path";
import { buffer } from "../lib/buffer";
import { ensureTrailingSlash } from "../lib/paths";
import { EntryOrdering, parse } from "./order";
import { ProjectFileSet } from "./project-file-set";

export type OrderFile = {
  type: "order";
  ordering: EntryOrdering;
  outputPath: string;
  render: (files: ProjectFileSet) => [string, Buffer];
};

export function OrderFile(
  path: string,
  contents: string,
  files: Array<string>
): OrderFile {
  const dir = ensureTrailingSlash(dirname(path));
  const names = files
    .filter((p) => p.startsWith(dir))
    .map((p) => p.slice(dir.length).replace(/\/.*/, ""));
  const self: OrderFile = {
    type: "order",
    outputPath: path,
    ordering: parse(contents, new Set(names)),
    render,
  };
  return self;

  function render(): [string, Buffer] {
    return [
      self.outputPath,
      buffer(
        Object.keys(self.ordering.indexForName).join("\n") +
          (self.ordering.entriesWithUnspecifiedOrder.length
            ? "\n\n!unspecified\n" +
              self.ordering.entriesWithUnspecifiedOrder.join("\n")
            : "")
      ),
    ];
  }
}
