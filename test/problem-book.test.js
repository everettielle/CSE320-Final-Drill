import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { parseProblemBook, toPublicExam } from "../lib/problem-book.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const markdown = fs.readFileSync(
  path.join(__dirname, "..", "data", "CSE320_Practice_Problem_Book.md"),
  "utf8",
);

test("parses all lectures, problems, and reference answers", () => {
  const book = parseProblemBook(markdown);

  assert.equal(book.lectures.length, 17);
  assert.equal(book.questions.length, 34);
  assert.equal(book.questions[0].id, "P1.1");
  assert.match(book.questions[0].referenceAnswer, /ISA/);
  assert.equal(book.questions.at(-1).id, "P17.2");
});

test("does not expose reference answers in the public exam payload", () => {
  const publicExam = toPublicExam(parseProblemBook(markdown));

  assert.equal("referenceAnswer" in publicExam.questions[0], false);
  assert.equal("questionMarkdown" in publicExam.questions[0], false);
  assert.match(publicExam.questions[0].questionHtml, /hardware and software/);
});
