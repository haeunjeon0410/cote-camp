// 3주차 독립 검증 풀이 (기준 풀이 solve 와 다른 방식으로 작성)
const READ = 'import sys\nd=sys.stdin.read().split("\\n")\n';
module.exports = {
  'w3-01': `s=input().strip()
w=["zero","one","two","three","four","five","six","seven","eight","nine"]
for i,x in enumerate(w): s=s.replace(x,str(i))
print(s)`,
  'w3-02': `s=input().strip()
n=len(s)
best=0
for L in range(n,0,-1):
    if any(s[i:i+L]==s[i:i+L][::-1] for i in range(n-L+1)):
        best=L;break
print(best)`,
  'w3-03': `import itertools
s=input().strip()
o=""
for k,g in itertools.groupby(s):
    c=len(list(g))
    o+=k+(str(c) if c>1 else "")
print(o)`,
  'w3-04': `s=input().strip()
t=""
for ch in s:
    if ch.isascii() and ch.isalpha(): ch=ch.lower()
    if not (ch.isascii() and (ch.isalnum() or ch=="_")) or ch.isupper(): ch="_"
    t+=ch
while "__" in t: t=t.replace("__","_")
t=t.strip("_")
if t=="": t="user"
if len(t)>=12: t=t[:11].rstrip("_")
while len(t)<4: t+=t[-1]
print(t)`,
  'w3-05': `import datetime
y,m,d,k=map(int,input().split())
x=datetime.date(y,m,d)+datetime.timedelta(days=k)
print("%04d-%02d-%02d %s"%(x.year,x.month,x.day,["MON","TUE","WED","THU","FRI","SAT","SUN"][x.weekday()]))`,
  'w3-06': READ + `n,m=map(int,d[0].split())
g=d[1:1+n]
r,c,f=d[1+n].split();r=int(r)-1;c=int(c)-1
cmd=d[2+n].strip()
dirs="NESW";mv={"N":(-1,0),"E":(0,1),"S":(1,0),"W":(0,-1)}
for x in cmd:
    if x=="R": f=dirs[(dirs.index(f)+1)%4]
    elif x=="L": f=dirs[(dirs.index(f)-1)%4]
    else:
        a,b=r+mv[f][0],c+mv[f][1]
        if 0<=a<n and 0<=b<m and g[a][b]=="." : r,c=a,b
print(r+1,c+1,f)`,
  'w3-07': READ + `n,m,k=map(int,d[0].split())
a=[d[1+i].split() for i in range(n)]
for _ in range(k%4):
    a=[list(r) for r in zip(*a[::-1])]
print("\\n".join(" ".join(r) for r in a))`,
  'w3-08': READ + `s=d[0].strip();pref=d[1].strip()
P={"S":(3,0),"0":(3,1),"E":(3,2)}
for i in range(1,10): P[str(i)]=((i-1)//3,(i-1)%3)
l=P["S"];r=P["E"];o=[]
for ch in s:
    p=P[ch]
    if ch in "147": w="L"
    elif ch in "369": w="R"
    else:
        dl=abs(l[0]-p[0])+abs(l[1]-p[1]);dr=abs(r[0]-p[0])+abs(r[1]-p[1])
        w="L" if dl<dr else "R" if dr<dl else pref
    if w=="L": l=p
    else: r=p
    o.append(w)
print("".join(o))`,
  'w3-09': `n,m=map(int,input().split())
a=[[0]*m for _ in range(n)]
top,bot,lef,rig=0,n-1,0,m-1
v=1
while top<=bot and lef<=rig:
    for j in range(lef,rig+1): a[top][j]=v;v+=1
    top+=1
    for i in range(top,bot+1): a[i][rig]=v;v+=1
    rig-=1
    if top<=bot:
        for j in range(rig,lef-1,-1): a[bot][j]=v;v+=1
        bot-=1
    if lef<=rig:
        for i in range(bot,top-1,-1): a[i][lef]=v;v+=1
        lef+=1
print("\\n".join(" ".join(map(str,r)) for r in a))`,
  'w3-10': `s=input().strip()
print(eval(s))`,
};
