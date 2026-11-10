// 파이썬용 힌트·해설·시작 코드 (문제 본문과 채점은 언어와 무관, 여기서 파이썬으로 덧씌운다)
const R = String.raw;
module.exports = {
  'w1-01': {
    starter: R`a, b = map(int, input().split())
# a + b 를 출력해요
`,
    hints: ['`input().split()`은 한 줄을 공백으로 잘라서 글자 목록을 줘요. 각각을 `int(...)`로 바꿔야 계산이 돼요.', '`a, b = map(int, input().split())` 한 줄이면 두 수를 받아요.', '`print(a + b)` 한 줄이면 끝이에요.'],
    editorial: { text: '코테 입력의 가장 기본 형태예요. 한 줄에 여러 수가 오면 `map(int, input().split())`으로 한꺼번에 받아요.', code: R`a, b = map(int, input().split())
print(a + b)` },
  },
  'w1-02': {
    starter: R`# 문장을 출력해요
`,
    hints: ['출력은 `print("...")`예요.', '쉼표, 느낌표, 대소문자, 띄어쓰기까지 예제와 똑같아야 해요.', '`print("Hello, Pokemon Master!")` 한 줄이에요.'],
    editorial: { text: '출력은 한 글자라도 다르면 오답이에요. 복사해서 붙여 넣지 말고 한 글자씩 비교해 보는 습관을 들이면 좋아요.', code: R`print("Hello, Pokemon Master!")` },
  },
  'w1-03': {
    starter: R`a, b = map(int, input().split())
# a / b 를 출력해요
`,
    hints: ['파이썬의 `/`는 정수끼리 나눠도 소수로 나와요. 그냥 나눈 값을 출력하면 돼요.', '`print(a / b)` 만으로도 오차 안에 들어와요.', '자릿수를 정하고 싶으면 `print(f"{a / b:.9f}")`처럼 써요.'],
    editorial: { text: '파이썬 3의 `/`는 항상 소수 나눗셈이에요. 몫만 필요하면 `//`, 나머지는 `%`예요. 이 문제는 오차를 허용하니 자릿수는 신경 쓰지 않아도 돼요.', code: R`a, b = map(int, input().split())
print(f"{a / b:.9f}")` },
  },
  'w1-04': {
    starter: R`y = int(input())
# 윤년이면 1, 아니면 0을 출력해요
`,
    hints: ['조건이 두 덩어리예요. "4의 배수이고 100의 배수가 아님" 또는 "400의 배수".', '파이썬은 `and`, `or`를 써요. 섞을 땐 괄호로 묶어요.', '`print(1 if (y % 4 == 0 and y % 100 != 0) or y % 400 == 0 else 0)`'],
    editorial: { text: '조건식을 문장 그대로 코드로 옮기면 돼요. 100의 배수 예외와 400의 배수 예외를 헷갈리기 쉬워요.', code: R`y = int(input())
if (y % 4 == 0 and y % 100 != 0) or y % 400 == 0:
    print(1)
else:
    print(0)` },
  },
  'w1-05': {
    starter: R`h, m = map(int, input().split())
# 하루 중 몇 분째인지로 바꾸고, 45분을 빼고, 다시 시와 분으로 바꿔요
`,
    hints: ['시각을 "하루 중 몇 분째인지"로 바꾸면 쉬워져요. `h * 60 + m`', '45를 빼서 음수가 되면 하루(1440분)를 더하면 돼요. 파이썬에서는 `% 1440` 한 번으로 끝나요.', '`t // 60`이 시, `t % 60`이 분이에요. `divmod(t, 60)`도 쓸 수 있어요.'],
    editorial: { text: '시간 문제의 정석은 전부 "분 단위 정수"로 바꿔서 계산하고 마지막에 되돌리는 거예요. 파이썬의 `%`는 음수에도 항상 0 이상을 돌려줘서 날짜가 넘어가는 경우가 한 줄로 해결돼요.', code: R`h, m = map(int, input().split())
t = (h * 60 + m - 45) % 1440
print(t // 60, t % 60)` },
  },
  'w1-06': {
    starter: R`n = int(input())
# 1부터 9까지 한 줄씩 출력해요
`,
    hints: ['`for i in range(1, 10):`으로 아홉 번 반복해요. `range`의 끝은 포함되지 않아요.', '출력 형식(공백, `*`, `=`)을 예제와 똑같이 맞춰야 해요.', '`print(f"{n} * {i} = {n * i}")`'],
    editorial: { text: '`for`와 `range`의 기본이에요. f-string을 쓰면 출력 형식을 맞추기 쉬워요.', code: R`n = int(input())
for i in range(1, 10):
    print(f"{n} * {i} = {n * i}")` },
  },
  'w1-07': {
    starter: R`n = int(input())
# i번째 줄에 별을 i개 출력해요
`,
    hints: ['줄마다 별 개수가 1, 2, 3, ... 으로 늘어나요.', '파이썬은 문자열에 수를 곱하면 반복돼요. `"*" * 3`은 `***`예요.', '`for i in range(1, n + 1): print("*" * i)`'],
    editorial: { text: '문자열 곱셈 한 줄로 끝나지만, 이 틀(줄마다 규칙이 달라지는 출력)은 나중에 격자 문제에도 그대로 나와요.', code: R`n = int(input())
for i in range(1, n + 1):
    print("*" * i)` },
  },
  'w1-08': {
    starter: R`n, x = map(int, input().split())
a = list(map(int, input().split()))
# x보다 작은 수만 입력 순서대로 출력해요
`,
    hints: ['목록을 한 번 훑으면서 `x`보다 작은 것만 골라요.', '리스트 컴프리헨션 `[v for v in a if v < x]`이 가장 간단해요.', '여러 값을 한 줄에 출력하려면 `print(*목록)`을 써요.'],
    editorial: { text: '조건에 맞는 것만 골라서 출력하는 패턴이에요. `print(*목록)`은 값을 공백으로 이어서 출력해 줘요.', code: R`n, x = map(int, input().split())
a = list(map(int, input().split()))
print(*[v for v in a if v < x])` },
  },
  'w1-09': {
    starter: R`nums = [int(input()) for _ in range(9)]
# 가장 큰 수와 그 번호(1부터)를 출력해요
`,
    hints: ['`max(nums)`로 최댓값을 구할 수 있어요.', '위치는 `nums.index(값)`으로 찾아요. 0부터 세니까 1을 더해요.', '직접 반복문으로 "지금까지의 최고"를 기억하며 훑는 방법도 알아 둬요. 다른 문제에도 나와요.'],
    editorial: { text: '파이썬 내장 `max`와 `index`로 한 줄에 풀리지만, "지금까지의 최선을 기억하며 훑기"는 내장 함수가 없는 문제에서도 계속 쓰는 패턴이에요.', code: R`nums = [int(input()) for _ in range(9)]
m = max(nums)
print(m)
print(nums.index(m) + 1)` },
  },
  'w1-10': {
    starter: R`n = int(input())
a = list(map(int, input().split()))
# 점수 / 최댓값 * 100 의 평균을 출력해요
`,
    hints: ['먼저 `max(a)`로 최댓값 `M`을 구해요.', '바뀐 점수는 `v / M * 100`이에요. 파이썬은 `/`가 소수 나눗셈이라 그대로 써도 돼요.', '`sum(...) / n`이 평균이에요.'],
    editorial: { text: '(1) 최댓값 (2) 변환해서 합산 (3) 평균, 세 단계로 나눠요. 생성식 `sum(v / m * 100 for v in a)`처럼 한 줄에 쓸 수도 있어요.', code: R`n = int(input())
a = list(map(int, input().split()))
m = max(a)
print(sum(v / m * 100 for v in a) / n)` },
  },
  'w2-01': {
    hints: ['수를 모두 읽어서 리스트에 담아요.', '`sorted(리스트)`는 오름차순으로 정렬한 새 리스트를 돌려줘요.', '한 줄에 하나씩 출력하려면 `print("\\n".join(map(str, 목록)))`이나 반복문을 써요.'],
    editorial: { text: '`sorted`는 `O(N log N)`이에요. 정렬한 뒤 출력하는 것이 코테에서 가장 흔한 형태예요.', code: R`n = int(input())
nums = sorted(int(input()) for _ in range(n))
print("\n".join(map(str, nums)))` },
  },
  'w2-02': {
    hints: ['알고리즘은 앞 문제와 같아요. 달라진 건 입력이 많다는 점이에요.', '입력이 20만 줄이면 `input()`이 느려요. 맨 위에 `import sys`와 `input = sys.stdin.readline`을 넣어요.', '출력도 한 번에 모아서 `sys.stdout.write("\\n".join(...))`처럼 내보내면 빨라요.'],
    editorial: { text: '`sys.stdin.readline`은 `input()`보다 훨씬 빨라서 입력이 많은 문제의 필수 요령이에요. 출력도 줄마다 `print`하지 말고 모아서 한 번에 내보내는 게 좋아요.', code: R`import sys
input = sys.stdin.readline

n = int(input())
nums = sorted(int(input()) for _ in range(n))
sys.stdout.write("\n".join(map(str, nums)) + "\n")` },
  },
  'w2-03': {
    hints: ['중복은 `set`에 넣으면 사라져요.', '`sorted(..., key=...)`에 기준을 줄 수 있어요. 기준이 둘이면 튜플로 묶어요.', '`key=lambda w: (len(w), w)` : 길이 먼저, 같으면 사전 순.'],
    editorial: { text: '정렬 기준이 여러 개면 튜플로 묶어서 `key`에 주면 돼요. 앞 칸이 같을 때만 뒤 칸을 비교해요.', code: R`n = int(input())
words = set(input().strip() for _ in range(n))
for w in sorted(words, key=lambda w: (len(w), w)):
    print(w)` },
  },
  'w2-04': {
    hints: ['나이와 이름을 함께 들고 있어야 해요. 한 줄을 `split()`한 리스트를 그대로 써도 돼요.', '파이썬의 `sort`는 **안정 정렬**이에요. 같은 값의 원래 순서가 유지돼요.', '`key`에 나이만 주면 가입 순서가 자동으로 지켜져요. 나이는 `int`로 바꿔서 비교해야 해요.'],
    editorial: { text: '파이썬의 `sort`/`sorted`는 안정 정렬이라 같은 키끼리는 입력 순서가 그대로 남아요. 키에는 비교할 값(나이)만 주면 돼요.', code: R`n = int(input())
people = [input().split() for _ in range(n)]
people.sort(key=lambda p: int(p[0]))
for age, name in people:
    print(age, name)` },
  },
  'w2-05': {
    hints: ['점 하나를 `(x, y)` 튜플로 만들어요.', '튜플은 앞 칸부터 차례로 비교돼요. 그냥 `sorted`하면 x순, 같으면 y순이에요.', '출력은 `print(x, y)`로 한 줄에 하나씩.'],
    editorial: { text: '튜플이나 리스트는 사전식 비교를 기본으로 해서 별도의 `key` 없이도 원하는 순서로 정렬돼요.', code: R`n = int(input())
pts = sorted(tuple(map(int, input().split())) for _ in range(n))
for x, y in pts:
    print(x, y)` },
  },
  'w2-06': {
    hints: ['파이썬 리스트가 곧 스택이에요. `append`로 넣고 `pop()`으로 꺼내요.', '명령은 `split()`해서 첫 글자로 나눠요. `push`일 때만 두 번째 값이 있어요.', '비어 있는지는 `if st:`(비어 있지 않으면 참)로 확인해요.'],
    editorial: { text: '리스트의 `append`/`pop()`은 둘 다 뒤에서 일어나서 스택으로 쓰기에 딱 맞아요. 빈 리스트에 `pop()`하면 에러가 나니 먼저 확인해요.', code: R`import sys
input = sys.stdin.readline

n = int(input())
st = []
out = []
for _ in range(n):
    cmd = input().split()
    if cmd[0] == "push":
        st.append(int(cmd[1]))
    elif cmd[0] == "pop":
        out.append(st.pop() if st else -1)
    elif cmd[0] == "size":
        out.append(len(st))
    elif cmd[0] == "empty":
        out.append(0 if st else 1)
    else:
        out.append(st[-1] if st else -1)
print("\n".join(map(str, out)))` },
  },
  'w2-07': {
    hints: ['큐는 먼저 넣은 게 먼저 나와요. 리스트의 `pop(0)`은 느리니 `collections.deque`를 써요.', '`from collections import deque`, `q = deque()`, `q.append(x)`, `q.popleft()`', '맨 앞은 `q[0]`, 맨 뒤는 `q[-1]`이에요. 비었는지 먼저 확인해요.'],
    editorial: { text: '`deque`는 양쪽 끝에서 넣고 빼는 게 모두 빨라요. 큐가 필요하면 리스트 말고 `deque`를 쓰는 게 코테의 기본이에요.', code: R`import sys
from collections import deque
input = sys.stdin.readline

n = int(input())
q = deque()
out = []
for _ in range(n):
    cmd = input().split()
    if cmd[0] == "push":
        q.append(int(cmd[1]))
    elif cmd[0] == "pop":
        out.append(q.popleft() if q else -1)
    elif cmd[0] == "size":
        out.append(len(q))
    elif cmd[0] == "empty":
        out.append(0 if q else 1)
    elif cmd[0] == "front":
        out.append(q[0] if q else -1)
    else:
        out.append(q[-1] if q else -1)
print("\n".join(map(str, out)))` },
  },
  'w2-08': {
    hints: ['스택에 `(`를 쌓고 `)`가 나오면 하나 빼는 방법이 정석이에요.', '`)`가 나왔는데 쌓인 게 없으면 바로 `NO`예요.', '끝까지 봤을 때 아무것도 안 남아야 `YES`예요. 사실 숫자 하나만 세어도 풀려요.'],
    editorial: { text: '여는 괄호는 +1, 닫는 괄호는 -1로 세어서 중간에 음수가 되면 실패, 끝에 0이어야 성공이에요. 괄호 종류가 여러 개면 그때는 진짜 스택이 필요해요.', code: R`t = int(input())
for _ in range(t):
    bal = 0
    ok = True
    for ch in input().strip():
        bal += 1 if ch == "(" else -1
        if bal < 0:
            ok = False
            break
    print("YES" if ok and bal == 0 else "NO")` },
  },
  'w2-09': {
    hints: ['수를 넣고, `0`이 나오면 가장 최근 것을 빼는 스택 문제예요.', '리스트의 `append`와 `pop()`을 쓰면 돼요.', '마지막에 `sum(st)`를 출력해요. 파이썬 정수는 아무리 커도 넘치지 않아요.'],
    editorial: { text: '스택의 전형적인 사용이에요. 파이썬은 정수 오버플로가 없어서 합이 커도 걱정하지 않아도 돼요 (C++이나 Java에서는 `long`이 필요한 문제예요).', code: R`import sys
input = sys.stdin.readline

k = int(input())
st = []
for _ in range(k):
    x = int(input())
    if x == 0:
        st.pop()
    else:
        st.append(x)
print(sum(st))` },
  },
  'w2-10': {
    hints: ['목록을 하나씩 훑으면 `N × M`번이라 너무 느려요.', '`set`에 넣어 두면 있는지 확인이 아주 빨라요. `x in s`', '`print(1 if x in s else 0)`처럼 하나씩 출력하거나 모아서 출력해요.'],
    editorial: { text: '"있는지 많이 확인해야 한다"는 신호가 보이면 `set`(또는 `dict`)을 떠올려요. `in` 연산이 평균 `O(1)`이에요.', code: R`import sys
input = sys.stdin.readline

n = int(input())
s = set(input().split())
m = int(input())
queries = input().split()
print("\n".join("1" if q in s else "0" for q in queries))` },
  },
  'w3-01': {
    hints: ['앞에서부터 한 글자씩 보면서, 숫자면 그대로 붙이고 글자면 영단어를 찾아봐요.', '단어 열 개를 리스트에 넣고, 현재 위치에서 `s.startswith(단어, 위치)`가 참인 단어를 찾아요.', '단어를 찾았으면 그 길이만큼 위치를 건너뛰어요. 결과는 문자열로 이어 붙여야 앞의 0이 안 사라져요.'],
    editorial: { text: '문자열을 앞에서 한 번만 훑으면 돼요. 영단어는 서로 구분되기 때문에 현재 위치에서 시작하는 단어가 하나만 맞아요. 결과를 `int`로 만들면 앞의 0이 사라지니 문자열로 이어 붙여요.', code: R`words = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"]
s = input().strip()
out = []
i = 0
while i < len(s):
    if s[i].isdigit():
        out.append(s[i])
        i += 1
        continue
    for d, w in enumerate(words):
        if s.startswith(w, i):
            out.append(str(d))
            i += len(w)
            break
print("".join(out))` },
  },
  'w3-02': {
    hints: ['길이가 50이라 모든 부분 문자열을 검사해도 충분히 빨라요.', '더 똑똑하게: 가운데 글자를 정하고 양쪽으로 한 칸씩 넓혀 가며 같은지 확인해요.', '가운데가 한 글자인 경우(홀수 길이)와 두 글자 사이인 경우(짝수 길이)를 둘 다 해 봐야 해요.'],
    editorial: { text: '팰린드롬은 가운데에서 양쪽으로 같은 글자가 이어지는 모양이에요. 가운데를 정하고 넓히는 방법은 `O(N²)`이에요. 홀수 길이(`aba`)와 짝수 길이(`abba`)는 가운데가 다르니 둘 다 확인해요. (`s == s[::-1]`로 뒤집어 비교하는 방법도 있어요.)', code: R`s = input().strip()
n, best = len(s), 1
for c in range(n):
    for l, r in ((c, c), (c, c + 1)):   # 홀수 / 짝수 길이
        while l >= 0 and r < n and s[l] == s[r]:
            best = max(best, r - l + 1)
            l -= 1
            r += 1
print(best)` },
  },
  'w3-03': {
    hints: ['같은 글자가 이어지는 "구간"을 하나씩 찾아서 처리해요.', '구간의 시작 `i`에서 `j`를 같은 글자인 동안 늘려요. 길이는 `j - i`예요.', '길이가 1이면 글자만, 2 이상이면 글자 뒤에 길이를 붙여요. 마지막 구간도 빠뜨리지 않아요.'],
    editorial: { text: '"같은 글자가 이어지는 구간" 하나를 한 번에 처리하는 패턴이에요. 구간이 끝나는 위치 `j`를 찾고 `i = j`로 점프하면 마지막 구간도 자연스럽게 처리돼요. (`itertools.groupby`로도 풀 수 있어요.)', code: R`s = input().strip()
out = []
i = 0
while i < len(s):
    j = i
    while j < len(s) and s[j] == s[i]:
        j += 1
    out.append(s[i] + (str(j - i) if j - i > 1 else ""))
    i = j
print("".join(out))` },
  },
  'w3-04': {
    hints: ['규칙이 7개지만 **순서대로 한 단계씩** 적용하면 돼요.', '정규식 `re.sub`를 쓰면 2, 3번이 한 줄씩이에요: `re.sub(r"[^a-z0-9_]", "_", s)`, `re.sub(r"_+", "_", s)`', '`strip("_")`으로 양 끝의 `_`를 지우고, 7번은 `while len(s) < 4: s += s[-1]`.'],
    editorial: { text: '여러 규칙을 순서대로 적용하는 구현 문제예요. 규칙 하나를 한 줄 정도의 코드로 옮기고 순서만 지키면 돼요. 6번 다음에 길이가 바뀌므로 7번은 마지막에 해야 해요.', code: R`import re

s = input().strip().lower()
s = re.sub(r"[^a-z0-9_]", "_", s)
s = re.sub(r"_+", "_", s).strip("_")
if not s:
    s = "user"
if len(s) >= 12:
    s = s[:11].rstrip("_")
while len(s) < 4:
    s += s[-1]
print(s)` },
  },
  'w3-05': {
    hints: ['`K`가 최대 10만이라 하루씩 넘겨도 충분히 빨라요.', '파이썬에는 `datetime.date`와 `timedelta`가 있어요. `date(y, m, d) + timedelta(days=k)`', '요일은 `.weekday()`예요. 월요일이 0이에요. 라이브러리 없이 직접 달력을 만들어 보는 것도 좋은 연습이에요.'],
    editorial: { text: '날짜 문제의 핵심은 "달마다 며칠인지"와 "윤년"이에요. 파이썬은 표준 라이브러리가 다 해 주지만, 코테에서 라이브러리가 막혀 있을 때를 위해 직접 구현하는 법(윤년 규칙, 달별 일수)도 알아 두면 좋아요.', code: R`from datetime import date, timedelta

y, m, d, k = map(int, input().split())
t = date(y, m, d) + timedelta(days=k)
names = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"]
print(f"{t.year:04d}-{t.month:02d}-{t.day:02d} {names[t.weekday()]}")` },
  },
  'w3-06': {
    hints: ['방향을 `N E S W` 순서로 0, 1, 2, 3으로 두면 오른쪽 회전은 `+1`, 왼쪽은 `-1`이에요. 파이썬은 `% 4`가 음수에도 잘 동작해요.', '방향마다 행·열이 얼마씩 변하는지 `dr = [-1, 0, 1, 0]`, `dc = [0, 1, 0, -1]`로 적어 둬요.', '`F`는 **먼저 다음 칸을 계산**하고, 격자 안이고 벽이 아닐 때만 실제로 움직여요.'],
    editorial: { text: '격자 시뮬레이션의 기본 틀이에요. 방향을 번호로 바꾸고 `dr`, `dc` 리스트로 이동량을 관리하면 `if`가 길게 늘어나지 않아요. "움직이기 전에 갈 수 있는지 먼저 확인"하는 습관은 모든 격자 문제에 계속 써요.', code: R`n, m = map(int, input().split())
g = [input().strip() for _ in range(n)]
r, c, d = input().split()
r, c = int(r) - 1, int(c) - 1
cmd = input().strip()

dirs = "NESW"
dr = [-1, 0, 1, 0]
dc = [0, 1, 0, -1]
k = dirs.index(d)
for x in cmd:
    if x == "L":
        k = (k - 1) % 4
    elif x == "R":
        k = (k + 1) % 4
    else:
        nr, nc = r + dr[k], c + dc[k]
        if 0 <= nr < n and 0 <= nc < m and g[nr][nc] != "#":
            r, c = nr, nc
print(r + 1, c + 1, dirs[k])` },
  },
  'w3-07': {
    hints: ['`K`가 10억이라 그대로 돌리면 느려요. 4번 돌리면 제자리니까 `K % 4`번만 돌려요.', '시계 방향 90도: 맨 아래 줄이 새 첫 열이 돼요. `zip(*a[::-1])`이 그 일을 해요.', '`a = [list(row) for row in zip(*a[::-1])]`를 `K % 4`번 반복해요.'],
    editorial: { text: '두 가지 포인트예요. 같은 동작을 4번 하면 제자리라서 `K % 4`만 하면 돼요 (큰 `K`를 줄이는 대표 패턴). 그리고 `zip(*a[::-1])`은 표를 시계 방향으로 돌리는 파이썬의 관용구예요.', code: R`n, m, k = map(int, input().split())
a = [input().split() for _ in range(n)]
for _ in range(k % 4):
    a = [list(row) for row in zip(*a[::-1])]
print("\n".join(" ".join(row) for row in a))` },
  },
  'w3-08': {
    hints: ['버튼을 `(행, 열)` 좌표로 바꿔 두면 거리 계산이 쉬워요. 숫자 `d`(1~9)는 행이 `(d-1)//3`, 열이 `(d-1)%3`이에요.', '두 팔의 현재 위치를 변수 두 개로 들고 있다가 숫자를 누를 때마다 갱신해요.', '`2, 5, 8, 0`일 때만 거리를 비교해요. 거리가 같을 때만 우선 팔을 써요.'],
    editorial: { text: '상태(두 팔의 위치)를 들고 있으면서 입력을 하나씩 처리하는 전형적인 시뮬레이션이에요. 번호를 좌표로 바꾸는 규칙을 먼저 정리해 두면 거리 계산과 "누구 차례인지" 판단이 단순해져요.', code: R`s = input().strip()
pref = input().strip()

pos = {"S": (3, 0), "0": (3, 1), "E": (3, 2)}
for d in range(1, 10):
    pos[str(d)] = ((d - 1) // 3, (d - 1) % 3)

left, right = pos["S"], pos["E"]
out = []
for ch in s:
    p = pos[ch]
    if ch in "147":
        use = "L"
    elif ch in "369":
        use = "R"
    else:
        dl = abs(left[0] - p[0]) + abs(left[1] - p[1])
        dr = abs(right[0] - p[0]) + abs(right[1] - p[1])
        use = "L" if dl < dr else "R" if dr < dl else pref
    if use == "L":
        left = p
    else:
        right = p
    out.append(use)
print("".join(out))` },
  },
  'w3-09': {
    hints: ['방향은 오른쪽 → 아래 → 왼쪽 → 위쪽 순서로 계속 돌아요. `dr = [0, 1, 0, -1]`, `dc = [1, 0, -1, 0]`', '한 칸 채운 뒤에 같은 방향으로 한 칸 더 가 보고, 격자 밖이거나 이미 채워진 칸이면 방향을 `(k + 1) % 4`로 바꿔요.', '`N`이나 `M`이 1이어도 같은 코드로 돼요. 범위 검사를 먼저 해요.'],
    editorial: { text: '"끝까지 가다가 막히면 방향을 바꾼다"는 규칙을 그대로 코드로 옮기는 문제예요. 방향 리스트와 "막혔는지" 검사(범위 + 이미 채움)를 나누면 깔끔해요. 같은 틀이 달팽이, 배열 껍질 돌리기, 로봇 청소기에 계속 나와요.', code: R`n, m = map(int, input().split())
a = [[0] * m for _ in range(n)]      # [[0] * m] * n 은 같은 줄을 공유하니 쓰지 않아요
dr = [0, 1, 0, -1]
dc = [1, 0, -1, 0]
r = c = k = 0
for v in range(1, n * m + 1):
    a[r][c] = v
    nr, nc = r + dr[k], c + dc[k]
    if not (0 <= nr < n and 0 <= nc < m) or a[nr][nc]:
        k = (k + 1) % 4
        nr, nc = r + dr[k], c + dc[k]
    r, c = nr, nc
print("\n".join(" ".join(map(str, row)) for row in a))` },
  },
  'w3-10': {
    hints: ['수식을 `+`, `-`로 잘랐을 때 나오는 덩어리마다 안에는 곱셈만 있어요. 이 덩어리를 **항**이라고 불러요.', '앞에서부터 읽으면서 부호를 기억해 두고, `*`로 이어진 수들을 곱해서 하나의 항 값으로 만든 뒤 부호에 맞춰 더하거나 빼요.', '정규식 `re.findall(r"([+-]?)(\\d+(?:\\*\\d+)*)", s)`로 (부호, 항)을 한 번에 뽑을 수도 있어요.'],
    editorial: { text: '수식 파싱의 가장 기본 틀이에요. "수식 = 항들의 합과 차, 항 = 수들의 곱"으로 구조를 나누면 곱셈 우선 규칙이 자연스럽게 해결돼요. 괄호가 있으면 이 구조가 재귀로 확장돼요 (더 어려운 문제).', code: R`import re

s = input().strip()
total = 0
for sign, term in re.findall(r"([+-]?)(\d+(?:\*\d+)*)", s):
    prod = 1
    for x in term.split("*"):
        prod *= int(x)
    total += -prod if sign == "-" else prod
print(total)` },
  },
};
