
/* v3.8.6: director inbox management and actions backed by actual game state. */
function mail86db(){
 let db=v14Sync();
 db.deletedIds||=[];
 db.tasks||=[];
 return db;
}
const mail86oldSync=v14Sync;
v14Sync=function(){
 let db=mail86oldSync();
 db.deletedIds||=[];
 db.tasks||=[];
 if(db.deletedIds.length)db.items=db.items.filter(x=>!db.deletedIds.includes(x.id));
 return db;
};
function mail86deleteAll(){
 let db=mail86db();
 if(!confirm('Удалить все письма генерального директора? Это не отменит уже выполненные ремонты и расходы.'))return;
 db.deletedIds=[...new Set([...db.deletedIds,...db.items.map(x=>x.id)])].slice(-3000);
 db.items=[];v11init().inbox=[];v8init().notifications=[];
 v14Selected=null;save();render();
}
function mail86readAll(){
 let db=mail86db();
 for(let x of db.items)if(x.status==='new'){x.status='read';x.readAt=v8date();}
 save();render();
}
function mail86postpone(id){
 let x=mail86db().items.find(q=>q.id===id);
 if(!x||x.choice)return;
 x.status='pending';x.postponedAt=v8date();x.outcome='Отложено генеральным директором, исполнение не начиналось.';
 v14Selected=null;save();render();
}
const mail86oldInbox=v11inbox;
v11inbox=function(){
 let h=mail86oldInbox();
 const controls='<div class="v14tools mail86tools"><button data-mail86="readall">✓ Пометить все прочитанными</button><button data-mail86="deleteall">🗑 Удалить все письма</button></div>';
 const count=mail86db().items.filter(x=>x.status==='pending').length;
 const note='<p class="muted">Отложено: '+count+'. Ремонт и поручения меняют реальные расчётные объекты; незавершённые задачи видны в письмах.</p>';
 if(v14Selected){
  const item=mail86db().items.find(x=>x.id===v14Selected);
  if(item&&item.status==='pending'&&!item.choice)h=h.replace('Варианты управленческого решения','Варианты управленческого решения (ранее отложено)');
  if(item?.taskId){
   const t=mail86db().tasks.find(z=>z.id===item.taskId);
   if(t)h+='<div class="notice">Исполнение: '+esc(t.status)+'; осталось '+t.days+' дн. '+esc(t.description)+'</div>';
  }
 }
 return h.replace('<h2>✉ Входящие директора</h2>','<h2>✉ Входящие директора</h2>'+controls+note);
};
function mail86target(item){
 let match=item.text.match(/(?:скважин[аые]?\s*№?\s*|№\s*)(\d{3,6})/i);
 let wells=s.assets?.wellList||[];
 return (match&&wells.find(w=>String(w.id)===match[1]))||wells.find(w=>w.status==='Остановлена'||w.health<75)||wells[0];
}
function mail86task(item,type,description,days,apply){
 let db=mail86db(),id=1+Math.max(0,...db.tasks.map(t=>t.id));
 db.tasks.push({id,mailId:item.id,type,description,days,status:'В работе',apply});
 item.taskId=id;item.status='pending';item.outcome='Поручение принято: '+description+'. Осталось '+days+' дней.';
 return id;
}
const mail86oldAdvance=v8advance;
v8advance=function(){
 mail86oldAdvance();
 if(!s?.mailbox?.tasks)return;
 let db=s.mailbox;
 for(let t of db.tasks){
  if(t.status!=='В работе')continue;
  if(--t.days>0)continue;
  t.days=0;t.status='Выполнено';
  let item=db.items.find(x=>x.id===t.mailId);
  if(t.apply==='diagnose'){
   let w=s.assets?.wellList?.find(w=>w.id===t.well);
   if(w){w.health=Math.min(100,w.health+3);t.description+='; диагностика скважины №'+w.id+' завершена, состояние '+w.health+'%';}
  }else if(t.apply==='coaching'){v8init().morale=cl(v8init().morale+2,0,100);}
  if(item){item.status='done';item.outcome='Фактически выполнено '+v8date()+': '+t.description;item.resolvedAt=v8date();}
  s.events.unshift('Исполнено поручение генерального директора: '+t.description);
 }
};
v14Choose=async function(i){
 let db=mail86db(),item=db.items.find(x=>x.id===v14Selected);
 if(!item||item.choice)return;
 let opt=v14Scenario(item).options[i];if(!opt)return;
 let kind=opt[2],well=mail86target(item),cost=kind==='repair'?42:kind==='diagnose'?8:kind==='fund'?12:0;
 if(kind==='repair'&&!well)return uiAlert('В фонде нет скважины для ремонта.');
 if(cost>s.cash)return uiAlert('Недостаточно средств: '+m(cost));
 if(kind==='clarify'){mail86postpone(item.id);return;}
 if(!await uiConfirm('Подтвердить решение?\n'+opt[0]+(cost?'\nБюджет: '+m(cost):'')))return;
 if(kind==='repair'){
  let before=v26init().orders.length;
  await v26requestRepair(well);
  let order=v26init().orders.length>before?v26init().orders[v26init().orders.length-1]:null;
  if(!order)return; // No money or spares, or user cancelled: do not mark executed.
  item.choice=kind;item.status='pending';item.outcome='Заказ-наряд №'+order.id+' оформлен, скважина №'+well.id+' остановлена на ремонт. Осталось '+order.days+' дн.';
  item.repairOrderId=order.id;
 }else if(kind==='supply'){
  let stock=ensurePlant().stock||[];
  item.choice=kind;item.status='done';item.outcome='Сверка склада выполнена '+v8date()+'. Номенклатур: '+stock.length+'. Дефицит: '+stock.filter(x=>x.qty<=0).length+'. Закупка не оформлена.';
 }else if(kind==='ack'){
  item.choice=kind;item.status='done';item.outcome='Принято к сведению '+v8date()+'.';
 }else{
  if(cost){s.cash-=cost;v25post(kind==='diagnose'?'maintenance':'opex',cost,{description:'Решение генерального директора: '+opt[0],mailId:item.id});}
  item.choice=kind;
  if(kind==='fund'){item.status='done';item.outcome='Резерв на обеспечение выделен: '+m(cost)+'. Поставка не произведена, требуется договор и закупка.';}
  else if(kind==='diagnose'){let id=mail86task(item,kind,'Диагностика '+(well?'скважины №'+well.id:'оборудования'),2,'diagnose');db.tasks.find(t=>t.id===id).well=well?.id;}
  else if(kind==='coaching')mail86task(item,kind,'Беседа и план улучшений персонала',3,'coaching');
  else mail86task(item,kind,'Проверка документов и подготовка заключения',2,'investigate');
 }
 s.v11.actions.unshift(v8date()+': '+opt[0]+' — '+item.text);
 save();render();
};
const mail86oldRender=render;
render=function(){
 if(s?.mailbox?.items){
  for(let x of s.mailbox.items.filter(x=>x.repairOrderId&&x.status==='pending')){
   let order=v26init().orders.find(o=>o.id===x.repairOrderId);
   if(order?.status==='Завершён'){
    x.status='done';x.resolvedAt=v8date();
    x.outcome='Ремонт фактически завершён '+v8date()+'. Скважина №'+order.well+' восстановлена; стоимость '+m(order.cost)+'.';
   }else if(order)x.outcome='Ремонт в работе: скважина №'+order.well+', осталось '+order.days+' дн.';
  }
 }
 mail86oldRender();
};
const mail86oldBind=v14Bind;
v14Bind=function(){
 mail86oldBind();
 document.querySelectorAll('[data-mail86]').forEach(b=>b.onclick=()=>b.dataset.mail86==='readall'?mail86readAll():mail86deleteAll());
};
