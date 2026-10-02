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
 if(state=='win'&&++winT>66){tap.Enter=keys.Enter=0;toMap()}else if(tap.Enter){tap.Enter=0;keys.Enter=0;toMap()}volHide();return}
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
     if(e.dg){e.sx+=((pv?3.4:2.2)*AG-e.sx)*.16} // отскок от меча — резкий, с коротким разгоном
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
     if(t>e.sr){e.sr=t+(pv?100:140)/AG|0;e.tq=pv?20:28} // телеграф залпа
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
    e.sr=t+(e.k>2?70:120)/AG+Math.random()*40|0;const a=Math.atan2(P.y+22-e.y-6,P.x+12-e.x),n=e.k>2?5:e.k>1?3:1;
     const ph=pick(n);for(let i=0;i<n;i++)shoot(e,a+(i-(n-1)/2)*.16,ph[i]);snd('swing')}
if(hb&&hit(hb,e)){if(--e.hp>0){snd('swing');continue}e.dead=1;const v=[50,100,150,200][Math.random()*4|0];score+=v;pop(e.x,e.y+24,'+'+v+' ₽','#ffd54a');P.kills++;pops.push({x:e.x+15,y:e.y-18,s:P.kills%3?'В БАН':'В БАН НАХ**',st:1,rot:(Math.random()-.5)*.5,l:52});shake=5;snd('kill');continue}
if(P.inv<=0&&hit(P,e)){P.x-=e.d*30;pops.push({x:P.x+12,y:P.y-12,s:e.tx+'!',st:1,c:'#5ce1e6',rot:(Math.random()-.5)*.4,l:44});hurt()}
else if(P.x-e.x>130&&t-e.sh>420){e.sh=t;shoot(e);snd('swing')} // Валя обошла хейтера — он кричит ей вслед
 }
 for(const s of shots){ // фразы доворачивают за Валю, их можно убить мечом
   if(s.l<=0)continue;
   const cur=Math.atan2(s.vy,s.vx),a=Math.atan2(P.y+22-s.y,P.x+12-s.x),d=Math.atan2(Math.sin(a-cur),Math.cos(a-cur)),dd=Math.hypot(P.x+12-s.x,P.y+22-s.y),tr=dd<46?.022:.07,n=cur+Math.max(-tr,Math.min(tr,d)); // вблизи доворачиваем втрое медленнее — фраза не дрожит и не наезжает сама на себя
   s.vx=Math.cos(n)*s.sp;s.vy=Math.sin(n)*s.sp;s.x+=s.vx;s.y+=s.vy;s.l--;
  if(s.l<=0)continue;
if(hb&&hit(hb,{x:s.x-30,y:s.y-11,w:60,h:22})){ // слипшиеся фразы гасим одним взмахом: залп сходится в точку, иначе попап и звук дублируются
   shots.forEach(q=>{if(q!==s&&q.l>0&&Math.abs(q.x-s.x)<46&&Math.abs(q.y-s.y)<30)q.l=0});
   s.l=0;score+=10;pops.push({x:s.x,y:s.y,s:s.s,st:1,c:'#5ce1e6',rot:(Math.random()-.5)*.4,l:44});shake=3;snd('ph')}
   else if(shieldT>0&&Math.abs(s.x-P.x-12)<36&&Math.abs(s.y-P.y-22)<22){s.l=0;pops.push({x:s.x,y:s.y,s:'съедено щитом',st:1,c:'#5ce1e6',rot:0,l:40})} // щит не отбивает, а съедает фразу
   else if(P.inv<=0&&Math.abs(s.x-P.x-12)<36&&Math.abs(s.y-P.y-22)<22){s.l=0;P.x-=Math.sign(s.vx)*20;hurt();pops.push({x:s.x,y:s.y,s:s.s,st:1,c:'#ff5c8a',rot:(Math.random()-.5)*.3,l:40})}}
 shots=shots.filter(s=>s.l>0);
 for(const c of coins){if(!c.g&&Math.abs(c.x-(P.x+12))<22&&Math.abs(c.y-(P.y+22))<32){c.g=1;score+=c.v;pop(c.x,c.y,'+'+c.v+'₽','#ffd54a');snd('coin')}}
 pops.forEach(p=>{p.y-=.8;p.l--});pops=pops.filter(p=>p.l>0);
 shake*=.8;
