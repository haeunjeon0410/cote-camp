/* 오박사의 코테 캠프 · 포켓몬 DS 스타일
   위 화면 = 장면, 아래 화면 = 메뉴 (D패드/ABXY 또는 키보드). 야생 포켓몬 = 이번에 풀 문제, 코드는 PC에서 쓴다. */
const { WEEKS, TYPES, ROLE } = DATA;
const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const sleep = ms => new Promise(r => setTimeout(r, ms));
const DAY = 86400000;
const REVIEW_DAYS = [2, 5, 12];
const iga = n => ((n.charCodeAt(n.length - 1) - 0xAC00) % 28 ? '이' : '가');

function md(s) {
  const inline = t => esc(t).replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');
  const out = [];
  let list = null;
  const flush = () => { if (list) { out.push('<ul>' + list.map(x => `<li>${x}</li>`).join('') + '</ul>'); list = null; } };
  for (const line of s.split('\n')) {
    if (line.startsWith('- ')) { (list = list || []).push(inline(line.slice(2))); continue; }
    flush();
    if (line.trim()) out.push('<p>' + inline(line) + '</p>');
  }
  flush();
  return out.join('');
}

/* ---------- 자산 ---------- */
const UI = '../assets/ui/', SPR = '../assets/sprites/';
const item = n => `${UI}items/${n}.png`;
const trainer = n => `${UI}trainers/${n}.png`;
const spr = { anim: (d, s) => s ? `${SPR}still-shiny/${d}.png` : `${SPR}anim/${d}.gif`, still: (d, s) => `${SPR}${s ? 'still-shiny' : 'still'}/${d}.png`, icon: d => `${SPR}icon/${d}.png` };
const img = (src, cls = '', style = '') => `<img ${cls ? `class="${cls}"` : ''} src="${src}" alt="" ${style ? `style="${style}"` : ''}>`;
const urlOf = c => c.__url || (c.__url = c.toDataURL());
const iconImg = (name, k = 2) => { const c = Art.icon(name); return img(urlOf(c), '', `width:${c.width * k}px;height:${c.height * k}px`); };
const ballFor = k => (k === 3 ? 'ultra-ball' : k === 2 ? 'great-ball' : 'poke-ball');

/* ---------- 상태 ---------- */
const fresh = () => ({ v: 4, solved: {}, prog: {}, review: {}, dex: {}, days: [], drafts: {}, region: 0, last: null, skill: {}, recent: [], badges: {}, gym: {}, nrep: 0, settings: { lang: 'py', python: '', autoMake: true, dailyCap: 100 } });
let S = fresh();
let P = [];
let tools = { gxx: null, python: null };
let saveTimer;
function save() { clearTimeout(saveTimer); saveTimer = setTimeout(() => api.saveState(S), 150); }

const SPECIES = DEX.map(([dex, name, type, wi, k, from, evoLv]) => ({ id: String(dex), dex, name, type, wi, k, from: from ? String(from) : null, evoLv }));
const SP = Object.fromEntries(SPECIES.map(s => [s.id, s]));

