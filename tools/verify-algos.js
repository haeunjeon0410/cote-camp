// 검증: 모범 답안에 적은 알고리즘이 맞는지, 무작위 작은 입력에서 브루트포스와 대조한다
// (그리디·DP·그래프·기출 알고리즘 + 증명에 쓰인 핵심 성질까지)
const { rng } = require('../problems/util');
const R = rng(20261212);
const I = (a, b) => R.int(a, b);
let fails = 0;
const must = (cond, msg) => { if (!cond) { fails++; if (fails < 25) console.log('   FAIL', msg); } };
function section(name, trials, fn) {
  const before = fails;
  for (let t = 0; t < trials; t++) fn(t);
  console.log(`${fails === before ? 'OK  ' : 'FAIL'} ${name} (${trials}회)`);
}
const INF = Infinity;

/* ===== 그리디 ===== */
section('수업 선택(종료 시각 순) = 브루트포스', 400, () => {
  const n = I(1, 9), c = Array.from({ length: n }, () => { const s = I(0, 14); return [s, s + I(1, 5)]; });
  const sorted = [...c].sort((a, b) => a[1] - b[1]);
  let time = -INF, g = 0;
  for (const [s, t] of sorted) if (s >= time) { g++; time = t; }
  let best = 0;
  for (let m = 0; m < 1 << n; m++) {
    const pick = c.filter((_, i) => m >> i & 1);
    let okk = true;
    for (let i = 0; i < pick.length && okk; i++) for (let j = i + 1; j < pick.length; j++) if (!(pick[i][0] >= pick[j][1] || pick[j][0] >= pick[i][1])) { okk = false; break; }
    if (okk) best = Math.max(best, pick.length);
  }
  must(g === best, `수업 선택 ${JSON.stringify(c)} 그리디 ${g} vs ${best}`);
});

section('주유소(가장 먼 곳까지) = 브루트포스, 불가능 판정 포함', 500, () => {
  const L = I(4, 24), K = I(3, 9);
  const pos = []; for (let p = 1; p < L; p++) if (R.next() < 0.4) pos.push(p);
  // 모범 답안의 알고리즘
  const G = [...pos, L]; let position = 0; const stops = []; let impossible = false;
  for (let i = 0; i < pos.length; i++) {
    if (position + K < G[i]) { impossible = true; break; }
    if (position + K < G[i + 1]) { position = G[i]; stops.push(G[i]); }
  }
  if (!impossible && position + K < L) impossible = true;
  // 브루트포스
  let best = null;
  for (let m = 0; m < 1 << pos.length; m++) {
    const s = [0, ...pos.filter((_, i) => m >> i & 1), L];
    if (s.every((v, i) => i === 0 || v - s[i - 1] <= K)) best = best === null ? s.length - 2 : Math.min(best, s.length - 2);
  }
  must((best === null) === impossible, `주유소 가능성 L=${L} K=${K} ${pos}`);
  if (best !== null && !impossible) must(stops.length === best, `주유소 횟수 L=${L} K=${K} ${pos}: ${stops.length} vs ${best}`);
  // 증명의 핵심(stays ahead): 그리디의 i번째 위치 >= 임의 해의 i번째 위치
  if (best !== null) for (let m = 0; m < 1 << pos.length; m++) {
    const s = pos.filter((_, i) => m >> i & 1), full = [0, ...s, L];
    if (!full.every((v, i) => i === 0 || v - full[i - 1] <= K)) continue;
    for (let i = 0; i < Math.min(s.length, stops.length); i++) must(stops[i] >= s[i], `stays ahead 위반 L=${L} K=${K} ${pos}`);
  }
});

section('강의실 배정(시작 순 + 힙) = 최대 겹침 수', 400, () => {
  const n = I(1, 10), c = Array.from({ length: n }, () => { const s = I(0, 14); return [s, s + I(1, 6)]; }).sort((a, b) => a[0] - b[0]);
  const heap = [c[0][1]];
  for (let i = 1; i < n; i++) {
    heap.sort((a, b) => a - b);
    if (c[i][0] >= heap[0]) heap.shift();
    heap.push(c[i][1]);
  }
  let depth = 0;
  for (const [s] of c) depth = Math.max(depth, c.filter(([a, b]) => a <= s && s < b).length);
  must(heap.length === depth, `강의실 ${JSON.stringify(c)}: ${heap.length} vs ${depth}`);
});

