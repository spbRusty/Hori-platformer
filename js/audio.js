// --- звук: синтез, без файлов. До-мажорная пентатоника, мягкая атака 12мс
let AC,MASTER,MUTE=0,MUSG,MUSX;
function audio(){if(AC)return;try{AC=new (window.AudioContext||window.webkitAudioContext)}catch(e){return}
 MASTER=AC.createGain();MASTER.gain.value=.16;const lp=AC.createBiquadFilter();lp.type='lowpass';lp.frequency.value=6000;MASTER.connect(lp);lp.connect(AC.destination);
 MUSX=AC.createGain();MUSX.gain.value=2.7; // усилитель только музыки: MASTER не трогаем, звуки остаются как были
 MUSG=AC.createGain();MUSG.gain.value=VVOL[vlv];MUSG.connect(MUSX);MUSX.connect(MASTER);mus.next=AC.currentTime+.12;setInterval(musTick,25)}
function n(f,d,g,type,delay,glide){if(!AC||MUTE)return;const a=AC.createOscillator(),v=AC.createGain(),t=AC.currentTime+(delay||0);
 a.type=type||'sine';a.frequency.setValueAtTime(f,t);if(glide)a.frequency.exponentialRampToValueAtTime(f*glide,t+d);
 v.gain.setValueAtTime(0,t);v.gain.linearRampToValueAtTime(g,t+.012);v.gain.exponentialRampToValueAtTime(.0001,t+d);
 a.connect(v);v.connect(MASTER);a.start(t);a.stop(t+d+.03)}
function swish(){if(!AC||MUTE)return;const L=AC.sampleRate*.13,b=AC.createBuffer(1,L,AC.sampleRate),d=b.getChannelData(0);
 for(let i=0;i<L;i++)d[i]=(Math.random()*2-1)*(1-i/L)*(1-i/L);
 const s=AC.createBufferSource(),f=AC.createBiquadFilter(),v=AC.createGain(),t=AC.currentTime;
 s.buffer=b;f.type='bandpass';f.Q.value=1.2;f.frequency.setValueAtTime(2800,t);f.frequency.exponentialRampToValueAtTime(650,t+.13);
 v.gain.value=.45;s.connect(f);f.connect(v);v.connect(MASTER);s.start(t)}
function ha(f,d,v,dl,fq){if(!AC||MUTE)return; // «ха»: пила с резким падом высоты через formant-фильтр — иначе смех не читается, а просто пищит
 const a=AC.createOscillator(),bp=AC.createBiquadFilter(),v2=AC.createGain(),t=AC.currentTime+(dl||0);
 a.type='sawtooth';a.frequency.setValueAtTime(f,t);a.frequency.exponentialRampToValueAtTime(f*.7,t+d*.85);
 bp.type='bandpass';bp.Q.value=4;bp.frequency.value=fq;
 v2.gain.setValueAtTime(0,t);v2.gain.linearRampToValueAtTime(v,t+.012);v2.gain.exponentialRampToValueAtTime(.0001,t+d);
 a.connect(bp);bp.connect(v2);v2.connect(MASTER);a.start(t);a.stop(t+d+.03)}
let lgT=0;
function laugh(k){if(!AC||MUTE)return; // k=1 — ехидный смех хейтера (вниз), иначе победный смех Вали (вверх)
 if(!k&&AC.currentTime-lgT<.16)return;if(!k)lgT=AC.currentTime; // срезка кластера фраз: четыре «ха» разом — каша
 for(let i=0;i<4;i++)ha(k?250*(1-i*.1):420*(1+i*.16),k?.1:.075,k?.19:.24,i*(k?.1:.075),k?680:1150)}
function snd(k){if(!AC||MUTE)return;
 if(k=='jump')n(587,.22,.5,'triangle',0,1.5);
 else if(k=='djump'){n(880,.2,.34,'triangle',0,2);n(1320,.16,.2,'sine',.06,1.4)} // двойной прыжок — свист выше
 else if(k=='swing')swish();
  else if(k=='kill'){n(784,.12,.45,'triangle');n(1175,.26,.35,'sine',.06);laugh(0)} // хейтер умирает — аккорд и победный смех Вали
  else if(k=='ph'){n(1500,.06,.26,'square',0,.35);laugh(0)} // фраза лопнула — «пик» и смешок
  else if(k=='coin'){n(1047,.1,.3,'sine');n(1568,.2,.28,'sine',.05)}
  else if(k=='hurt'){n(196,.3,.5,'sawtooth',0,.5);n(340,.14,.32,'square',.02,.5);laugh(1)} // Валя: «ах!», потом ехидный смех хейтера
 else if(k=='win'){[523,659,784,1047].forEach((f,i)=>n(f,.55,.3,'triangle',i*.09));n(2093,.75,.12,'sine',.36)}
 else if(k=='lose'){[392,370,330,247].forEach((f,i)=>n(f,.6,.28,'triangle',i*.14))}
 else if(k=='start'){[523,784].forEach((f,i)=>n(f,.4,.22,'sine',i*.08))}
 else if(k=='shield'){n(1047,.16,.3,'sine');n(1568,.24,.28,'sine',.05);n(2093,.3,.18,'sine',.1)}}
