import { FileSet } from "../lib/files";
import { intoObject } from "../lib/objects";
import { ProjectFileSet, parseProjectFiles } from "./project-file-set";
import { addSyntheticFiles } from "./synthetic-files";

export function buildProject(files: FileSet): FileSet {
  // We create "synthetic files" that aren't in the source tree, but
  // appear in or affect the output. These currently include index.html
  // files, and in the future might include order.txt files as well.
  files = addSyntheticFiles(files);

  const projectFiles: ProjectFileSet = parseProjectFiles(files);

  return Object.entries(projectFiles)
    .map(([_, projectFile]) => {
      return projectFile.render(projectFiles);
    })
    .reduce(intoObject, {});
}
