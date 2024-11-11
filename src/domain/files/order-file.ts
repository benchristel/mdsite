import { basename, dirname } from "path";
import { not } from "@benchristel/taste";
import { buffer } from "../../lib/buffer.js";
import { ensureTrailingSlash } from "../../lib/paths.js";
import { isBlank } from "../../testing/formatting.js";
import type { ProjectGlobalInfo } from "../project-global-info.js";
import { diff } from "../../lib/sets.js";
import { line } from "../../lib/strings.js";

export type OrderFile = {
  type: "order";
  filenames: Array<string>;
  outputPath: string;
  render: (globalInfo: ProjectGlobalInfo) => [string, Buffer];
};

export class OrderFile2 {
  readonly type = "order";
  // TODO: make outputPath an OutputPath
  readonly outputPath: string;
  readonly filenames: string[];
  private readonly dir: string;
  private readonly specified: string;

  constructor(path: string, contents: string) {
    this.specified = contents.split("!unspecified")[0];
    this.outputPath = path;
    this.filenames = this.specified
      .split("\n")
      .filter(not(isComment))
      .filter(not(isBlank))
      .map((f) => basename(f.replace(/\.md$/, ".html").trim()));
    this.dir = ensureTrailingSlash(dirname(path));
  }

  render(globalInfo: ProjectGlobalInfo): [string, Buffer] {
    const extantEntries = globalInfo.orderedLinkables
      .map((l) => l.path)
      .filter((path) => path.isIn(this.dir))
      .map((p) => p.toString().slice(this.dir.length).replace(/\/.*/, ""));

    const unspecified = diff(new Set(extantEntries), new Set(this.filenames));
    unspecified.delete("index.html");

    return [
      this.outputPath,
      buffer(
        this.specified +
          (unspecified.size
            ? "\n!unspecified\n" + [...unspecified].sort().map(line).join("")
            : "")
      ),
    ];
  }
}

export function OrderFile(path: string, contents: string): OrderFile {
  return new OrderFile2(path, contents);
}

export function isOrderFile(path: string): boolean {
  return basename(path) === "order.txt";
}

function isComment(line: string) {
  return /^\s*(\/\/|#)/.test(line);
}
