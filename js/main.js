const cv=document.getElementById('c'),g=cv.getContext('2d');
let P,coins,foes,state='map',cam,camY,score,t=0,pops,shots,shd,hint=0,taught=0,boss=null,finOpen=0;
let L=LV[0],W=L.w,li=0,shake=0,done=[],best=[],bank=0,lost=0,AG=1;
const SHPRICE=100,SHMAX=3,LIFEPRICE=1000,RUNV=.6,SWING=24;
let shield=0,shieldT=0;
let swA=1.3,rnS=0,lndS=0;
let conf=[],confT=0,celeb=0; // салют финала: конфетти с четырёх краёв кадра + ракеты с разрывом. conf именно через let — иначе присваивание ушло бы в window.conf (это CSP) и молча провалилось бы
try{
 const d=localStorage.getItem('hori_done'),u=+localStorage.getItem('hori_unlocked');
 if(d!==null)done=d.split(',').filter(Boolean).map(Number);
 else if(u>0){for(let i=0;i<=u;i++)done.push(i);localStorage.removeItem('hori_unlocked')}
 best=(localStorage.getItem('hori_best')||'').split(',').filter(Boolean).map(Number);
 while(best.length<LV.length)best.push(0);
 bank=+localStorage.getItem('hori_bank')||0;
 shield=+localStorage.getItem('hori_shield')||0;
}catch(e){}
let GY=500,LH=560;
const keys={},tap={}; // tap — залипание нажатия, иначе быстрый тап/Enter пролетает между шагами физики
addEventListener('keydown',e=>{
 if(state=='map'&&!e.repeat){ // на карте стрелки листают уровни, Enter — начать
  const d=e.code=='ArrowRight'||e.code=='ArrowDown'?1:e.code=='ArrowLeft'||e.code=='ArrowUp'?-1:0;
  if(d){mapSel(d);e.preventDefault();return}
  if(e.code=='Enter'||e.code=='Space'){tap.Enter=tap.Space=keys.Enter=keys.Space=0;
   if(mapBtns[mapSelI])reset(mapBtns[mapSelI][0]);e.preventDefault();return}
 }
 keys[e.code]=1;if(!e.repeat)tap[e.code]=1; // только первое нажатие: удержание не должно «прыгать» само
 if(e.code=='KeyM'&&!e.repeat)MUTE=!MUTE;
 if(e.code=='KeyN'&&!e.repeat)e.shiftKey?volStep():musBtn();
 if(e.code=='KeyF'&&!e.repeat){goFs(!document.fullscreenElement);fsb.blur();e.preventDefault()}
 if(e.code=='KeyX'&&!e.repeat){buyLife();e.preventDefault()}
 if(e.code=='Escape')toMap();audio();if(e.code=='Space'||e.code.startsWith('Arrow'))e.preventDefault()});
addEventListener('keyup',e=>{keys[e.code]=0;
 if((e.code=='Space'||e.code=='ArrowUp'||e.code=='KeyW')&&P&&P.vy<-6)P.vy*=.5}); // отпустил прыжок раньше — подрезал высоту, как в платформерах
document.querySelectorAll('#pad button').forEach(b=>{
 const k=b.dataset.k;
 b.addEventListener('pointerdown',e=>{e.preventDefault();keys[k]=1;tap[k]=1});
 ['pointerup','pointerleave','pointercancel'].forEach(t=>b.addEventListener(t,()=>keys[k]=0));
});
cv.addEventListener('pointerdown',e=>{if(state!='play'){if(state=='lose')reset(li);else toMap();return} // тап: поражение — тот же уровень, победа — карта
 const r=cv.getBoundingClientRect(),cx=(e.clientX-r.left)/r.width,cy=(e.clientY-r.top)/r.height;
 if(Math.abs(cx-.5)<.16&&Math.abs(cy-.5)<.26)volStep()}); // клик по центру экрана — регулятор громкости
 const VVOL=[.11,.2,.33,.52,.74],VBAR=[11,17,24,31,39]; // 5 делений, верхнее громче прежних трёх
 let vlv=3,vdir=-1,volT=0; // rockers: в одну сторону тише, на краю разворот в другую
 const volEl=document.getElementById('гром'),VMX=VVOL.length-1;
 function volStep(){if(vlv<=0)vdir=1;if(vlv>=VMX)vdir=-1;vlv=Math.max(0,Math.min(VMX,vlv+vdir));
  if(MUSG)MUSG.gain.value=VVOL[vlv];
  volEl.querySelectorAll('i').forEach((b,i)=>{b.style.height=VBAR[i]+'px';b.classList.toggle('on',i<=vlv)}); // показываем значок с палочками
  volEl.classList.add('on');volT=80}
