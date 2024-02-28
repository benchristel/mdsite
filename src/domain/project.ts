import { FileSet } from "../lib/files.js";
import { mapEntries } from "../lib/objects.js";
import {
  ProjectFileSet,
  pathAndBufferToProjectFile,
} from "./files/project-file-set.js";
import { addSyntheticFiles } from "./synthetic-files.js";
import { ProjectGlobalInfo } from "./project-global-info.js";

export function buildProject(files: FileSet, template: string): FileSet {
  return new Project(files, template).build();
}

class Project {
  files: ProjectFileSet;
  template: string;

  constructor(files: FileSet, template: string) {
    this.files = mapEntries(
      addSyntheticFiles(files),
      pathAndBufferToProjectFile
    );
    this.template = template;
  }

  build() {
    const globalInfo = ProjectGlobalInfo(this.files, this.template);

    return mapEntries(this.files, ([_, projectFile]) => {
      return projectFile.render(globalInfo);
    });
  }
}