section('허프만(가장 작은 둘 합치기) = 브루트포스 최적 병합', 300, () => {
  const f = Array.from({ length: I(2, 6) }, () => I(1, 9));
  const greedy = (() => { const a = [...f]; let cost = 0; while (a.length > 1) { a.sort((x, y) => x - y); const x = a.shift(), y = a.shift(); cost += x + y; a.push(x + y); } return cost; })();
  const brute = a => { if (a.length === 1) return 0; let best = INF; for (let i = 0; i < a.length; i++) for (let j = i + 1; j < a.length; j++) { const rest = a.filter((_, k) => k !== i && k !== j); best = Math.min(best, a[i] + a[j] + brute([...rest, a[i] + a[j]])); } return best; };
  must(greedy === brute(f), `허프만 ${f}: ${greedy} vs ${brute(f)}`);
});

section('가장 무거운 액체(밀도 순) = 브루트포스', 300, () => {
  const n = I(1, 4), b = Array.from({ length: n }, () => ({ v: I(1, 6), w: I(1, 9) })), c = I(1, 14);
  let rem = c, tot = 0;
  for (const x of [...b].sort((p, q) => q.w / q.v - p.w / p.v)) { const take = Math.min(rem, x.v); tot += take * x.w / x.v; rem -= take; }
  let best = 0;
  const rec = (i, left, val) => { if (i === n) { best = Math.max(best, val); return; } for (let a = 0; a <= Math.min(left, b[i].v); a++) rec(i + 1, left - a, val + a * b[i].w / b[i].v); };
  rec(0, c, 0);
  must(Math.abs(tot - best) < 1e-9, `액체 ${JSON.stringify(b)} c=${c}: ${tot} vs ${best}`);
});

{ // 0/1 배낭 반례 (문제 g4 (b))
  const items = [[1, 1], [7, 2], [18, 5], [22, 6], [28, 7]], cap = 11; // (가치, 무게)
  let w = cap, val = 0;
  for (const [v, wt] of [...items].sort((a, b) => b[0] / b[1] - a[0] / a[1]) ) if (wt <= w) { w -= wt; val += v; }
  let best = 0;
  for (let m = 0; m < 1 << items.length; m++) { let tw = 0, tv = 0; items.forEach((it, i) => { if (m >> i & 1) { tw += it[1]; tv += it[0]; } }); if (tw <= cap) best = Math.max(best, tv); }
  const okk = val === 36 && best === 40;
  if (!okk) fails++;
  console.log(`${okk ? 'OK  ' : 'FAIL'} 0/1 배낭 반례: 밀도 순 그리디 ${val}, 최적 ${best} (문제에는 36, 40으로 적음)`);
}

section('최대 지연(마감 순) = 브루트포스', 200, () => {
  const n = I(1, 6), j = Array.from({ length: n }, () => ({ t: I(1, 5), d: I(1, 15) }));
  const lat = order => { let f = 0, m = 0; for (const x of order) { f += x.t; m = Math.max(m, Math.max(0, f - x.d)); } return m; };
  const perm = (a, p = []) => a.length ? Math.min(...a.map((x, i) => perm(a.filter((_, k) => k !== i), [...p, x]))) : lat(p);
  must(lat([...j].sort((a, b) => a.d - b.d)) === perm(j), `최대 지연 ${JSON.stringify(j)}`);
});

/* ===== 그래프 ===== */
const randGraph = (n, p, wlo, whi) => { const E = []; for (let u = 0; u < n; u++) for (let v = 0; v < n; v++) if (u !== v && R.next() < p) E.push([u, v, I(wlo, whi)]); return E; };
const floyd = (n, E) => { const d = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 0 : INF))); for (const [u, v, w] of E) d[u][v] = Math.min(d[u][v], w); for (let k = 0; k < n; k++) for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) if (d[i][k] + d[k][j] < d[i][j]) d[i][j] = d[i][k] + d[k][j]; return d; };

