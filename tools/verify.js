// 검증: 문제마다 따로 쓴 파이썬 풀이를 채점기에 제출해서 모두 AC가 나오는지 확인한다
// (기준 풀이 solve 와 완전히 독립적으로 작성한 코드라서, 정답 계산 실수를 잡아낸다)
const { build } = require('../problems');
const { detect, judge } = require('../judge');

const READ = 'import sys\nd=sys.stdin.read().split("\\n")\n';
const PY = {
  'w1-01': 'a,b=map(int,input().split())\nprint(a+b)',
  'w1-02': 'print("Hello, Pokemon Master!")',
  'w1-03': 'a,b=map(int,input().split())\nprint(f"{a/b:.9f}")',
  'w1-04': 'y=int(input())\nprint(1 if (y%4==0 and y%100!=0) or y%400==0 else 0)',
  'w1-05': 'h,m=map(int,input().split())\nt=(h*60+m-45)%1440\nprint(t//60,t%60)',
  'w1-06': 'n=int(input())\nfor i in range(1,10): print(f"{n} * {i} = {n*i}")',
  'w1-07': 'n=int(input())\nfor i in range(1,n+1): print("*"*i)',
  'w1-08': 'n,x=map(int,input().split())\na=list(map(int,input().split()))\nprint(*[v for v in a if v<x])',
  'w1-09': 'a=[int(input()) for _ in range(9)]\nm=max(a)\nprint(m)\nprint(a.index(m)+1)',
  'w1-10': 'n=int(input())\na=list(map(int,input().split()))\nm=max(a)\nprint(sum(v/m*100 for v in a)/n)',
  'w2-01': READ + 'n=int(d[0])\nprint("\\n".join(map(str,sorted(int(x) for x in d[1:n+1]))))',
  'w2-02': READ + 'n=int(d[0])\nprint("\\n".join(map(str,sorted(int(x) for x in d[1:n+1]))))',
  'w2-03': READ + 'w=sorted(set(x for x in d[1:] if x),key=lambda s:(len(s),s))\nprint("\\n".join(w))',
  'w2-04': READ + 'n=int(d[0])\nm=[d[i+1].split() for i in range(n)]\nm.sort(key=lambda x:int(x[0]))\nprint("\\n".join(a+" "+b for a,b in m))',
  'w2-05': READ + 'n=int(d[0])\np=sorted(tuple(map(int,d[i+1].split())) for i in range(n))\nprint("\\n".join(f"{x} {y}" for x,y in p))',
  'w2-06': READ + `n=int(d[0]);st=[];o=[]
for s in d[1:n+1]:
    c=s.split()
    if c[0]=='push':st.append(int(c[1]))
    elif c[0]=='pop':o.append(st.pop() if st else -1)
    elif c[0]=='size':o.append(len(st))
    elif c[0]=='empty':o.append(0 if st else 1)
    else:o.append(st[-1] if st else -1)
print("\\n".join(map(str,o)))`,
  'w2-07': READ + `from collections import deque
n=int(d[0]);q=deque();o=[]
for s in d[1:n+1]:
    c=s.split()
    if c[0]=='push':q.append(int(c[1]))
    elif c[0]=='pop':o.append(q.popleft() if q else -1)
    elif c[0]=='size':o.append(len(q))
    elif c[0]=='empty':o.append(0 if q else 1)
    elif c[0]=='front':o.append(q[0] if q else -1)
    else:o.append(q[-1] if q else -1)
print("\\n".join(map(str,o)))`,
  'w2-08': READ + `t=int(d[0])
for s in d[1:t+1]:
    b=0;ok=True
    for ch in s:
        b+=1 if ch=='(' else -1
        if b<0:ok=False;break
    print("YES" if ok and b==0 else "NO")`,
  'w2-09': READ + 'k=int(d[0]);st=[]\nfor x in d[1:k+1]:\n    x=int(x)\n    if x==0:st.pop()\n    else:st.append(x)\nprint(sum(st))',
  'w2-10': 'import sys\nd=sys.stdin.read().split()\nn=int(d[0]);s=set(d[1:n+1]);m=int(d[n+1])\nprint("\\n".join("1" if x in s else "0" for x in d[n+2:n+2+m]))',
};

Object.assign(PY, require('./py-w03'));

(async () => {
  const tools = detect();
  console.log('도구:', tools);
  const probs = build();
  let bad = 0;
  for (const p of probs) {
    const code = PY[p.id];
    if (!code) { console.log(`${p.id}  (파이썬 검증 풀이 없음)`); bad++; continue; }
    const r = await judge(p, 'py', code, 'submit', tools);
    const ok = r.verdict === 'AC';
    if (!ok) bad++;
    console.log(`${ok ? 'OK ' : 'FAIL'} ${p.id} ${p.title}  ${r.passed}/${r.total}  ${r.maxMs}ms${ok ? '' : '  ' + JSON.stringify(r.fail || r.message).slice(0, 300)}`);
  }
  console.log(bad ? `\n실패 ${bad}건` : `\n전부 통과 (${probs.length}문제)`);
  process.exit(bad ? 1 : 0);
})();
