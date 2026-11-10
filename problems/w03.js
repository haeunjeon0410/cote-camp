// 3주차 · 불꽃마을: 구현 · 문자열 · 격자 다루기
const { rng, nums, lines } = require('./util');

const WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
const DIRS = ['N', 'E', 'S', 'W'], DR = [-1, 0, 1, 0], DC = [0, 1, 0, -1];
const mdays = (y, m) => [31, (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0 ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m - 1];
const matText = (a, sep = ' ') => a.map(r => r.join(sep)).join('\n') + '\n';

module.exports = [
  {
    id: 'w3-01', title: '영단어로 쓴 숫자', tags: ['문자열', '파싱'], limit: 1000,
    statement: '오박사의 낡은 수첩에는 비밀번호가 적혀 있는데, 일부 숫자가 영단어로 쓰여 있어요. 예를 들어 `one4seveneight`은 `1478`을 뜻해요.\n\n수첩에 적힌 문자열이 주어질 때, 모든 영단어를 숫자로 바꾼 **비밀번호**를 출력해요. 영단어와 숫자는 사이에 아무것도 없이 이어져 있어요.\n\n- 영단어: `zero one two three four five six seven eight nine`\n- 앞에 `0`이 올 수도 있어요. 숫자를 정수로 바꾸지 말고 **문자열 그대로** 출력해요.',
    input: '첫째 줄에 문자열이 주어집니다. 길이는 1 이상 60 이하이고, 숫자(0~9)와 위 영단어로만 이루어져 있습니다.',
    output: '비밀번호를 출력합니다.',
    examples: ['one4seveneight\n', '23four5six7\n'],
    gen: () => {
      const r = rng(301), tok = () => (r.next() < 0.5 ? String(r.int(0, 9)) : WORDS[r.int(0, 9)]);
      const t = ['zero\n', '7\n', 'nine\n', 'zerozero1\n', 'onetwothreefourfivesixseveneightninezero\n', '0000\n'];
      for (let i = 0; i < 12; i++) t.push(Array.from({ length: r.int(1, 10) }, tok).join('') + '\n');
      return t;
    },
    solve: inp => {
      const s = inp.trim();
      let out = '', i = 0;
      while (i < s.length) {
        if (/\d/.test(s[i])) { out += s[i++]; continue; }
        const d = WORDS.findIndex(w => s.startsWith(w, i));
        out += d; i += WORDS[d].length;
      }
      return out + '\n';
    },
    hints: [
      '문자열을 앞에서부터 한 글자씩 보면서, 숫자면 그대로 붙이고 글자면 영단어를 찾아봐요.',
      '`zero`부터 `nine`까지 10개의 영단어를 배열에 넣어 두고, 현재 위치에서 시작하는 단어와 비교해요. `s.compare(i, 길이, 단어)`가 편해요.',
      '단어를 찾았으면 그 단어 길이만큼 위치를 건너뛰어요. 결과는 숫자가 아니라 문자열에 이어 붙여야 앞의 0이 안 사라져요.',
    ],
    editorial: {
      text: '문자열을 앞에서 한 번만 훑으면 돼요. 영단어는 첫 글자나 두 번째 글자로 서로 구분되기 때문에, 현재 위치에서 어떤 단어가 시작하는지 하나만 맞아요. 결과를 `int`로 만들면 `0`으로 시작하는 비밀번호가 망가지니 문자열로 이어 붙여요.',
      code: String.raw`#include <iostream>
#include <string>
#include <cctype>
using namespace std;

int main() {
    string s;
    cin >> s;
    const string w[10] = {"zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"};
    string out;
    size_t i = 0;
    while (i < s.size()) {
        if (isdigit((unsigned char)s[i])) { out += s[i]; i++; continue; }
        for (int d = 0; d < 10; d++) {
            if (s.compare(i, w[d].size(), w[d]) == 0) {
                out += char('0' + d);
                i += w[d].size();
                break;
            }
        }
    }
    cout << out << "\n";
    return 0;
}`,
    },
  },
  {
    id: 'w3-02', title: '가장 긴 팰린드롬 구간', tags: ['문자열', '완전탐색'], limit: 1000,
    statement: '앞에서 읽으나 뒤에서 읽으나 똑같은 문자열을 **팰린드롬**이라고 해요. (예: `level`, `abba`)\n\n문자열 `S`가 주어질 때, `S`의 **연속된 부분 문자열** 중에서 팰린드롬인 것의 최대 길이를 구해요.',
    input: '첫째 줄에 알파벳 소문자로 이루어진 문자열 `S`가 주어집니다. (1 ≤ 길이 ≤ 50)',
    output: '가장 긴 팰린드롬 부분 문자열의 길이를 출력합니다.',
    examples: ['babad\n', 'cbbd\n'],
    gen: () => {
      const r = rng(302), t = ['a\n', 'aa\n', 'abc\n', 'abacaba\n', 'x'.repeat(50) + '\n', 'abcdefghij\n', 'abccba\n', 'racecarxyz\n'];
      for (let i = 0; i < 12; i++) { const al = i % 2 ? 'ab' : 'abc'; t.push(Array.from({ length: r.int(1, 50) }, () => al[r.int(0, al.length - 1)]).join('') + '\n'); }
      return t;
    },
    solve: inp => {
      const s = inp.trim();
      let best = 1;
      for (let i = 0; i < s.length; i++) for (let j = i; j < s.length; j++) {
        const t = s.slice(i, j + 1);
        if (t === [...t].reverse().join('')) best = Math.max(best, t.length);
      }
      return best + '\n';
    },
    hints: [
      '문자열의 모든 부분 문자열을 만들어서 팰린드롬인지 확인해도 길이가 50이라 충분히 빨라요.',
      '조금 더 똑똑하게: 가운데 글자를 하나 정하고 양쪽으로 한 칸씩 넓혀 가며 같은지 확인해요.',
      '가운데가 한 글자인 경우(홀수 길이)와 두 글자 사이인 경우(짝수 길이)를 둘 다 해 봐야 해요.',
    ],
    editorial: {
      text: '팰린드롬은 가운데에서 양쪽으로 같은 글자가 이어지는 모양이에요. 가운데를 정하고 넓히는 방법은 `O(N²)`이에요. 홀수 길이(`aba`)와 짝수 길이(`abba`)는 가운데가 다르니 둘 다 확인해야 해요.',
      code: String.raw`#include <iostream>
#include <string>
#include <algorithm>
using namespace std;

int main() {
    string s;
    cin >> s;
    int n = s.size(), best = 1;
    for (int c = 0; c < n; c++) {
        int l = c, r = c;
        while (l >= 0 && r < n && s[l] == s[r]) { best = max(best, r - l + 1); l--; r++; }
        l = c; r = c + 1;
        while (l >= 0 && r < n && s[l] == s[r]) { best = max(best, r - l + 1); l--; r++; }
    }
    cout << best << "\n";
    return 0;
}`,
    },
  },
  {
    id: 'w3-03', title: '문자열 압축', tags: ['문자열', '구현'], limit: 1000,
    statement: '같은 글자가 연속으로 나오면 **글자 + 반복 횟수**로 줄여서 저장하려고 해요. 단, 한 번만 나온 글자는 횟수를 쓰지 않아요.\n\n예: `AAABCC` → `A3BC2`\n\n문자열이 주어질 때 압축한 결과를 출력해요.',
    input: '첫째 줄에 알파벳 대문자로 이루어진 문자열이 주어집니다. (1 ≤ 길이 ≤ 1000)',
    output: '압축한 문자열을 출력합니다. 같은 글자가 10번 이상 연속되면 횟수는 두 자리 이상의 수예요.',
    examples: ['AAABCC\n', 'ABCCCCCCCCCCCD\n'],
    gen: () => {
      const r = rng(303), t = ['A\n', 'ABC\n', 'A'.repeat(10) + '\n', 'A'.repeat(11) + 'B\n', 'ZZ\n', 'A'.repeat(100) + 'B'.repeat(100) + 'A\n'];
      for (let i = 0; i < 12; i++) {
        let s = '', prev = '';
        const runs = r.int(1, 25);
        for (let k = 0; k < runs; k++) {
          let c; do { c = String.fromCharCode(65 + r.int(0, 5)); } while (c === prev);
          prev = c;
          s += c.repeat(r.next() < 0.2 ? r.int(8, 60) : r.int(1, 4));
        }
        t.push(s.slice(0, 1000) + '\n');
      }
      return t;
    },
    solve: inp => {
      const s = inp.trim();
      let out = '';
      for (let i = 0; i < s.length;) {
        let j = i;
        while (j < s.length && s[j] === s[i]) j++;
        out += s[i] + (j - i > 1 ? String(j - i) : '');
        i = j;
      }
      return out + '\n';
    },
    hints: [
      '같은 글자가 이어지는 "구간"을 하나씩 찾아서 처리해요.',
      '구간의 시작 `i`에서 `j`를 같은 글자인 동안 늘려 가요. 구간의 길이는 `j - i`예요.',
      '길이가 1이면 글자만, 2 이상이면 글자 뒤에 `to_string(길이)`를 붙여요. 마지막 구간도 빠뜨리지 않아요.',
    ],
    editorial: {
      text: '"같은 글자가 이어지는 구간" 하나를 한 번에 처리하는 패턴이에요. 구간이 끝나는 위치 `j`를 찾아서 `i = j`로 점프하면 마지막 구간도 자연스럽게 처리돼요. 횟수가 두 자리 이상일 수 있으니 `char`가 아니라 `to_string`으로 이어 붙여요.',
      code: String.raw`#include <iostream>
#include <string>
using namespace std;

int main() {
    string s, out;
    cin >> s;
    int n = s.size();
    for (int i = 0; i < n;) {
        int j = i;
        while (j < n && s[j] == s[i]) j++;
        out += s[i];
        if (j - i > 1) out += to_string(j - i);
        i = j;
    }
    cout << out << "\n";
    return 0;
}`,
    },
  },
  {
    id: 'w3-04', title: '닉네임 정리하기', tags: ['문자열', '구현'], limit: 1000,
    statement: '게임 회사에서 유저가 입력한 닉네임을 아래 **규칙을 순서대로** 적용해서 정리하려고 해요.\n\n1. 대문자를 모두 소문자로 바꿉니다.\n2. 소문자, 숫자, `_`(밑줄)이 아닌 문자는 전부 `_`로 바꿉니다.\n3. 연속된 `_`는 하나로 줄입니다.\n4. 맨 앞과 맨 뒤의 `_`를 모두 지웁니다.\n5. 비어 있으면 `user`로 바꿉니다.\n6. 길이가 12 이상이면 앞 11글자만 남기고, 남긴 문자열 끝의 `_`를 모두 지웁니다.\n7. 길이가 4보다 짧으면 마지막 글자를 길이가 4가 될 때까지 반복해서 붙입니다.\n\n정리된 닉네임을 출력해요.',
    input: '첫째 줄에 공백이 없는 문자열이 주어집니다. 길이는 1 이상 60 이하이고, 영문자, 숫자, 특수문자로 이루어져 있습니다.',
    output: '정리된 닉네임을 출력합니다.',
    examples: ['Hello,World!!\n', '...!@#\n', 'Aa\n'],
    gen: () => {
      const r = rng(304), pool = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_!@#$%^&*()-+=.,~';
      const t = ['___\n', 'A\n', '..a..\n', 'abcdefghij_klm\n', 'ABCDEFGHIJKLMNOPQR\n', 'ab\n', '!!!!!!!!!!!!!!!!\n', 'a_b_c_d_e_f_g_h_i_j_\n', '_x_\n'];
      for (let i = 0; i < 14; i++) t.push(Array.from({ length: r.int(1, i < 7 ? 14 : 60) }, () => pool[r.int(0, pool.length - 1)]).join('') + '\n');
      return t;
    },
    solve: inp => {
      let s = inp.trim().toLowerCase();
      s = s.replace(/[^a-z0-9_]/g, '_').replace(/_+/g, '_').replace(/^_+|_+$/g, '');
      if (!s) s = 'user';
      if (s.length >= 12) s = s.slice(0, 11).replace(/_+$/, '');
      while (s.length < 4) s += s[s.length - 1];
      return s + '\n';
    },
    hints: [
      '규칙이 7개나 돼서 복잡해 보이지만, **순서대로 한 단계씩** 적용하면 돼요. 단계마다 함수나 반복문 하나라고 생각해요.',
      '3번(연속된 `_` 줄이기)은 새 문자열을 만들면서 "방금 붙인 글자가 `_`이고 지금도 `_`이면 건너뛰기"로 해결해요.',
      '4번과 6번의 "끝의 `_` 지우기"는 `while (!t.empty() && t.back() == \'_\') t.pop_back();`처럼 해요. 7번은 `t.back()`을 반복해서 붙여요.',
    ],
    editorial: {
      text: '여러 규칙을 순서대로 적용하는 "구현" 문제예요. 규칙 하나를 한 줄 정도의 코드로 옮기고, 순서만 지키면 돼요. 6번 이후에 길이가 바뀌므로 7번을 마지막에 해야 하는 이유(순서)도 중요해요.',
      code: String.raw`#include <iostream>
#include <string>
using namespace std;

int main() {
    string s, t;
    cin >> s;
    for (char c : s) {
        if ('A' <= c && c <= 'Z') c = c - 'A' + 'a';
        if (!(('a' <= c && c <= 'z') || ('0' <= c && c <= '9') || c == '_')) c = '_';
        if (c == '_' && !t.empty() && t.back() == '_') continue;
        t += c;
    }
    while (!t.empty() && t.front() == '_') t.erase(t.begin());
    while (!t.empty() && t.back() == '_') t.pop_back();
    if (t.empty()) t = "user";
    if (t.size() >= 12) {
        t = t.substr(0, 11);
        while (!t.empty() && t.back() == '_') t.pop_back();
    }
    while (t.size() < 4) t += t.back();
    cout << t << "\n";
    return 0;
}`,
    },
  },
  {
    id: 'w3-05', title: 'D일 뒤의 날짜와 요일', tags: ['날짜 계산', '구현'], limit: 1000,
    statement: '시작 날짜와 일수 `K`가 주어질 때, 시작 날짜로부터 **K일 뒤의 날짜와 요일**을 구해요. 양력(그레고리력)을 기준으로 하고, 윤년은 다음과 같이 정해요.\n\n- 4의 배수이면서 100의 배수가 아닌 해\n- 400의 배수인 해\n\n(`2000`년은 윤년, `1900`년과 `2100`년은 윤년이 아니에요.) `1900년 1월 1일`은 월요일이었어요.',
    input: '첫째 줄에 연, 월, 일, `K`가 공백으로 구분되어 주어집니다. (1900 ≤ 연 ≤ 2100, 시작 날짜는 올바른 날짜, 0 ≤ K ≤ 100000)',
    output: '`YYYY-MM-DD 요일` 형식으로 출력합니다. 월과 일은 두 자리로, 요일은 `MON TUE WED THU FRI SAT SUN` 중 하나로 씁니다.',
    examples: ['2024 2 28 2\n', '2023 12 31 1\n'],
    gen: () => {
      const r = rng(305), t = ['1900 1 1 0\n', '2000 2 28 1\n', '2000 2 28 2\n', '2100 2 28 1\n', '1900 12 31 1\n', '2024 2 29 365\n', '2100 12 31 100000\n', '1999 12 31 1\n'];
      for (let i = 0; i < 12; i++) { const y = r.int(1900, 2100), m = r.int(1, 12), d = r.int(1, mdays(y, m)); t.push(`${y} ${m} ${d} ${r.next() < 0.3 ? r.int(0, 400) : r.int(0, 100000)}\n`); }
      return t;
    },
    solve: inp => {
      const [y, m, d, k] = nums(inp);
      const dt = new Date(Date.UTC(y, m - 1, d) + k * 86400000);
      const p = n => String(n).padStart(2, '0');
      return `${String(dt.getUTCFullYear()).padStart(4, '0')}-${p(dt.getUTCMonth() + 1)}-${p(dt.getUTCDate())} ${['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][dt.getUTCDay()]}\n`;
    },
    hints: [
      '`K`가 최대 10만이라, 하루씩 `K`번 넘기는 반복문을 돌려도 충분히 빨라요.',
      '하루를 넘길 때: 일(`d`)을 1 늘리고, 그 달의 마지막 날을 넘으면 `d = 1`로 하고 월을 늘려요. 12월을 넘으면 연을 늘려요. 달마다 일수가 다르고 2월은 윤년을 따져야 해요.',
      '요일은 "1900년 1월 1일(월요일)부터 며칠 지났는지"를 7로 나눈 나머지로 구해요. 시작 날짜까지의 날수에 `K`를 더해서 계산해요.',
    ],
    editorial: {
      text: '날짜 문제의 핵심은 "달마다 며칠인지"와 "윤년"이에요. 하루씩 넘기는 방식은 느려 보이지만 `K ≤ 100000`이라 충분해요. 요일은 기준 날짜(1900-01-01은 월요일)로부터의 날수를 7로 나눈 나머지를 쓰면 돼요. 윤년 규칙에서 100의 배수 예외와 400의 배수 예외를 놓치기 쉬워요.',
      code: String.raw`#include <cstdio>
#include <iostream>
using namespace std;

bool leap(int y) { return (y % 4 == 0 && y % 100 != 0) || y % 400 == 0; }
int mdays(int y, int m) {
    static const int d[] = {31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31};
    return (m == 2 && leap(y)) ? 29 : d[m - 1];
}

int main() {
    int y, m, d, k;
    cin >> y >> m >> d >> k;
    long long total = 0;  // 1900-01-01 부터 시작 날짜까지의 날수 + K
    for (int yy = 1900; yy < y; yy++) total += leap(yy) ? 366 : 365;
    for (int mm = 1; mm < m; mm++) total += mdays(y, mm);
    total += d - 1 + k;
    const char* name[] = {"MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"};
    while (k--) {
        d++;
        if (d > mdays(y, m)) { d = 1; m++; if (m > 12) { m = 1; y++; } }
    }
    printf("%04d-%02d-%02d %s\n", y, m, d, name[total % 7]);
    return 0;
}`,
    },
  },
  {
    id: 'w3-06', title: '로봇 명령 따라가기', tags: ['시뮬레이션', '격자'], limit: 1000,
    statement: '`N × M` 격자판 위에 로봇이 있어요. 칸은 빈칸 `.` 또는 벽 `#`이에요. 로봇은 어떤 칸에서 `N`(위), `E`(오른쪽), `S`(아래), `W`(왼쪽) 중 한 방향을 보고 있어요.\n\n로봇은 명령을 순서대로 하나씩 따라요.\n\n- `L`: 제자리에서 **왼쪽으로 90도** 돌아요.\n- `R`: 제자리에서 **오른쪽으로 90도** 돌아요.\n- `F`: 보고 있는 방향으로 **한 칸** 가요. 격자 밖이거나 벽이면 움직이지 않고 그대로 있어요.\n\n모든 명령을 따른 뒤 로봇의 위치와 방향을 구해요. 위쪽 줄이 1행, 왼쪽 칸이 1열이에요.',
    input: '첫째 줄에 `N`과 `M`이 주어집니다. (1 ≤ N, M ≤ 20)\n다음 `N`개의 줄에 격자판이 주어집니다.\n그다음 줄에 로봇의 처음 행, 열, 방향이 주어집니다. 처음 위치는 빈칸입니다.\n마지막 줄에 명령 문자열이 주어집니다. (1 ≤ 길이 ≤ 1000)',
    output: '`행 열 방향`을 공백으로 구분해 출력합니다.',
    examples: ['3 4\n....\n.#..\n....\n1 1 E\nFFRFFLF\n'],
    gen: () => {
      const r = rng(306), t = ['1 1\n.\n1 1 N\nFFFLFRF\n', '2 2\n.#\n..\n1 1 E\nFRFRFRF\n', '3 3\n...\n...\n...\n2 2 N\nFFFFFFFFLFFFF\n'];
      for (let i = 0; i < 14; i++) {
        const big = i > 9, n = big ? r.int(10, 20) : r.int(1, 8), m = big ? r.int(10, 20) : r.int(1, 8);
        const g = Array.from({ length: n }, () => Array.from({ length: m }, () => (r.next() < 0.22 ? '#' : '.')));
        const sr = r.int(0, n - 1), sc = r.int(0, m - 1);
        g[sr][sc] = '.';
        const len = big ? r.int(300, 1000) : r.int(1, 60);
        t.push(`${n} ${m}\n${g.map(x => x.join('')).join('\n')}\n${sr + 1} ${sc + 1} ${DIRS[r.int(0, 3)]}\n${Array.from({ length: len }, () => 'LRFFF'[r.int(0, 4)]).join('')}\n`);
      }
      return t;
    },
    solve: inp => {
      const l = lines(inp).filter(x => x !== '');
      const [n, m] = nums(l[0]), g = l.slice(1, 1 + n), [rs, cs, ds] = l[1 + n].split(' ');
      let r = +rs - 1, c = +cs - 1, k = DIRS.indexOf(ds);
      for (const x of l[2 + n]) {
        if (x === 'L') k = (k + 3) % 4;
        else if (x === 'R') k = (k + 1) % 4;
        else { const nr = r + DR[k], nc = c + DC[k]; if (nr >= 0 && nr < n && nc >= 0 && nc < m && g[nr][nc] !== '#') { r = nr; c = nc; } }
      }
      return `${r + 1} ${c + 1} ${DIRS[k]}\n`;
    },
    hints: [
      '방향을 `N E S W` 순서로 번호 0, 1, 2, 3으로 두면, 오른쪽으로 도는 건 `+1`, 왼쪽으로 도는 건 `+3`(= `-1`)이에요. 4로 나눈 나머지를 써요.',
      '방향마다 행과 열이 얼마씩 변하는지를 배열로 만들어요. 위는 행 -1, 오른쪽은 열 +1 이런 식이에요: `dr[] = {-1,0,1,0}`, `dc[] = {0,1,0,-1}`.',
      '`F`를 처리할 때는 **먼저 다음 칸을 계산**하고, 격자 안인지 + 벽이 아닌지를 확인한 뒤에만 실제로 움직여요. 위치는 1부터가 아니라 0부터 저장하면 편해요.',
    ],
    editorial: {
      text: '격자 시뮬레이션의 기본 틀이에요. 방향을 번호로 바꾸고 `dr`, `dc` 배열로 이동량을 관리하면 `if`가 길게 늘어나지 않아요. "움직이기 전에 다음 칸이 갈 수 있는지 먼저 확인"하는 습관은 이후 모든 격자 문제에서 계속 써요.',
      code: String.raw`#include <iostream>
#include <vector>
#include <string>
using namespace std;

int main() {
    int n, m;
    cin >> n >> m;
    vector<string> g(n);
    for (auto& row : g) cin >> row;
    int r, c;
    char d;
    string cmd;
    cin >> r >> c >> d >> cmd;
    r--; c--;
    const char dirs[4] = {'N', 'E', 'S', 'W'};
    const int dr[4] = {-1, 0, 1, 0}, dc[4] = {0, 1, 0, -1};
    int k = 0;
    while (dirs[k] != d) k++;
    for (char x : cmd) {
        if (x == 'L') k = (k + 3) % 4;
        else if (x == 'R') k = (k + 1) % 4;
        else {
            int nr = r + dr[k], nc = c + dc[k];
            if (nr >= 0 && nr < n && nc >= 0 && nc < m && g[nr][nc] != '#') { r = nr; c = nc; }
        }
    }
    cout << r + 1 << " " << c + 1 << " " << dirs[k] << "\n";
    return 0;
}`,
    },
  },
  {
    id: 'w3-07', title: '표 90도 돌리기', tags: ['시뮬레이션', '2차원 배열'], limit: 1000,
    statement: '`N × M` 크기의 표가 있어요. 이 표를 **시계 방향으로 90도** 돌리는 일을 `K`번 반복했을 때의 표를 출력해요.\n\n표를 한 번 돌리면 `N × M` 표는 `M × N` 표가 돼요. 예를 들어 아래 표를 한 번 돌리면 이렇게 돼요.\n\n```\n1 2 3        4 1\n4 5 6   →    5 2\n             6 3\n```',
    input: '첫째 줄에 `N`, `M`, `K`가 주어집니다. (1 ≤ N, M ≤ 30, 0 ≤ K ≤ 10^9)\n다음 `N`개의 줄에 표의 값이 주어집니다. 값은 0 이상 999 이하의 정수입니다.',
    output: '돌린 뒤의 표를 출력합니다. 한 줄에 한 행씩, 값은 공백으로 구분합니다.',
    examples: ['2 3 1\n1 2 3\n4 5 6\n'],
    gen: () => {
      const r = rng(307), t = ['1 1 5\n7\n', '1 4 1\n1 2 3 4\n', '3 1 2\n1\n2\n3\n', '2 2 4\n1 2\n3 4\n', '2 3 0\n1 2 3\n4 5 6\n', '2 2 1000000000\n1 2\n3 4\n'];
      for (let i = 0; i < 12; i++) {
        const n = r.int(1, i > 8 ? 30 : 6), m = r.int(1, i > 8 ? 30 : 6), k = [0, 1, 2, 3, 4, 5, 999999999, 1000000000, r.int(0, 1000000000)][r.int(0, 8)];
        t.push(`${n} ${m} ${k}\n${Array.from({ length: n }, () => Array.from({ length: m }, () => r.int(0, 999)).join(' ')).join('\n')}\n`);
      }
      return t;
    },
    solve: inp => {
      const l = lines(inp).filter(x => x !== ''), [n0, m0, k] = nums(l[0]);
      let a = l.slice(1, 1 + n0).map(nums), n = n0, m = m0;
      for (let t = k % 4; t > 0; t--) {
        const b = Array.from({ length: m }, () => Array(n).fill(0));
        for (let i = 0; i < n; i++) for (let j = 0; j < m; j++) b[j][n - 1 - i] = a[i][j];
        a = b; [n, m] = [m, n];
      }
      return matText(a);
    },
    hints: [
      '`K`가 10억까지라서 `K`번 그대로 돌리면 시간 초과예요. 4번 돌리면 원래대로 돌아오니까 `K % 4`번만 돌리면 돼요.',
      '한 번 돌릴 때 새 표는 `M × N` 크기예요. 원래 표의 `(i, j)` 칸이 새 표의 어디로 가는지 그림을 그려서 찾아봐요. 예제로 `(0,0)`의 `1`이 어디로 갔는지 봐요.',
      '`b[j][N-1-i] = a[i][j]`예요. 돌린 뒤에는 `N`과 `M`을 서로 바꿔 주는 걸 잊지 않아요.',
    ],
    editorial: {
      text: '두 가지 포인트가 있어요. 첫째, 같은 동작을 4번 하면 제자리로 돌아오니 `K % 4`만 하면 돼요 (큰 `K`를 줄이는 대표 패턴). 둘째, 돌릴 때마다 크기가 바뀌니 새 배열을 `M × N`으로 만들고 `N`, `M`을 교환해야 해요.',
      code: String.raw`#include <iostream>
#include <vector>
using namespace std;

int main() {
    int n, m;
    long long k;
    cin >> n >> m >> k;
    vector<vector<int>> a(n, vector<int>(m));
    for (auto& row : a) for (auto& v : row) cin >> v;
    for (int t = k % 4; t > 0; t--) {
        vector<vector<int>> b(m, vector<int>(n));
        for (int i = 0; i < n; i++)
            for (int j = 0; j < m; j++) b[j][n - 1 - i] = a[i][j];
        a = b;
        swap(n, m);
    }
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < m; j++) cout << a[i][j] << (j + 1 < m ? " " : "\n");
    }
    return 0;
}`,
    },
  },
  {
    id: 'w3-08', title: '두 로봇 팔 번호 누르기', tags: ['시뮬레이션', '좌표'], limit: 1000,
    statement: '엘리베이터 버튼이 아래처럼 `4 × 3` 격자로 배치되어 있어요.\n\n```\n1 2 3\n4 5 6\n7 8 9\nS 0 E\n```\n\n로봇 팔 두 개가 있어요. **왼팔**은 처음에 `S` 자리에, **오른팔**은 처음에 `E` 자리에 있어요. 숫자를 순서대로 누르는데, 규칙은 이래요.\n\n- `1, 4, 7`은 항상 **왼팔**이 눌러요.\n- `3, 6, 9`는 항상 **오른팔**이 눌러요.\n- `2, 5, 8, 0`은 지금 **더 가까운 팔**이 눌러요. 거리는 상하좌우로 몇 칸인지(맨해튼 거리)예요. 거리가 같으면 입력으로 주어진 **우선 팔**이 눌러요.\n\n팔은 누른 버튼의 자리로 이동해요. 각 숫자를 어느 팔이 눌렀는지 출력해요.',
    input: '첫째 줄에 누를 숫자들이 공백 없이 이어진 문자열이 주어집니다. (1 ≤ 길이 ≤ 1000)\n둘째 줄에 우선 팔을 나타내는 문자가 주어집니다. 왼팔이면 `L`, 오른팔이면 `R`입니다.',
    output: '각 숫자를 누른 팔을 `L` 또는 `R`로 이어 붙여 한 줄로 출력합니다.',
    examples: ['1337\nL\n', '5802\nR\n'],
    gen: () => {
      const r = rng(308), t = ['0\nL\n', '0\nR\n', '5\nL\n', '1\nR\n', '2580\nL\n', '8888\nR\n', '0000000\nL\n'];
      for (let i = 0; i < 12; i++) t.push(`${Array.from({ length: i < 6 ? r.int(1, 15) : r.int(100, 1000) }, () => r.int(0, 9)).join('')}\n${'LR'[r.int(0, 1)]}\n`);
      return t;
    },
    solve: inp => {
      const [s, pref] = lines(inp).filter(x => x !== '');
      const pos = c => (c === 'S' ? [3, 0] : c === 'E' ? [3, 2] : c === '0' ? [3, 1] : [Math.floor((+c - 1) / 3), (+c - 1) % 3]);
      let L = pos('S'), R = pos('E'), out = '';
      for (const c of s) {
        const p = pos(c);
        let useL;
        if ('147'.includes(c)) useL = true;
        else if ('369'.includes(c)) useL = false;
        else {
          const dl = Math.abs(L[0] - p[0]) + Math.abs(L[1] - p[1]), dr = Math.abs(R[0] - p[0]) + Math.abs(R[1] - p[1]);
          useL = dl < dr ? true : dl > dr ? false : pref === 'L';
        }
        if (useL) { L = p; out += 'L'; } else { R = p; out += 'R'; }
      }
      return out + '\n';
    },
    hints: [
      '버튼을 `(행, 열)` 좌표로 바꿔 두면 거리 계산이 쉬워요. 숫자 `d`(1~9)는 행이 `(d-1)/3`, 열이 `(d-1)%3`이에요. `0`, `S`, `E`는 맨 아랫줄 가운데, 왼쪽, 오른쪽이에요.',
      '두 팔의 현재 위치를 변수 두 개로 들고 있다가, 숫자를 누를 때마다 갱신해요.',
      '`2, 5, 8, 0`일 때만 거리를 비교해요. 거리가 같을 때만 우선 팔을 쓰는 것을 잊지 않아요. 누른 팔의 위치만 바뀌어요.',
    ],
    editorial: {
      text: '상태(두 팔의 위치)를 들고 있으면서 입력을 하나씩 처리하는 전형적인 시뮬레이션이에요. 번호를 좌표로 바꾸는 규칙을 한 번 정리해 두면, 거리 계산과 "누구 차례인지" 판단이 단순해져요. 거리가 같을 때만 우선 팔을 쓰는 조건 분기가 핵심이에요.',
      code: String.raw`#include <iostream>
#include <string>
#include <cstdlib>
#include <utility>
using namespace std;

pair<int, int> pos(char c) {
    if (c == 'S') return {3, 0};
    if (c == 'E') return {3, 2};
    if (c == '0') return {3, 1};
    int d = c - '1';
    return {d / 3, d % 3};
}

int main() {
    string s;
    char pref;
    cin >> s >> pref;
    pair<int, int> L = pos('S'), R = pos('E');
    string out;
    for (char c : s) {
        auto p = pos(c);
        bool useL;
        if (c == '1' || c == '4' || c == '7') useL = true;
        else if (c == '3' || c == '6' || c == '9') useL = false;
        else {
            int dl = abs(L.first - p.first) + abs(L.second - p.second);
            int dr = abs(R.first - p.first) + abs(R.second - p.second);
            if (dl < dr) useL = true;
            else if (dl > dr) useL = false;
            else useL = (pref == 'L');
        }
        if (useL) { L = p; out += 'L'; } else { R = p; out += 'R'; }
    }
    cout << out << "\n";
    return 0;
}`,
    },
  },
  {
    id: 'w3-09', title: '나선형으로 채우기', tags: ['시뮬레이션', '방향 벡터'], limit: 1000,
    statement: '`N × M` 격자의 왼쪽 위 칸에서 시작해서 **시계 방향 나선**을 그리며 `1`부터 `N × M`까지의 수를 차례로 채우려고 해요. 오른쪽으로 가다가 더 갈 수 없으면(격자 끝이거나 이미 채워진 칸이면) 방향을 오른쪽으로 꺾어요.\n\n`3 × 4`라면 이렇게 돼요.\n\n```\n 1  2  3  4\n10 11 12  5\n 9  8  7  6\n```\n\n다 채운 격자를 출력해요.',
    input: '첫째 줄에 `N`과 `M`이 주어집니다. (1 ≤ N, M ≤ 30)',
    output: '한 줄에 한 행씩, 값은 공백으로 구분해서 출력합니다.',
    examples: ['3 4\n', '4 4\n'],
    gen: () => ['1 1\n', '1 5\n', '5 1\n', '2 2\n', '3 3\n', '4 6\n', '7 4\n', '10 10\n', '30 30\n', '30 1\n', '1 30\n', '13 29\n', '2 7\n', '9 3\n'],
    solve: inp => {
      const [n, m] = nums(inp), a = Array.from({ length: n }, () => Array(m).fill(0));
      const dr = [0, 1, 0, -1], dc = [1, 0, -1, 0];
      let r = 0, c = 0, k = 0;
      for (let v = 1; v <= n * m; v++) {
        a[r][c] = v;
        let nr = r + dr[k], nc = c + dc[k];
        if (nr < 0 || nr >= n || nc < 0 || nc >= m || a[nr][nc] !== 0) { k = (k + 1) % 4; nr = r + dr[k]; nc = c + dc[k]; }
        r = nr; c = nc;
      }
      return matText(a);
    },
    hints: [
      '방향은 오른쪽 → 아래 → 왼쪽 → 위쪽 순서로 계속 돌아요. 방향 배열을 만들어 봐요: `dr[] = {0,1,0,-1}`, `dc[] = {1,0,-1,0}`.',
      '값을 한 칸 채운 뒤에 "같은 방향으로 한 칸 더 가면 어떻게 되나?"를 확인해요. 격자 밖이거나 이미 채워진 칸(값이 0이 아닌 칸)이면 방향을 `(k+1)%4`로 바꿔요.',
      '`N`이나 `M`이 1인 경우도 같은 코드로 잘 돼요. 마지막 칸을 채운 뒤에는 위치를 더 갈 필요가 없으니 배열 밖을 읽지 않게 조건을 먼저 검사해요.',
    ],
    editorial: {
      text: '"끝까지 가다가 막히면 방향을 바꾼다"는 규칙을 그대로 코드로 옮기는 문제예요. 방향 배열(`dr`, `dc`)과 "막혔는지" 검사(범위 + 이미 채움)를 분리하면 깔끔해요. 같은 틀이 달팽이, 배열 껍질 돌리기, 로봇 청소기 같은 문제에 계속 나와요.',
      code: String.raw`#include <iostream>
#include <vector>
using namespace std;

int main() {
    int n, m;
    cin >> n >> m;
    vector<vector<int>> a(n, vector<int>(m, 0));
    const int dr[4] = {0, 1, 0, -1}, dc[4] = {1, 0, -1, 0};
    int r = 0, c = 0, k = 0;
    for (int v = 1; v <= n * m; v++) {
        a[r][c] = v;
        int nr = r + dr[k], nc = c + dc[k];
        if (nr < 0 || nr >= n || nc < 0 || nc >= m || a[nr][nc] != 0) {
            k = (k + 1) % 4;
            nr = r + dr[k];
            nc = c + dc[k];
        }
        r = nr; c = nc;
    }
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < m; j++) cout << a[i][j] << (j + 1 < m ? " " : "\n");
    }
    return 0;
}`,
    },
  },
  {
    id: 'w3-10', title: '괄호 없는 계산기', tags: ['문자열', '파싱', '구현'], boss: true, limit: 1000,
    statement: '불꽃마을 체육관 관장은 계산기를 직접 만들어 쓰는 사람이에요. 이 계산기는 **공백도 괄호도 없는 수식**을 받아서 계산해요. 수식에는 음이 아닌 정수와 `+`, `-`, `*` 세 가지 연산자만 있고, 곱셈(`*`)을 먼저 계산한 뒤에 덧셈과 뺄셈을 **앞에서부터 차례로** 계산해요.\n\n예: `12+3*4-5*6*2` = `12 + 12 - 60` = `-36`\n\n수식이 주어질 때 계산 결과를 출력해요.',
    input: '첫째 줄에 수식이 주어집니다. 수식은 숫자로 시작하고 숫자로 끝나며, 연산자와 숫자가 번갈아 나옵니다. 각 수는 0 이상 999 이하이고(앞에 불필요한 0은 없음), 수식의 길이는 100 이하입니다. 계산 중간 결과의 절댓값은 10^18 이하입니다.',
    output: '계산 결과를 출력합니다.',
    examples: ['1+2*3\n', '12*3-4*5+6\n'],
    gen: () => {
      const r = rng(310), t = ['5\n', '0\n', '7*0\n', '999*999*999*999\n', '1-2-3-4\n', '10-2*3-4*5*6+7\n', '100*0-1\n'];
      for (let i = 0; i < 14; i++) {
        let s = '';
        const terms = r.int(1, i > 9 ? 8 : 4);
        for (let k = 0; k < terms; k++) {
          if (k) s += r.next() < 0.5 ? '+' : '-';
          s += Array.from({ length: r.int(1, 3) }, () => r.int(0, i > 9 ? 999 : 20)).join('*');
        }
        t.push(s.slice(0, 100).replace(/[+\-*]$/, '') + '\n');
      }
      return t;
    },
    solve: inp => {
      const s = inp.trim();
      let i = 0, total = 0n;
      const num = () => { let v = 0n; while (i < s.length && /\d/.test(s[i])) v = v * 10n + BigInt(s[i++]); return v; };
      while (i < s.length) {
        let sg = 1n;
        if (s[i] === '+' || s[i] === '-') { sg = s[i] === '-' ? -1n : 1n; i++; }
        let t = num();
        while (i < s.length && s[i] === '*') { i++; t *= num(); }
        total += sg * t;
      }
      return total + '\n';
    },
    hints: [
      '수식을 `+`, `-`로 잘랐을 때 나오는 덩어리마다 안에는 곱셈만 있어요. 이 덩어리를 **항(term)**이라고 부르면 "수식 = 항들의 합과 차"예요.',
      '앞에서부터 읽으면서, 부호(`+`/`-`)를 기억해 두고 숫자를 읽어요. 그 뒤에 `*`가 계속 나오면 곱해서 하나의 항 값으로 만든 다음에 부호에 맞춰 더하거나 빼요.',
      '숫자는 한 글자가 아니에요 (`999`처럼 세 자리). 숫자 읽기 함수를 따로 만들어서 `while (isdigit(s[i]))`로 자리를 이어 붙여요. 합은 `long long`으로 둬요.',
    ],
    editorial: {
      text: '수식 파싱의 가장 기본 틀이에요. "수식 = 항들의 합/차, 항 = 수들의 곱"이라고 구조를 나누면, 곱셈 우선 규칙이 자연스럽게 해결돼요. 괄호가 있으면 이 구조가 재귀로 확장돼요 (더 어려운 문제). 숫자를 한 글자씩이 아니라 연속된 자리를 읽어서 만드는 것과 중간 결과를 `long long`으로 두는 것이 함정이에요.',
      code: String.raw`#include <iostream>
#include <string>
#include <cctype>
using namespace std;

int main() {
    string s;
    cin >> s;
    size_t i = 0;
    auto readNum = [&]() -> long long {
        long long v = 0;
        while (i < s.size() && isdigit((unsigned char)s[i])) v = v * 10 + (s[i++] - '0');
        return v;
    };
    long long total = 0;
    while (i < s.size()) {
        int sign = 1;
        if (s[i] == '+' || s[i] == '-') { sign = (s[i] == '-') ? -1 : 1; i++; }
        long long term = readNum();
        while (i < s.size() && s[i] == '*') { i++; term *= readNum(); }
        total += sign * term;
    }
    cout << total << "\n";
    return 0;
}`,
    },
  },
];
