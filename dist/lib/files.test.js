var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { test, expect, equals, is } from "@benchristel/taste";
import { listDeep, writeDeep } from "./files.js";
import { TmpDir } from "../testing/tmp-dir.js";
import { valuesToStrings } from "./objects.js";
import { buffer } from "./buffer.js";
test("listDeep", {
    "on an empty directory"() {
        return __awaiter(this, void 0, void 0, function* () {
            const tmpDir = TmpDir();
            const listing = yield tmpDir.path().then(listDeep);
            expect(listing, equals, {});
        });
    },
    "on a dirctory with one file"() {
        return __awaiter(this, void 0, void 0, function* () {
            const tmpDir = TmpDir();
            yield tmpDir.write("/foo.txt", "Hello");
            const listing = yield tmpDir.path().then(listDeep).then(valuesToStrings);
            expect(listing, equals, {
                "/foo.txt": "Hello",
            });
        });
    },
    "on multiple files"() {
        return __awaiter(this, void 0, void 0, function* () {
            const tmpDir = TmpDir();
            yield tmpDir.write("/foo.txt", "this is foo");
            yield tmpDir.write("/bar.txt", "this is bar");
            yield tmpDir.write("/baz.txt", "this is baz");
            const listing = yield tmpDir.path().then(listDeep).then(valuesToStrings);
            expect(listing, equals, {
                "/foo.txt": "this is foo",
                "/bar.txt": "this is bar",
                "/baz.txt": "this is baz",
            });
        });
    },
    "on subdirectories"() {
        return __awaiter(this, void 0, void 0, function* () {
            const tmpDir = TmpDir();
            yield tmpDir.write("/foo/one.txt", "1");
            yield tmpDir.write("/bar/baz/two.txt", "2");
            yield tmpDir.write("/three.txt", "3");
            const listing = yield tmpDir.path().then(listDeep).then(valuesToStrings);
            expect(listing, equals, {
                "/foo/one.txt": "1",
                "/bar/baz/two.txt": "2",
                "/three.txt": "3",
            });
        });
    },
    "on subdirectories with multiple files"() {
        return __awaiter(this, void 0, void 0, function* () {
            const tmpDir = TmpDir();
            yield tmpDir.write("/food/recipes/chili.txt", "chili");
            yield tmpDir.write("/food/recipes/lentils.txt", "lentils");
            yield tmpDir.write("/food/index.txt", "food index");
            yield tmpDir.write("/food/restaurants/darbar.txt", "darbar");
            yield tmpDir.write("/food/restaurants/da.txt", "da");
            yield tmpDir.write("/index.txt", "top index");
            const listing = yield tmpDir.path().then(listDeep).then(valuesToStrings);
            expect(listing, equals, {
                "/food/recipes/chili.txt": "chili",
                "/food/recipes/lentils.txt": "lentils",
                "/food/index.txt": "food index",
                "/food/restaurants/da.txt": "da",
                "/food/restaurants/darbar.txt": "darbar",
                "/index.txt": "top index",
            });
        });
    },
});
test("writeDeep", {
    "writes a fileset to disk"() {
        return __awaiter(this, void 0, void 0, function* () {
            const fileSet = {
                "/food/recipes/chili.txt": buffer("chili"),
                "/food/recipes/lentils.txt": buffer("lentils"),
                "/food/index.txt": buffer("food index"),
                "/index.txt": buffer("top index"),
            };
            const tmpDir = TmpDir();
            const path = yield tmpDir.path();
            yield writeDeep(path, fileSet);
            expect(yield tmpDir.read("index.txt"), is, "top index");
            expect(yield tmpDir.read("food/index.txt"), is, "food index");
            expect(yield tmpDir.read("food/recipes/chili.txt"), is, "chili");
            expect(yield tmpDir.read("food/recipes/lentils.txt"), is, "lentils");
        });
    },
});
