import { mapEntries } from "../lib/objects.js";
import { pathAndBufferToProjectFile, } from "./files/project-file-set.js";
import { addSyntheticFiles } from "./synthetic-files.js";
import { ProjectGlobalInfo } from "./project-global-info.js";
export function buildProject(files, template) {
    return new Project(files, template).build();
}
class Project {
    constructor(files, template) {
        this.files = mapEntries(addSyntheticFiles(files), pathAndBufferToProjectFile);
        this.template = template;
    }
    build() {
        const globalInfo = ProjectGlobalInfo(this.files, this.template);
        return mapEntries(this.files, ([_, projectFile]) => {
            return projectFile.render(globalInfo);
        });
    }
}
