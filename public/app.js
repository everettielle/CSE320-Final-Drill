const STORAGE_ANSWERS = "cse320-final-answers-v1";
const STORAGE_RESULTS = "cse320-final-results-v1";

const state = {
  lectures: [],
  questions: [],
  answers: readStorage(STORAGE_ANSWERS),
  results: readStorage(STORAGE_RESULTS),
  loading: new Set(),
  lectureFilter: "all",
  statusFilter: "all",
  search: "",
  gradingAll: false,
};

const elements = {
  apiStatus: document.querySelector("#api-status"),
  questionList: document.querySelector("#question-list"),
  lectureNav: document.querySelector("#lecture-nav"),
  viewFilters: document.querySelector("#view-filters"),
  currentViewTitle: document.querySelector("#current-view-title"),
  searchInput: document.querySelector("#search-input"),
  gradeAll: document.querySelector("#grade-all"),
  clearResults: document.querySelector("#clear-results"),
  progressRing: document.querySelector("#progress-ring"),
  progressPercent: document.querySelector("#progress-percent"),
  answeredCount: document.querySelector("#answered-count"),
  gradedCount: document.querySelector("#graded-count"),
  correctCount: document.querySelector("#correct-count"),
  filterAllCount: document.querySelector("#filter-all-count"),
  filterUnansweredCount: document.querySelector("#filter-unanswered-count"),
  filterGradedCount: document.querySelector("#filter-graded-count"),
  toast: document.querySelector("#toast"),
};

init();

async function init() {
  bindEvents();

  try {
    const [examResponse, statusResponse] = await Promise.all([
      fetch("/api/exam"),
      fetch("/api/status"),
    ]);
    if (!examResponse.ok || !statusResponse.ok) {
      throw new Error("시험 데이터를 불러오지 못했습니다.");
    }

    const exam = await examResponse.json();
    const status = await statusResponse.json();
    state.lectures = exam.lectures;
    state.questions = exam.questions;
    migrateStoredAnswers();
    setApiStatus(status);
    render();
  } catch (error) {
    elements.questionList.innerHTML = emptyState(
      "문제집을 불러오지 못했습니다.",
      error.message,
    );
  }
}

function bindEvents() {
  elements.searchInput.addEventListener("input", (event) => {
    state.search = event.target.value.trim().toLowerCase();
    renderQuestions();
  });

  elements.lectureNav.addEventListener("click", (event) => {
    const button = event.target.closest("[data-lecture]");
    if (!button) return;
    state.lectureFilter = button.dataset.lecture;
    render();
    document.querySelector(".question-toolbar")?.scrollIntoView({ block: "start" });
  });

  elements.viewFilters.addEventListener("click", (event) => {
    const button = event.target.closest("[data-status]");
    if (!button) return;
    state.statusFilter = button.dataset.status;
    render();
  });

  elements.questionList.addEventListener("input", (event) => {
    const field = event.target.closest("[data-answer-field]");
    if (!field) return;

    const id = field.dataset.questionId;
    const question = state.questions.find((item) => item.id === id);
    const card = field.closest(".question-card");
    const answer = answerObject(question);
    answer[field.dataset.fieldId] = field.value;
    state.answers[id] = answer;
    if (state.results[id]) {
      delete state.results[id];
      writeStorage(STORAGE_RESULTS, state.results);
      card?.classList.remove("correct", "partial", "incorrect");
      card?.querySelector(".feedback-result")?.remove();
    }
    const gradeButton = card?.querySelector("[data-grade]");
    if (gradeButton) {
      gradeButton.disabled = !hasAnswer(question);
      gradeButton.textContent = "AI 채점하기";
    }
    field.closest(".answer-field")?.classList.toggle("complete", Boolean(field.value.trim()));
    const completion = card?.querySelector(".answer-label small");
    if (completion) {
      completion.textContent = completionLabel(question);
    }
    const stateBadge = card?.querySelector(".question-state");
    if (stateBadge) {
      stateBadge.textContent = stateLabel(question);
    }
    writeStorage(STORAGE_ANSWERS, state.answers);
    updateStats();
  });

  elements.questionList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-grade]");
    if (!button) return;
    gradeQuestion(button.dataset.grade);
  });

  elements.gradeAll.addEventListener("click", gradeAllAnswered);
  elements.clearResults.addEventListener("click", () => {
    if (!Object.keys(state.results).length) {
      showToast("초기화할 채점 결과가 없습니다.");
      return;
    }
    if (!window.confirm("저장된 채점 결과를 모두 초기화할까요? 작성한 답안은 유지됩니다.")) {
      return;
    }
    state.results = {};
    writeStorage(STORAGE_RESULTS, state.results);
    render();
    showToast("채점 결과를 초기화했습니다.");
  });
}

