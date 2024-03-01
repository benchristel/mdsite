import { basename, dirname } from "path";
import { not } from "@benchristel/taste";
import { buffer } from "../../lib/buffer.js";
import { ensureTrailingSlash } from "../../lib/paths.js";
import { isBlank } from "../../testing/formatting.js";
import { diff } from "../../lib/sets.js";
import { line } from "../../lib/strings.js";
export function OrderFile(path, contents) {
    const dir = ensureTrailingSlash(dirname(path));
    const specified = contents.split("!unspecified")[0];
    const self = {
        type: "order",
        outputPath: path,
        filenames: specified
            .split("\n")
            .filter(not(isComment))
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
            buffer(specified +
                (unspecified.size
                    ? "\n!unspecified\n" + [...unspecified].sort().map(line).join("")
                    : "")),
        ];
    }
}
export function isOrderFile(path) {
    return basename(path) === "order.txt";
}
function isComment(line) {
    return /^\s*(\/\/|#)/.test(line);
}