function bellmanFord(n, E, s) { const dist = Array(n).fill(INF); dist[s] = 0; for (let it = 0; it < n - 1; it++) for (const [u, v, w] of E) if (dist[u] + w < dist[v]) dist[v] = dist[u] + w; const neg = E.some(([u, v, w]) => dist[u] + w < dist[v]); return { dist, neg }; }
function dijkstra(n, E, s) { // 수업의 pop / relax 방식 (최솟값 선택), pop 순서 단조성(claim 1)과 pop 이후 불변(claim 2) 점검
  const dist = Array(n).fill(INF); dist[s] = 0; const done = Array(n).fill(false); let last = -INF;
  for (let k = 0; k < n; k++) { let u = -1; for (let i = 0; i < n; i++) if (!done[i] && (u < 0 || dist[i] < dist[u])) u = i; if (dist[u] === INF) break;
    must(dist[u] >= last, 'Dijkstra claim 1(pop 순서 단조성) 위반'); last = dist[u]; done[u] = true;
    for (const [a, b, w] of E) if (a === u) { must(!(done[b] && dist[u] + w < dist[b]), 'Dijkstra claim 2(pop 이후 불변) 위반'); if (dist[u] + w < dist[b]) dist[b] = dist[u] + w; } }
  return dist;
}

section('Dijkstra = Bellman-Ford = Floyd (비음수 가중치) + claim 1·2', 400, () => {
  const n = I(2, 7), E = randGraph(n, 0.4, 0, 9), s = I(0, n - 1), fl = floyd(n, E)[s];
  const dj = dijkstra(n, E, s), bf = bellmanFord(n, E, s).dist;
  for (let v = 0; v < n; v++) must(dj[v] === fl[v] && bf[v] === fl[v], `최단경로 n=${n} s=${s} v=${v}: dj ${dj[v]} bf ${bf[v]} fl ${fl[v]}`);
});

section('Bellman-Ford = Floyd (음수 간선, 음수 사이클 없음: 퍼텐셜 기법)', 400, () => {
  const n = I(2, 7), p = Array.from({ length: n }, () => I(-5, 5)), E = [];
  for (let u = 0; u < n; u++) for (let v = 0; v < n; v++) if (u !== v && R.next() < 0.4) E.push([u, v, I(0, 4) + p[u] - p[v]]);
  const s = I(0, n - 1), fl = floyd(n, E)[s], r = bellmanFord(n, E, s);
  must(!r.neg, '음수 사이클이 없는데 검출됨');
  for (let v = 0; v < n; v++) must(r.dist[v] === fl[v], `BF n=${n} v=${v}: ${r.dist[v]} vs ${fl[v]}`);
});

section('Bellman-Ford 음수 사이클 검출 = Floyd 기준 도달 가능한 음수 사이클', 500, () => {
  const n = I(2, 6), E = randGraph(n, 0.45, -4, 6), s = I(0, n - 1), d = floyd(n, E);
  const hasNeg = [...Array(n).keys()].some(v => d[v][v] < 0 && d[s][v] < INF);
  must(bellmanFord(n, E, s).neg === hasNeg, `음수 사이클 n=${n} ${JSON.stringify(E)} s=${s}`);
});

section('BFS(SSSP, InitSSSP/Relax 형식) = Floyd (무가중치)', 400, () => {
  const n = I(2, 8), E = randGraph(n, 0.3, 1, 1), s = I(0, n - 1), dist = Array(n).fill(INF); dist[s] = 0; const q = [s];
  while (q.length) { const u = q.shift(); for (const [a, b] of E) if (a === u && dist[b] > dist[u] + 1) { dist[b] = dist[u] + 1; q.push(b); } }
  const fl = floyd(n, E)[s]; for (let v = 0; v < n; v++) must(dist[v] === fl[v], `BFS v=${v}`);
});

