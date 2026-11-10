const { app, BrowserWindow, ipcMain, screen } = require('electron');
const fs = require('fs');
const path = require('path');
const judge = require('./judge');
const { build, publicView } = require('./problems');
const ai = require('./ai');
const factory = require('./factory');

ai.loadEnv(__dirname);

const problems = build();
const byId = Object.fromEntries(problems.map(p => [p.id, p]));

// 개발·검증용 옵션: --userData=<dir> --steps=<steps.json>
const arg = name => (process.argv.find(a => a.startsWith(`--${name}=`)) || '').slice(name.length + 3);
if (arg('userData')) app.setPath('userData', arg('userData'));
// 검증 모드에서는 창이 가려져 있어도 화면이 계속 갱신되도록 절전을 끈다
if (arg('steps')) {
  app.disableHardwareAcceleration();
  for (const sw of ['disable-backgrounding-occluded-windows', 'disable-renderer-backgrounding', 'disable-background-timer-throttling']) app.commandLine.appendSwitch(sw);
}

const statePath = () => path.join(app.getPath('userData'), 'state.json');
const genPath = () => path.join(app.getPath('userData'), 'generated.json');
const metaPath = () => path.join(app.getPath('userData'), 'factory-meta.json');
const readJson = (f, d) => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { return d; } };
const FACTORY_DAILY_CAP = 20;   // 하루에 AI로 만드는 문제 수 상한 (크레딧을 아끼려고)
// 지난번에 만들어 둔 문제들을 문제집에 합친다
for (const g of readJson(genPath(), [])) if (!byId[g.id]) { problems.push(g); byId[g.id] = g; }
const today = () => { const d = new Date(); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; };
const madeToday = () => { const meta = readJson(metaPath(), {}); return meta.day === today() ? meta.n : 0; };
let making = false;

function loadState() {
  for (const f of [statePath(), statePath() + '.bak']) { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { /* 다음 후보 */ } }
  return null;
}

function saveState(state) {
  const file = statePath();
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const tmp = file + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(state));
  if (fs.existsSync(file)) fs.copyFileSync(file, file + '.bak');
  fs.renameSync(tmp, file);
}

let tools = null;
const getTools = settings => (tools = judge.detect(settings || {}));

ipcMain.handle('problems:list', () => problems.map(publicView));
// 코치가 "이 유형·단계의 새 문제가 필요해요" 하고 부르면 AI로 만들어서 검증을 통과한 것만 돌려준다
// 지역(주차)마다 다루는 유형 계획 (커리큘럼 계획표에서). 문제가 아직 없는 지역도 코치가 무엇을 만들지 알 수 있다.
ipcMain.handle('plan:get', () => {
  const CUR = require('./problems/curriculum'), weeks = {};
  CUR.REGION_TYPES.forEach((ts, i) => { weeks[i + 1] = ts.slice(); });
  return { weeks, typeNames: CUR.TYPES };
});
ipcMain.handle('factory:status', () => ({ hasKey: ai.hasKey(), made: madeToday(), cap: FACTORY_DAILY_CAP }));
ipcMain.handle('factory:make', async (_, { type, tier, week: reqWeek, cap }) => {
  if (making) return { error: 'BUSY' };
  if (!ai.hasKey()) return { error: 'NO_KEY' };
  if (madeToday() >= Math.max(1, Math.min(200, cap || FACTORY_DAILY_CAP))) return { error: 'CAP' };
  const same = problems.filter(p => p.type === type || (require('./problems/curriculum').PROBLEMS.find(c => c.id === p.id) || {}).type === type);
  const CUR = require('./problems/curriculum'), week = reqWeek || (CUR.PROBLEMS.find(c => c.type === type) || {}).week || 1;
  making = true;
  try {
    const t = tools || getTools({});
    const p = await factory.make({ type, typeName: CUR.TYPES[type] || type, tier: Math.max(1, Math.min(4, tier || 1)), week, avoid: same.map(x => x.title), python: t.python || 'python' });
    if (byId[p.id]) return { error: 'DUP' };
    problems.push(p); byId[p.id] = p;
    fs.mkdirSync(path.dirname(genPath()), { recursive: true });
    fs.writeFileSync(genPath(), JSON.stringify(problems.filter(x => x.generated)));
    fs.writeFileSync(metaPath(), JSON.stringify({ day: today(), n: madeToday() + 1 }));
    return publicView(p);
  } catch (e) { return { error: e.code || 'FAIL', message: String(e.message).slice(0, 200) }; } finally { making = false; }
});
ipcMain.handle('state:load', () => loadState());
ipcMain.handle('state:save', (_, s) => { try { saveState(s); return true; } catch (e) { return false; } });
ipcMain.handle('env:detect', (_, settings) => ({ python: getTools(settings).python }));   // g++ 탐색은 C++ 채점 때만
ipcMain.handle('judge:run', (_, { id, lang, code, mode, settings }) => {
  const p = byId[id];
  if (!p) return { verdict: 'CE', message: '문제를 찾을 수 없어요.', cases: [] };
  return judge.judge(p, lang, code, mode, tools || getTools(settings));
});


