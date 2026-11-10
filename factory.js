// 문제 공장: 코치가 필요한 유형·단계의 새 문제를 AI로 만든다.
// 믿을 수 있게 하려고 AI가 (1) 기준 풀이 (2) 따로 쓴 단순 풀이 (3) 입력 생성기를 함께 내게 하고,
// 20개 입력에서 두 풀이의 답이 전부 같을 때만 통과시킨다. 통과 못 하면 버린다.
const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const { spawn } = require('child_process');
const ai = require('./ai');

const TIER_GUIDE = {
  1: '입문: 개념 하나만 정확히 쓰면 되는 문제. 구현이 짧다 (풀이 10줄 안팎).',
  2: '기본: 개념 하나에 "경계값/예외" 함정이 하나 있는 문제. (프로그래머스 Lv1~2, 백준 실버 하위)',
  3: '응용: 두 가지를 엮거나 효율(시간 복잡도)을 신경 써야 하는 문제. (프로그래머스 Lv2, 백준 실버 상위)',
  4: '마스터: 자료구조나 알고리즘 둘 이상을 엮고, 핵심 관찰 하나를 떠올려야 시간 안에 풀리는 문제. 완전탐색은 시간 초과가 나도록 입력 크기를 잡는다. (프로그래머스 Lv3, 카카오 3~4번, 백준 골드)',
};

const TOOL = {
  name: 'make_problem',
  description: '코딩 테스트 연습 문제 하나를 만든다. 정답을 낼 때 쓸 두 풀이와 입력 생성기를 함께 낸다.',
  input_schema: {
    type: 'object',
    required: ['title', 'statement', 'input_spec', 'output_spec', 'examples', 'reference_py', 'brute_py', 'gen_py', 'hints', 'syntax_hints', 'editorial', 'tags'],
    properties: {
      title: { type: 'string', description: '문제 제목 (12자 안팎, 새로 지은 제목)' },
      statement: { type: 'string', description: '문제 본문. 한국어 해요체. 마크다운(`코드`, - 목록)만 사용. 입력·출력 형식은 쓰지 않는다.' },
      input_spec: { type: 'string', description: '입력 형식과 제한. 예: 첫째 줄에 N이 주어집니다. (1 ≤ N ≤ 100)' },
      output_spec: { type: 'string', description: '출력 형식' },
      examples: { type: 'array', items: { type: 'string' }, description: '예제 입력 문자열 2개 (끝에 줄바꿈). 출력은 쓰지 않는다 (기준 풀이로 계산한다).' },
      reference_py: { type: 'string', description: '기준 풀이. 파이썬 3, stdin에서 읽고 stdout으로 출력. 효율적으로.' },
      brute_py: { type: 'string', description: '기준 풀이와 다른 방식의 가장 단순하고 확실한 풀이(완전탐색 등). 느려도 된다. 같은 입출력 형식.' },
      gen_py: { type: 'string', description: '`def gen(seed):` 하나를 정의하는 파이썬 코드. 입력 문자열을 돌려준다. seed 1~12는 모두 brute_py가 몇 초 안에 끝낼 수 있는 작은 입력이다 (1~5는 최소값·같은 값 반복·가장 단순한 경우 같은 경계, 6~12는 작은 무작위). 제한의 최댓값에 가까운 큰 입력은 13~20에서만 쓴다. 반드시 random.Random(seed)를 쓴다.' },
      hints: { type: 'array', items: { type: 'string' }, description: '풀이 힌트 3단계. 1) 어떤 자료구조·기법을 떠올리면 되는지 단서만 2) 핵심 아이디어를 순서대로 3) 의사코드 수준. 정답 코드는 주지 않는다.' },
      syntax_hints: { type: 'array', items: { type: 'string' }, description: '파이썬 문법 힌트 2개. 이 문제에서 쓰이는 입력 처리·내장 함수·자료형 사용법을 짧은 예시 한두 줄과 함께. 풀이 아이디어는 말하지 않는다.' },
      editorial: { type: 'string', description: '해설 3~5문장. 확신 있게 접근법과 함정만 쓴다. "사실", "~일 수도" 같은 망설임이나 출제 의도 설명은 쓰지 않는다.' },
      tags: { type: 'array', items: { type: 'string' }, description: '알고리즘·기법 태그 2~3개 (예: 구현, 문자열, 정렬). 난이도 표현(브론즈, 실버 등)은 쓰지 않는다.' },
    },
  },
};

