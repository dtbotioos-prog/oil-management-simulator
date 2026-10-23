
/* v3.4 — commercial settlements, all amounts in million KZT.
   Revenue accrues at shipment; cash is collected separately. */
function v34init(){
 if(!s.v34)s.v34={invoices:[],receipts:[],seq:0,paidAdvances:{},totalAccrued:0,totalCollected:0};
 let d=s.v34;d.invoices||=[];d.receipts||=[];d.paidAdvances||={};d.seq||=0;return d;
}
function v34date(){
 let v=v8init();return Date.UTC(v.year,v8idx(),v.day)/86400000;
}
function v34marketPrice(){return 7.3*s.oil*s.usd/1e6*.79}
function v34invoice(day){
 let d=v34init(),buyers=v33init(),total=0;
 for(let item of (day.contracts||[])){
  let c=buyers.contracts.find(x=>x.id===item.id);if(!c)continue;
  if(c.advancePct>0&&!d.paidAdvances[c.id]){
   let volume=c.fulfilled+c.remaining;
   let advance=Math.round(volume*v34marketPrice()*(c.priceMultiplier||1)*c.advancePct/100*10000)/10000;
   c.advanceRemaining=(Number(c.advanceRemaining)||0)+advance;
   d.paidAdvances[c.id]=true;
   d.advanceCashPending=(d.advanceCashPending||0)+advance;
   d.receipts.unshift({date:v8date(),contract:c.id,amount:advance,kind:'Аванс'});
  }
  let amount=Math.round(item.qty*v34marketPrice()*(c.priceMultiplier||1)*10000)/10000;
  let prepaid=Math.min(amount,Number(c.advanceRemaining)||0);
  c.advanceRemaining=Math.max(0,(Number(c.advanceRemaining)||0)-prepaid);
  let due=amount-prepaid;
  if(due>0)d.invoices.push({id:++d.seq,contract:c.id,buyer:c.buyer,date:v8date(),createdDay:v34date(),dueDay:v34date()+(c.terms??7),amount:due,paid:0,penalty:0,status:'Ожидает оплаты'});
  total+=amount;d.totalAccrued+=amount;
 }
 return Math.round(total*10000)/10000;
}
function v34collect(){
 let d=v34init(),buyers=v33init(),today=v34date(),collected=d.advanceCashPending||0;d.advanceCashPending=0;
 for(let invoice of d.invoices){
  if(invoice.status==='Оплачен')continue;
  if(today>invoice.dueDay){
   invoice.penalty=Math.round(Math.min(invoice.amount*.05,(today-invoice.dueDay)*invoice.amount*.0005)*10000)/10000;
   invoice.status='Просрочен';
  }
  // Simulated buyer pays within 0–3 days after contractual due date, deterministic by ID.
  if(today>=invoice.dueDay+(invoice.id%4)){
   let amount=Math.max(0,invoice.amount-invoice.paid);
   invoice.paid+=amount;collected+=amount;invoice.status='Оплачен';
   d.receipts.unshift({date:v8date(),contract:invoice.contract,amount,kind:'Оплата счёта'});
  }
 }
 if(d.receipts.length>1500)d.receipts.length=1500;
 if(d.invoices.length>5000)d.invoices.splice(0,d.invoices.length-5000);
 d.totalCollected+=collected;
 return Math.round(collected*10000)/10000;
}
function v34view(){
 let d=v34init(),b=v32init(),month=b.days.slice(-31);
 let produced=month.reduce((a,x)=>a+x.produced,0),processed=month.reduce((a,x)=>a+x.processed,0),sold=month.reduce((a,x)=>a+x.sold,0);
 let pending=d.invoices.filter(x=>x.status!=='Оплачен'),receivable=pending.reduce((a,x)=>a+Math.max(0,x.amount-x.paid),0),overdue=pending.filter(x=>x.status==='Просрочен').reduce((a,x)=>a+x.amount-x.paid,0);
 let out='<h2>Коммерция и дебиторская задолженность</h2><p class="muted">Начисленная выручка учитывается при отгрузке, денежные поступления — при оплате счетов или поступлении аванса. Штрафы за просрочку отображаются как потенциальные требования, но не включаются в кассу до оплаты.</p>';
 out+=row('Начисленная выручка за карьеру',m(d.totalAccrued))+row('Получено денег от покупателей',m(d.totalCollected))+row('Дебиторская задолженность',m(receivable))+row('В том числе просрочено',m(overdue));
 out+='<h3>Производственные показатели · последние 31 день</h3>'+row('Добыто',f(produced)+' т')+row('Подготовлено',f(processed)+' т')+row('Реализовано',f(sold)+' т');
 out+='<h3>Неоплаченные счета</h3><div class="table-scroll"><table><thead><tr><th>№</th><th>Покупатель</th><th>Сумма</th><th>Дней до/после срока</th><th>Статус</th></tr></thead><tbody>';
 for(let x of pending.slice(-35).reverse())out+='<tr><td>'+x.id+'</td><td>'+esc(x.buyer)+'</td><td>'+m(x.amount-x.paid)+'</td><td>'+Math.round(x.dueDay-v34date())+'</td><td>'+esc(x.status)+'</td></tr>';
 out+='</tbody></table></div>';
 out+='<p class="muted">Модель оплаты: покупатель оплачивает счёт в течение 0–3 дней после договорного срока. Начисленная пеня не гарантирует поступления денег. Авансы являются денежными поступлениями, а не дополнительной выручкой.</p>';
 return out;
}
const v34oldRender=render;
render=function(){v34oldRender();if(['finance','dispatch'].includes(tab)){let el=document.getElementById('body');if(el)el.insertAdjacentHTML('beforeend',v34view())}};
