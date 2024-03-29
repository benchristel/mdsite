import { test, expect, equals, not } from "@benchristel/taste";
import { getTokens, macros } from "./parser.js";
import { first, isEmpty } from "../../lib/indexables.js";

const findAllMacros = (s: string) => [...s.matchAll(macros)].map(first);

const isAMacro = (s: string) => s.match(macros)?.[0]?.length === s.length;

test("extracting macros", {
  "given empty string"() {
    expect(findAllMacros(""), isEmpty);
  },

  "given a string containing no macros"() {
    expect(findAllMacros("a b c"), isEmpty);
  },

  "does not match an empty pair of double-curlies"() {
    expect("{{}}", not(isAMacro));
  },

  "matches {{toc}}"() {
    expect("{{toc}}", isAMacro);
  },

  "matches any ol' macro name"() {
    expect("{{foobar}}", isAMacro);
  },

  "matches macros embedded in other content"() {
    expect(findAllMacros("{{a}} b {{c}}"), equals, ["{{a}}", "{{c}}"]);
  },

  "matches a macro with whitespace inside the double-curlies"() {
    expect("{{\n  blah\n }}", isAMacro);
  },

  "matches a macro with an argument"() {
    expect("{{foo bar}}", isAMacro);
  },

  "accepts multiple arguments"() {
    expect("{{foo bar baz}}", isAMacro);
  },

  "accepts extra whitespace between arguments"() {
    expect("{{foo\n bar\n baz}}", isAMacro);
  },

  "accepts slashes, dashes, underscores, and periods in bare arguments"() {
    expect("{{foo -a /tmp/bar_baz.txt}}", isAMacro);
  },

  "accepts capital letters and numbers in bare arguments"() {
    expect("{{foo A 9}}", isAMacro);
  },

  "does not accept other special characters in bare arguments"() {
    expect("{{foo &}}", not(isAMacro));
  },

  "accepts special characters in quoted arguments"() {
    expect(String.raw`{{foo "&"}}`, isAMacro);
  },

  "accepts multi-character quoted arguments"() {
    expect(String.raw`{{foo "abc"}}`, isAMacro);
  },

  "accepts empty quoted arguments"() {
    expect(String.raw`{{foo ""}}`, isAMacro);
  },

  "does not accept unpaired quotes"() {
    expect(String.raw`{{foo "}}`, not(isAMacro));
  },

  "accepts escaped quotes inside quotes"() {
    expect(String.raw`{{foo "\""}}`, isAMacro);
  },

  "accepts escaped backslashes inside quotes"() {
    expect(String.raw`{{foo "\\"}}`, isAMacro);
  },

  "accepts an escaped backslash followed by an escaped quote"() {
    expect(String.raw`{{foo "\\\""}}`, isAMacro);
  },

  "does not accept an unterminated quoted arg with an escaped quote"() {
    expect(String.raw`{{foo "\\\"}}`, not(isAMacro));
  },
});

test("tokenizing macros", {
  "extracts the macro name"() {
    expect(getTokens("{{foo}}"), equals, ["foo"]);
  },

  "extracts bare arguments"() {
    expect(getTokens("{{foo bar baz}}"), equals, ["foo", "bar", "baz"]);
  },

  "extracts bare arguments with symbols"() {
    expect(getTokens("{{foo -a /tmp/Bar_baz.txt 9}}"), equals, [
      "foo",
      "-a",
      "/tmp/Bar_baz.txt",
      "9",
    ]);
  },

  "extracts and interprets quoted arguments"() {
    expect(getTokens(String.raw`{{foo "\"hello\""}}`), equals, [
      "foo",
      String.raw`"hello"`,
    ]);
  },
});
