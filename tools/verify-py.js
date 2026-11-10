// 검증: 각 문제의 파이썬 해설 코드를 채점기에 제출해서 모두 AC가 나오는지 확인한다
const { build } = require('../problems');
const { detect, judge } = require('../judge');
(async () => {
  const tools = detect();
  let bad = 0;
  for (const p of build()) {
    const r = await judge(p, 'py', p.editorial.code, 'submit', tools);
    const ok = r.verdict === 'AC';
    if (!ok) bad++;
    console.log(`${ok ? 'OK ' : 'FAIL'} ${p.id} ${p.title}  ${r.passed}/${r.total}  ${r.maxMs}ms${ok ? '' : '  ' + JSON.stringify(r.fail || r.message).slice(0, 300)}`);
  }
  console.log(bad ? `\n실패 ${bad}건` : '\n전부 통과');
  process.exit(bad ? 1 : 0);
})();