function volHide(){if(volT>0&&--volT<1)volEl.classList.remove('on')}

function draw(){
 g.clearRect(0,0,800,450);
 const s=g.createLinearGradient(0,0,0,450);s.addColorStop(0,L.sky[0]);s.addColorStop(1,L.sky[1]);g.fillStyle=s;g.fillRect(0,0,800,450);
 skyCity();
g.save();g.translate(-cam+(shake?(Math.random()-.5)*shake:0),-camY+(shake?(Math.random()-.5)*shake*.5:0));
  g.fillStyle='#ffffff22';for(let i=0;i<40;i++)g.fillRect(i*83%W,20+i*37%(LH-40),2,2);
 for(const p of L.p){rr(p[0]-2,p[1]-2,p[2]+4,p[3]+4,6,'#1a0b2e'); // тёмная подложка-контур: на тёмном небе финального уровня платформы иначе сливаются с фоном
  rr(p[0],p[1],p[2],p[3],4,p[1]==GY?'#2d1f4d':'#7b5ea7');if(p[1]!=GY)g.fillStyle='#b993e8',g.fillRect(p[0],p[1],p[2],3)}
 for(const b of L.s||[]){ // стена: непроходимая, низкая — перепрыгивается, но задаёт направление
  rr(b[0],b[1],b[2],b[3],3,'#6b5636');g.fillStyle='#a08b57';g.fillRect(b[0],b[1],b[2],3);g.fillStyle='#3a2e1c';
  for(let i=1;i*16<b[2];i++)g.fillRect(b[0]+i*16,b[1]+4,2,b[3]-4)}
 for(const a of L.a||[]){ // мигающая стрелка: куда прыгать или идти
  g.save();g.translate(a[0],a[1]-10);g.globalAlpha=.45+.4*Math.abs(Math.sin(t*.06));g.strokeStyle='#ffd54a';g.lineWidth=2.5;
  for(let i=0;i<2;i++){g.beginPath();
   if(a[2]){g.moveTo(-8-i*8,-6);g.lineTo(-1-i*8,0);g.lineTo(-8-i*8,6)}
   else{g.moveTo(-6,-8-i*8);g.lineTo(0,-1-i*8);g.lineTo(6,-8-i*8)}
   g.stroke()}
  g.globalAlpha=1;g.restore()}
 g.fillStyle='#4a3775';g.fillRect(0,GY,W,4);
 for(const c of coins){if(c.g)continue;const y=c.y+Math.sin(t*.08+c.x)*3;g.fillStyle='#ffd54a';g.beginPath();g.arc(c.x,y,10,0,7);g.fill();g.fillStyle='#a67c00';g.font='bold 12px system-ui';g.textAlign='center';g.fillText('₽',c.x,y+4)}
foes.forEach(e=>{if(!e.dead)hater(e)});
  girl();
  shots.forEach(s=>{const wob=Math.sin(t*.12+s.x*.05)*.12;g.save();g.translate(s.x,s.y);g.rotate(wob);
   if(s.l>0&&P.inv<=0){ // овально-шипастая рамка горит только пока фраза реально может ранить
    g.beginPath();for(let i=0;i<24;i++){const a=i/24*6.2832+t*.05,k=i%2?1:1.45;g.lineTo(Math.cos(a)*31*k,Math.sin(a)*13*k)}
    g.closePath();g.strokeStyle='#ff2d55';g.lineWidth=1.8;g.stroke()}
   g.font='bold 13px system-ui';g.textAlign='center';g.lineWidth=4.5;g.strokeStyle='#ff2d55';g.strokeText(s.s,0,0);g.fillStyle=s.g?'#ffd54a':'#ffe4ec';g.fillText(s.s,0,0);g.restore()}); // фразы в полёте
 shd.forEach(q=>{g.save();g.translate(q.x,q.y);g.rotate(q.r);g.globalAlpha=Math.min(1,q.l/18);g.font='bold 13px system-ui';g.textAlign='center';
  g.lineWidth=6;g.strokeStyle='#1c1526cc';g.strokeText(q.c,0,0);g.lineWidth=2.5;g.strokeStyle='#ff2d55';g.strokeText(q.c,0,0);g.fillStyle='#fff';g.fillText(q.c,0,0);g.restore()}); // осколки убитой фразы
 g.font='bold 14px system-ui';g.textAlign='center';g.lineWidth=3;g.strokeStyle='#000a';g.strokeText('Валя',P.x+12,P.y-12);g.fillStyle='#fff';g.fillText('Валя',P.x+12,P.y-12);
  g.fillStyle='#fff';g.fillRect(L.fin[0],L.fin[1]-80,4,80);g.fillStyle='#ff5c8a';g.fillRect(L.fin[0]+4,L.fin[1]-80,34,22);
  if(L.fin[2]&&!finOpen){ // врата стрима заперты, пока жив босс
   g.fillStyle='#3a2e1c';g.fillRect(L.fin[0]+4,L.fin[1]-80,42,80);
   g.strokeStyle='#ffd54a';g.lineWidth=3;g.strokeRect(L.fin[0]+4,L.fin[1]-80,42,80);
   g.fillStyle='#ffd54a';g.font='bold 13px system-ui';g.textAlign='center';g.fillText('ЗАКРЫТО',L.fin[0]+25,L.fin[1]-92);
   g.font='bold 11px system-ui';g.fillStyle='#ff9bb0';g.fillText('надо вальнуть директора',L.fin[0]+25,L.fin[1]-106);
  }
   pops.forEach(p=>{if(p.d){g.globalAlpha=p.l/22;g.fillStyle=p.c;g.beginPath();g.arc(p.x,p.y,2+(22-p.l)/5,0,7);g.fill();g.globalAlpha=1;return}
  if(p.st){g.save();g.globalAlpha=Math.min(1,p.l/26);g.translate(p.x,p.y);g.rotate(p.rot);const z=1+(52-p.l)/40;g.scale(z,z);g.font='bold '+(p.l<30?16:22)+'px system-ui';g.textAlign='center';g.lineWidth=5;g.strokeStyle='#1c1526';g.strokeText(p.s,0,0);g.fillStyle=p.c||'#ff5c8a';g.fillText(p.s,0,0);g.restore();return}
  g.globalAlpha=p.l/50;g.fillStyle=p.c;g.font='bold 15px system-ui';g.textAlign='center';g.fillText(p.s,p.x,p.y);g.globalAlpha=1});
 g.restore();
 g.fillStyle='#fff';g.font='bold 18px system-ui';g.textAlign='left';
 g.fillText('❤'.repeat(Math.max(P.hp,0)),16,64);
 if(bank>=LIFEPRICE){g.fillStyle='#5ce1e6';g.font='bold 15px system-ui';g.fillText('ЖИЗНЬ ЗА 1000₽ — ЖМИ X',16,86);lifeUi()}
 g.textAlign='right';g.fillStyle='#ffd54a';g.fillText('Деньги: '+score+' ₽',784,28); // живые деньги за этот заход — ради этого счётчика банк (строка ниже) и не двигается до финиша
  g.font='bold 14px system-ui';g.fillStyle=AG>1.3?'#ff5c8a':'#c39bd3';g.fillText('Банк '+bank+' ₽ → хейтеры ×'+AG.toFixed(2),784,48);
  g.fillStyle=shield?'#5ce1e6':'#8a7fa8';g.fillText(shield?'Щит ×'+shield+' — C':'Щит '+SHPRICE+' ₽/3 — C',784,68);
 if(hint>0){g.globalAlpha=Math.min(1,hint/50);g.fillStyle='#000c';g.fillRect(0,112,800,46);
  g.fillStyle='#ff5c8a';g.font='bold 21px system-ui';g.textAlign='center';g.fillText('ХЕЙТЕРЫ ЗЛЕЮТ С КАЖДОЙ МОНЕТОЙ',400,141);
  g.fillStyle='#ffd54a';g.font='bold 15px system-ui';g.fillText(' смерть сожжёт половину банка — богатым быть опаснее',400,161);g.globalAlpha=1}
 if(state=='win'||state=='lose'){
  g.fillStyle='#000a';g.fillRect(0,0,800,450);g.fillStyle='#fff';g.textAlign='center';
  if(state=='win'&&L.bs){ // финал: салют и поздравление только на уровне с боссом, у остальных 11 экран остаётся прежним
   conf.forEach(q=>{g.globalAlpha=Math.min(1,q.l/(q.k?14:40));g.fillStyle=q.c; // искры и ракета гаснут быстро, конфетти живут дольше
    if(q.k){g.beginPath();g.arc(q.x,q.y,q.k==1?2.6:1.9,0,7);g.fill()} // ракета и искра — точка: не спорит с буквами
    else{g.save();g.translate(q.x,q.y);g.rotate(q.r);g.fillRect(-3.2,-1.7,6.4,3.4);g.restore()} // конфети — узкая пластинка, видно как крутится
    g.globalAlpha=1}); // конфетти поверх затемнения, но под текстом: буквы остаются читаемыми
   const TXT=[['Поздравляю! Победа!','#ffd54a',40,112,7],['Все твои хейтеры повержены!','#ff5c8a',25,152,6],['Ты прошёл все двенадцать уровней','#c39bd3',22,185,5],['Ты молодец!','#ffffff',28,222,6],['Ты лучше всех!','#ffd54a',28,258,6],['Стрим свободен — занавес опускается','#5ce1e6',22,298,5],['Слава тебе, легенда: донат лился рекой','#ffffff',22,329,5],['Собрано донатов: '+score+' ₽','#ffd54a',22,363,5],['Банк: '+bank+' ₽ · хейтеры будут злее ×'+AG.toFixed(2),'#c39bd3',18,389,4],['Enter или тап — карта уровней','#fff',20,418,4]];
   // тёмная обводка под каждой строкой: конфетти летят прямо сквозь текст, и без неё буквы в пыли не прочесть
   for(const s of TXT){g.font='bold '+s[2]+'px system-ui';g.lineWidth=s[4];g.strokeStyle='#1c1526d9';g.strokeText(s[0],400,s[3]);g.fillStyle=s[1];g.fillText(s[0],400,s[3])}
  }else{
  g.font='bold 34px system-ui';g.fillText(state=='win'?L.n+' — стрим окончен!':'Хейтеры победили',400,200);
  g.font='20px system-ui';g.fillStyle='#ffd54a';g.fillText('Собрано донатов: '+score+' ₽',400,240);
  g.fillStyle=state=='lose'?'#ff5c8a':'#c39bd3';g.fillText(state=='lose'?'Сгорело '+lost+' ₽ — половина банка':'Банк: '+bank+' ₽ · хейтеры будут злее ×'+AG.toFixed(2),400,264);
   g.fillStyle='#fff';g.fillText(state=='win'?'Enter или тап — карта уровней':'Enter или тап — этот уровень заново',400,296);
  }
 }
}
const fsb=document.getElementById('fs'),wrap=document.getElementById('игр');let wantFs=0; // полный экран
function fss(){const on=!!document.fullscreenElement;fsb.textContent=on?'⤡':'⛶';fsb.setAttribute('aria-label',on?'Выйти из полного экрана':'Полный экран')}
function goFs(on,keep){wantFs=on||keep?1:0;try{const r=on?wrap.requestFullscreen():document.exitFullscreen();if(r&&r.catch)r.catch(()=>{})}catch(e){}}
fsb.onclick=()=>{goFs(!document.fullscreenElement);fsb.blur()}; // blur обязателен: иначе Enter/Пробел снова «нажмут» кнопку и выбьют из фулскрина
addEventListener('fullscreenchange',fss);fss();

