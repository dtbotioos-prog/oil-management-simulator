
/* v3.7: annual production targets, workshop monthly fact, monthly mail, personnel decisions. */
function v38init(){
 if(!s.v38)s.v38={year:v8init().year,annual:0,shops:{},closed:[],decisions:[],reportIds:[]};
 let x=s.v38;x.shops||={};x.closed||=[];x.decisions||=[];x.reportIds||=[];
 if(x.year!==v8init().year){x.year=v8init().year;x.annual=0}
 if(!x.annual)x.annual=v8init().plans.reduce((a,b)=>a+b,0);
 return x;
}
function v38shops(){
 let v=v8init(),d=v38init(),shops=TREE_SHOPS||[];
 let wells=s.assets.wellList||[],weights=shops.map((_,i)=>wells.filter(w=>w.shop===i&&w.status==='Работает').reduce((a,w)=>a+Math.max(0,w.rate*(1-w.water/100)),0));
 let sum=weights.reduce((a,b)=>a+b,0);
 if(!sum)weights=shops.map(()=>1),sum=shops.length;
 return shops.map((name,i)=>({id:i,name,weight:weights[i]/sum}));
}
function v38month(i){
 let d=v38init(),k=v8init().year+'-'+i;
 if(!d.shops[k]){
  let shop=v38shops(),plan=v8init().plans[i];
  d.shops[k]={rows:shop.map(x=>({id:x.id,name:x.name,plan:Math.round(plan*x.weight),actual:0})),locked:false};
  let rows=d.shops[k].rows;if(rows.length)rows[rows.length-1].plan+=plan-rows.reduce((a,x)=>a+x.plan,0);
 }
 return d.shops[k];
}
function v38allocate(dayOil,i){
 let d=v38month(i),shop=v38shops();
 for(let x of d.rows){let w=shop.find(y=>y.id===x.id)?.weight||0;x.actual+=dayOil*w}
}
function v38report(year,i){
 let d=v38init(),v=v8init(),h=v.monthHistory.find(x=>x.year===year&&x.month===i),data=d.shops[year+'-'+i];
 if(!h||!data)return;
 data.locked=true;
 let rows=data.rows.map(x=>({...x,rate:x.plan?100*x.actual/x.plan:100})),met=rows.filter(x=>x.rate>=100),miss=rows.filter(x=>x.rate<100);
 let id='monthly-'+year+'-'+i;
 if(d.reportIds.includes(id))return;
 let lines=rows.map(x=>x.name+': '+f(x.actual)+' / '+f(x.plan)+' т ('+f(x.rate)+'%)');
 let text='ЕЖЕМЕСЯЧНАЯ СВОДКА ПО ДОБЫЧЕ — '+V8_MONTHS[i]+' '+year+
 '\nПлан предприятия: '+f(h.plan)+' т; факт: '+f(h.actual)+' т; выполнение: '+f(h.rate)+'%; отклонение: '+f(h.actual-h.plan)+' т.'+
 '\nЦеха, выполнившие план: '+met.length+'; не выполнившие: '+miss.length+'.\n'+lines.join('\n')+
 '\nПричины отклонений необходимо проверить по фонду работающих скважин, простоям и обводнённости. Данные цехов рассчитаны по игровой модели.';
 let db=v14Sync();
 db.items.unshift({id,text,category:'production',created:v8date(),status:'new',choice:null,outcome:'',readAt:null});
 d.reportIds.push(id);d.closed.unshift({year,month:i,plan:h.plan,actual:h.actual,rows});
 if(d.closed.length>60)d.closed.length=60;
}
const v38oldAdvance=v8advance;
v8advance=function(){
 let v=v8init(),year=v.year,i=v8idx(),before=v.monthHistory.length;
 let weights=v38shops();
 let prior=v.monthActual;
 v38month(i);
 v38oldAdvance();
 let actual=v.year!==year||v8idx()!==i?(v.monthHistory[v.monthHistory.length-1]?.actual||prior)-prior:v.monthActual-prior;
 // Allocation uses real recorded daily produced oil, not theoretical well rates.
 let data=v38init().shops[year+'-'+i];
 if(data){let total=weights.reduce((a,x)=>a+x.weight,0)||1;for(let r of data.rows)r.actual+=Math.max(0,actual)*(weights.find(x=>x.id===r.id)?.weight||0)/total}
 if(v.monthHistory.length>before){
  // On December transition v38init resets year but old shop record remains.
  v38report(year,i);
 }
};
function v38setAnnual(){
 let d=v38init(),v=v8init(),n=prompt('Годовой план добычи, тонн:',String(Math.round(d.annual)));if(n===null)return;
 let total=Number(n);if(!Number.isFinite(total)||total<12000||total>100000000)return uiAlert('Укажите годовой план от 12 000 до 100 000 000 т');
 let reason=prompt('Основание корректировки годового плана:');if(!reason?.trim())return;
 let old=v.plans.slice(),start=v8idx(),fixed=old.slice(0,start).reduce((a,b)=>a+b,0);
 if(total<fixed)return uiAlert('Годовой план меньше уже утверждённых закрытых месяцев');
 let remaining=total-fixed,weights=old.slice(start).map((n,j)=>new Date(v.year,start+j+1,0).getDate());
 let sum=weights.reduce((a,b)=>a+b,0);
 for(let j=start;j<12;j++)v.plans[j]=Math.round(remaining*weights[j-start]/sum);
 v.plans[11]+=total-v.plans.reduce((a,b)=>a+b,0);
 d.annual=v.plans.reduce((a,b)=>a+b,0);
 for(let j=start;j<12;j++)delete d.shops[v.year+'-'+j];
 d.decisions.unshift(v8date()+': годовой план '+f(d.annual)+' т; '+reason.trim());
 v11init().inbox.unshift('Утверждена корректировка годового плана: '+f(d.annual)+' т. Основание: '+reason.trim());
 save();render();
}
function v38setShop(i){
 let v=v8init(),m=v8idx(),data=v38month(m),r=data.rows.find(x=>x.id===i);if(!r)return;
 let raw=prompt('План цеха '+r.name+' на '+V8_MONTHS[m]+', т:',String(r.plan));if(raw===null)return;
 let n=Number(raw);if(!Number.isFinite(n)||n<0||n>v.plans[m])return uiAlert('Некорректный план цеха');
 let reason=prompt('Основание перераспределения:');if(!reason?.trim())return;
 let other=data.rows.filter(x=>x!==r),rest=v.plans[m]-n,prev=other.reduce((a,x)=>a+x.plan,0);
 r.plan=n;let assigned=0;other.forEach((x,j)=>{x.plan=j===other.length-1?rest-assigned:Math.round(rest*(prev?x.plan/prev:1/other.length));assigned+=x.plan});
 v38init().decisions.unshift(v8date()+': план '+r.name+' = '+f(n)+' т; '+reason.trim());save();render();
}
function v38plansView(){
 let v=v8init(),d=v38init(),m=v8idx(),data=v38month(m),yearPlan=v.plans.reduce((a,b)=>a+b,0);
 let closed=v.monthHistory.filter(x=>x.year===v.year).reduce((a,x)=>a+x.actual,0),annualActual=closed+v.monthActual;
 let out='<section class="v38-panel"><h2>Годовой план добычи и выполнение по цехам</h2><div class="v38-stats"><div><small>Годовой план</small><strong>'+f(yearPlan)+' т</strong></div><div><small>Добыто с начала года</small><strong>'+f(annualActual)+' т</strong></div><div><small>Выполнение годового плана</small><strong>'+f(yearPlan?annualActual/yearPlan*100:0)+'%</strong></div></div>';
 out+='<button class="mini-btn" data-v38-annual>Утвердить / изменить годовой план</button><p class="muted">Годовой план распределяется по месяцам с учётом количества календарных дней. Месячный план распределяется по добывающим цехам пропорционально текущему фонду скважин. Корректировки требуют основания, общий план месяца сохраняется.</p>';
 out+='<h3>Цеха добычи — '+V8_MONTHS[m]+' '+v.year+'</h3><div class="table-scroll"><table class="v8table"><thead><tr><th>Цех</th><th>План, т</th><th>Факт, т</th><th>Выполнение</th><th>Решение</th></tr></thead><tbody>';
 for(let r of data.rows)out+='<tr><td>'+esc(r.name)+'</td><td>'+f(r.plan)+'</td><td>'+f(r.actual)+'</td><td>'+f(r.plan?r.actual/r.plan*100:100)+'%</td><td><button class="mini-btn" data-v38-shop="'+r.id+'">Изменить план</button></td></tr>';
 out+='</tbody></table></div><h3>Закрытые месяцы · разбор по цехам</h3>';
 for(let x of d.closed.slice(0,12)){
  let good=x.rows.filter(r=>r.plan===0||r.actual>=r.plan),bad=x.rows.filter(r=>r.plan>0&&r.actual<r.plan);
  out+='<details class="v38-closed"><summary><b>'+V8_MONTHS[x.month]+' '+x.year+'</b> · '+f(x.actual)+' / '+f(x.plan)+' т · выполнили '+good.length+', не выполнили '+bad.length+'</summary>';
  out+='<p><b>Выполнили:</b> '+(good.map(r=>esc(r.name)).join(', ')||'нет')+'</p><p><b>Не выполнили:</b> '+(bad.map(r=>esc(r.name)).join(', ')||'нет')+'</p>';
  for(let r of x.rows)out+=row(esc(r.name),f(r.actual)+' / '+f(r.plan)+' т · '+f(r.plan?r.actual/r.plan*100:100)+'%');
  out+='</details>';
 }
 return out+'</section>';
}
function v38leaderAct(name,act){
 let p=[...v8init().rankCity,...v8init().rankField].find(x=>x.name===name);if(!p)return;
 if(act==='promote'){
  let reason=prompt('Новая должность / основание повышения '+name+':');if(!reason?.trim())return;
  p.job=reason.trim();p.score=cl(p.score+2,0,100);
  v38init().decisions.unshift(v8date()+': повышен '+name+' — '+p.job);
 }else if(act==='dismiss'){
  let reason=prompt('Основание для кадровой проверки по '+name+':');if(!reason?.trim())return;
  v11init().inbox.unshift('Кадровое поручение: проверить основания для увольнения '+name+'. '+reason.trim());
  v38init().decisions.unshift(v8date()+': инициирована процедура проверки по '+name);
  uiAlert('Поручение создано. Увольнение без проверки оснований не выполняется.');
 }
 save();render();
}
function v38leadersView(){
 let v=v8init(),a=[...v.rankCity,...v.rankField].sort((a,b)=>b.score-a.score).slice(0,5);
 return '<section class="v38-panel"><h2>ТОП-5 работников · кадровые решения</h2>'+a.map(p=>'<div class="v38-person"><div><b>'+esc(p.name)+'</b><small>'+esc(p.job)+' · KPI '+p.score+'/100</small></div><div><button class="mini-btn" data-v38-promote="'+esc(p.name)+'">Повысить</button> <button class="mini-btn" data-v38-dismiss="'+esc(p.name)+'">Начать увольнение</button></div></div>').join('')+'<p class="muted">Повышение меняет должность в рейтинге руководителей. Увольнение начинается с кадровой проверки, не производится автоматически.</p></section>';
}
const v38oldHire=v11hire;
v11hire=async function(i){let z=v11init(),before=z.employees.length;await v38oldHire(i);if(z.employees.length>before){let p=z.employees[z.employees.length-1];v8init().salaryFund+=p.salary/1e6;v38init().decisions.unshift(v8date()+': нанят '+p.name+' · оклад '+f(p.salary)+' ₸');save();render()}};
const v38oldPersonAction=v11personAction;
v11personAction=async function(id,act){
 let p=v11init().employees.find(x=>x.id===id),before=p?.salary||0;
 await v38oldPersonAction(id,act);
 if(p&&act==='raise'&&p.salary!==before){v8init().salaryFund+=(p.salary-before)/1e6;save()}
};
const v38oldRender=render;
render=function(){
 v38oldRender();
 let el=document.getElementById('body');if(!el||!s)return;
 if(tab==='daily'){el.insertAdjacentHTML('beforeend',v38plansView());}
 
 el.querySelectorAll('[data-v38-annual]').forEach(b=>b.onclick=v38setAnnual);
 el.querySelectorAll('[data-v38-shop]').forEach(b=>b.onclick=()=>v38setShop(Number(b.dataset.v38Shop)));
 el.querySelectorAll('[data-v38-promote]').forEach(b=>b.onclick=()=>v38leaderAct(b.dataset.v38Promote,'promote'));
 el.querySelectorAll('[data-v38-dismiss]').forEach(b=>b.onclick=()=>v38leaderAct(b.dataset.v38Dismiss,'dismiss'));
};

const v38oldScenario=v14Scenario;
v14Scenario=function(item){
 if(item.id&&item.id.startsWith('monthly-')){
  let text=item.text;
  return {detail:'ОТЧЁТ О ВЫПОЛНЕНИИ ПРОИЗВОДСТВЕННОГО ПЛАНА\n'+text+'\n\nДействия должны учитывать конкретные отстающие цеха, фактический фонд скважин и причины недобора. Пересмотр плана не заменяет восстановление добычи.',options:[
   ['Поручить анализ отклонений по цехам','Проверить простои, обводнённость, фактические дебиты и технические ограничения','investigate'],
   ['Утвердить корректирующие мероприятия','Подготовить адресный план повышения добычи и контроль сроков','coaching'],
   ['Запросить уточнённые производственные данные','Оставить письмо открытым до получения обоснований','clarify']
  ]};
 }
 return v38oldScenario(item);
};
