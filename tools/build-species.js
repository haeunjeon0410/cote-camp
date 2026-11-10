// PokeAPI csv(종 이름·타입·진화·포획률)에서 도감 데이터(1~649번)를 만들어 renderer/species.js 로 저장한다.
//   node tools/build-species.js <csv 폴더>
const fs = require('fs'), path = require('path');
const dir = process.argv[2];
const rows = f => { const [h, ...r] = fs.readFileSync(path.join(dir, f), 'utf8').trim().split(/\r?\n/); const cols = h.split(','); return r.map(l => { const v = l.split(','); return Object.fromEntries(cols.map((c, i) => [c, v[i]])); }); };
const MAX = 649;
const TYPE = { 1: 'normal', 2: 'fighting', 3: 'flying', 4: 'poison', 5: 'ground', 6: 'rock', 7: 'bug', 8: 'ghost', 9: 'steel', 10: 'fire', 11: 'water', 12: 'grass', 13: 'electric', 14: 'psychic', 15: 'ice', 16: 'dragon', 17: 'dark', 18: 'fairy' };
// 지역(0~9): 태초마을 잔물결항구 불꽃마을 번개발전소 바위협곡 독안개늪 구름정상 별빛천문대 설원동굴 챔피언 리그
const REGION = { grass: 0, bug: 5, water: 1, fire: 2, electric: 3, fighting: 9, rock: 4, ground: 4, steel: 8, poison: 5, ghost: 5, dark: 9, flying: 6, psychic: 7, fairy: 7, ice: 8, dragon: 9 };
const NORMAL_SPREAD = [0, 3, 6, 2, 1, 8, 4];
const sp = {}; for (const r of rows('pokemon_species.csv')) { const id = +r.id; if (id <= MAX) sp[id] = { id, from: +r.evolves_from_species_id || 0, cap: +r.capture_rate, legend: r.is_legendary === '1' || r.is_mythical === '1', baby: r.is_baby === '1' }; }
for (const r of rows('pokemon_species_names.csv')) if (r.local_language_id === '3' && sp[+r.pokemon_species_id]) sp[+r.pokemon_species_id].name = r.name;
for (const r of rows('pokemon_types.csv')) { const id = +r.pokemon_id; if (sp[id] && r.slot === '1') sp[id].type = TYPE[+r.type_id]; if (sp[id] && r.slot === '2') sp[id].type2 = TYPE[+r.type_id]; }
const root = id => { let s = sp[id]; while (s.from && sp[s.from]) s = sp[s.from]; return s; };
const depth = id => { let d = 0, s = sp[id]; while (s.from && sp[s.from]) { s = sp[s.from]; d++; } return d; };
// 진화 순서(같은 부모의 갈래마다 레벨을 조금씩 다르게)
const sib = {}; Object.values(sp).forEach(s => { if (s.from) (sib[s.from] = sib[s.from] || []).push(s.id); });
let normalIdx = 0; const regionOf = {};
for (let id = 1; id <= MAX; id++) {
  const r = root(id); if (regionOf[r.id] == null) regionOf[r.id] = ({ flying: 6, ice: 8, dragon: 9, psychic: 7 })[r.type2] ?? (r.type === 'normal' ? NORMAL_SPREAD[normalIdx++ % NORMAL_SPREAD.length] : (REGION[r.type] ?? 0));
}
const out = [];
for (let id = 1; id <= MAX; id++) {
  const s = sp[id], r = root(id), d = depth(id);
  let k = s.legend ? 3 : s.cap >= 150 ? 0 : s.cap >= 100 ? 1 : 2;
  let evo = 0; if (s.from) evo = d === 1 ? 10 + 2 * (sib[s.from].indexOf(id)) : 18 + 2 * (sib[s.from].indexOf(id));
  out.push([id, s.name, s.type, regionOf[r.id], k, s.from, evo]);
}
const counts = Array(10).fill(0).map(() => ({ wild: 0, all: 0, legend: 0 })); out.forEach(o => { const c = counts[o[3]]; c.all++; if (!o[5] && o[4] < 3) c.wild++; if (o[4] === 3) c.legend++; });
console.log(counts.map((c, i) => `${i + 1}:${c.wild}/${c.all}/L${c.legend}`).join(' '));
fs.writeFileSync(path.join(__dirname, '..', 'renderer', 'species.js'), `/* 도감 데이터 1~649번 (tools/build-species.js 가 PokeAPI csv에서 만든다)
   [번호, 이름, 타입, 지역(0~9), 희귀도(0 흔함·1 보통·2 희귀·3 전설), 진화 전 번호, 진화 레벨] */\nconst DEX = ${JSON.stringify(out)};\n`);
console.log('species.js', out.length, '종');
