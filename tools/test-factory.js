// 문제 공장 시험: 유형·단계를 주고 새 문제를 하나 만들어 본다 (AI 호출 1~2번)
//   node tools/test-factory.js ARR 2
const path = require('path');
const ai = require('../ai');
const factory = require('../factory');
const judge = require('../judge');
ai.loadEnv(path.join(__dirname, '..'));

(async () => {
  const [type = 'ARR', tier = '2'] = process.argv.slice(2);
  const tools = judge.detect({});
  const t0 = Date.now();
  const p = await factory.make({ type, typeName: type, tier: +tier, week: 1, avoid: ['두 수의 합', 'X보다 작은 수'], python: tools.python });
  console.log(`만들었어요 (${Math.round((Date.now() - t0) / 1000)}초): ${p.id} · ${p.title} · ${p.tags.join(',')}`);
  console.log('\n[본문]\n' + p.statement + '\n\n[입력] ' + p.input + '\n[출력] ' + p.output);
  console.log('\n[예제]'); p.examples.forEach((e, i) => console.log(`#${i + 1} 입력:\n${e.input}출력:\n${e.output}`));
  console.log('[힌트]\n- ' + p.hints.join('\n- ') + '\n\n[해설] ' + p.editorial.text);
  // 해설 코드(기준 풀이)가 채점기에서도 AC인지
  const r = await judge.judge(p, 'py', p.editorial.code, 'submit', tools);
  console.log(`\n채점기 확인: ${r.verdict} ${r.passed}/${r.total}`);
  require('fs').writeFileSync(path.join(__dirname, '..', 'shots', 'factory-sample.json'), JSON.stringify(p, null, 1));
})().catch(e => { console.error('실패:', e.code || '', e.message); process.exit(1); });
