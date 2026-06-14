# CSE320 Interactive Final Practice

마크다운 문제집의 34개 문제를 인터랙티브하게 풀고 Claude Sonnet 4.6으로 채점하는 로컬 웹 앱입니다.

## 실행

```bash
cp .env.example .env
# .env에 ANTHROPIC_API_KEY 입력
npm install
npm start
```

브라우저에서 `http://localhost:4173`을 여세요. 답안은 브라우저의 localStorage에 자동 저장됩니다.

## 보안 구조

- Anthropic API 키는 Node 서버의 `.env`에서만 읽습니다.
- 공식 정답은 서버에만 남고 `/api/exam` 응답에는 포함되지 않습니다.
- 채점 시 서버가 문제, 공식 정답, 사용자 답안을 Anthropic Messages API로 전송합니다.
