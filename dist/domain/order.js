import { basename, dirname, join } from "path";
import { ensureTrailingSlash } from "../lib/paths.js";
export function sortEntries(files) {
    return Object.values(files)
        .filter((f) => f.type === "html")
        .map(toEntry)
        .concat(latentEntries(files))
        .map((f) => [f, orderTxtRank({ outputPath: f.path }, files)])
        .sort(([_, rankA], [__, rankB]) => byRank(rankA, rankB))
        .map(([f]) => f);
}
function toEntry(f) {
    return { type: "html", path: f.outputPath, title: f.title };
}
function latentEntries(files) {
    const projectFilePaths = Object.keys(files);
    const orderFiles = Object.values(files).filter((f) => f.type === "order");
    const ret = [];
    for (const { outputPath: orderFilePath, filenames } of orderFiles) {
        for (const filename of filenames) {
            const path = join(dirname(orderFilePath), filename);
            if (isLatent(path, projectFilePaths)) {
                ret.push({ type: "latent-entry", path, title: filename });
            }
        }
    }
    return ret;
}
export function isLatent(path, files) {
    const exists = files.some(f => f === path || f.startsWith(ensureTrailingSlash(path)));
    return !exists;
}
export function sortHtmlFiles(files) {
    return Object.values(files)
        .filter((f) => f.type === "html")
        .map((f) => [f, orderTxtRank(f, files)])
        .sort(([_, rankA], [__, rankB]) => byRank(rankA, rankB))
        .map(([f]) => f.outputPath);
}
export function orderTxtRank(f, files) {
    let d = f.outputPath;
    const rank = [];
    do {
        let filename = basename(d);
        d = dirname(d);
        rank.unshift(
        // index.html files should come before any of their siblings,
        // so we "promote" them to the top.
        indexPromotion(filename), orderFileIndex(d, filename, files), titleForOutputPath(join(d, filename), files), filename);
    } while (d !== "/");
    return rank;
}
function indexPromotion(filename) {
    return filename === "index.html" ? "index" : "not-index";
}
function orderFileIndex(dir, filename, files) {
    const orderFile = files[join(dir, "order.txt")];
    const orderFileIndex = (orderFile === null || orderFile === void 0 ? void 0 : orderFile.type) === "order"
        ? orderFile.filenames.indexOf(filename)
        : Infinity;
    return orderFileIndex < 0 ? Infinity : orderFileIndex;
}
function byRank(rankA, rankB) {
    for (let i = 0; i < rankA.length && i < rankB.length; i++) {
        if (rankA[i] < rankB[i])
            return -1;
        if (rankA[i] > rankB[i])
            return 1;
    }
    return 0;
}
export function titleForOutputPath(path, files) {
    var _a;
    const file = (_a = files[path]) !== null && _a !== void 0 ? _a : files[join(path, "index.html")];
    switch (file === null || file === void 0 ? void 0 : file.type) {
        case "html":
            return file.title;
        default:
            return basename(path);
    }
}
