/* 지역 화면과 조우: '이어서 도전하기'를 누르면 야생 포켓몬(= 이번에 풀 문제)이 나타나고,
   문제를 풀면 그게 몬스터볼 던지기다. 못 잡으면 다른 문제로 또 던지고, 지치면 도망친다(포기). */
const BASE_RATE = [.70, .55, .40, .30];    // 희귀할수록 잡기 어렵다
const TIER_W = { 1: [.60, .35, .05, 0], 2: [.20, .40, .35, .05], 3: [0, .15, .50, .35], 4: [0, .05, .35, .60] };
// 배지를 모두 모으면 끝나지 않고 '마스터 로드'로 이어진다: 모든 유형에서 더 어려운 문제가 계속 나온다
const masterMode = () => WEEKS.every((_, i) => regionDone(i));   // 문제 난이도 → 포켓몬 희귀도 (어려운 문제일수록 희귀한 포켓몬)

function rollSpeciesTier(region, tier, boss) {
  // 어려운 문제일수록 희귀한 포켓몬. 진화형은 야생에 없고, 전설 포켓몬은 마스터 로드의 가장 어려운 문제에서 아주 드물게 나온다
  if (tier >= 4 && Math.random() < .12) { const l = LEGEND_LEFT(); if (l.length) return l[Math.floor(Math.random() * l.length)]; }
  const sps = regionSpecies(region).filter(s => !s.from && s.k < 3);
  const pool = sps.length ? sps : SPECIES.filter(s => !s.from && s.k < 3);
  const w = boss ? [0, .2, .8] : (TIER_W[tier] || TIER_W[2]);
  const buckets = [0, 1, 2].map(k => pool.filter(s => s.k === k)).map((arr, k) => ({ arr, w: arr.length ? w[k] : 0 }));
  let tot = buckets.reduce((x, b) => x + b.w, 0);
  if (!tot) { const any = buckets.filter(b => b.arr.length); const pick = any[Math.floor(Math.random() * any.length)]; return pick.arr[Math.floor(Math.random() * pick.arr.length)]; }
  let r = Math.random() * tot;
  for (const bk of buckets) { r -= bk.w; if (r <= 0 && bk.arr.length) return bk.arr[Math.floor(Math.random() * bk.arr.length)]; }
  return pool[0];
}

