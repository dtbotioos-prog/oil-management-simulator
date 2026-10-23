/* v3.8.4 — small-field reports and size-neutral company rating. Legacy saves unchanged. */
function small44active(){return !!s?.small}
function small44wells(){return (s.assets?.wellList||[]).filter(w=>w.status==='Работает')}
function small44shops(){
 let wells=small44wells(),names=[...new Set(wells.map(w=>w.unit||'ГУ-1'))];
 if(!names.length)names=['ГУ-1'];
 let total=names.map(n=>wells.filter(w=>(w.unit||'ГУ-1')===n).reduce((a,w)=>a+Math.max(0,(+w.rate||0)*(1-(+w.water||0)/100)),0));
 let sum=total.reduce((a,b)=>a+b,0);
 return names.map((name,i)=>({id:i,name,weight:sum?total[i]/sum:1/names.length}));
}
const small44oldShops=v38shops;
v38shops=function(){return small44active()?small44shops():small44oldShops()};
const small44OldMonth=v38month;
v38month=function(i){
 if(!small44active())return small44OldMonth(i);
 let d=v38init(),v=v8init(),key=v.year+'-'+i,entry=d.shops[key],shops=small44shops();
 if(!entry||(!entry.locked&&(entry.rows.length!==shops.length||entry.rows.some((r,j)=>r.name!==shops[j].name)))){
  let plan=Number(v.plans[i])||0,allocated=0,rows=shops.map((sh,j)=>{
   let p=j===shops.length-1?plan-allocated:Math.round(plan*sh.weight);
   allocated+=p;
   return {id:sh.id,name:sh.name,plan:p,actual:0};
  });
  // Preserve recorded production if the operating unit was renamed mid-month.
  let actual=entry?.rows?.reduce((a,r)=>a+(Number(r.actual)||0),0)||0;
  let assigned=0;rows.forEach((r,j)=>{r.actual=j===rows.length-1?actual-assigned:Math.round(actual*shops[j].weight*10)/10;assigned+=r.actual});
  d.shops[key]={rows,locked:false};
 }
 return d.shops[key];
};
const small44OldAnnual=v38setAnnual;
v38setAnnual=async function(){
 if(!small44active())return small44OldAnnual();
 let d=v38init(),v=v8init(),current=v.plans.reduce((a,b)=>a+b,0);
 let raw=await uiPrompt('Годовой план малого промысла, тонн:',String(Math.round(current)));
 if(raw===null)return;
 let total=Number(raw),idx=v8idx(),closed=v.plans.slice(0,idx).reduce((a,b)=>a+b,0);
 if(!Number.isFinite(total)||total<0||total>1000000||total<closed)return uiAlert('План должен быть не меньше утверждённых закрытых месяцев и не более 1 000 000 т.');
 let reason=await uiPrompt('Основание изменения плана:');if(!reason?.trim())return;
 let days=Array.from({length:12-idx},(_,i)=>new Date(v.year,idx+i+1,0).getDate());
 let remaining=total-closed,den=days.reduce((a,b)=>a+b,0),assigned=0;
 for(let j=idx;j<12;j++){let n=j===11?remaining-assigned:Math.round(remaining*days[j-idx]/den);v.plans[j]=n;assigned+=n;delete d.shops[v.year+'-'+j]}
 d.annual=v.plans.reduce((a,b)=>a+b,0);
 d.decisions.unshift(v8date()+': скорректирован план малого промысла до '+d.annual+' т. '+reason.trim());
 save();render();
};
const small44OldPlans=v38plansView;
v38plansView=function(){
 if(!small44active())return small44OldPlans();
 let v=v8init(),d=v38init(),idx=v8idx(),entry=v38month(idx);
 let yearPlan=v.plans.reduce((a,b)=>a+(Number(b)||0),0);
 let fact=v.monthHistory.filter(h=>h.year===v.year).reduce((a,h)=>a+(Number(h.actual)||0),0)+(Number(v.monthActual)||0);
 let pct=(p,a)=>p>0?f(a/p*100)+'%':(a>0?'Вне плана':'—');
 let out='<section class="v38-panel"><h2>План и факт малого нефтепромысла</h2><p class="muted">Отчёт показывает только существующие производственные узлы и действующие скважины. Добыча не приравнивается к реализации.</p>';
 out+='<div class="v38-stats"><div><small>Годовой план</small><strong>'+f(yearPlan)+' т</strong></div><div><small>Добыто с начала года</small><strong>'+f(fact)+' т</strong></div><div><small>Выполнение</small><strong>'+pct(yearPlan,fact)+'</strong></div></div>';
 out+='<button class="mini-btn" data-v38-annual>Изменить годовой план</button>';
 out+='<h3>Действующие производственные узлы · '+V8_MONTHS[idx]+'</h3><div class="table-scroll"><table class="v8table"><thead><tr><th>Узел</th><th>План, т</th><th>Факт, т</th><th>Выполнение</th></tr></thead><tbody>';
 for(let r of entry.rows)out+='<tr><td>'+esc(r.name)+'</td><td>'+f(r.plan)+'</td><td>'+f(r.actual)+'</td><td>'+pct(r.plan,r.actual)+'</td></tr>';
 out+='</tbody></table></div><h3>Закрытые месяцы</h3>';
 for(let h of v.monthHistory.filter(x=>x.year===v.year).slice(-12).reverse()){
  let rows=d.closed.find(x=>x.year===h.year&&x.month===h.month)?.rows||[];
  out+='<details class="v38-closed"><summary>'+V8_MONTHS[h.month]+': '+f(h.actual)+' / '+f(h.plan)+' т · '+pct(h.plan,h.actual)+'</summary>';
  for(let r of rows)out+=row(esc(r.name),f(r.actual)+' / '+f(r.plan)+' т · '+pct(r.plan,r.actual));
  out+='</details>';
 }
 return out+'</section>';
};
const small44OldPlayer=v37player;
v37player=function(year){
 let result=small44OldPlayer(year);
 if(!small44active())return result;
 let v=v8init(),hist=v.monthHistory.filter(h=>h.year===year);
 let plan=hist.reduce((a,h)=>a+(+h.plan||0),0)+(v.year===year?(+v.plans[v8idx()]||0):0);
 let actual=hist.reduce((a,h)=>a+(+h.actual||0),0)+(v.year===year?(+v.monthActual||0):0);
 let clamp=x=>Math.max(0,Math.min(100,Math.round(x)));
 // Evaluate efficiency against the company's own plan, never absolute large-field output.
 result.aspects.production=clamp(plan>0?Math.min(100,actual/Math.max(1,plan)*100):50);
 let g=growInit(),campReady=!!g?.campReady;
 // A camp is not mandatory for a 12-person field. No phantom penalties or bonuses.
 result.aspects.camp=campReady?result.aspects.camp:70;
 result.aspects.staff=clamp((v.morale||70)*.5+(v.conditions||70)*.5);
 result.aspects.investment=clamp(55+Math.min(25,(s.small.projects||[]).filter(p=>p.status==='Введена').length*12));
 result.score=v37score(result.aspects);
 return result;
};
const small44OldEquip=v39equipment;
v39equipment=function(){
 if(!small44active())return small44OldEquip();
 let key=v39key(),wells=s.assets?.wellList||[],problem=wells.filter(w=>+w.health<=75||w.status!=='Работает');
 let text='ЕЖЕМЕСЯЧНАЯ ТЕХНИЧЕСКАЯ СВОДКА МАЛОГО ПРОМЫСЛА\nДата: '+v8date()+
 '\nВсего скважин: '+wells.length+'; действующих: '+small44wells().length+
 '\nРВС: '+(v30init().tanks||[]).length+'; производственные узлы: '+small44shops().length+'.\n';
 if(!problem.length)text+='Остановленных скважин и скважин с состоянием 75% и ниже не выявлено.';
 else text+=problem.map(w=>'Скв. №'+w.id+' · '+(w.unit||'ГУ-1')+' · '+w.status+' · состояние '+w.health+'%').join('\n');
 text+='\nИгровые пороги состояния оборудования не являются нормативными требованиями.';
 v39mail(key,'equipment','Техническая сводка малого промысла',text);
};
const small44OldCampView=v36campView;
v36campView=function(){
 if(!small44active()||growInit()?.campReady)return small44OldCampView();
 return '<section class="small-panel"><h3>Бытовое обеспечение</h3><p class="muted">Используется бытовой вагончик и подрядные услуги. Вахтовый посёлок отсутствует; показатели общежитий и столовой не применяются.</p></section>';
};
