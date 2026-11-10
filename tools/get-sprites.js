// 도감용 포켓몬 도트(1~649번, 5세대 블랙·화이트 스타일)를 PokeAPI/sprites 저장소에서 내려받아 assets/sprites 에 저장한다 (개인 학습용)
//   anim: 움직이는 그림, icon: 도감 칸 아이콘
const fs = require('fs');
const path = require('path');
const RAW = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/';
const BW = RAW + 'versions/generation-v/black-white/';
const OUT = path.join(__dirname, '..', 'assets', 'sprites');
const MAX = Number(process.argv[2] || 649);
const jobs = [];
for (let d = 1; d <= MAX; d++) {
  jobs.push([`${BW}animated/${d}.gif`, `anim/${d}.gif`]);
  jobs.push([`${RAW}versions/generation-vii/icons/${d}.png`, `icon/${d}.png`]);
}
(async () => {
  let ok = 0, skip = 0, fail = 0;
  for (let i = 0; i < jobs.length; i += 16) {
    await Promise.all(jobs.slice(i, i + 16).map(async ([url, rel]) => {
      const dest = path.join(OUT, rel);
      if (fs.existsSync(dest)) { skip++; return; }
      for (let t = 0; t < 3; t++) {
        try {
          const res = await fetch(url); if (!res.ok) throw new Error(res.status);
          fs.mkdirSync(path.dirname(dest), { recursive: true }); fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer())); ok++; return;
        } catch (e) { if (t === 2) { fail++; console.log('실패', rel, e.message); } }
      }
    }));
    if (i % 320 === 0) console.log('진행', i, '/', jobs.length);
  }
  console.log(`내려받기 ${ok}개, 이미 있음 ${skip}개, 실패 ${fail}개 (총 ${jobs.length}개)`);
})();
