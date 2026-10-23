/* v3.8.5: state inspector findings and environmental penalties; fictional game values, mln KZT. */
const COMPLY_CASES=[
 {agency:'ДЧС',name:'Отсутствует актуальный акт проверки предохранительного устройства',cost:2.4,days:6,weight:3},
 {agency:'ДЧС',name:'Неисправное ограждение опасного участка',cost:1.8,days:4,weight:2},
 {agency:'ДЧС',name:'Не проведена проверка технического состояния оборудования',cost:3.2,days:9,weight:3},
 {agency:'Экология',name:'Нарушение порядка обращения с производственными отходами',cost:1.6,days:5,weight:2},
 {agency:'Экология',name:'Утечка нефтесодержащей жидкости на площадке',cost:4.8,days:12,weight:4},
 {agency:'Экология',name:'Не выполнено мероприятие экологического контроля',cost:1.2,days:4,weight:2}
];
function complyInit(){
 if(!s.comply)s.comply={cases:[],seq:0,inspections:0,events:[],lastMonth:-1};
 return s.comply;
}
function complyFinding(kind){
 let c=complyInit(),pool=COMPLY_CASES.filter(x=>x.agency===kind);
 let base=pool[Math.floor(Math.random()*pool.length)],id=++c.seq;
 let x={id,agency:kind,name:base.name,repairCost:base.cost,repairDays:base.days,
  fine:kind==='Экология'?+(base.cost*(.4+Math.random()*.9)).toFixed(2):0,
  finePaid:false,status:'Выявлено',remaining:0,created:v8date(),weight:base.weight};
 c.cases.unshift(x);c.events.unshift(kind+': выявлено несоответствие №'+id+' — '+x.name);
 if(kind==='Экология'&&x.fine>0){s.cash-=x.fine;v25post('incident',x.fine,{description:'Игровой экологический штраф: '+x.name,agency:kind,caseId:id});x.finePaid=true;c.events.unshift('Оплачен экологический штраф '+m(x.fine)+' по №'+id)}
 log('Проверка '+kind+': '+x.name);save();return x;
}
function complyFix(id){
 let x=complyInit().cases.find(z=>z.id===id);
 if(!x||x.status!=='Выявлено')return;
 if(s.cash<x.repairCost)return uiAlert('Недостаточно средств для устранения: '+m(x.repairCost));
 s.cash-=x.repairCost;
 v25post('maintenance',x.repairCost,{description:'Устранение предписания '+x.agency+' №'+x.id,agency:x.agency,caseId:x.id});
 x.status='Устранение';x.remaining=x.repairDays;
 complyInit().events.unshift('Начаты работы по предписанию №'+id+'; затраты '+m(x.repairCost));
 save();render();
}
function complyDay(){
 if(!s?.small)return;
 let c=complyInit();
 for(let x of c.cases){
  if(x.status==='Устранение'&&x.remaining>0&&--x.remaining===0){
   x.status='Устранено';c.events.unshift('Предписание '+x.agency+' №'+x.id+' исполнено');log('Устранено несоответствие №'+x.id);
  }
 }
 // Inspect only occasionally; one check per three game months, with a small chance of finding a problem.
 let v=v8init(),key=v.year*12+v8idx();
 if(s.day!==1||key%3!==0||c.lastMonth===key)return;
 c.lastMonth=key;c.inspections++;
 let kind=(c.inspections%2?'ДЧС':'Экология');
 if(Math.random()<.5)complyFinding(kind);
 else c.events.unshift('Проверка '+kind+': новых несоответствий не выявлено');
}
function complyView(){
 if(!s?.small)return '';
 let c=complyInit(),open=c.cases.filter(x=>x.status!=='Устранено');
 let spent=c.cases.reduce((a,x)=>a+(x.finePaid?x.fine:0)+(x.status!=='Выявлено'?x.repairCost:0),0);
 let h='<section class="small-panel"><h2>Государственные проверки и экология</h2><p class="muted">ДЧС: предписания и расходы на устранение. Экология: устранение нарушений и расчётные штрафы. Суммы условные, не являются расчётом штрафов по законодательству РК.</p>';
 h+='<div class="small-economy-grid"><div><small>Открытые предписания</small><b>'+open.length+'</b></div><div><small>Всего проверок</small><b>'+c.inspections+'</b></div><div><small>Расходы и штрафы</small><b>'+m(spent)+'</b></div></div>';
 h+='<div class="small-project"><b>Учебная проверка</b><p class="muted">Для тестирования механики; не влияет на реальную инспекционную периодичность.</p><button class="btn secondary" data-comply="inspect" data-agency="ДЧС">Проверка ДЧС</button> <button class="btn secondary" data-comply="inspect" data-agency="Экология">Проверка экологии</button></div>';
 for(let x of c.cases.slice(0,15)){
  h+='<div class="small-project"><b>'+esc(x.agency)+' · №'+x.id+' · '+esc(x.status)+'</b><p>'+esc(x.name)+'</p><p>Устранение: '+m(x.repairCost)+' / '+x.repairDays+' дней'+(x.agency==='Экология'?' · штраф: '+m(x.fine)+(x.finePaid?' (оплачен)':''):'')+'</p>';
  if(x.status==='Выявлено')h+='<button class="btn secondary" data-comply="fix" data-id="'+x.id+'">Профинансировать устранение</button>';
  if(x.status==='Устранение')h+='<p>Осталось '+x.remaining+' дней</p>';
  h+='</div>';
 }
 h+='<h3>Журнал проверок</h3>'+c.events.slice(0,10).map(t=>'<p class="muted">'+esc(t)+'</p>').join('')+'</section>';
 return h;
}
const complyOldAdvance=v8advance;
v8advance=function(){complyOldAdvance();complyDay()};
const complyOldRender=render;
render=function(){
 complyOldRender();
 if(!s?.small||tab!=='overview')return;
 let el=document.querySelector('#body');
 if(el){let wrap=document.createElement('div');wrap.innerHTML=complyView();el.append(wrap)}
};
document.addEventListener('click',e=>{
 let b=e.target.closest('[data-comply]');if(!b||!s?.small)return;
 if(b.dataset.comply==='fix')complyFix(+b.dataset.id);
 if(b.dataset.comply==='inspect'){complyInit().inspections++;complyFinding(b.dataset.agency);render()}
});
