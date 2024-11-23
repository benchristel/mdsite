var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { join, relative, dirname } from "path";
import * as fs from "fs/promises";
export function listDeep(dir, root = dir) {
    return __awaiter(this, void 0, void 0, function* () {
        let fileSet = {};
        const entries = yield fs.readdir(dir, { withFileTypes: true });
        const promises = entries.map((entry) => {
            const path = join(dir, entry.name);
            const pathFromRoot = "/" + relative(root, path);
            if (entry.isFile()) {
                return fs.readFile(path).then((contents) => {
                    fileSet[pathFromRoot] = contents;
                });
            }
            else if (entry.isDirectory()) {
                return listDeep(path, root).then((listing) => {
                    fileSet = Object.assign(Object.assign({}, fileSet), listing);
                });
            }
            else {
                return Promise.resolve();
            }
        });
        yield Promise.all(promises);
        return fileSet;
    });
}
export function writeDeep(dir, fileSet) {
    return __awaiter(this, void 0, void 0, function* () {
        const promises = Object.entries(fileSet).map(([path, contents]) => {
            return fs
                .mkdir(join(dir, dirname(path)), { recursive: true })
                .then(() => fs.writeFile(join(dir, path), contents));
        });
        yield Promise.all(promises);
    });
}
