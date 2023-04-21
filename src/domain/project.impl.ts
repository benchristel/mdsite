import { FileSet } from "../lib/files";
import { intoObject } from "../lib/objects";
import { ProjectFileSet, parseProjectFiles } from "./project-file-set";

export function buildProject(files: FileSet): FileSet {
  const projectFiles: ProjectFileSet = parseProjectFiles(files);

  return Object.entries(projectFiles)
    .map(([_, projectFile]) => {
      return projectFile.render(projectFiles);
    })
    .reduce(intoObject, {});
}
