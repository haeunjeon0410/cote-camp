// UI에 쓰는 트레이너·아이템 도트를 내려받아 assets/ui 에 저장한다 (개인 학습용)
//  - 트레이너: Pokémon Showdown (블랙·화이트 스타일 80x80)
//  - 아이템: PokeAPI/sprites
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, '..', 'assets', 'ui');
const SD = 'https://play.pokemonshowdown.com/sprites/trainers/';
const IT = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/';
const jobs = [
  ...['oak', 'nurse', 'cynthia', 'red', 'cilan', 'cress', 'chili', 'elesa', 'roark', 'roxie', 'skyla', 'sabrina', 'brycen'].map(n => [SD + n + '.png', `trainers/${n}.png`]),
  ...['poke-ball', 'great-ball', 'ultra-ball', 'master-ball', 'premier-ball', 'potion', 'rare-candy', 'town-map'].map(n => [IT + n + '.png', `items/${n}.png`]),
];

(async () => {
  let ok = 0, skip = 0, fail = 0;
  for (const [url, rel] of jobs) {
    const dest = path.join(OUT, rel);
    if (fs.existsSync(dest)) { skip++; continue; }
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(res.status);
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
      ok++;
    } catch (e) { fail++; console.log('실패', rel, e.message); }
  }
  console.log(`내려받기 ${ok}개, 이미 있음 ${skip}개, 실패 ${fail}개 (총 ${jobs.length}개)`);
  process.exit(fail ? 1 : 0);
})();
