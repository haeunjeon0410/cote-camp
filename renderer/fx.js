/* 게임 느낌: 효과음(코드로 만든 8비트 소리)과 화면 효과(번쩍임·반짝이·흔들림·장면 전환) */
const FX = (() => {
  let ac = null;
  const on = () => !(typeof S !== 'undefined' && S.settings && S.settings.sound === false);
  const ctx = () => { if (!ac) { try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; } } if (ac.state === 'suspended') ac.resume().catch(() => {}); return ac; };
  function tone(f, d, type = 'square', vol = .05, t0 = 0, slide = 0) {
    if (!on()) return; const a = ctx(); if (!a) return;
    const t = a.currentTime + t0, o = a.createOscillator(), g = a.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, f * slide), t + d);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.0001, t + d);
    o.connect(g); g.connect(a.destination); o.start(t); o.stop(t + d + .03);
  }
  const N = { C4: 262, E4: 330, G4: 392, A4: 440, C5: 523, D5: 587, E5: 659, G5: 784, A5: 880, B5: 988, C6: 1047, E6: 1319, G6: 1568 };
  const seq = (notes, step = .07, type = 'square', vol = .05) => notes.forEach((n, i) => tone(N[n] || n, step * 1.7, type, vol, i * step));
  const SND = {
    move: () => tone(620, .04, 'square', .02),
    ok: () => { tone(880, .05, 'square', .035); tone(1320, .07, 'square', .035, .05); },
    back: () => { tone(440, .05, 'square', .03); tone(330, .07, 'square', .03, .05); },
    tick: () => tone(1500, .012, 'square', .01),
    correct: () => seq(['C5', 'E5', 'G5', 'C6'], .07),
    wrong: () => tone(220, .28, 'sawtooth', .045, 0, .5),
    throw: () => tone(300, .18, 'triangle', .07, 0, 3),
    shake: () => tone(170, .06, 'square', .05),
    caught: () => { seq(['G5', 'C6', 'E6', 'G6'], .09, 'square', .045); tone(1568, .55, 'triangle', .05, .38); },
    level: () => seq(['C5', 'E5', 'G5', 'B5', 'C6'], .08, 'triangle', .055),
    dex: () => seq(['E5', 'G5', 'C6'], .09, 'square', .04),
    evolve: () => { for (let i = 0; i < 12; i++) tone(380 + i * 55, .13, 'triangle', .045, i * .1); seq(['C5', 'E5', 'G5', 'C6', 'E6'], .12, 'square', .045); },
    badge: () => seq(['C5', 'C5', 'C5', 'G5', 'E5', 'G5', 'C6'], .13, 'square', .05),
  };
  const sfx = (n, delay = 0) => { const f = () => { try { SND[n] && SND[n](); } catch (e) { /* 소리 없이 계속 */ } }; delay ? setTimeout(f, delay) : f(); };
  const top = () => document.querySelector('#top');
  // 위쪽 화면 번쩍임
  function flash(color = '#ffffff', ms = 420) { const t = top(); if (!t) return; const d = document.createElement('div'); d.className = 'fxflash'; d.style.background = color; d.style.animationDuration = ms + 'ms'; t.appendChild(d); setTimeout(() => d.remove(), ms + 60); }
  // 반짝이: 위쪽 화면 (x, y)에서 사방으로 튄다
  function sparkle(x, y, n = 14, color = '#fff6c0') {
    const t = top(); if (!t) return;
    for (let i = 0; i < n; i++) {
      const s = document.createElement('i'), a = (i / n) * Math.PI * 2 + Math.random() * .4, r = 26 + Math.random() * 40;
      s.className = 'fxspk'; s.style.cssText = `left:${x}px;top:${y}px;--dx:${Math.round(Math.cos(a) * r)}px;--dy:${Math.round(Math.sin(a) * r * .8)}px;color:${color};animation-delay:${Math.round(Math.random() * 120)}ms`;
      t.appendChild(s); setTimeout(() => s.remove(), 1000);
    }
  }
  function shake(sel) { const el = document.querySelector(sel); if (!el) return; el.classList.remove('shk'); void el.offsetWidth; el.classList.add('shk'); }
  // 장면이 바뀔 때 두 화면이 살짝 밝아지며 들어온다
  function enter() { ['#top', '#bot'].forEach(s => { const el = document.querySelector(s); if (!el) return; el.classList.remove('sin'); void el.offsetWidth; el.classList.add('sin'); }); }
  return { sfx, flash, sparkle, shake, enter };
})();
