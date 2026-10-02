function girl(){
  rnS+=((Math.abs(P.vx)>RUNV&&P.on?1:0)-rnS)*.28; // поза бега догоняет порог, а не щёлкает 0<->1 на нём
 const x=P.x,f=P.f,run=rnS,ph=t*.5; // инерция гасит vx долго — рисуем бег только когда реально бежим
 let y=P.y;
 if(P.inv>0&&shieldT<=0&&(t>>2)%2)return; // мигание неуязвимости полностью прятало героя, и на щите (inv=90) он мог исчезнуть совсем
 y-=Math.abs(Math.sin(ph))*2*run;
 lndS+=((P.lnd>0?1:0)-lndS)*.34; // squash набегает и сходит плавно: срезка по P.lnd прыгала на 0.98 в последний кадр
 const S='#f2c6a0',K='#1c1526',flip=P.jp>0&&!P.on,land=lndS;
 g.save();
 if(flip||run){g.translate(x+12,y+22);g.rotate(flip?(1-P.jp/20)*6.2832*f:.06*f);g.translate(-x-12,-y-22)}
 if(land){g.translate(x+12,y+44);g.scale(1+.25*land,1-.25*land);g.translate(-x-12,-y-44)}
// ноги: стройные, гольфы с полосой
  [[x+7.5+Math.sin(ph)*5*run],[x+13+Math.sin(ph+Math.PI)*5*run]].forEach(l=>{const lx=l[0];
   rr(lx,y+29,3,9,1.5,S);
   rr(lx-.5,y+37,4,8,1.5,K);g.fillStyle='#ff5c8a';g.fillRect(lx-.5,y+37,4,2);
   rr(lx-1,y+43,4,3,1,'#111')});
  rr(x+8,y+26,8,5,2,'#3b6fd8'); // шорты
  g.fillStyle='#2f57a8';g.beginPath();g.moveTo(x+6,y+26);g.lineTo(x+18,y+26);g.lineTo(x+20,y+33);g.lineTo(x+4,y+33);g.closePath();g.fill(); // мини-юбка
  g.fillStyle='#6f9ae8';g.fillRect(x+5,y+32,15,1);
  g.fillStyle='#161616';g.beginPath();g.moveTo(x+6,y+13);g.lineTo(x+18,y+13);g.lineTo(x+17,y+25);g.lineTo(x+7,y+25);g.closePath();g.fill(); // футболка с талией
  g.fillStyle='#ff5c8a';g.font='bold 8px system-ui';g.textAlign='center';g.fillText('♥',x+12,y+21);
  g.fillStyle='#ff5c8a';g.fillRect(x+8,y+24,8,1);
  // руки-рукава (тату)
  [x+5,x+16].forEach(ax=>{rr(ax,y+13,3,12,2,S);rr(ax,y+13,3,12,2,'#243b55');
   g.fillStyle='#8fc1e8';g.fillRect(ax+1,y+16,1,2);g.fillRect(ax+1,y+20,1,2);
   g.fillStyle='#e0577a';g.fillRect(ax+1,y+18,1,1);g.fillRect(ax+1,y+23,1,1)});
  g.fillStyle=S;g.fillRect(x+11,y+9,2,4); // шея
 // волосы до плеч, чёлка и хвостик
  g.fillStyle='#141019';g.beginPath();g.ellipse(x+12,y+3,8,9,0,0,7);g.fill();
  rr(x+4,y+3,4,19,2,'#141019');rr(x+16,y+3,4,19,2,'#141019');
  g.fillStyle='#221d2c';g.beginPath();g.ellipse(x+11,y+1,5,3,0,0,7);g.fill();
  g.fillStyle='#141019';g.beginPath();g.ellipse(x+(f>0?20:4),y+9,3,7,.4*f,0,7);g.fill();
  g.fillStyle=S;g.beginPath();g.arc(x+12,y+8,5,0,7);g.fill(); // лицо
  g.fillStyle='#141019';g.beginPath();g.arc(x+12,y+5,5.5,Math.PI,0);g.fill(); // чёлка
  g.fillRect(x+(f>0?12:5),y+3,6,4);
  g.fillStyle='#1b1b22';g.fillRect(x+9+f,y+8,3,3);g.fillRect(x+13+f,y+8,3,3); // глаза
  g.fillRect(x+9+f,y+7,3,1);g.fillRect(x+14+f,y+7,3,1); // ресницы
  g.fillStyle='#ff9bb0';g.globalAlpha=.45;g.fillRect(x+7,y+11,3,1);g.fillRect(x+14,y+11,3,1);g.globalAlpha=1; // румянец
 // меч: за взмах машет из стороны в сторону (маятник), в покое — за спиной
  const pr=P.atk>0?1-P.atk/SWING:1,saT=P.atk>0?Math.sin(pr*6.283)*1.2:1.3;
 swA+=(saT-swA)*.35;const sa=swA; // угол догоняет цель: напрямую при появлении цели прыгал с 1.3 на 0 рад (74°) за один кадр
 g.save();g.translate(x+12,y+22);g.scale(f,1);
 if(P.atk>0){g.globalAlpha=.4;g.strokeStyle='#dfe9ff';g.lineWidth=6;g.beginPath();g.arc(0,0,38,sa-.6,sa+.1);g.stroke();g.globalAlpha=1}
  g.rotate(sa);
  if(P.atk>0){g.shadowBlur=13;g.shadowColor='#bfe6ff'} // клинок светится на взмахе
  g.fillStyle='#8a5a2b';g.fillRect(-2.5,-6,5,13); // рукоять
  g.fillStyle='#5d3a1a';g.fillRect(-2.5,-3,5,1.7);g.fillRect(-2.5,.7,5,1.7);g.fillRect(-2.5,4,5,1.7); // хват
  g.fillStyle='#ffd54a';g.beginPath();g.arc(0,10,4.4,0,7);g.fill(); // навершие
  g.fillStyle='#c9a227';g.fillRect(-9,-10,18,3.6);g.fillRect(-9,-10,3.6,3.6);g.fillRect(5.4,-10,3.6,3.6); // гарда
  g.fillStyle='#eaf4ff';g.beginPath(); // клинок, сужается к острию
  g.moveTo(-2.8,-9.4);g.lineTo(2.8,-9.4);g.lineTo(2.3,-37);g.lineTo(0,-43);g.lineTo(-2.3,-37);g.closePath();g.fill();
  g.fillStyle='#9fb6d4';g.fillRect(-1,-13,2,25); // дол
  g.fillStyle='#fff';g.fillRect(-1.8,-14,1.5,23); // блик
  g.restore();
  g.restore();
 if(flip){const a=t*.35;g.fillStyle='#ffd54a';g.beginPath();g.arc(x+12+Math.cos(a)*15,y-3+Math.sin(a)*6,2.6,0,7);g.fill()}
 if(shieldT>0){g.globalAlpha=Math.min(1,shieldT/30);g.strokeStyle='#5ce1e6';g.lineWidth=4;g.beginPath();g.arc(x+12,y+22,34,0,7);g.stroke();
   g.strokeStyle='#ffffffaa';g.lineWidth=2;g.beginPath();g.arc(x+12,y+22,29,0,7);g.stroke();g.globalAlpha=1}
}
 