const SYSTEM = `당신은 한국 코딩 테스트(프로그래머스, 카카오, 삼성 SW 역량, 백준 실버~골드) 출제 경험이 많은 출제자입니다.
새 문제를 만듭니다. 규칙:
- 실제 문제를 베끼지 말고 시나리오·숫자·제목을 새로 만든다. 포켓몬 모험 분위기의 소재를 가끔 써도 좋다.
- 답이 하나로 정해져야 한다. 소수 출력, 여러 정답 가능한 문제, 무작위 요소는 금지.
- 입력은 표준 입력 한 개의 테스트 케이스, 출력은 표준 출력. 파이썬으로 1초 안에 풀 수 있는 크기.
- 두 풀이(reference_py, brute_py)는 서로 다른 접근이어야 하고, 둘 다 같은 입력에 같은 출력을 내야 한다.
- 입력 생성기는 문제의 모든 제한을 지켜야 한다 (잘못된 입력 금지).
- 파이썬 코드는 sys, math, random, itertools, collections, heapq, bisect, functools, re 만 쓴다. 파일·네트워크·os·subprocess 금지.
- 문제 본문·힌트·해설은 담백한 평서문(~해요, ~합니다)으로 쓴다. "~하세요", "~해 주세요", "~보세요" 같은 권유·명령형과 느낌표, 격려 문구는 쓰지 않는다. 예제 설명 없이 규칙만 정확히.
- 지정한 난이도를 지킨다. 기본(2) 이상이면 "한 번 훑어서 세기" 같은 뻔한 문제가 아니라, 자료구조나 규칙 하나를 제대로 써야 풀리는 문제로 만든다. 경계값 함정은 문제 본문에 억지로 강조하지 말고 자연스럽게 숨겨 둔다.`;

