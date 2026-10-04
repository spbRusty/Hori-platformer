const EDROP=470; // на сколько выше своей площадки появляется хейтер: чуть выше кадра (450), чтобы он влетел сверху, а не возник из стены
function reset(i){
 li=i;L=LV[i];W=L.w;GY=L.gy;LH=L.h;
 P={x:60,y:L.sp?L.sp[1]:GY-44,w:24,h:44,vx:0,vy:0,f:1,on:0,atk:0,inv:0,hp:3,jp:0,lnd:0,kills:0,j:1,lx:60,ly:L.sp?L.sp[1]:GY-44}; // j — запас двойного прыжка; atk:0 — меч молчит, пока рядом не будет кого бить; lx/ly — последняя твёрдая точка, оттуда воскрешают после падения
 coins=[];foes=[];pops=[];shots=[];shd=[];conf=[];confT=0;celeb=0;score=0;state='play';cam=0;camY=0;shake=0;boss=null;finOpen=0;buildCity();mapEl.style.display='none';document.body.classList.remove('menu');if(wantFs&&!document.fullscreenElement)goFs(1);snd('start');
 L.p.slice(1).forEach(p=>{for(let i=0;i<2;i++)coins.push({x:p[0]+30+i*(p[2]-60)/1,y:p[1]-30,v:10*(1+i)})});
  (L.c||[]).forEach(c=>coins.push({x:c[0],y:c[1],v:c[2]})); // дорогие монеты из данных уровня: лежат там, где сорваться дорого
 const kd=Math.min(3,li>>1); // тип хейтера растёт с уровнем: 0 нуль, 1 стрелок, 2 залповый, 3 босс
 AG=1+Math.min(1,bank/1500); // чем богаче Валя, тем злее хейтеры: скорость и частота залпов
 if(AG>=1.25&&!taught){taught=1;hint=260} // один раз за сессию объясняем правило прямо в игре
  let fi=0;
 // addFoe — общая точка для ручных и авто-врагов, иначе у авто-врагов не будет ни hp, ни залпов, ни разных типов
// точка патруля прижимается к настоящей поверхности: y в уровне округляется независимо от gy,
// и после ×2/3 ноги хейтера стоят на 11-13px НИЖЕ пола. Односторонняя посадка (py+h<=верх+2) такой
// промах уже не ловит, и хейтер проваливался сквозь пол до самого низа мира, пока его не откидывало
// обратно на y0 — то есть он не стоял на месте вообще. 20 — с запасом больше гуляния округления,
// но меньше любой настоящей ступени уровня (там шаг от 75px)
const stand=(x,y)=>{let d=20,b=y;for(const q of L.p.concat(L.s||[]))if(q[0]<x+30&&q[0]+q[2]>x&&Math.abs(q[1]-y-34)<d){d=Math.abs(q[1]-y-34);b=q[1]-34}return b};
const addFoe=(x,y,pat,vx,k)=>{y=stand(x,y);foes.push({x,y:y-EDROP,y0:y,w:30,h:34,vx:vx*(1+kd*.3)*AG*DF.vx,sx:0,d:fi%2?1:-1,dg:0,ch:0,x0:x-pat,x1:x+pat,
     tx:hats[fi%7],sh:-600,k:k==null?kd:k,hp:1+(kd>1)+(kd>2),sr:t+(40+(fi*37)%90)*DF.fq,vy:0,on:1,pd:0,ed:1});fi++}; // y сразу на EDROP выше своей площадки и ed=1: хейтер не стоит на месте с нулевого кадра, а падает сверху — иначе на провальных уровнях он «появлялся из воздуха» прямо рядом с Валей
  L.f.forEach(f=>addFoe(f[0],f[1],f[2],f[3]));
 // автозаполнение пустых участков: своей плотностью на уровень, чтобы больших провалов без врага не оставалось
  const GAP=[300,290,240,290,270,260,240,250,300,250,200,260][li]||280,fin=L.fin[0],finy=L.fin[1],spx=L.sp?L.sp[0]:72,spy=L.sp?L.sp[1]:GY;
  const wall=(x,y)=>(L.s||[]).some(s=>x+30>s[0]&&x<s[0]+s[2]+46&&y+34>s[1]-46&&y<s[1]+s[3]+46), // сверялся только x: стена в воздухе на y=456 запрещала врага на земле под собой и оставляла дыры
       clash=(x,y)=>foes.some(e=>Math.abs(e.x-x)<110&&Math.abs(e.y0-y)<50), // сверялся только x: враг на площадке на 80px выше блокировал ground-слот под собой, и в дыре на 500px не оставалось ни одной легальной точки. 70 вместо 110 превращало уровень в сплошную стену тел
       under=(x,y)=>L.p.some(p=>x+15>p[0]&&x+15<p[0]+p[2]&&p[1]==y+34), // пол обязан быть именно тем, к которому относится y: починка широких провалов подставляла y первой площадки куда угодно по уровню, и хейтер появлялся в воздухе над разрывом
       clear=(x,y)=>under(x,y)&&!wall(x,y)&&Math.hypot(x-fin,y-finy)>200&&(Math.abs(y-spy)>150||Math.abs(x-spx)>170), // от финиша защищаем по двум осям: на Скалозазе финиш (560,120) наверху, а правая колонка площадок идёт от y=1100 — проверка только по x выкашивала весь ряд
       fits=(x,y)=>clear(x,y)&&!foes.some(e=>Math.abs(e.x-x)<260&&Math.abs(e.y0-y)<50); // y0, а не y: вход поднял y на EDROP, и сверка со своим же спавном на площадке перестала бы работать
 if(!L.nf)L.p.forEach((pl,i)=>{const y=pl[1]-34;
   if(!i){const lo=Math.max(pl[0]+GAP*.55,spx+190),hi=pl[0]+pl[2]-100,put=x=>addFoe(x,y,Math.min(70,GAP*.22),1.1+(x%7)*.12,Math.max(0,kd-(x%5===0?1:0))),
      fill=(a,b)=>{for(let m=a+40;m<b-40;m+=40)if(clear(m,y)&&!clash(m,y)){put(m);return 1}return 0}; // не середина: середина широкого провала попадала в колонку стены и ремонт выходил, оставляя дыру
     for(let x=lo;x<hi;x+=GAP)if(clear(x,y)&&!clash(x,y))put(x);
     for(let g=0;g<40;g++){ // отказ по clear/clash сдвигал цикл на целый GAP, и два отказа подряд давали провал в 2*GAP — дочиняем каждый провал шире GAP
       const xs=foes.filter(e=>e.y0===y).map(e=>e.x).sort((a,b)=>a-b);
       let pr=lo,n=0;
       for(const v of xs){if(v-pr>GAP)n+=fill(pr,v);if(v>pr)pr=v}
       if(hi-pr>GAP)n+=fill(pr,hi);
       if(!n)break}}
   else if(pl[2]>=90){const x=pl[0]+pl[2]/2; // на каждой площадке шире 90 — свой хейтер. Откат к 130 давал +8 пустых площадок на Финале и не менял проходимость: она валится на вертикальных уровнях из-за бота, а не из-за плотности (кривая 6..37 врагов = 0/5 всюду)
   if(fits(x,y))addFoe(x,y,Math.min(70,pl[2]/2-25),1.1+(x%5)*.14,Math.max(0,kd-(x%4===0?1:0)))}});
  if(L.bs){boss={x:L.bs[0],y:L.bs[1],y0:L.bs[1],w:BOSS.w,h:BOSS.h,vx:2.2*AG*DF.vx,sx:0,d:-1,dg:0,ch:0,x0:scl(900),x1:scl(2000),tx:'директор',tq:0,sp:60,sh:-600,k:5,hp:BOSS.hp,bs:BOSS.hp,sr:t+50*DF.fq,vy:0,on:1,hi:0,ht:0};foes.push(boss)}
 }
