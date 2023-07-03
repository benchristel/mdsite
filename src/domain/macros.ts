import { test, expect, equals } from "@benchristel/taste";
import { first, isEmpty } from "../lib/indexables";

const macros = /{{\s*[a-z]+(\s+([a-zA-Z0-9\/\-_\.]+|"(\\.|[^"\\])*"))*\s*}}/g;

const findAllMacros = (s: string) => [...s.matchAll(macros)].map(first);

test("extracting macros", {
  "given empty string"() {
    expect(findAllMacros(""), isEmpty);
  },

  "given a string containing no macros"() {
    expect(findAllMacros("a b c"), isEmpty);
  },

  "does not match an empty pair of double-curlies"() {
    expect(findAllMacros("{{}}"), isEmpty);
  },

  "matches {{toc}}"() {
    expect(findAllMacros("{{toc}}"), equals, ["{{toc}}"]);
  },

  "matches any ol' macro name"() {
    expect(findAllMacros("{{foobar}}"), equals, ["{{foobar}}"]);
  },

  "matches macros embedded in other content"() {
    expect(findAllMacros("{{a}} b {{c}}"), equals, ["{{a}}", "{{c}}"]);
  },

  "matches a macro with whitespace inside the double-curlies"() {
    expect(findAllMacros("{{\n  blah\n }}"), equals, ["{{\n  blah\n }}"]);
  },

  "matches a macro with an argument"() {
    expect(findAllMacros("{{foo bar}}"), equals, ["{{foo bar}}"]);
  },

  "accepts multiple arguments"() {
    expect(findAllMacros("{{foo bar baz}}"), equals, ["{{foo bar baz}}"]);
  },

  "accepts extra whitespace between arguments"() {
    expect(findAllMacros("{{foo\n bar\n baz}}"), equals, [
      "{{foo\n bar\n baz}}",
    ]);
  },

  "accepts slashes, dashes, underscores, and periods in bare arguments"() {
    expect(findAllMacros("{{foo -a /tmp/bar_baz.txt}}"), equals, [
      "{{foo -a /tmp/bar_baz.txt}}",
    ]);
  },

  "accepts capital letters and numbers in bare arguments"() {
    expect(findAllMacros("{{foo A 9}}"), equals, ["{{foo A 9}}"]);
  },

  "does not accept other special characters in bare arguments"() {
    expect(findAllMacros("{{foo &}}"), isEmpty);
  },

  "accepts special characters in quoted arguments"() {
    expect(findAllMacros(String.raw`{{foo "&"}}`), equals, [
      String.raw`{{foo "&"}}`,
    ]);
  },

  "accepts multi-character quoted arguments"() {
    expect(findAllMacros(String.raw`{{foo "abc"}}`), equals, [
      String.raw`{{foo "abc"}}`,
    ]);
  },

  "accepts empty quoted arguments"() {
    expect(findAllMacros(String.raw`{{foo ""}}`), equals, [
      String.raw`{{foo ""}}`,
    ]);
  },

  "does not accept unpaired quotes"() {
    expect(findAllMacros(String.raw`{{foo "}}`), isEmpty);
  },

  "accepts escaped quotes inside quotes"() {
    expect(findAllMacros(String.raw`{{foo "\""}}`), equals, [
      String.raw`{{foo "\""}}`,
    ]);
  },

  "accepts escaped backslashes inside quotes"() {
    expect(findAllMacros(String.raw`{{foo "\\"}}`), equals, [
      String.raw`{{foo "\\"}}`,
    ]);
  },

  "accepts an escaped backslash followed by an escaped quote"() {
    expect(findAllMacros(String.raw`{{foo "\\\""}}`), equals, [
      String.raw`{{foo "\\\""}}`,
    ]);
  },

  "does not accept an unterminated quoted arg with an escaped quote"() {
    expect(findAllMacros(String.raw`{{foo "\\\"}}`), isEmpty);
  },
});
