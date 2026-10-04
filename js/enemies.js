function hater(e){
  if(e.ed>0){const gy=e.y0+e.h,gx=e.x+15,k=1-(e.y0-e.y)/EDROP,pu=Math.sin(t*.25); // телеграф входа: тень и кольцо на своей площадке плюс метка сверху. Пока хейтер летит, игрок видит, откуда он придёт, — иначе он просто возникает в кадре
   g.save();g.globalAlpha=.18+.4*k;g.fillStyle='#000';g.beginPath();g.ellipse(gx,gy,9+15*(1-k),3.5+5*(1-k),0,0,7);g.fill(); // тень на земле: широкая и бледная в высоте, собирается и густеет к точке приземления
   g.globalAlpha=.3+.45*k;g.strokeStyle='#ff5c8a';g.lineWidth=2;g.beginPath();g.ellipse(gx,gy,14+4*pu,5+2*pu,0,0,7);g.stroke();
   g.globalAlpha=.85;g.fillStyle='#ffd54a';g.beginPath();g.moveTo(gx,gy-32+6*k);g.lineTo(gx+8,gy-43+6*k);g.lineTo(gx-8,gy-43+6*k);g.closePath();g.fill();g.restore()}
  if(e.k===5)return haterBoss(e); // 👑 Директор рисуется сам, в обход общей фигурки хейтера
  const k=e.k,c=['#ff5f4d','#ffa62b','#b98cff','#25e3c4'][k],lc=['#5ce1e6','#ffd54a','#c39bd3','#ff5c8a'][k]; // сочные тона: тёмный финал больше не съедает силуэт
  g.save();g.translate(e.x,e.y);
  if(k>2){g.fillStyle='#ffd54a';g.beginPath();g.moveTo(3,3);g.lineTo(8,-7);g.lineTo(13,3);g.lineTo(18,-7);g.lineTo(23,3);g.lineTo(28,-7);g.lineTo(33,3);g.closePath();g.fill()} // корона босса
  rr(0,6,30,28,8,c);rr(3,0,24,14,6,'#33224d');
  g.lineWidth=2;g.strokeStyle='#150a22';g.beginPath();g.roundRect(0,6,30,28,8);g.roundRect(3,0,24,14,6);g.stroke(); // тёмный контур: читается и на светлом небе, и на тёмном
  if(k>1){g.fillStyle='#ffd54a';g.beginPath();g.moveTo(2,11);g.lineTo(-5,2);g.lineTo(2,5);g.fill();g.beginPath();g.moveTo(28,11);g.lineTo(35,2);g.lineTo(28,5);g.fill()} // шипы
  g.fillStyle='#fff';g.fillRect(7,8,6,5);g.fillRect(17,8,6,5);
  g.fillStyle='#000';g.fillRect(9,10,3,3);g.fillRect(18,10,3,3);
  g.strokeStyle='#000';g.lineWidth=2;g.beginPath();g.moveTo(6,6);g.lineTo(14,9);g.moveTo(24,6);g.lineTo(16,9);g.stroke();
  g.fillStyle='#000';g.fillRect(10,22,10,3);
  if(e.hp>1){g.fillStyle='#ff5c8a';for(let i=0;i<e.hp;i++)g.fillRect(5+i*8,-11,6,4)} // деления жизни
  g.save();g.translate(15,-7);g.rotate(-.1);g.font='bold 11px system-ui';g.textAlign='center';g.lineWidth=3;g.strokeStyle='#1c1526';g.strokeText(e.tx,0,0);g.fillStyle=lc;g.fillText(e.tx,0,0);g.restore();
  g.restore();
}
 // Босс нарисован примитивами: та же фигурка хейтера, только втрое и с короной
 function haterBoss(e){
  const W=e.w,S=W/30,h=e.h,pv=e.hp<=e.bs/2;
  g.save();g.translate(e.x,e.y);g.scale(S,S);
  g.fillStyle='#ffd54a';g.beginPath();g.moveTo(3,3);g.lineTo(8,-7);g.lineTo(13,3);g.lineTo(18,-7);g.lineTo(23,3);g.lineTo(28,-7);g.lineTo(33,3);g.closePath();g.fill(); // корона
  rr(0,6,30,28,8,'#2b1038');rr(3,0,24,14,6,pv?'#8e44ad':'#3b2158');
  g.lineWidth=1.2;g.strokeStyle=pv?'#ff2d55':'#ff8fc0';g.beginPath();g.roundRect(0,6,30,28,8);g.roundRect(3,0,24,14,6);g.stroke(); // тёмный силуэт с ярким контуром вместо сливания с небом
  const hf=e.ht>0&&(t>>1)%2===0; // рога вспыхивают белым ровно в окне удара: босс держит удар и неуязвим — видно, куда бить
  g.fillStyle=hf?'#fff':pv?'#ff2d55':'#ffd54a';g.beginPath();g.moveTo(2,11);g.lineTo(-5,2);g.lineTo(2,5);g.fill();g.beginPath();g.moveTo(28,11);g.lineTo(35,2);g.lineTo(28,5);g.fill(); // рога
  g.fillStyle='#fff';g.fillRect(6,8,8,6);g.fillRect(16,8,8,6);
  g.fillStyle='#ff2d55';g.fillRect(9,10,4,4);g.fillRect(18,10,4,4); // злые глаза
  g.strokeStyle='#000';g.lineWidth=2;g.beginPath();g.moveTo(5,6);g.lineTo(13,9);g.moveTo(25,6);g.lineTo(17,9);g.stroke();
  g.fillStyle='#000';g.fillRect(8,22,14,3);
  if(e.tq>0){g.fillStyle='#fff';for(let i=0;i<5;i++){g.beginPath();g.moveTo(3+i*6,25);g.lineTo(6+i*6,20);g.lineTo(9+i*6,25);g.fill()}} // замах: зубастая ухмылка
  g.save();g.translate(15,-7);g.rotate(-.1);g.font='bold 11px system-ui';g.textAlign='center';g.lineWidth=3;g.strokeStyle='#1c1526';g.strokeText(e.tx,0,0);g.fillStyle=pv?'#ff5c8a':'#ff2d55';g.fillText(e.tx,0,0);g.restore();
  g.save();g.translate(15,-23);g.font='bold 7px system-ui';g.textAlign='center';g.lineWidth=2.5;g.strokeStyle='#1c1526';g.strokeText('БЕЙ ПО РОГАМ',0,0);g.fillStyle='#ffd54a';g.fillText('БЕЙ ПО РОГАМ',0,0);g.restore(); // подсказка над боссом: куда бить
  g.restore();
  const bw=W,frac=e.hp/e.bs; // полоса прочности под боссом
  g.fillStyle='#000000aa';rr(e.x,e.y+h+6,bw,9,4,'#000000aa');
  g.fillStyle=pv?'#ff2d55':'#ff8fc0';rr(e.x,e.y+h+6,bw*frac,9,4,pv?'#ff2d55':'#ff8fc0');
  if(pv){g.fillStyle='#fff';g.font='bold 11px system-ui';g.textAlign='center';g.fillText('ЗЛОЙ РЕЖИМ',e.x+bw/2,e.y+h+26)}
 }
 