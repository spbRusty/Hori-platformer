function land(o,py,b){if(o.x+o.w>b[0]&&o.x<b[0]+b[2]&&o.vy>=0&&py+o.h<=b[1]+2&&o.y+o.h>=b[1]){o.lnd=o.vy>2?10:o.lnd;o.y=b[1]-o.h;o.vy=0;o.on=1;o.j=1}}
function solid(o,py){ // one-way landing; + блоки уровня: на них можно запрыгнуть, если есть ширина
   o.on=0;
   for(const p of L.p)land(o,py,p);
   for(const b of L.s||[])land(o,py,b);
  }
function blockX(o){ // стены уровня непроходимы по X: выталкиваем к ближайшей грани
 for(const b of L.s||[]){
  if(o.y+o.h>b[1]+3&&o.y<b[1]+b[3]&&o.x+o.w>b[0]&&o.x<b[0]+b[2])
   o.x=o.x+o.w/2<b[0]+b[2]/2?b[0]-o.w:b[0]+b[2];
 }
}
function update(){
 t++;
if(state!='play'){if(P){P.inv=Math.max(0,P.inv-1);shieldT=Math.max(0,shieldT-1)} // иначе мигание неуязвимости и щит замерзают на экране поражения
  if(tap.Enter){tap.Enter=0;keys.Enter=0;if(state=='lose')reset(li);else toMap()} // поражение — тот же уровень заново, победа — карта
  volHide();return}
 if(hint>0)hint--;
 volHide();
 if(tap.KeyC||tap.KeyS){tap.KeyC=tap.KeyS=0;shKey()} // щит: C (рядом с X) или S, работает и на клавиатуре, и на тапе
 const l=keys.ArrowLeft||keys.KeyA,r=keys.ArrowRight||keys.KeyD,tv=(r?1:0)*4-(l?1:0)*4; // инерция: разгон и снос не мгновенные
 P.vx+=(tv-P.vx)*(tv?.2:.26);if(Math.abs(P.vx)>.01)P.f=P.vx>0?1:-1;
 if(tap.Space||tap.ArrowUp||tap.KeyW){tap.Space=tap.ArrowUp=tap.KeyW=0; // прыжок по нажатию: два раза — двойной
  if(P.on){P.vy=-12.5;P.on=0;P.jp=20;P.j=1;snd('jump')}
  else if(P.j){P.vy=-11;P.j--;P.jp=14;snd('djump');pops.push({x:P.x+12,y:P.y+2,s:'двойной прыжок',c:'#5ce1e6',l:26})}}
  // машем только когда есть кто бить РЯДОМ: прежняя проверка была глобальной, меч гонялся на всей карте, даже когда на экране было пусто
  const foeNear=foes.some(e=>!e.dead&&Math.abs(e.x+e.w/2-P.x-12)<170)||shots.some(s=>Math.abs(s.x-P.x-12)<210);
  P.atk--;if(P.atk<=0&&foeNear)P.atk=SWING; // меч зажат, но машет без пауз только когда есть кого бить; звук даёт сам удар
 P.inv--;shieldT=Math.max(0,shieldT-1);P.jp=Math.max(0,P.jp-1);P.lnd=Math.max(0,P.lnd-1);
 P.x=Math.max(0,Math.min(W-P.w,P.x+P.vx));blockX(P);
 const py=P.y;P.vy+=.65;P.y+=P.vy;solid(P,py);
 if(P.on){P.lx=P.x;P.ly=P.y} // запомнили твёрдую точку — воскрешаем здесь, а не на старте
  if(P.y>LH+30){hurt();P.x=P.lx;P.y=P.ly;P.vx=P.vy=0;P.on=1;P.j=1;shake=9;pops.push({x:P.x+12,y:P.y-12,s:'провал!',st:1,c:'#ff5c8a',rot:(Math.random()-.5)*.4,l:44})} // улетела в пропасть: минус жизнь и возврат на последнюю площадку
  if(Math.abs(P.vx)>RUNV&&P.on&&Math.random()<.15)pops.push({x:P.x+3,y:P.y+42,s:'',c:'#e8dcff',l:22,d:1});
 // sword hitbox
 const hb=P.atk>0?{x:P.f>0?P.x+P.w:P.x-50,y:P.y-4,w:50,h:P.h}:null;
const hit=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
  for(const e of foes){
   if(e.dead)continue;
   if(e.k===5){ // 👑 Директор: уклоняется от меча, бьёт залпом, прыгает с ударом — фазы лезут в ту же фигурку
    const bcx=e.x+e.w/2;
    if(e===boss){
     const ad=Math.abs(P.x+12-bcx),pv=e.hp<=e.bs/2; // со второй половины быстрее и злее
      if(!e.hi&&ad<540){e.hi=1;pop(bcx,e.y-40,'БЕЙ ПО РОГАМ!','#ff2d55');shake=7}
      if(e.dg>0)e.dg--;if(e.ch>0)e.ch--;if(e.ht>0)e.ht--;
     if(e.dg){e.sx+=((pv?3.4:2.2)*AG*DF.vx-e.sx)*.16} // отскок от меча — резкий, с коротким разгоном
      else if(e.on&&e.sp<=0&&ad<170){e.d=P.x+12>bcx?1:-1;e.vy=-14;e.on=0;e.sp=pv?58:74;e.lnd1=0;shake=5} // подскочил и рухнул сверху
     else if(P.x+12>e.x+e.w+28||P.x+12<e.x-28)e.ch=pv?78:64; // герой за спиной — догоняет и расталкивает залпом
     else{e.ch=0}
     if(!e.ch&&!e.dg){const nd=e.x<e.x0?1:e.x>e.x1?-1:0;
      if(nd&&nd!==e.d)e.pd=nd; // курс запомнили, едем по старому
      if(e.pd){if(e.sx<=.25){e.d=e.pd;e.pd=0}else e.sx*=.84} // гасим ход, потом разворачиваемся
      else e.sx+=(e.vx-e.sx)*.09}
     else{e.pd=0;e.sx+=(e.vx*(e.ch>0?1.5:1)-e.sx)*.09}
     e.x=Math.max(0,Math.min(W-e.w,e.x+e.sx*e.d));
     if(e.tq>0){ // замах: приседает и телеграфирует удар
      e.tq--;e.vx=0;e.sx=0;
       if(e.tq===1){const a=Math.atan2(P.y+22-e.y-6,P.x+12-bcx),n=pv?3:2,ph=pick(n*2+1);for(let i=-n;i<=n;i++)shoot({x:bcx,y:e.y+26},a+i*.17,ph[i+n]);e.sp=pv?66:84;shake=4;snd('swing')}
     }else{e.vy+=.7;e.y+=e.vy;solid(e,e.y-e.vy);if(e.on){if(e.sp>0)e.sp--;if(!e.lnd1){e.lnd1=1;shake=7;
       pop(bcx,e.y+e.h,'УДАР','#ff2d55');for(const dd of[-1,1]){shots.push({x:bcx+dd*60,y:e.y+e.h-24,vx:dd*3.4,vy:-1.6,sp:3.7,s:'ОТПИСАТЬ',l:150})}
       snd('kill')}}}
     if(t>e.sr){e.sr=t+(pv?100:140)/(AG*DF.fq)|0;e.tq=pv?20:28} // телеграф залпа
    }
     if(hb&&hit(hb,e)){
      if(e.tq>0){pop(bcx,e.y-24,'ПРЯЧЬСЯ!','#ffd54a');continue} // на замахе неуязвим: бей после залпа, а не спамь мечом
      if(e.ht>0)continue // Director держит удар: зажатый меч бьёт каждые 27 кадров, без паузы он рассыпался бы за две секунды
      if(--e.hp>0){e.ht=18;snd('swing');e.dg=26;e.d=P.x+12>bcx?1:-1;continue} // отскочил от меча, но ещё жив
     e.dead=1;boss=null;finOpen=1;const v=500;score+=v;pop(bcx,e.y+60,'+'+v+' ₽','#ffd54a');
     pop(bcx,e.y-30,'ВОТ И ДИРЕКТОР','#ff2d55');shake=14;P.kills++;
     pops.push({x:bcx,y:e.y-70,s:'СТРИМ СВОБОДЕН',st:1,rot:(Math.random()-.5)*.3,l:60});laugh(0);snd('win');pops.push({x:bcx,y:e.y-14,s:'врата открыты!',c:'#5ce1e6',l:60});continue}
    if(P.inv<=0&&hit(P,e)){P.x-=Math.sign(P.x+12-bcx||1)*36;hurt();pops.push({x:P.x+12,y:P.y-12,s:'не лезь к боссу!',st:1,c:'#5ce1e6',rot:(Math.random()-.5)*.4,l:44})}
    continue}
   const ex=e.x+15,px=P.x+12,ad=Math.abs(px-ex),ahead=P.f>0?ex>px:ex<px; // враг перед героем или за спиной
  if(ahead&&ad<160&&(P.atk>0||P.vx)){if(!e.dg){e.d=P.f>0?-1:1;if(e.on){e.vy=-12.5;e.on=0}}e.dg=36} // бежит на него с мечом — хейтер отскакивает прыжком
  else if(!ahead&&ad<330)e.ch=64; // герой спиной — догоняет
  if(e.dg>0)e.dg--;if(e.ch>0)e.ch--;
  const tv=e.vx*(e.dg>0?2.4:e.ch>0?1.6:1);
  e.sx=e.sx||0;if(!isFinite(e.sx))e.sx=0;
  if(!e.ch){const nd=e.x<e.x0?1:e.x>e.x1?-1:0;
   if(nd&&nd!==e.d)e.pd=nd; // новый курс запомнили, но пока едем по старому
   if(e.pd){if(e.sx<=.25){e.d=e.pd;e.pd=0}else e.sx*=.84} // тормозим перед разворотом
   else e.sx+=(tv-e.sx)*.12}
  else{e.pd=0;e.sx+=(tv-e.sx)*.12}
  e.x+=e.sx*e.d; // хейтер разгоняется и разворачивается через гашение, а не стартует рывком
  e.x=Math.max(0,Math.min(W-e.w,e.x));
   const epy=e.y;e.vy+=.6;e.y+=e.vy;solid(e,epy); // swept-приземление как у игрока: на скорости падения хейтер больше не проваливается сквозь платформу
   if(e.y>LH+40){e.y=e.y0;e.vy=0;e.on=1} // страховка от падения — только за нижним краем мира, телепорт не виден на экране
   blockX(e);
  if(e.on&&e.k>1&&Math.random()<(e.k>2?.03:.012)&&ad<240){e.vy=e.k>2?-13:-11.5;e.on=0} // с ростом уровня хейтеры прыгают сами
  if(e.on&&e.ch>0&&ad<130&&Math.random()<.04){e.vy=-11;e.on=0} // погоня — подпрыгивает на пятках
   if(e.k&&t>e.sr&&ad<430&&Math.abs(P.y-e.y)<170){ // залп фразами
    e.sr=t+(e.k>2?70:120)/(AG*DF.fq)+Math.random()*40|0;const a=Math.atan2(P.y+22-e.y-6,P.x+12-e.x),n=e.k>2?5:e.k>1?3:1;
     const ph=pick(n);for(let i=0;i<n;i++)shoot(e,a+(i-(n-1)/2)*.16,ph[i]);snd('swing')}
if(hb&&hit(hb,e)){if(--e.hp>0){snd('swing');continue}e.dead=1;const v=[50,100,150,200][Math.random()*4|0];score+=v;pop(e.x,e.y+24,'+'+v+' ₽','#ffd54a');P.kills++;pops.push({x:e.x+15,y:e.y-18,s:P.kills%3?'В БАН':'В БАН НАХ**',st:1,rot:(Math.random()-.5)*.5,l:52});shake=5;snd('kill');continue}
if(P.inv<=0&&hit(P,e)){P.x-=e.d*30;pops.push({x:P.x+12,y:P.y-12,s:e.tx+'!',st:1,c:'#5ce1e6',rot:(Math.random()-.5)*.4,l:44});hurt()}
else if(P.x-e.x>130&&t-e.sh>420*DF.fq){e.sh=t;shoot(e);snd('swing')} // Валя обошла хейтера — он кричит ей вслед
 }
 for(const s of shots){ // фразы доворачивают за Валю, их можно убить мечом
   if(s.l<=0)continue;
   const cur=Math.atan2(s.vy,s.vx),a=Math.atan2(P.y+22-s.y,P.x+12-s.x),d=Math.atan2(Math.sin(a-cur),Math.cos(a-cur)),dd=Math.hypot(P.x+12-s.x,P.y+22-s.y),tr=dd<46?.022:.07,n=cur+Math.max(-tr,Math.min(tr,d)); // вблизи доворачиваем втрое медленнее — фраза не дрожит и не наезжает сама на себя
   s.vx=Math.cos(n)*s.sp;s.vy=Math.sin(n)*s.sp;s.x+=s.vx;s.y+=s.vy;s.l--;
  if(s.l<=0)continue;
if(hb&&hit(hb,{x:s.x-30,y:s.y-11,w:60,h:22})){ // слипшиеся фразы гасим одним взмахом: залп сходится в точку, иначе попап и звук дублируются
   shots.forEach(q=>{if(q!==s&&q.l>0&&Math.abs(q.x-s.x)<46&&Math.abs(q.y-s.y)<30)q.l=0});
   s.l=0;score+=10;shatter(s.x,s.y,s.s);shake=3;snd('ph')}
   else if(shieldT>0&&Math.abs(s.x-P.x-12)<36&&Math.abs(s.y-P.y-22)<22){s.l=0;pops.push({x:s.x,y:s.y,s:'съедено щитом',st:1,c:'#5ce1e6',rot:0,l:40})} // щит не отбивает, а съедает фразу
   else if(P.inv<=0&&Math.abs(s.x-P.x-12)<36&&Math.abs(s.y-P.y-22)<22){s.l=0;P.x-=Math.sign(s.vx)*20;hurt();pops.push({x:s.x,y:s.y,s:s.s,st:1,c:'#ff5c8a',rot:(Math.random()-.5)*.3,l:40})}}
 shots=shots.filter(s=>s.l>0);
 for(const c of coins){if(!c.g&&Math.abs(c.x-(P.x+12))<22&&Math.abs(c.y-(P.y+22))<32){c.g=1;score+=c.v;pop(c.x,c.y,'+'+c.v+'₽','#ffd54a');snd('coin')}}
 pops.forEach(p=>{p.y-=.8;p.l--});pops=pops.filter(p=>p.l>0);
 shd.forEach(q=>{q.vy+=.24;q.x+=q.vx;q.y+=q.vy;q.r+=.1;q.l--});shd=shd.filter(q=>q.l>0);
 shake*=.8;
if(Math.abs(P.x+12-L.fin[0])<45&&Math.abs(P.y+P.h-L.fin[1])<80&&(!L.fin[2]||finOpen)){state='win';snd('win');if(score>(best[li]||0))best[li]=score;if(done.indexOf(li)<0)done.push(li);bank+=score;save()} // выигрыш уходит в банк
  cam+=(Math.max(0,Math.min(W-800,P.x-300))-cam)*.16; // камера догоняет плавно, без рывков на краях
  camY+=(Math.max(0,Math.min(LH-450,P.y-260))-camY)*.16;
}
function rr(x,y,w,h,r,c){g.fillStyle=c;g.beginPath();g.roundRect(x,y,w,h,r);g.fill()}
// --- фон: параллакс-мегаполис. Тайлы рисуются один раз на уровень, в кадре только 6 drawImage
const CTW=1600,CTH=620,CBY=560;
let city=[];
function nrand(seed){let s=(seed>>>0)||1;return()=>((s=(s*1664525+1013904223)>>>0)/4294967296)}
function buildCity(){
 const K=TH[li]||'tower',sk=L.sky[0];
 city=[.05,.11,.2].map((f,k)=>{ // параллакс замедлен втрое: на .12/.28/.5 задник уезжал быстрее героя и путал, где он, а где стена
   const c=document.createElement('canvas');c.width=CTW;c.height=CTH;const x=c.getContext('2d'),R=nrand(li*7919+k*131+17);
  const tone=[shade(sk,.5),shade(sk,.34),shade(sk,.2)][k],lit=L.sky[1],glow=shade(lit,.92);
  motif(x,R,K,tone,lit,glow,k);
   const g=x.createLinearGradient(0,CBY-170,0,CBY);g.addColorStop(0,'rgba(18,10,34,0)');g.addColorStop(1,shade(sk,.12)+'d0');
   x.fillStyle=g;x.fillRect(0,CBY-170,CTW,170); // дымка у основания
   return{c,f}});
}
// 12 своих задников вместо четырёх силуэтов по кругу. Тон всегда берётся из тёмного неба уровня,
// а lit/glow идут только мелкими акцентами — иначе белый Валя и розовые фразы слились бы с фоном.
function motif(x,R,K,tone,lit,glow,k){
 if(K=='tower'){let px=-60; // небоскрёбы
  while(px<CTW+60){const w=44+R()*96,h=110+R()*(k?300:220),y=CBY-h;
   x.fillStyle=tone;x.fillRect(px,y,w,h);
   x.fillStyle='#00000038';x.fillRect(px+w*.68,y,w*.32,h);
   x.fillStyle=tone;x.fillRect(px-6,y-9,w+12,10);
   if(R()<.4)x.fillRect(px+w*.4,y-20,4,20);
   if(k){x.fillStyle=shade(tone,1.25);x.fillRect(px+w*.2,y-20,17,20);x.fillRect(px+w*.2-3,y-24,23,5)}
   if(k)winLights(x,R,px,y,w,lit,glow);
   px+=w+6+R()*26}}
 else if(K=='pine'){let px=-30; // еловый лес
  while(px<CTW+30){const tw=26+R()*26,th=170+R()*230;
   x.fillStyle=shade(tone,.7);x.fillRect(px+tw/2-5,CBY-th*.26,10,th*.26);
   for(let j=0;j<4;j++){const yy=CBY-th+j*th*.19,ww=tw*(1+j*.34);
    x.fillStyle=shade(tone,.6+j*.1);x.beginPath();x.moveTo(px+tw/2,yy);x.lineTo(px+tw/2+ww/2,yy+th*.32);x.lineTo(px+tw/2-ww/2,yy+th*.32);x.closePath();x.fill()}
   px+=tw*.66+R()*40}}
 else if(K=='brick'){ // кирпичная стена
  x.fillStyle=tone;x.fillRect(0,0,CTW,CBY);
  for(let ry=0;ry<CBY;ry+=26)for(let rx=(ry/26%2)*-32;rx<CTW;rx+=64){x.fillStyle=shade(tone,.84+R()*.3);x.fillRect(rx+3,ry+3,58,20)}
  x.fillStyle='#00000038';x.fillRect(0,CBY-46,CTW,46);
  if(k){x.fillStyle=glow;x.globalAlpha=.45;x.fillRect(120+R()*(CTW-240),CBY-300,26,26);x.globalAlpha=1}
  if(!k){x.fillStyle=glow;x.globalAlpha=.3;x.fillRect(0,CBY-150,CTW,3);x.globalAlpha=1}}
 else if(K=='pipe'){let px=-40; // заводские трубы и цистерны
  while(px<CTW+40){const w=66+R()*70,h=150+R()*210,y=CBY-h;
   x.fillStyle=tone;x.fillRect(px,y,w,h);
   x.fillStyle='#00000038';x.fillRect(px+w*.6,y,w*.4,h);
   x.fillStyle=shade(tone,1.15);x.beginPath();x.ellipse(px+w/2,y,w/2,10,0,0,7);x.fill();
   x.fillStyle=shade(tone,.9);x.fillRect(px+w*.3,y-42-R()*30,16,44);
   x.fillStyle=shade(tone,1.05);x.fillRect(px+w*.3-5,y-48,26,8);
   if(k)for(let i=0;i<3;i++){x.fillStyle=glow;x.globalAlpha=.5;x.fillRect(px+w*.18+i*w*.26,y+h*.3,10,10)}
   x.globalAlpha=1;px+=w+18+R()*40}}
 else if(K=='sign'){let px=-60; // неоновые вывески
  while(px<CTW+60){const w=44+R()*90,h=110+R()*280,y=CBY-h;
   x.fillStyle=tone;x.fillRect(px,y,w,h);
   x.fillStyle='#00000038';x.fillRect(px+w*.68,y,w*.32,h);
   if(k){x.fillStyle=R()<.5?lit:glow;x.globalAlpha=.75;x.fillRect(px+w*.18,y+26,26,26);x.globalAlpha=1}
   if(k&&R()<.4){x.fillStyle=glow;x.globalAlpha=.6;x.fillRect(px+6,y-30,w*.6,7);x.globalAlpha=1}
   if(R()<.35){x.fillStyle=tone;x.fillRect(px+w*.4,y-18,4,18)}
   px+=w+8+R()*24}
  if(!k){x.fillStyle=shade(tone,1.35);x.font='bold 32px system-ui';x.textAlign='center';x.fillText('ХЕЙТЕР',CTW/2,CBY-140)}}
 else if(K=='bush'){ // кусты и живая изгородь
  for(let i=0;i<64;i++){const bx=R()*CTW,bw=60+R()*140,bh=54+R()*110;
   x.fillStyle=shade(tone,.7+R()*.5);x.beginPath();x.ellipse(bx,CBY-bh*.42,bw*.5,bh*.8,0,0,7);x.fill()}
  x.fillStyle=shade(tone,.4);x.fillRect(0,CBY-28,CTW,28);
  for(let i=0;i<40;i++){const st=R()*CTW;x.fillStyle=shade(tone,.52);x.fillRect(st,CBY-46-R()*54,4,46+R()*54)}
  if(k){x.fillStyle=glow;x.globalAlpha=.5;for(let i=0;i<10;i++)x.fillRect(R()*CTW,CBY-200-R()*120,7,7);x.globalAlpha=1}}
 else if(K=='shaft'){ // шахтные своды
  x.fillStyle=shade(tone,.55);x.fillRect(0,0,CTW,CBY);
  for(let i=0;i<9;i++){const ax=60+i*180;
   x.strokeStyle=shade(tone,1.25);x.lineWidth=7;x.beginPath();x.arc(ax,CBY-40,86,Math.PI,0);x.stroke();
   x.strokeStyle=shade(tone,.8);x.lineWidth=4;x.beginPath();x.arc(ax,CBY-40,58,Math.PI,0);x.stroke()}
  x.fillStyle='#00000045';x.fillRect(0,CBY-120,CTW,120);
  if(k){x.fillStyle=glow;x.globalAlpha=.4;x.fillRect(0,CBY-16,CTW,4);x.globalAlpha=1}}
 else if(K=='gold'){let px=-50; // золотые штабели
  while(px<CTW+50){const w=50+R()*60,h=60+R()*150,y=CBY-h;
   x.fillStyle=shade(tone,1.05);x.fillRect(px,y,w,h);
   x.fillStyle=shade(tone,.68);x.fillRect(px,y+h-8,w,8);
   x.fillStyle='#00000030';x.fillRect(px+w*.7,y,30,h);
   if(k){x.fillStyle=glow;x.globalAlpha=.5;x.fillRect(px+w*.2,y+18,14,14);x.globalAlpha=1}
   px+=w+14+R()*30}
  x.fillStyle='#00000038';x.fillRect(0,CBY-40,CTW,40)}
 else if(K=='shield'){ // крепостная стена со щитами
  x.fillStyle=tone;x.fillRect(0,0,CTW,CBY);
  for(let ry=0;ry<CBY;ry+=44)for(let rx=(ry/44%2)*-40;rx<CTW;rx+=80){x.fillStyle=shade(tone,.82+R()*.26);x.beginPath();x.roundRect(rx+4,ry+4,72,36,5);x.fill()}
  for(let i=0;i<10;i++){const bx=40+i*160;
   x.fillStyle=shade(tone,1.18);x.beginPath();x.moveTo(bx,CBY-120);x.lineTo(bx+22,CBY-96);x.lineTo(bx-22,CBY-96);x.closePath();x.fill()}
  x.fillStyle='#00000040';x.fillRect(0,CBY-70,CTW,70)}
 else if(K=='circuit'){ // неоновая схема
  x.strokeStyle=shade(tone,1.3);x.lineWidth=3;
  for(let i=0;i<16;i++){let cx=R()*CTW,cy=R()*CBY;x.beginPath();x.moveTo(cx,cy);
   for(let j=0;j<5;j++){if(R()<.5)cx+=(R()<.5?-1:1)*(40+R()*120);else cy+=(R()<.5?-1:1)*(40+R()*110);x.lineTo(cx,cy)}x.stroke()}
  x.fillStyle=glow;
  for(let i=0;i<26;i++){x.globalAlpha=.55;x.fillRect(R()*CTW,R()*CBY,7,7)}
  x.globalAlpha=1}
 else if(K=='stripe'){ // скоростные полосы заката
  for(let i=0;i<24;i++){x.fillStyle=i%2?shade(tone,.6):shade(tone,.86);x.fillRect(0,CBY-12-i*23,CTW,11)}
  let px=-40;
  while(px<CTW+40){const w=30+R()*54,h=40+R()*74;x.fillStyle=shade(tone,.48);x.fillRect(px,CBY-h,w,h);px+=w+22+R()*60}}
 else{let px=-60; // inferno: пылающий закат
  for(let i=0;i<40;i++){x.fillStyle=R()<.5?glow:lit;x.globalAlpha=.14+R()*.28;
   x.beginPath();x.ellipse(R()*CTW,CBY-R()*CBY,20+R()*70,14+R()*50,0,0,7);x.fill()}
  x.globalAlpha=1;
  while(px<CTW+60){const w=44+R()*90,h=120+R()*230,y=CBY-h;
   x.fillStyle=shade(tone,.85);x.fillRect(px,y,w,h);
   x.fillStyle='#00000040';x.fillRect(px+w*.66,y,w*.34,h);
   if(k){x.fillStyle=glow;x.globalAlpha=.6;x.fillRect(px+w*.2,y+30,20,20);x.globalAlpha=1}
   px+=w+8+R()*26}}
}
function winLights(x,R,px,y,w,lit,glow){for(let wy=y+15;wy<CBY-12;wy+=17)for(let wx=px+7;wx<px+w-9;wx+=14)if(R()<.38){x.fillStyle=R()<.14?lit:glow;x.fillRect(wx,wy,7,8)}}
function shade(hex,f){ // затемнить/осветлить свой цвет уровня на коэффициент f — один хелпер вместо палитры на 12 тем
 const n=parseInt(hex.slice(1),16),r=n>>16&255,gg=n>>8&255,b=n&255;
 return'#'+[r,gg,b].map(v=>Math.max(0,Math.min(255,Math.round(v*f))).toString(16).padStart(2,'0')).join('')}
function skyCity(){
 const mx=650-cam*.03,my=88+Math.min(camY*.04,40),mg=g.createRadialGradient(mx,my,2,mx,my,58);
 mg.addColorStop(0,'#fff6dc');mg.addColorStop(.22,'#ffe7aeaa');mg.addColorStop(1,'#ffe7ae00');
 g.fillStyle=mg;g.beginPath();g.arc(mx,my,58,0,7);g.fill(); // дымка светильника над городом
 const by=410+Math.min(camY*.04,40);
 for(const o of city){const ox=-((cam*o.f)%CTW);g.drawImage(o.c,ox,by-CBY);g.drawImage(o.c,ox+CTW,by-CBY)}
 g.fillStyle='rgba(18,10,34,.8)';g.fillRect(0,by,800,450-by); // город обрывался выше низа кадра — розовое небо; продолжаем фон вниз
}
