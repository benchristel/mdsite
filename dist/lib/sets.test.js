import { test, expect, equals } from "@benchristel/taste";
import { diff } from "./sets.js";
function empty() {
    return setOf();
}
function setOf(...elements) {
    return new Set(elements);
}
test("diff", {
    "empty sets"() {
        expect(diff(empty(), empty()), equals, empty());
    },
    "empty set with nonempty set"() {
        expect(diff(empty(), setOf("foo")), equals, empty());
    },
    "nonempty set with empty set"() {
        expect(diff(setOf("foo"), empty()), equals, setOf("foo"));
    },
    "equal sets"() {
        expect(diff(setOf("foo"), setOf("foo")), equals, empty());
    },
    "unequal sets"() {
        expect(diff(setOf("foo", "bar"), setOf("bar", "baz")), equals, setOf("foo"));
    },
});
