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

test("includes all source lecture notes under data/lectures", () => {
  const lectureDir = path.join(__dirname, "..", "data", "lectures");
  const lectureFiles = fs
    .readdirSync(lectureDir)
    .filter((name) => /^Lecture\d{2}_.+\.md$/.test(name))
    .sort();

  assert.equal(lectureFiles.length, 17);
  assert.equal(lectureFiles[0], "Lecture01_Overview.md");
  assert.equal(lectureFiles.at(-1), "Lecture17_VirtualMemory2.md");
});

test("does not expose reference answers in the public exam payload", () => {
  const publicExam = toPublicExam(parseProblemBook(markdown));

  assert.equal("referenceAnswer" in publicExam.questions[0], false);
  assert.equal("questionMarkdown" in publicExam.questions[0], false);
  assert.match(publicExam.questions[0].questionHtml, /hardware and software/);
});

test("extracts structured answer fields for every sub-question", () => {
  const book = parseProblemBook(markdown);
  const p31 = book.questions.find((question) => question.id === "P3.1");
  const p61 = book.questions.find((question) => question.id === "P6.1");

  assert.ok(book.questions.every((question) => question.answerFields.length > 0));
  assert.equal(p31.answerFields.length, 6);
  assert.match(p31.answerFields[1].promptHtml, /sizeof\(s\)/);
  assert.deepEqual(
    p61.answerFields.map((field) => field.type),
    ["code", "code", "code", "code", "long", "short"],
  );
});

test("keeps recall and calculation questions no-cheatsheet friendly", () => {
  const book = parseProblemBook(markdown);
  const byId = new Map(book.questions.map((question) => [question.id, question]));

  assert.match(byId.get("P1.2").questionMarkdown, /Choose from: \*\*cpp, cc1, as, ld/);
  assert.match(byId.get("P2.1").questionMarkdown, /Assume ASCII, where `'a'` is 97/);
  assert.match(byId.get("P2.2").questionMarkdown, /gender mask `0x80`/);
  assert.equal(byId.get("P2.2").answerFields.length, 6);
  assert.match(byId.get("P14.2").referenceAnswer, /256 MiB/);
  assert.match(byId.get("P15.1").referenceAnswer, /16 × 2 × 8 = 256 bytes/);
  assert.match(byId.get("P16.2").referenceAnswer, /2 B × 256 = 512 bytes/);
});

test("keeps the audited problem set internally consistent", () => {
  const book = parseProblemBook(markdown);
  const byId = new Map(book.questions.map((question) => [question.id, question]));

  for (const question of book.questions) {
    const statedCount = Number.parseInt(question.pointsLabel, 10);
    const expectedCount = question.id === "P9.1" ? 5 : statedCount;
    assert.equal(question.answerFields.length, expectedCount, question.id);
    assert.doesNotMatch(question.referenceAnswer, /^## Lecture/m, question.id);
    assert.doesNotMatch(question.referenceAnswer, /끝!/, question.id);
  }

  assert.match(byId.get("P7.1").referenceAnswer, /0x21/);
  assert.match(byId.get("P10.2").referenceAnswer, /waitpid\(-1, NULL, 0\)/);
  assert.match(byId.get("P12.1").referenceAnswer, /TID, \*\*stack\*\*/);
  assert.match(byId.get("P13.1").referenceAnswer, /rewriting it as a \*\*reentrant\*\* function/);
  assert.doesNotMatch(byId.get("P14.2").questionMarkdown, /400 sectors/);
  assert.match(byId.get("P15.2").questionMarkdown, /lecture's shown column-major example/);
  assert.match(byId.get("P15.2").referenceAnswer, /100% miss rate/);
});