let mainWin = null;
// 창 = DS 콘솔(386x434)의 정수 배(실제 화면 픽셀 기준 n배). 정수 배여야 도트가 번지지 않는다.
// 투명 창은 끌어서 크기를 못 바꾸니 단계별로 고른다.
const SIZE_NAME = ['아주 작게', '작게', '조금 작게', '보통', '조금 크게', '크게', '아주 크게', '최대'];   // n = 1..8
let sizeN = 2;
const sf = () => screen.getPrimaryDisplay().scaleFactor || 1;
const sizeFile = () => path.join(app.getPath('userData'), 'window.json');
function fitsScreen(n) { const d = screen.getPrimaryDisplay().workAreaSize; return 434 * n / sf() <= d.height - 20 && 386 * n / sf() <= d.width - 20; }
function initialSize() {
  try { const n = JSON.parse(fs.readFileSync(sizeFile(), 'utf8')).n; if (n >= 1 && n <= SIZE_NAME.length && fitsScreen(n)) return n; } catch (e) { /* 처음 실행 */ }
  let best = 1; for (let n = 1; n <= SIZE_NAME.length; n++) if (fitsScreen(n) && 434 * n / sf() <= screen.getPrimaryDisplay().workAreaSize.height * 0.8) best = n;
  return best;
}
const savedW = () => { try { const w = JSON.parse(fs.readFileSync(sizeFile(), 'utf8')).w; return w >= 260 ? w : 0; } catch (e) { return 0; } };
// 아무 크기로나 조절: 가로 w에 맞춰 세로는 닌텐도 비율(386:434)로 따라온다
function freeSize(w) {
  const d = screen.getPrimaryDisplay().workAreaSize;
  w = Math.max(260, Math.min(w, d.width - 10, (d.height - 10) * 386 / 434));
  if (!mainWin) return w;
  mainWin.setContentSize(Math.round(w), Math.round(w * 434 / 386));
  try { fs.writeFileSync(sizeFile(), JSON.stringify({ n: sizeN, w })); } catch (e) { /* 저장 못 해도 계속 */ }
  return w;
}
ipcMain.handle('win:resize', (_, w) => freeSize(Number(w) || 0));
function restoreSize() { const w = savedW(); if (w) freeSize(w); else applySize(); }
function applySize() {
  if (!mainWin) return;
  mainWin.setContentSize(Math.round(386 * sizeN / sf()), Math.round(434 * sizeN / sf()));
  try { fs.writeFileSync(sizeFile(), JSON.stringify({ n: sizeN })); } catch (e) { /* 저장 못 해도 계속 */ }
}
// delta: 1 / -1 = 한 단계 키우기·줄이기, 'cycle' = 끝에 닿으면 처음으로, 0 = 현재 상태만 알려 주기
ipcMain.handle('win:size', (_, delta) => {
  const max = SIZE_NAME.length;
  if (delta && typeof delta === 'object') { const j = Math.max(1, Math.min(max, Math.round(delta.set))); if (j !== sizeN && fitsScreen(j)) { sizeN = j; applySize(); } }
  else if (delta === 'cycle') { do { sizeN = sizeN % max + 1; } while (!fitsScreen(sizeN)); applySize(); }
  else if (delta) { const j = Math.max(1, Math.min(max, sizeN + delta)); if (fitsScreen(j)) { sizeN = j; applySize(); } }
  return { n: sizeN, name: SIZE_NAME[sizeN - 1] };
});
// 전체 화면: 들어갈 때 창 크기 고정을 풀고, 나올 때 저장해 둔 단계 크기로 돌아온다
let fullOn = false, beforeFull = null;
function toggleFull() {
  if (!mainWin) return;
  if (!fullOn) {   // 투명 창은 운영체제 전체 화면에서 돌아오지 못해서, 화면 크기로 직접 키웠다가 되돌린다
    fullOn = true; beforeFull = { pos: mainWin.getPosition(), size: mainWin.getContentSize() };
    const d = screen.getDisplayMatching(mainWin.getBounds()).bounds;
    mainWin.setResizable(true); mainWin.setPosition(d.x, d.y); mainWin.setContentSize(d.width, d.height);
    mainWin.webContents.send('win:fs', true);
  } else {
    fullOn = false;
    const b = beforeFull; mainWin.setContentSize(b.size[0], b.size[1]); mainWin.setPosition(b.pos[0], b.pos[1]); mainWin.setResizable(false);
    mainWin.webContents.send('win:fs', false);
  }
}
ipcMain.handle('win:ctl', (_, a) => { if (!mainWin) return; if (a === 'close') mainWin.close(); else if (a === 'min') mainWin.minimize(); else if (a === 'full') toggleFull(); });
function createWindow() {
  sizeN = arg('steps') ? 2 : initialSize();
  const W0 = savedW() || 386 * sizeN / sf(), U = W0 / 386;
  const win = mainWin = new BrowserWindow({
    width: Math.round(386 * U), height: Math.round(434 * U), useContentSize: true,
    frame: false, transparent: true, resizable: false, hasShadow: false, backgroundColor: '#00000000',
    autoHideMenuBar: true, title: '오박사의 코테 캠프',
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, backgroundThrottling: !arg('steps') },
  });
  win.loadFile(path.join(__dirname, 'renderer', arg('page') || 'index.html'));

  const stepsFile = arg('steps');
  if (stepsFile) {
    const steps = JSON.parse(fs.readFileSync(stepsFile, 'utf8').replace(/^﻿/, ''));
    win.webContents.on('console-message', (...a) => {
      const d = a.find(x => x && typeof x === 'object' && 'message' in x) || { message: a.slice(2, 3).join('') };
      console.log('[console]', String(d.message).slice(0, 400));
    });
    runSteps(win, steps);
  }
}

// 화면 검증용: 단계별로 스크립트를 실행하고 스크린샷을 저장한다
async function runSteps(win, steps) {
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  await new Promise(r => win.webContents.once('did-finish-load', r));
  for (const s of steps) {
    if (s.js) {
      try {
        const out = await win.webContents.executeJavaScript(s.js);
        if (out !== undefined) console.log('[js]', JSON.stringify(out));
      } catch (e) { console.log('[js error]', e.message); }
    }
    await sleep(s.wait || 800);
    if (s.shot) {
      for (let attempt = 0; attempt < 4; attempt++) {
        try {
          const img = await win.webContents.capturePage();
          fs.writeFileSync(s.shot, img.toPNG());
          console.log('[shot]', s.shot);
          break;
        } catch (e) {
          console.log('[shot retry]', attempt + 1, e.message);
          win.show();
          await sleep(1200);
        }
      }
    }
  }
  app.quit();
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => app.quit());
