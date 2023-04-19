import { test, expect, equals } from "@benchristel/taste";

export function diff<T>(a: Set<T>, b: Set<T>): Set<T> {
  const ret = new Set<T>();
  for (const member of a) {
    if (!b.has(member)) {
      ret.add(member);
    }
  }
  return ret;
}

function setOf<T>(...elements: Array<T>): Set<T> {
  return new Set(elements);
}

function empty<T>(): Set<T> {
  return setOf();
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
    expect(
      diff(setOf("foo", "bar"), setOf("bar", "baz")),
      equals,
      setOf("foo")
    );
  },
});