/* ---------- 지역 화면: 이 앱의 목적은 코테 연습이라 걷거나 탐색하는 단계가 없다. 코치가 오늘 이어서 할 것을 말해 주고, 바로 도전한다 ---------- */
let moving = false;   // (다른 곳에서 초기화만 한다)
// 오박사의 말: 상황마다 여러 문장 중 하나를 고른다. 같은 말이 연달아 나오지 않고, 시간대·연속 일수·파트너에 따라 달라진다
const OAK = {
  making: ['이 지역의 문제를 준비하고 있단다. 1분쯤 걸리니 잠시 기다려 주렴.', '새 문제를 만드는 중이란다. 차 한잔 하고 오면 다 되어 있을 게다.'],
  enc: ['풀던 문제가 남아 있구나, 트레이너. 이어서 풀어 보렴.', '아직 끝내지 못한 문제가 있단다. 마저 풀어 보자꾸나.', '그 포켓몬이 기다리고 있단다. 이어서 도전해 보렴.'],
  cap: ['오늘 준비할 수 있는 새 문제는 다 썼단다. 있는 문제로 이어서 풀어 보렴.', '새 문제는 오늘 몫을 다 만들었구나. 있는 문제를 한 번 더 다져 보자.'],
  done: ['{badge}를 땄구나. 지도에서 다음 지역으로 떠나 보렴.', '{badge}를 손에 넣었구나. 다음 지역이 기다리고 있단다.'],
  master: ['마스터 로드란다, 트레이너. 더 어려운 문제가 기다리고 있지.', '여기까지 오다니 대단하구나. 이제부터는 끝이 없단다.', '이제 진짜 승부란다. 어려운 문제일수록 배울 것도 많은 법이지.'],
  ready: ['이 정도면 충분히 익혔구나. 체육관에 도전해 봐도 좋겠다.', '체육관에 도전할 때가 된 것 같구나. 자신 있으면 가 보렴.', '준비가 다 된 것 같구나, 트레이너. 관장이 기다리고 있을 게다.'],
  hard: ['방금 문제는 어려웠구나. 비슷한 문제로 한 번 더 해 보렴.', '막히는 건 이상한 일이 아니란다. 같은 유형으로 다시 해 보자꾸나.', '어려운 문제였지. 한 번 더 풀면 분명 달라질 게다.'],
  good: ['잘하고 있구나, 트레이너.', '방금은 아주 깔끔했단다. 이 기세로 가 보렴.', '좋구나. 점점 감을 잡아 가고 있단다.', '훌륭하구나. 박사로서 흐뭇하단다.'],
  due: ['센터에 복습할 문제가 있단다. 들러 보렴.', '예전에 푼 문제 중에 다시 볼 게 있다는구나. 센터에서 한번 풀어 보렴.'],
  today: ['오늘도 꾸준히 풀고 있구나.', '벌써 여러 문제를 풀었구나. 잘하고 있단다.', '오늘도 왔구나. 좋은 습관이란다.'],
  streak: ['꾸준히 이어 가고 있구나. 그게 제일 어려운 법이란다.', '매일 오는 건 쉬운 일이 아니란다. 기록은 거짓말을 하지 않지.'],
  partner: ['{partner} 녀석, 오늘도 네 곁에서 잘 따르고 있구나.', '{partner}{ga} 기운이 넘치는구나. 너를 닮았나 보다.', '{partner}{ga} 연구소를 돌아다니고 있단다. 활기가 넘치는구나.'],
  dex: ['도감이 조금씩 채워지고 있구나. 이 박사의 꿈에 한 걸음 가까워졌단다.', '많이도 모았구나. 도감이 점점 풍성해지는구나.'],
  morning: ['좋은 아침이구나, 트레이너. 아침에 푸는 문제는 머리에 잘 남는단다.', '일찍 일어났구나. 오늘은 어떤 포켓몬을 만나게 될까.'],
  noon: ['어서 오렴, 트레이너. 오늘은 어떤 문제를 풀어 볼 테냐.', '왔구나. 오늘도 한 걸음씩 가 보자꾸나.'],
  evening: ['저녁이 되었구나. 오늘 하루의 마무리로 한 문제 어떠냐.', '해가 저물었구나. 하루를 정리하며 한 문제 풀어 보렴.'],
  night: ['밤늦게까지 애쓰는구나. 무리하지는 말거라.', '이 시간에도 공부를 하다니. 그래도 잠은 자야 한단다.'],
  first: ['어서 오렴, 트레이너. 오늘은 한 문제만 풀어도 충분하단다.', '오늘도 만나 반갑구나. 한 문제부터 시작해 보자꾸나.'],
  menu: ['무엇을 보고 싶으냐, 트레이너.', '도감도 좋고 지도도 좋단다. 천천히 둘러보렴.', '필요한 게 있으면 말하거라.'],
};
let lastOak = '';
function oakLine(kind) {
  if (kind !== 'menu' && S.note) { const n = S.note; S.note = ''; return n; }
  const r = scene && scene.region != null ? scene.region : 0, st = Coach.status(), due = dueList().length, t = todaySolved(), last = Coach.last(), streakN = streak();
  const sp = S.last && SP[S.last] ? SP[S.last] : null, hr = new Date().getHours(), n = Object.keys(S.dex).filter(k => S.dex[k].caught > 0).length;
  const fill = s => s.replace('{badge}', (WEEKS[r] || {}).badge || '').replace('{t}', t).replace(/\{streak\}/g, streakN).replace('{n}', n).replace('{partner}', sp ? sp.name : '').replace('{ga}', sp ? iga(sp.name).slice(-1) : '');
  const pick = key => {
    const all = OAK[key].map(fill), arr = all.filter(x => x !== lastOak), use = arr.length ? arr : all;
    const s = use[Math.floor(Math.random() * use.length)]; lastOak = s; return s;
  };
  if (kind === 'menu') return pick(Math.random() < .5 && sp ? 'partner' : 'menu');
  if (!masterMode() && st === 'making' && !Coach.typesOf(r).some(x => P.some(p => p.type === x))) return pick('making');
  if (ENC) return pick('enc');
  if (st === 'cap') return pick('cap');
  if (regionDone(r) && !masterMode()) return pick('done');
  if (gymReady(r)) return pick('ready');
  if (last === 0) return pick('hard');
  // 그 밖에는 형편이 닿는 말 중에서 섞어서 고른다
  const pool = ['first'];
  if (last === 2) pool.push('good', 'good');
  if (due) pool.push('due');
  if (t) pool.push('today', 'today');
  if (streakN >= 3) pool.push('streak');
  if (sp) pool.push('partner', 'partner');
  if (n >= 5) pool.push('dex');
  if (masterMode()) pool.push('master', 'master');
  pool.push(hr < 5 ? 'night' : hr < 11 ? 'morning' : hr < 17 ? 'noon' : hr < 22 ? 'evening' : 'night');
  return pick(pool[Math.floor(Math.random() * pool.length)]);
}
const coachSay = () => oakLine();