function render() {
  renderLectureNav();
  renderViewFilters();
  renderQuestions();
  updateStats();
}

function renderLectureNav() {
  const allActive = state.lectureFilter === "all" ? "active" : "";
  elements.lectureNav.innerHTML = [
    `<button class="lecture-link ${allActive}" data-lecture="all" type="button">
      <strong>ALL</strong><span>전체 강의</span>
    </button>`,
    ...state.lectures.map((lecture) => {
      const active = state.lectureFilter === lecture.id ? "active" : "";
      return `<button class="lecture-link ${active}" data-lecture="${lecture.id}" type="button">
        <strong>${String(lecture.number).padStart(2, "0")}</strong>
        <span>${escapeHtml(lecture.title)}</span>
      </button>`;
    }),
  ].join("");
}

function renderViewFilters() {
  for (const button of elements.viewFilters.querySelectorAll("[data-status]")) {
    button.classList.toggle("active", button.dataset.status === state.statusFilter);
  }
}

function renderQuestions() {
  const questions = filteredQuestions();
  const lecture = state.lectures.find((item) => item.id === state.lectureFilter);
  const statusLabels = {
    all: lecture ? lecture.label : "전체 문제",
    unanswered: "미작성 문제",
    graded: "채점 완료",
  };
  elements.currentViewTitle.textContent = statusLabels[state.statusFilter];

  if (!questions.length) {
    elements.questionList.innerHTML = emptyState(
      "조건에 맞는 문제가 없습니다.",
      "필터나 검색어를 바꿔보세요.",
    );
    return;
  }

  elements.questionList.innerHTML = questions.map(questionCard).join("");
}

function questionCard(question) {
  const result = state.results[question.id];
  const isLoading = state.loading.has(question.id);
  const verdictClass = result?.verdict || "";
  const statusLabel = isLoading
    ? "채점 중"
    : result
      ? verdictLabel(result.verdict)
      : stateLabel(question);

  return `
    <article class="question-card ${verdictClass} ${isLoading ? "loading" : ""}" id="${question.id}">
      <header class="question-card-header">
        <div>
          <div class="question-meta">
            <span class="question-id">${question.id}</span>
            <span>${question.lectureLabel}</span>
            <span>${escapeHtml(question.pointsLabel)}</span>
          </div>
          <h3>${escapeHtml(question.title)}</h3>
        </div>
        <span class="question-state">${statusLabel}</span>
      </header>
      <div class="question-content">${question.questionHtml}</div>
      <div class="answer-panel">
        <div class="answer-label">
          <span>나의 답안</span>
          <small>${completionLabel(question)}</small>
        </div>
        <div class="answer-sheet">
          ${question.answerFields.map((field) => answerField(question, field)).join("")}
        </div>
        <div class="answer-actions">
          <span class="save-state">LOCAL / AUTO-SAVED</span>
          <button
            class="button grade-button ${isLoading ? "is-loading" : ""}"
            data-grade="${question.id}"
            type="button"
            ${isLoading || !hasAnswer(question) ? "disabled" : ""}
          >${isLoading ? "Claude 채점 중" : result ? "다시 채점하기" : "AI 채점하기"}</button>
        </div>
      </div>
      ${result ? resultPanel(result) : ""}
    </article>
  `;
}

