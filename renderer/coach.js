/* 코치 (과외쌤): 실력을 보고 다음 문제와 방향을 정한다.
   - 시간은 절대 보지 않는다. "생각이 바로 났는지"는 틀린 횟수·힌트·한 번에 맞혔는지로 본다.
   - 문제 하나의 점수: 2 = 깔끔(틀림·힌트 없음), 1 = 조금 헤맴, 0 = 많이 헤맴 또는 포기.
   - 유형마다 단계(1~3)가 있다: 깔끔하게 연속 두 번 풀면 올라가고, 힘들어하면 내려가서 비슷한 유형을 다시 준다.
   - 최고 단계에서 잘 풀면 그 유형은 "익힘". 지역의 모든 유형을 익히면 다음 지역이 열린다. (고정된 문제 수가 없다)
   - 약한 유형은 사이사이 조용히 끼워 넣는다. 화면에는 "약점" 같은 말을 쓰지 않는다. */
const TYPE_ORDER = ['IO', 'COND', 'ARR', 'SORT', 'STK', 'BIN', 'PARSE', 'SIM', 'HASH', 'TWO', 'MATH', 'HEAP', 'BRUTE', 'BITS', 'GREEDY', 'GRAPH', 'TREE', 'DP', 'PATH'];
const MIN_SOLVES = 10;
const Coach = (() => {
  const sk = t => ((S.skill || (S.skill = {}))[t] || (S.skill[t] = { log: [], n: 0, lvl: 1, weak: 0, done: false }));
  const bank = t => P.filter(p => p.type === t);
  const maxTier = t => Math.max(3, ...bank(t).map(p => p.tier || 1));   // 문제가 아직 쉬운 것뿐이어도 3단계까지 올라가야 익힌 것으로 본다 (모자란 단계는 문제 공장이 만든다)
  const sum = (a, n) => a.slice(-n).reduce((x, y) => x + y, 0);
  // 지역이 다루는 유형: 커리큘럼 계획표가 있으면 그걸 따르고(문제가 아직 없어도), 없으면 있는 문제에서 뽑는다
  const typesOf = region => [...new Set((PLAN.weeks[region + 1] || []).concat(weekProbs(region).map(p => p.type)))].sort((a, b) => TYPE_ORDER.indexOf(a) - TYPE_ORDER.indexOf(b));
  const typeName = t => ((P.find(p => p.type === t) || {}).typeName) || t;

  /* 이 유형을 익혔나: 최고 단계에서 최근 두 문제 점수 합이 3 이상(= 깔끔 + 보통 이상).
     문제가 바닥나서 같은 문제를 다시 풀게 되는 경우에도 막히지 않도록, 충분히 연습했다면(5번 이상, 최근 셋이 평균 1 이상) 넘어간다. */
  function mastered(t) {
    const s = sk(t), l = s.log;
    const avail = Math.max(...bank(t).map(p => p.tier || 1));   // 풀 수 있는 가장 어려운 단계까지 실제로 풀어 봤어야 한다
    if (s.n < MIN_SOLVES) return false;   // 아무리 잘 풀어도 유형마다 최소 10문제. 조금만 틀려도 생각이 안 날 수 있으니 충분히 반복한다
    if (l.length >= 2 && s.lvl >= Math.min(3, maxTier(t)) && (s.top || 1) >= Math.min(3, avail) && sum(l, 2) >= 3) return true;
    if (l.length >= 8 && sum(l, 3) >= 3) return true;   // 올라갈 문제가 정말 없을 때의 안전장치
    return false;
  }
  function mastery(t) {   // 준비도 0~1 (화면에는 지역 단위로만 보인다)
    const s = sk(t);
    if (s.done) return 1;
    if (!s.log.length) return 0;
    const avg = sum(s.log, 2) / Math.min(2, s.log.length) / 2;
    return Math.min(.95, ((Math.min(3, s.lvl) - 1) + avg) / Math.min(3, maxTier(t)), s.n / MIN_SOLVES * .95);
  }
  const regionMastery = region => { const ts = typesOf(region); return ts.length ? ts.reduce((a, t) => a + mastery(t), 0) / ts.length : 0; };
  // 체육관에 도전할 준비: 지역의 모든 유형을 익혔고, 방금 도전에서 졌다면 그 뒤로 두 문제는 더 풀어 봤을 때
  const gymReady = region => {
    const ts = typesOf(region), lost = (S.gym || {})[region];
    return ts.length > 0 && ts.every(t => sk(t).done) && (!lost || (S.nrep || 0) - lost.lostAt >= 2);
  };

  /* 문제 하나를 풀고 나서 점수를 기록한다 → 단계·익힘·약한 유형이 바뀐다 */
  function report(pid, score, info) {
    const p = pById(pid); if (!p) return {};
    const s = sk(p.type), rec = S.solved[pid];
    if (rec && rec.n > 1 && score === 2) score = 1;   // 이미 풀어 본 문제를 또 깔끔하게 푼 건 한 단계 낮게 친다 (외웠을 수 있으니)
    s.log.push(score); if (s.log.length > 8) s.log.shift(); s.n++;
    if (score >= 1) s.top = Math.max(s.top || 0, p.tier || 1);
    const l = s.log, was = s.lvl;
    if (score === 2 && l.length >= 2 && l[l.length - 2] === 2) s.lvl = Math.min(maxTier(p.type), s.lvl + 1);
    else if (score === 0) s.lvl = Math.max(1, s.lvl - 1);
    s.weak = (score === 0 || (info && info.idea >= 2)) ? Math.min(3, s.weak + 1) : score === 2 ? Math.max(0, s.weak - 1) : s.weak;   // 풀이 힌트를 두 번 이상 썼다면 아직 익숙하지 않은 유형
    if (info && info.syn > 0) { S.syn = S.syn || {}; S.syn[p.type] = (S.syn[p.type] || 0) + info.syn; }   // 문법 힌트: 알고리즘이 아니라 파이썬 문법 쪽이 약하다는 기록
    let note = '';
    if (!s.done && mastered(p.type)) {
      s.done = true;
      note = `'${typeName(p.type)}' 유형은 충분히 익혔구나.`;
      if (gymReady(p.week - 1)) note += ' 체육관에 도전해 봐도 좋겠다.';
    } else if (score === 0) note = '비슷한 문제로 한 번 더 풀어 보렴.';
    else if (s.lvl > was) note = '잘 풀리는구나. 조금 더 어려운 문제로 가 보자.';
    S.recent = (S.recent || []).concat(pid).slice(-6); S.nrep = (S.nrep || 0) + 1;
    save();
    return { note, done: s.done, lvl: s.lvl };
  }

  /* 다음 문제 고르기 */
  function next(region, master) {
    const types = master ? TYPE_ORDER.filter(t => bank(t).length) : typesOf(region);
    // 아직 안 푼 문제가 바닥났고 최근에 잘 풀었다면, 그 유형은 충분히 한 걸로 보고 넘어간다 (새 문제를 못 구한 경우의 안전장치)
    let focus = null, reason = 'normal';
    if (master) {   // 마스터 로드: 약한 유형과 낮은 단계일수록 자주
      const w = types.map(t => 1 + 2 * sk(t).weak + Math.max(0, 4 - sk(t).lvl)); let r = Math.random() * w.reduce((a, b) => a + b, 0); focus = types[0]; reason = 'master';
      for (let i = 0; i < types.length; i++) { r -= w[i]; if (r <= 0) { focus = types[i]; break; } }
    }
    for (const t of (master ? [] : types)) {
      const s = sk(t); if (s.done) continue;
      if (!bank(t).length) continue;   // 아직 문제가 없는 유형 (공장이 만드는 중)
      if (!bank(t).some(p => !S.solved[p.id]) && s.log.length && s.log[s.log.length - 1] >= 1 && s.n >= MIN_SOLVES) { s.done = true; continue; }
      focus = t; break;
    }
    const weak = TYPE_ORDER.filter(t => sk(t).weak >= 1 && bank(t).length);
    if (!master && weak.length && (!focus || Math.random() < .3)) {
      const pool = weak.filter(t => t !== (S.lastType || '')) ; focus = (pool.length ? pool : weak)[Math.floor(Math.random() * (pool.length ? pool.length : weak.length))]; reason = 'review';
    }
    if (!master && !focus && types.every(t => sk(t).done)) { const have = types.filter(t => bank(t).length); focus = have[Math.floor(Math.random() * have.length)]; reason = 'free'; }
    if (!focus || !bank(focus).length) return null;   // 낼 문제가 아직 없다
    const s = sk(focus), want = master ? Math.min(4, Math.max(2, s.lvl)) : Math.min(3, s.lvl), recent = new Set(S.recent || []);
    const ts = p => (S.solved[p.id] && S.solved[p.id].ts) || 0;
    // 안 푼 문제를 우선(단계가 한 칸 어긋나도 새 문제가 낫다), 그다음 단계가 가까운 것, 최근에 푼 건 피하고, 오래 안 푼 것 먼저
    const rank = p => (S.solved[p.id] ? 2 : 0) + Math.abs((p.tier || 1) - want) + (p.generated ? 0 : .5);
    const cand = bank(focus).slice().sort((a, b) => (rank(a) - rank(b)) || ((recent.has(a.id) ? 1 : 0) - (recent.has(b.id) ? 1 : 0)) || (ts(a) - ts(b)));
    const best = rank(cand[0]), top = cand.filter(q => rank(q) <= best + 1).slice(0, 6), p = top[Math.floor(Math.random() * top.length)];
    S.lastType = focus;
    return { id: p.id, type: focus, tier: p.tier || 1, reason };
  }
  function gymProblems(region, n) {
    const types = typesOf(region), want = Math.max(1, ...types.map(t => sk(t).lvl)), rank = p => (S.solved[p.id] ? 2 : 0) + (p.generated ? 0 : .5) + Math.abs((p.tier || 1) - Math.min(3, want + 1)) * .5 + Math.random();
    const pool = types.flatMap(bank).sort((a, b) => rank(a) - rank(b)), out = [], used = new Set();
    for (const p of pool) { if (out.length >= n) break; if (!used.has(p.type) || used.size >= types.length) { out.push(p.id); used.add(p.type); } }
    for (const p of pool) { if (out.length >= n) break; if (!out.includes(p.id)) out.push(p.id); }
    return out;
  }
  /* 재고 확인: 지금 집중하는 유형에 안 푼 문제가 모자라면 문제 공장에 새 문제를 부탁한다 (걷는 동안 뒤에서 만든다) */
  let bgN = 0;
  // 지금 문제가 모자라지 않을 때 뒤에서 조용히 미리 만들어 둔다: 현재 지역부터 앞으로 나올 유형마다 안 푼 새 문제가 3개는 있도록 (한 번에 최대 6개)
  async function topUp(region) {
    if (making || bgN >= 6 || !S.settings || S.settings.autoMake === false) return;
    const order = []; for (let r = region; r < 10; r++) order.push(...typesOf(r)); order.push(...TYPE_ORDER);
    const seen = new Set(); let t = null;
    for (const x of order) { if (!x || seen.has(x)) continue; seen.add(x); if (bank(x).filter(p => p.generated && !S.solved[p.id]).length < 3) { t = x; break; } }
    if (!t) return;
    making = true; bgN++;
    let ok = false;
    try {
      const wk = ((P.find(p => p.type === t) || {}).week) || region + 1, tier = isMaster() ? Math.min(4, Math.max(3, sk(t).lvl)) : Math.min(3, Math.max(1, sk(t).lvl));
      const r = await api.factoryMake({ type: t, tier, week: wk, cap: S.settings.dailyCap || 100 });
      if (r && r.id && !P.some(p => p.id === r.id)) { P.push(r); FACTORY.made++; ok = true; }
    } catch (e) { /* 다음에 다시 */ } finally { making = false; }
    if (ok) topUp(region);
  }
  let making = false, state = '';   // state: '' | 'making' | 'cap' | 'fail'
  const isMaster = () => typeof masterMode === 'function' && masterMode();
  const freshHi = t => bank(t).filter(p => !S.solved[p.id] && (p.tier || 1) >= 3).length;
  async function ensure(region, depth = 0) {
    if (making || !S.settings || S.settings.autoMake === false) return;
    if (depth === 0) bgN = 0;
    const types = typesOf(region); let t, want;
    if (isMaster()) {   // 마스터 로드: 어려운 문제가 가장 모자란 유형부터
      const ts = TYPE_ORDER.filter(x => bank(x).length); t = ts.slice().sort((a, b) => freshHi(a) - freshHi(b))[0]; if (!t) return;
      want = Math.min(4, Math.max(3, sk(t).lvl));
      if (freshHi(t) >= 2) { state = ''; return topUp(region); }
    } else if (gymReady(region)) {   // 관장 문제를 위해 안 푼 문제를 넉넉히
      if (types.flatMap(bank).filter(p => !S.solved[p.id]).length >= 4) { state = ''; return topUp(region); }
      t = types[Math.floor(Math.random() * types.length)]; want = Math.min(3, sk(t).lvl + 1);
    } else {
      t = types.find(x => !sk(x).done); if (!t) return;
      want = sk(t).lvl;
      const fresh = bank(t).filter(p => !S.solved[p.id] && Math.abs((p.tier || 1) - want) <= 1);
      if (fresh.filter(p => p.generated).length >= 2 || fresh.length >= 4) { state = ''; return topUp(region); }   // 새로 만든 문제를 미리 2개는 쌓아 둔다
    }
    making = true; state = 'making';
    let again = false;
    try {
      const r = await api.factoryMake({ type: t, tier: want, week: region + 1, cap: S.settings.dailyCap || 100 });
      if (r && r.id && !P.some(p => p.id === r.id)) { P.push(r); state = ''; again = depth < 2; FACTORY.made++; }
      else state = r && r.error === 'CAP' ? 'cap' : r && r.error === 'BUSY' ? '' : 'fail';
    } catch (e) { state = 'fail'; }
    finally { making = false; }
    if (typeof scene !== 'undefined' && scene.name === 'field') renderBot();
    if (again) ensure(region, depth + 1);
  }
  const status = () => state;
  const last = () => { const t = S.lastType; return t && sk(t).log.length ? sk(t).log[sk(t).log.length - 1] : undefined; };   // 방금 푼 유형의 마지막 점수
  return { ensure, status, last, report, next, gymProblems, mastery, regionMastery, gymReady, mastered, sk, typesOf, typeName, maxTier };
})();
