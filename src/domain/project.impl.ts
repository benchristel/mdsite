import { FileSet } from "../lib/files";
import { intoObject } from "../lib/objects";
import { ProjectFileSet, parseProjectFiles } from "./project-file-set";
import { unreachable } from "../lib/unreachable";
import { renderOpaqueFile } from "./opaque-file";
import { renderHtmlFile } from "./html-file";
import { renderOrderFile } from "./order-file";

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
          return renderOrderFile(projectFile);
        default:
          throw unreachable("unexpected type of project file", projectFile);
      }
    })
    .reduce(intoObject, {});
}
