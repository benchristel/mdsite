import { FileSet } from "../lib/files.js";
import { mapEntries } from "../lib/objects.js";
import {
  ProjectFile,
  ProjectFileSet,
  pathAndBufferToProjectFile,
} from "./files/project-file-set.js";
import { addSyntheticFiles } from "./synthetic-files.js";
import { Linkable, indexLinkables } from "./project-global-info.js";
import { sortHtmlFiles } from "./order.js";

export function buildProject(files: FileSet, template: string): FileSet {
  return new Project(files, template).build();
}

class Project {
  files: ProjectFileSet;
  template: string;
  #orderedLinkables: Linkable[] | undefined;
  #index: Record<string, number> | undefined;

  constructor(files: FileSet, template: string) {
    this.files = mapEntries(
      addSyntheticFiles(files),
      pathAndBufferToProjectFile
    );
    this.template = template;
  }

  build() {
    return mapEntries(this.files, ([_, projectFile]) => {
      return projectFile.render(this);
    });
  }

  get orderedLinkables(): Linkable[] {
    return (this.#orderedLinkables ??= sortHtmlFiles(this.files).map((path) =>
      Linkable(this.files[path])
    ));
  }

  get index(): Record<string, number> {
    return (this.#index ??= indexLinkables(this.orderedLinkables).index);
  }
}

function Linkable(file: ProjectFile) {
  return {
    path: file.outputPath,
    title: file.type === "html" ? file.title : "",
  };
}
