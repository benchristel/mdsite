var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { buildProject } from "../domain/project.js";
import { listDeep, writeDeep } from "../lib/files.js";
import { parseArgs } from "./args.js";
import { intoObject } from "../lib/objects.js";
import { unreachable } from "../lib/unreachable.js";
import { isOrderFile } from "../domain/order-file.js";
import { readFile } from "fs/promises";
import { defaultTemplate } from "../policy/defaults.js";
export function run(argv) {
    const args = parseArgs(argv);
    switch (args.command) {
        case "build":
            return build(args);
        case "order":
            return order(args);
        default:
            throw unreachable("unexpected command", args);
    }
}
function build(args) {
    return __awaiter(this, void 0, void 0, function* () {
        const { inputDir, outputDir, templateFile } = args;
        const [input, template] = yield Promise.all([
            listDeep(inputDir).catch(() => {
                throw Error(`ERROR: could not read from input directory '${inputDir}'.` +
                    `\nhint: create the '${inputDir}' directory, or specify a different one with -i INPUTDIR`);
            }),
            readFile(templateFile).catch(() => {
                console.warn(`Warning: could not read template file '${templateFile}'. Using the default template.`);
                return defaultTemplate;
            }),
        ]);
        const output = buildProject(input, template.toString());
        yield writeDeep(outputDir, output);
    });
}
function order(args) {
    return __awaiter(this, void 0, void 0, function* () {
        const { inputDir } = args;
        const input = yield listDeep(inputDir);
        const output = buildProject(input, "");
        const orderFiles = Object.entries(output)
            .filter(([path]) => isOrderFile(path))
            .reduce(intoObject, {});
        yield writeDeep(inputDir, orderFiles);
    });
}
