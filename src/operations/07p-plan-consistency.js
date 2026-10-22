/* v3.7.4: remove duplicated month controls and reconcile monthly shop reporting. */
function v41reconcile(year,month,actual,plan){
 let d=v38init(),k=year+'-'+month,data=d.shops[k];if(!data||!data.rows.length)return;
 // The monthly company actual is authoritative. Keep shop shares and force exact sum.
 let rows=data.rows,prev=rows.reduce((a,r)=>a+Math.max(0,Number(r.actual)||0),0);
 let weights=prev>0?rows.map(r=>Math.max(0,Number(r.actual)||0)/prev):rows.map(r=>Math.max(0,Number(r.plan)||0)/Math.max(1,plan));
 let sum=weights.reduce((a,b)=>a+b,0)||1,assigned=0;
 rows.forEach((r,i)=>{r.actual=i===rows.length-1?actual-assigned:Math.round(actual*weights[i]/sum*10)/10;assigned+=r.actual});
 let planned=rows.reduce((a,r)=>a+Number(r.plan||0),0);
 if(Math.abs(planned-plan)>0.5){let ratio=planned>0?plan/planned:0,total=0;rows.forEach((r,i)=>{r.plan=i===rows.length-1?plan-total:Math.round(r.plan*ratio);total+=r.plan})}
}
// Show only one production-planning interface: annual plan, shop breakdown and detailed closures.
const v41oldDailyView=v8dailyView;
v8dailyView=function(){
 let html=v41oldDailyView();
 let start=html.indexOf('<h3>Корректировка планов по месяцам</h3>');
 if(start<0)return html;
 return html.slice(0,start)+'<p class="v8small">Изменение планов и разбор закрытых месяцев находятся ниже, в едином разделе «Годовой план добычи и выполнение по цехам».</p>';
};
const v41oldReport=v38report;
v38report=function(year,month){
 let v=v8init(),h=v.monthHistory.find(x=>x.year===year&&x.month===month);
 if(h){v41reconcile(year,month,h.actual,h.plan);let d=v38init(),existing=d.closed.find(x=>x.year===year&&x.month===month);if(existing){existing.actual=h.actual;existing.plan=h.plan;existing.rows=d.shops[year+'-'+month]?.rows.map(r=>({...r,rate:r.plan?r.actual/r.plan*100:100}))||existing.rows}}
 return v41oldReport(year,month);
};
// Repair older saves with impossible shop sums and inconsistent completion counts.
const v41oldPlansView=v38plansView;
v38plansView=function(){
 let v=v8init(),d=v38init();
 for(let h of v.monthHistory){let k=h.year+'-'+h.month,entry=d.shops[k];if(!entry)continue;
  let total=entry.rows.reduce((a,r)=>a+(Number(r.actual)||0),0);
  if(Math.abs(total-h.actual)>0.5){v41reconcile(h.year,h.month,h.actual,h.plan);let closed=d.closed.find(x=>x.year===h.year&&x.month===h.month);if(closed){closed.actual=h.actual;closed.plan=h.plan;closed.rows=entry.rows.map(r=>({...r,rate:r.plan?r.actual/r.plan*100:100}))}}
 }
 return v41oldPlansView();
};
