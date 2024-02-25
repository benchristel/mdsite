import { OpaqueFile } from "./files/opaque-file.js";
import { HtmlFile } from "./files/html-file.js";
import { OrderFile } from "./files/order-file.js";
import { MarkdownFile } from "./files/markdown-file.js";
export function ProjectFile(path, contents) {
    if (path.endsWith(".md")) {
        return MarkdownFile(path, contents.toString());
    }
    else if (path.endsWith(".html")) {
        return new HtmlFile(path, contents.toString());
    }
    else if (path.endsWith("/order.txt")) {
        return OrderFile(path, contents.toString());
    }
    else {
        return OpaqueFile(path, contents);
    }
}
export function pathAndBufferToProjectFile([srcPath, srcContents]) {
    const projectFile = ProjectFile(srcPath, srcContents);
    return [projectFile.outputPath, projectFile];
}
