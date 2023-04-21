import { FileSet } from "../lib/files";
import { buffer } from "../lib/buffer";
import { intoObject } from "../lib/objects";
import { ProjectFileSet, parseProjectFiles } from "./project-file-set";
import { unreachable } from "../lib/unreachable";
import { renderOpaqueFile } from "./opaque-file";
import { renderHtmlFile } from "./html-file";

export function buildProject(files: FileSet): FileSet {
  const projectFiles: ProjectFileSet = parseProjectFiles(files);

  return Object.entries(projectFiles)
    .map(([_, projectFile]) => {
      switch (projectFile.type) {
        case "opaque":
          return renderOpaqueFile(projectFile);
        case "html":
          return renderHtmlFile(projectFiles, projectFile);
        case "order":
          return [
            projectFile.outputPath,
            buffer(
              Object.keys(projectFile.ordering.indexForName).join("\n") +
                (projectFile.ordering.entriesWithUnspecifiedOrder.length
                  ? "\n\n!unspecified\n" +
                    projectFile.ordering.entriesWithUnspecifiedOrder.join("\n")
                  : "")
            ),
          ] as [string, Buffer];
        default:
          throw unreachable("unexpected type of project file", projectFile);
      }
    })
    .reduce(intoObject, {});
}
