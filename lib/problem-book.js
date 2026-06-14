import fs from "node:fs";
import { marked } from "marked";

const ANSWER_KEY_HEADING = "# Part II. Answer Key";

function cleanSection(markdown) {
  return markdown
    .replace(/^\s*---\s*$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function cleanAnswerSection(markdown) {
  return cleanSection(
    markdown
      .replace(/^## Lecture.*$/gm, "")
      .replace(/^> 끝![\s\S]*$/m, ""),
  );
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

function cleanPrompt(prompt) {
  return prompt
    .replace(/→\s*_+/g, "")
    .replace(/_{3,}/g, "___")
    .replace(/\s+/g, " ")
    .replace(/\s+([,.;:?])/g, "$1")
    .trim();
}

function inferAnswerType(prompt, fromCodeBlock) {
  if (fromCodeBlock) return "code";
  if (
    /\b(complete|write (?:the )?(?:expression|macro|call)|fill in|which two instructions)\b/i.test(
      prompt,
    )
  ) {
    return "code";
  }
  if (
    /\b(why|explain|what happens|what are the|what is the difference|difference between|list.*(?:steps|items|conditions|benefits)|race|formula|outcomes|does two things)\b/i.test(
      prompt,
    )
  ) {
    return "long";
  }
  return "short";
}

function extractAnswerFields(questionMarkdown) {
  const prompts = new Map();
  const withoutCode = questionMarkdown.replace(/```[\s\S]*?```/g, "\n");

  for (const line of withoutCode.split("\n")) {
    const markers = [...line.matchAll(/(?:^|\s)(\d+)\.\s+/g)];
    for (const [index, marker] of markers.entries()) {
      const start = marker.index + marker[0].length;
      const end = markers[index + 1]?.index ?? line.length;
      const prompt = cleanPrompt(line.slice(start, end));
      if (prompt) prompts.set(Number.parseInt(marker[1], 10), { prompt, fromCodeBlock: false });
    }
  }

  for (const block of questionMarkdown.matchAll(/```[^\n]*\n([\s\S]*?)```/g)) {
    for (const line of block[1].split("\n")) {
      const markers = [...line.matchAll(/(\d+)\)_+/g)];
      for (const marker of markers) {
        const number = Number.parseInt(marker[1], 10);
        if (prompts.has(number)) continue;
        const prompt = cleanPrompt(line.replace(/(\d+)\)_+/g, "___"));
        prompts.set(number, { prompt: prompt || `코드 빈칸 ${number}`, fromCodeBlock: true });
      }
    }
  }

  return [...prompts.entries()]
    .sort(([left], [right]) => left - right)
    .map(([number, { prompt, fromCodeBlock }]) => ({
      id: String(number),
      label: String(number),
      type: inferAnswerType(prompt, fromCodeBlock),
      promptHtml: fromCodeBlock
        ? `<code>${escapeHtml(prompt)}</code>`
        : marked.parseInline(prompt),
    }));
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
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
      cleanAnswerSection(`${match[0]}${content}`),
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
        answerFields: extractAnswerFields(questionMarkdown),
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
