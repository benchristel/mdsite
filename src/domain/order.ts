import { ProjectFileSet } from "./files/project-file-set.js";
import { TemplatizedHtmlFile } from "./files/templatized-html-file.js";
import { basename, dirname, join } from "path";
import { ensureTrailingSlash } from "../lib/paths.js";
import { OrderFile } from "./files/order-file.js";
import { OutputPath } from "./output-path.js";

type Rank = Array<string | number>;

export function sortEntries(files: ProjectFileSet): Array<Entry> {
  return Object.values(files)
    .filter((f): f is TemplatizedHtmlFile => f.type === "html")
    .map(toEntry)
    .concat(latentEntries(files))
    .map((f) => [f, orderTxtRank({ outputPath: f.path }, files)] as const)
    .sort(([_, rankA], [__, rankB]) => byRank(rankA, rankB))
    .map(([f]) => f);
}

function toEntry(f: TemplatizedHtmlFile): Entry {
  return { type: "html", path: f.outputPath, title: f.title };
}

function latentEntries(files: ProjectFileSet): Array<Entry> {
  const projectFilePaths = Object.keys(files);
  const orderFiles = Object.values(files).filter(
    (f): f is OrderFile => f.type === "order"
  );
  const ret: Array<Entry> = [];
  for (const { outputPath: orderFilePath, filenames } of orderFiles) {
    for (const filename of filenames) {
      const path = join(dirname(orderFilePath), filename);
      if (isLatent(path, projectFilePaths)) {
        ret.push({
          type: "latent-entry",
          path: OutputPath.of(path),
          title: filename,
        });
      }
    }
  }

  return ret;
}

export function isLatent(path: string, files: string[]): boolean {
  const exists = files.some(
    (f) => f === path || f.startsWith(ensureTrailingSlash(path))
  );
  return !exists;
}

export type Entry = {
  type: "html" | "latent-entry";
  path: OutputPath;
  title: string;
};

export function sortHtmlFiles(files: ProjectFileSet): Array<OutputPath> {
  return Object.values(files)
    .filter((f): f is TemplatizedHtmlFile => f.type === "html")
    .map((f) => [f, orderTxtRank(f, files)] as const)
    .sort(([_, rankA], [__, rankB]) => byRank(rankA, rankB))
    .map(([f]) => f.outputPath);
}

export function orderTxtRank(
  f: { outputPath: OutputPath },
  files: ProjectFileSet
): Rank {
  let d = f.outputPath.toString();

  const rank: Rank = [];
  do {
    let filename = basename(d);
    d = dirname(d);

    rank.unshift(
      // index.html files should come before any of their siblings,
      // so we "promote" them to the top.
      indexPromotion(filename),
      orderFileIndex(d, filename, files),
      titleForOutputPath(join(d, filename), files),
      filename
    );
  } while (d !== "/");

  return rank;
}

function indexPromotion(filename: string): "index" | "not-index" {
  return filename === "index.html" ? "index" : "not-index";
}

function orderFileIndex(dir: string, filename: string, files: ProjectFileSet) {
  const orderFile = files[join(dir, "order.txt")];
  const orderFileIndex =
    orderFile?.type === "order"
      ? orderFile.filenames.indexOf(filename)
      : Infinity;

  return orderFileIndex < 0 ? Infinity : orderFileIndex;
}

function byRank(rankA: Rank, rankB: Rank): -1 | 0 | 1 {
  for (let i = 0; i < rankA.length && i < rankB.length; i++) {
    if (rankA[i] < rankB[i]) return -1;
    if (rankA[i] > rankB[i]) return 1;
  }
  return 0;
}

export function titleForOutputPath(
  path: string,
  files: ProjectFileSet
): string {
  const file = files[path] ?? files[join(path, "index.html")];
  switch (file?.type) {
    case "html":
      return file.title;
    default:
      return basename(path);
  }
}
