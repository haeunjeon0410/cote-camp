// 직접 찍은 도트 데이터 (지우 · 몬스터볼)와 그리기 도우미, 포켓몬 스프라이트 경로
const ASH = ['....oooooo....', '...oRRRRRRo...', '..oRRWWGWRRo..', '..oRRWGGWRRRo.', '.oKrrrrrrrrrro', '.oKKSSSSSSSoo.', 'oKKSSSSSSSSo..', 'oKKSSESSSESo..', '.oKSPESSSEPo..', '..oSSSSsSSSo..', '...ooSSSSoo...', '..oWBBTTBBWo..', '.ogBBBTTBBBgo.', '.ogbBBTTBBbgo.', '..ooJJJJJJoo..', '...oJJjjJJo...'];
const LEGS_A = ['...oJo..oJo...', '..oZZo..oZZo..'];
const LEGS_B = ['....oJooJo....', '....oZZZZo....'];
const ASH_PAL = { o: '#1a1a2e', R: '#e3342f', r: '#b0221f', W: '#ffffff', G: '#2e9e4f', K: '#26262e', S: '#f6c99a', s: '#d9776a', E: '#1a1a2e', P: '#f59a9a', B: '#2f6fd6', b: '#234fa0', T: '#2a2a2a', g: '#3fae49', J: '#3657a8', j: '#2a4583', Z: '#e3342f' };
const BALL_BOTTOM = ['kRRRkkkkkRrrk', 'kkkkkWWWkkkkk', 'kWWWkkkkkWggk', 'kWWWWWWWWWWgk', '.kWWWWWWWWgk.', '.kgWWWWWWggk.', '..kkgggggkk..', '....kkkkk....'];
const BALLS = {
  poke: [['....kkkkk....', '..kkRRRRRkk..', '.kRHHRRRRRRk.', '.kRHRRRRRRrk.', 'kRRRRRRRRRRrk'].concat(BALL_BOTTOM), { k: '#1e1e1e', R: '#e3342f', r: '#a91f1f', H: '#ffffff', W: '#ffffff', g: '#c9ccd1' }],
  ultra: [['....kkkkk....', '..kkYRRRYkk..', '.kYYRHRRRYYk.', '.kYYHRRRRYYk.', 'kYYRRRRRRRYYk'].concat(BALL_BOTTOM), { k: '#1e1e1e', R: '#3a3a3a', r: '#222222', H: '#9a9a9a', Y: '#f5c518', W: '#ffffff', g: '#c9ccd1' }],
};
const DOC = ['...hhhhhh...', '..hhhhhhhh..', '..hssssssh..', '..sgssssgs..', '..ssssssss..', '...ssmmss...', '..wwwwwwww..', '.wwwbbbbwww.', '.wwwbbbbwww.', '.wwwwwwwwww.', '..ww....ww..', '..dd....dd..'];
const DOC_PAL = { h: '#9a9aa8', s: '#f0c8a0', g: '#222', m: '#c06050', w: '#f4f4f4', b: '#3a6ea5', d: '#5a3a2a' };

function drawRows(cv, rows, pal, s) {
  cv.width = rows[0].length * s;
  cv.height = rows.length * s;
  const x = cv.getContext('2d');
  rows.forEach((row, y) => [...row].forEach((ch, c) => {
    if (ch !== '.' && pal[ch]) { x.fillStyle = pal[ch]; x.fillRect(c * s, y * s, s, s); }
  }));
}

const SPR = '../assets/sprites/';
const spr = {
  anim: (dex, shiny) => `${SPR}${shiny ? 'anim-shiny' : 'anim'}/${dex}.gif`,
  still: (dex, shiny) => `${SPR}${shiny ? 'still-shiny' : 'still'}/${dex}.png`,
  icon: dex => `${SPR}icon/${dex}.png`,
};

// 정수 배율로 키워서 도트가 번지지 않게 한다
function fitImg(img, max) {
  const go = () => {
    const m = Math.max(img.naturalWidth, img.naturalHeight) || 1;
    img.style.width = img.naturalWidth * Math.max(1, Math.min(4, Math.floor(max / m))) + 'px';
  };
  if (img.complete && img.naturalWidth) go(); else img.addEventListener('load', go);
}