section('그래프 탐색(bag: 스택/큐)은 도달 가능한 정점만 정확히 mark', 400, () => {
  const n = I(1, 8), E = randGraph(n, 0.25, 1, 1), s = I(0, n - 1);
  const reach = new Set([s]); for (let ch = true; ch;) { ch = false; for (const [a, b] of E) if (reach.has(a) && !reach.has(b)) { reach.add(b); ch = true; } }
  for (const mode of ['stack', 'queue']) {
    const bag = [s], mark = new Set();
    while (bag.length) { const u = mode === 'stack' ? bag.pop() : bag.shift(); if (!mark.has(u)) { mark.add(u); for (const [a, b] of E) if (a === u) bag.push(b); } }
    must(mark.size === reach.size && [...mark].every(x => reach.has(x)), `탐색(${mode}) mark 집합 불일치`);
  }
});

function dfsAll(n, E) { // 수업의 DFS with clock + 상태(new/active/finished)
  const pre = Array(n).fill(0), post = Array(n).fill(0), st = Array(n).fill('new'); let clock = 0, back = false; const order = [];
  const adj = Array.from({ length: n }, () => []); for (const [u, v] of E) adj[u].push(v);
  const go = v => { st[v] = 'active'; pre[v] = ++clock; for (const w of adj[v]) { if (st[w] === 'active') back = true; else if (st[w] === 'new') go(w); } post[v] = ++clock; st[v] = 'finished'; order.push(v); };
  for (let v = 0; v < n; v++) if (st[v] === 'new') go(v);
  return { pre, post, back, order };
}
const kahnCycle = (n, E) => { const ind = Array(n).fill(0); for (const [, v] of E) ind[v]++; const q = [...Array(n).keys()].filter(v => !ind[v]); let seen = 0; while (q.length) { const u = q.pop(); seen++; for (const [a, b] of E) if (a === u && --ind[b] === 0) q.push(b); } return seen < n; };

section('사이클 검출: back edge 여부 = 사이클 여부 (Kahn 기준)', 600, () => {
  const n = I(1, 7), E = randGraph(n, 0.25, 1, 1).filter(([u, v]) => u !== v);
  must(dfsAll(n, E).back === kahnCycle(n, E), `사이클 n=${n} ${JSON.stringify(E)}`);
});

section('위상 정렬: DAG에서 모든 간선 uv가 v.post < u.post, 후위의 역순이 위상 순서', 500, () => {
  const n = I(1, 8), perm = [...Array(n).keys()].sort(() => R.next() - 0.5), E = [];
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) if (R.next() < 0.3) E.push([perm[i], perm[j]]);
  const { post, order } = dfsAll(n, E), topo = [...order].reverse(), where = Object.fromEntries(topo.map((v, i) => [v, i]));
  for (const [u, v] of E) { must(post[v] < post[u], `v.post<u.post ${u}→${v}`); must(where[u] < where[v], `위상 순서 ${u}→${v}`); }
});

section('최단 졸업(DAG DP) = 최장 경로 브루트포스', 400, () => {
  const n = I(1, 8), perm = [...Array(n).keys()].sort(() => R.next() - 0.5), E = [];
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) if (R.next() < 0.3) E.push([perm[i], perm[j]]);
  const { order } = dfsAll(n, E), topo = [...order].reverse(), sem = Array(n).fill(1);
  for (const u of topo) for (const [a, b] of E) if (a === u) sem[b] = Math.max(sem[b], sem[u] + 1);
  const longest = v => 1 + Math.max(0, ...E.filter(([, b]) => b === v).map(([a]) => longest(a)));
  must(Math.max(...sem) === Math.max(...[...Array(n).keys()].map(longest)), `최단 졸업 n=${n} ${JSON.stringify(E)}`);
});