if(Math.abs(P.x+12-L.fin[0])<45&&Math.abs(P.y+P.h-L.fin[1])<80&&(!L.fin[2]||finOpen)){state='win';winT=0;snd('win');if(score>(best[li]||0))best[li]=score;if(done.indexOf(li)<0)done.push(li);bank+=score;save()} // выигрыш уходит в банк
  cam+=(Math.max(0,Math.min(W-800,P.x-300))-cam)*.16; // камера догоняет плавно, без рывков на краях
  camY+=(Math.max(0,Math.min(LH-450,P.y-260))-camY)*.16;
}
function rr(x,y,w,h,r,c){g.fillStyle=c;g.beginPath();g.roundRect(x,y,w,h,r);g.fill()}
// --- фон: параллакс-мегаполис. Тайлы рисуются один раз на уровень, в кадре только 6 drawImage
const CTW=1600,CTH=620,CBY=560;
let city=[];
function nrand(seed){let s=(seed>>>0)||1;return()=>((s=(s*1664525+1013904223)>>>0)/4294967296)}
function buildCity(){
 city=[.12,.28,.5].map((f,k)=>{
  const c=document.createElement('canvas');c.width=CTW;c.height=CTH;const x=c.getContext('2d'),R=nrand(li*7919+k*131+17);
  const tone=['#4b3a72','#33255a','#1b1233'][k];let px=-60;
  while(px<CTW+60){
   const w=44+R()*96,h=110+R()*(k?300:220),y=CBY-h;
   x.fillStyle=tone;x.fillRect(px,y,w,h); // корпус
   x.fillStyle='#00000038';x.fillRect(px+w*.68,y,w*.32,h); // теневая сторона
   x.fillStyle=tone;x.fillRect(px-6,y-9,w+12,10); // карниз
   if(k==2&&R()<.5)x.fillRect(px+w*.4,y-28,4,28); // антенна
   if(k&&R()<.35){x.fillRect(px+w*.2,y-20,17,20);x.fillRect(px+w*.2-3,y-24,23,5)} // бак на крыше
   if(k)for(let wy=y+15;wy<CBY-12;wy+=17)for(let wx=px+7;wx<px+w-9;wx+=14)if(R()<.38){ // окна
    x.fillStyle=R()<.1?'#ff8fc0':'#ffd98a';x.fillRect(wx,wy,7,8)}
   if(k==2&&R()<.22){x.fillStyle=R()<.5?'#5ce1e6':'#ff5c8a';x.fillRect(px+w*.3,y+34,24,11)} // вывеска
   px+=w+6+R()*26}
  const g=x.createLinearGradient(0,CBY-170,0,CBY);g.addColorStop(0,'rgba(18,10,34,0)');g.addColorStop(1,'rgba(18,10,34,.8)');
  x.fillStyle=g;x.fillRect(0,CBY-170,CTW,170); // дымка у основания
  return{c,f}});
}
function skyCity(){
 const mx=650-cam*.03,my=88+Math.min(camY*.04,40),mg=g.createRadialGradient(mx,my,2,mx,my,58);
 mg.addColorStop(0,'#fff6dc');mg.addColorStop(.22,'#ffe7aeaa');mg.addColorStop(1,'#ffe7ae00');
 g.fillStyle=mg;g.beginPath();g.arc(mx,my,58,0,7);g.fill(); // дымка светильника над городом
 const by=410+Math.min(camY*.04,40);
 for(const o of city){const ox=-((cam*o.f)%CTW);g.drawImage(o.c,ox,by-CBY);g.drawImage(o.c,ox+CTW,by-CBY)}
 g.fillStyle='rgba(18,10,34,.8)';g.fillRect(0,by,800,450-by); // город обрывался выше низа кадра — розовое небо; продолжаем фон вниз
}
