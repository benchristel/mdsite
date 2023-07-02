var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as fs from "fs/promises";
import { join, dirname } from "path";
export function TmpDir() {
    let _tmp;
    function tmp() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!_tmp) {
                _tmp = yield fs.mkdtemp("/tmp/test-");
            }
            return _tmp;
        });
    }
    return {
        read,
        write,
        ls,
        path: tmp,
    };
    function read(path) {
        return tmp()
            .then((tmp) => fs.readFile(join(tmp, path)))
            .then((bytes) => bytes.toString());
    }
    function write(path, contents) {
        return tmp()
            .then((tmp) => (fs.mkdir(join(tmp, dirname(path)), { recursive: true }), tmp))
            .then((tmp) => fs.writeFile(join(tmp, path), contents));
    }
    function ls() {
        return tmp().then((tmp) => fs.readdir(tmp));
    }
}