function answerField(question, field) {
  const value = answerObject(question)[field.id] || "";
  const complete = value.trim() ? "complete" : "";
  const typeLabel = {
    short: "SHORT",
    code: "CODE",
    long: "EXPLAIN",
  }[field.type];
  const input =
    field.type === "long"
      ? `<textarea
          data-answer-field
          data-question-id="${question.id}"
          data-field-id="${field.id}"
          maxlength="4000"
          rows="3"
          placeholder="핵심 근거와 함께 설명하세요."
        >${escapeHtml(value)}</textarea>`
      : `<input
          data-answer-field
          data-question-id="${question.id}"
          data-field-id="${field.id}"
          maxlength="4000"
          type="text"
          value="${escapeHtml(value)}"
          spellcheck="false"
          placeholder="${field.type === "code" ? "코드 또는 식을 입력하세요." : "답을 입력하세요."}"
        />`;

  return `
    <label class="answer-field answer-field-${field.type} ${complete}">
      <span class="field-number">${String(field.label).padStart(2, "0")}</span>
      <span class="field-body">
        <span class="field-heading">
          <span class="field-prompt">${field.promptHtml}</span>
          <span class="field-type">${typeLabel}</span>
        </span>
        ${input}
      </span>
    </label>
  `;
}

function resultPanel(result) {
  return `
    <section class="feedback-result">
      <div class="score-block">
        <span>Claude score</span>
        <strong>${result.score}</strong>
        <b>${verdictLabel(result.verdict)}</b>
      </div>
      <div class="feedback-copy">
        <p>${escapeHtml(result.feedback)}</p>
        <div class="feedback-grid">
          <div class="feedback-item">
            <span>잘한 점</span>
            <p>${escapeHtml(result.strengths)}</p>
          </div>
          <div class="feedback-item">
            <span>보완할 점</span>
            <p>${escapeHtml(result.missing)}</p>
          </div>
        </div>
        <details class="ideal-answer">
          <summary>모범 답안 보기</summary>
          <p>${escapeHtml(result.ideal_answer)}</p>
        </details>
      </div>
    </section>
  `;
}

function filteredQuestions() {
  return state.questions.filter((question) => {
    const matchesLecture =
      state.lectureFilter === "all" || question.lectureId === state.lectureFilter;
    const matchesStatus =
      state.statusFilter === "all" ||
      (state.statusFilter === "unanswered" && !hasAnswer(question)) ||
      (state.statusFilter === "graded" && Boolean(state.results[question.id]));
    const haystack = `${question.id} ${question.title} ${question.lectureTitle}`.toLowerCase();
    const matchesSearch = !state.search || haystack.includes(state.search);
    return matchesLecture && matchesStatus && matchesSearch;
  });
}

async function gradeQuestion(questionId, { quiet = false } = {}) {
  const question = state.questions.find((item) => item.id === questionId);
  const answer = serializeAnswer(question);
  if (!answer || state.loading.has(questionId)) return false;

  state.loading.add(questionId);
  renderQuestions();

  try {
    const response = await fetch("/api/grade", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ questionId, answer }),
    });
    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.error || "채점 요청에 실패했습니다.");
    }
    state.results[questionId] = payload;
    writeStorage(STORAGE_RESULTS, state.results);
    if (!quiet) showToast(`${questionId} 채점 완료: ${verdictLabel(payload.verdict)}`);
    return true;
  } catch (error) {
    showToast(error.message);
    return false;
  } finally {
    state.loading.delete(questionId);
    renderQuestions();
    updateStats();
  }
}

async function gradeAllAnswered() {
  if (state.gradingAll) return;
  const targets = state.questions
    .filter((question) => hasAnswer(question))
    .map((question) => question.id);

  if (!targets.length) {
    showToast("먼저 하나 이상의 답안을 작성해 주세요.");
    return;
  }

  state.gradingAll = true;
  elements.gradeAll.disabled = true;
  elements.gradeAll.querySelector("span").textContent = `0 / ${targets.length} 채점 중`;
  let completed = 0;
  let succeeded = 0;
  const queue = [...targets];

  async function worker() {
    while (queue.length) {
      const questionId = queue.shift();
      if (await gradeQuestion(questionId, { quiet: true })) succeeded += 1;
      completed += 1;
      elements.gradeAll.querySelector("span").textContent = `${completed} / ${targets.length} 채점 중`;
    }
  }

  await Promise.all([worker(), worker()]);
  state.gradingAll = false;
  elements.gradeAll.disabled = false;
  elements.gradeAll.querySelector("span").textContent = "작성 답안 일괄 채점";
  showToast(`${succeeded}개 답안의 AI 채점을 완료했습니다.`);
}

