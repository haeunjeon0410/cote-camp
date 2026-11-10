// 코테 요령 카드(파이썬): 문제를 풀기 전에 "처음 쓰는 요령"만 알려 준다. 문법 수업이 아니라 코테에서 자주 쓰는 도구 모음.
// lessons.txt: === id | 제목 / 본문 / --- code / 예제 코드
const fs = require('fs');
const path = require('path');
const PY = require('./py');

const LESSONS = {};
for (const chunk of fs.readFileSync(path.join(__dirname, 'lessons.txt'), 'utf8').replace(/\r/g, '').split(/^=== /m).slice(1)) {
  const nl = chunk.indexOf('\n');
  const [id, title] = chunk.slice(0, nl).split(' | ');
  const [text, code] = chunk.slice(nl + 1).split(/^--- code\n/m);
  LESSONS[id] = { id, title, text: text.trim(), code: (code || '').trimEnd() };
}

const STARTERS = Object.fromEntries(Object.entries(PY).filter(([, v]) => v.starter).map(([k, v]) => [k, v.starter]));

// 문제마다 처음 나오는 요령 (한 번 나온 건 다시 안 나오고 노트 탭에 쌓인다)
const LEARN = {
  'w1-01': ['split'],
  'w1-03': ['float'],
  'w1-05': ['divmod'],
  'w1-06': ['fmt'],
  'w2-01': ['sortkey'],
  'w2-02': ['fastin'],
  'w2-03': ['setdict'],
  'w2-06': ['dq'],
  'w2-09': ['bigint'],
  'w3-02': ['slice'],
  'w3-04': ['re'],
  'w3-06': ['grid', 'dirs'],
  'w3-07': ['zip'],
};
for (const [pid, ids] of Object.entries(LEARN)) for (const id of ids) if (!LESSONS[id]) throw new Error(`요령 카드 없음: ${pid} -> ${id}`);

module.exports = { LESSONS, STARTERS, LEARN, PY };
