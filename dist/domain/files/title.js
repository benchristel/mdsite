import { basename, dirname } from "path";
import * as cheerio from "cheerio";
import { text } from "cheerio";
export function title(path, html) {
    const $ = cheerio.load(html);
    return text($("h1").slice(0, 1)) || defaultTitle(path);
}
function defaultTitle(path) {
    if (path === "/index.html") {
        return "index.html";
    }
    if (basename(path) === "index.html") {
        return basename(dirname(path));
    }
    return basename(path);
}