const N = text => text; // 문제 밖 숫자(도감·출석·포획률·진행)는 그대로 보여 준다. 문제 안 기록만 showNums로 숨긴다
const dk = t => { const d = new Date(t); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
function streak() {
  const set = new Set(S.days), d = new Date();
  let n = 0;
  if (!set.has(dk(d))) d.setDate(d.getDate() - 1);
  while (set.has(dk(d))) { n++; d.setDate(d.getDate() - 1); }
  return n;
}
const weekProbs = i => P.filter(p => p.week === i + 1);
const pById = id => P.find(p => p.id === id);
const caughtCount = () => SPECIES.filter(s => S.dex[s.id] && S.dex[s.id].caught).length;
/* 지역 = 주차. 지역마다 잡을 수 있는 포켓몬이 정해져 있고, 다 모으면 다음 지역이 열린다 */
const regionSpecies = i => SPECIES.filter(s => s.wi === i);
function migrateDex() {   // 예전 기록('0-0' 같은 번호)을 도감 번호로 바꾼다
  const conv = id => { const m = /^(\d+)-(\d+)$/.exec(String(id)); return m && WEEKS[+m[1]] && WEEKS[+m[1]].mons[+m[2]] ? String(WEEKS[+m[1]].mons[+m[2]][0]) : id; };
  for (const k of Object.keys(S.dex)) { const n = conv(k); if (n !== k) { S.dex[n] = S.dex[n] && S.dex[n].caught ? S.dex[n] : S.dex[k]; delete S.dex[k]; } }
  if (S.last) S.last = conv(S.last);
  if (S.enc && S.enc.sp) S.enc.sp = conv(S.enc.sp);
}
const regionCaught = i => regionSpecies(i).filter(s => S.dex[s.id] && S.dex[s.id].caught).length;
const regionDone = i => !!(S.badges && S.badges[i]);   // 배지를 땄으면 그 지역을 마친 것
const gymReady = i => !regionDone(i) && Coach.gymReady(i);   // 코치가 보기에 체육관에 도전할 만큼 익힘   // 지역 해금은 배지로: 코치가 준비됐다고 하면 체육관에 도전하고, 이기면 배지와 함께 다음 지역이 열린다
let PLAN = { weeks: {}, typeNames: {} }, FACTORY = { hasKey: false, made: 0, cap: 0 };
const canMake = () => FACTORY.hasKey && !(S.settings && S.settings.autoMake === false);
const regionReady = i => weekProbs(i).length > 0 || (canMake() && (PLAN.weeks[i + 1] || []).length > 0);   // 문제가 있거나, 공장이 만들어 줄 수 있는 지역
const regionOpen = i => regionReady(i);   // 지역은 순서와 상관없이 언제든 들어갈 수 있다. 유형마다 단계는 따로 기억한다
const recRegion = () => WEEKS.findIndex((w, j) => regionOpen(j) && !regionDone(j));   // 추천: 아직 배지를 못 딴 첫 지역
const weekState = i => (!regionOpen(i) ? 'locked' : regionDone(i) ? 'clear' : 'open');
const curRegion = () => { const c = S.region || 0; if (regionOpen(c)) return c; const r = recRegion(); return r < 0 ? 0 : r; };
const lvFromExp = exp => { let L = 5, need = 40, e = Math.max(0, exp | 0); while (e >= need && L < 100) { e -= need; L++; need += 4; } return L; };
const levelOf = d => lvFromExp(d && d.exp != null ? d.exp : Math.max(0, ((d && d.caught) || 1) - 1) * 40);
// 진화: 기본 포켓몬이 이 레벨이 되면 다음 모습이 도감에 등록된다. 진화한 모습은 야생에서 만날 수 없다 (키워서 얻는다)
const EVO = {};
SPECIES.forEach(s => { if (!s.from) return; let r = SP[s.from]; while (r.from) r = SP[r.from]; (EVO[r.id] = EVO[r.id] || []).push([s.id, s.evoLv]); });
const EVO_TARGETS = new Set(SPECIES.filter(s => s.from).map(s => s.id));
const ROLE4 = ['Common', 'Uncommon', 'Rare', 'Legendary'];
const roleOf = sp => sp.from ? 'Evolved' : ROLE4[sp.k];
// 체육관을 이기면 그 지역의 전설 포켓몬을 한 마리 만난다. 남는 전설 포켓몬은 마스터 로드의 어려운 문제에서 만날 수 있다
const REWARD = {}; SPECIES.filter(s => s.k === 3).forEach(s => { if (!REWARD[s.wi]) REWARD[s.wi] = s.id; });
const LEGEND_LEFT = () => SPECIES.filter(s => s.k === 3 && !Object.values(REWARD).includes(s.id) && !(S.dex[s.id] && S.dex[s.id].caught));
const dueList = () => Object.keys(S.review).filter(id => S.solved[id] && S.review[id].due <= Date.now() && pById(id));
const todaySolved = () => Object.values(S.solved).filter(s => dk(s.ts) === dk(Date.now())).length;
const prog = id => S.prog[id] || (S.prog[id] = { attempts: 0, hints: 0, syn: 0 });
// 한 문제의 점수(0~2): 틀린 횟수와 힌트 사용으로 본다. 풀이 힌트는 알고리즘, 문법 힌트는 파이썬 문법이 약하다는 뜻이다.
const scoreOf = (wrong, idea, syn) => (idea >= 3 || wrong >= 4) ? 0 : (idea === 0 && wrong === 0) ? 2 : wrong <= 2 ? 1 : 0;
const synItems = p => (p.syntax && p.syntax.length) ? p.syntax : (p.learn || []);   // 문법 힌트: 만든 문제는 문법 힌트, 기본 문제는 파이썬 요령 카드
function lastCaughtIndex() { const i = S.last ? SPECIES.findIndex(s => s.id === S.last) : -1; return i < 0 ? 0 : i; }

/* ---------- 화면 배율 (실제 화면 픽셀 기준 정수 배율 → 도트가 번지지 않는다) ---------- */
let UNIT = 2;
let PCU = 1;
let SIZE_LABEL = '';
api.winSize(0).then(r => { SIZE_LABEL = r.name; });
// 전체 화면: F11 또는 □ 단추. 남는 자리는 어두운 바탕으로 채우고 화면은 가운데에 정수 배율로 둔다
api.onFullscreen(v => { document.documentElement.classList.toggle('fs', !!v); fit(); });
addEventListener('keydown', e => { if (e.code === 'F11') { e.preventDefault(); api.winCtl('full'); } else if (e.code === 'Escape' && document.documentElement.classList.contains('fs')) { api.winCtl('full'); } });
// 오른쪽 아래 손잡이를 끌어 창 크기 조절 (콘솔 크기의 정수 배로만 딱딱 맞춰진다)
(() => {
  const gr = document.getElementById('grip'); if (!gr) return;
  let st = null;
  gr.addEventListener('pointerdown', e => { st = { x: e.screenX, y: e.screenY, w: window.innerWidth, h: window.innerHeight, n: 0 }; try { gr.setPointerCapture(e.pointerId); } catch (_) {} e.preventDefault(); });
  let raf = 0;
  gr.addEventListener('pointermove', e => {
    if (!st) return;
    const w = st.w + (e.screenX - st.x), h = st.h + (e.screenY - st.y), s = Math.min(w / 386, h / 434);
    if (raf) return; raf = requestAnimationFrame(() => { raf = 0; api.winResize(Math.round(386 * s)); });
  });
  const end = () => { st = null; };
  gr.addEventListener('pointerup', end); gr.addEventListener('pointercancel', end);
})();
['min', 'full', 'close'].forEach(k => { const r = document.documentElement.style; r.setProperty('--wb-' + k, `url(${Art.winBtn(k, false)})`); r.setProperty('--wb-' + k + 'h', `url(${Art.winBtn(k, true)})`); });
Object.entries(Art.frames()).forEach(([k, u]) => document.documentElement.style.setProperty('--fr-' + k, `url(${u})`));
{ const t = Art.touch(), r = document.documentElement.style; r.setProperty('--tile', `url(${t.tile})`); r.setProperty('--pip-f', `url(${t.pipFull})`); r.setProperty('--pip-e', `url(${t.pipEmpty})`); }
{
  const r = document.documentElement.style, b = Art.bits(), c = Art.shellClips();
  for (const [k, u] of Object.entries(b)) r.setProperty('--spr-' + k, `url(${u})`);
  r.setProperty('--clip-t', c.t); r.setProperty('--clip-b', c.b); r.setProperty('--clip-tk', c.tk); r.setProperty('--clip-bk', c.bk);
}
{ const p = Art.pads(); for (const [k, u] of Object.entries(p.press)) document.documentElement.style.setProperty(('up down left right'.includes(k) ? '--img-dpad-' : '--img-abxy-') + k, `url(${u})`); document.documentElement.style.setProperty('--img-dpad', `url(${p.dpad})`); document.documentElement.style.setProperty('--img-abxy', `url(${p.abxy})`); }
function fit() {
  const dpr = window.devicePixelRatio || 1;
  const k = Math.min(innerWidth / 386, innerHeight / 434);
  const snap = v => { const r = Math.round(v); return r >= 1 && Math.abs(v - r) < r * 0.05 ? r : v; };   // 정수 배율에 가까우면 딱 맞춰 도트가 선명하게
  const n = Math.max(0.5, snap(k * dpr));
  UNIT = n / dpr;
  PCU = Math.max(0.75, n <= 2 ? n : snap(n * 0.8)) / dpr;   // 풀이 화면 글자: 도트 글꼴이라 물리 픽셀 정수배로만 키운다 (소수 배율이면 획이 뭉개진다)
  $('#console').style.zoom = UNIT;
  { const r = document.documentElement.style, cl = (innerWidth - 386 * UNIT) / 2, ct = (innerHeight - 434 * UNIT) / 2; r.setProperty('--cr', Math.max(0, cl) + 'px'); r.setProperty('--ct', Math.max(0, ct) + 'px'); }   // 창 단추는 본체의 오른쪽 테두리에 붙어 다닌다
  document.documentElement.style.setProperty('--u', UNIT);
  document.documentElement.style.setProperty('--u2', PCU);
  if (editor) editor.updateOptions({ fontSize: 11 * PCU, lineHeight: 15 * PCU });
}

/* ---------- 장면 엔진 ---------- */
let scene = { name: 'home' }, cur = 0, timers = [];
const clearTimers = () => { timers.forEach(clearInterval); timers = []; };
const SCENES = {};
const pcOpen = () => !$('#pc').hidden;
function go(name, args = {}) { clearTimers(); scene = { name, ...args }; cur = args.cur || 0; render(); FX.enter(); }
function paintBg() {
  const cv = $('#bg'); if (!cv) return;
  const sc = SCENES[scene.name], ctx = cv.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(sc.paint ? sc.paint() : Art.route(sc.bg || 'route'), 0, 0);
}
function footer() {
  const f = $('#bot .foot'); if (!f) return;
  const glyph = t => (/^(A|B|X|Y)$/.test(t) ? 'g' + t : t === 'START' ? 'gS' : 'gD');
  f.innerHTML = f.textContent.split(' · ').map(t => {
    const m = t.match(/^(A|B|X|Y|START|방향키|[▲▼◀▶ ]+)\s+(.+)$/);
    return m ? `<span class="kc"><i style="background-image:var(--spr-${glyph(m[1])})"></i>${esc(m[2])}</span>` : `<span class="kc">${esc(t)}</span>`;
  }).join('') + (HELP[scene.name] ? '<span class="kc"><i style="background-image:var(--spr-gM)"></i>도움말</span>' : '');
}
function theme() { const p = $('#bot .pane'); if (p) p.classList.add('t-' + scene.name); }
function render() { const sc = SCENES[scene.name]; $('#top').innerHTML = sc.top(); $('#bot').innerHTML = sc.bot(); footer(); theme(); paintBg(); if (sc.after) sc.after(); }
const renderTop = () => { const sc = SCENES[scene.name]; $('#top').innerHTML = sc.top(); paintBg(); if (sc.afterTop) sc.afterTop(); };
const renderBot = () => { $('#bot').innerHTML = SCENES[scene.name].bot(); footer(); theme(); };
const menuHtml = items => { const anyIc = items.some(x => x.ic); return `<div class="rows">${items.map((it, i) => `<div class="row ${i === cur ? 'on' : ''} ${it.off ? 'off' : ''}" data-i="${i}">${it.ic ? `<span class="ic">${it.ic}</span>` : anyIc ? '<span class="ic"></span>' : ''}<span class="tx"><b>${esc(it.t)}</b>${it.s ? `<i>${esc(it.s)}</i>` : ''}</span>${it.r ? `<em>${esc(it.r)}</em>` : ''}</div>`).join('')}</div>`; };
// 문장이 끝날 때마다 줄을 바꿔 읽기 쉽게 한다
const brk = t => { const parts = String(t).split(/(?<=[.?!…])\s+/), out = []; for (const p of parts) { const last = out[out.length - 1]; if (last !== undefined && last.indexOf('\n') < 0 && (last + ' ' + p).length <= 26) out[out.length - 1] = last + ' ' + p; else out.push(p); } return out.join('\n'); };
const typeText = (el, text) => { text = brk(text); let i = 0; const id = setInterval(() => { el.textContent = text.slice(0, ++i); if (i % 3 === 0) FX.sfx('tick'); if (i >= text.length) clearInterval(id); }, 28); timers.push(id); };
const sayBox = (who, id = 'say') => `<div class="say"><i class="nm">${who}</i><span id="${id}"></span><i class="arr"></i></div>`;

/* ---------- 도움말: 어느 화면에서나 SELECT = "여기서 뭘 하는 거지?" ---------- */
const HELP = {
  intro: ['오박사의 설명', ['\'이어서 도전하기\'를 누르면 바로 문제가 열린단다. 어떤 포켓몬인지는 정답을 내야 알 수 있지.', '정답을 내면 그 포켓몬을 반드시 잡는단다. 어려운 문제일수록 희귀한 포켓몬이 나타나지.', '넘기고 싶은 문제는 \'다른 문제로 바꾸기\'로 넘겨도 좋단다.', '충분히 익혔다 싶으면 체육관에 도전해 보렴. 지역은 지도에서 마음대로 골라도 된단다. 막히면 SELECT를 누르렴.']],
  field: ['지역 화면', ['\'이어서 도전하기\'를 누르면 바로 문제가 열린단다. 풀다가 나가도 \'이어서 풀기\'로 돌아올 수 있지.', '충분히 익혔다 싶으면 \'체육관 도전\'으로 관장에게 도전해 보렴. 이기면 배지를 받는단다.', 'START는 메뉴, X는 지도란다.']],
  battle: ['결과', ['정답을 내면 그 포켓몬을 반드시 잡는단다. 같은 포켓몬을 또 잡으면 레벨이 오르고, 여러 번 잡으면 진화하는 포켓몬도 있지.']],
  home: ['메뉴', ['도감, 배지, 센터, 지도, 설정을 고르는 곳이란다. 방향키로 고르고 A를 누르렴.', 'B나 START를 누르면 지역 화면으로 돌아간단다.']],
  map: ['지도', ['지역을 고르는 곳이란다. 좌우로 넘기고 A로 들어가 보렴.', '지역은 순서와 상관없이 마음대로 골라도 된단다. 추천 지역부터 가면 좋지.']],
  badges: ['배지', ['체육관 관장을 이기면 배지를 받는단다. 배지를 모두 모으는 게 목표지.', '배지 하나는 코테 주제 하나를 뜻한단다.']],
  gym: ['체육관', ['관장이 내는 문제를 모두 풀면 배지를 받는단다.', '문제마다 힌트를 봐도 좋단다. 포기하고 나가면 나중에 다시 도전할 수 있지.']],
  dex: ['도감', ['지금까지 만난 포켓몬을 기록한 도감이란다. 못 잡은 포켓몬은 실루엣으로 보이지.', '같은 포켓몬을 또 잡으면 레벨이 오른단다. A를 누르면 이로치를 볼 수 있어.']],
  center: ['포켓몬 센터', ['틀렸거나 힌트를 많이 쓴 문제를 며칠 뒤에 다시 풀어 보는 곳이란다.', '다시 풀면 기억이 오래 간단다.']],
  settings: ['설정', ['창 크기를 바꾸거나 처음부터 다시 시작할 수 있단다.', '창 크기는 Ctrl + 와 Ctrl − 로도 바꿀 수 있지.']],
};
function showHelp(name) {
  const h = HELP[name]; if (!h) return;
  closeHelp();
  $('#top').insertAdjacentHTML('beforeend', `<div class="help"><b>${esc(h[0])}</b>${h[1].map(t => `<p>${esc(t)}</p>`).join('')}<span class="hk">아무 버튼이나 눌러서 닫기</span></div>`);
}
function closeHelp() { const el = $('#top .help'); if (el) el.remove(); }

function press(k) {
  FX.sfx(k === 'B' ? 'back' : 'ASXY'.includes(k) && k.length === 1 ? 'ok' : 'move');
  if (pcOpen()) { pcPress(k); return; }
  if ($('#top .help')) { closeHelp(); return; }
  const sc = SCENES[scene.name];
  if (k === 'Sel') { showHelp(scene.name); return; }
  if (k === 'S') { if (scene.name === 'battle') return; if (scene.name === 'home') go('field', { region: curRegion() }); else go('home'); return; }
  if (sc.key && sc.key(k)) return;
  if (sc.items) {
    const n = sc.items().length;
    if (k === 'up' || k === 'down') { cur = (cur + (k === 'up' ? -1 : 1) + n) % n; (sc.moved || render)(); return; }
    if (k === 'A') { const it = sc.items()[cur]; if (!it.off) sc.select(cur); return; }
  }
  if (k === 'B' && sc.back) sc.back();
}
// 키보드 = 콘솔 버튼 (글자가 같은 키가 같은 버튼, Enter = START, Backspace = SELECT). 눌린 버튼이 화면에서도 눌려 보인다 (한글 입력 상태여도 되도록 글자가 아니라 키 위치(code)로 읽는다)
const KEYMAP = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right', KeyA: 'A', KeyB: 'B', KeyX: 'X', KeyY: 'Y', KeyL: 'L', KeyR: 'R', Enter: 'S', Backspace: 'Sel' };
const DIRS4 = ['up', 'down', 'left', 'right'];
function lit(k, on) {
  document.querySelectorAll(`[data-k="${k}"]`).forEach(el => el.classList.toggle('on', on));
  if (DIRS4.includes(k)) document.querySelectorAll('.dpad').forEach(d => d.classList.toggle('pd-' + k, on));
  if ('XYAB'.includes(k) && k.length === 1) document.querySelectorAll('.abxy').forEach(d => d.classList.toggle('pr-' + k, on));
}
const litAll = () => { document.querySelectorAll('[data-k].on').forEach(el => el.classList.remove('on')); document.querySelectorAll('.dpad').forEach(d => DIRS4.forEach(k => d.classList.remove('pd-' + k))); document.querySelectorAll('.abxy').forEach(d => 'XYAB'.split('').forEach(k => d.classList.remove('pr-' + k))); };
document.addEventListener('keydown', e => {
  if (e.ctrlKey && !e.altKey && !e.shiftKey && ['Equal', 'NumpadAdd', 'Minus', 'NumpadSubtract'].includes(e.code)) { e.preventDefault(); api.winSize(e.code === 'Equal' || e.code === 'NumpadAdd' ? 1 : -1).then(r => { SIZE_LABEL = r.name; }); return; }
  const k = KEYMAP[e.code]; if (!k) return;
  const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement && document.activeElement.tagName);
  if (typing && !e.altKey) return;   // 코드를 쓰는 중에는 Alt를 누른 채로만 버튼으로 읽는다
  e.preventDefault(); e.stopPropagation();
  if (e.repeat && !DIRS4.includes(k)) return;   // 방향은 꾹 누르면 계속, 나머지는 한 번만
  lit(k, true); press(k);
}, true);
document.addEventListener('keyup', e => { const k = KEYMAP[e.code]; if (k) lit(k, false); }, true);
addEventListener('blur', litAll);
document.addEventListener('pointerdown', e => { const el = e.target.closest('[data-k]'); if (el) lit(el.dataset.k, true); });
document.addEventListener('pointerup', litAll);
document.addEventListener('input', e => { if (e.target && e.target.id === 'dexq') { DEXF.q = e.target.value; cur = 0; const gr = $('#dexgrid'); if (gr) gr.innerHTML = dexGrid(dexList()); renderTop(); } });
document.addEventListener('keydown', e => { if (e.target && e.target.id === 'dexq' && (e.key === 'Enter' || e.key === 'Escape')) { e.target.blur(); e.stopPropagation(); } }, true);
document.addEventListener('click', e => {
  const w = e.target.closest('[data-w]'); if (w) { api.winCtl(w.dataset.w); return; }
  const k = e.target.closest('[data-k]');
  if (k) { press(k.dataset.k); return; }
  const hp = e.target.closest('.help'); if (hp) { closeHelp(); return; }
  const bc = e.target.closest('.bcell'); if (bc && scene.name === 'badges') { cur = +bc.dataset.i; render(); return; }
  const tl = e.target.closest('.tile');
  if (tl && scene.name === 'home') { cur = +tl.dataset.i; press('A'); return; }
  const row = e.target.closest('.row, .big');
  if (row && !pcOpen() && SCENES[scene.name].items) { cur = +row.dataset.i; const it = SCENES[scene.name].items()[cur]; if (it && !it.off) press('A'); else (SCENES[scene.name].moved || render)(); return; }
  const dq = e.target.closest && e.target.closest('#dexq'); if (dq) return;
  const cell = e.target.closest('.cell');
  if (cell && scene.name === 'dex') { cur = +cell.dataset.i; scene.shiny = false; render(); return; }
  const a = e.target.closest('[data-a]');
  if (a && ACTS[a.dataset.a]) ACTS[a.dataset.a](a);
});
document.addEventListener('mouseover', e => {
  const row = e.target.closest('.row, .big');
  if (row && !pcOpen() && SCENES[scene.name].items && cur !== +row.dataset.i) { cur = +row.dataset.i; (SCENES[scene.name].moved || render)(); }
});

