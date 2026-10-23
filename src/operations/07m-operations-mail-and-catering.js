
/* v3.7.1: one consolidated monthly maintenance letter, monthly automatic catering */
function v39init(){
 if(!s.v39)s.v39={mailKeys:[],cateringKeys:[],cateringLog:[],mealPrice:0.002,alerts:[]};
 let x=s.v39;x.mailKeys||=[];x.cateringKeys||=[];x.cateringLog||=[];x.alerts||=[];return x;
}
function v39key(){let v=v8init();return v.year+'-'+(v8idx()+1)}
function v39mail(key,category,title,body){
 let x=v39init(),id='v39-'+category+'-'+key;
 if(x.mailKeys.includes(id))return;
 let db=v14Sync();
 db.items.unshift({id,text:title+'\n\n'+body,category:category==='equipment'?'technical':'production',created:v8date(),status:'new',choice:null,outcome:'',readAt:null});
 x.mailKeys.push(id);
 if(x.mailKeys.length>120)x.mailKeys.shift();
}
function v39catering(){
 let x=v39init(),c=v36init().camp,key=v39key();
 if(x.cateringKeys.includes(key))return;
 x.cateringKeys.push(key);
 let v=v8init(),days=v8days(),portions=c.residents*3*days,price=+(portions*x.mealPrice).toFixed(3);
 // Monthly procurement for the current month. Do not double-charge food already in storage.
 let shortage=Math.max(0,portions-c.mealStock),charge=+(shortage*x.mealPrice).toFixed(3);
 if(charge<=0){x.cateringLog.unshift({date:v8date(),key,portions:0,paid:0,status:'Запас достаточен'});return}
 if(s.cash>=charge){
  s.cash-=charge;c.mealStock+=shortage;c.mealQuality=v30safe(c.mealQuality+2);
  v25post('opex',charge,{description:'Автоматическая ежемесячная закупка питания',portions:shortage,period:key});
  x.cateringLog.unshift({date:v8date(),key,portions:shortage,paid:charge,status:'Оплачено'});
  v39mail(key,'catering','Столовая · ежемесячное обеспечение питания','На '+days+' суток закуплено '+shortage+' порций для '+c.residents+' проживающих. Стоимость '+m(charge)+'. Списание выполнено автоматически. Остаток склада: '+Math.floor(c.mealStock)+' порций.');
 }else{
  x.cateringLog.unshift({date:v8date(),key,portions:0,paid:0,status:'Не оплачено · недостаточно средств'});
  v39mail(key,'catering','Срочно: не профинансировано питание вахтового посёлка','Для обеспечения '+c.residents+' работников на '+days+' суток требуется '+shortage+' порций, стоимость '+m(charge)+'. Доступно '+m(s.cash)+'. Автоматическое списание не выполнено. Необходимо обеспечить финансирование и пополнить склад.');
 }
 if(x.cateringLog.length>36)x.cateringLog.length=36;
}
function v39equipment(){
 let key=v39key(),wells=s.assets?.wellList||[],groups=new Map();
 // Health is the game's equipment-condition indicator.
 for(let w of wells){
  let health=Number(w.health);
  if(!Number.isFinite(health)||health>75)continue;
  let shop=String(w.shop??'Без цеха'),g=groups.get(shop)||{low:[],critical:[],stopped:[],total:0};
  g.total++;
  let label='Скв. №'+w.id+' · состояние '+Math.round(health)+'% · '+(w.status||'статус не указан');
  if(health<=55)g.critical.push(label);else g.low.push(label);
  if(w.status!=='Работает')g.stopped.push(label);
  groups.set(shop,g);
 }
 let stopped=wells.filter(w=>w.status!=='Работает');
 let text='Единая производственно-техническая сводка по всем добывающим цехам на '+v8date()+'.\n'+
 'Всего скважин: '+wells.length+'; остановлено/не в работе: '+stopped.length+
 '; оборудование 56–75%: '+[...groups.values()].reduce((a,g)=>a+g.low.length,0)+
 '; оборудование 55% и ниже: '+[...groups.values()].reduce((a,g)=>a+g.critical.length,0)+'.\n\n';
 let names=(typeof TREE_SHOPS!=='undefined'&&Array.isArray(TREE_SHOPS))?TREE_SHOPS:[];
 if(!groups.size)text+='На дату отчёта скважин с техническим состоянием 75% и ниже не выявлено.\n';
 for(let [k,g] of groups){
  let name=names[Number(k)]||'Цех '+k;
  text+='ЦЕХ: '+name+'\n';
  if(g.critical.length)text+='СРОЧНЫЙ РЕМОНТ (≤55%):\n'+g.critical.join('\n')+'\n';
  if(g.low.length)text+='ПЛАНОВЫЙ РЕМОНТ (56–75%):\n'+g.low.join('\n')+'\n';
  text+='Не в работе среди перечисленных: '+g.stopped.length+'\n\n';
 }
 let otherStops=stopped.filter(w=>Number(w.health)>75);
 if(otherStops.length)text+='ОСТАНОВКИ ПРИ СОСТОЯНИИ ВЫШЕ 75%:\n'+otherStops.map(w=>'Скв. №'+w.id+' · '+w.status).join('\n')+'\n';
 text+='\nРекомендуемое решение: поручить ответственным цехов диагностику, подтвердить причины остановок, приоритизировать критическое оборудование, оформить заявки на ремонт и проверить безопасную готовность к пуску. Состояние 75% и 55% — расчётные пороги, не нормативные требования.';
 v39mail(key,'equipment','Ежемесячная сводка · остановки и ремонты по всем цехам',text);
}
const v39oldCampDay=v36daily;
v36daily=function(){
 v39catering();
 v39oldCampDay();
};
const v39oldV26=v26day;
v26day=function(){
 v39oldV26();
 // First active day and each new calendar month, a single report covers every shop.
 v39equipment();
};
const v39oldCampView=v36campView;
v36campView=function(){
 let html=v39oldCampView(),x=v39init(),latest=x.cateringLog[0];
 let info='<section class="v39-catering"><h3>Автоматическое питание · ежемесячное списание</h3>'+
 '<p class="muted">В начале каждого месяца закупается недостающий объём порций из расчёта три приёма пищи в день. Цена расчётный порции — '+m(x.mealPrice)+'. Если средств недостаточно, списания нет и во «Входящие» поступает предупреждение.</p>'+
 (latest?row('Последняя закупка',latest.date+' · '+latest.status+' · '+m(latest.paid)+' · '+latest.portions+' порций'):'')+'</section>';
 return html+info;
};