function pop(x,y,s,c){pops.push({x,y,s,c,l:50})}
function shatter(x,y,s){ // убитая фраза не исчезает, а рассыпается на буквы: каждая летит в свою сторону и крутится
 for(let i=0;i<s.length;i++){const a=-1.9+(Math.random()-.5)*2.4,v=1.4+Math.random()*2.6;
  shd.push({x:x+(i-s.length/2)*7.5,y:y+(Math.random()-.5)*9,c:s[i],vx:Math.cos(a)*v,vy:Math.sin(a)*v,r:(Math.random()-.5)*.5,l:46+(Math.random()*16|0)})}}
function hurt(){if(P.inv>0)return; // защита в общей точке урона: иначе залп фраз снимает все 3 жизни за один кадр
 P.hp--;P.inv=150;P.vy=-7;snd('hurt');if(P.hp<=0){state='lose';lost=bank-Math.round(bank/2);bank=Math.round(bank/2);save();snd('lose')}} // проиграл — сгорела половина банка
function shKey(){ // щит тратит заряд: гасит любой урон (фраза или контакт) на 90 кадров
 if(!shield){if(bank<SHPRICE){pop(P.x+12,P.y-16,'нужно '+SHPRICE+' ₽','#ff5c8a');snd('lose');return}
  bank-=SHPRICE;shield=SHMAX;save();pop(P.x+12,P.y-16,'щит ×'+SHMAX,'#5ce1e6')}
 shield--;P.inv=Math.max(P.inv,90);shieldT=90;save();snd('shield');
 pops.push({x:P.x+12,y:P.y-16,s:'ЩИТ',st:1,c:'#5ce1e6',rot:(Math.random()-.5)*.3,l:44})}
function shoot(e,a,t){a=a==null?Math.atan2(P.y+22-e.y-6,P.x+12-e.x):a;const q=4.2*DF.sp;shots.push({x:e.x+15,y:e.y+6,vx:Math.cos(a)*q,vy:Math.sin(a)*q,sp:q,s:t||say[Math.random()*say.length|0],l:200})} // фраза-снаряд сама наводится на Валю; q — скорость с учётом сложности
function pick(n){const p=[];while(p.length<n){const q=say.slice();for(let i=q.length-1;i;i--){const j=Math.random()*(i+1)|0;const z=q[i];q[i]=q[j];q[j]=z}p.push(...q)}return p} // без повторов в залпе: снаряды летят из одной точки и одинаковые фразы ложатся друг на друга
