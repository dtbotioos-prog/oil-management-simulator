
/* v3.6 — camp catering, dormitories, site security, and contract milestone acceptance.
   Game economics only: existing contract price is still deducted in full at award.
   Stage accounting records acceptance but does not deduct contract price again. */
function v36init(){
 if(!s.v36)s.v36={camp:{residents:s.small?8:180,beds:s.small?16:220,mealStock:s.small?240:900,mealQuality:84,housing:87,cleanliness:85,security:82,guards:12,incidents:0,mealsServed:0,missedMeals:0},contracts:{},events:[],spent:0};
 let d=s.v36;d.camp||={residents:s.small?8:180,beds:s.small?16:220,mealStock:s.small?240:900,mealQuality:84,housing:87,cleanliness:85,security:82,guards:12,incidents:0,mealsServed:0,missedMeals:0};d.contracts||={};d.events||=[];return d;
}
function v36contract(c){
 let d=v36init(),k=String(c.id);
 if(!d.contracts[k]){
  let initial=Number(c.price)||0;
  d.contracts[k]={milestones:[
   {name:'Мобилизация и подготовка',share:20,accepted:false},
   {name:'Основные работы',share:50,accepted:false},
   {name:'Испытания и сдача',share:30,accepted:false}
  ],holdback:Math.round(initial*.1*100)/100,commissioned:false,acceptedAt:'',notices:[],qualityDocs:false};
 }
 return d.contracts[k];
}
function v36daily(){
 let d=v36init(),c=d.camp;
 let need=c.residents*3,served=Math.min(need,Math.floor(c.mealStock));
 c.mealStock=Math.max(0,c.mealStock-served);c.mealsServed+=served;c.missedMeals+=need-served;
 c.mealQuality=v30safe(c.mealQuality+(served===need?.015:-.28));
 c.housing=v30safe(c.housing-.02);c.cleanliness=v30safe(c.cleanliness-.055);
 c.security=v30safe(c.security+(c.guards>=Math.ceil(c.residents/25)?.008:-.11));
 if(c.residents>c.beds){c.housing=v30safe(c.housing-.1);c.security=v30safe(c.security-.04)}
 let risk=c.security<50||c.cleanliness<35||c.mealQuality<30;
 if(risk&&v34date()%17===0){c.incidents++;d.events.unshift({date:v8date(),type:'Риск на вахтовом посёлке',detail:'Требуется усилить контроль проживания, питания и охраны'});log('Нарушения условий проживания/охраны на вахтовом посёлке')}
 // Monthly facility and guard expenses; daily pro-rated cash movement.
 let dailyCost=(c.residents*.015+c.guards*.12)/30;
 s.cash-=dailyCost;d.spent+=dailyCost;
 if(typeof v25post==='function')v25post('opex',dailyCost,{description:'Содержание общежития и охраны'});
 for(let contract of v28migrateNames().contracts){
  if(contract.status!=='Исполняется'&&contract.status!=='Завершён')continue;
  let x=v36contract(contract),progress=contract.status==='Завершён'?100:(Number(contract.progress)||0);
  // Acceptance requires deliberate manager action, never automatic.
  if(progress>=100&&!x.acceptedAt&&contract.status==='Завершён')x.ready=true;
 }
 if(d.events.length>100)d.events.length=100;
}
async function v36purchase(kind){
 let d=v36init(),c=d.camp,price={food:14,repair:25,clean:7,guards:18,security:30,beds:85}[kind];
 if(!price)return;
 if(s.cash<price)return uiAlert('Недостаточно денежных средств');
 if(!await uiConfirm('Выполнить мероприятие за '+m(price)+'?'))return;
 s.cash-=price;d.spent+=price;
 if(kind==='food'){c.mealStock+=c.residents*30;c.mealQuality=v30safe(c.mealQuality+6)}
 if(kind==='repair')c.housing=v30safe(c.housing+22);
 if(kind==='clean')c.cleanliness=v30safe(c.cleanliness+23);
 if(kind==='guards'){c.guards+=3;c.security=v30safe(c.security+9)}
 if(kind==='security')c.security=v30safe(c.security+24);
 if(kind==='beds')c.beds+=40;
 v25post(kind==='beds'?'maintenance':'opex',price,{description:'Вахтовый посёлок: '+kind});
 log('Вахтовый посёлок: '+kind+' · '+m(price));save();render();
}
async function v36setResidents(){
 let c=v36init().camp,raw=await uiPrompt('Количество проживающих работников (0–1000)',String(c.residents));if(raw===null)return;
 let n=Number(raw);if(!Number.isInteger(n)||n<0||n>1000)return uiAlert('Укажите от 0 до 1000 работников');
 c.residents=n;save();render();
}
async function v36accept(id,index){
 let c=v28migrateNames().contracts.find(x=>x.id===id);if(!c)return;
 let x=v36contract(c),stage=x.milestones[index];if(!stage||stage.accepted)return;
 let progress=c.status==='Завершён'?100:Number(c.progress)||0,threshold=[20,70,100][index];
 if(progress<threshold)return uiAlert('Работы по этапу ещё не выполнены: требуется '+threshold+'% готовности');
 if(index>0&&!x.milestones[index-1].accepted)return uiAlert('Сначала примите предыдущий этап');
 if(index===2&&!x.qualityDocs)return uiAlert('Перед итоговой приёмкой подтвердите исполнительную документацию');
 if(!await uiConfirm('Подписать акт по этапу «'+stage.name+'» договора №'+id+'?'))return;
 stage.accepted=true;stage.date=v8date();
 if(index===2){x.acceptedAt=v8date();x.commissioned=true}
 log('Принят этап '+(index+1)+' договора №'+id);save();render();
}
async function v36docs(id){
 let c=v28migrateNames().contracts.find(x=>x.id===id);if(!c)return;
 let x=v36contract(c);
 if(c.status!=='Завершён')return uiAlert('Исполнительная документация проверяется после завершения работ');
 if(!await uiConfirm('Подтвердить комплектность исполнительной документации по договору №'+id+'?'))return;
 x.qualityDocs=true;save();render();
}
function v36campView(){
 let c=v36init().camp,coverage=c.residents?Math.min(100,Math.round(c.mealStock/(c.residents*3)*100)):100;
 let out='<h2>Вахтовый посёлок · питание, общежитие и охрана</h2><p class="muted">Управление проживанием работников, трёхразовым питанием, санитарным состоянием и охраной объекта.</p>';
 out+='<div class="v36-cards">'+
 '<div class="v36-card"><b>Общежития</b><strong>'+c.residents+' / '+c.beds+'</strong><small>Проживающие / койко-места</small></div>'+
 '<div class="v36-card"><b>Питание</b><strong>'+Math.floor(c.mealStock)+'</strong><small>Порций на складе · запас на '+(c.residents?(c.mealStock/(c.residents*3)).toFixed(1):'∞')+' суток</small></div>'+
 '<div class="v36-card"><b>Служба безопасности</b><strong>'+c.guards+'</strong><small>Сотрудников охраны</small></div></div>';
 out+=row('Качество питания',Math.round(c.mealQuality)+'%')+row('Состояние общежитий',Math.round(c.housing)+'%')+row('Санитарное состояние',Math.round(c.cleanliness)+'%')+row('Надёжность охраны',Math.round(c.security)+'%')+row('Нарушения / происшествия',c.incidents)+row('Необеспеченные порции за карьеру',Math.round(c.missedMeals));
 if(c.mealStock<c.residents*3)out+='<div class="notice bad">Недостаточно продовольствия на следующий день. Необходимо пополнить склад столовой.</div>';
 if(c.residents>c.beds)out+='<div class="notice bad">Превышена вместимость общежитий.</div>';
 if(c.security<55)out+='<div class="notice bad">Недостаточный уровень охраны производственных объектов.</div>';
 out+='<div class="actions"><button class="btn secondary" data-v36-residents>Изменить численность</button><button class="btn secondary" data-v36-buy="food">Закупить продукты · 14 млн ₸</button><button class="btn secondary" data-v36-buy="repair">Ремонт общежитий · 25 млн ₸</button><button class="btn secondary" data-v36-buy="clean">Санобработка · 7 млн ₸</button><button class="btn secondary" data-v36-buy="guards">Нанять охрану · 18 млн ₸</button><button class="btn secondary" data-v36-buy="security">Усилить безопасность · 30 млн ₸</button><button class="btn secondary" data-v36-buy="beds">Расширить общежитие · 85 млн ₸</button></div>';
 out+='<h3>Функции службы безопасности</h3><p class="muted">В расчётный модели служба отвечает за контроль доступа, охрану имущества, режим объектов, обходы и реагирование на нарушения. Численность охраны влияет на показатель надёжности.</p>';
 return out;
}
function v36contractsView(){
 let list=v28migrateNames().contracts.filter(c=>c.status==='Исполняется'||c.status==='Завершён').slice(0,35);
 let out='<h2>Акты, этапы работ и ввод объектов · v3.6</h2><p class="muted">Три этапа приёмки: подготовка (20%), основные работы (50%), испытания и сдача (30%). Этапы требуют подтверждения менеджера. Договоры предыдущих версий сохраняют прежний порядок полной оплаты при заключении: акты здесь не вызывают повторных платежей.</p>';
 if(!list.length)out+='<p class="muted">Действующих и завершённых договоров пока нет.</p>';
 for(let c of list){
  let x=v36contract(c);
  out+='<div class="mini-card v36-contract"><b>Договор №'+c.id+' · '+esc(c.objectName||V27_TYPES[c.type]?.label||c.type)+'</b>'+row('Подрядчик',esc(c.supplier))+row('Готовность',Math.round(c.progress||0)+'%')+row('Стоимость',m(c.price))+row('Удержание по модели (информационно)',m(x.holdback));
  for(let i=0;i<x.milestones.length;i++){let st=x.milestones[i];out+='<div class="v36-stage"><span>'+esc(st.name)+' · '+st.share+'%</span><span>'+(st.accepted?'Принят '+esc(st.date):'<button class="mini-btn" data-v36-accept="'+c.id+'" data-v36-stage="'+i+'">Подписать акт</button>')+'</span></div>';}
  if(c.status==='Завершён'&&!x.qualityDocs)out+='<button class="mini-btn" data-v36-docs="'+c.id+'">Подтвердить исполнительную документацию</button>';
  if(x.commissioned)out+='<div class="notice">Приёмка завершена: '+esc(x.acceptedAt)+'. Объект принят в расчётный реестр.</div>';
  out+='</div>';
 }
 return out;
}
function v36bind(){
 document.querySelectorAll('[data-v36-buy]').forEach(b=>b.onclick=()=>v36purchase(b.dataset.v36Buy));
 document.querySelectorAll('[data-v36-residents]').forEach(b=>b.onclick=v36setResidents);
 document.querySelectorAll('[data-v36-accept]').forEach(b=>b.onclick=()=>v36accept(Number(b.dataset.v36Accept),Number(b.dataset.v36Stage)));
 document.querySelectorAll('[data-v36-docs]').forEach(b=>b.onclick=()=>v36docs(Number(b.dataset.v36Docs)));
}
const v36oldDay=v26day;
v26day=function(){v36oldDay();v36daily()};
const v36oldRender=render;
render=function(){
 v36oldRender();
 let el=document.getElementById('body');if(!el)return;
 if(['staff','hse','overview'].includes(tab))el.insertAdjacentHTML('beforeend',v36campView());
 if(tab==='contracts')el.insertAdjacentHTML('beforeend',v36contractsView());
 if(['staff','hse','overview','contracts'].includes(tab))v36bind();
};
