// 채점 엔진: 컴파일 → 테스트 케이스별 실행 → 출력 비교
const { spawn, spawnSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const OUT_MAX = 8 * 1024 * 1024;

function works(cmd, args) {
  try {
    const r = spawnSync(cmd, args, { encoding: 'utf8', timeout: 8000, windowsHide: true });
    return r.status === 0;
  } catch (e) {
    return false;
  }
}

function wingetGxx() {
  const base = path.join(process.env.LOCALAPPDATA || '', 'Microsoft', 'WinGet', 'Packages');
  try {
    return fs.readdirSync(base)
      .filter(n => /w64devkit|mingw|winlibs/i.test(n))
      .flatMap(n => [
        path.join(base, n, 'w64devkit', 'bin', 'g++.exe'),
        path.join(base, n, 'mingw64', 'bin', 'g++.exe'),
      ]);
  } catch (e) {
    return [];
  }
}

function detect(settings = {}) {
  const gxxCands = [
    settings.gxx, 'g++',
    'C:\\w64devkit\\bin\\g++.exe',
    'C:\\msys64\\ucrt64\\bin\\g++.exe',
    'C:\\msys64\\mingw64\\bin\\g++.exe',
    'C:\\MinGW\\bin\\g++.exe',
    ...wingetGxx(),
  ].filter(Boolean);
  const pyCands = [settings.python, 'python', 'python3', 'py'].filter(Boolean);
  let gxx;
  return {
    get gxx() { return gxx === undefined ? (gxx = gxxCands.find(c => works(c, ['--version'])) || null) : gxx; },
    python: pyCands.find(c => works(c, ['--version'])) || null,
  };
}

function envFor(tool) {
  const env = { ...process.env, PYTHONIOENCODING: 'utf-8', PYTHONDONTWRITEBYTECODE: '1' };
  if (tool && path.isAbsolute(tool)) env.PATH = path.dirname(tool) + path.delimiter + (env.PATH || '');
  return env;
}

function runProc(cmd, args, { input = '', limit = 2000, cwd, env } = {}) {
  return new Promise(resolve => {
    const t0 = Date.now();
    let out = '', err = '', size = 0, killed = null;
    let p;
    try {
      p = spawn(cmd, args, { cwd, env, windowsHide: true });
    } catch (e) {
      return resolve({ status: 're', stdout: '', stderr: String(e), ms: 0 });
    }
    const timer = setTimeout(() => { killed = 'tle'; p.kill('SIGKILL'); }, limit);
    p.stdout.on('data', d => {
      size += d.length;
      if (size > OUT_MAX) { killed = 'ole'; p.kill('SIGKILL'); } else out += d;
    });
    p.stderr.on('data', d => { if (err.length < 4000) err += d; });
    p.on('error', e => { clearTimeout(timer); resolve({ status: 're', stdout: out, stderr: String(e), ms: Date.now() - t0 }); });
    p.on('close', code => {
      clearTimeout(timer);
      resolve({
        status: killed || (code === 0 ? 'ok' : 're'),
        stdout: out, stderr: err, code, ms: Date.now() - t0,
      });
    });
    p.stdin.on('error', () => {});
    p.stdin.end(input);
  });
}

const normalize = s => s.replace(/\r/g, '').split('\n').map(l => l.replace(/\s+$/, '')).join('\n').replace(/\n+$/, '');

function same(checker, actual, expected) {
  if (checker === 'float') {
    const a = actual.trim().split(/\s+/), b = expected.trim().split(/\s+/);
    if (a.length !== b.length) return false;
    return a.every((x, i) => {
      const u = parseFloat(x), v = parseFloat(b[i]);
      return Number.isFinite(u) && Math.abs(u - v) <= 1e-6 * Math.max(1, Math.abs(v));
    });
  }
  return normalize(actual) === normalize(expected);
}

async function prepare(lang, code, tools) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cote-'));
  if (lang === 'cpp') {
    if (!tools.gxx) return { ok: false, dir, msg: 'C++ 컴파일러(g++)를 찾지 못했어요. 설정에서 경로를 지정하거나 컴파일러를 설치해 주세요.' };
    fs.writeFileSync(path.join(dir, 'main.cpp'), code);
    const exe = path.join(dir, process.platform === 'win32' ? 'sol.exe' : 'sol');
    const r = await runProc(tools.gxx, ['-O2', '-std=c++17', '-o', exe, 'main.cpp'], { limit: 60000, cwd: dir, env: envFor(tools.gxx) });
    if (r.status !== 'ok') return { ok: false, dir, msg: (r.stderr || r.stdout || '컴파일 실패').slice(0, 4000) };
    return { ok: true, dir, cmd: exe, args: [], env: envFor(tools.gxx), factor: 1 };
  }
  if (!tools.python) return { ok: false, dir, msg: 'Python을 찾지 못했어요. 설정에서 경로를 지정해 주세요.' };
  const file = path.join(dir, 'main.py');
  fs.writeFileSync(file, code);
  return { ok: true, dir, cmd: tools.python, args: [file], env: envFor(tools.python), factor: 3 };
}

const cleanup = dir => fs.rm(dir, { recursive: true, force: true }, () => {});

// mode: 'examples' 는 예제만, 'submit' 은 히든 케이스까지
async function judge(problem, lang, code, mode, tools) {
  const prep = await prepare(lang, code, tools);
  if (!prep.ok) { cleanup(prep.dir); return { verdict: 'CE', message: prep.msg, cases: [] }; }
  const nEx = problem.examples.length;
  const tests = mode === 'examples' ? problem.tests.slice(0, nEx) : problem.tests;
  const limit = Math.max(problem.limit * prep.factor, 4000);   // 파이썬 시작이 느린 컴퓨터에서 정답이 시간 초과로 나오지 않게 바닥을 둔다
  const cases = [];
  let fail = null;
  const PAR = 4;
  for (let s = 0; s < tests.length && !fail; s += PAR) {
    const batch = tests.slice(s, s + PAR);
    const rs = await Promise.all(batch.map(t => runProc(prep.cmd, prep.args, { input: t.input, limit, cwd: prep.dir, env: prep.env })));
    for (let k = 0; k < batch.length; k++) {
      const i = s + k, t = batch[k], r = rs[k];
      let status = 'AC';
      if (r.status === 'tle') status = 'TLE';
      else if (r.status === 'ole') status = 'OLE';
      else if (r.status === 're') status = 'RE';
      else if (!same(problem.checker, r.stdout, t.output)) status = 'WA';
      cases.push({ status, ms: r.ms, example: i < nEx });
      if (status !== 'AC') {
        fail = { index: i, status };
        if (i < nEx) Object.assign(fail, { input: t.input, expected: t.output, actual: r.stdout.slice(0, 2000) });
        if (status === 'RE') fail.stderr = r.stderr;
        break;
      }
    }
  }
  cleanup(prep.dir);
  if (fail && fail.stderr) fail.stderr = fail.stderr.split(prep.dir + path.sep).join('').split(prep.dir).join('');   // 임시 폴더 경로는 보여 주지 않는다
  if (fail && fail.status === 'RE' && /^(SyntaxError|IndentationError|TabError)/m.test(fail.stderr || '')) return { verdict: 'CE', message: fail.stderr.slice(0, 1200), cases: [] };   // 문법 오류는 컴파일 에러로
  const verdict = fail ? fail.status : 'AC';
  return { verdict, cases, total: tests.length, passed: cases.filter(c => c.status === 'AC').length, fail, maxMs: Math.max(0, ...cases.map(c => c.ms)) };
}

module.exports = { detect, judge };
