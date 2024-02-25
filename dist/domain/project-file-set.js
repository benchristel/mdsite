import { OpaqueFile } from "./opaque-file.js";
import { HtmlFile, MarkdownFile } from "./html-file.js";
import { OrderFile } from "./order-file.js";
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