function updateStats() {
  const answered = state.questions.filter((question) =>
    hasAnswer(question),
  ).length;
  const graded = state.questions.filter((question) => state.results[question.id]).length;
  const correct = state.questions.filter(
    (question) => state.results[question.id]?.verdict === "correct",
  ).length;
  const total = state.questions.length || 34;
  const percent = Math.round((answered / total) * 100);

  elements.answeredCount.textContent = answered;
  elements.gradedCount.textContent = graded;
  elements.correctCount.textContent = correct;
  elements.progressPercent.textContent = `${percent}%`;
  elements.progressRing.style.setProperty("--progress", `${percent * 3.6}deg`);
  elements.filterAllCount.textContent = total;
  elements.filterUnansweredCount.textContent = total - answered;
  elements.filterGradedCount.textContent = graded;
}

function migrateStoredAnswers() {
  let changed = false;

  for (const question of state.questions) {
    const stored = state.answers[question.id];
    if (typeof stored !== "string") continue;
    state.answers[question.id] = parseLegacyAnswer(stored, question.answerFields);
    changed = true;
  }

  if (changed) writeStorage(STORAGE_ANSWERS, state.answers);
}

function parseLegacyAnswer(answer, fields) {
  const structured = {};
  const markers = [...answer.matchAll(/(?:^|\s)(\d+)[).]\s*/g)];

  for (const [index, marker] of markers.entries()) {
    const fieldId = marker[1];
    if (!fields.some((field) => field.id === fieldId)) continue;
    const start = marker.index + marker[0].length;
    const end = markers[index + 1]?.index ?? answer.length;
    structured[fieldId] = answer.slice(start, end).trim();
  }

  if (!Object.keys(structured).length && answer.trim() && fields[0]) {
    structured[fields[0].id] = answer.trim();
  }

  return structured;
}

function answerObject(question) {
  const stored = state.answers[question.id];
  return stored && typeof stored === "object" ? stored : {};
}

function filledFieldCount(question) {
  const answer = answerObject(question);
  return question.answerFields.filter((field) => (answer[field.id] || "").trim()).length;
}

function hasAnswer(question) {
  return filledFieldCount(question) > 0;
}

function completionLabel(question) {
  return `${filledFieldCount(question)} / ${question.answerFields.length} 문항 작성`;
}

function stateLabel(question) {
  const filled = filledFieldCount(question);
  if (!filled) return "미작성";
  if (filled === question.answerFields.length) return "작성 완료";
  return `${filled}/${question.answerFields.length} 작성`;
}

function serializeAnswer(question) {
  const answer = answerObject(question);
  return question.answerFields
    .filter((field) => (answer[field.id] || "").trim())
    .map((field) => `${field.label}) ${answer[field.id].trim()}`)
    .join("\n");
}

function setApiStatus(status) {
  elements.apiStatus.classList.add(status.configured ? "ready" : "missing");
  elements.apiStatus.querySelector("span:last-child").textContent = status.configured
    ? `${status.model} 준비됨`
    : "API 키 설정 필요";
}

function verdictLabel(verdict) {
  return {
    correct: "정답",
    partial: "부분 정답",
    incorrect: "오답",
  }[verdict] || "미채점";
}

function emptyState(title, copy) {
  return `<div class="empty-state"><strong>${escapeHtml(title)}</strong><p>${escapeHtml(copy)}</p></div>`;
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function readStorage(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || {};
  } catch {
    return {};
  }
}

function writeStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

let toastTimer;
function showToast(message) {
  clearTimeout(toastTimer);
  elements.toast.textContent = message;
  elements.toast.classList.add("show");
  toastTimer = setTimeout(() => elements.toast.classList.remove("show"), 3200);
}
