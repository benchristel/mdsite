var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var _Project_orderedLinkables, _Project_index;
import { mapEntries } from "../lib/objects.js";
import { pathAndBufferToProjectFile, } from "./files/project-file-set.js";
import { addSyntheticFiles } from "./synthetic-files.js";
import { indexLinkables } from "./project-global-info.js";
import { sortHtmlFiles } from "./order.js";
export function buildProject(files, template) {
    return new Project(files, template).build();
}
class Project {
    constructor(files, template) {
        _Project_orderedLinkables.set(this, void 0);
        _Project_index.set(this, void 0);
        this.files = mapEntries(addSyntheticFiles(files), pathAndBufferToProjectFile);
        this.template = template;
    }
    build() {
        return mapEntries(this.files, ([_, projectFile]) => {
            return projectFile.render(this);
        });
    }
    get orderedLinkables() {
        var _a;
        return __classPrivateFieldSet(this, _Project_orderedLinkables, (_a = __classPrivateFieldGet(this, _Project_orderedLinkables, "f")) !== null && _a !== void 0 ? _a : sortHtmlFiles(this.files).map(path => Linkable(this.files[path])), "f");
    }
    get index() {
        var _a;
        return __classPrivateFieldSet(this, _Project_index, (_a = __classPrivateFieldGet(this, _Project_index, "f")) !== null && _a !== void 0 ? _a : indexLinkables(this.orderedLinkables).index, "f");
    }
}
_Project_orderedLinkables = new WeakMap(), _Project_index = new WeakMap();
function Linkable(file) {
    return {
        path: file.outputPath,
        title: file.type === "html" ? file.title : "",
    };
}