/* ---------- 메뉴 (START) ---------- */
function homeText() { return oakLine('menu'); }
const HOME_TILES = () => {
  const due = dueList().length;
  return [
    { id: 'dex', ic: img(FieldArt.dexIcon()), t: '도감', s: '' },
    { id: 'map', ic: img(item('town-map')), t: '지도', s: '' },
    { id: 'center', ic: img(item('potion')), t: '센터', s: '' },
    { id: 'badges', ic: img(FieldArt.badge('electric', 3, true)), t: '배지', s: '' },
    { id: 'settings', ic: img(item('premier-ball')), t: '설정', s: '' },
  ];
};
SCENES.home = {
  paint() { return Art.pt('indoor1', null); },
  top() { return `<div class="scene"><canvas id="bg" width="256" height="192"></canvas><img class="oshadow" src="${Art.shadow(52, 9)}" alt="">${img(trainer('oak'), 'oakc')}<div id="partner"></div>${sayBox('오박사')}</div>`; },
  bot() {
    return `<div class="pane"><div class="hd"><b>메뉴</b><span></span></div>
      <div class="tiles">${HOME_TILES().map((t, i) => `<div class="tile ${i === cur ? 'on' : ''}" data-i="${i}"><span class="ic">${t.ic}</span><span class="tx"><b>${esc(t.t)}</b><i>${esc(t.s)}</i></span></div>`).join('')}</div>
      <div class="foot">방향키 이동 · A 선택 · B 돌아가기</div></div>`;
  },
  key(k) {
    const n = HOME_TILES().length, mv = { left: cur % 2 ? -1 : 0, right: cur % 2 ? 0 : 1, up: cur >= 2 ? -2 : 0, down: cur + 2 < n ? 2 : 0 }[k];
    if (mv !== undefined) { cur = Math.min(n - 1, cur + mv); renderBot(); return true; }
    if (k === 'A') { this.select(cur); return true; }
    if (k === 'B') { go('field', { region: curRegion() }); return true; }
    return false;
  },
  select(i) {
    const id = HOME_TILES()[i].id;
    go(id, id === 'dex' ? { cur: lastCaughtIndex() } : id === 'map' ? { cur: curRegion() } : id === 'badges' ? { cur: Math.max(0, Math.min(WEEKS.length - 1, curRegion())) } : {});
  },
  after() {
    const p = $('#partner');
    p.innerHTML = S.last ? '' : img(item('poke-ball'));
    typeText($('#say'), homeText()); wander();
  },
};

