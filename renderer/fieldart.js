/* 필드 도트 아트: 16x12 타일 지역 지도와 걸어 다니는 캐릭터 (모두 코드로 찍는다)
   타일 16x16, 화면 256x192 = 16x12 타일. 빛은 왼쪽 위에서 온다. */
const FieldArt = (() => {
  const T = 16, W = 16, H = 12;
  const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
  const rng = seed => { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
  const dot = (x, px, py, c, w = 1, h = 1) => { x.fillStyle = c; x.fillRect(px, py, w, h); };

  /* ----- 지역 팔레트: 지역 타입에 따라 풀 색이 조금씩 달라진다 ----- */
  const PAL = {
    grass:   { g: '#6cc24a', g2: '#5aae3c', g3: '#86d462', t: '#2f8f3a', t2: '#7fd65a', path: '#e0c98a', path2: '#cdb372', tree: '#2a7a3a', tree2: '#3f9a4a', tree3: '#1d5a2a' },
    water:   { g: '#62c08a', g2: '#4fae78', g3: '#7ad49c', t: '#2a8a5a', t2: '#76d6a0', path: '#e6d9a8', path2: '#d2c48c', tree: '#2a7a5a', tree2: '#3f9a74', tree3: '#1d5a40' },
    fire:    { g: '#b8c04a', g2: '#a2aa3a', g3: '#cfd562', t: '#7a8a2a', t2: '#c8d65a', path: '#dcb98a', path2: '#c8a070', tree: '#8a6a2a', tree2: '#aa8a3a', tree3: '#5a4a1d' },
    electric:{ g: '#8ac24a', g2: '#74ae3c', g3: '#a2d462', t: '#4a8f2a', t2: '#a8d65a', path: '#e8d890', path2: '#d4c478', tree: '#4a7a2a', tree2: '#5f9a3a', tree3: '#2d5a1d' },
    rock:    { g: '#a8b878', g2: '#94a464', g3: '#bccb8c', t: '#667a3a', t2: '#b4c47a', path: '#d6c4a0', path2: '#bfae88', tree: '#5a7a3a', tree2: '#6f9a4a', tree3: '#3a5a2a' },
    poison:  { g: '#7ab070', g2: '#689e5e', g3: '#92c488', t: '#3a7a5a', t2: '#8cc89a', path: '#cbbfa0', path2: '#b4a888', tree: '#3a6a4a', tree2: '#4f8a60', tree3: '#2a4a38' },
    flying:  { g: '#74c880', g2: '#60b46c', g3: '#8ee09a', t: '#2f9a5a', t2: '#86e0a0', path: '#eee4c0', path2: '#dccfa0', tree: '#2a8a52', tree2: '#3fa86a', tree3: '#1d6a3c' },
    psychic: { g: '#8aba88', g2: '#76a674', g3: '#a2cea0', t: '#4a8a6a', t2: '#9edcb0', path: '#d8cce0', path2: '#c2b4cc', tree: '#4a7a6a', tree2: '#5f9a84', tree3: '#2f5a4a' },
    ice:     { g: '#b8dcc8', g2: '#a2c8b4', g3: '#d2eedc', t: '#5a9a8a', t2: '#c4f0e0', path: '#e8eef4', path2: '#d0dae4', tree: '#4a8a8a', tree2: '#62a8a8', tree3: '#2f6a6a' },
    dragon:  { g: '#9a8ad4', g2: '#8474c0', g3: '#b4a4ea', t: '#5a4aa4', t2: '#b8a8ee', path: '#e4d8f0', path2: '#cfc0e0', tree: '#5a4a9a', tree2: '#7462b8', tree3: '#3a2d6a' },
  };
  const pal = type => PAL[type] || PAL.grass;

  /* ----- 타일 한 칸 그리기 ----- */
  function grassBase(x, p, r) {
    dot(x, 0, 0, p.g, T, T);
    for (let i = 0; i < 14; i++) dot(x, Math.floor(r() * 15), Math.floor(r() * 15), p.g2, 1, 1);
    for (let i = 0; i < 5; i++) dot(x, Math.floor(r() * 15), Math.floor(r() * 15), p.g3, 1, 1);
  }
  const TILES = {
    grass: (x, p, r) => grassBase(x, p, r),
    flower: (x, p, r) => { grassBase(x, p, r); [[3, 4, '#f2a0c0'], [10, 9, '#fff3a0'], [12, 3, '#ffffff']].forEach(([a, b, c]) => { dot(x, a, b, c, 2, 1); dot(x, a, b + 1, c, 1, 1); dot(x, a + 1, b - 1 > 0 ? b - 1 : b, '#ffffff', 1, 1); dot(x, a, b + 2, p.t, 1, 1); }); },
    path: (x, p, r) => { dot(x, 0, 0, p.path, T, T); for (let i = 0; i < 16; i++) dot(x, Math.floor(r() * 15), Math.floor(r() * 15), p.path2, 1, 1); for (let i = 0; i < 4; i++) dot(x, Math.floor(r() * 15), Math.floor(r() * 15), '#f6ecc0', 1, 1); },
    tall: (x, p, r) => {   // 풀숲: 날카로운 풀잎 다발
      grassBase(x, p, r);
      for (const bx of [1, 5, 9, 13]) for (const [dy, h] of [[2, 7], [7, 6]]) {
        const oy = dy + ((bx * 7) % 3);
        dot(x, bx, oy + 2, p.t, 1, h); dot(x, bx + 1, oy, p.t2, 1, h + 2); dot(x, bx + 2, oy + 3, p.t, 1, h - 1);
        dot(x, bx + 1, oy, '#1f5a2a', 1, 1);
      }
      dot(x, 0, 14, p.t, T, 2);
    },
    tree: (x, p, r) => {
      grassBase(x, p, r);
      dot(x, 6, 11, '#7a4a22', 4, 5); dot(x, 6, 11, '#9a6232', 1, 5); dot(x, 9, 11, '#5a3414', 1, 5);   // 줄기
      const canopy = [[4, 0, 8], [2, 1, 12], [1, 2, 14], [1, 3, 14], [0, 4, 16], [0, 5, 16], [0, 6, 16], [1, 7, 14], [1, 8, 14], [2, 9, 12], [4, 10, 8]];
      for (const [sx, sy, w] of canopy) dot(x, sx, sy, p.tree, w, 1);
      for (const [sx, sy, w] of canopy.slice(0, 5)) dot(x, sx + 1, sy + 1, p.tree2, Math.max(1, w - 6), 1);
      dot(x, 4, 2, p.tree2, 3, 1); dot(x, 3, 4, p.tree2, 3, 1); dot(x, 12, 8, p.tree3, 2, 1); dot(x, 9, 9, p.tree3, 4, 1);
      // 윤곽선
      for (const [sx, sy, w] of canopy) { dot(x, sx, sy, p.tree3, 1, 1); dot(x, sx + w - 1, sy, p.tree3, 1, 1); }
      dot(x, 4, 0, p.tree3, 8, 1); dot(x, 4, 10, p.tree3, 8, 1);
    },
    water: (x, p, r) => {
      dot(x, 0, 0, '#4a90e0', T, T);
      for (let i = 0; i < 3; i++) { const a = Math.floor(r() * 10), b = 2 + i * 5; dot(x, a, b, '#8cc4f4', 5, 1); dot(x, a + 1, b + 1, '#3a78c8', 4, 1); }
    },
    rock: (x, p, r) => {
      grassBase(x, p, r);
      const body = [[4, 5, 8], [2, 6, 12], [1, 7, 14], [1, 8, 14], [2, 9, 12], [3, 10, 10]];
      for (const [sx, sy, w] of body) dot(x, sx, sy, '#9aa2b0', w, 1);
      dot(x, 3, 6, '#c8ced8', 5, 1); dot(x, 2, 7, '#c8ced8', 4, 1); dot(x, 9, 9, '#7a8294', 4, 1); dot(x, 6, 10, '#7a8294', 6, 1);
      for (const [sx, sy, w] of body) { dot(x, sx, sy, '#4a5262', 1, 1); dot(x, sx + w - 1, sy, '#4a5262', 1, 1); }
      dot(x, 4, 4, '#4a5262', 8, 1); dot(x, 3, 11, '#4a5262', 10, 1);
    },
    sign: (x, p, r) => {
      grassBase(x, p, r);
      dot(x, 7, 8, '#7a4a22', 2, 7); dot(x, 3, 3, '#5a3414', 10, 7); dot(x, 4, 4, '#e8c888', 8, 5); dot(x, 5, 5, '#a8884a', 6, 1); dot(x, 5, 7, '#a8884a', 5, 1);
    },
  };
  TILES.gym = TILES.grass;   // 건물 칸 밑바탕 (위에 건물을 얹어 그린다)
  TILES.door = TILES.path;
  const WALK = { grass: 1, flower: 1, path: 1, tall: 1, sign: 0, tree: 0, water: 0, rock: 0, gym: 0, door: 1 };
  const ACCENT = { grass: '#43a85c', water: '#3d74d6', fire: '#e0453a', electric: '#f5c635', rock: '#9a8a6a', poison: '#8a4ac0', flying: '#7aa8e8', psychic: '#d060a0', ice: '#7ad0e0', dragon: '#5a4aa4' };

  /* ----- 지역 지도: 격자 + 그림 ----- */
  function layout(region, type) {
    const r = rng(1000 + region * 97), g = Array.from({ length: H }, () => Array(W).fill('grass'));
    // 바깥 나무 담장 (아래쪽 가운데는 입구)
    for (let x = 0; x < W; x++) { g[0][x] = 'tree'; g[1][x] = r() < .6 ? 'tree' : 'grass'; if (x < 6 || x > 9) g[H - 1][x] = 'tree'; }
    for (let y = 0; y < H; y++) { g[y][0] = 'tree'; g[y][W - 1] = 'tree'; if (y % 3 === 1) { g[y][1] = 'tree'; g[y][W - 2] = 'tree'; } }
    // 길: 아래 가운데에서 위로, 가운데에서 좌우로 한 번씩 갈라짐
    for (let y = 2; y < H; y++) g[y][7] = g[y][8] = 'path';
    const by = 6 + Math.floor(r() * 2);
    for (let x = 2; x < W - 2; x++) { if (g[by][x] !== 'tree') g[by][x] = 'path'; }
    // 풀숲 덩어리들
    const blobs = [[2, 2, 5, 3], [10, 2, 5, 3], [2, 8, 5, 3], [10, 8, 5, 3]];
    blobs.forEach(([bx, bY, bw, bh], i) => {
      if (i > 1 && r() < .2) return;
      const ox = Math.floor(r() * 2), oy = Math.floor(r() * 2);
      for (let y = bY + oy; y < bY + bh + oy && y < H - 1; y++) for (let x = bx + ox; x < bx + bw + ox && x < W - 1; x++) if (g[y][x] === 'grass' && (x + y + i) % 7 !== 0) g[y][x] = 'tall';
    });
    // 장식: 꽃, 바위, 연못 (지역마다 다르게)
    const deco = type === 'water' ? 'water' : type === 'rock' ? 'rock' : 'flower';
    for (let i = 0; i < 14; i++) { const x = 2 + Math.floor(r() * (W - 4)), y = 2 + Math.floor(r() * (H - 4)); if (g[y][x] === 'grass') g[y][x] = i % 3 === 0 && deco !== 'flower' ? deco : 'flower'; }
    if (type === 'water') for (let y = 2; y < 4; y++) for (let x = 12; x < 14; x++) if (g[y][x] !== 'tree') g[y][x] = 'water';
    for (let y = 0; y < 2; y++) for (let x = 6; x < 10; x++) g[y][x] = 'gym';   // 위쪽에 체육관, 가운데 두 칸이 문
    g[1][7] = g[1][8] = 'door'; g[2][7] = g[2][8] = 'path';
    g[H - 2][6] = 'sign';
    return g;
  }
  function render(region, type) {
    const g = layout(region, type), p = pal(type), cv = mk(W * T, H * T), x = cv.getContext('2d'), r = rng(7 + region);
    for (let y = 0; y < H; y++) for (let i = 0; i < W; i++) {
      const t = mk(T, T), tx = t.getContext('2d');
      (TILES[g[y][i]] || TILES.grass)(tx, p, r);
      x.drawImage(t, i * T, y * T);
    }
    drawGym(x, type);
    return { canvas: cv, grid: g, walk: g.map(row => row.map(c => !!WALK[c])), tall: g.map(row => row.map(c => c === 'tall')), start: [7, H - 2] };
  }

  /* ----- 체육관 건물 (4x2 타일 = 64x32) ----- */
  function drawGym(x, type) {
    const ox = 6 * T, a = ACCENT[type] || '#43a85c', O = '#2b2b3d', roofD = '#00000033';
    const R = (c, px, py, w, h) => dot(x, ox + px, py, c, w, h);
    R(O, 0, 5, 64, 27); R('#f2ecd8', 1, 14, 62, 17); R('#d8cfb0', 1, 28, 62, 3);          // 벽
    R(O, 0, 3, 64, 12); R(a, 1, 4, 62, 10); R('#ffffff44', 1, 4, 62, 2); R('#00000033', 1, 12, 62, 2);   // 지붕
    for (let i = 0; i < 62; i += 6) R('#00000022', 1 + i, 6, 1, 6);                       // 기와 줄
    R(O, 10, 0, 44, 6); R(a, 11, 1, 42, 4); R('#ffffff55', 11, 1, 42, 1);                  // 지붕 꼭대기
    for (const wx of [5, 49]) { R(O, wx, 17, 10, 9); R('#9ed4f4', wx + 1, 18, 8, 7); R('#ffffff', wx + 1, 18, 3, 2); R(O, wx + 4, 18, 1, 7); R(O, wx + 1, 21, 8, 1); }   // 창문
    R(O, 22, 13, 20, 19); R('#5a3a22', 23, 14, 18, 18); R('#7a5232', 24, 15, 7, 17); R('#7a5232', 33, 15, 7, 17); R(O, 31, 14, 2, 18); R('#f2c230', 29, 24, 2, 2); R('#f2c230', 34, 24, 2, 2);   // 문
    R(O, 24, 9, 16, 5); R('#fff4c8', 25, 10, 14, 3); R(a, 30, 10, 4, 3);                    // 문 위 간판(배지 색)
    R('#c8bfa0', 20, 30, 24, 2);
  }

  /* ----- 배지 16x16: 모양 5종 x 무늬 2종, 3단 음영 + 반사점 + 어두운 외곽선 (못 딴 건 같은 모양의 회색 실루엣) ----- */
  const badgeCache = {};
  const SHAPES = [
    (dx, dy) => dx * dx + dy * dy <= 7.4 * 7.4,                                   // 원
    (dx, dy) => Math.abs(dx) + Math.abs(dy) <= 8,                                  // 마름모
    (dx, dy) => Math.abs(dy) <= 7 && Math.abs(dx) + Math.abs(dy) * .5 <= 7.6,      // 육각
    (dx, dy) => Math.abs(dx) <= 7 && Math.abs(dy) <= 7 && Math.abs(dx) + Math.abs(dy) <= 10.2,   // 팔각
    (dx, dy) => { const t = Math.atan2(dy, dx), r = Math.hypot(dx, dy); return r <= 5.4 + 2.5 * Math.pow(Math.abs(Math.cos(2 * t)), 3); },   // 별 모양(4갈래)
  ];
  const GLYPHS = [
    [(dx, dy) => Math.hypot(dx, dy) <= 3 && Math.hypot(dx, dy) >= 1.4,           // 고리
     (dx, dy) => Math.abs(dx) + Math.abs(dy) <= 3.2,                             // 마름모
     (dx, dy) => (Math.abs(dx) <= .8 && Math.abs(dy) <= 3.2) || (Math.abs(dy) <= .8 && Math.abs(dx) <= 3.2),   // 십자
     (dx, dy) => dy >= -3 && dy <= 2.8 && Math.abs(dx) <= (dy + 3) * .55,        // 삼각
     (dx, dy) => Math.abs(dx) <= 2.4 && Math.abs(dy) <= 2.4],                   // 네모
    [(dx, dy) => Math.hypot(dx, dy) <= 2.4,                                      // 점
     (dx, dy) => Math.abs(dy) <= .8 && Math.abs(dx) <= 3.4,                      // 가로줄
     (dx, dy) => Math.abs(dx) <= .8 && Math.abs(dy) <= 3.4,                      // 세로줄
     (dx, dy) => Math.abs(Math.abs(dx) - Math.abs(dy)) <= .9 && Math.abs(dx) <= 3.2,   // X
     (dx, dy) => Math.hypot(dx, dy) <= 3.2 && Math.hypot(dx, dy) >= 2.2],       // 얇은 고리
  ];
  const shade = (hex, k) => { const n = parseInt(hex.slice(1), 16), f = c => Math.max(0, Math.min(255, Math.round(c * k))); return '#' + [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(c => f(c).toString(16).padStart(2, '0')).join(''); };
  // N: 그려지는 실제 크기(px). 화면에는 항상 1:1로 보여 준다 (아이템·트레이너 스프라이트와 같은 도트 크기)
  /* 실제 배지 그림(고해상도)을 작은 도트로 줄인다: 박스 평균 → 색 단계 줄이기 → 투명도 자르기 → 어두운 외곽선 */
  const BIMG = {}; let bLoaded = 0;
  for (const t of ['grass', 'water', 'fire', 'electric', 'rock', 'poison', 'flying', 'psychic', 'ice', 'dragon']) {
    const im = new Image(); im.onload = () => { bLoaded++; for (const k in badgeCache) delete badgeCache[k]; if (typeof render === 'function' && typeof scene !== 'undefined' && ['badges', 'field', 'home', 'gym'].includes(scene.name)) render(); };
    im.src = '../assets/ui/badges/' + t + '.png'; BIMG[t] = im;
  }
  function badgeFromImage(im, got, N) {
    const big = mk(N * 4, N * 4), bx = big.getContext('2d'); bx.imageSmoothingEnabled = true; bx.imageSmoothingQuality = 'high'; bx.drawImage(im, 0, 0, N * 4, N * 4);
    const cv = mk(N, N), x = cv.getContext('2d'); x.imageSmoothingEnabled = true; x.imageSmoothingQuality = 'high'; x.drawImage(big, 1, 1, N * 4 - 2, N * 4 - 2, 1, 1, N - 2, N - 2);
    const id = x.getImageData(0, 0, N, N), d = id.data, LV = 5, q = v => Math.round(Math.round(v / 255 * (LV - 1)) / (LV - 1) * 255);
    for (let i = 0; i < N * N; i++) {
      if (d[i * 4 + 3] < 140) { d[i * 4 + 3] = 0; continue; }
      d[i * 4 + 3] = 255;
      let r = q(d[i * 4]), g = q(d[i * 4 + 1]), b = q(d[i * 4 + 2]);
      if (!got) { const l = Math.round((r * .3 + g * .59 + b * .11) * .75 + 30); r = g = b = q(l); }
      d[i * 4] = r; d[i * 4 + 1] = g; d[i * 4 + 2] = b;
    }
    x.putImageData(id, 0, 0);
    const solid = (px, py) => px >= 0 && py >= 0 && px < N && py < N && d[(py * N + px) * 4 + 3] > 0, out = [];
    for (let py = 0; py < N; py++) for (let px = 0; px < N; px++) if (!solid(px, py) && (solid(px - 1, py) || solid(px + 1, py) || solid(px, py - 1) || solid(px, py + 1))) out.push([px, py]);
    out.forEach(([px, py]) => dot(x, px, py, got ? '#1b1b2f' : '#4a5164'));
    return cv.toDataURL();
  }
  function badge(type, idx, got, N = 30) {
    const im = BIMG[type];
    if (im && im.complete && im.naturalWidth) { const key = 'img' + type + got + N; return badgeCache[key] || (badgeCache[key] = badgeFromImage(im, got, N)); }
    return badgeProc(type, idx, got, N);
  }
  function badgeProc(type, idx, got, N = 30) {
    const key = type + idx + got + N; if (badgeCache[key]) return badgeCache[key];
    const cv = mk(N, N), x = cv.getContext('2d'), base = got ? (ACCENT[type] || '#43a85c') : '#9aa2b4';
    const sh = SHAPES[idx % 5], gl = GLYPHS[Math.floor(idx / 5) % 2][idx % 5], k = 16 / N, t = Math.max(1, Math.round(N / 16));
    const inS = (px, py) => px >= 0 && py >= 0 && px < N && py < N && sh((px + .5) * k - 8, (py + .5) * k - 8);
    const inG = (px, py) => gl((px + .5) * k - 8, (py + .5) * k - 8);
    const hi = shade(base, 1.3), mid2 = shade(base, 1.12), lo = shade(base, .74), dk = got ? '#1b1b2f' : '#4a5164';
    const near = (f, px, py, d) => !f(px - d, py) || !f(px, py - d) || !f(px - d, py - d);
    const far = (f, px, py, d) => !f(px + d, py) || !f(px, py + d) || !f(px + d, py + d);
    for (let py = 0; py < N; py++) for (let px = 0; px < N; px++) {
      if (!inS(px, py)) continue;
      const edge = !inS(px - 1, py) || !inS(px + 1, py) || !inS(px, py - 1) || !inS(px, py + 1);
      let c = base;
      if (edge) c = dk;
      else if (near(inS, px, py, 1 + t)) c = hi;
      else if (far(inS, px, py, 1 + t)) c = lo;
      else if (near(inS, px, py, 2 + 2 * t) && (px + py) % 2 === 0) c = mid2;   // 하이라이트 쪽 점 디더링
      dot(x, px, py, c);
    }
    if (got) {
      const ins = 2 + t;
      const ok = (px, py) => inS(px, py) && inS(px - ins, py) && inS(px + ins, py) && inS(px, py - ins) && inS(px, py + ins);
      for (let py = 0; py < N; py++) for (let px = 0; px < N; px++) {
        if (!ok(px, py)) continue;
        if (inG(px, py)) { dot(x, px, py, '#fffbe8'); }
      }
      for (let py = 0; py < N; py++) for (let px = 0; px < N; px++) {
        if (!ok(px, py) || inG(px, py)) continue;
        if (inG(px - 1, py) || inG(px, py - 1)) dot(x, px, py, '#00000055');   // 무늬 테두리 그림자
      }
      dot(x, Math.round(N * .26), Math.round(N * .22), '#ffffffd0', t + 1, t + 1);   // 반사점
    }
    return (badgeCache[key] = cv.toDataURL());
  }

  /* ----- 도감 아이콘 30x30 (아이템 스프라이트와 같은 크기·외곽선·음영) ----- */
  let dexIconUrl = null;
  function dexIcon() {
    if (dexIconUrl) return dexIconUrl;
    const cv = mk(30, 30), x = cv.getContext('2d'), O = '#1b1b2f';
    const R = (c, px, py, w, h) => dot(x, px, py, c, w, h);
    R(O, 4, 3, 22, 25); R(O, 3, 5, 24, 21); R(O, 5, 2, 20, 27);               // 둥근 외곽선
    R('#d8362e', 5, 4, 20, 23); R('#d8362e', 4, 6, 22, 19);                     // 몸통
    R('#f2685c', 5, 4, 20, 2); R('#f2685c', 4, 6, 2, 17); R('#f2685c', 6, 3, 18, 1);   // 밝은 쪽
    R('#9e241f', 5, 25, 20, 2); R('#9e241f', 24, 8, 2, 17);                     // 어두운 쪽
    R(O, 7, 7, 8, 8); R('#6fb8f2', 8, 8, 6, 6); R('#bfe3ff', 8, 8, 3, 3); R('#3a7fc0', 12, 12, 2, 2);   // 렌즈
    R(O, 17, 8, 3, 3); R('#f5c635', 18, 9, 1, 1); R(O, 21, 8, 3, 3); R('#58b060', 22, 9, 1, 1);        // 램프
    R(O, 7, 17, 17, 8); R('#c8d8b8', 8, 18, 15, 6); R('#e8f2d8', 8, 18, 15, 1); R('#8aa078', 8, 23, 15, 1); // 화면
    R('#5a7a50', 11, 20, 4, 2); R('#5a7a50', 16, 20, 5, 2);                      // 화면 속 줄
    return (dexIconUrl = cv.toDataURL());
  }

  /* ----- 오박사 연구소: 위에서 내려다본 방 (어나더 레드·FRLG처럼 16px 타일 위에 책장·기계·몬스터볼 탁자) ----- */
  let labCv = null;
  function lab() {
    if (labCv) return labCv;
    const W = 256, H = 192, cv = mk(W, H), x = cv.getContext('2d'), r = rng(11);
    const R = (c, px, py, w, h) => dot(x, px, py, c, w, h);
    const O = '#2b2b3d';
    // 바닥: 연한 청회색 타일 (체크 + 줄눈)
    for (let ty = 0; ty < 12; ty++) for (let tx = 0; tx < 16; tx++) {
      const a = (tx + ty) % 2 ? '#d6dae7' : '#ccd1e0';
      R(a, tx * 16, ty * 16, 16, 16); R('#e4e7f1', tx * 16, ty * 16, 16, 1); R('#e4e7f1', tx * 16, ty * 16, 1, 16); R('#b9bfd4', tx * 16, ty * 16 + 15, 16, 1); R('#b9bfd4', tx * 16 + 15, ty * 16, 1, 16);
      if (r() < .25) R('#c2c8da', tx * 16 + 3 + Math.floor(r() * 8), ty * 16 + 4 + Math.floor(r() * 8), 2, 1);
    }
    // 뒤쪽 벽
    R(O, 0, 0, W, 34); R('#ece4cc', 0, 1, W, 20); R('#f6efdb', 0, 1, W, 2); R('#a2afc8', 0, 21, W, 11); R('#c4cfe2', 0, 21, W, 2); R('#6e7a98', 0, 31, W, 1); R('#4a5470', 0, 32, W, 2);
    for (let i = 0; i < W; i += 16) R('#8f9cb8', i, 23, 1, 8);
    // 창문 (가운데)
    R(O, 94, 3, 44, 24); R('#8a5a30', 95, 4, 42, 22); R('#9ed2f0', 98, 7, 36, 16); R('#c8e8fa', 98, 7, 36, 5); R('#ffffff', 102, 9, 8, 2); R('#ffffff', 120, 12, 9, 2); R('#78c860', 98, 19, 36, 4); R('#5aa84a', 98, 21, 36, 2);
    R('#8a5a30', 115, 7, 2, 16); R('#8a5a30', 98, 14, 36, 2); R('#b8864a', 95, 4, 42, 1); R(O, 92, 27, 48, 3); R('#c9975c', 93, 27, 46, 2);
    // 책장 (왼쪽 두 칸, 오른쪽 한 칸): 위에서 본 정면 32x32
    const shelf = sx => {
      R(O, sx, 2, 32, 34); R('#9a6a38', sx + 1, 3, 30, 32); R('#c9975c', sx + 1, 3, 30, 2); R('#6e4624', sx + 29, 3, 2, 32);
      const cols = ['#d8584a', '#4a7ad8', '#58b86c', '#f0c840', '#9a64c8', '#f09a50', '#f2eee0', '#46a8b8'];
      for (let row = 0; row < 3; row++) {
        const y0 = 6 + row * 10; R('#3b2410', sx + 3, y0, 26, 9);
        let bx = sx + 4;
        while (bx < sx + 27) { const w = 2 + Math.floor(r() * 2), h = 5 + Math.floor(r() * 4), c = cols[Math.floor(r() * cols.length)]; R(c, bx, y0 + 9 - h, w, h); R('#ffffff66', bx, y0 + 9 - h, 1, h); bx += w; }
        R('#c9975c', sx + 3, y0 + 9, 26, 1);
      }
      R('#00000026', sx + 1, 36, 32, 5);                                       // 바닥 그림자
    };
    shelf(16); shelf(48); shelf(176);
    // 기계 (오른쪽 구석): 화면과 단추
    R(O, 214, 2, 36, 40); R('#8e98b0', 215, 3, 34, 38); R('#c4ccde', 215, 3, 34, 2); R('#5e6a88', 247, 3, 2, 38);
    R(O, 218, 7, 28, 14); R('#2a4a5a', 219, 8, 26, 12); R('#58d8b8', 221, 10, 10, 2); R('#58d8b8', 221, 14, 16, 1); R('#38a8d8', 221, 17, 8, 1);
    for (let i = 0; i < 4; i++) { R(O, 219 + i * 7, 25, 6, 5); R(['#e0584a', '#f0c840', '#58b86c', '#4a7ad8'][i], 220 + i * 7, 26, 4, 3); }
    R(O, 219, 33, 26, 5); R('#5e6a88', 220, 34, 24, 3);
    R('#00000026', 214, 42, 36, 5);
    // 탁자와 몬스터볼 세 개
    R('#00000030', 90, 100, 76, 6);
    R(O, 88, 70, 80, 30); R('#b4803f', 89, 71, 78, 20); R('#d8a860', 89, 71, 78, 3); R('#8a5a2a', 89, 91, 78, 8); R('#6e4624', 89, 97, 78, 2);
    for (let i = 0; i < 8; i++) R('#a8743a', 93 + i * 9, 76, 1, 14);          // 나뭇결
    const ball = (bx, col, hi) => { R(O, bx, 64, 12, 12); R('#f2f2f6', bx + 1, 65, 10, 10); R(col, bx + 1, 65, 10, 5); R(hi, bx + 2, 66, 3, 1); R(O, bx + 1, 69, 10, 2); R(O, bx + 4, 68, 4, 4); R('#f2f2f6', bx + 5, 69, 2, 2); R('#00000022', bx + 1, 73, 10, 2); };
    ball(102, '#d85a4a', '#f4968a'); ball(118, '#4a7ad8', '#8aaaf0'); ball(134, '#58b86c', '#94d8a4');
    // 화분 두 개
    for (const px of [10, 234]) { R(O, px, 96, 14, 14); R('#b8683a', px + 1, 101, 12, 8); R('#d88a58', px + 1, 101, 12, 2); R('#4eb054', px - 1, 88, 16, 12); R('#78d070', px + 3, 86, 8, 6); R('#3a9040', px + 9, 92, 5, 7); R(O, px - 2, 88, 1, 10); R(O, px + 15, 88, 1, 10); }
    labCv = cv; return cv;
  }

  /* ----- 오박사 (걷는 그림, 위에서 내려다본 방에 서 있는 작은 모습) 24x32 ----- */
  let oakUrl = null;
  function oak() {
    if (oakUrl) return oakUrl;
    const w = 24, h = 32, cv = mk(w, h), x = cv.getContext('2d');
    const R = (c, px, py, ww, hh) => dot(x, px, py, c, ww, hh);
    // 다리·신발
    R('#7a5a38', 7, 24, 5, 6); R('#7a5a38', 12, 24, 5, 6); R('#5a4026', 7, 27, 5, 3); R('#5a4026', 12, 27, 5, 3); R('#3a2a1a', 6, 29, 6, 2); R('#3a2a1a', 12, 29, 6, 2);
    // 흰 가운
    R('#f4f4f8', 4, 13, 16, 13); R('#e0e2ec', 4, 22, 16, 4); R('#c8ccdc', 16, 14, 4, 12); R('#ffffff', 5, 14, 3, 6);
    R('#e8eaf2', 3, 15, 2, 8); R('#c8ccdc', 19, 15, 2, 8);                  // 팔
    R('#f0c8a0', 3, 23, 2, 3); R('#f0c8a0', 19, 23, 2, 3);                   // 손
    R('#8e7ac0', 10, 13, 4, 8); R('#6e5aa0', 11, 14, 2, 6);                  // 안쪽 셔츠
    R('#c8ccdc', 11, 22, 2, 4);                                              // 가운 앞 선
    // 목·얼굴
    R('#e8b88a', 10, 12, 4, 2); R('#f0c8a0', 6, 4, 12, 9); R('#f8dcb8', 7, 5, 4, 3); R('#d8a478', 16, 6, 2, 7);
    R('#2b2b3d', 9, 8, 2, 2); R('#2b2b3d', 14, 8, 2, 2); R('#c8c8d4', 8, 7, 3, 1); R('#c8c8d4', 14, 7, 3, 1);
    R('#c8886a', 11, 11, 3, 1);                                              // 입
    // 머리카락(회색)
    R('#b4b8c8', 5, 2, 14, 5); R('#d4d8e4', 7, 1, 10, 2); R('#8e93a8', 5, 4, 2, 6); R('#8e93a8', 17, 4, 2, 6); R('#ffffff', 8, 2, 3, 1);
    // 바깥 윤곽선
    const id = x.getImageData(0, 0, w, h), d = id.data, solid = (px, py) => px >= 0 && py >= 0 && px < w && py < h && d[(py * w + px) * 4 + 3] > 0;
    const out = [];
    for (let py = 0; py < h; py++) for (let px = 0; px < w; px++) if (!solid(px, py) && (solid(px - 1, py) || solid(px + 1, py) || solid(px, py - 1) || solid(px, py + 1))) out.push([px, py]);
    out.forEach(([px, py]) => R('#2b2b3d', px, py, 1, 1));
    return (oakUrl = cv.toDataURL());
  }

  /* ----- 걷는 캐릭터 16x16 (아래/위/왼/오른쪽 x 걸음 2칸) ----- */
  const C = { O: '#1b1b2f', R: '#d83a30', r: '#a82a22', W: '#ffffff', H: '#2b2018', S: '#f6c9a0', s: '#dea77c', B: '#3a6fd0', b: '#274fa0', P: '#2d3a5a', Y: '#f2c230', y: '#c99a1a' };
  const SPR = {
    down: [
      ['................', '.....OOOOOO.....', '....ORRRRRRO....', '...ORRRWWRRRRO..', '...OrrrrrrrrrO..', '...OHSSSSSSHO...', '...OSOSSSSOSO...', '...OSSSSSSSSO...', '....OsSSSSsO....', '...OObBBBBbOO...', '..OSOBBBBBBOSO..', '..OSObYYYYbOSO..', '...OOBBBBBBOO...', '....OPPOOPPO....', '....OPPO.OPPO...', '....OOO...OOO...'],
      ['................', '.....OOOOOO.....', '....ORRRRRRO....', '...ORRRWWRRRRO..', '...OrrrrrrrrrO..', '...OHSSSSSSHO...', '...OSOSSSSOSO...', '...OSSSSSSSSO...', '....OsSSSSsO....', '...OObBBBBbOO...', '..OSOBBBBBBOSO..', '..OSObYYYYbOSO..', '...OOBBBBBBOO...', '....OPPOOPPO....', '....OPPOOPPO....', '....OOO..OOO....'],
    ],
    up: [
      ['................', '.....OOOOOO.....', '....ORRRRRRO....', '...ORRRRRRRRO...', '...ORRRRRRRRO...', '...OHHHHHHHHO...', '...OHHHHHHHHO...', '...OHHHHHHHHO...', '....OHHHHHHO....', '...OObBBBBbOO...', '..OSOBYYYYBOSO..', '..OSOBYyyYBOSO..', '...OOBBBBBBOO...', '....OPPOOPPO....', '....OPPO.OPPO...', '....OOO...OOO...'],
      ['................', '.....OOOOOO.....', '....ORRRRRRO....', '...ORRRRRRRRO...', '...ORRRRRRRRO...', '...OHHHHHHHHO...', '...OHHHHHHHHO...', '...OHHHHHHHHO...', '....OHHHHHHO....', '...OObBBBBbOO...', '..OSOBYYYYBOSO..', '..OSOBYyyYBOSO..', '...OOBBBBBBOO...', '....OPPOOPPO....', '....OPPOOPPO....', '....OOO..OOO....'],
    ],
    left: [
      ['................', '.....OOOOOO.....', '....ORRRRRRO....', '...ORRRWWRRRRO..', '..OrrrrrrrrrrO..', '..OSSSSSHHHHO...', '..OSOSSSSHHHO...', '..OSSSSSSSHHO...', '...OsSSSSHHO....', '...OObBBBBOO....', '...OSOBBBBbO....', '...OSObBYYbO....', '....OOBBBBOO....', '.....OPPPPO.....', '.....OPPPO......', '.....OOOOO......'],
      ['................', '.....OOOOOO.....', '....ORRRRRRO....', '...ORRRWWRRRRO..', '..OrrrrrrrrrrO..', '..OSSSSSHHHHO...', '..OSOSSSSHHHO...', '..OSSSSSSSHHO...', '...OsSSSSHHO....', '...OObBBBBOO....', '...OSOBBBBbO....', '...OSObBYYbO....', '....OOBBBBOO....', '.....OPPPPO.....', '....OPPOPPO.....', '....OOO.OOO.....'],
    ],
  };
  const heroCache = {};
  function hero(dir, f) {
    const key = dir + f; if (heroCache[key]) return heroCache[key];
    const flip = dir === 'right', rows = SPR[flip ? 'left' : dir][f % 2], cv = mk(16, 16), x = cv.getContext('2d');
    rows.forEach((row, yy) => [...row].forEach((ch, xx) => { if (C[ch]) dot(x, flip ? 15 - xx : xx, yy, C[ch]); }));
    return (heroCache[key] = cv.toDataURL());
  }
  return { T, W, H, render, hero, pal, badge, dexIcon, lab, oak };
})();
