// 코치 시뮬레이션: 잘하는 학생 / 어려워하는 학생이 지역을 어떻게 지나가는지 본다
const { build, publicView } = require('../problems');
const fs = require('fs'), vm = require('vm');
const P = build().map(publicView);
function sim(label, scoreFn, steps = 60) {
  const S = { solved: {}, skill: {}, recent: [], region: 0 };
  const CUR = require('../problems/curriculum'), PLAN = { weeks: Object.fromEntries(CUR.REGION_TYPES.map((ts, i) => [i + 1, ts.slice()])) };
  const g = { S, P, PLAN, save() {}, pById: id => P.find(p => p.id === id), weekProbs: i => P.filter(p => p.week === i + 1), Math };
  const src = fs.readFileSync(__dirname + '/../renderer/coach.js', 'utf8') + '\nthis.Coach = Coach;';
  vm.createContext(g); vm.runInContext(src, g);
  const C = g.Coach, log = [];
  let region = 0;
  for (let i = 0; i < steps && region < 10; i++) {
    const pick = C.next(region); if (!pick) { log.push(`   >>> 지역 ${region + 1}: 낼 문제가 없음 (문제 공장이 채워야 함)`); break; } const p = g.pById(pick.id);
    const score = scoreFn(i, pick, p);
    const prev = S.solved[pick.id]; S.solved[pick.id] = { ts: i, n: ((prev && prev.n) || 0) + 1 };
    const r = C.report(pick.id, score);
    log.push(`${String(i + 1).padStart(2)}. ${pick.id} ${p.type}/t${p.tier} [${pick.reason}] 점수${score}${r.note ? '  ← ' + r.note : ''}`);
    if (C.typesOf(region).every(t => C.sk(t).done)) { log.push(`   >>> 지역 ${region + 1} 클리어 (${i + 1}문제째)`); region++; }
  }
  console.log(`\n=== ${label} ===\n` + log.join('\n'));
  console.log('준비도:', [0, 1, 2, 3].map(r => (C.regionMastery(r) * 100 | 0) + '%').join(' / '));
}
let seed = 7; const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
sim('잘하는 학생 (늘 깔끔)', () => 2);
sim('어려워하는 학생 (자주 헤맴)', (i) => (rnd() < .45 ? 0 : rnd() < .5 ? 1 : 2), 80);
