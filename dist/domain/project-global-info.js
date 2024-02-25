import { sortHtmlFiles } from "./order.js";
export const dummyProjectGlobalInfo = {
    orderedLinkables: [],
    index: {},
    template: "dummy template",
};
export function indexLinkables(linkables) {
    const index = {};
    linkables.forEach((linkable, i) => {
        index[linkable.path] = i;
    });
    return {
        orderedLinkables: linkables,
        index,
    };
}
export function ProjectGlobalInfo(files, template) {
    const order = sortHtmlFiles(files);
    return Object.assign(Object.assign({}, indexLinkables(order.map((path) => Linkable(files[path])))), { template });
}
function Linkable(file) {
    return {
        path: file.outputPath,
        title: file.type === "html" ? file.title : "",
    };
}