/* ---------- 잡은 포켓몬이 연구소를 돌아다닌다: 눌러 보면 반응한다 ---------- */
let WANDER = null;
function wander() {
  if (WANDER) { clearInterval(WANDER); WANDER = null; }
  const sc = document.querySelector('#top .scene'); if (!sc) return;
  const ids = Object.keys(S.dex).filter(k => S.dex[k].caught > 0 && SP[k]);
  if (!ids.length) return;
  const first = S.last && ids.includes(S.last) ? [S.last] : [];
  const list = first.concat(ids.filter(k => !first.includes(k)).sort(() => Math.random() - .5)).slice(0, 8);
  const box = document.createElement('div'); box.className = 'wd-layer'; sc.appendChild(box);
  const place = p => { p.s.style.left = (p.x + 7) + 'px'; p.s.style.top = (p.y + 24) + 'px'; p.s.style.zIndex = Math.round(p.y) - 1; p.e.style.left = p.x + 'px'; p.e.style.top = (p.y - (p.step ? 1 : 0)) + 'px'; p.e.style.transform = p.dir > 0 ? 'scaleX(-1)' : ''; p.e.style.zIndex = Math.round(p.y); };
  const pets = list.map(k => {
    const e = document.createElement('img'); e.className = 'wd'; e.src = spr.icon(SP[k].dex); e.alt = ''; box.appendChild(e);
    const s = document.createElement('img'); s.className = 'wds'; s.src = Art.shadow(26, 6); s.alt = ''; box.insertBefore(s, e);
    const p = { s, e, k, x: 8 + Math.random() * 200, y: 86 + Math.random() * 20, dir: Math.random() < .5 ? -1 : 1, wait: 0, step: false };
    e.onclick = () => { p.wait = 4; e.classList.remove('hop'); void e.offsetWidth; e.classList.add('hop'); showNote(`${SP[k].name} · Lv.${levelOf(S.dex[k])}`); };
    place(p); return p;
  });
  WANDER = setInterval(() => {
    if (!box.isConnected) { clearInterval(WANDER); WANDER = null; return; }
    for (const p of pets) {
      if (p.wait > 0) { p.wait--; continue; }
      if (Math.random() < .14) { p.wait = 2 + Math.floor(Math.random() * 6); continue; }
      if (Math.random() < .08) p.dir *= -1;
      p.x += p.dir * 4; if (p.x < 6) { p.x = 6; p.dir = 1; } if (p.x > 210) { p.x = 210; p.dir = -1; }
      if (Math.random() < .06) p.y = Math.max(84, Math.min(108, p.y + (Math.random() < .5 ? -4 : 4)));
      p.step = !p.step; place(p);
    }
  }, 450);
}
SCENES.field = {
  paint() { return Art.pt('indoor1', null); },
  items() {
    const r = scene.region, w = WEEKS[r];
    return [
      { id: 'go', ic: img(item('poke-ball')), t: ENC ? '이어서 풀기' : '이어서 도전하기' },
      ...(ENC ? [{ id: 'skip', t: '다른 문제로 바꾸기' }] : []),
      ...(masterMode() ? [] : [{ id: 'gym', ic: img(FieldArt.badge(w.type, r, regionDone(r) || gymReady(r))), t: '체육관 도전', s: regionDone(r) ? '획득' : gymReady(r) ? '도전 가능' : '준비 중', off: regionDone(r) }]),
    ];
  },
  top() {
    if (!scene.init) { scene.init = true; S.region = scene.region; save(); Coach.ensure(scene.region); }
    const r = scene.region;
    return `<div class="scene"><canvas id="bg" width="256" height="192"></canvas><img class="oshadow" src="${Art.shadow(52, 9)}" alt="">${img(trainer('oak'), 'oakc')}<div id="partner"></div>
      ${sayBox('오박사')}</div>`;
  },
  bot() {
    const r = scene.region, its = this.items();
    const btn = (it, i) => `<div class="big ${it.id === 'go' ? 'p' : it.id === 'skip' ? 'q' : 'm'} ${i === cur ? 'on' : ''}" data-i="${i}"><span class="ic">${it.ic || ''}</span><span class="tx"><b>${esc(it.t)}</b>${it.s ? `<i>${esc(it.s)}</i>` : ''}</span></div>`;
    return `<div class="pane"><div class="hd"><b>${masterMode() ? '마스터 로드' : esc(WEEKS[r].title)}</b><span></span></div>
      <div class="bigs">${its.map(btn).join('')}</div>
      <div class="foot">▲▼ 이동 · A 선택 · START 메뉴</div></div>`;
  },
  after() {
    const p = $('#partner'); if (p) p.innerHTML = S.last ? '' : img(item('poke-ball'));
    typeText($('#say'), coachSay(scene.region)); wander();
  },
  moved() { renderBot(); },
  select(i) {
    const id = this.items()[i].id;
    if (id === 'go') { if (ENC) openPC(ENC.probId, ENC); else startEncounter(scene); }
    else if (id === 'skip') skipEncounter();
    else enterGym(scene);
  },
  key(k) {
    if (k === 'B') { go('home'); return true; }   // START와 같다: 메뉴
    if (k === 'X') { go('map', { cur: scene.region }); return true; }
    return false;
  },
};
// 안내 문구를 오박사 말풍선에 바로 보여 준다
function showNote(t) { clearTimers(); const el = $('#say'); if (el) el.textContent = brk(t); }

