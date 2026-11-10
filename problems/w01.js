// 1주차 · 태초마을: C++ 기본 문법과 입출력
const { rng, nums, lines } = require('./util');

module.exports = [
  {
    id: 'w1-01', title: '두 수의 합', tags: ['입출력'], limit: 1000,
    statement: '정수 `A`와 `B`가 주어집니다. `A + B`를 출력해요.',
    input: '첫째 줄에 `A`와 `B`가 공백으로 구분되어 주어집니다. (-1000 ≤ A, B ≤ 1000)',
    output: '`A + B`를 출력합니다.',
    examples: ['1 2\n', '-7 3\n'],
    gen: () => {
      const r = rng(101);
      const t = ['0 0\n', '1000 1000\n', '-1000 -1000\n'];
      for (let i = 0; i < 12; i++) t.push(`${r.int(-1000, 1000)} ${r.int(-1000, 1000)}\n`);
      return t;
    },
    solve: inp => { const [a, b] = nums(inp); return `${a + b}\n`; },
    hints: [
      '입력을 받을 변수 두 개를 만들고 `cin >> a >> b;` 로 읽어요.',
      '`int` 범위로 충분한지 먼저 계산해 봐요. 값은 최대 1000이에요.',
      '`cout << a + b << "\\n";` 한 줄이면 끝나요.',
    ],
    editorial: {
      text: 'C++ 입출력의 가장 기본 형태예요. `cin >> a >> b`는 공백과 줄바꿈을 알아서 건너뛰며 값을 읽어요.',
      code: String.raw`#include <iostream>
using namespace std;

int main() {
    int a, b;
    cin >> a >> b;
    cout << a + b << "\n";
    return 0;
}`,
    },
  },
  {
    id: 'w1-02', title: '첫 인사', tags: ['출력'], limit: 1000,
    statement: '입력은 없습니다. 다음 문장을 그대로 출력해요.\n\n`Hello, Pokemon Master!`',
    input: '입력은 없습니다.',
    output: '`Hello, Pokemon Master!` 를 한 줄 출력합니다.',
    examples: [''],
    gen: () => [''],
    solve: () => 'Hello, Pokemon Master!\n',
    hints: [
      '문자열은 큰따옴표 `"` 로 감싸요.',
      '`cout << "..." ;` 형태로 출력해요.',
      '쉼표, 느낌표, 대소문자까지 정확히 같아야 해요.',
    ],
    editorial: {
      text: '입력이 없어도 `main` 함수는 필요해요. 출력의 공백과 대소문자까지 정확히 맞춰야 정답이에요.',
      code: String.raw`#include <iostream>
using namespace std;

int main() {
    cout << "Hello, Pokemon Master!" << "\n";
    return 0;
}`,
    },
  },
  {
    id: 'w1-03', title: '나눗셈', tags: ['자료형', '실수'], limit: 1000, checker: 'float',
    statement: '두 정수 `A`, `B`가 주어질 때 `A / B`를 출력해요.\n\n절대/상대 오차 `10^-6` 이하면 정답입니다.',
    input: '첫째 줄에 `A`와 `B`가 주어집니다. (0 < A, B < 100000)',
    output: '`A / B`를 출력합니다.',
    examples: ['1 3\n', '4 5\n'],
    gen: () => {
      const r = rng(103);
      const t = ['1 1\n', '99999 1\n', '1 99999\n', '7 2\n'];
      for (let i = 0; i < 10; i++) t.push(`${r.int(1, 99999)} ${r.int(1, 99999)}\n`);
      return t;
    },
    solve: inp => { const [a, b] = nums(inp); return `${(a / b).toFixed(9)}\n`; },
    hints: [
      '`int / int` 는 정수 나눗셈이라 소수점이 버려져요.',
      '`double` 변수에 값을 받거나 한쪽을 `double`로 바꿔서 나눠요.',
      '`cout << fixed; cout.precision(9);` 로 소수점 아래 자릿수를 맞출 수 있어요.',
    ],
    editorial: {
      text: '정수 나눗셈 함정이에요. `double`로 받으면 해결되고, 출력 자릿수는 `fixed`와 `precision`으로 조절해요. 이 문제는 오차 허용이라 자릿수가 달라도 괜찮아요.',
      code: String.raw`#include <iostream>
using namespace std;

int main() {
    double a, b;
    cin >> a >> b;
    cout << fixed;
    cout.precision(9);
    cout << a / b << "\n";
    return 0;
}`,
    },
  },
  {
    id: 'w1-04', title: '윤년 판별', tags: ['조건문'], limit: 1000,
    statement: '연도 `Y`가 주어질 때 윤년이면 `1`, 아니면 `0`을 출력해요.\n\n윤년은 다음 중 하나를 만족하는 해입니다.\n- 4의 배수이면서 100의 배수가 아닌 해\n- 400의 배수인 해',
    input: '첫째 줄에 연도 `Y`가 주어집니다. (1 ≤ Y ≤ 4000)',
    output: '윤년이면 `1`, 아니면 `0`을 출력합니다.',
    examples: ['2000\n', '1900\n', '2024\n'],
    gen: () => {
      const r = rng(104);
      const t = ['1\n', '4\n', '100\n', '400\n', '4000\n', '2023\n', '2100\n'];
      for (let i = 0; i < 10; i++) t.push(`${r.int(1, 4000)}\n`);
      return t;
    },
    solve: inp => { const [y] = nums(inp); return `${(y % 4 === 0 && y % 100 !== 0) || y % 400 === 0 ? 1 : 0}\n`; },
    hints: [
      '조건이 두 덩어리예요. "4의 배수이고 100의 배수가 아님" 또는 "400의 배수".',
      '`&&`(그리고), `||`(또는)을 괄호로 묶어서 써요.',
      '`(y % 4 == 0 && y % 100 != 0) || y % 400 == 0`',
    ],
    editorial: {
      text: '조건식을 그대로 코드로 옮기면 돼요. 100의 배수 예외와 400의 배수 예외 순서를 헷갈리기 쉬워요.',
      code: String.raw`#include <iostream>
using namespace std;

int main() {
    int y;
    cin >> y;
    bool leap = (y % 4 == 0 && y % 100 != 0) || y % 400 == 0;
    cout << (leap ? 1 : 0) << "\n";
    return 0;
}`,
    },
  },
  {
    id: 'w1-05', title: '45분 일찍 일어나기', tags: ['조건문', '시간 계산'], limit: 1000,
    statement: '원래 설정한 알람 시각이 `H`시 `M`분입니다. 이 시각을 정확히 45분 앞당긴 시각을 출력해요.\n\n시각은 24시간제이며, 자정(0시 0분)보다 앞이면 전날로 넘어갑니다. 예를 들어 `0 30`의 45분 전은 `23 45`입니다.',
    input: '첫째 줄에 `H`와 `M`이 주어집니다. (0 ≤ H ≤ 23, 0 ≤ M ≤ 59)',
    output: '앞당긴 시각의 `H`와 `M`을 공백으로 구분해 출력합니다.',
    examples: ['10 10\n', '0 30\n', '23 40\n'],
    gen: () => {
      const r = rng(105);
      const t = ['0 0\n', '0 44\n', '0 45\n', '23 59\n', '1 0\n'];
      for (let i = 0; i < 10; i++) t.push(`${r.int(0, 23)} ${r.int(0, 59)}\n`);
      return t;
    },
    solve: inp => {
      const [h, m] = nums(inp);
      let t = h * 60 + m - 45;
      if (t < 0) t += 24 * 60;
      return `${Math.floor(t / 60)} ${t % 60}\n`;
    },
    hints: [
      '시각을 "하루 중 몇 분째인지"로 바꾸면 계산이 쉬워져요. `h * 60 + m`',
      '45를 빼서 음수가 되면 하루(1440분)를 더해요.',
      '다시 `t / 60`(시), `t % 60`(분)으로 나눠서 출력해요.',
    ],
    editorial: {
      text: '시간 문제의 정석은 전부 "분 단위 정수"로 바꿔서 계산하고 마지막에 되돌리는 거예요. 날짜가 넘어가는 경우는 하루 분량을 더하거나 `%`로 처리해요.',
      code: String.raw`#include <iostream>
using namespace std;

int main() {
    int h, m;
    cin >> h >> m;
    int t = h * 60 + m - 45;
    if (t < 0) t += 24 * 60;
    cout << t / 60 << " " << t % 60 << "\n";
    return 0;
}`,
    },
  },
  {
    id: 'w1-06', title: '구구단 한 줄씩', tags: ['반복문'], limit: 1000,
    statement: '정수 `N`이 주어질 때 `N`단을 아래 형식으로 출력해요.\n\n`N * 1 = N`\n`N * 2 = 2N`\n...',
    input: '첫째 줄에 `N`이 주어집니다. (1 ≤ N ≤ 9)',
    output: '`N * i = 결과` 형식으로 `i`가 1부터 9까지 9줄을 출력합니다.',
    examples: ['2\n'],
    gen: () => [1, 3, 5, 7, 8, 9].map(n => `${n}\n`),
    solve: inp => {
      const [n] = nums(inp);
      let s = '';
      for (let i = 1; i <= 9; i++) s += `${n} * ${i} = ${n * i}\n`;
      return s;
    },
    hints: [
      '`for (int i = 1; i <= 9; i++)` 으로 아홉 번 반복해요.',
      '출력 형식의 공백까지 똑같이 맞춰야 해요. `N * i = 결과`',
      '`cout << n << " * " << i << " = " << n * i << "\\n";`',
    ],
    editorial: {
      text: '`for` 반복문의 기본이에요. 출력 형식(공백, 기호)은 한 글자라도 다르면 오답이니 예제와 꼼꼼히 비교해요.',
      code: String.raw`#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    for (int i = 1; i <= 9; i++) {
        cout << n << " * " << i << " = " << n * i << "\n";
    }
    return 0;
}`,
    },
  },
  {
    id: 'w1-07', title: '별 계단', tags: ['반복문', '중첩 반복문'], limit: 1000,
    statement: '첫째 줄에 별 1개, 둘째 줄에 별 2개, ... `N`번째 줄에 별 `N`개를 출력해요.',
    input: '첫째 줄에 `N`이 주어집니다. (1 ≤ N ≤ 100)',
    output: '별 계단을 출력합니다. 별은 `*` 문자입니다.',
    examples: ['3\n', '5\n'],
    gen: () => [1, 2, 10, 37, 100].map(n => `${n}\n`),
    solve: inp => {
      const [n] = nums(inp);
      let s = '';
      for (let i = 1; i <= n; i++) s += '*'.repeat(i) + '\n';
      return s;
    },
    hints: [
      '바깥 반복문은 줄(`i`), 안쪽 반복문은 그 줄의 별 개수예요.',
      '`i`번째 줄에는 별이 `i`개 필요해요.',
      '안쪽 반복이 끝나면 줄바꿈을 한 번 출력해요.',
    ],
    editorial: {
      text: '중첩 반복문의 첫 연습이에요. 바깥은 줄, 안쪽은 칸으로 생각하면 나중에 2차원 배열 문제도 같은 틀로 풀려요.',
      code: String.raw`#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    for (int i = 1; i <= n; i++) {
        for (int j = 0; j < i; j++) cout << "*";
        cout << "\n";
    }
    return 0;
}`,
    },
  },
  {
    id: 'w1-08', title: 'X보다 작은 수', tags: ['반복문', '조건문', '배열'], limit: 1000,
    statement: '정수 `N`개로 이루어진 수열과 정수 `X`가 주어집니다. 수열에서 `X`보다 작은 수를 **입력 순서대로** 모두 출력해요.',
    input: '첫째 줄에 `N`과 `X`가 주어집니다. (1 ≤ N, X ≤ 10000)\n둘째 줄에 수열의 `N`개 정수가 주어집니다. 모든 정수는 1 이상 10000 이하입니다.',
    output: '`X`보다 작은 수를 공백으로 구분해 한 줄에 출력합니다. 해당하는 수가 없으면 빈 줄을 출력합니다.',
    examples: ['10 5\n1 10 4 9 2 3 8 5 7 6\n'],
    gen: () => {
      const r = rng(108);
      const t = ['1 1\n1\n', '3 10000\n10000 10000 10000\n', '5 1\n1 1 1 1 1\n'];
      for (let i = 0; i < 8; i++) {
        const n = r.int(1, 200), x = r.int(1, 10000);
        t.push(`${n} ${x}\n${Array.from({ length: n }, () => r.int(1, 10000)).join(' ')}\n`);
      }
      return t;
    },
    solve: inp => {
      const [n, x, ...a] = nums(inp);
      return `${a.slice(0, n).filter(v => v < x).join(' ')}\n`;
    },
    hints: [
      '값을 하나씩 읽으면서 바로 비교해도 돼요. 배열이 꼭 필요하진 않아요.',
      '`X`보다 작을 때만 출력하고, 출력 사이에 공백을 넣어요.',
      '공백이 끝에 하나 남아도 괜찮아요. 채점기가 줄 끝 공백은 무시해요.',
    ],
    editorial: {
      text: '입력을 읽으면서 바로 처리하면 배열 없이도 풀려요. 나중에 입력이 100만 개씩 들어오는 문제에서도 같은 습관이 도움이 돼요.',
      code: String.raw`#include <iostream>
using namespace std;

int main() {
    int n, x;
    cin >> n >> x;
    for (int i = 0; i < n; i++) {
        int v;
        cin >> v;
        if (v < x) cout << v << " ";
    }
    cout << "\n";
    return 0;
}`,
    },
  },
  {
    id: 'w1-09', title: '가장 큰 수와 그 자리', tags: ['배열', '최댓값'], limit: 1000,
    statement: '서로 다른 자연수 9개가 한 줄에 하나씩 주어집니다. 가장 큰 수와, 그 수가 몇 번째 수인지를 출력해요. 번째는 1부터 셉니다.',
    input: '아홉 개의 줄에 각각 100 미만의 서로 다른 자연수가 주어집니다.',
    output: '첫째 줄에 최댓값, 둘째 줄에 그 값의 위치(1~9)를 출력합니다.',
    examples: ['3\n29\n38\n12\n57\n74\n40\n85\n61\n'],
    gen: () => {
      const r = rng(109);
      const t = [];
      for (let i = 0; i < 10; i++) {
        const pool = Array.from({ length: 99 }, (_, k) => k + 1);
        const pick = [];
        for (let j = 0; j < 9; j++) pick.push(pool.splice(r.int(0, pool.length - 1), 1)[0]);
        t.push(pick.join('\n') + '\n');
      }
      t.push('1\n2\n3\n4\n5\n6\n7\n8\n9\n', '9\n8\n7\n6\n5\n4\n3\n2\n1\n');
      return t;
    },
    solve: inp => {
      const a = nums(inp);
      const m = Math.max(...a);
      return `${m}\n${a.indexOf(m) + 1}\n`;
    },
    hints: [
      '지금까지 본 최댓값과 그 위치를 변수로 들고 가면서 갱신해요.',
      '새 값이 최댓값보다 크면 값과 위치를 같이 바꿔요.',
      '위치는 1부터 세니까 반복문 변수에 `+ 1`을 해요.',
    ],
    editorial: {
      text: '"지금까지의 최선"을 기억하며 훑는 패턴은 코딩 테스트 전반에 계속 나와요. 값만 기억하지 말고 필요한 정보(위치)도 같이 기억해요.',
      code: String.raw`#include <iostream>
using namespace std;

int main() {
    int best = 0, pos = 0;
    for (int i = 1; i <= 9; i++) {
        int v;
        cin >> v;
        if (v > best) { best = v; pos = i; }
    }
    cout << best << "\n" << pos << "\n";
    return 0;
}`,
    },
  },
  {
    id: 'w1-10', title: '점수 부풀리기', tags: ['배열', '실수', '최댓값'], limit: 1000, checker: 'float',
    statement: '시험 점수를 조작하려고 합니다. 점수 중 최댓값을 `M`이라 할 때, 모든 점수를 `점수 / M * 100`으로 바꿉니다. 바뀐 점수들의 평균을 구해요.\n\n예를 들어 최고점이 70이고 점수가 40이면 `40 / 70 * 100`이 됩니다. 절대/상대 오차 `10^-6` 이하면 정답입니다.',
    input: '첫째 줄에 과목 수 `N`이 주어집니다. (1 ≤ N ≤ 1000)\n둘째 줄에 현재 점수 `N`개가 주어집니다. 점수는 0 이상 100 이하이고, 적어도 하나는 0보다 큽니다.',
    output: '새로운 평균을 출력합니다.',
    examples: ['3\n40 80 60\n', '3\n10 20 30\n'],
    gen: () => {
      const r = rng(110);
      const t = ['1\n50\n', '2\n0 100\n', '4\n0 0 0 1\n'];
      for (let i = 0; i < 9; i++) {
        const n = r.int(1, 1000);
        const a = Array.from({ length: n }, () => r.int(0, 100));
        a[r.int(0, n - 1)] = r.int(1, 100);
        t.push(`${n}\n${a.join(' ')}\n`);
      }
      return t;
    },
    solve: inp => {
      const [n, ...a] = nums(inp);
      const s = a.slice(0, n);
      const m = Math.max(...s);
      return `${(s.reduce((x, v) => x + v / m * 100, 0) / n).toFixed(9)}\n`;
    },
    hints: [
      '먼저 최댓값 `M`을 구하는 반복문이 필요해요.',
      '`점수 / M * 100`을 계산할 때 정수 나눗셈이 되지 않도록 `double`을 써요.',
      '새 점수들을 모두 더한 뒤 `N`으로 나누면 평균이에요. 합과 평균 모두 `double`로 둬요.',
    ],
    editorial: {
      text: '(1) 최댓값 찾기 (2) 변환해서 합산 (3) 평균, 이렇게 세 단계로 나눠요. 변환 전체를 더한 뒤 한 번만 `M`으로 나눠도 같은 결과예요: 평균 = (합 × 100) / (M × N).',
      code: String.raw`#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    int n;
    cin >> n;
    vector<double> a(n);
    for (auto& v : a) cin >> v;
    double m = *max_element(a.begin(), a.end());
    double sum = 0;
    for (double v : a) sum += v / m * 100;
    cout << fixed;
    cout.precision(9);
    cout << sum / n << "\n";
    return 0;
}`,
    },
  },
];