/* ---------- 지도 (주차 선택) ---------- */
let mapKey = '', mapCanvas = null;
// 지역마다 플래티넘의 다른 배틀 배경을 쓴다 (분위기가 한눈에 다르게)
const MAP_BG = { grass: ['field', 'grass'], water: ['surf', 'water'], fire: ['fieldA', 'path'], electric: ['cityA', 'path'], rock: ['rocky', 'rocky'], poison: ['forest', 'grass'], flying: ['city', 'path'], psychic: ['fieldN', 'grassN'], ice: ['snow', 'snow'], dragon: ['cynthia', 'cynthia'] };
SCENES.map = {
  paint() { const [bg] = MAP_BG[WEEKS[cur].type] || MAP_BG.grass; return Art.pt(bg, null); },
  top() {
    const w = WEEKS[cur], sp = regionSpecies(cur).filter(s => !s.from && s.k < 3).slice(0, 12), open = regionOpen(cur);
    return `<div class="scene"><canvas id="bg" width="256" height="192"></canvas>
      <div class="plate mplate"><b>${esc(w.title)}</b><span>${cur === recRegion() ? '추천' : `${cur + 1}/${WEEKS.length}`}</span></div>
      <div class="mpk">${sp.map(s => { const d = S.dex[s.id], c = open && d && d.caught; return `<span class="mp"><img class="ms" src="${Art.shadow(30, 6)}" alt=""><img src="${spr.icon(s.dex)}" class="${c ? '' : 'sil'}" alt=""></span>`; }).join('')}</div></div>`;
  },
  bot() {
    const w = WEEKS[cur], sp = regionSpecies(cur), got = regionCaught(cur), st = weekState(cur);
    const why = !regionReady(cur) ? '문제 준비 중' : st === 'clear' ? `${w.badge} 획득` : gymReady(cur) ? '체육관 도전 가능' : '탐험 중';
    return `<div class="pane"><div class="hd"><b>지도</b><span>${cur + 1} / ${WEEKS.length}</span></div>
      <div class="card"><div class="no">${cur + 1}번째 지역${cur === recRegion() ? ' · 추천' : ''}</div><div class="t">${esc(w.title)}</div><div class="s">${esc(w.sub)}</div>
      <div class="s" style="margin-top:6px">${why}</div></div>
      <div class="cta ${!regionReady(cur) ? 'off' : ''}">${!regionReady(cur) ? '문제 준비 중' : 'A 들어가기'}</div>
      <div class="foot">◀ ▶ 이동 · B 뒤로</div></div>`;
  },
  key(k) {
    const n = WEEKS.length;
    if (k === 'left' || k === 'up') { cur = (cur + n - 1) % n; render(); return true; }
    if (k === 'right' || k === 'down') { cur = (cur + 1) % n; render(); return true; }
    if (k === 'A') { if (regionOpen(cur)) go('field', { region: cur }); return true; }
    if (k === 'B') { go('home'); return true; }
    return false;
  },
};

