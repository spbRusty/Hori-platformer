const mapEl=document.getElementById('map');
const pathEl=document.getElementById('path');
const statEl=document.getElementById('статы');

function toMap(){
 state='map';
 document.body.classList.add('menu');
 mapEl.style.display='flex';
 pathEl.textContent='';
 statEl.innerHTML='<span>пройдено '+done.length+'/'+LV.length+'</span><span>банк '+bank+' ₽</span><span>щит ×'+shield+'</span><span>рекорд '+Math.max(0,...best)+' ₽</span>';
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
  b.innerHTML='<b>'+(i+1)+'</b><span>'+lv.n+'</span><i>'+(best[i]?best[i]+' ₽':'—')+'</i>'+(done.indexOf(i)>=0?'<u>✓</u>':'');
  if(un){
   b.onclick=()=>reset(i);
   b.onmouseenter=()=>{mapSelI=mapBtns.findIndex(x=>x[0]==i);mapSel(0)};
   mapBtns.push([i,b]);
   pathEl.append(b);
  }
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
