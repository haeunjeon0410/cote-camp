// 문제 작성용 도우미: 시드 난수, 입력 파싱
function rng(seed) {
  let a = seed >>> 0;
  const next = () => {
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const int = (lo, hi) => lo + Math.floor(next() * (hi - lo + 1));
  return { next, int, pick: arr => arr[int(0, arr.length - 1)] };
}

const nums = s => s.split(/\s+/).filter(Boolean).map(Number);
const lines = s => s.replace(/\r/g, '').split('\n');

module.exports = { rng, nums, lines };
