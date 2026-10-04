const mapEl=document.getElementById('map');
const pathEl=document.getElementById('path');
const statEl=document.getElementById('статы');
const diffEl=document.getElementById('слож');
const recEl=document.getElementById('рекордсписок');
const nickEl=document.getElementById('ник');
const nickIn=document.getElementById('никполе');
const nickOk=document.getElementById('никок');
const nickIt=document.getElementById('никит');

function toMap(){
 state='map';
 if(document.fullscreenElement)goFs(0,1); // карта лежит вне #игр и в полноэкранном режиме не видна — выходим, сохраняя wantFs
 document.body.classList.add('menu');
 mapEl.style.display='flex';
 pathEl.textContent='';
 statEl.innerHTML='<span>пройдено '+done.length+'/'+LV.length+'</span>'; // только прогресс — банк/щит/рекорд убрали как мусор
  renderDiff();
  renderNick();
  renderRecords();
 const sv=document.createElementNS('http://www.w3.org/2000/svg','svg');
 sv.setAttribute('viewBox','0 0 100 100');
 sv.setAttribute('preserveAspectRatio','none');
 EDG.forEach(e=>{
  const l=document.createElementNS('http://www.w3.org/2000/svg','line');
  l.setAttribute('x1',NOD[e[0]][0]);l.setAttribute('y1',NOD[e[0]][1]);
  l.setAttribute('x2',NOD[e[1]][0]);l.setAttribute('y2',NOD[e[1]][1]);
  if(unl(e[1]))l.classList.add('on');
  sv.append(l);
 });
 pathEl.append(sv);
 mapBtns=[];
  LV.forEach((lv,i)=>{
   const b=document.createElement('button'),un=unl(i);
   b.disabled=!un;
   b.style.left=NOD[i][0]+'%';
   b.style.top=NOD[i][1]+'%';
   b.innerHTML='<span>'+lv.n+'</span><i>'+(best[i]?best[i]+' ₽':'—')+'</i>'+(done.indexOf(i)>=0?'<u>✓</u>':(un?'':'<u class="lock">🔒</u>')); // без номера этапа — визуальный мусор
   if(un){
    b.onclick=()=>reset(i);
    b.onmouseenter=()=>{mapSelI=mapBtns.findIndex(x=>x[0]==i);mapSel(0)};
    mapBtns.push([i,b]);
   }
   pathEl.append(b);
  });
 const k=mapBtns.findIndex(x=>x[0]==li);
 mapSelI=k<0?0:k;
 mapSel(0);
}
let mapSelI=0,mapBtns=[];
function mapSel(d){
 if(!mapBtns.length)return;
 mapSelI=(mapSelI+d+mapBtns.length)%mapBtns.length;
 mapBtns.forEach(([i,b],k)=>b.classList.toggle('sel',k==mapSelI));
}
function renderDiff(){
 diffEl.textContent='';
 const t=document.createElement('em');t.textContent='Сложность';diffEl.append(t);
 DIFF.forEach((d,k)=>{
  const b=document.createElement('button');
  b.textContent=d.n;b.title=d.ds;
  b.className=k==di?'sel':'';
  b.onclick=()=>{pickDiff(k);renderDiff()};
  diffEl.append(b)});
 const s=document.createElement('span');s.textContent=DF.ds;diffEl.append(s);
}

function totalScore(){return best.reduce((a,b)=>a+(+b||0),0)} // сумма лучших результатов по уровням — это и есть число в таблице
function renderRecords(){
 recEl.textContent='';
 if(!records.length){
  const e=document.createElement('div');e.className='пусто';e.textContent='пока пусто — пройди 3 уровня и впиши свой ник';recEl.append(e);return}
 records.forEach((r,k)=>{
  const li=document.createElement('li');if(r.n===nick)li.className='me';
  const i=document.createElement('i');i.textContent=k+1;
  const b=document.createElement('b');b.textContent=r.n;
  const s=document.createElement('s');s.textContent=r.s+' ₽';
  li.append(i,b,s);recEl.append(li)});
}
function renderNick(){
 nickEl.style.display=done.length>=3?'flex':'none';
 if(done.length<3)return;
 const at=records.findIndex(r=>r.n.toLowerCase()==nick.toLowerCase());
 if(at>=0){nickIt.textContent='ты в таблице: '+records[at].n+', место '+(at+1)+' из '+records.length;return}
 nickIt.textContent='в таблицу попадёт '+totalScore()+' ₽ — сумма лучших результатов';
 nickIn.value=nick;
}
nickOk.onclick=()=>{
 const v=nickIn.value.trim();
 if(!v){nickIt.textContent='впиши ник — пустую строку не берём';return}
 if(!addRecord(v,totalScore())){nickIt.textContent='не удалось записать результат';return}
 nick=v;asked=1;save();nickIn.value=v;renderRecords();renderNick()};
nickIn.addEventListener('keydown',e=>{if(e.key=='Enter'){e.preventDefault();nickOk.click()}});