/* ---------- 조우 = 이번에 풀 문제. 배틀 화면 없이 바로 문제가 열리고, 정답을 낸 뒤에만 결과 화면이 나온다 ---------- */
const baseRate = sp => BASE_RATE[sp.k];
// keep: 못 잡았을 때 같은 포켓몬에 다른 문제로 다시 도전할 때 쓴다
function startEncounter(from, keep) {
  const region = from.region, pick = Coach.next(region, masterMode());
  if (!pick) { Coach.ensure(region); showNote(Coach.status() === 'cap' ? '오늘 준비할 수 있는 새 문제는 다 만들었단다. 내일 다시 오렴.' : '이 지역의 문제를 준비하고 있단다. 1분쯤 걸리니 잠시 기다려 주렴.'); return; }
  const prob = pById(pick.id), sr = masterMode() ? Math.max(0, Math.min(WEEKS.length - 1, (prob.week || 1) - 1)) : region, sp = keep ? keep.sp : rollSpeciesTier(sr, pick.tier, prob.boss), shiny = false;
  const d = S.dex[sp.id] || (S.dex[sp.id] = { seen: 1, caught: 0, shiny: 0 }); d.seen = 1;
  ENC = { sp, d, shiny, region, probId: pick.id, opened: false, wrong: 0, hintsUsed: 0, reported: false };
  S.enc = { sp: sp.id, shiny, region, probId: pick.id }; save();
  clearTimers(); render();   // 뒤의 지역 화면도 갱신해 두고
  openPC(ENC.probId, ENC);
}
// 이번 문제는 넘긴다 (예전의 "도망친다"). 풀어 보려다 넘겼으면 어려웠다는 신호로 본다
function skipEncounter() {
  const E = ENC; if (!E) return;
  if (E.opened && !E.reported) Coach.report(E.probId, 0);
  ENC = null; S.enc = null; save();
  startEncounter(scene);
}
// 이번 문제의 점수: 틀림·힌트 없이 풀면 2, 조금 헤맸으면 1, 많이 헤맸으면 0. (시간은 보지 않는다)
function reportBattle() {
  const s = scene; if (s.reported) return {};
  s.reported = true;
  const wrong = s.wrong || 0, hints = s.hintsUsed || 0;
  const r = Coach.report(s.probId, scoreOf(wrong, hints, s.synUsed || 0), { idea: hints, syn: s.synUsed || 0 });
  Coach.ensure(s.region);
  return r;
}
// 정답을 냈다 → 결과 화면: 볼이 날아가고 잡힐지는 확률
function showResult(E) {
  ENC = null; S.enc = null; save();
  const prev = scene.name === 'field' ? scene : { name: 'field', region: E.region, init: true };
  clearTimers();
  scene = { name: 'battle', sp: E.sp, d: E.d, shiny: E.shiny, region: E.region, probId: E.probId, wrong: E.wrong, hintsUsed: E.hintsUsed, synUsed: E.synUsed || 0, opened: true, reported: false, prev, phase: 'throw', busy: false, caught: false, msg: `정답이다! 야생의 ${E.shiny ? '이로치 ' : ''}${E.sp.name}${iga(E.sp.name)} 나타났다!` };
  cur = 0; render(); FX.enter(); FX.sfx('ok'); timers.push(setTimeout(() => { if (scene.name === 'battle') throwBall(); }, 1300));
}
SCENES.battle = {
  paint() { return Art.pt('forest', 'grass'); },
  items() {
    const s = scene;
    if (s.phase === 'throw') return [{ t: '몬스터볼을 던지는 중…', s: '잠시 기다리기', off: true }];
    return [s.phase === 'caught' ? { ic: img(item('poke-ball')), t: '다음 포켓몬 만나기', s: '바로 이어서 도전' } : { ic: img(item(ballFor(s.sp.k))), t: '다른 문제로 다시 던지기', s: '같은 포켓몬이 아직 있음' },
      { t: '지역 화면으로', s: s.phase === 'caught' ? '잠깐 쉬기' : '다음에 다시 만나기' }];
  },
  top() {
    const s = scene, d = s.d;
    return `<div class="scene"><canvas id="bg" width="256" height="192"></canvas>
      <div class="plate"><b>${esc(s.sp.name)}</b><span>${roleOf(s.sp)}${d.caught ? ` · Lv.${levelOf(d)}` : ''}</span></div>
      <div class="enemy" id="enemy">${img(spr.anim(s.sp.dex, s.shiny))}</div>
      <canvas class="ballc" id="ball" width="30" height="30"></canvas>
      <div class="say" id="emsg">${esc(brk(s.msg))}</div></div>`;
  },
  bot() {
    const s = scene, its = this.items();
    const btn = (it, i) => `<div class="big ${i === 0 ? 'p' : 'q'} ${i === cur ? 'on' : ''} ${it.off ? 'off' : ''}" data-i="${i}"><span class="ic">${it.ic || ''}</span><span class="tx"><b>${esc(it.t)}</b>${it.s ? `<i>${esc(it.s)}</i>` : ''}</span></div>`;
    return `<div class="pane"><div class="hd"><b>결과</b><span>${N(`${roleOf(s.sp)} 포켓몬`)}</span></div><div class="bigs">${its.map(btn).join('')}</div><div class="foot">▲▼ 이동 · A 선택</div></div>`;
  },
  after() {
    const bl = $('#ball'), im = new Image();
    im.onload = () => { const x = bl.getContext('2d'); x.imageSmoothingEnabled = false; x.drawImage(im, 0, 0); };
    im.src = item(ballFor(scene.sp.k));
    bl.style.setProperty('--dx', '99px'); bl.style.setProperty('--dy', '-84px');
    if (scene.phase === 'caught') $('#enemy').classList.add('hide');
  },
  moved() { renderBot(); },
  select(i) {
    const s = scene; if (s.busy || s.phase === 'throw') return;
    if (i === 1) return finishBattle();
    if (s.phase === 'caught') nextEncounter(); else retryEncounter();
  },
};
const setMsg = t => { scene.msg = t; const el = $('#emsg'); if (el) el.textContent = brk(t); };
// 결과 화면에서 바로 다음 문제로 (지역 화면을 거치지 않는다)
function nextEncounter() { const from = scene.prev; clearTimers(); scene = from; cur = 0; render(); startEncounter(from); }
// 못 잡았을 때: 같은 포켓몬에 코치가 고른 다른 문제로 다시
function retryEncounter() { const { prev, sp, shiny } = scene; clearTimers(); scene = prev; cur = 0; render(); startEncounter(prev, { sp, shiny }); }
function finishBattle() { const { prev } = scene; clearTimers(); scene = prev; cur = 0; render(); }
// 경험치: 문제 단계와 풀이의 깔끔함, 조금의 운으로 쌓인다. 올라가는 시점은 직접 짐작하기 어렵다.
function gainExp(d, s) {
  const p = pById(s.probId) || {}, sc = scoreOf(s.wrong || 0, s.hintsUsed || 0, s.synUsed || 0);
  const g = 7 * (p.tier || 1) + 5 * sc + Math.floor(Math.random() * 11);
  d.exp = (d.exp != null ? d.exp : Math.max(0, (d.caught || 1) - 1) * 40) + g;
  return g;
}
function evolveCheck(sp, d) {
  const out = [];
  for (const [to, lv] of EVO[sp.id] || []) {
    const t = S.dex[to] || (S.dex[to] = { seen: 1, caught: 0, shiny: 0 });
    if (!t.caught && levelOf(d) >= lv) { t.seen = 1; t.caught = 1; t.exp = d.exp; t.lv = levelOf(t); t.log = [{ t: Date.now(), evo: sp.name }]; S.last = to; out.push(SP[to]); }
    else if (t.caught) { t.exp = d.exp; t.lv = levelOf(t); }
  }
  return out;
}
// 진화 장면: 흰 실루엣이 번갈아 깜박이다가 번쩍이며 새 모습이 된다
async function evolveFx(from, to) {
  let en = $('#enemy'); if (!en || scene.name !== 'battle') return;
  en.classList.remove('hide'); FX.sfx('evolve');
  for (let i = 0; i < 10; i++) {
    en = $('#enemy'); if (!en || scene.name !== 'battle') return;
    en.innerHTML = img(spr.anim((i % 2 ? to : from).dex, false)); en.firstChild.style.filter = 'brightness(0) invert(1)'; await sleep(190 - i * 12);
  }
  FX.flash('#ffffff', 650); await sleep(260);
  en = $('#enemy'); if (!en || scene.name !== 'battle') return;
  en.innerHTML = img(spr.anim(to.dex, false)); FX.sparkle(128, 95, 18);
  const pl = document.querySelector('#top .plate b'); if (pl) pl.textContent = to.name;
}
// 정답이니 볼이 날아간다. 잡힐지는 확률 (힌트 없이 풀면 조금 더 잘 잡힌다)
async function throwBall() {
  const s = scene; if (s.busy) return;
  s.busy = true;
  const res = reportBattle(), note = res.note ? ' ' + res.note : '';
  const sp = s.sp, d = s.d;
  const bl = $('#ball'), en = $('#enemy');
  setMsg(`몬스터볼을 던졌다!`); FX.sfx('throw');
  bl.className = 'ballc throw'; await sleep(750);
  en.classList.add('hide'); bl.className = 'ballc shake'; [100, 600, 1100].forEach(t => FX.sfx('shake', t)); await sleep(1500);
  bl.className = 'ballc done'; FX.flash(s.shiny ? '#ffe27a' : '#ffffff', 450); FX.sparkle(128, 100, s.shiny ? 22 : 12, s.shiny ? '#ffe27a' : '#fff6c0'); FX.sfx('caught');
  const first = !d.caught, old = levelOf(d);
  d.caught++; d.log = (d.log || []).concat({ t: Date.now(), p: s.probId }).slice(-6); if (first) d.exp = 0; gainExp(d, s); d.lv = levelOf(d); S.last = sp.id; d.seen = 1;
  let msg = first ? `신난다! ${sp.name}${iga(sp.name)} 도감에 등록됐다.` : d.lv > old ? `${sp.name}${iga(sp.name)} ${d.lv - old > 1 ? '크게 ' : ''}자랐다. Lv.${old} → Lv.${d.lv}` : `${sp.name}${iga(sp.name)} 경험을 쌓았다.`;
  const evo = evolveCheck(sp, d);
  S.note = res.note || '';   // 오박사의 한마디는 지역 화면에서 들려준다
  save(); setMsg(msg); s.phase = 'caught'; s.caught = true;
  if (first) FX.sfx('dex', 800); else if (d.lv > old) FX.sfx('level', 800);
  cur = 0; s.busy = false; renderTop(); renderBot();
  if (evo.length) { await sleep(1200); await evolveFx(sp, evo[evo.length - 1]); if (scene.name === 'battle') setMsg(`${sp.name}${iga(sp.name)} 진화했다!
${evo[evo.length - 1].name}${iga(evo[evo.length - 1].name)} 도감에 등록됐다.`); }
}

