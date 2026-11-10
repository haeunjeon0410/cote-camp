// 문제 모음: 기준 풀이(solve)로 정답 출력을 계산해 테스트 케이스를 만든다
const { LESSONS, STARTERS, LEARN, PY } = require('./lessons');
const CUR = require('./curriculum');
const TIER = Object.fromEntries(CUR.PROBLEMS.map(p => [p.id, p.tier]));
const TYPE = Object.fromEntries(CUR.PROBLEMS.map(p => [p.id, p.type]));
const files = [require('./w01'), require('./w02'), require('./w03')];

function build() {
  const all = files.flat().map(p => {
    const ex = p.examples.map(input => ({ input, output: p.solve(input) }));
    const hidden = p.gen().map(input => ({ input, output: p.solve(input) }));
    const py = PY[p.id] || {};
    return { ...p, hints: py.hints || p.hints, editorial: py.editorial || p.editorial, checker: p.checker || 'text', week: +p.id.match(/^w(\d+)-/)[1], tests: [...ex, ...hidden], examples: ex };
  });
  const lastOfWeek = {};
  all.forEach(p => { lastOfWeek[p.week] = p.id; });
  all.forEach(p => { p.boss = lastOfWeek[p.week] === p.id; });
  return all;
}

// 화면에 보내는 정보 (히든 테스트와 기준 풀이는 제외)
function publicView(p) {
  return {
    id: p.id, week: p.week, boss: p.boss, title: p.title, tags: p.tags, limit: p.limit,
    statement: p.statement, input: p.input, output: p.output,
    examples: p.examples, hints: p.hints, syntax: p.syntax || [], editorial: p.editorial,
    generated: !!p.generated, tier: p.tier || TIER[p.id] || 2, type: p.type || TYPE[p.id] || 'IO', typeName: p.typeName || CUR.TYPES[TYPE[p.id]] || '', learn: (LEARN[p.id] || []).map(id => LESSONS[id]), starter: STARTERS[p.id] || null,
  };
}

module.exports = { build, publicView };