/* ---------- 풀숲 (한 주차의 문제들) ---------- */
function layout(n) {
  const cols = n > 10 ? 6 : 5, rows = Math.ceil(n / cols), ys = rows <= 2 ? [128, 170] : [122, 148, 174], pts = [];
  for (let i = 0; i < n; i++) { const r = Math.floor(i / cols), c = i % cols; pts.push([cols === 5 ? 30 + c * 49 : 28 + c * 40, ys[r]]); }
  return { pts, cols };
}
SCENES.route = {
  bg: 'route',
  list() { return weekProbs(scene.week); },
  top() {
    const ps = this.list(), { pts } = layout(ps.length);
    let h = '<div class="scene"><canvas id="bg" width="256" height="192"></canvas>';
    ps.forEach((p, i) => {
      const [x, y] = pts[i], s = S.solved[p.id], st = s ? 'done' : p.boss ? 'boss' : 'todo';
      h += img(urlOf(Art.patch(st)), 'patch', `left:${x - 17}px;top:${y - 26}px`);
      if (s && s.enc === 'caught') h += img(spr.icon(SP[s.sp].dex), `pmon ${s.shiny ? 'shiny' : ''}`, `left:${x - 20}px;top:${y - 40}px`);
      if (p.boss) h += `<i class="badge" style="left:${x + 8}px;top:${y - 30}px"></i>`;
    });
    const [cx, cy] = pts[cur], cs = S.solved[ps[cur].id];
    return h + `<i class="mk" style="left:${cx}px;top:${cy - (cs && cs.enc === 'caught' ? 35 : 21)}px"></i></div>`;
  },
  bot() {
    const ps = this.list(), p = ps[cur], s = S.solved[p.id], w = WEEKS[scene.week], pr = S.prog[p.id];
    const status = !s ? (pr && pr.attempts ? '도전 중' : '도전 전') : s.enc === 'caught' ? `클리어 · ${SP[s.sp].name} 포획${s.shiny ? ' ★이로치' : ''}` : '클리어 · 포켓몬이 도망침';
    const cta = !s ? 'A 도전하기' : s.enc === 'caught' ? 'A 다시 풀기' : 'A 다시 만나기 · X 다시 풀기';
    return `<div class="pane"><div class="hd"><b>${esc(w.title)}</b><span>${cur + 1} / ${ps.length}</span></div>
      <div class="card"><div class="no">${p.boss ? '체육관 보스' : '문제 ' + (cur + 1)}</div><div class="t">${esc(p.title)}</div><div class="s">${[].concat(p.tags || []).map(esc).join(' · ')}</div><div class="tag">${esc(status)}</div></div>
      <div class="cta ${s && s.enc === 'caught' ? 'off' : ''}">${cta}</div><div class="foot">◀ ▶ ▲ ▼ 이동 · B 뒤로</div></div>`;
  },
  key(k) {
    const n = this.list().length, { cols } = layout(n);
    const d = { left: -1, right: 1, up: -cols, down: cols }[k];
    if (d) { cur = Math.max(0, Math.min(n - 1, cur + d)); render(); return true; }
    const p = this.list()[cur], s = S.solved[p.id];
    if (k === 'A') { if (s && s.enc !== 'caught') encounter(s, enc => { s.enc = enc; save(); }).then(render); else openPC(p.id); return true; }
    if (k === 'X') { openPC(p.id); return true; }
    if (k === 'B') { go('map', { cur: scene.week }); return true; }
    return false;
  },
};

/* ---------- 포켓몬 센터 (복습) ---------- */
SCENES.center = {
  paint() { return Art.pt('indoor3', null); },
  
  items() { const due = dueList(); return due.length ? due.map(id => ({ ic: img(item('potion')), t: pById(id).title, s: '다시 풀어서 회복하기' })) : [{ t: '모두 건강합니다', s: '복습할 문제가 없음', off: true }]; },
  top() { return `<div class="scene"><canvas id="bg" width="256" height="192"></canvas><img class="oshadow" src="${Art.shadow(52, 9)}" alt="">${img(trainer('nurse'), '', 'position:absolute;left:88px;top:42px;width:80px;height:80px')}${sayBox('조이')}</div>`; },
  bot() { return `<div class="pane"><div class="hd"><b>포켓몬 센터</b><span>복습 ${dueList().length}개</span></div>${menuHtml(this.items())}<div class="foot">A 선택 · B 뒤로</div></div>`; },
  moved() { renderBot(); },
  after() { const n = dueList().length; typeText($('#say'), n ? `어서 오세요, 포켓몬 센터입니다. 회복할 문제가 ${n}개 있습니다.` : '어서 오세요, 포켓몬 센터입니다. 모든 문제가 건강합니다.'); },
  select(i) { openPC(dueList()[i]); },
  back() { go('home'); },
};