/* ---------- 체육관: 관장이 내는 문제를 모두 풀면 배지 ---------- */
const GYM_ROUNDS = 3;
function enterGym(from) {
  const r = from.region, w = WEEKS[r];
  if (regionDone(r)) { showNote(`관장 ${w.leader}: 이미 ${w.badge}를 가져갔잖아. 다음 지역으로 가라.`); return; }
  if (!gymReady(r)) { Coach.ensure(r); showNote(`관장 ${w.leader}: 지금 실력으론 아직 멀었다. 더 단련하고 와라.`); return; }
  const ids = Coach.gymProblems(r, GYM_ROUNDS);
  if (!ids.length) { Coach.ensure(r); showNote(`관장 ${w.leader}: 잠깐, 문제를 고르는 중이다. 조금 뒤에 다시 와라.`); return; }
  clearTimers(); moving = false;
  scene = { name: 'gym', region: r, probIds: ids, round: 0, opened: false, wrong: 0, hintsUsed: 0, reported: false, phase: 'round', won: false, busy: false, prev: from, msg: `나는 ${w.leader}, 이 체육관의 관장이다. 문제 ${ids.length}개를 풀면 ${w.badge}를 주마.` };
  cur = 0; render();
}
SCENES.gym = {
  paint() { return Art.pt('cynthia', 'cynthia'); },
  items() {
    const s = scene;
    return s.phase === 'round' ? [{ ic: img(item('poke-ball')), t: `문제 ${s.round + 1} 풀기`, s: '관장의 문제에 도전' }, { t: '포기하고 나가기', s: '나중에 다시 도전 가능' }] : [{ t: '확인' }];
  },
  top() {
    const s = scene, w = WEEKS[s.region];
    return `<div class="scene"><canvas id="bg" width="256" height="192"></canvas>${img(trainer(w.leaderSprite || 'cynthia'), '', 'position:absolute;left:88px;top:42px;width:80px;height:80px')}<div class="pips gpips">${s.probIds.map((_, i) => `<i class="${i < s.round || (s.phase === 'done' && s.won) ? 'f' : ''}"></i>`).join('')}</div><div class="say" id="emsg">${esc(brk(s.msg))}</div></div>`;
  },
  bot() {
    const s = scene, its = this.items(), w = WEEKS[s.region];
    const btn = (it, i) => `<div class="big ${i === 0 ? 'p' : 'q'} ${i === cur ? 'on' : ''}" data-i="${i}"><span class="ic">${it.ic || ''}</span><span class="tx"><b>${esc(it.t)}</b>${it.s ? `<i>${esc(it.s)}</i>` : ''}</span></div>`;
    return `<div class="pane"><div class="hd"><b>${esc(w.title)} 체육관</b><span>${esc(w.badge)}</span></div><div class="bigs">${its.map(btn).join('')}</div><div class="foot">▲▼ 이동 · A 선택</div></div>`;
  },
  moved() { renderBot(); },
  select(i) { const s = scene; if (s.busy) return; if (s.phase !== 'round') return finishGym(); if (i === 0) openPC(s.probIds[s.round], s); else loseGym(true); },
};
// 한 문제를 풀었다: 점수를 코치에 알리고 다음 문제로 (모두 풀면 배지)
function gymRound() {
  const s = scene, wrong = s.wrong || 0, hints = s.hintsUsed || 0;
  Coach.report(s.probIds[s.round], scoreOf(wrong, hints, s.synUsed || 0), { idea: hints, syn: s.synUsed || 0 });
  s.round++; s.opened = false; s.wrong = 0; s.hintsUsed = 0; s.synUsed = 0; s.reported = false;
  if (s.round >= s.probIds.length) return winGym();
  s.msg = `좋다, 정답이다. 다음 문제다. (${s.round}/${s.probIds.length})`; cur = 0; renderTop(); renderBot();
}
function winGym() {
  const s = scene, w = WEEKS[s.region];
  S.badges[s.region] = Date.now();
  const boss = SP[REWARD[s.region]];
  let extra = '';
  if (boss) { const d = S.dex[boss.id] || (S.dex[boss.id] = { seen: 1, caught: 0, shiny: 0 }), first = !d.caught; d.seen = 1; d.caught++; d.lv = levelOf(d); S.last = boss.id; if (first) extra = ` ${boss.name}${iga(boss.name)} 너의 동료가 되었다.`; }
  save();
  s.phase = 'done'; s.won = true; FX.sfx('badge'); FX.flash('#ffe27a', 700);
  s.msg = `제법이군. ${w.badge}를 주마. ${s.region + 1 < WEEKS.length ? '다음 지역도 도전해 보거라.' : '모든 배지를 모았구나.'}`;
  if (boss && extra) timers.push(setTimeout(() => { if (scene.name === 'gym') { scene.msg = `${boss.name}${iga(boss.name)} 너의 동료가 되었다.`; const el = $('#emsg'); if (el) el.textContent = brk(scene.msg); } }, 2600));
  cur = 0; renderTop(); renderBot();
}
function loseGym() {
  const s = scene;
  if (s.opened && !s.reported) { s.reported = true; Coach.report(s.probIds[s.round], 0); }   // 풀어 보려다 포기했으면 어려웠다는 신호
  S.gym[s.region] = { lostAt: S.nrep || 0 }; save();
  s.phase = 'done'; s.won = false; FX.sfx('wrong');
  s.msg = '아직 멀었다. 더 단련하고 다시 와라.';
  cur = 0; renderTop(); renderBot();
}
function finishGym() {
  const { prev, won, region } = scene; clearTimers(); moving = false; scene = prev; cur = 0; render();
  if (won) showNote(`${WEEKS[region].badge}를 얻었구나, 트레이너. 지도에서 다음 지역으로 떠나 보렴.`);
}

