import { basename, dirname } from "path";
import { buffer } from "../lib/buffer.js";
import { ensureTrailingSlash } from "../lib/paths.js";
import { not } from "@benchristel/taste";
import { isBlank } from "../testing/formatting.js";
import { diff } from "../lib/sets.js";
import { line } from "../lib/strings.js";
export function OrderFile(path, contents) {
    const dir = ensureTrailingSlash(dirname(path));
    const self = {
        type: "order",
        outputPath: path,
        filenames: contents
            .split("!unspecified")[0]
            .split("\n")
            .filter(not(isBlank))
            .map((f) => basename(f.replace(/\.md$/, ".html").trim())),
        render,
    };
    return self;
    function render(globalInfo) {
        const extantEntries = globalInfo.orderedLinkables
            .map((l) => l.path)
            .filter((path) => path.startsWith(dir))
            .map((p) => p.slice(dir.length).replace(/\/.*/, ""));
        const unspecified = diff(new Set(extantEntries), new Set(self.filenames));
        unspecified.delete("index.html");
        return [
            self.outputPath,
            buffer(self.filenames
                .filter((name) => name !== "index.html")
                .map(line)
                .join("") +
                (unspecified.size
                    ? "\n!unspecified\n" + [...unspecified].sort().map(line).join("")
                    : "")),
        ];
    }
}
export function isOrderFile(path) {
    return basename(path) === "order.txt";
}