const lifeBt=document.getElementById('жизнь'),guideLife=document.getElementById('гайд-жизнь');
function lifeUi(){const can=bank>=LIFEPRICE;lifeBt.classList.toggle('ok',can);guideLife.classList.toggle('ok',can);lifeBt.disabled=!can}
function buyLife(){
 if(bank<LIFEPRICE)return false;
 bank-=LIFEPRICE;extras++;
 if(P){P.hp++;pops.push({x:P.x+12,y:P.y-26,s:'жизнь +1',st:1,c:'#5ce1e6',rot:0,l:44})} // уже в игре — сердце сразу в руках
 save();lifeUi();snd('coin');return true
}
// reset() в game.js жёстко ставит hp:3, поэтому купленные сердца добавляем поверх — иначе покупка сбрасывалась бы на каждом уровне
const _reset=reset;reset=function(i){_reset(i);P.hp=3+extras;lifeUi()};
lifeBt.onclick=()=>{buyLife();lifeBt.blur()};
lifeUi();
toMap();
const ST=1000/60;let acc=0,lp=performance.now(); // физика фиксированным шагом 60Гц, картинка — на частоте экрана
(function loop(n){requestAnimationFrame(loop);acc+=Math.min(n-lp,250);lp=n; // 250мс потолок: после возврата на вкладку не догоняем секунды
 while(acc>=ST){update();acc-=ST}
 if(state!='map')draw()})(lp);