// --- музыка: chiptune/synthwave. Планировщик с упреждением, свойmute, в опасности — октава выше и двойной удар
const CHORDS=[[220,261.63,329.63],[174.61,220,261.63],[196,246.94,293.66],[164.81,207.65,246.94],[261.63,329.63,392],[293.66,349.23,440]]; // Am F G E C Dm
const ROOTS=[110,87.31,98,82.41,130.81,146.83];
const PROG=[0,1,2,3,4,2,3,0]; // 8 тактов: два раунда по 4 с разворотом — не приедается
const MELV=[0,null,3,7,5,null,3,2, 0,null,-3,null,0,null,null,null, 3,5,7,10,12,null,10,7, 5,null,3,null,0,null,null,null,
            0,3,5,3,7,null,5,7, 10,7,5,3,2,null,0,null, 3,null,5,7,8,7,5,3, 2,0,-1,null,0,null,null,null].map(s=>s==null?0:440*Math.pow(2,s/12));
const mus={on:1,step:0,next:0,danger:0};
function musBtn(){mus.on=mus.on?0:1;if(mus.on&&AC&&mus.next<AC.currentTime)mus.next=AC.currentTime+.05;
 const b=document.getElementById('муз');if(b)b.classList.toggle('off',!mus.on)}
function dangerNow(){return !!(P&&P.hp<=1)||!!(P&&foes&&foes.some(e=>!e.dead&&Math.abs(e.x-P.x)<170))} // драма: одна жизнь или хейтер рядом
function mnote(f,d,v,ty,t0){if(!AC||!mus.on||MUTE)return;const a=AC.createOscillator(),v2=AC.createGain();
 a.type=ty;a.frequency.setValueAtTime(f,t0);
 v2.gain.setValueAtTime(0,t0);v2.gain.linearRampToValueAtTime(v,t0+.008);v2.gain.exponentialRampToValueAtTime(.0001,t0+d);
 a.connect(v2);v2.connect(MUSG);a.start(t0);a.stop(t0+d+.02)}
function mnoise(t0,d,v,f){if(!AC||!mus.on||MUTE)return;const L=AC.sampleRate*d|0,b=AC.createBuffer(1,L,AC.sampleRate),z=b.getChannelData(0);
 for(let i=0;i<L;i++)z[i]=Math.random()*2-1;
 const s=AC.createBufferSource(),hp=AC.createBiquadFilter(),v2=AC.createGain();
 s.buffer=b;hp.type='highpass';hp.frequency.value=f;
 v2.gain.setValueAtTime(v,t0);v2.gain.exponentialRampToValueAtTime(.0001,t0+d);
 s.connect(hp);hp.connect(v2);v2.connect(MUSG);s.start(t0)}
function mkick(t0,v){if(!AC||!mus.on||MUTE)return;const a=AC.createOscillator(),v2=AC.createGain();
 a.type='sine';a.frequency.setValueAtTime(165,t0);a.frequency.exponentialRampToValueAtTime(42,t0+.13);
 v2.gain.setValueAtTime(v,t0);v2.gain.exponentialRampToValueAtTime(.0001,t0+.18);
 a.connect(v2);v2.connect(MUSG);a.start(t0);a.stop(t0+.2)}
function musStep(s,t0){const D=mus.danger,bar=s>>3,i=s&7,c=PROG[bar],ch=CHORDS[c],rt=ROOTS[c],arp=[0,1,2,1,0,2,1,2];
 if(i===0||i===4)mnote(rt,D?.24:.17,.3,'sawtooth',t0);           // бас
 if(i%2===0)mnote(ch[arp[i]],.12,D?.13:.09,'square',t0);           // арпеджио восьмыми — движение есть, а не бубнение одной нотой
 const m=MELV[s];if(m)mnote(m*(D?2:1),.18,D?.12:.08,'square',t0);  // мелодия
 if(i===0)mnote(ch[0]*2,.55,D?.07:.05,'triangle',t0);              // подушка на тонике аккорда
 if(bar%4===3&&i===6)mnote(MELV[s]*2,.14,.05,'square',t0);         // эхо на последнем такте раунда
 if(i===0||i===3)mkick(t0,D?.5:.34);
 if(i===4)mnoise(t0,.11,D?.15:.1,1500);
 if(i&1)mnoise(t0,.03,D?.07:.04,7000);
 if(D&&i===6)mnoise(t0,.08,.05,3200);
 if(bar===7&&i>=5)mnoise(t0,.05,.06,4000)}                        // фил в конце раунда
function musTick(){if(!AC)return;const spb=60/112/4; // 112 BPM, шестнадцатые
 while(mus.next<AC.currentTime+.15){mus.danger=dangerNow()?1:0;musStep(mus.step,mus.next);mus.step=mus.step+1&63;mus.next+=spb}
 if(mus.next<AC.currentTime)mus.next=AC.currentTime}
addEventListener('pointerdown',()=>{audio();if(AC&&AC.state=='suspended')AC.resume()});
document.getElementById('муз').onclick=()=>{audio();musBtn()}; // кнопка отключения музыки