/* ---------- 배지 (메뉴) ---------- */
/* ---------- 배지함: HeartGold/SoulSilver 배지함(Spriters Resource, Kyo Wolf) 그림을 바탕으로. 관장 얼굴 칸에 우리 배지를 넣는다 ---------- */
const CASE = { img: new Image(), url: null };
CASE.img.onload = () => { CASE.url = null; if (typeof scene !== 'undefined' && scene.name === 'badges') render(); };
CASE.img.src = '../assets/ui/scenes/hgss-badgecase.png';
// 칸 위치: 원본 예시 그림(633,110)을 아래 화면 (0,1)에 놓았을 때. 성도(청록) 패널 8칸 + 관동(갈색) 패널 8칸
const SLOT_W = 40, SLOT_H = 33;
const slotXY = i => ({ x: 688 - 633 + 47 * (i % 4), y: [133, 174, 221, 262][(i >= 8 ? 2 : 0) + ((i % 8) >= 4 ? 1 : 0)] - 110 + 1 });
function caseBg() {
  if (CASE.url) return CASE.url;
  if (!CASE.img.complete || !CASE.img.naturalWidth) return null;
  const cv = document.createElement('canvas'); cv.width = 256; cv.height = 192; const x = cv.getContext('2d'); x.imageSmoothingEnabled = false;
  x.drawImage(CASE.img, 633, 110, 255, 190, 0, 1, 255, 190);
  const px = (a, b) => { const d = x.getImageData(a, b, 1, 1).data; return `rgb(${d[0]},${d[1]},${d[2]})`; };
  for (let i = 0; i < 16; i++) {   // 원본 얼굴 칸을 지우고 빈 칸으로 다시 그린다
    const { x: sx, y: sy } = slotXY(i);
    x.fillStyle = i % 4 === 3 ? px(sx - 3, sy + 1) : px(sx + SLOT_W + 3, sy + 1); x.fillRect(sx - 3, sy - 2, SLOT_W + 14, SLOT_H + 4);   // 칸 바로 옆의 패널 색으로 지운다
    x.fillStyle = '#ffffff'; x.fillRect(sx, sy, SLOT_W, SLOT_H);
    x.fillStyle = '#e3e8f5'; x.fillRect(sx + 1, sy + 1, SLOT_W - 2, SLOT_H - 2);
    x.fillStyle = '#cfd7ea'; x.fillRect(sx + 1, sy + SLOT_H - 3, SLOT_W - 2, 2);
  }
  return (CASE.url = cv.toDataURL());
}
SCENES.badges = {
  paint() { return Art.pt('fieldN', null); },
  top() {
    const i = cur, w = WEEKS[i], got = S.badges[i];
    return `<div class="scene"><canvas id="bg" width="256" height="192"></canvas><div class="dexspot">${img(FieldArt.badge(w.type, i, !!got, 60), 'bigbadge')}</div><div class="dexinfo"><b>${got ? esc(w.badge) : '???'}</b><div class="dim">${esc(w.title)} · ${esc(w.sub)}</div><div>${got ? `관장 ${esc(w.leader)} · ${new Date(got).toLocaleDateString('ko-KR')}` : '아직 얻지 못함'}</div></div></div>`;
  },
  bot() {
    const bg = caseBg();
    const cells = WEEKS.map((w, i) => { const s = slotXY(i), got = !!S.badges[i]; return `<div class="bcell ${i === cur ? 'on' : ''} ${got ? '' : 'lock'}" data-i="${i}" style="left:${s.x}px;top:${s.y}px;width:${SLOT_W}px;height:${SLOT_H}px">${img(FieldArt.badge(w.type, i, got))}</div>`; }).join('');
    return `<div class="pane"><div class="bcase" style="${bg ? `background-image:url(${bg})` : ''}">${cells}</div></div>`;
  },
  key(k) {
    const d = { left: -1, right: 1, up: -4, down: 4 }[k];
    if (d) { cur = Math.max(0, Math.min(WEEKS.length - 1, cur + d)); render(); return true; }
    if (k === 'B') { go('home'); return true; }
    return false;
  },
};