const BAD_CODE = /\b(os|subprocess|shutil|socket|urllib|requests|pathlib|ctypes|importlib|builtins|signal)\b|\bopen\s*\(|__import__|\bexec\s*\(|\beval\s*\(|\bcompile\s*\(/;

const norm = s => String(s).replace(/\r/g, '').split('\n').map(l => l.replace(/\s+$/, '')).join('\n').replace(/\n+$/, '');

function run(python, args, input, timeoutMs, cwd) {
  return new Promise(resolve => {
    const t0 = Date.now();
    let out = '', err = '', done = false;
    const fin = ok => { if (done) return; done = true; clearTimeout(timer); resolve({ ok, out, err: err.slice(0, 300), ms: Date.now() - t0 }); };
    let p;
    try { p = spawn(python, args, { cwd, windowsHide: true, env: { ...process.env, PYTHONIOENCODING: 'utf-8', PYTHONDONTWRITEBYTECODE: '1' } }); } catch (e) { err = String(e); return resolve({ ok: false, out: '', err, ms: 0 }); }
    const timer = setTimeout(() => { err += ' (시간 초과)'; p.kill('SIGKILL'); }, timeoutMs);
    p.stdout.on('data', d => { if (out.length < 20e6) out += d; });
    p.stderr.on('data', d => { if (err.length < 2000) err += d; });
    p.on('error', e => { err += String(e); fin(false); });
    p.on('close', code => fin(code === 0 && !/\(시간 초과\)$/.test(err)));
    p.stdin.on('error', () => {}); p.stdin.end(input);
  });
}
// 동시에 n개씩 돌린다 (검증이 여러 배 빨라진다)
async function mapPar(items, n, fn) {
  const out = new Array(items.length); let next = 0;
  await Promise.all(Array.from({ length: Math.min(n, items.length) }, async () => { while (next < items.length) { const i = next++; out[i] = await fn(items[i], i); } }));
  return out;
}

// 두 풀이가 20개 입력에서 모두 같은 답을 내는지 확인하고 테스트 케이스를 만든다
async function verify(raw, python) {
  for (const k of ['reference_py', 'brute_py', 'gen_py']) if (BAD_CODE.test(raw[k] || '')) return { ok: false, why: `허용되지 않는 코드 (${k})` };
  if (!Array.isArray(raw.examples) || raw.examples.length < 1 || !Array.isArray(raw.hints) || raw.hints.length < 3) return { ok: false, why: '예제나 힌트가 부족해요' };
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cote-fac-'));
  try {
    fs.writeFileSync(path.join(dir, 'ref.py'), raw.reference_py);
    fs.writeFileSync(path.join(dir, 'brute.py'), raw.brute_py);
    fs.writeFileSync(path.join(dir, 'gen.py'), raw.gen_py);
    fs.writeFileSync(path.join(dir, 'genrun.py'), 'import sys\nfrom gen import gen\nsys.stdout.write(gen(int(sys.argv[1])))\n');
    const gens = await mapPar(Array.from({ length: 20 }, (_, i) => i + 1), 4, seed => run(python, ['genrun.py', String(seed)], '', 8000, dir));
    const inputs = [];
    for (let k = 0; k < gens.length; k++) {
      const g = gens[k];
      if (!g.ok || !g.out.trim()) return { ok: false, why: `입력 생성 실패(seed ${k + 1}) ${g.err}` };
      if (g.out.length > 400000) return { ok: false, why: '입력이 너무 커요' };
      inputs.push(g.out.endsWith('\n') ? g.out : g.out + '\n');
    }
    const ex = raw.examples.slice(0, 2).map(x => (x.endsWith('\n') ? x : x + '\n'));
    const all = [...ex, ...inputs], tests = [];
    let maxRef = 0, why = '';
    const res = await mapPar(all, 4, async (inp, i) => {
      const a = await run(python, ['ref.py'], inp, 8000, dir);
      if (!a.ok || !a.out.trim()) return { why: `기준 풀이 실패(${i}) ${a.err}` };
      // 작은 입력(예제와 seed 1~12)은 단순 풀이와 맞춰 본다
      if (i < ex.length + 12) {
        const bb = await run(python, ['brute.py'], inp, 12000, dir);
        if (!bb.ok) return { why: `단순 풀이 실패(${i}) ${bb.err}` };
        if (norm(a.out) !== norm(bb.out)) return { why: `두 풀이의 답이 달라요(${i})` };
      }
      return { ms: a.ms, test: { input: inp, output: a.out.endsWith('\n') ? a.out : a.out + '\n' } };
    });
    for (const r of res) { if (r.why) { why = why || r.why; } else { maxRef = Math.max(maxRef, r.ms); tests.push(r.test); } }
    tests.fail = why;
    if (tests.fail) return { ok: false, why: tests.fail };
    if (new Set(tests.map(t => norm(t.output))).size < 4) return { ok: false, why: '답이 너무 단조로워요' };
    if (maxRef > 2500) return { ok: false, why: `기준 풀이가 느려요(${maxRef}ms)` };
    return { ok: true, tests, ex: ex.length };
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
}

// 한 유형 안에서도 문제가 매번 달라지도록, 세부 주제와 소재를 랜덤으로 고른다
const SUBTOPICS = {
  IO: ['여러 수를 읽고 계산하기', '출력 형식 맞추기', '줄 수가 정해지지 않은 입력', '문자열과 숫자를 함께 읽기'],
  COND: ['날짜·윤년 같은 조건 조합', '구간별 요금·점수 계산', '홀짝·배수에 따른 분기', '반복문으로 패턴 출력'],
  ARR: ['최댓값·최솟값과 그 위치', '누적 합계와 평균', '구간 뒤집기·회전', '값의 빈도 세기'],
  SORT: ['여러 기준으로 정렬', '정렬 후 중복 제거', 'K번째 값 찾기', '정렬해서 겹치는 구간 처리'],
  STK: ['괄호 검사', '스택으로 되돌리기(취소)', '큐 시뮬레이션', '스택으로 다음 큰 수 찾기'],
  HASH: ['중복 검사', '단어 빈도 세기', '두 집합의 교집합·차집합', '이름으로 값 찾는 사전'],
  PARSE: ['문자열 압축·변환', '규칙에 따른 문자열 정리', '숫자 파싱과 계산', '문자열에서 패턴 찾기'],
  SIM: ['격자 위 로봇 이동', '표 회전·뒤집기', '규칙에 따라 상태 갱신', '나선·지그재그 채우기'],
  BIN: ['정렬된 값에서 찾기', '결과값을 이분탐색(최소·최대 찾기)', '위치 찾기(lower/upper bound)'],
  TWO: ['두 포인터로 합 구하기', '슬라이딩 윈도우', '누적합으로 구간 합'],
  HEAP: ['가장 작은·큰 값 반복해서 뽑기', 'K번째로 큰 수', '작업 스케줄링'],
  BRUTE: ['부분집합·조합 고르기', '순열 나열', '조건을 맞추는 백트래킹'],
  GRAPH: ['격자 BFS로 최단 칸 수', 'DFS로 연결 덩어리 세기', '트리 탐색'],
  GREEDY: ['정렬 후 고르기', '거스름돈·회의실 배정', '가장 좋은 것부터 선택'],
  DP: ['점화식 세우기(계단·타일)', '배낭 문제', '최장 증가 부분 수열', '격자 경로 개수'],
  PATH: ['다익스트라 최단 거리', '플로이드-워셜', '유니온 파인드', '최소 신장 트리', '위상 정렬'],
  MATH: ['최대공약수·최소공배수', '소수 판별과 소인수분해', '약수 구하기', '나머지 연산과 거듭제곱', '조합·경우의 수 세기'],
  BITS: ['비트 연산으로 부분집합 만들기', '비트마스크 DP', '홀짝·2의 거듭제곱 판별', 'XOR 성질 이용'],
  TREE: ['트리 순회(전위·중위·후위)', '트리의 깊이와 높이', '부모·자식 관계 정리', '트리의 지름', '이진 트리 구성']
};
const THEMES = ['포켓몬 체육관', '트레이너 카드 교환', '몬스터볼 가게', '포켓몬 센터', '도감 정리', '배틀 대회', '풀숲 탐험', '진화의 돌', '포켓몬 리그 일정', '캠핑장 식사', '기차 노선', '도서관', '우체국 택배', '마을 축제', '포켓몬 레이스', '알 부화', '게임 점수판', '암호 해독', '시장 가격표', '등산 코스', '메신저 대화', '운동장 달리기', '급식 배식', '엘리베이터'];
const pick = a => a[Math.floor(Math.random() * a.length)];

function userPrompt({ type, typeName, tier, avoid }) {
  const sub = pick(SUBTOPICS[type] || [typeName]), theme = pick(THEMES), scale = pick(['작은 숫자로 시작하지만 경계값이 중요한', '입력이 꽤 큰 (효율을 생각해야 하는)', '규칙이 약간 까다로운', '예제는 간단하지만 숨은 경우가 있는']);
  return `유형: ${typeName} (${type})\n이번 세부 주제: ${sub}\n소재: ${theme} (소재는 자연스럽게 녹이고, 이름·숫자는 새로 만든다)\n성격: ${scale}\n난이도: ${TIER_GUIDE[tier] || TIER_GUIDE[2]}\n이미 있는 문제(비슷하게 만들지 말 것): ${(avoid || []).slice(-24).join(', ') || '없음'}\n\n위 유형·난이도의 새 문제를 make_problem 도구로 내 주세요.`;
}

/* 문제 하나 만들기. 실패하면 한 번 더 시도한다. opts: { type, typeName, tier, week, avoid, python } */
async function make(opts) {
  if (!ai.hasKey()) throw Object.assign(new Error('NO_KEY'), { code: 'NO_KEY' });
  let lastWhy = '';
  for (let attempt = 0; attempt < (opts.tier >= 4 ? 3 : 2); attempt++) {
    const { input: raw } = await ai.callTool({ system: SYSTEM, user: userPrompt(opts) + (lastWhy ? `\n\n(이전 시도는 이유로 탈락했어요: ${lastWhy}. 더 단순하고 명확한 문제로 다시 만들어 주세요.)` : ''), tool: TOOL, maxTokens: 6000, timeoutMs: 150000 });
    const v = await verify(raw, opts.python || 'python');
    if (!v.ok) { lastWhy = v.why; continue; }
    const id = 'g-' + opts.type.toLowerCase() + '-' + crypto.createHash('sha1').update(raw.title + raw.reference_py).digest('hex').slice(0, 6);
    const exOut = v.tests.slice(0, v.ex);
    return {
      id, title: raw.title.trim(), tags: (Array.isArray(raw.tags) ? raw.tags : String(raw.tags || '').split(/[,，、\s]+/)).filter(Boolean).slice(0, 3), limit: 1000, generated: true,
      statement: raw.statement.trim(), input: raw.input_spec.trim(), output: raw.output_spec.trim(),
      examples: exOut, tests: v.tests, checker: 'text', week: opts.week, boss: false,
      hints: raw.hints.slice(0, 3), syntax: (Array.isArray(raw.syntax_hints) ? raw.syntax_hints : []).slice(0, 3).map(String), editorial: { text: raw.editorial.trim(), code: raw.reference_py.trim() },
      learn: [], starter: null, type: opts.type, typeName: opts.typeName, tier: opts.tier,
    };
  }
  throw Object.assign(new Error('검증을 통과하지 못했어요: ' + lastWhy), { code: 'VERIFY' });
}

module.exports = { make, verify };