/* ===== MST ===== */
function uf(n) { const p = [...Array(n).keys()], r = Array(n).fill(0); const find = x => (p[x] === x ? x : (p[x] = find(p[x]))); const union = (a, b) => { a = find(a); b = find(b); if (a === b) return; if (r[a] < r[b]) p[a] = b; else if (r[a] > r[b]) p[b] = a; else { p[a] = b; r[b]++; } }; return { find, union }; }
function randConnected(n, distinct) { const E = []; for (let v = 1; v < n; v++) E.push([I(0, v - 1), v]); for (let u = 0; u < n; u++) for (let v = u + 1; v < n; v++) if (R.next() < 0.3 && !E.some(([a, b]) => (a === u && b === v) || (a === v && b === u))) E.push([u, v]);
  const w = distinct ? [...Array(E.length).keys()].sort(() => R.next() - 0.5).map(x => x + 1) : E.map(() => I(1, 4)); return E.map(([u, v], i) => [u, v, w[i]]); }
function bruteMST(n, E) { let best = INF, count = 0, sets = []; const m = E.length; for (let mask = 0; mask < 1 << m; mask++) { let c = 0, ww = 0; for (let i = 0; i < m; i++) if (mask >> i & 1) { c++; ww += E[i][2]; } if (c !== n - 1) continue; const f = uf(n); let tree = true; for (let i = 0; i < m && tree; i++) if (mask >> i & 1) { if (f.find(E[i][0]) === f.find(E[i][1])) tree = false; else f.union(E[i][0], E[i][1]); } if (!tree) continue; if (ww < best) { best = ww; count = 1; sets = [mask]; } else if (ww === best) { count++; sets.push(mask); } } return { best, count, sets }; }
const kruskal = (n, E, onAdd) => { const f = uf(n), F = []; const idx = E.map((_, i) => i).sort((a, b) => E[a][2] - E[b][2]); for (const i of idx) { const [u, v] = E[i]; if (f.find(u) !== f.find(v)) { onAdd && onAdd(i, F); F.push(i); f.union(u, v); } } return F; };
const prim = (n, E) => { const inT = Array(n).fill(false); inT[0] = true; const F = []; for (let k = 1; k < n; k++) { let bi = -1; E.forEach(([u, v, w], i) => { if (inT[u] !== inT[v] && (bi < 0 || w < E[bi][2])) bi = i; }); F.push(bi); inT[E[bi][0]] = inT[E[bi][1]] = true; } return F; };

section('Kruskal = Prim = 브루트포스 MST 가중치 (가중치 중복 허용)', 300, () => {
  const n = I(2, 6), E = randConnected(n, false), b = bruteMST(n, E), sum = F => F.reduce((s, i) => s + E[i][2], 0);
  must(sum(kruskal(n, E)) === b.best && sum(prim(n, E)) === b.best, `MST n=${n}`);
});

section('가중치가 모두 다르면 MST 유일 + Kruskal/Prim 같은 간선 집합 (Unique MST lemma)', 300, () => {
  const n = I(2, 6), E = randConnected(n, true), b = bruteMST(n, E);
  must(b.count === 1, `MST 유일 아님 n=${n}`);
  const mk = F => F.reduce((m, i) => m | (1 << i), 0);
  must(mk(kruskal(n, E)) === b.sets[0] && mk(prim(n, E)) === b.sets[0], 'Kruskal/Prim 간선 집합 불일치');
});

section('Safe edge lemma: 임의의 S를 가로지르는 가장 가벼운 간선은 MST에 속함', 300, () => {
  const n = I(2, 6), E = randConnected(n, true), b = bruteMST(n, E), T = b.sets[0], S = I(1, (1 << n) - 2);
  const cross = E.map((e, i) => [e, i]).filter(([[u, v]]) => (S >> u & 1) !== (S >> v & 1));
  if (cross.length) { const lightest = cross.reduce((a, c) => (c[0][2] < a[0][2] ? c : a)); must(T >> lightest[1] & 1, 'safe edge가 MST에 없음'); }
});

section('Kruskal 정확성 논증: 추가되는 간선은 u의 컴포넌트 S를 가로지르는 가장 가벼운 간선', 300, () => {
  const n = I(2, 7), E = randConnected(n, true);
  kruskal(n, E, (i, F) => { const f = uf(n); for (const j of F) f.union(E[j][0], E[j][1]); const r = f.find(E[i][0]); const inS = x => f.find(x) === r;
    for (const [u, v, w] of E) if (inS(u) !== inS(v)) must(w >= E[i][2], 'S를 가로지르는 더 가벼운 간선이 있음'); });
});

