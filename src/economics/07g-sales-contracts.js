
/* v3.3: sales contracts for fictional buyers; volumes are tonnes, prices are million KZT per tonne.
   Settlement remains based on the original market price in v8advance. */
const V33_BUYERS=['Северный Трейдинг','Транзит Ойл Экспорт','ЭнергоМаркет Групп','ПромРесурс Трейд','Каспийский Нефтетрейдер'];
function v33init(){
 if(!s.v33)s.v33={seq:2,contracts:[
 {id:1,buyer:V33_BUYERS[0],daily:3500,remaining:350000,fulfilled:0,status:'Действует',created:'Начальный договор',priceMultiplier:1,terms:7,advancePct:0},
 {id:2,buyer:V33_BUYERS[1],daily:5500,remaining:550000,fulfilled:0,status:'Действует',created:'Начальный договор',priceMultiplier:1,terms:7,advancePct:0}
 ],shipments:[]};
 let d=s.v33;d.contracts||=[];d.shipments||=[];d.seq||=d.contracts.reduce((a,x)=>Math.max(a,x.id),0);
 return d;
}
function v33dispatch(available){
 let d=v33init(),left=Math.max(0,available),allocations=[];
 for(let c of d.contracts){
  if(c.status!=='Действует'||left<=0)continue;
  let qty=Math.min(left,Math.max(0,c.daily),Math.max(0,c.remaining));
  if(qty<=0){if(c.remaining<=0)c.status='Исполнен';continue}
  qty=Math.round(qty*100)/100;c.remaining=Math.max(0,Math.round((c.remaining-qty)*100)/100);
  c.fulfilled=Math.round((c.fulfilled+qty)*100)/100;
  if(c.remaining<=0)c.status='Исполнен';
  allocations.push({id:c.id,buyer:c.buyer,qty});
  left-=qty;
 }
 let sold=Math.round((available-left)*100)/100;
 if(sold>0){d.shipments.unshift({date:v8date(),sold,allocations});if(d.shipments.length>365)d.shipments.pop()}
 return {sold,allocations};
}
function v33add(){
 let d=v33init(),buyer=prompt('Покупатель (название компании)',V33_BUYERS[d.seq%V33_BUYERS.length]);if(buyer===null)return;
 buyer=buyer.trim().slice(0,100);if(!buyer)return uiAlert('Укажите покупателя');
 let daily=Number(prompt('Лимит отгрузки в сутки, тонн (100–9000)','3000'));
 if(!Number.isInteger(daily)||daily<100||daily>9000)return uiAlert('Лимит должен быть от 100 до 9000 тонн');
 let total=Number(prompt('Общий объём договора, тонн (100–2000000)','90000'));
 if(!Number.isInteger(total)||total<100||total>2000000)return uiAlert('Укажите общий объём от 100 до 2 000 000 тонн');
 let pct=Number(prompt('Цена относительно рыночной, % (70–150)','100'));
 if(!Number.isFinite(pct)||pct<70||pct>150)return uiAlert('Укажите цену от 70 до 150% рыночной');
 let terms=Number(prompt('Отсрочка оплаты, игровых дней (0–90)','7'));
 if(!Number.isInteger(terms)||terms<0||terms>90)return uiAlert('Укажите срок оплаты от 0 до 90 дней');
 let advancePct=Number(prompt('Предоплата от объёма договора, % (0–50)','0'));
 if(!Number.isFinite(advancePct)||advancePct<0||advancePct>50)return uiAlert('Укажите предоплату от 0 до 50%');
 d.contracts.push({id:++d.seq,buyer,daily,remaining:total,fulfilled:0,status:'Действует',created:v8date(),priceMultiplier:pct/100,terms,advancePct,advanceRemaining:0});
 log('Договор реализации №'+d.seq+' · '+buyer+' · '+total+' т');save();render();
}
function v33cancel(id){
 let d=v33init(),c=d.contracts.find(x=>x.id===id);
 if(!c||c.status!=='Действует')return;
 if(!confirm('Приостановить отгрузку по договору №'+id+'?'))return;
 c.status='Приостановлен';log('Приостановлен договор реализации №'+id);save();render();
}
function v33resume(id){
 let c=v33init().contracts.find(x=>x.id===id);
 if(!c||c.status!=='Приостановлен')return;
 c.status='Действует';log('Возобновлён договор реализации №'+id);save();render();
}
function v33view(){
 let d=v33init(),b=v32init(),last=b.days[b.days.length-1];
 let out='<h2>Реализация товарной нефти · договоры покупателей</h2><p class="muted">Отгрузка идёт из РВС по действующим договорам, в порядке их заключения. Выручка начисляется по индивидуальной цене договора; поступления денег учитываются отдельно, с учётом предоплаты и отсрочки.</p>';
 out+='<div class="actions"><button class="btn secondary" data-v33-new>Заключить договор реализации</button></div>';
 out+='<div class="table-scroll"><table><thead><tr><th>№</th><th>Покупатель</th><th>Лимит т/сут</th><th>Исполнено, т</th><th>Остаток, т</th><th>Цена</th><th>Оплата</th><th>Статус</th><th>Действие</th></tr></thead><tbody>';
 for(let c of d.contracts)out+='<tr><td>'+c.id+'</td><td>'+esc(c.buyer)+'</td><td>'+f(c.daily)+'</td><td>'+f(c.fulfilled)+'</td><td>'+f(c.remaining)+'</td><td>'+Math.round(c.priceMultiplier*100)+'% рынка</td><td>'+c.terms+' дн.</td><td>'+esc(c.status)+'</td><td>'+(c.status==='Действует'?'<button class="mini-btn" data-v33-pause="'+c.id+'">Пауза</button>':c.status==='Приостановлен'?'<button class="mini-btn" data-v33-resume="'+c.id+'">Возобновить</button>':'—')+'</td></tr>';
 out+='</tbody></table></div>';
 out+='<h3>Последняя отгрузка</h3>';
 if(last){out+=row('Добыто',f(last.produced)+' т')+row('Подготовлено',f(last.processed)+' т')+row('Реализовано',f(last.sold)+' т')+row('Запас в РВС',f(last.stored)+' усл. ед.');
 for(let x of (last.contracts||[]))out+=row('Договор №'+x.id+' · '+esc(x.buyer),f(x.qty)+' т');
 }else out+='<p class="muted">Для расчёта выполните следующий игровой день.</p>';
 return out;
}
function v33bind(){
 document.querySelectorAll('[data-v33-new]').forEach(x=>x.onclick=v33add);
 document.querySelectorAll('[data-v33-pause]').forEach(x=>x.onclick=()=>v33cancel(Number(x.dataset.v33Pause)));
 document.querySelectorAll('[data-v33-resume]').forEach(x=>x.onclick=()=>v33resume(Number(x.dataset.v33Resume)));
}
const v33oldRender=render;
render=function(){v33oldRender();if(['finance','dispatch'].includes(tab)){let el=document.getElementById('body');if(el){el.insertAdjacentHTML('beforeend',v33view());v33bind()}}};
