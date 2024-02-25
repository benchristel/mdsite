import { first } from "../../lib/indexables.js";
const bareArg = String.raw `[a-zA-Z0-9\/\-_\.]+`;
const quotedArg = String.raw `"(?:\\.|[^"\\])*"`;
const arg = String.raw `(?:${bareArg}|${quotedArg})`;
export const macroPattern = String.raw `{{\s*[a-z]+(\s+${arg})*\s*}}`;
export const macros = new RegExp(macroPattern, "g");
export function getTokens(s) {
    return [...s.matchAll(new RegExp(arg, "g"))]
        .map(first)
        .filter(defined)
        .map(unquote);
}
function defined(s) {
    return s !== undefined;
}
function unquote(s) {
    if (s[0] === '"') {
        return JSON.parse(s);
    }
    else {
        return s;
    }
}
