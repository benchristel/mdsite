import { dirname } from "path";
import { buffer } from "../lib/buffer";
import { ensureTrailingSlash } from "../lib/paths";
import { EntryOrdering, parse } from "./order";

export type OrderFile = {
  type: "order";
  ordering: EntryOrdering;
  outputPath: string;
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
  return {
    type: "order",
    outputPath: path,
    ordering: parse(contents, new Set(names)),
  };
}

export function renderOrderFile(f: OrderFile): [string, Buffer] {
  return [
    f.outputPath,
    buffer(
      Object.keys(f.ordering.indexForName).join("\n") +
        (f.ordering.entriesWithUnspecifiedOrder.length
          ? "\n\n!unspecified\n" +
            f.ordering.entriesWithUnspecifiedOrder.join("\n")
          : "")
    ),
  ];
}
