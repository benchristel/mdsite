import { test, expect, is } from "@benchristel/taste";
import {
  getAllTests,
  runTests,
  formatTestResultsAsText,
} from "@benchristel/taste";

test("taste", {
  "runs a test"() {
    expect(1, is, 1);
  },
});

runTests(getAllTests()).then(formatTestResultsAsText).then(console.log);
