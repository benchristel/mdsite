import { curry } from "@benchristel/taste";
export function trimMargin(s) {
    var _a, _b;
    const lns = lines(s.toString());
    if (isBlank(firstOf(lns, "")))
        lns.shift();
    if (isBlank(lastOf(lns, "")))
        lns.pop();
    const initialIndent = (_b = (_a = /^[ \t]*/.exec(firstOf(lns, ""))) === null || _a === void 0 ? void 0 : _a[0]) !== null && _b !== void 0 ? _b : "";
    return lns.map(removePrefix(initialIndent)).join("\n");
}
export function lines(s) {
    return String(s).split(/\r?\n/);
}
export const removePrefix = curry(function removePrefix(prefix, s) {
    const hasPrefix = s.slice(0, prefix.length) === prefix;
    return hasPrefix ? s.slice(prefix.length) : s;
}, "removePrefix");
export const isBlank = curry(function (s) {
    if (!s)
        return true;
    return /^\s*$/.test(s);
}, "isBlank");
function firstOf(a, _default) {
    var _a;
    return (_a = a[0]) !== null && _a !== void 0 ? _a : _default;
}
function lastOf(a, _default) {
    var _a;
    return (_a = a[a.length - 1]) !== null && _a !== void 0 ? _a : _default;
}