/* ---------- 도감 ---------- */
// 도감 필터: L = 전체/잡은 것/못 잡은 것, R = 지역, X = 검색 (이름은 잡은 포켓몬만, 번호는 전부)
const DEXF = { q: '', mode: 0, region: -1 };
const DEX_MODES = ['전체', '잡은 것', '못 잡은 것'];
const dexList = () => {
  const q = DEXF.q.trim();
  return SPECIES.filter(s => {
    const c = !!(S.dex[s.id] && S.dex[s.id].caught);
    if (DEXF.mode === 1 && !c) return false; if (DEXF.mode === 2 && c) return false;
    if (DEXF.region >= 0 && s.wi !== DEXF.region) return false;
    if (q && !((c && s.name.includes(q)) || String(s.dex).startsWith(q))) return false;
    return true;
  });
};
// 칸: 번호 + 아이콘(잡은 것만). 선택은 빨간 테두리 (HGSS 도감 목록처럼 5칸)
const dexGrid = list => list.map((s, i) => { const d = S.dex[s.id], c = d && d.caught; return `<div class="cell ${i === cur ? 'on' : ''} ${c ? '' : 'unk'}" data-i="${i}"><em>${String(s.dex).padStart(3, '0')}</em>${c ? img(spr.icon(s.dex)) : ''}</div>`; }).join('') || '<div class="dim" style="padding:14px 10px">해당하는 포켓몬이 없다</div>';
const dexLog = d => {
  const rows = (d.log || []).slice(-3).reverse().map(l => { const dt = new Date(l.t), md = `${dt.getMonth() + 1}.${String(dt.getDate()).padStart(2, '0')}`; const p = l.p && pById(l.p); return `<div><i>${md}</i><span>${l.evo ? esc(l.evo) + '에서 진화' : esc(p ? p.title : '')}</span></div>`; }).join('');
  return rows ? `<div class="dxlog"><b>기록</b>${rows}</div>` : '';
};
const TYPE_COL = { normal: '#a8a878', fighting: '#c03028', flying: '#a890f0', poison: '#a040a0', ground: '#e0c068', rock: '#b8a038', bug: '#a8b820', ghost: '#705898', steel: '#b8b8d0', fire: '#f08030', water: '#6890f0', grass: '#78c850', electric: '#f8d030', psychic: '#f85888', ice: '#98d8d8', dragon: '#7038f8', dark: '#705848', fairy: '#ee99ac' };
const dexChips = () => `<span class="chip on" data-a="dexmode">${DEX_MODES[DEXF.mode]}</span>`;
SCENES.dex = {
  paint() { return Art.mk(1, 1); },
  top() {
    const list = dexList(); cur = Math.max(0, Math.min(list.length - 1, cur));
    const sp = list[cur];
    if (!sp) return `<div class="scene dxt"><div class="dxtab">도감</div><div class="dxplate" style="top:90px"><b>없음</b></div></div>`;
    const d = S.dex[sp.id], c = d && d.caught;
    const pic = c ? img(spr.anim(sp.dex, false)) : img(spr.anim(sp.dex, false), '', 'filter:brightness(0);opacity:.16');
    const no = 'No.' + String(sp.dex).padStart(3, '0');
    return `<div class="scene dxt"><div class="dxtab">도감</div>
      <div class="dxspr">${pic}</div>
      <div class="dxplate"><span>${no}</span><b>${c ? esc(sp.name) : '???'}</b>${c ? `<em>Lv.${levelOf(d)}</em>` : ''}</div>
      ${c ? `<div class="dxtypes"><i style="background:${TYPE_COL[sp.type] || '#888'}">${TYPES[sp.type].n}</i></div>` : ''}
      ${c ? dexLog(d) : ''}</div>`;
  },
  bot() {
    const list = dexList();
    return `<div class="pane"><div class="hd"><b>도감</b><span>${N(`${caughtCount()}`)}</span></div>
      <div class="dexf">${dexChips()}<input id="dexq" class="dexq" type="text" placeholder="이름·번호 검색" value="${esc(DEXF.q)}" maxlength="8" autocomplete="off"></div>
      <div class="sc"><div class="grid" id="dexgrid">${dexGrid(list)}</div></div>
      <div class="dxkeys"><span><b>Y</b> 검색</span><span><b>X</b> 보기</span><span><b>B</b> 나가기</span></div></div>`;
  },
  after() { const el = $('#bot .cell.on'); if (el) el.scrollIntoView({ block: 'nearest' }); },
  key(k) {
    const n = dexList().length;
    const d = { left: -1, right: 1, up: -5, down: 5, L: -30, R: 30 }[k];
    if (d) { cur = Math.max(0, Math.min(n - 1, cur + d)); render(); return true; }
    if (k === 'X') { DEXF.mode = (DEXF.mode + 1) % 3; cur = 0; render(); return true; }
    if (k === 'Y') { const q = $('#dexq'); if (q) q.focus(); return true; }
    if (k === 'B') { go('home'); return true; }
    return false;
  },
};

/* ---------- 설정 ---------- */
SCENES.settings = {
  paint() { return Art.pt('indoor1', null); },
  items() {
    return [
      { t: '창 크기', s: '창 크기를 바꾸는 거란다. 오른쪽 아래를 끌어도 된단다.', r: SIZE_LABEL },
      { t: '효과음', s: '효과음을 켜고 끄는 거란다.', r: S.settings.sound === false ? '끔' : '켬' },
      { t: '처음부터 다시', s: '푼 문제, 배지, 도감이 모두 지워진단다. 신중하게 정하렴.' },
      ...(tools.python ? [] : [{ t: '파이썬을 찾지 못함', s: '파이썬 3가 있어야 채점을 할 수 있단다.', off: true }]),
    ];
  },
  top() { return `<div class="scene"><canvas id="bg" width="256" height="192"></canvas><img class="oshadow" src="${Art.shadow(52, 9)}" alt="">${img(trainer('oak'), 'oakc')}${sayBox('오박사')}</div>`; },
  bot() { return `<div class="pane"><div class="hd"><b>설정</b><span></span></div>${menuHtml(this.items())}<div class="foot">A 선택 · B 뒤로</div></div>`; },
  after() { typeText($('#say'), this.items()[cur].s || '설정을 바꿀 수 있단다.'); },
  moved() { renderBot(); const el = $('#say'); if (el) { clearTimers(); el.textContent = SCENES.settings.items()[cur].s || ''; } },
  async select(i) {
    if (i === 0) { const r = await api.winSize('cycle'); SIZE_LABEL = r.name; renderBot(); }
    else if (i === 1) { S.settings.sound = S.settings.sound === false; save(); FX.sfx('ok'); renderBot(); }
    else if (i === 2 && confirm('정말 처음부터 시작하겠니? 푼 문제, 도감, 작성한 코드가 모두 지워진단다.')) { const st = S.settings; S = fresh(); S.settings = st; await api.saveState(S); go('home'); }
  },
  back() { go('home'); },
};

/* ---------- PC (문제 + 코드) ---------- */
const TEMPLATE = {
  py: 'import sys\ninput = sys.stdin.readline\n\n',
};
const LANG_ID = { py: 'python' };
const VERDICT = { AC: '정답', WA: '오답', TLE: '시간 초과', RE: '런타임 에러', OLE: '출력 초과', CE: '컴파일 에러' };
let PCCTX = null;   // 지금 열린 풀이가 속한 도전(야생 포켓몬 / 체육관)의 상태. 복습 문제면 null
let ENC = null;     // 풀고 있는(나갔다가 이어서 풀 수 있는) 야생 포켓몬 도전
const inEnc = () => !!PCCTX;
let pcSolvedNow = null;
let editor = null, pcId = null, pcStart = 0, pcTimer = null, pcPending = null, judging = false;
const draft = (id, lang) => (S.drafts[id] && S.drafts[id][lang]) || (pById(id) && pById(id).starter) || TEMPLATE[lang];

