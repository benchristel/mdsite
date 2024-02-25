import { mapEntries } from "../lib/objects.js";
import { pathAndBufferToProjectFile } from "./files/project-file-set.js";
import { addSyntheticFiles } from "./synthetic-files.js";
import { ProjectGlobalInfo } from "./project-global-info.js";
export function buildProject(files, template) {
    // Step 1: We create "synthetic files" that aren't in the source tree, but
    // appear in or affect the output. These currently include index.html files,
    // and in the future might include order.txt files as well.
    files = addSyntheticFiles(files);
    // Step 2: Each file figures out what it can about itself using only
    // information local to that file.
    const projectFiles = mapEntries(files, pathAndBufferToProjectFile);
    // Step 3: We synthesize the local information to get global information
    // about the project: e.g. what order the pages go in.
    const globalInfo = ProjectGlobalInfo(projectFiles, template);
    // Step 4: We feed that global information about the project back into each
    // file, enabling it to render its FINAL FORM!
    return mapEntries(projectFiles, ([_, projectFile]) => {
        return projectFile.render(globalInfo);
    });
}
