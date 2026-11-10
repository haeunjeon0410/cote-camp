// 2주차 · 잔물결항구: STL 기본, 정렬, 스택·큐
const { rng, nums, lines } = require('./util');

const words = (r, n, maxLen, alpha = 'abcdefghij') =>
  Array.from({ length: n }, () => Array.from({ length: r.int(1, maxLen) }, () => alpha[r.int(0, alpha.length - 1)]).join(''));

function cmdInput(cmds) { return `${cmds.length}\n${cmds.join('\n')}\n`; }

module.exports = [
  {
    id: 'w2-01', title: '수 정렬하기', tags: ['정렬', 'vector'], limit: 1000,
    statement: '`N`개의 수가 주어질 때, 오름차순으로 정렬해서 한 줄에 하나씩 출력해요.',
    input: '첫째 줄에 `N`이 주어집니다. (1 ≤ N ≤ 1000)\n둘째 줄부터 `N`개의 줄에 수가 하나씩 주어집니다. 수의 절댓값은 1000 이하이며 중복이 있을 수 있습니다.',
    output: '정렬한 수를 한 줄에 하나씩 출력합니다.',
    examples: ['5\n5\n2\n3\n4\n1\n'],
    gen: () => {
      const r = rng(201);
      const t = ['1\n7\n', '3\n-1\n-1\n-1\n'];
      for (let i = 0; i < 8; i++) {
        const n = r.int(1, 1000);
        t.push(`${n}\n${Array.from({ length: n }, () => r.int(-1000, 1000)).join('\n')}\n`);
      }
      return t;
    },
    solve: inp => { const [n, ...a] = nums(inp); return a.slice(0, n).sort((x, y) => x - y).join('\n') + '\n'; },
    hints: [
      '`vector<int>`에 값을 담고 `sort`를 쓰면 돼요. `#include <algorithm>`',
      '`sort(v.begin(), v.end());`',
      '출력은 `for (int x : v) cout << x << "\\n";`',
    ],
    editorial: {
      text: 'STL `sort`는 평균 `O(N log N)`이에요. `vector`와 같이 쓰는 게 가장 흔한 형태예요.',
      code: String.raw`#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    int n;
    cin >> n;
    vector<int> v(n);
    for (auto& x : v) cin >> x;
    sort(v.begin(), v.end());
    for (int x : v) cout << x << "\n";
    return 0;
}`,
    },
  },
  {
    id: 'w2-02', title: '아주 많은 수 정렬하기', tags: ['정렬', '빠른 입출력'], limit: 1000,
    statement: '수가 많이 주어져도 시간 안에 정렬해야 합니다. 입출력이 느리면 시간 초과가 날 수 있어요.\n\n`N`개의 수를 오름차순으로 정렬해서 한 줄에 하나씩 출력해요.',
    input: '첫째 줄에 `N`이 주어집니다. (1 ≤ N ≤ 200000)\n둘째 줄부터 `N`개의 줄에 수가 하나씩 주어집니다. 수의 절댓값은 1000000 이하이며 중복이 있을 수 있습니다.',
    output: '정렬한 수를 한 줄에 하나씩 출력합니다.',
    examples: ['5\n5\n2\n3\n4\n1\n'],
    gen: () => {
      const r = rng(202);
      const t = [];
      for (const n of [10, 1000, 50000, 200000]) {
        t.push(`${n}\n${Array.from({ length: n }, () => r.int(-1000000, 1000000)).join('\n')}\n`);
      }
      return t;
    },
    solve: inp => { const [n, ...a] = nums(inp); return a.slice(0, n).sort((x, y) => x - y).join('\n') + '\n'; },
    hints: [
      '알고리즘은 앞 문제와 같아요. 달라진 건 입출력 속도예요.',
      '`main` 맨 앞에 `ios::sync_with_stdio(false); cin.tie(NULL);` 을 넣어요.',
      '출력할 때 `endl`은 매번 버퍼를 비워서 느려요. `"\\n"`을 써요.',
    ],
    editorial: {
      text: '`ios::sync_with_stdio(false); cin.tie(NULL);`은 C++ 코딩 테스트의 필수 주문이에요. 입출력이 많은 문제에서는 항상 맨 위에 넣고, `endl` 대신 `"\\n"`을 써요. 단, 이 옵션을 쓴 뒤에는 `scanf`/`printf`와 섞어 쓰면 안 돼요.',
      code: String.raw`#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(NULL);
    int n;
    cin >> n;
    vector<int> v(n);
    for (auto& x : v) cin >> x;
    sort(v.begin(), v.end());
    for (int x : v) cout << x << "\n";
    return 0;
}`,
    },
  },
  {
    id: 'w2-03', title: '단어 정렬', tags: ['정렬', '문자열', '비교 함수'], limit: 1000,
    statement: '알파벳 소문자로 이루어진 단어 `N`개가 주어집니다. 다음 조건으로 정렬해요.\n\n1. 길이가 짧은 것부터\n2. 길이가 같으면 사전 순으로\n\n단, 같은 단어가 여러 번 있으면 한 번만 출력합니다.',
    input: '첫째 줄에 `N`이 주어집니다. (1 ≤ N ≤ 20000)\n둘째 줄부터 `N`개의 줄에 단어가 하나씩 주어집니다. 단어의 길이는 50을 넘지 않습니다.',
    output: '조건에 따라 정렬한 단어를 한 줄에 하나씩 출력합니다.',
    examples: ['13\nbut\ni\nwont\nhesitate\nno\nmore\nno\nmore\nit\ncannot\nwait\nim\nyours\n'],
    gen: () => {
      const r = rng(203);
      const t = ['1\na\n', '3\nb\na\nb\n'];
      for (const [n, ml, al] of [[50, 5, 'abc'], [2000, 8, 'abcdefg'], [20000, 50, 'abcdefghijklmnopqrstuvwxyz'], [20000, 3, 'abcdefg']]) {
        t.push(`${n}\n${words(r, n, ml, al).join('\n')}\n`);
      }
      return t;
    },
    solve: inp => {
      const [, ...w] = lines(inp).filter(Boolean);
      const u = [...new Set(w)];
      u.sort((a, b) => a.length - b.length || (a < b ? -1 : a > b ? 1 : 0));
      return u.join('\n') + '\n';
    },
    hints: [
      '중복 제거는 `set<string>`이나 정렬 후 `unique`로 할 수 있어요.',
      '`sort`의 세 번째 인자로 비교 함수를 줄 수 있어요.',
      '`a.size() != b.size()`면 길이로, 같으면 `a < b`로 비교해요.',
    ],
    editorial: {
      text: '비교 함수는 "`a`가 `b`보다 앞에 와야 하면 `true`"를 돌려줘요. 두 기준이 있을 땐 첫 기준이 다를 때만 그걸로, 같으면 두 번째 기준으로 결정해요.',
      code: String.raw`#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
using namespace std;

bool cmp(const string& a, const string& b) {
    if (a.size() != b.size()) return a.size() < b.size();
    return a < b;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(NULL);
    int n;
    cin >> n;
    vector<string> w(n);
    for (auto& s : w) cin >> s;
    sort(w.begin(), w.end(), cmp);
    w.erase(unique(w.begin(), w.end()), w.end());
    for (auto& s : w) cout << s << "\n";
    return 0;
}`,
    },
  },
  {
    id: 'w2-04', title: '나이순 정렬', tags: ['정렬', 'pair', '안정 정렬'], limit: 1000,
    statement: '온라인 저지 회원 `N`명의 나이와 이름이 가입한 순서대로 주어집니다. 나이가 증가하는 순서로, 나이가 같으면 먼저 가입한 사람이 앞에 오도록 정렬해 출력해요.',
    input: '첫째 줄에 회원 수 `N`이 주어집니다. (1 ≤ N ≤ 100000)\n둘째 줄부터 `N`개의 줄에 나이와 이름이 공백으로 구분되어 가입한 순서대로 주어집니다. 나이는 1 이상 200 이하의 정수, 이름은 알파벳 대소문자로 이루어진 길이 100 이하의 문자열입니다.',
    output: '정렬한 결과를 한 줄에 한 명씩 `나이 이름` 형식으로 출력합니다.',
    examples: ['3\n21 Junkyu\n21 Dohyun\n20 Sunyoung\n'],
    gen: () => {
      const r = rng(204);
      const t = ['1\n1 A\n'];
      for (const n of [20, 1000, 100000]) {
        const ws = words(r, n, 10, 'abcdefghijklmnopqrstuvwxyz');
        t.push(`${n}\n${ws.map(w => `${r.int(1, n > 100 ? 200 : 5)} ${w}`).join('\n')}\n`);
      }
      return t;
    },
    solve: inp => {
      const [, ...l] = lines(inp).filter(Boolean);
      const m = l.map((s, i) => { const [a, n] = s.split(' '); return { a: +a, n, i }; });
      m.sort((x, y) => x.a - y.a || x.i - y.i);
      return m.map(x => `${x.a} ${x.n}`).join('\n') + '\n';
    },
    hints: [
      '`pair<int,string>`이나 구조체로 나이와 이름을 묶어요.',
      '`sort`는 같은 값의 순서를 보장하지 않아요. `stable_sort`를 쓰거나 입력 순번을 같이 저장해요.',
      '`stable_sort`로 나이만 비교하면 가입 순서가 유지돼요.',
    ],
    editorial: {
      text: '`sort`는 불안정 정렬이라 같은 키의 원래 순서가 바뀔 수 있어요. 원래 순서를 지켜야 하면 `stable_sort`를 쓰거나, 입력 순번을 보조 키로 넣어요.',
      code: String.raw`#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(NULL);
    int n;
    cin >> n;
    vector<pair<int, string>> m(n);
    for (auto& p : m) cin >> p.first >> p.second;
    stable_sort(m.begin(), m.end(), [](const auto& a, const auto& b) {
        return a.first < b.first;
    });
    for (auto& p : m) cout << p.first << " " << p.second << "\n";
    return 0;
}`,
    },
  },
  {
    id: 'w2-05', title: '좌표 정렬하기', tags: ['정렬', 'pair'], limit: 1000,
    statement: '2차원 평면 위의 점 `N`개가 주어집니다. `x`좌표가 증가하는 순으로, `x`좌표가 같으면 `y`좌표가 증가하는 순으로 정렬해서 출력해요.',
    input: '첫째 줄에 점의 개수 `N`이 주어집니다. (1 ≤ N ≤ 100000)\n둘째 줄부터 `N`개의 줄에 `x`와 `y`가 공백으로 구분되어 주어집니다. (-100000 ≤ x, y ≤ 100000) 같은 점은 주어지지 않습니다.',
    output: '정렬한 점을 한 줄에 하나씩 `x y` 형식으로 출력합니다.',
    examples: ['5\n3 4\n1 1\n1 -1\n2 2\n3 3\n'],
    gen: () => {
      const r = rng(205);
      const t = ['1\n0 0\n'];
      for (const [n, range] of [[30, 5], [1000, 30], [100000, 100000]]) {
        const seen = new Set(), pts = [];
        while (pts.length < n) {
          const x = r.int(-range, range), y = r.int(-range, range), k = `${x} ${y}`;
          if (!seen.has(k)) { seen.add(k); pts.push(k); }
        }
        t.push(`${n}\n${pts.join('\n')}\n`);
      }
      return t;
    },
    solve: inp => {
      const [, ...a] = lines(inp).filter(Boolean);
      const p = a.map(s => s.split(' ').map(Number));
      p.sort((u, v) => u[0] - v[0] || u[1] - v[1]);
      return p.map(q => `${q[0]} ${q[1]}`).join('\n') + '\n';
    },
    hints: [
      '점 하나를 `pair<int,int>`로 표현해 봐요.',
      '`pair`는 기본 비교가 "첫째 값, 같으면 둘째 값" 순서라서 그냥 `sort` 해도 돼요.',
      '출력은 `p.first`, `p.second`를 사용해요.',
    ],
    editorial: {
      text: '`pair`나 `tuple`의 기본 비교 연산이 사전식(lexicographic)이라는 걸 알면 비교 함수를 짤 필요가 없어요.',
      code: String.raw`#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(NULL);
    int n;
    cin >> n;
    vector<pair<int, int>> p(n);
    for (auto& q : p) cin >> q.first >> q.second;
    sort(p.begin(), p.end());
    for (auto& q : p) cout << q.first << " " << q.second << "\n";
    return 0;
}`,
    },
  },
  {
    id: 'w2-06', title: '스택 만들기', tags: ['스택', 'stack', '명령 처리'], limit: 1000,
    statement: '정수를 저장하는 스택을 구현하고, 입력으로 주어지는 명령을 처리해요. 명령은 다섯 가지입니다.\n\n- `push X`: 정수 `X`를 스택에 넣습니다.\n- `pop`: 맨 위의 정수를 빼고 그 수를 출력합니다. 스택이 비어 있으면 `-1`을 출력합니다.\n- `size`: 스택에 들어 있는 정수의 개수를 출력합니다.\n- `empty`: 스택이 비어 있으면 `1`, 아니면 `0`을 출력합니다.\n- `top`: 맨 위의 정수를 출력합니다. 스택이 비어 있으면 `-1`을 출력합니다.',
    input: '첫째 줄에 명령의 수 `N`이 주어집니다. (1 ≤ N ≤ 10000)\n둘째 줄부터 `N`개의 줄에 명령이 하나씩 주어집니다. `push`로 넣는 수는 1 이상 100000 이하입니다.',
    output: '출력해야 하는 명령이 주어질 때마다 한 줄에 하나씩 출력합니다.',
    examples: ['7\npush 1\npush 2\ntop\nsize\npop\npop\npop\n'],
    gen: () => {
      const r = rng(206);
      const t = ['1\npop\n', '3\nempty\ntop\nsize\n'];
      for (const [n, pushRate] of [[30, 0.5], [1000, 0.5], [10000, 0.6], [10000, 0.35]]) {
        const c = [];
        for (let i = 0; i < n; i++) {
          const x = r.next();
          c.push(x < pushRate ? `push ${r.int(1, 100000)}` : r.pick(['pop', 'pop', 'size', 'empty', 'top']));
        }
        t.push(cmdInput(c));
      }
      return t;
    },
    solve: inp => {
      const [, ...c] = lines(inp).filter(Boolean);
      const st = [], out = [];
      for (const s of c) {
        const [op, x] = s.split(' ');
        if (op === 'push') st.push(+x);
        else if (op === 'pop') out.push(st.length ? st.pop() : -1);
        else if (op === 'size') out.push(st.length);
        else if (op === 'empty') out.push(st.length ? 0 : 1);
        else out.push(st.length ? st[st.length - 1] : -1);
      }
      return out.join('\n') + (out.length ? '\n' : '');
    },
    hints: [
      '`#include <stack>`을 하고 `stack<int> st;`를 선언해요.',
      '명령은 문자열로 읽어서 `if (cmd == "push")` 처럼 나눠요. `push`일 때만 정수를 하나 더 읽어요.',
      '`pop`과 `top`은 비어 있을 때 호출하면 위험해요. 먼저 `st.empty()`를 확인해요. `pop()`은 값을 돌려주지 않으니 `top()`으로 먼저 읽어요.',
    ],
    editorial: {
      text: 'STL `stack`의 `pop()`은 값을 돌려주지 않고 그냥 버려요. 값을 쓰려면 `top()`으로 읽은 뒤 `pop()` 해요. 비어 있는 스택에 `top()`/`pop()`을 쓰면 런타임 에러가 나요.',
      code: String.raw`#include <iostream>
#include <stack>
#include <string>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(NULL);
    int n;
    cin >> n;
    stack<int> st;
    while (n--) {
        string cmd;
        cin >> cmd;
        if (cmd == "push") {
            int x;
            cin >> x;
            st.push(x);
        } else if (cmd == "pop") {
            if (st.empty()) cout << -1 << "\n";
            else { cout << st.top() << "\n"; st.pop(); }
        } else if (cmd == "size") {
            cout << st.size() << "\n";
        } else if (cmd == "empty") {
            cout << (st.empty() ? 1 : 0) << "\n";
        } else {
            cout << (st.empty() ? -1 : st.top()) << "\n";
        }
    }
    return 0;
}`,
    },
  },
  {
    id: 'w2-07', title: '큐 만들기', tags: ['큐', 'queue', '명령 처리'], limit: 1000,
    statement: '정수를 저장하는 큐를 구현하고, 입력으로 주어지는 명령을 처리해요. 명령은 여섯 가지입니다.\n\n- `push X`: 정수 `X`를 큐의 뒤에 넣습니다.\n- `pop`: 큐의 앞에서 정수를 빼고 그 수를 출력합니다. 큐가 비어 있으면 `-1`을 출력합니다.\n- `size`: 큐에 들어 있는 정수의 개수를 출력합니다.\n- `empty`: 큐가 비어 있으면 `1`, 아니면 `0`을 출력합니다.\n- `front`: 큐의 가장 앞 정수를 출력합니다. 비어 있으면 `-1`을 출력합니다.\n- `back`: 큐의 가장 뒤 정수를 출력합니다. 비어 있으면 `-1`을 출력합니다.',
    input: '첫째 줄에 명령의 수 `N`이 주어집니다. (1 ≤ N ≤ 10000)\n둘째 줄부터 `N`개의 줄에 명령이 하나씩 주어집니다. `push`로 넣는 수는 1 이상 100000 이하입니다.',
    output: '출력해야 하는 명령이 주어질 때마다 한 줄에 하나씩 출력합니다.',
    examples: ['6\npush 1\npush 2\nfront\nback\nsize\nempty\n'],
    gen: () => {
      const r = rng(207);
      const t = ['1\nfront\n', '3\nback\npop\nempty\n'];
      for (const [n, pushRate] of [[30, 0.5], [1000, 0.5], [10000, 0.6], [10000, 0.35]]) {
        const c = [];
        for (let i = 0; i < n; i++) {
          c.push(r.next() < pushRate ? `push ${r.int(1, 100000)}` : r.pick(['pop', 'pop', 'size', 'empty', 'front', 'back']));
        }
        t.push(cmdInput(c));
      }
      return t;
    },
    solve: inp => {
      const [, ...c] = lines(inp).filter(Boolean);
      const q = [], out = [];
      for (const s of c) {
        const [op, x] = s.split(' ');
        if (op === 'push') q.push(+x);
        else if (op === 'pop') out.push(q.length ? q.shift() : -1);
        else if (op === 'size') out.push(q.length);
        else if (op === 'empty') out.push(q.length ? 0 : 1);
        else if (op === 'front') out.push(q.length ? q[0] : -1);
        else out.push(q.length ? q[q.length - 1] : -1);
      }
      return out.join('\n') + (out.length ? '\n' : '');
    },
    hints: [
      '`#include <queue>`를 하고 `queue<int> q;`를 선언해요.',
      '스택과 똑같이 `empty()`를 먼저 확인해요. 큐는 `front()`와 `back()`이 있어요.',
      '`pop` 명령은 `front()`로 값을 읽고 `pop()`으로 지워요.',
    ],
    editorial: {
      text: '스택 문제와 거의 같아요. 큐는 먼저 들어간 게 먼저 나오는(FIFO) 구조라 `front()`, `back()`을 모두 쓸 수 있어요.',
      code: String.raw`#include <iostream>
#include <queue>
#include <string>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(NULL);
    int n;
    cin >> n;
    queue<int> q;
    while (n--) {
        string cmd;
        cin >> cmd;
        if (cmd == "push") {
            int x;
            cin >> x;
            q.push(x);
        } else if (cmd == "pop") {
            if (q.empty()) cout << -1 << "\n";
            else { cout << q.front() << "\n"; q.pop(); }
        } else if (cmd == "size") {
            cout << q.size() << "\n";
        } else if (cmd == "empty") {
            cout << (q.empty() ? 1 : 0) << "\n";
        } else if (cmd == "front") {
            cout << (q.empty() ? -1 : q.front()) << "\n";
        } else {
            cout << (q.empty() ? -1 : q.back()) << "\n";
        }
    }
    return 0;
}`,
    },
  },
  {
    id: 'w2-08', title: '올바른 괄호', tags: ['스택', '문자열'], limit: 1000,
    statement: '괄호 문자열이 올바른지 판별해요. `(`와 `)`로만 이루어진 문자열이 다음 조건을 만족하면 올바른 괄호 문자열입니다.\n\n- 모든 `(`에 짝이 되는 `)`가 뒤에 있고, 반대로 모든 `)`에도 앞에 짝이 되는 `(`가 있어야 합니다.\n\n예를 들어 `(())()`는 올바르고, `(()(`나 `())`는 올바르지 않습니다.',
    input: '첫째 줄에 테스트 케이스의 수 `T`가 주어집니다. (1 ≤ T ≤ 50)\n각 테스트 케이스는 한 줄에 괄호 문자열 하나이며, 길이는 2 이상 50 이하입니다.',
    output: '각 문자열이 올바르면 `YES`, 아니면 `NO`를 한 줄에 하나씩 출력합니다.',
    examples: ['6\n(())())\n(((()())()\n(()())((()))\n((()()(()))(((())))()\n()()()()(()()())()\n(()((())()(\n'],
    gen: () => {
      const r = rng(208);
      const bal = (n) => { let s = '', open = 0, left = n; while (left > 0 || open > 0) { if (left > 0 && (open === 0 || r.next() < 0.5)) { s += '('; open++; left--; } else { s += ')'; open--; } } return s; };
      const t = ['2\n()\n)(\n'];
      for (let k = 0; k < 6; k++) {
        const c = [];
        for (let i = 0; i < 50; i++) {
          let s = bal(r.int(1, 25));
          if (r.next() < 0.5) { const a = s.split(''); a[r.int(0, a.length - 1)] = r.pick(['(', ')']); s = a.join(''); }
          if (s.length < 2) s = '()';
          c.push(s);
        }
        t.push(`${c.length}\n${c.join('\n')}\n`);
      }
      return t;
    },
    solve: inp => {
      const [, ...c] = lines(inp).filter(Boolean);
      return c.map(s => {
        let d = 0;
        for (const ch of s) { d += ch === '(' ? 1 : -1; if (d < 0) return 'NO'; }
        return d === 0 ? 'YES' : 'NO';
      }).join('\n') + '\n';
    },
    hints: [
      '스택에 `(`를 넣고 `)`가 나오면 하나 빼는 방식이 정석이에요.',
      '`)`가 나왔는데 스택이 비어 있으면 바로 `NO`예요.',
      '끝까지 봤을 때 스택이 비어 있어야 `YES`예요. 사실 스택 대신 숫자 하나만 세어도 풀려요.',
    ],
    editorial: {
      text: '여는 괄호는 +1, 닫는 괄호는 -1로 세어서 중간에 음수가 되면 바로 실패, 끝에 0이어야 성공이에요. 종류가 여러 개인 괄호(`()[]{}`)가 나오면 그때는 진짜 스택이 필요해요.',
      code: String.raw`#include <iostream>
#include <string>
using namespace std;

int main() {
    int t;
    cin >> t;
    while (t--) {
        string s;
        cin >> s;
        int depth = 0;
        bool ok = true;
        for (char c : s) {
            depth += (c == '(') ? 1 : -1;
            if (depth < 0) { ok = false; break; }
        }
        cout << (ok && depth == 0 ? "YES" : "NO") << "\n";
    }
    return 0;
}`,
    },
  },
  {
    id: 'w2-09', title: '제로', tags: ['스택', 'long long'], limit: 1000,
    statement: '재민이는 가계부를 쓰다가 실수하면 `0`을 외쳐서 가장 최근에 쓴 수를 지웁니다. 재민이가 부른 수가 순서대로 `K`개 주어질 때, 최종적으로 남은 수들의 합을 구해요.\n\n`0`이 나오면 가장 최근에 쓴 수 하나를 지웁니다. 지울 수가 없는 경우는 입력에 주어지지 않습니다.',
    input: '첫째 줄에 정수 `K`가 주어집니다. (1 ≤ K ≤ 100000)\n이후 `K`개의 줄에 정수가 한 줄에 하나씩 주어집니다. 정수는 0 이상 1000000 이하이며, 정수가 0일 때는 지울 수가 있는 상태입니다.',
    output: '최종적으로 남은 수의 합을 출력합니다.',
    examples: ['4\n3\n0\n4\n0\n', '10\n1\n3\n5\n4\n0\n0\n7\n0\n0\n6\n'],
    gen: () => {
      const r = rng(209);
      const t = ['1\n5\n'];
      for (const [k, zeroRate] of [[20, 0.3], [1000, 0.3], [100000, 0.1], [100000, 0.02]]) {
        const a = []; let cnt = 0;
        for (let i = 0; i < k; i++) {
          if (cnt > 0 && r.next() < zeroRate) { a.push(0); cnt--; } else { a.push(r.int(1, 1000000)); cnt++; }
        }
        t.push(`${k}\n${a.join('\n')}\n`);
      }
      return t;
    },
    solve: inp => {
      const [k, ...a] = nums(inp);
      const st = [];
      for (const v of a.slice(0, k)) { if (v === 0) st.pop(); else st.push(v); }
      return `${st.reduce((x, y) => x + y, 0)}\n`;
    },
    hints: [
      '수를 넣고, `0`이 나오면 맨 위를 빼는 전형적인 스택 문제예요.',
      '`vector`도 `push_back`, `pop_back`이 있어서 스택처럼 쓸 수 있어요.',
      '합이 최대 `100000 × 1000000 = 10^11` 이라 `int`로는 넘쳐요. `long long`을 써요.',
    ],
    editorial: {
      text: '이 문제의 진짜 함정은 합의 크기예요. 입력 하나하나는 `int`에 들어가도 합은 `int` 범위(약 21억)를 넘을 수 있어요. 합을 구할 땐 처음부터 `long long`으로 선언하는 습관을 들여요.',
      code: String.raw`#include <iostream>
#include <vector>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(NULL);
    int k;
    cin >> k;
    vector<int> st;
    while (k--) {
        int v;
        cin >> v;
        if (v == 0) st.pop_back();
        else st.push_back(v);
    }
    long long sum = 0;
    for (int v : st) sum += v;
    cout << sum << "\n";
    return 0;
}`,
    },
  },
  {
    id: 'w2-10', title: '수 찾기', tags: ['정렬', '이분탐색', 'set'], limit: 1000,
    statement: '`N`개의 정수가 들어 있는 목록이 있습니다. 이어서 `M`개의 정수가 주어지는데, 각각이 목록에 있으면 `1`, 없으면 `0`을 출력해요.\n\n하나씩 목록을 처음부터 훑으면 `N × M`번 비교해야 해서 시간 초과가 납니다.',
    input: '첫째 줄에 `N`이 주어집니다. (1 ≤ N ≤ 100000)\n둘째 줄에 목록의 `N`개 정수가 주어집니다.\n셋째 줄에 `M`이 주어집니다. (1 ≤ M ≤ 100000)\n넷째 줄에 찾을 `M`개의 정수가 주어집니다.\n모든 정수의 절댓값은 10억 이하입니다.',
    output: '`M`개의 줄에 각 수가 목록에 있으면 `1`, 없으면 `0`을 출력합니다.',
    examples: ['5\n4 1 5 2 3\n5\n1 3 7 9 5\n'],
    gen: () => {
      const r = rng(210);
      const t = ['1\n1\n1\n2\n'];
      for (const [n, m, range] of [[20, 20, 30], [1000, 1000, 2000], [100000, 100000, 1000000000], [100000, 100000, 150000]]) {
        const a = Array.from({ length: n }, () => r.int(-range, range));
        const q = Array.from({ length: m }, () => (r.next() < 0.5 ? a[r.int(0, n - 1)] : r.int(-range, range)));
        t.push(`${n}\n${a.join(' ')}\n${m}\n${q.join(' ')}\n`);
      }
      return t;
    },
    solve: inp => {
      const v = nums(inp);
      const n = v[0], a = new Set(v.slice(1, 1 + n)), m = v[1 + n];
      return v.slice(2 + n, 2 + n + m).map(x => (a.has(x) ? 1 : 0)).join('\n') + '\n';
    },
    hints: [
      '목록을 먼저 정렬해 두면 이분탐색으로 `O(log N)`에 찾을 수 있어요.',
      '`#include <algorithm>`의 `binary_search(v.begin(), v.end(), x)`가 바로 그 함수예요.',
      '정렬 후 `binary_search`가 가장 간단해요. `set`이나 `unordered_set`에 넣고 `count`/`find`로 찾아도 돼요.',
    ],
    editorial: {
      text: '"많이 찾아야 한다"는 신호가 보이면 정렬 + 이분탐색, 또는 해시/집합을 떠올려요. `binary_search`는 정렬된 범위에서만 올바르게 동작해요. 정렬을 잊으면 틀려요.',
      code: String.raw`#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(NULL);
    int n;
    cin >> n;
    vector<int> a(n);
    for (auto& x : a) cin >> x;
    sort(a.begin(), a.end());
    int m;
    cin >> m;
    while (m--) {
        int x;
        cin >> x;
        cout << (binary_search(a.begin(), a.end(), x) ? 1 : 0) << "\n";
    }
    return 0;
}`,
    },
  },
];
