let extras=0,nick='',asked=0,records=[];
try{
 extras=+localStorage.getItem('hori_extras')||0;
 nick=localStorage.getItem('hori_nick')||'';
 asked=+localStorage.getItem('hori_asked')||0;
 records=JSON.parse(localStorage.getItem('hori_records')||'[]');
}catch(e){}
if(!Array.isArray(records))records=[];
records=records.filter(r=>r&&typeof r.n=='string'&&isFinite(r.s)); // мусорный JSON не должен ломать заглавный экран

const RECMAX=10; // таблица короткая: десять мест — иначе ники уезжают за край телефона
function addRecord(name,score){
 const s=Math.round(score);if(!(s>0))return false;
 const n=String(name).trim().slice(0,12);
 if(!n)return false;
 const at=records.findIndex(r=>r.n.toLowerCase()==n.toLowerCase()); // один игрок — одна строка, лучший результат
 if(at<0)records.push({n,s});else if(records[at].s<s)records[at].s=s;
 records.sort((a,b)=>b.s-a.s);records.length=Math.min(records.length,RECMAX);
 save();return true;
}
function save(){try{localStorage.setItem('hori_done',done.join(','));localStorage.setItem('hori_best',best.join(','));localStorage.setItem('hori_bank',bank);localStorage.setItem('hori_shield',shield);localStorage.setItem('hori_extras',extras);localStorage.setItem('hori_nick',nick);localStorage.setItem('hori_asked',asked);localStorage.setItem('hori_records',JSON.stringify(records))}catch(e){}}