import { test, expect, is, curry } from "@benchristel/taste";
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
export function commonPrefix(a, b) {
    const shorter = a.length < b.length ? a : b;
    for (let i = 0; i < shorter.length; i++) {
        if (a[i] !== b[i]) {
            return a.slice(0, i);
        }
    }
    return shorter;
}
test("commonPrefix", {
    "returns empty given empty"() {
        expect(commonPrefix("", ""), is, "");
    },
    "given equal strings"() {
        expect(commonPrefix("foobar", "foobar"), is, "foobar");
    },
    "when A is a prefix of B"() {
        expect(commonPrefix("foo", "foobar"), is, "foo");
    },
    "when B is a prefix of A"() {
        expect(commonPrefix("foobar", "foo"), is, "foo");
    },
    "given strings with no common prefix"() {
        expect(commonPrefix("foobar", "barfoo"), is, "");
    },
    "given strings with a common prefix and different suffix"() {
        expect(commonPrefix("foo/bar", "foo/baz"), is, "foo/ba");
    },
});
