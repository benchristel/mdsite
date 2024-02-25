import { curry } from "@benchristel/taste";
export function removeSuffix(s, suffix) {
    if (s.endsWith(suffix)) {
        return s.slice(0, s.length - suffix.length);
    }
    else {
        return s;
    }
}
export function removePrefix(s, prefix) {
    if (s.startsWith(prefix)) {
        return s.slice(prefix.length);
    }
    else {
        return s;
    }
}
export const contains = curry((needle, haystack) => {
    return haystack.includes(needle);
}, "contains");
export function line(s) {
    return s + "\n";
}
