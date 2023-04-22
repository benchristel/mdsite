import { FileSet } from "../lib/files";
import { mapEntries } from "../lib/objects";
import { pathAndBufferToProjectFile } from "./project-file-set";
import { addSyntheticFiles } from "./synthetic-files";

export function buildProject(files: FileSet): FileSet {
  // Step 1: We create "synthetic files" that aren't in the source tree, but
  // appear in or affect the output. These currently include index.html files,
  // and in the future might include order.txt files as well.
  files = addSyntheticFiles(files);

  // Step 2: Each file figures out what it can about itself using only
  // information local to that file.
  const projectFiles = mapEntries(files, pathAndBufferToProjectFile);

  // Step 3: We feed global information about the project back into each file,
  // enabling it to render its FINAL FORM!
  return mapEntries(projectFiles, ([_, projectFile]) => {
    return projectFile.render(projectFiles);
  });
}
