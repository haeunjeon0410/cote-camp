/* 도트 아트: 경로 배경, 타운맵, 풀숲, 포켓몬 센터, 아이콘을 코드로 찍는다.
   규칙: 4톤(밝은색·기본·그림자·외곽선) + 디더링. 빛은 왼쪽 위에서 온다. */
const Art = (() => {
  const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
  const rng = seed => { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
  const dot = (ctx, x, y, c, w = 1, h = 1) => { ctx.fillStyle = c; ctx.fillRect(Math.round(x), Math.round(y), w, h); };

  /* ----- 마스크 도형 + 음영 ----- */
  function circles(w, h, list) {
    const m = new Uint8Array(w * h);
    for (const [cx, cy, rx, ry = rx] of list) {
      for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
        if (x < 0 || y < 0 || x >= w || y >= h) continue;
        const dx = (x + .5 - cx) / rx, dy = (y + .5 - cy) / ry;
        if (dx * dx + dy * dy <= 1) m[y * w + x] = 1;
      }
    }
    return m;
  }
  const at = (m, w, h, x, y) => (x < 0 || y < 0 || x >= w || y >= h ? 0 : m[y * w + x]);
  // 위가 비어 있으면 밝게, 아래가 비어 있으면 그림자, 바깥 한 칸은 외곽선
  function paint(ctx, m, w, h, pal, opt = {}) {
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      if (m[y * w + x]) {
        let up = 0, dn = 0;
        while (up < 3 && at(m, w, h, x, y - up - 1)) up++;
        while (dn < 3 && at(m, w, h, x, y + dn + 1)) dn++;
        let c = pal.mid;
        if (up <= 1 || (opt.left && !at(m, w, h, x - 1, y) && up <= 3)) c = pal.hi;
        else if (dn <= 1 || (opt.right && !at(m, w, h, x + 1, y))) c = pal.lo;
        dot(ctx, x, y, c);
      } else if (pal.line && (at(m, w, h, x - 1, y) || at(m, w, h, x + 1, y) || at(m, w, h, x, y - 1) || at(m, w, h, x, y + 1))) dot(ctx, x, y, pal.line);
    }
  }

  /* ----- 하늘 · 구름 · 언덕 · 나무 ----- */
  function sky(ctx, w, bottom) {
    const B = ['#58aae6', '#6dbdf1', '#86cbf8', '#a0daff', '#bcebfd'], Y = [0, 24, 46, 66, 84, bottom];
    for (let y = 0; y < bottom; y++) {
      let b = 0; while (b < 4 && y >= Y[b + 1]) b++;
      const d = Y[b + 1] - y;
      for (let x = 0; x < w; x++) {
        let c = B[b];
        if (b < 4) { if (d <= 2 && (x + y) % 2 === 0) c = B[b + 1]; else if (d <= 5 && x % 2 === 0 && y % 2 === 0) c = B[b + 1]; }
        dot(ctx, x, y, c);
      }
    }
  }
  function cloud(ctx, W, H, cx, cy, s) {
    const m = circles(W, H, [[cx, cy, 11 * s, 7 * s], [cx - 13 * s, cy + 3 * s, 8 * s, 5 * s], [cx + 13 * s, cy + 3 * s, 9 * s, 5.5 * s], [cx + 2 * s, cy - 5 * s, 8 * s, 6 * s]]);
    paint(ctx, m, W, H, { hi: '#ffffff', mid: '#f1f9ff', lo: '#cfe5f8', line: null });
  }
  function hills(ctx, w, base, amp, col, rim, seed) {
    const r = rng(seed), p = r() * 6, q = r() * 6;
    for (let x = 0; x < w; x++) {
      const y = Math.round(base - amp * (.5 + .5 * Math.sin(x * .034 + p)) - amp * .35 * Math.sin(x * .11 + q));
      dot(ctx, x, y, rim); dot(ctx, x, y + 1, col, 1, 200);
    }
  }
  function tree(ctx, W, H, x, y, r) {
    const m = circles(W, H, [[x, y - r * .9, r, r * .9], [x - r * .65, y - r * .45, r * .7, r * .65], [x + r * .65, y - r * .45, r * .7, r * .65]]);
    paint(ctx, m, W, H, { hi: '#7ed56e', mid: '#4eb054', lo: '#2f8847', line: '#1d5b34' }, { left: true });
    const rd = rng(x * 31 + y);
    for (let i = 0; i < r * 2.2; i++) { const px = Math.round(x - r + rd() * r * 2), py = Math.round(y - r * 1.8 + rd() * r * 1.7); if (at(m, W, H, px, py) && at(m, W, H, px, py - 1) && at(m, W, H, px, py + 1)) dot(ctx, px, py, rd() < .5 ? '#3f9a4c' : '#68c862'); }
    dot(ctx, x - 1, y - 1, '#5a3d22', 3, 5); dot(ctx, x - 2, y + 3, '#3c2814', 5, 1);
  }

  /* ----- 땅 · 길 · 꽃 ----- */
  function ground(ctx, w, y0, h, seed) {
    const r = rng(seed);
    for (let y = y0; y < h; y++) {
      const stripe = Math.floor((y - y0) / 14) % 2;
      for (let x = 0; x < w; x++) {
        let c = stripe ? '#72c24a' : '#7ccd52';
        if (((x >> 1) + (y >> 1)) % 4 === 0 && (y - y0) % 14 > 2) c = stripe ? '#6bba44' : '#74c64c';
        dot(ctx, x, y, c);
      }
    }
    dot(ctx, 0, y0, '#4a9a38', w, 1); dot(ctx, 0, y0 + 1, '#9ae070', w, 1);
    for (let i = 0; i < 90; i++) { const x = Math.floor(r() * w), y = y0 + 4 + Math.floor(r() * (h - y0 - 6)); dot(ctx, x, y, '#58a83c'); dot(ctx, x - 1, y - 1, '#58a83c'); dot(ctx, x + 1, y - 1, '#58a83c'); dot(ctx, x, y - 2, '#a2e47a'); }
  }
  function path(ctx, w, y0, h, p) {
    const r = rng(7);
    for (let y = y0 + 2; y < h; y++) {
      const t = (y - y0) / (h - y0), cx = p.x0 + (p.x1 - p.x0) * Math.pow(1 - t, 1.5) + 6 * Math.sin(t * 5), half = (p.w0 + (p.w1 - p.w0) * t) / 2;
      for (let x = Math.floor(cx - half - 3); x <= Math.ceil(cx + half + 3); x++) {
        if (x < 0 || x >= w) continue;
        const d = Math.abs(x + .5 - cx);
        if (d <= half - 1) dot(ctx, x, y, r() < .04 ? '#d2bd88' : (x + y) % 5 === 0 ? '#e4d09a' : '#ecdba8');
        else if (d <= half) dot(ctx, x, y, '#c4ad72');
        else if (d <= half + 2 && (x + y) % 2 === 0) dot(ctx, x, y, '#d8c88c');
      }
    }
  }
  function flowers(ctx, w, y0, h, n, seed) {
    const r = rng(seed);
    for (let i = 0; i < n; i++) {
      const x = 4 + Math.floor(r() * (w - 8)), y = y0 + 8 + Math.floor(r() * (h - y0 - 14)), k = r();
      const c = k < .45 ? '#ffffff' : k < .75 ? '#ffe45a' : '#ff7a8a';
      dot(ctx, x, y - 1, c); dot(ctx, x - 1, y, c); dot(ctx, x + 1, y, c); dot(ctx, x, y + 1, c); dot(ctx, x, y, k < .45 ? '#ffd23a' : '#ffffff');
      dot(ctx, x, y + 2, '#4a9a38');
    }
  }
  function platform(ctx, W, H, cx, cy, rx, ry) {
    const m = circles(W, H, [[cx, cy, rx, ry]]);
    paint(ctx, m, W, H, { hi: '#aef07a', mid: '#88d058', lo: '#5eac3a', line: '#3b7a2a' });
  }

  /* ----- 장면 ----- */
  const cache = {};
  function route(kind = 'route') {
    if (cache[kind]) return cache[kind];
    const W = 256, H = 192, c = mk(W, H), ctx = c.getContext('2d');
    sky(ctx, W, 104);
    cloud(ctx, W, H, 52, 28, 1); cloud(ctx, W, H, 158, 18, 1.25); cloud(ctx, W, H, 224, 46, .8);
    hills(ctx, W, 92, 9, '#8fd4ae', '#b4ecc8', 3);
    hills(ctx, W, 100, 6, '#6cc08a', '#92dca4', 8);
    const r = rng(11);
    for (let x = 6; x < W + 10; x += 17 + Math.floor(r() * 7)) tree(ctx, W, H, x, 104, 9 + Math.floor(r() * 5));
    ground(ctx, W, 104, H, 5);
    if (kind === 'route') { path(ctx, W, 104, H, { x0: 168, x1: 70, w0: 12, w1: 54 }); flowers(ctx, W, 104, H, 26, 9); }
    else { flowers(ctx, W, 104, H, 18, 4); platform(ctx, W, H, 188, 98, 46, 9); platform(ctx, W, H, 66, 172, 62, 13); }
    return (cache[kind] = c);
  }

  function center() {
    if (cache.center) return cache.center;
    const W = 256, H = 192, c = mk(W, H), ctx = c.getContext('2d');
    for (let y = 0; y < 126; y++) for (let x = 0; x < W; x++) dot(ctx, x, y, y > 100 ? ((x + y) % 2 ? '#efc7d1' : '#f2cdd6') : (x % 16 < 1 ? '#f1d6de' : '#f8e4ea'));
    dot(ctx, 0, 98, W, 2, '#d79aaa'); dot(ctx, 0, 100, W, 1, '#fff0f3');
    for (let y = 126; y < H; y++) for (let x = 0; x < W; x++) dot(ctx, x, y, ((x >> 4) + ((y - 126) >> 4)) % 2 ? '#e4e0f2' : '#f4f2fb');
    dot(ctx, 0, 126, W, 1, '#b8b2d2');
    // 카운터
    dot(ctx, 0, 118, W, 10, '#ffffff'); dot(ctx, 0, 118, W, 2, '#ffffff'); dot(ctx, 0, 126, W, 2, '#c9c2e0'); dot(ctx, 0, 128, W, 22, '#e9a8b8'); dot(ctx, 0, 128, W, 2, '#f6c4d0'); dot(ctx, 0, 148, W, 2, '#c47a90');
    // 간판 (빨간 십자 + 몬스터볼)
    const sign = circles(W, H, [[128, 30, 20, 15]]);
    paint(ctx, sign, W, H, { hi: '#ffffff', mid: '#fbfbff', lo: '#d6dcee', line: '#7a86ae' });
    dot(ctx, 125, 22, '#e0453a', 6, 16); dot(ctx, 120, 27, '#e0453a', 16, 6);
    dot(ctx, 125, 22, '#f27a70', 6, 1); dot(ctx, 120, 27, '#f27a70', 16, 1);
    // 창문
    for (const x of [24, 200]) { dot(ctx, x, 30, '#8f9ac0', 32, 36); dot(ctx, x + 2, 32, '#bfe4fa', 28, 32); dot(ctx, x + 2, 32, '#e6f6ff', 28, 2); dot(ctx, x + 15, 32, '#8f9ac0', 2, 32); dot(ctx, x + 2, 47, '#8f9ac0', 28, 2); }
    // 화분
    for (const x of [8, 238]) { dot(ctx, x, 104, '#c47a50', 10, 12); dot(ctx, x - 2, 98, '#4eb054', 14, 8); dot(ctx, x, 94, '#7ed56e', 10, 6); }
    return (cache.center = c);
  }

  /* ----- 오박사 첫 화면 배경 (HeartGold/SoulSilver 처음 시작할 때 오박사가 나오는 화면): 소품 없이 두 가지 색의 면 ----- */
  function intro() {
    if (cache.intro) return cache.intro;
    const W = 256, H = 192, c = mk(W, H), ctx = c.getContext('2d');
    const BAY = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5], bay = (x, y) => BAY[(y & 3) * 4 + (x & 3)];
    
    // 바탕: 위쪽 주황 띠 → 살구색, 아래로 갈수록 살짝 짙어지는 디더링 그라데이션
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      let col;
      if (y < 40) col = (y < 36 ? (bay(x, y) < (y / 36) * 6 ? '#dba052' : '#e3ab5c') : '#d29544');
      else if (y < 43) col = '#c98a3c';
      else if (y < 45) col = '#f2c27a';
      else { const t = (y - 45) / (H - 45) * 16; col = bay(x, y) < t * .55 ? '#f1cd90' : '#f8dba4'; }
      dot(ctx, x, y, col);
    }
    // 가운데에서 비추는 빛: 둥글고 은은한 밝은 무리 (디더링)
    for (let y = 45; y < H; y++) for (let x = 0; x < W; x++) { const dx = (x - 128) / 104, dy = (y - 112) / 70, d = dx * dx + dy * dy; if (d < 1 && bay(x, y) < (1 - d) * 11) dot(ctx, x, y, '#fff0cc'); }
    // 바닥에 비치는 가는 줄 두 개 (원작 화면의 가로 줄 느낌)
    dot(ctx, 0, 150, '#ecc786', W, 1); dot(ctx, 0, 151, '#fbe6b8', W, 1);
    // 가장자리가 살짝 어두운 비네트
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const e = Math.max(0, Math.abs(x - 128) - 96) / 32 + Math.max(0, y - 150) / 42; if (e > 0 && bay(x, y) < Math.min(e, 1) * 5) dot(ctx, x, y, '#7a4d2433'); }
    return (cache.intro = c);
  }

  /* ----- 블랙·화이트 오프닝 배경 (실제 게임 이미지): 위쪽 체크무늬 띠 + 아래로 어두워지는 바탕 ----- */
  const BWSHEET = new Image(); BWSHEET.src = '../assets/ui/scenes/bw-lecture.png';
  const BWB = { blue: [430, 528, 254, 70], green: [430, 602, 254, 80], pink: [430, 455, 254, 68] };
  function bw(kind = 'blue') {
    const key = 'bw-' + kind; if (cache[key]) return cache[key];
    const c = mk(256, 192), ctx = c.getContext('2d'); ctx.imageSmoothingEnabled = false;
    const draw = () => {
      const [sx, sy, sw, sh] = BWB[kind] || BWB.blue;
      ctx.drawImage(BWSHEET, 8, 645, 256, 192, 0, 0, 256, 192);       // 흰색 → 어두운 바탕
      ctx.drawImage(BWSHEET, sx, sy, sw, sh, 0, 0, 256, sh);            // 체크무늬 띠
    };
    ctx.drawImage(intro(), 0, 0);   // 이미지가 올 때까지의 임시 바탕
    if (BWSHEET.complete && BWSHEET.naturalWidth) draw(); else BWSHEET.addEventListener('load', () => { draw(); if (typeof paintBg === 'function') paintBg(); });
    return (cache[key] = c);
  }

  /* ----- 포켓몬 플래티넘 배틀 배경 (실제 게임 이미지): 배경 + 발밑 받침대. 시트에서 잘라 쓴다 ----- */
  const PTSHEET = new Image(); PTSHEET.src = '../assets/ui/scenes/pt-battle-bg.png';
  const PT_BG = { field: [0, 0], fieldA: [1, 0], fieldN: [2, 0], surf: [0, 1], city: [0, 2], cityA: [1, 2], forest: [0, 3], rocky: [0, 4], snow: [0, 5], indoor1: [0, 6], indoor2: [1, 6], indoor3: [2, 6], cynthia: [1, 9] };          // [열, 행]
  const PT_PLAT = { grass: [0, 0], grassN: [2, 0], water: [0, 1], path: [0, 2], ice: [0, 3], rocky: [0, 4], snow: [0, 5], indoor: [1, 9], cynthia: [0, 11] };
  const ptPlatCache = {};
  // 받침대 칸에서 흰 바탕을 지우고 위쪽 타원만 잘라 낸다
  function ptPlatform(kind) {
    if (ptPlatCache[kind]) return ptPlatCache[kind];
    const [col, row] = PT_PLAT[kind], x0 = 768 + col * 256, y0 = Math.round(row * 96.2) + 15, W = 256, H = 40;
    const t = mk(W, H), tx = t.getContext('2d'); tx.drawImage(PTSHEET, x0, y0, W, H, 0, 0, W, H);
    const id = tx.getImageData(0, 0, W, H), d = id.data; let minx = W, maxx = 0, miny = H, maxy = 0;
    for (let i = 0; i < W * H; i++) {
      const r = d[i * 4], g = d[i * 4 + 1], b = d[i * 4 + 2];
      if (r > 246 && g > 246 && b > 246) { d[i * 4 + 3] = 0; continue; }
      const px = i % W, py = (i / W) | 0; minx = Math.min(minx, px); maxx = Math.max(maxx, px); miny = Math.min(miny, py); maxy = Math.max(maxy, py);
    }
    tx.putImageData(id, 0, 0);
    if (maxx < minx) return (ptPlatCache[kind] = null);
    const c = mk(maxx - minx + 1, maxy - miny + 1); c.getContext('2d').drawImage(t, minx, miny, c.width, c.height, 0, 0, c.width, c.height);
    return (ptPlatCache[kind] = c);
  }
  // 부드러운 그라데이션을 도트 그림으로: 색 단계를 줄이고 격자 무늬(디더링)로 이어 붙인다. 도트 한 칸 = 화면 한 칸
  function pixelate(ctx, x0, y0, w, h, levels = 5, amp = 1) {
    const id = ctx.getImageData(x0, y0, w, h), d = id.data, B = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5], step = 255 / (levels - 1);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4, t = (B[(y & 3) * 4 + (x & 3)] / 16 - .5) * step * amp;
      const mx = Math.max(d[i], d[i + 1], d[i + 2]), mn = Math.min(d[i], d[i + 1], d[i + 2]);
      if (mx - mn < 26) { const v = Math.max(0, Math.min(255, Math.round(((mx + mn) / 2 + t) / step) * step)); d[i] = d[i + 1] = d[i + 2] = v; continue; }   // 회색·흰색 쪽은 색이 번지지 않게 한 색으로
      for (let k = 0; k < 3; k++) d[i + k] = Math.max(0, Math.min(255, Math.round((d[i + k] + t) / step) * step));
    }
    ctx.putImageData(id, x0, y0);
  }
  function pt(bgKey = 'indoor1', platKey = 'indoor', cy = 116) {
    const key = 'pt-' + bgKey + '-' + platKey + '-' + cy; if (cache[key]) return cache[key];
    const c = mk(256, 192), ctx = c.getContext('2d'); ctx.imageSmoothingEnabled = false;
    const draw = () => {
      const [col, row] = PT_BG[bgKey] || PT_BG.indoor1;
      ctx.drawImage(PTSHEET, col * 256, Math.round(row * 168.2) + 16, 256, 152, 0, 0, 256, 192);
      pixelate(ctx, 0, 0, 256, 192, 9, .22);   // 색 단계를 넉넉히, 점 무늬는 아주 약하게: 자글자글하지 않고 단계가 깔끔한 도트
      const p = platKey && ptPlatform(platKey); if (p) ctx.drawImage(p, Math.round(128 - p.width / 2), Math.round(cy - p.height / 2));
    };
    ctx.drawImage(intro(), 0, 0);
    if (PTSHEET.complete && PTSHEET.naturalWidth) draw(); else PTSHEET.addEventListener('load', () => { draw(); if (typeof paintBg === 'function') paintBg(); });
    return (cache[key] = c);
  }

  /* ----- 창 단추: 본체에 달린 작은 둥근 도트 단추 11x11 (최소화·전체 화면·닫기) ----- */
  function winBtn(kind, hover) {
    const C = { min: ['#e6c34a', '#b8942a', '#f6e08a'], full: ['#58bd6a', '#2f8a42', '#9ae0a6'], close: ['#e0645a', '#a8342c', '#f4a09a'] }[kind], c = mk(7, 7), x = c.getContext('2d');
    for (let py = 0; py < 7; py++) for (let px = 0; px < 7; px++) {
      const dx = px - 3, dy = py - 3, d = dx * dx + dy * dy;
      if (d > 10) continue;
      dot(x, px, py, d > 6 ? C[1] : C[0]);
    }
    dot(x, 2, 2, C[2]);
    if (hover) {   // 마우스를 올리면 기호가 나온다
      const P = (px, py) => dot(x, px, py, '#3a2a14');
      if (kind === 'min') { P(2, 3); P(3, 3); P(4, 3); }
      else if (kind === 'full') { P(3, 2); P(2, 3); P(3, 3); P(4, 3); P(3, 4); }
      else { P(2, 2); P(4, 2); P(3, 3); P(2, 4); P(4, 4); }
    }
    return c.toDataURL();
  }

  /* ----- 발밑 그림자: 도트 타원 두 겹. 인물·포켓몬이 배경에서 뜨지 않게 한다 ----- */
  const shCache = {};
  function shadow(w, h) {
    const key = w + 'x' + h; if (shCache[key]) return shCache[key];
    const c = mk(w, h), x = c.getContext('2d');
    for (let py = 0; py < h; py++) for (let px = 0; px < w; px++) {
      const dx = (px + .5 - w / 2) / (w / 2), dy = (py + .5 - h / 2) / (h / 2), d = dx * dx + dy * dy;
      if (d <= 1) { x.fillStyle = d <= .55 ? 'rgba(30,16,4,.38)' : 'rgba(30,16,4,.2)'; x.fillRect(px, py, 1, 1); }
    }
    return (shCache[key] = c.toDataURL());
  }

  /* ----- 풀숲 타일 (문제 하나 = 풀숲 하나) ----- */
  function blades(ctx, x0, base, n, hmax, seed, cols) {
    const r = rng(seed);
    for (let i = 0; i < n; i++) {
      const bx = x0 + Math.round(i * (26 / Math.max(1, n - 1))) - 13 + Math.round((r() - .5) * 3), h = Math.max(4, Math.round(hmax * (.55 + r() * .45)));
      for (let k = 0; k < h; k++) { const wd = k > h - 3 ? 1 : 3; const y = base - k; dot(ctx, bx - (wd > 1 ? 1 : 0), y, cols.mid, wd, 1); if (wd > 1) { dot(ctx, bx - 1, y, cols.lo); dot(ctx, bx + 1, y, cols.hi); } }
      dot(ctx, bx, base - h, cols.hi);
    }
  }
  function patch(state) {
    const key = 'patch-' + state;
    if (cache[key]) return cache[key];
    const c = mk(34, 28), ctx = c.getContext('2d');
    if (state === 'done') {
      dot(ctx, 3, 22, '#5aa83e', 28, 4); dot(ctx, 5, 20, '#6cbc48', 24, 3);
      blades(ctx, 17, 24, 8, 5, 21, { lo: '#4e9a38', mid: '#68b444', hi: '#86d05e' });
    } else {
      dot(ctx, 2, 24, '#4e9a38', 30, 3);
      blades(ctx, 17, 26, 9, 18, 4 + (state === 'boss' ? 5 : 0), { lo: '#2f8a3a', mid: '#4cb44c', hi: '#86e070' });
      blades(ctx, 17, 22, 7, 14, 17, { lo: '#3a9a44', mid: '#5cc454', hi: '#98ec7a' });
    }
    return (cache[key] = c);
  }

  /* ----- 타운맵 ----- */
  const NODES = [[30, 152], [64, 120], [38, 88], [74, 58], [116, 42], [150, 68], [124, 102], [164, 132], [208, 112], [226, 66]];
  function townMap(st) {
    const W = 256, H = 192, c = mk(W, H), ctx = c.getContext('2d');
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) dot(ctx, x, y, ((x >> 2) + (y >> 2)) % 2 ? '#4f9fe0' : '#5aa8e6');
    const r = rng(2), blobs = NODES.map(([x, y]) => [x, y, 24, 20]);
    for (let i = 0; i < NODES.length - 1; i++) { const [ax, ay] = NODES[i], [bx, by] = NODES[i + 1]; for (let t = 0; t <= 1; t += .1) blobs.push([ax + (bx - ax) * t, ay + (by - ay) * t, 13, 12]); }
    const land = circles(W, H, blobs);
    // 얕은 물 (해안선 바깥 3칸)
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (!land[y * W + x]) { let near = 9; for (let dy = -3; dy <= 3 && near > 3; dy++) for (let dx = -3; dx <= 3; dx++) if (at(land, W, H, x + dx, y + dy)) near = Math.min(near, Math.max(Math.abs(dx), Math.abs(dy))); if (near <= 3) dot(ctx, x, y, near <= 1 ? '#a4dcf8' : (x + y) % 2 ? '#86c8f2' : '#78c0ee'); }
    paint(ctx, land, W, H, { hi: '#a6e47a', mid: '#82cc58', lo: '#64b246', line: '#2f6f3a' });
    // 숲 · 산
    for (let i = 0; i < 46; i++) { const x = 6 + Math.floor(r() * 244), y = 8 + Math.floor(r() * 176); if (at(land, W, H, x, y) && at(land, W, H, x - 3, y) && at(land, W, H, x + 3, y) && at(land, W, H, x, y + 3) && !NODES.some(([nx, ny]) => Math.hypot(nx - x, ny - y) < 14)) { dot(ctx, x - 2, y, '#3f9a48', 5, 4); dot(ctx, x - 1, y - 1, '#58b858', 3, 1); dot(ctx, x, y + 4, '#5a3d22'); } }
    for (const [mx, my] of [[96, 78], [186, 92], [60, 176], [200, 40]]) { if (!at(land, W, H, mx, my)) continue; for (let k = 0; k < 9; k++) { dot(ctx, mx - k, my + k, k < 3 ? '#f4f6fa' : '#a8a4b4', 2 * k + 1, 1); dot(ctx, mx - k, my + k, '#6e6a82'); dot(ctx, mx + k, my + k, '#6e6a82'); } }
    // 길
    ctx.lineJoin = 'round'; ctx.lineCap = 'butt';
    for (const [w, col] of [[5, '#b29a60'], [3, '#ecdba8']]) { ctx.strokeStyle = col; ctx.lineWidth = w; ctx.beginPath(); NODES.forEach(([x, y], i) => (i ? ctx.lineTo(x + .5, y + .5) : ctx.moveTo(x + .5, y + .5))); ctx.stroke(); }
    // 마을 표시: 13x11 도트 집 (정수 1:1). 못 간 곳은 회색, 클리어는 금색
    const TOWN = ['.....OOO.....', '....ORRRO....', '...ORRRRRO...', '..ORRRRRRRO..', '.OrrrrrrrrrO.', 'OOOOOOOOOOOOO', '.OWWWWWWWWWO.', '.OWBBWWDDWWO.', '.OWBBWWDDWWO.', '.OGGGGGDDGGO.', '.OOOOOOOOOOO.'];
    const TP = {
      open: { O: '#252b3d', R: '#e0453a', r: '#a82a22', W: '#ffffff', B: '#8fc8f0', D: '#7a5232', G: '#c9d2e6' },
      locked: { O: '#4a5164', R: '#9aa0b0', r: '#7d8396', W: '#d4d8e2', B: '#b4bacb', D: '#6b7080', G: '#b8bdcb' },
      clear: { O: '#252b3d', R: '#f5c635', r: '#c99a1a', W: '#fff6cf', B: '#ffe98a', D: '#7a5232', G: '#e8d08a' },
    };
    NODES.forEach(([x, y], i) => {
      const pal = TP[st[i] || 'open'] || TP.open;
      dot(ctx, x - 5, y + 5, '#00000033', 11, 2);   // 바닥 그림자
      TOWN.forEach((row, yy) => [...row].forEach((ch, xx) => { if (pal[ch]) dot(ctx, x - 6 + xx, y - 5 + yy, pal[ch]); }));
    });
    return c;
  }

  /* ----- 아이콘 ----- */
  const ROWS = {
    dex: ['................', '.kkkkkkkkkkkkk..', '.kRRRRRRRRRRRk..', '.kRbbRRRRRRRRk..', '.kRbbRkkkkkkRk..', '.kRRRRkwwwwkRk..', '.kRRRRkwwwwkRk..', '.kRRRRkwwwwkRk..', '.kRRRRkkkkkkRk..', '.kRRRRRRRRRRRk..', '.kRyyRRRggRRRk..', '.kRRRRRRRRRRRk..', '.kkkkkkkkkkkkk..'],
    gear: ['....kk..kk....', '...kGGkkGGk...', '..kGGGGGGGGk..', '.kGGGkkkkGGGk.', 'kkGGkwwwwkGGkk', 'kGGGkwwwwkGGGk', 'kGGGkwwwwkGGGk', 'kkGGkwwwwkGGkk', '.kGGGkkkkGGGk.', '..kGGGGGGGGk..', '...kGGkkGGk...', '....kk..kk....'],
    arrow: ['kk........', 'kRk.......', 'kRRk......', 'kRRRk.....', 'kRRRRk....', 'kRRRk.....', 'kRRk......', 'kRk.......', 'kk........'],
  };
  const PAL = { k: '#252b3d', R: '#e0453a', b: '#58a8f0', w: '#f4f8ff', y: '#f5c635', g: '#58b060', G: '#98a2bc' };
  function icon(name) {
    const key = 'icon-' + name;
    if (cache[key]) return cache[key];
    const rows = ROWS[name], c = mk(rows[0].length, rows.length), ctx = c.getContext('2d');
    rows.forEach((row, y) => [...row].forEach((ch, x) => { if (ch !== '.') dot(ctx, x, y, PAL[ch]); }));
    return (cache[key] = c);
  }
  /* ----- 도트 테두리: 9x9, 모서리 3칸씩. CSS border-image 로 늘려 쓴다 ----- */
  const FRAMES = {
    box:   { O: '#252b3d', H: '#c9d3e8', S: '#c9d3e8', F: '#ffffff' },   // 대화창
    btn:   { O: '#252b3d', H: '#ffffff', S: '#aeb7cc', F: '#f6f8fc' },   // 버튼
    go:    { O: '#252b3d', H: '#fde58a', S: '#c9951a', F: '#f5c635' },   // 눈에 띄는 버튼
    press: { O: '#252b3d', H: '#aeb7cc', S: '#ffffff', F: '#e4e9f4' },   // 눌린 버튼
    off:   { O: '#aab4cc', H: '#ffffff', S: '#ffffff', F: '#ffffff' },   // 꺼진 버튼
    tint:  { O: '#9fb0d4', H: '#ffffff', S: '#ffffff', F: '#f4f7ff' },   // 배움 카드
    code:  { O: '#b9c6e4', H: '#ffffff', S: '#ffffff', F: '#f1f4fb' },   // 코드 상자
  };
  // 하트골드/소울실버의 굵은 겹테두리 창. rings: 바깥에서 안쪽 순서, br: 오른쪽·아래쪽 겹 (없으면 같은 색)
  const RINGS = {
    msg:    { rings: ['#3d2f0c', '#d9a93a', '#d9a93a', '#8a6a20'], fill: '#ffffff' },                        // 대사창 (금색)
    dexN:   { rings: ['#1b2650', '#3d6fc4', '#c9d3e8', '#f4f7ff'], fill: '#ffffff' },                        // 문제 화면 (파랑)
    dexR:   { rings: ['#7a0f12', '#d62b2b', '#d62b2b', '#f4c4c4'], fill: '#ffffff' },                        // 도감 설명 (빨강)
    panelG: { rings: ['#1f2a44', '#5b6a8a', '#8d9ab5'], br: ['#1f2a44', '#3a465f', '#5b6a8a'], fill: '#c9ced8' }, // 안 고른 항목 (회색)
    panelS: { rings: ['#1f2a44', '#2fc79a', '#2fc79a'], fill: '#ffffff' },                                  // 고른 항목 (민트)
    blueBtn:{ rings: ['#14205c', '#a9c2ff', '#7aa0ff'], br: ['#14205c', '#2646b0', '#2f55cc'], fill: '#3d6be0' }, // 파란 버튼
    rrW:    { rings: ['#28345c', '#ffffff', '#eef1f8', '#eef1f8'], br: ['#28345c', '#b9c2d8', '#eef1f8', '#eef1f8'], fill: '#eef1f8' },   // 흰 알약/항목
    rrB:    { rings: ['#14215a', '#8fb2ff', '#5f8dff', '#5f8dff'], br: ['#14215a', '#3558c8', '#4a78f0', '#4a78f0'], fill: '#4a78f0' },   // 고른 항목 (파랑)
    rrY:    { rings: ['#5a3a0a', '#fff0b0', '#f7c948', '#f7c948'], br: ['#5a3a0a', '#c9951a', '#f0bd35', '#f0bd35'], fill: '#f7c948' },   // 중요한 버튼 (노랑)
    rrG:    { rings: ['#8a93a8', '#ffffff', '#e4e8f0', '#e4e8f0'], fill: '#e4e8f0' },                                                  // 꺼진 항목
    dlg:    { rings: ['#0b1230', '#c9d1ea', '#c9d1ea', '#1b2650'], fill: '#1b2650' },                                                  // 흰 대사창 (HGSS)
    grayBtn:{ rings: ['#4a5268', '#c4cada', '#d4d9e6'], fill: '#e4e8f0' },                                  // 꺼진 버튼
  };
  function ringFrames() {
    const out = {};
    for (const [name, c] of Object.entries(RINGS)) {
      const n = c.rings.length, size = 2 * n + 3, br = c.br || c.rings, cv = mk(size, size), cx = cv.getContext('2d');
      for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
        const dTL = Math.min(x, y), dBR = Math.min(size - 1 - x, size - 1 - y), d = Math.min(dTL, dBR);
        if (Math.min(x, size - 1 - x) + Math.min(y, size - 1 - y) < 2) continue;   // 모서리를 둥글게 깎는다
        dot(cx, x, y, d < n ? (dBR < dTL ? br : c.rings)[d] : c.fill);
      }
      out[name] = cv.toDataURL();
    }
    return out;
  }
  const SMALL = { shl: { O: '#1c1f2b', H: '#f6f8fc', S: '#c6ccdb', F: '#dfe3ed' } };
  function frames() {
    const out = {};
    for (const [name, c] of Object.entries(FRAMES)) {
      const cv = mk(9, 9), ctx = cv.getContext('2d');
      for (let y = 0; y < 9; y++) for (let x = 0; x < 9; x++) {
        const d = Math.min(x, y, 8 - x, 8 - y);
        if ((x === 0 || x === 8) && (y === 0 || y === 8)) continue;   // 깎인 모서리
        dot(ctx, x, y, d === 0 ? c.O : d === 1 ? (x === 7 || y === 7 ? c.S : c.H) : c.F);
      }
      out[name] = cv.toDataURL();
    }
    Object.assign(out, ringFrames());
    for (const [name, c] of Object.entries(SMALL)) {
      const cv = mk(7, 7), ctx = cv.getContext('2d');
      for (let y = 0; y < 7; y++) for (let x = 0; x < 7; x++) {
        const d = Math.min(x, y, 6 - x, 6 - y);
        if ((x === 0 || x === 6) && (y === 0 || y === 6)) continue;
        dot(ctx, x, y, d === 0 ? c.O : d === 1 ? (x === 5 || y === 5 ? c.S : c.H) : c.F);
      }
      out[name] = cv.toDataURL();
    }
    return out;
  }
  /* ----- 콘솔 버튼: 외곽선 + 왼쪽 위 하이라이트 + 오른쪽 아래 그림자 ----- */
  const PAD = { O: '#1c1f2b', B: '#d3d8e4', H: '#f6f8fc', S: '#a3abc0', G: '#5d6680' };
  function shade(ctx, m, w, h) { shadeP(ctx, m, w, h, PAD); }
  function shadeP(ctx, m, w, h, P) {
    const at = (x, y) => (x < 0 || y < 0 || x >= w || y >= h ? 0 : m[y * w + x]);
    const edge = new Uint8Array(w * h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (m[y * w + x] && !(at(x - 1, y) && at(x + 1, y) && at(x, y - 1) && at(x, y + 1))) edge[y * w + x] = 1;
    const ed = (x, y) => (x < 0 || y < 0 || x >= w || y >= h ? 0 : edge[y * w + x]);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      if (!m[y * w + x]) continue;
      if (edge[y * w + x]) { dot(ctx, x, y, P.O); continue; }
      const hi = ed(x - 1, y) || ed(x, y - 1), lo = ed(x + 1, y) || ed(x, y + 1);
      dot(ctx, x, y, hi ? P.H : lo ? P.S : P.B);
    }
  }
  const GLYPH = {
    X: ['10001', '01010', '00100', '00100', '00100', '01010', '10001'],
    Y: ['10001', '10001', '01010', '00100', '00100', '00100', '00100'],
    A: ['00100', '01010', '10001', '10001', '11111', '10001', '10001'],
    B: ['11110', '10001', '10001', '11110', '10001', '10001', '11110'],
  };
  function pads() {
    // 십자 패드 48x48
    const d = mk(48, 48), dc = d.getContext('2d'), m = new Uint8Array(48 * 48);
    for (let y = 0; y < 48; y++) for (let x = 0; x < 48; x++) m[y * 48 + x] = (x >= 16 && x < 32) || (y >= 16 && y < 32) ? 1 : 0;
    for (const [x, y] of [[16, 0], [31, 0], [16, 47], [31, 47], [0, 16], [0, 31], [47, 16], [47, 31]]) m[y * 48 + x] = 0;
    shade(dc, m, 48, 48);
    for (let i = 0; i < 5; i++) {   // 네 팔의 삼각형 화살표
      dot(dc, 23 - i, 5 + i, PAD.G, 2 + 2 * i, 1); dot(dc, 23 - i, 42 - i, PAD.G, 2 + 2 * i, 1);
      dot(dc, 5 + i, 23 - i, PAD.G, 1, 2 + 2 * i); dot(dc, 42 - i, 23 - i, PAD.G, 1, 2 + 2 * i);
    }
    for (let y = 0; y < 48; y++) for (let x = 0; x < 48; x++) {   // 가운데 오목한 자리
      const r = Math.hypot(x + .5 - 24, y + .5 - 24);
      if (r <= 4.5) dot(dc, x, y, r > 3.4 ? (x + y < 48 ? PAD.S : PAD.H) : '#c6ccdb');
    }
    // 동그란 ABXY 48x48
    const a = mk(48, 48), ac = a.getContext('2d'), am = new Uint8Array(48 * 48);
    const cs = { X: [24.5, 8.5], Y: [8.5, 24.5], A: [40.5, 24.5], B: [24.5, 40.5] };   // 원 가운데가 한 칸의 정중앙이어야 글자가 맞는다
    for (const [cx, cy] of Object.values(cs)) for (let y = 0; y < 48; y++) for (let x = 0; x < 48; x++) if (Math.hypot(x + .5 - cx, y + .5 - cy) <= 7.9) am[y * 48 + x] = 1;
    shade(ac, am, 48, 48);
    for (const [k, [cx, cy]] of Object.entries(cs)) GLYPH[k].forEach((row, j) => [...row].forEach((v, i) => { if (v === '1') dot(ac, Math.floor(cx) - 2 + i, Math.floor(cy) - 3 + j, PAD.G); }));
    const tint = (src, test) => {
      const c = mk(48, 48), x = c.getContext('2d'); x.drawImage(src, 0, 0);
      const id = src.getContext('2d').getImageData(0, 0, 48, 48); x.fillStyle = 'rgba(28,31,43,0.2)';
      for (let y = 0; y < 48; y++) for (let i = 0; i < 48; i++) { const p = (y * 48 + i) * 4; if (id.data[p + 3] && test(i, y) && !(id.data[p] < 0x30 && id.data[p + 1] < 0x30)) x.fillRect(i, y, 1, 1); }
      return c.toDataURL();
    };
    const press = {
      up: tint(d, (i, y) => i >= 16 && i < 32 && y < 16), down: tint(d, (i, y) => i >= 16 && i < 32 && y >= 32),
      left: tint(d, (i, y) => i < 16 && y >= 16 && y < 32), right: tint(d, (i, y) => i >= 32 && y >= 16 && y < 32),
    };
    for (const [k, [cx, cy]] of Object.entries(cs)) press[k] = tint(a, (i, y) => Math.hypot(i + .5 - cx, y + .5 - cy) <= 7.9);
    return { dpad: d.toDataURL(), abxy: a.toDataURL(), press };
  }
  /* ----- 아래 화면 바탕(8x8 대각선 줄무늬)과 진행 표시용 몬스터볼 점(9x9) ----- */
  function touch() {
    const t = mk(8, 8), tc = t.getContext('2d');
    for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) if ((x + y) % 8 < 2) dot(tc, x, y, 'rgba(255,255,255,0.10)');
    const ball = full => {
      const c = mk(9, 9), cx = c.getContext('2d');
      for (let y = 0; y < 9; y++) for (let x = 0; x < 9; x++) {
        const r = Math.hypot(x - 4, y - 4);
        if (r > 4.4) continue;
        if (r > 3.4) dot(cx, x, y, full ? '#252b3d' : '#9fb0d4');
        else if (!full) dot(cx, x, y, '#e9eef7');
        else if (y === 4) dot(cx, x, y, '#252b3d');
        else if (y < 4) dot(cx, x, y, x < 4 && y < 3 ? '#f07a70' : '#e0453a');
        else dot(cx, x, y, '#ffffff');
      }
      if (full) { dot(cx, 4, 4, '#ffffff'); dot(cx, 3, 4, '#252b3d'); dot(cx, 5, 4, '#252b3d'); }
      return c.toDataURL();
    };
    return { tile: t.toDataURL(), pipFull: ball(true), pipEmpty: ball(false) };
  }
  /* ----- 도트 조각: 매끈한 CSS 도형 대신 쓰는 이미지들 ----- */
  const SHELL_CUT = [5, 3, 2, 1, 1, 0, 0, 0];   // 몸체 모서리 계단 (한 줄에서 잘려 나가는 칸 수)
  function bits() {
    const out = {};
    const draw = (w, h, fn) => { const c = mk(w, h), x = c.getContext('2d'); fn(x, w, h); return c.toDataURL(); };
    const tri = (w, h, rows, color) => draw(w, h, x => rows.forEach((n, y) => dot(x, Math.floor((w - n) / 2), y, color, n, 1)));
    out.arrR = draw(5, 9, x => [1, 2, 3, 4, 5, 4, 3, 2, 1].forEach((n, y) => dot(x, 0, y, '#e0453a', n, 1)));
    out.arrD = tri(7, 4, [7, 5, 3, 1], '#e0453a');
    out.mk = draw(11, 9, (x, w, h) => {   // 지도 마커: 윤곽선 있는 빨간 ▼
      const m = new Uint8Array(w * h);
      [11, 9, 7, 5, 3, 1].forEach((n, y) => { for (let i = 0; i < n; i++) m[y * w + Math.floor((w - n) / 2) + i] = 1; });
      shadeP(x, m, w, h, { O: '#252b3d', B: '#e0453a', H: '#f07a70', S: '#a8281f' });
    });
    out.star = draw(11, 11, (x, w, h) => {   // 별 배지
      const pts = []; for (let i = 0; i < 10; i++) { const r = i % 2 ? 2.4 : 5.4, a = -Math.PI / 2 + i * Math.PI / 5; pts.push([5.5 + r * Math.cos(a), 5.5 + r * Math.sin(a)]); }
      const inside = (px, py) => { let c = false; for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) if ((pts[i][1] > py) !== (pts[j][1] > py) && px < (pts[j][0] - pts[i][0]) * (py - pts[i][1]) / (pts[j][1] - pts[i][1]) + pts[i][0]) c = !c; return c; };
      const m = new Uint8Array(w * h); for (let y = 0; y < h; y++) for (let i = 0; i < w; i++) m[y * w + i] = inside(i + .5, y + .5) ? 1 : 0;
      shadeP(x, m, w, h, { O: '#8a6a10', B: '#f5c635', H: '#fde58a', S: '#c9951a' });
    });
    out.arrDw = tri(7, 4, [7, 5, 3, 1], '#ffffff');
    const G = { A: GLYPH.A, B: GLYPH.B, X: GLYPH.X, Y: GLYPH.Y, S: ['01110', '10001', '10000', '01110', '00001', '10001', '01110'] };
    for (const [k, rows] of Object.entries(G)) out['g' + k] = draw(11, 11, (x, w, h) => {   // 버튼 글자 동그라미 (DS 버튼 표시)
      const m = new Uint8Array(w * h); for (let y = 0; y < h; y++) for (let i = 0; i < w; i++) if (Math.hypot(i + .5 - 5.5, y + .5 - 5.5) <= 5.4) m[y * w + i] = 1;
      shadeP(x, m, w, h, { O: '#14205c', B: '#ffffff', H: '#ffffff', S: '#c4cada' });
      rows.forEach((row, j) => [...row].forEach((v, i) => { if (v === '1') dot(x, 3 + i, 2 + j, '#14205c'); }));
    });
    out.gD = draw(11, 11, (x, w, h) => {   // 방향 버튼 표시 (십자)
      const m = new Uint8Array(w * h); for (let y = 0; y < h; y++) for (let i = 0; i < w; i++) if (Math.hypot(i + .5 - 5.5, y + .5 - 5.5) <= 5.4) m[y * w + i] = 1;
      shadeP(x, m, w, h, { O: '#14205c', B: '#ffffff', H: '#ffffff', S: '#c4cada' });
      dot(x, 5, 2, '#14205c', 1, 7); dot(x, 2, 5, '#14205c', 7, 1);
    });
    out.gM = draw(11, 11, (x, w, h) => {   // SELECT 표시 (동그라미 안의 −)
      const m = new Uint8Array(w * h); for (let y = 0; y < h; y++) for (let i = 0; i < w; i++) if (Math.hypot(i + .5 - 5.5, y + .5 - 5.5) <= 5.4) m[y * w + i] = 1;
      shadeP(x, m, w, h, { O: '#14205c', B: '#ffffff', H: '#ffffff', S: '#c4cada' });
      dot(x, 3, 5, '#14205c', 5, 1);
    });
    out.grid = draw(16, 16, x => { dot(x, 0, 0, '#dfe3ea', 16, 1); dot(x, 0, 0, '#dfe3ea', 1, 16); });   // 모눈종이
    out.dots = draw(4, 4, x => dot(x, 1, 1, '#a3a9ba'));                                    // 스피커 구멍
    out.diag = draw(8, 8, x => { for (let i = 0; i < 8; i++) dot(x, i, (8 - i) % 8, '#d4ddee'); });   // 도감 대각선
    out.shadow = draw(140, 12, (x, w, h) => { for (let y = 0; y < h; y++) for (let i = 0; i < w; i++) if (Math.hypot((i + .5 - w / 2) / (w / 2), (y + .5 - h / 2) / (h / 2)) <= 1) dot(x, i, y, '#c9d3e8'); });
    out.corner = draw(8, 8, (x, w, h) => {   // 몸체 왼쪽 위 모서리의 윤곽선 (2칸 두께)
      const M = (i, y) => i >= 0 && y >= 0 && i < w && y < h && i >= SHELL_CUT[y];
      for (let y = 0; y < h; y++) for (let i = 0; i < w; i++) {
        if (!M(i, y)) continue;
        let near = false;
        for (let dy = -2; dy <= 2 && !near; dy++) for (let dx = -2; dx <= 2; dx++) if (Math.abs(dx) + Math.abs(dy) <= 2 && !M(i + dx, y + dy) && (i + dx < w) && (y + dy < h)) { near = true; break; }
        if (near) dot(x, i, y, '#1c1f2b');
      }
    });
    // 눌린 버튼 모양들 (십자 패드 네 방향, ABXY 네 개)
    return out;
  }
  // 몸체를 계단 모서리로 오리는 clip-path (unit: 'px' 또는 CSS 변수 이름). 위쪽 몸체는 위 모서리, 아래쪽 몸체는 아래 모서리를 깎는다.
  function shellClips() {
    const R = SHELL_CUT.length;
    const u = (n, unit) => (n === 0 ? '0px' : unit === 'px' ? n + 'px' : `calc(${n} * var(${unit}))`);
    const steps = [[SHELL_CUT[0], 0]];
    for (let r = 0; r < R; r++) { steps.push([SHELL_CUT[r], r + 1]); if (r + 1 < R) steps.push([SHELL_CUT[r + 1], r + 1]); }
    const poly = (unit, topSide) => {
      const yv = y => (topSide ? u(y, unit) : `calc(100% - ${u(y, unit)})`);
      const left = steps.map(([x, y]) => `${u(x, unit)} ${yv(y)}`);
      const right = steps.map(([x, y]) => `calc(100% - ${u(x, unit)}) ${yv(y)}`).reverse();
      const far = topSide ? ['0px 100%', '100% 100%'] : ['0px 0px', '100% 0px'];
      return `polygon(${left.join(',')},${far.join(',')},${right.join(',')})`;
    };
    return { t: poly('px', true), b: poly('px', false), tk: poly('--k', true), bk: poly('--k', false) };
  }
  return { route, center, intro, bw, pt, winBtn, shadow, patch, townMap, icon, frames, pads, touch, bits, shellClips, NODES, rng, mk };
})();
