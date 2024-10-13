import { normalize, dirname, basename, relative, join } from "path";
import { isRelative } from "../lib/paths.js";
export class OutputPath {
    constructor(string) {
        this.string = string;
    }
    toString() {
        return this.string;
    }
    is(other) {
        if (typeof other === "string") {
            return other === this.string;
        }
        else {
            return other.is(this.string);
        }
    }
    hasParent() {
        return this.string !== "/index.html";
    }
    isHtml() {
        return this.string.endsWith(".html");
    }
    isIndexHtml() {
        return this.string.endsWith("/index.html");
    }
    basename() {
        return basename(this.string);
    }
    dirname() {
        return dirname(this.string);
    }
    isIn(directory) {
        // TODO: support Windows paths?
        if (!directory.startsWith("/")) {
            return false;
        }
        if (!directory.endsWith("/")) {
            directory = directory + "/";
        }
        return this.string.startsWith(directory);
    }
    parentIndexPath() {
        return OutputPath.of(this.parentPathStr());
    }
    relativePathOf(other) {
        const otherStr = other.toString();
        if (isRelative(otherStr)) {
            return otherStr;
        }
        return relative(this.dirname(), otherStr);
    }
    parentPathStr() {
        let path = this.string;
        if (path === "/index.html") {
            return "/index.html";
        }
        else if (path.endsWith("/index.html")) {
            return join(dirname(dirname(path)), "index.html");
        }
        else {
            return join(dirname(path), "index.html");
        }
    }
    static of(inputPath) {
        return new OutputPath(normalize(inputPath.replace(/\.md$/, ".html")));
    }
}