/* ===== 기출/DP 알고리즘 ===== */
section('Inversion 개수(합병 정렬 변형) = O(n^2) 브루트포스', 400, () => {
  const a = Array.from({ length: I(0, 12) }, () => I(0, 6));
  const cnt = arr => { if (arr.length <= 1) return [arr, 0]; const mid = arr.length >> 1, [L, x] = cnt(arr.slice(0, mid)), [Rr, y] = cnt(arr.slice(mid)); let i = 0, j = 0, c = 0; const out = []; while (i < L.length || j < Rr.length) { if (j >= Rr.length || (i < L.length && L[i] <= Rr[j])) out.push(L[i++]); else { out.push(Rr[j++]); c += L.length - i; } } return [out, x + y + c]; };
  let br = 0; for (let i = 0; i < a.length; i++) for (let j = i + 1; j < a.length; j++) if (a[i] > a[j]) br++;
  must(cnt(a)[1] === br, `inversion ${a}`);
});

section('2/3 정렬(RecSort): 정렬 성공 + "앞의 두 호출 뒤 가장 큰 t개가 맨 뒤에 정렬" 성질', 400, () => {
  const a = Array.from({ length: I(1, 22) }, () => I(0, 30));
  const rec = L => { const n = L.length; if (n <= 1) return L.slice(); if (n === 2) return L[0] > L[1] ? [L[1], L[0]] : L.slice(); const t = Math.floor(n / 3); let X = [...rec(L.slice(0, n - t)), ...L.slice(n - t)]; X = [...X.slice(0, t), ...rec(X.slice(t))];
    const top = [...L].sort((p, q) => p - q).slice(n - t); must(JSON.stringify(X.slice(n - t)) === JSON.stringify(top), `앞의 두 호출 뒤 상위 t개 위치 ${L}`); return [...rec(X.slice(0, n - t)), ...X.slice(n - t)]; };
  must(JSON.stringify(rec(a)) === JSON.stringify([...a].sort((p, q) => p - q)), `RecSort ${a}`);
});

section('최단 공통 포함 문자열 길이(DP) = 브루트포스', 120, () => {
  const rs = () => Array.from({ length: I(1, 5) }, () => 'ab'[I(0, 1)]).join(''), X = rs(), Y = rs();
  const dp = Array.from({ length: X.length + 1 }, (_, i) => Array.from({ length: Y.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)));
  for (let i = 1; i <= X.length; i++) for (let j = 1; j <= Y.length; j++) dp[i][j] = X[i - 1] === Y[j - 1] ? dp[i - 1][j - 1] + 1 : 1 + Math.min(dp[i - 1][j], dp[i][j - 1]);
  const isSub = (s, t) => { let k = 0; for (const c of t) if (c === s[k]) k++; return k === s.length; };
  let best = 0; for (let L = Math.max(X.length, Y.length); L <= X.length + Y.length && !best; L++) for (let m = 0; m < 1 << L; m++) { const s = Array.from({ length: L }, (_, i) => 'ab'[m >> i & 1]).join(''); if (isSub(X, s) && isSub(Y, s)) { best = L; break; } }
  must(dp[X.length][Y.length] === best, `SCS ${X} ${Y}: ${dp[X.length][Y.length]} vs ${best}`);
});

section('팰린드롬 분할 개수(DP) = 브루트포스', 300, () => {
  const s = Array.from({ length: I(1, 10) }, () => 'ab'[I(0, 1)]).join(''), n = s.length, isP = (a, b) => { while (a < b) if (s[a++] !== s[b--]) return false; return true; };
  const pal = Array.from({ length: n }, () => Array(n).fill(false)); for (let len = 1; len <= n; len++) for (let a = 0; a + len <= n; a++) { const b = a + len - 1; pal[a][b] = s[a] === s[b] && (len <= 2 || pal[a + 1][b - 1]); }
  const dp = Array(n + 1).fill(0); dp[0] = 1; for (let i = 1; i <= n; i++) for (let j = 0; j < i; j++) if (pal[j][i - 1]) dp[i] += dp[j];
  const brute = i => (i === n ? 1 : [...Array(n - i).keys()].reduce((c, k) => c + (isP(i, i + k) ? brute(i + k + 1) : 0), 0));
  must(dp[n] === brute(0), `팰린드롬 분할 ${s}: ${dp[n]} vs ${brute(0)}`);
});