const lessonHtml = l => `<div class="lesson"><b>${esc(l.title)}</b>${md(l.text)}${l.code ? `<pre>${esc(l.code)}</pre>` : ''}</div>`;
function pcNotes(p) {
  const upto = P.slice(0, P.findIndex(q => q.id === p.id) + 1).flatMap(q => q.learn || []);
  return `<h2>노트</h2><div class="tg">지금까지 나온 코테 요령</div>${upto.map(lessonHtml).join('')}`;
}
function pcLeft(p) {
  const pr = prog(p.id), s = S.solved[p.id];
  const ex = p.examples.map((e, i) => `<div class="exb"><span class="dim">예제 ${i + 1}</span><div class="ex ${(String(e.input).length > 16 || String(e.output).length > 16) ? 'col' : ''}"><div><i>입력</i><pre>${esc(e.input) || '(없음)'}</pre></div><div><i>출력</i><pre>${esc(e.output)}</pre></div></div></div>`).join('');
  const hints = p.hints.slice(0, pr.hints).map((h, i) => `<div class="hintbox"><span class="dim">풀이 힌트 ${i + 1}</span><br>${md(h)}</div>`).join('')
    + synItems(p).slice(0, pr.syn || 0).map((h, i) => typeof h === 'string' ? `<div class="hintbox"><span class="dim">문법 힌트 ${i + 1}</span><br>${md(h)}</div>` : `<div class="dim" style="margin-top:6px">문법 힌트 ${i + 1}</div>${lessonHtml(h)}`).join('');
  const ed = s && (!inEnc() || pcSolvedNow === p.id) ? `<h4>해설</h4>${md(p.editorial.text)}<pre>${esc(p.editorial.code)}</pre>` : '';
  const c = PCCTX, ctx = c && c.probIds ? ` · 체육관 ${c.round + 1}/${c.probIds.length}` : c && c.sp ? '' : ' · 복습';
  const head = `<div class="ptag">${esc(p.typeName || '')} · ${['입문', '기본', '응용', '마스터'][(p.tier || 1) - 1]}${ctx}</div><div class="ptitle">${p.boss ? '★ ' : ''}${esc(p.title)}</div>`;
  return `${head}${md(p.statement)}<div class="io"><b>입력</b>${md(p.input)}</div><div class="io"><b>출력</b>${md(p.output)}</div>${ex}${hints ? '<h4>힌트</h4>' + hints : ''}${ed}`;
}
function openPC(id, ctx = null) {
  const p = pById(id); if (!p) return;
  PCCTX = ctx; if (ctx) ctx.opened = true;
  pcId = id; pcPending = null; pcStart = Date.now();
  $('#pc').hidden = false; fit();
  try { $('#pc').style.setProperty('--pcbg', `url(${Art.pt('snow', null).toDataURL()})`); } catch (e) { /* 배경 없이도 쓸 수 있다 */ }
  $('#pc-left').innerHTML = pcLeft(p);
  pcHintBtn(p);
  pcTab('q'); $('#pc-res').innerHTML = '<span class="dim">아래에 답안을 작성한 뒤 실행으로 예제를 확인한다. 제출하면 숨겨진 테스트까지 채점한다. (Ctrl+Enter 실행 · Ctrl+Shift+Enter 제출)</span>';
  require(['vs/editor/editor.main'], () => {
    if (!pcOpen() || pcId !== id) return;
    monaco.editor.defineTheme('poke', { base: 'vs', inherit: true, rules: [], colors: { 'editor.background': '#ffffff', 'editorLineNumber.foreground': '#a9b3c9', 'editor.lineHighlightBackground': '#f4f7ff', 'editor.selectionBackground': '#cfe0ff' } });
    const lang = S.settings.lang;
    editor = monaco.editor.create($('#editor'), {
      value: draft(id, lang), language: LANG_ID[lang], theme: 'poke', fontFamily: 'GM11, monospace', fontSize: 11 * PCU, lineHeight: 15 * PCU,
      wordWrap: 'on', minimap: { enabled: false }, automaticLayout: true, scrollBeyondLastLine: false, tabSize: 4, padding: { top: 10 * PCU },
      folding: false, glyphMargin: false, lineNumbersMinChars: 2, lineDecorationsWidth: 4 * PCU, renderLineHighlight: 'line', overviewRulerLanes: 0,
    });
    editor.onDidChangeModelContent(() => { const d = S.drafts[id] || (S.drafts[id] = {}); d[S.settings.lang] = editor.getValue(); save(); });
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => pcJudge('examples'));
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.Enter, () => pcJudge('submit'));
    editor.focus();
  });
}
function closePC() {
  clearInterval(pcTimer);
  if (editor) { editor.dispose(); editor = null; }
  $('#pc').hidden = true; pcId = null; pcSolvedNow = null; PCCTX = null; fit();
}
const PAGES = ['q', 'r'], PAGE_NAME = { q: '문제', r: '결과' };
let pcPageNow = 'q';
function pcHeader() {
  $('#pc-hd').innerHTML = `<div class="wh2"><b>${PAGE_NAME[pcPageNow]}</b><span class="wpg"><u data-k="L">◀</u><u data-k="R">▶</u></span></div>`;
}
function pcTab(t) {
  pcPageNow = t;
  $('#pc-left').hidden = t !== 'q'; $('#pc-res').hidden = t !== 'r';
  pcHeader();
}
function pcPress(k) {
  if (HINTMENU) return hintMenuKey(k);
  const vis = [$('#pc-left'), $('#pc-res')].find(x => !x.hidden), i = PAGES.indexOf(pcPageNow);
  if (k === 'up' || k === 'down') vis.scrollBy(0, (k === 'up' ? -28 : 28) * PCU);
  else if (k === 'left' || k === 'L') pcTab(PAGES[(i + 1) % 2]);
  else if (k === 'right' || k === 'R' || k === 'Sel') pcTab(PAGES[(i + 1) % 2]);
  else if (k === 'X') ACTS.pchint();
  else if (k === 'Y') pcJudge('examples');
  else if (k === 'A') { if (pcPending) ACTS.pccontinue(); else pcJudge('submit'); }
  else if (k === 'B') ACTS.pcexit();
}
const hintsLeft = p => { const pr = prog(p.id); return { idea: Math.max(0, p.hints.length - pr.hints), syn: Math.max(0, synItems(p).length - (pr.syn || 0)) }; };
function pcHintBtn(p) { const l = hintsLeft(p), left = l.idea + l.syn; const b = $('#pc-hint'); b.querySelector('b').textContent = left ? '힌트' : '힌트 끝'; b.classList.toggle('off', !left); }

const SOFT = { WA: '오답', TLE: '시간 초과', RE: '런타임 에러', OLE: '출력 초과', CE: '컴파일 에러' };
// 내 출력에서 기대 출력과 다른 낱말만 빨갛게 표시한다
function diffOut(exp, act) {
  const el = String(exp).replace(/\r/g, '').trimEnd().split('\n'), al = String(act).replace(/\r/g, '').trimEnd().split('\n');
  return al.map((line, i) => { const e = (el[i] || '').trim().split(/\s+/), a = line.split(/(\s+)/); let w = 0; return a.map(t => { if (/^\s+$/.test(t) || t === '') return esc(t); const ok = e[w++] === t; return ok ? esc(t) : `<mark>${esc(t)}</mark>`; }).join(''); }).join('\n');
}
function resHtml(r, mode, p) {
  const bad = r.verdict !== 'AC', label = !bad ? (mode === 'examples' ? '예제 통과' : '정답') : SOFT[r.verdict];
  const head = `<div class="verdict ${bad ? 'bad' : 'ac'}">${label}</div>`;
  if (r.verdict === 'CE') return `${head}<div class="dim">오류 메시지</div><pre class="mono" style="white-space:pre-wrap">${esc(r.message)}</pre>`;
  const nums = S.settings.showNums ? `<div class="dim">${r.passed}/${r.total} 통과 · 최대 ${r.maxMs}ms</div><div class="dots">${r.cases.map(c => `<i class="${c.status === 'AC' ? 'ac' : 'bad'}"></i>`).join('')}</div>` : '';
  let body = head + '' + nums;
  if (!bad) body += mode === 'examples' ? '<div>예제 통과. 제출하면 숨겨진 테스트까지 채점한다.</div>' : '';
  else if (r.fail && r.fail.input !== undefined) {
    body += `<div class="cmp"><div><span>입력</span><pre>${esc(r.fail.input) || '(없음)'}</pre></div><div><span>기대 출력</span><pre>${esc(r.fail.expected)}</pre></div><div><span>내 출력</span><pre>${r.fail.actual ? diffOut(r.fail.expected, r.fail.actual) : '(없음)'}</pre></div></div>`;
    if (r.fail.stderr) body += `<pre class="red">${esc(r.fail.stderr.slice(0, 600))}</pre>`;
  } else if (r.fail) {
    body += `<div>예제는 통과했지만 숨겨진 테스트에서 실패했다.<br><span class="dim">${{ WA: '경계값(가장 작은 값, 가장 큰 값, 빈 경우)을 확인한다.', TLE: '입력이 매우 클 수 있다. 반복 횟수와 입출력 방식을 점검한다.', RE: '리스트 범위, 0으로 나누기, 빈 리스트 접근을 확인한다.', OLE: '반복문이 끝나는 조건을 확인한다.' }[r.verdict] || ''}</span></div>`;
    if (r.fail.stderr) body += `<pre class="red">${esc(r.fail.stderr.slice(0, 600))}</pre>`;
  }
  return body;
}

