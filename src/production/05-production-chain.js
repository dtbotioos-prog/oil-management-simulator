function v21init(){
 if(!s.v21)s.v21={nodes:{},projects:[],history:[],seq:0,policy:{reserve:10},journal:[]};
 let d=s.v21;d.nodes||={};d.projects||=[];d.history||=[];d.journal||=[];
 ensureAssets();let wells=s.assets.wellList;
 let gu=[...new Set(wells.map(w=>w.unit||'ГУ-1'))].sort((a,b)=>parseInt(a.slice(3))-parseInt(b.slice(3)));
 let specs=[['ДНС-1','ДНС','Транспорт жидкости',Math.max(8000,wells.length*45)],['ДНС-2','ДНС','Транспорт жидкости',Math.max(8000,wells.length*45)],['ЦППН','ЦППН','Подготовка нефти',Math.max(15000,wells.length*32)],['ППД-1','ППД','Поддержание давления',Math.max(5000,wells.length*28)],['ПС-1','Энергия','Электроснабжение',Math.max(12000,wells.length*80)]];
 for(const [id,type,desc,capacity] of specs){
  if(!d.nodes[id])d.nodes[id]={id,type,desc,capacity,health:88,repairDays:0,upgradeDays:0,upgradeCost:0,offline:false};
 }
 for(const g of gu){let n=d.nodes[g];if(!n)d.nodes[g]={id:g,type:'ГУ',desc:'Сбор продукции скважин',capacity:Math.max(1500,wells.filter(w=>w.unit===g).length*38),health:90,repairDays:0,upgradeDays:0,upgradeCost:0,offline:false};}
 return d;
}
function v21nodeAvailable(n){return !n.offline&&n.repairDays<=0?cl(n.health/100,.25,1):0}
function v21route(w){
 let i=Math.max(1,parseInt((w.unit||'ГУ-1').split('-')[1],10)||1);
 return i%2===0?'ДНС-2':'ДНС-1';
}
function v21calc(){
 let d=v21init(),nodes=d.nodes,wells=s.assets.wellList;
 let records={},totalOil=0,totalLiquid=0,losses={gu:0,dns:0,plant:0,power:0,ppd:0},totalPower=0;
 let byGu={},byDns={'ДНС-1':[],'ДНС-2':[]};
 for(let w of wells){
  if(w.status!=='Работает'||w.wellKind==='Нагнетательная')continue;
  let oil=Math.max(0,+w.rate||0)*cl((+w.health||80)/85,.35,1.1)*(1-cl(+w.water||0,0,95)/100);
  let liquid=oil/(1-cl(+w.water||0,0,95)/100);
  let power=w.equipment?.type==='ЭЦН'?18:8;
  let gu=w.unit||'ГУ-1',dns=v21route(w);
  let item={well:w.id,gu,dns,oil,liquid,power,factor:1};
  (byGu[gu]||=[]).push(item);byDns[dns].push(item);records[w.id]=item;totalPower+=power;
 }
 const distribute=(items,nodeId,quantity,reason)=>{
  let n=nodes[nodeId];if(!n)return;
  let sum=items.reduce((a,x)=>a+x[quantity]*x.factor,0),allowed=n.capacity*v21nodeAvailable(n);
  let factor=sum>0?Math.min(1,allowed/sum):1;
  for(let x of items)x.factor*=factor;
  if(factor<1)losses[reason]+=sum*(1-factor);
 };
 for(let [g,items] of Object.entries(byGu))distribute(items,g,'liquid','gu');
 for(let [g,items] of Object.entries(byDns))distribute(items,g,'liquid','dns');
 let items=Object.values(records);
 distribute(items,'ЦППН','oil','plant');
 // Electrical load is shared across the full active field.
 distribute(items,'ПС-1','power','power');
 let injections=wells.filter(w=>w.status==='Работает'&&w.wellKind==='Нагнетательная').length;
 let ppd=nodes['ППД-1'],need=items.reduce((a,x)=>a+x.liquid*x.factor*.55,0);
 let supplied=Math.min(need,ppd.capacity*v21nodeAvailable(ppd)+injections*45);
 let support=need?supplied/need:1;
 let pressureFactor=cl(.82+.18*support,.72,1);
 for(let x of items){x.factor*=pressureFactor;totalOil+=x.oil*x.factor;totalLiquid+=x.liquid*x.factor;}
 losses.ppd=need-supplied;
 let demand={},load={};
 for(let [id,n] of Object.entries(nodes))load[id]=0;
 for(let x of items){
  load[x.gu]+=(x.liquid*x.factor);
  load[x.dns]+=(x.liquid*x.factor);
  load['ЦППН']+=x.oil*x.factor;
  load['ПС-1']+=x.power*x.factor;
 }
 load['ППД-1']=supplied;
 let maxLoad=Math.max(0,...Object.entries(nodes).map(([id,n])=>n.capacity?load[id]/Math.max(1,n.capacity*v21nodeAvailable(n)):0));
 return {oil:totalOil,liquid:totalLiquid,load,records,losses,support,maxLoad,wellCount:items.length,injectors:injections};
}
function v21day(){
 let d=v21init(),n=d.nodes;
 for(let p of d.projects){
  if(p.status!=='В работе')continue;
  p.days--;
  if(p.days<=0){
   let o=n[p.node];
   if(o){if(p.kind==='upgrade')o.capacity+=p.add;else{o.health=cl(o.health+35,0,100);o.offline=false;o.repairDays=0;}}
   p.status='Завершён';d.journal.unshift(v8date()+' · '+p.node+': завершено '+(p.kind==='upgrade'?'расширение мощности':'восстановление'));
   v19notify('Завершены работы на '+p.node);
  }
 }
 if(s.v8?.daysElapsed%30===0)for(let o of Object.values(n))o.health=cl(o.health-.25,25,100);
 let calc=v21calc();d.history.push({date:v8date(),oil:calc.oil,loss:calc.losses,load:calc.maxLoad});if(d.history.length>370)d.history.shift();
}
async function v21action(id,kind){
 let d=v21init(),o=d.nodes[id];if(!o)return;
 if(d.projects.some(x=>x.node===id&&x.status==='В работе'))return uiAlert('На объекте уже выполняется проект');
 if(kind==='toggle'){
  if(!await uiConfirm((o.offline?'Возобновить':'Остановить')+' '+id+'? Это повлияет на суточную добычу.'))return;
  o.offline=!o.offline;d.journal.unshift(v8date()+' · '+id+': '+(o.offline?'остановлен':'включён'));save();render();return;
 }
 let cost=kind==='upgrade'?id.startsWith('ГУ-')?160:420:65;
 let days=kind==='upgrade'?id.startsWith('ГУ-')?30:60:12;
 let add=kind==='upgrade'?Math.round(o.capacity*.35):0;
 if(s.cash<cost)return uiAlert('Недостаточно средств: '+m(cost));
 if(!await uiConfirm((kind==='upgrade'?'Модернизация':'Ремонт')+' '+id+': '+m(cost)+', '+days+' дней?'))return;
 s.cash-=cost;d.projects.push({id:++d.seq,node:id,kind,cost,days,add,status:'В работе',started:v8date()});
 d.journal.unshift(v8date()+' · '+id+': начаты работы, '+m(cost));v19notify('Начаты работы на '+id);save();render();
}
function v21view(){
 let d=v21init(),calc=v21calc(),a=Object.values(d.nodes),rows=a.map(o=>{
  let used=calc.load[o.id]||0,avail=o.capacity*v21nodeAvailable(o),percent=avail?used/avail*100:100;
  let project=d.projects.find(p=>p.node===o.id&&p.status==='В работе');
  return '<div class="asset"><div class="asset-top"><b>'+esc(o.id)+'</b><span class="'+(o.offline?'warn':'good')+'">● '+(o.offline?'Остановлен':'Работает')+'</span></div><small>'+esc(o.desc)+'</small>'+
  row('Загрузка',f(used)+' / '+f(avail)+' '+(o.type==='Энергия'?'кВт':o.type==='ЦППН'?'т/сут':'м³/сут'))+
  row('Состояние',f(o.health)+'%')+'<div class="meter"><i style="width:'+cl(percent,0,100)+'%;background:'+(percent>95?'#d95a52':percent>80?'#d7a240':'#35b884')+'"></i></div>'+
  '<p class="v8small">'+(project?'Выполняется '+(project.kind==='upgrade'?'модернизация':'ремонт')+' · осталось '+project.days+' дн.':'')+'</p>'+
  '<div class="actions"><button class="mini-btn" data-v21-node="'+esc(o.id)+'" data-v21-kind="upgrade" '+(project?'disabled':'')+'>Модернизация</button><button class="mini-btn" data-v21-node="'+esc(o.id)+'" data-v21-kind="repair" '+(project?'disabled':'')+'>Ремонт</button><button class="mini-btn" data-v21-node="'+esc(o.id)+'" data-v21-kind="toggle">'+(o.offline?'Пуск':'Остановка')+'</button></div></div>';
 }).join('');
 let bottlenecks=a.filter(o=>o.offline||calc.load[o.id]>o.capacity*v21nodeAvailable(o)*.95).map(o=>o.id);
 return '<h2>Производственная цепочка · единая модель</h2><p class="muted">Скважины → ГУ → ДНС → ЦППН; электроснабжение и ППД ограничивают итоговую добычу. Значения являются расчётными, не проектными характеристиками реальных объектов.</p>'+
 '<div class="v8grid">'+[['Товарная нефть, т/сут',f(calc.oil)],['Жидкость, м³/сут',f(calc.liquid)],['Добывающих в работе',calc.wellCount],['Нагнетательных в работе',calc.injectors],['Обеспеченность ППД',f(calc.support*100)+'%'],['Макс. загрузка',f(calc.maxLoad*100)+'%']].map(x=>'<div class="v8tile"><small>'+x[0]+'</small><strong>'+x[1]+'</strong></div>').join('')+'</div>'+
 '<div class="notice">'+(bottlenecks.length?'Ограничения / риск перегрузки: '+esc(bottlenecks.join(', ')):'Критических ограничений мощностей не выявлено')+'</div>'+
 '<h3>Объекты цепочки и решения генерального директора</h3><div class="asset-grid">'+rows+'</div>'+
 '<h3>Инвестиционные проекты и ремонты</h3><div class="table-scroll"><table class="well-table"><thead><tr><th>Объект</th><th>Работы</th><th>Затраты</th><th>Срок</th><th>Статус</th></tr></thead><tbody>'+d.projects.slice(-25).reverse().map(x=>'<tr><td>'+esc(x.node)+'</td><td>'+(x.kind==='upgrade'?'Расширение':'Ремонт')+'</td><td>'+m(x.cost)+'</td><td>'+x.days+' дн.</td><td>'+esc(x.status)+'</td></tr>').join('')+'</tbody></table></div>'+
 '<h3>Анализ потерь и производственные рекомендации</h3>'+row('Ограничение на ГУ, усл. м³/сут',f(calc.losses.gu))+row('Ограничение ДНС, усл. м³/сут',f(calc.losses.dns))+row('Ограничение ЦППН, усл. т/сут',f(calc.losses.plant))+row('Ограничение электроснабжения, усл. кВт',f(calc.losses.power))+row('Дефицит закачки ППД, усл. м³/сут',f(calc.losses.ppd))+
 '<div class="notice">Потери в разных единицах нельзя складывать. Модель применяет ограничения последовательно к каждой скважине. Расходы на проекты списываются один раз при утверждении; изменения мощностей вступают в силу после завершения работ.</div>';
}
function v21bind(){document.querySelectorAll('[data-v21-node]').forEach(b=>b.onclick=()=>v21action(b.dataset.v21Node,b.dataset.v21Kind))}

