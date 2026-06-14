import fs from "node:fs";
import { marked } from "marked";

const ANSWER_KEY_HEADING = "# Part II. Answer Key";

function cleanSection(markdown) {
  return markdown
    .replace(/^\s*---\s*$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function findSections(markdown, pattern) {
  const matches = [...markdown.matchAll(pattern)];

  return matches.map((match, index) => ({
    match,
    content: markdown.slice(
      match.index + match[0].length,
      matches[index + 1]?.index ?? markdown.length,
    ),
  }));
}

export function parseProblemBook(markdown) {
  const answerKeyIndex = markdown.indexOf(ANSWER_KEY_HEADING);
  if (answerKeyIndex < 0) {
    throw new Error("Answer Key heading was not found in the problem book.");
  }

  const problemPart = markdown.slice(0, answerKeyIndex);
  const answerPart = markdown.slice(answerKeyIndex);
  const answerSections = findSections(answerPart, /^\*\*(P\d+\.\d+)\*\*/gm);
  const answers = new Map(
    answerSections.map(({ match, content }) => [
      match[1],
      cleanSection(`${match[0]}${content}`),
    ]),
  );

  const lectureSections = findSections(
    problemPart,
    /^## Lecture\s+(\d+)\s+—\s+(.+)$/gm,
  );
  const lectures = [];
  const questions = [];

  for (const { match: lectureMatch, content } of lectureSections) {
    const lectureNumber = Number.parseInt(lectureMatch[1], 10);
    const lectureId = `lecture-${lectureNumber}`;
    const lecture = {
      id: lectureId,
      number: lectureNumber,
      label: `Lecture ${String(lectureNumber).padStart(2, "0")}`,
      title: lectureMatch[2].trim(),
    };
    lectures.push(lecture);

    const questionSections = findSections(
      content,
      /^###\s+(P\d+\.\d+)\s+\[([^\]]+)\]\s+(.+)$/gm,
    );

    for (const { match: questionMatch, content: questionContent } of questionSections) {
      const id = questionMatch[1];
      const questionMarkdown = cleanSection(questionContent);
      const referenceAnswer = answers.get(id);

      if (!referenceAnswer) {
        throw new Error(`Reference answer not found for ${id}.`);
      }

      questions.push({
        id,
        lectureId,
        lectureNumber,
        lectureLabel: lecture.label,
        lectureTitle: lecture.title,
        pointsLabel: questionMatch[2].trim(),
        title: questionMatch[3].trim(),
        questionMarkdown,
        questionHtml: marked.parse(questionMarkdown),
        referenceAnswer,
      });
    }
  }

  if (questions.length !== answers.size) {
    throw new Error(
      `Problem/answer count mismatch: ${questions.length} problems, ${answers.size} answers.`,
    );
  }

  return { lectures, questions };
}

export function loadProblemBook(path) {
  return parseProblemBook(fs.readFileSync(path, "utf8"));
}

export function toPublicExam(book) {
  return {
    lectures: book.lectures,
    questions: book.questions.map(({ referenceAnswer, questionMarkdown, ...question }) => question),
  };
}