async function pcJudge(mode) {
  if (judging || !editor) return;
  const p = pById(pcId), lang = S.settings.lang, pr = prog(p.id), firstTry = pr.attempts === 0;
  judging = true;
  $('#pc-res').innerHTML = '<span class="dim">채점하는 중…</span>';
  let r;
  try { r = await api.judge({ id: p.id, lang, code: editor.getValue(), mode, settings: S.settings }); } catch (e) { r = { verdict: 'CE', message: String(e), cases: [] }; }
  judging = false;
  if (PCCTX && mode === 'submit' && r.verdict !== 'AC' && r.verdict !== 'CE') PCCTX.wrong = (PCCTX.wrong || 0) + 1;   // 코치가 "한 번에 생각났나"를 볼 때 쓴다 (화면에는 안 보인다)
  if (!pcOpen()) return;
  let html = resHtml(r, mode, p);
  if (r.verdict === 'AC') { FX.sfx(mode === 'submit' ? 'correct' : 'ok'); if (mode === 'submit') FX.flash('#ffffff', 260); } else { FX.sfx('wrong'); }
  if (mode === 'submit' && r.verdict !== 'CE' && !S.solved[p.id]) { pr.attempts++; save(); }
  if (mode === 'submit' && r.verdict === 'AC') {
    onAccepted(p, r, firstTry);
    $('#pc-left').innerHTML = pcLeft(p);
    html += `<div style="margin-top:${8 * PCU}px"><span class="pb go" data-a="pccontinue">${PCCTX && PCCTX.sp ? '몬스터볼 던지기 ▶' : PCCTX && PCCTX.probIds ? '다음으로 ▶' : '계속 ▶'}</span></div>`;
  }
  $('#pc-res').innerHTML = html; pcTab('r');
}
function onAccepted(p, r, firstTry) {
  const pr = prog(p.id), day = dk(Date.now()), prev = S.solved[p.id];
  if (!S.days.includes(day)) S.days.push(day);
  pcSolvedNow = p.id;
  S.solved[p.id] = { ts: Date.now(), solo: pr.hints === 0 && !(pr.syn || 0), firstTry, attempts: pr.attempts, hints: pr.hints, syn: pr.syn || 0, lang: S.settings.lang, ms: r.maxMs, n: ((prev && prev.n) || 0) + 1 };
  if (!prev && (pr.hints >= 2 || (pr.syn || 0) >= 2 || pr.attempts >= 4)) S.review[p.id] = { due: Date.now() + REVIEW_DAYS[0] * DAY, step: 0 };
  else if (prev && S.review[p.id] && S.review[p.id].due <= Date.now()) {
    const rv = S.review[p.id];
    rv.step++;
    if (rv.step >= REVIEW_DAYS.length) delete S.review[p.id]; else rv.due = Date.now() + REVIEW_DAYS[rv.step] * DAY;
  }
  save();
}

/* ---------- 힌트: 풀이가 안 떠오르는지, 문법이 막히는지 먼저 고른다 ---------- */
let HINTMENU = null;
function applyHint(kind) {
  const p = pById(pcId), pr = prog(p.id);
  if (kind === 'syn') { pr.syn = (pr.syn || 0) + 1; if (PCCTX) PCCTX.synUsed = (PCCTX.synUsed || 0) + 1; }
  else { pr.hints++; if (PCCTX) PCCTX.hintsUsed = (PCCTX.hintsUsed || 0) + 1; }
  save(); $('#pc-left').innerHTML = pcLeft(p); pcHintBtn(p); pcTab('q');
  const hb = document.querySelectorAll('#pc-left .hintbox, #pc-left .lesson'); if (hb.length) hb[hb.length - 1].scrollIntoView({ block: 'start' });
}
function openHintMenu() {
  const p = pById(pcId), l = hintsLeft(p); HINTMENU = { i: 0 };
  let el = $('#pc-hm'); if (!el) { el = document.createElement('div'); el.id = 'pc-hm'; $('#pc-hd').parentElement.appendChild(el); }
  const row = (k, t, n, i) => `<div class="hmi ${HINTMENU.i === i ? 'on' : ''}" data-a="hintsel" data-k="${k}"><b>${t}</b><i>남은 힌트 ${n}개</i></div>`;
  el.innerHTML = `<div class="hmb"><div class="hmq">힌트 종류</div>${row('idea', '풀이 방향', l.idea, 0)}${row('syn', '파이썬 문법', l.syn, 1)}<div class="hmf">▲▼ 선택 · A 확인 · B 닫기</div></div>`;
  el.hidden = false;
}
function closeHintMenu() { HINTMENU = null; const el = $('#pc-hm'); if (el) el.hidden = true; }
function hintMenuKey(k) {
  if (k === 'up' || k === 'down') { HINTMENU.i = 1 - HINTMENU.i; const p = pById(pcId); openHintMenuKeep(); return; }
  if (k === 'A' || k === 'X') { const kind = HINTMENU.i ? 'syn' : 'idea'; closeHintMenu(); applyHint(kind); return; }
  if (k === 'B') closeHintMenu();
}
function openHintMenuKeep() { const i = HINTMENU.i; openHintMenu(); HINTMENU.i = i; const p = pById(pcId), l = hintsLeft(p); const els = document.querySelectorAll('#pc-hm .hmi'); els.forEach((e, n) => e.classList.toggle('on', n === i)); }

/* ---------- 버튼 동작 ---------- */
const ACTS = {
  pctab(el) { pcTab(el.dataset.t); },
  dexmode() { DEXF.mode = (DEXF.mode + 1) % 3; cur = 0; render(); },
  pcexit() { closePC(); render(); },
  pcrun() { pcJudge('examples'); },
  pcsubmit() { pcJudge('submit'); },
  pchint() {
    const p = pById(pcId), l = hintsLeft(p);
    if (l.idea && l.syn) openHintMenu(); else if (l.idea) applyHint('idea'); else if (l.syn) applyHint('syn');
  },
  hintsel(el) { closeHintMenu(); applyHint(el.dataset.k); },
  async pccontinue() {   // 정답 → 배틀 중이면 그 문제가 곧 몬스터볼 던지기
    const c = PCCTX;
    closePC();
    if (c && c.sp) showResult(c);          // 야생 포켓몬 도전: 정답 → 결과 화면에서 볼이 날아간다
    else if (c && c.probIds) { render(); gymRound(); }
    else render();
  },
};

/* ---------- 시작 ---------- */
(async function boot() {
  fit();
  addEventListener('resize', fit);
  P = await api.problems();
  try { PLAN = await api.plan(); FACTORY = await api.factoryStatus(); } catch (e) { /* 옛 환경이면 계획 없이 진행 */ }
  const saved = await api.loadState();
  if (saved) S = { ...fresh(), ...saved, settings: { ...fresh().settings, ...(saved.settings || {}), lang: 'py' } };
  S.region = S.region || 0; S.last = S.last || null; S.skill = S.skill || {}; S.recent = S.recent || []; S.badges = S.badges || {}; S.gym = S.gym || {}; S.nrep = S.nrep || 0;
  migrateDex();
  Object.values(S.dex).forEach(d => { if (d.caught && !d.lv) d.lv = levelOf(d); });
  tools = await api.detect(S.settings);
  if (S.enc && SP[S.enc.sp] && pById(S.enc.probId)) {   // 풀다가 앱을 껐다면 그 문제로 이어서
    const sp = SP[S.enc.sp];
    ENC = { sp, d: S.dex[sp.id] || (S.dex[sp.id] = { seen: 1, caught: 0, shiny: 0 }), shiny: !!S.enc.shiny, region: S.enc.region, probId: S.enc.probId, opened: false, wrong: 0, hintsUsed: 0, reported: false };
  } else S.enc = null;
  go('field', { region: curRegion() });
  if (!S.seenIntro) { S.seenIntro = true; save(); showHelp('intro'); }
})();