const randTree = () => { const n = I(1, 10); return { n, par: Array.from({ length: n }, (_, v) => (v === 0 ? -1 : I(0, v - 1))) }; };
section('트리 최소 정점 커버(트리 DP) = 브루트포스', 300, () => {
  const { n, par } = randTree(), ch = Array.from({ length: n }, () => []); par.forEach((p, v) => { if (p >= 0) ch[p].push(v); });
  const f = v => { let in1 = 1, in0 = 0; for (const c of ch[v]) { const [a0, a1] = f(c); in1 += Math.min(a0, a1); in0 += a1; } return [in0, in1]; };
  let best = INF; for (let m = 0; m < 1 << n; m++) if (par.every((p, v) => p < 0 || (m >> p & 1) || (m >> v & 1))) { let c = 0; for (let i = 0; i < n; i++) c += m >> i & 1; best = Math.min(best, c); }
  must(Math.min(...f(0)) === best, `정점 커버 ${par}`);
});

section('트리 완전 매칭 판별(need/done) = 브루트포스', 400, () => {
  const { n, par } = randTree(), ch = Array.from({ length: n }, () => []); par.forEach((p, v) => { if (p >= 0) ch[p].push(v); });
  let ok = true; const state = v => { let need = 0; for (const c of ch[v]) if (state(c) === 'need') need++; if (need >= 2) { ok = false; return 'done'; } return need === 1 ? 'done' : 'need'; };
  const mine = state(0) === 'done' && ok;
  const nb = Array.from({ length: n }, () => []); par.forEach((p, v) => { if (p >= 0) { nb[p].push(v); nb[v].push(p); } });
  const brute = used => { const v = used.findIndex(x => !x); if (v < 0) return true; used[v] = true; for (const w of nb[v]) if (!used[w]) { used[w] = true; if (brute(used)) { used[w] = false; used[v] = false; return true; } used[w] = false; } used[v] = false; return false; };
  must(mine === brute(Array(n).fill(false)), `완전 매칭 ${par}`);
});

section('트리의 지름(높이 두 개의 합) = 모든 쌍 BFS', 300, () => {
  const { n, par } = randTree(), ch = Array.from({ length: n }, () => []); par.forEach((p, v) => { if (p >= 0) ch[p].push(v); });
  let diam = 0; const h = v => { const hs = ch[v].map(c => h(c) + 1).sort((a, b) => b - a); diam = Math.max(diam, (hs[0] || 0) + (hs[1] || 0)); return hs[0] || 0; }; h(0);
  const E = par.flatMap((p, v) => (p >= 0 ? [[p, v, 1], [v, p, 1]] : [])), d = floyd(n, E);
  must(diam === Math.max(...d.flat().filter(x => x < INF)), `지름 ${par}`);
});

section('이분 그래프 판별(BFS 2-coloring) = 브루트포스', 300, () => {
  const n = I(1, 7), E = randGraph(n, 0.25, 1, 1).filter(([u, v]) => u < v);
  const color = Array(n).fill(-1); let bip = true;
  for (let s = 0; s < n; s++) if (color[s] < 0) { color[s] = 0; const q = [s]; while (q.length) { const u = q.shift(); for (const [a, b] of E) { const w = a === u ? b : b === u ? a : -1; if (w < 0) continue; if (color[w] < 0) { color[w] = 1 - color[u]; q.push(w); } else if (color[w] === color[u]) bip = false; } } }
  let br = false; for (let m = 0; m < 1 << n && !br; m++) if (E.every(([u, v]) => (m >> u & 1) !== (m >> v & 1))) br = true;
  must(bip === br, `이분 그래프 n=${n} ${JSON.stringify(E)}`);
});

console.log(fails ? `\n실패 ${fails}건` : '\n전부 통과');
process.exit(fails ? 1 : 0);
