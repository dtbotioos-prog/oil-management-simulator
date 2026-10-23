
/* v3.5: Capital planning, contract commitment tracking, loans, treasury cash-flow.
   All monetary values are million KZT. Contract cash deductions are performed by v27award
   in the existing model; this module NEVER charges them again. */
const V35_CAPEX_TYPES=new Set(['rvs_build','rvs_repair','building','building_repair','pipeline','roads','earthworks','foundation','electrical','automation','lighting','fencing','design','survey']);
function v35init(){
 if(!s.v35)s.v35={budget:2500,loanSeq:0,loans:[],cashEntries:[],snapshots:[],lastContractId:0};
 let d=s.v35;d.loans||=[];d.cashEntries||=[];d.snapshots||=[];d.budget??=2500;d.loanSeq??=0;
 return d;
}
function v35contracts(){
 let contracts=v28migrateNames().contracts;
 return {capex:contracts.filter(x=>V35_CAPEX_TYPES.has(x.type)),opex:contracts.filter(x=>!V35_CAPEX_TYPES.has(x.type))};
}
function v35record(type,amount,detail){
 let d=v35init();
 if(!Number.isFinite(amount)||amount<=0)return;
 d.cashEntries.unshift({date:v8date(),day:v34date(),type,amount:Math.round(amount*1000)/1000,detail:detail||''});
 if(d.cashEntries.length>2000)d.cashEntries.length=2000;
}
async function v35budget(){
 let val=await uiPrompt('Установить бюджет капитальных вложений (млн ₸, 0–100000)',''+v35init().budget);
 if(val===null)return;
 let n=Number(val);if(!Number.isFinite(n)||n<0||n>100000)return uiAlert('Укажите бюджет от 0 до 100 000 млн ₸');
 v35init().budget=n;log('Утверждён план CAPEX: '+m(n));save();render();
}
async function v35borrow(){
 let d=v35init();
 let raw=await uiPrompt('Сумма кредита, млн ₸ (100–100000)','5000');if(raw===null)return;
 let amount=Number(raw);if(!Number.isFinite(amount)||amount<100||amount>100000)return uiAlert('Сумма кредита: от 100 до 100 000 млн ₸');
 let yearsRaw=await uiPrompt('Срок кредита, месяцев (3–120)','36');if(yearsRaw===null)return;
 let months=Number(yearsRaw);if(!Number.isInteger(months)||months<3||months>120)return uiAlert('Срок: от 3 до 120 месяцев');
 let rateRaw=await uiPrompt('Годовая ставка, % (5–35)','16');if(rateRaw===null)return;
 let rate=Number(rateRaw);if(!Number.isFinite(rate)||rate<5||rate>35)return uiAlert('Ставка: от 5 до 35%');
 if(!await uiConfirm('Привлечь кредит '+m(amount)+' на '+months+' мес. под '+rate+'% годовых?'))return;
 let loan={id:++d.loanSeq,principal:amount,balance:amount,rate,months,remainingDays:months*30,started:v8date(),status:'Действует',interestPaid:0,principalPaid:0};
 d.loans.push(loan);s.cash+=amount;v35record('credit_in',amount,'Кредит №'+loan.id);
 log('Привлечён кредит №'+loan.id+' на '+m(amount));save();render();
}
async function v35repay(id){
 let loan=v35init().loans.find(x=>x.id===id&&x.status==='Действует');if(!loan)return;
 let raw=await uiPrompt('Досрочное погашение основного долга, млн ₸ (остаток '+loan.balance.toFixed(2)+')',loan.balance.toFixed(2));if(raw===null)return;
 let amount=Number(raw);if(!Number.isFinite(amount)||amount<=0||amount>loan.balance+.001)return uiAlert('Недопустимая сумма погашения');
 if(s.cash<amount)return uiAlert('Недостаточно денежных средств');
 s.cash-=amount;loan.balance=Math.max(0,loan.balance-amount);loan.principalPaid+=amount;
 if(loan.balance<.001){loan.balance=0;loan.status='Погашен'}
 v35record('credit_out',amount,'Досрочное погашение кредита №'+id);log('Досрочное погашение кредита №'+id+': '+m(amount));save();render();
}
function v35day(){
 let d=v35init(),before=s.cash;
 for(let loan of d.loans){
  if(loan.status!=='Действует')continue;
  let interest=Math.round(loan.balance*loan.rate/100/365*10000)/10000;
  if(interest>0){s.cash-=interest;loan.interestPaid+=interest;v25post('opex',interest,{description:'Проценты по кредиту №'+loan.id});v35record('interest',interest,'Проценты по кредиту №'+loan.id)}
  loan.remainingDays--;
  // Amortize the loan monthly, principal is a cash movement, not an expense.
  if(loan.remainingDays%30===0||loan.remainingDays<=0){
   let payment=Math.min(loan.balance,loan.principal/loan.months);
   payment=Math.round(payment*10000)/10000;
   if(payment>0){s.cash-=payment;loan.balance=Math.max(0,loan.balance-payment);loan.principalPaid+=payment;v35record('credit_out',payment,'Плановое погашение кредита №'+loan.id)}
  }
  if(loan.balance<.001){loan.balance=0;loan.status='Погашен'}
  else if(loan.remainingDays<=0){loan.remainingDays=30;loan.status='Просрочен';log('Просрочено погашение кредита №'+loan.id)}
 }
 let today=v34date();
 d.snapshots.push({day:today,date:v8date(),cash:Math.round(s.cash*100)/100});
 if(d.snapshots.length>730)d.snapshots.shift();
}
function v35view(){
 let d=v35init(),parts=v35contracts(),committed=parts.capex.reduce((a,c)=>a+c.price,0),operating=parts.opex.reduce((a,c)=>a+c.price,0);
 let loans=d.loans.filter(x=>x.status!=='Погашен'),debt=loans.reduce((a,x)=>a+x.balance,0);
 let cash30=d.cashEntries.filter(x=>x.day>=v34date()-30);
 let flows={credit_in:0,credit_out:0,interest:0,capex:0,contract_opex:0};
 for(let e of cash30)if(Object.prototype.hasOwnProperty.call(flows,e.type))flows[e.type]+=e.amount;
 let out='<h2>Инвестиции, бюджет и казначейство · v3.5</h2><p class="muted">Все суммы — млн ₸. CAPEX — строительные и инфраструктурные договоры; OPEX — прочие подрядные работы. Плановый бюджет не списывает деньги повторно: договоры оплачиваются по прежним правилам при заключении.</p>';
 out+=row('Утверждённый бюджет CAPEX',m(d.budget))+row('Заключённые капитальные договоры',m(committed))+row('Остаток лимита CAPEX',m(d.budget-committed))+row('Подрядные договоры OPEX',m(operating));
 out+='<div class="v35-progress"><span style="width:'+Math.min(100,d.budget?committed/d.budget*100:0)+'%"></span></div>';
 if(committed>d.budget)out+='<div class="notice bad">Превышен плановый лимит капитальных вложений. Новые договоры требуют пересмотра бюджета.</div>';
 out+='<div class="actions"><button class="btn secondary" data-v35-budget>Изменить бюджет CAPEX</button><button class="btn secondary" data-v35-loan>Привлечь кредит</button></div>';
 out+='<h3>Кредитный портфель</h3>'+row('Остаток денежных средств',m(s.cash))+row('Основной долг',m(debt))+row('Активных кредитов',loans.length);
 out+='<div class="table-scroll"><table><thead><tr><th>Кредит</th><th>Ставка</th><th>Остаток</th><th>Дней до срока</th><th>Статус</th><th>Управление</th></tr></thead><tbody>';
 for(let l of d.loans)out+='<tr><td>№'+l.id+'</td><td>'+l.rate+'%</td><td>'+m(l.balance)+'</td><td>'+Math.max(0,l.remainingDays)+'</td><td>'+esc(l.status)+'</td><td>'+(l.status==='Действует'?'<button class="mini-btn" data-v35-repay="'+l.id+'">Погасить</button>':'—')+'</td></tr>';
 out+='</tbody></table></div>';
 out+='<h3>Денежные потоки казначейства · последние 30 дней</h3>';
 out+=row('Привлечение кредитов',m(flows.credit_in))+row('Погашение основного долга',m(flows.credit_out))+row('Проценты по кредитам',m(flows.interest))+row('Оплата капитальных договоров',m(flows.capex))+row('Оплата подрядных работ OPEX',m(flows.contract_opex));
 out+='<h3>Реестр капитальных договоров</h3><div class="table-scroll"><table><thead><tr><th>№</th><th>Объект</th><th>Вид работ</th><th>Стоимость</th><th>Статус</th></tr></thead><tbody>';
 for(let c of parts.capex.slice(0,35))out+='<tr><td>'+c.id+'</td><td>'+esc(c.objectName||'—')+'</td><td>'+esc(V27_TYPES[c.type]?.label||c.type)+'</td><td>'+m(c.price)+'</td><td>'+esc(c.status)+'</td></tr>';
 out+='</tbody></table></div><p class="muted">Расчётная модель: нет налогов, амортизации, НДС, банковских ковенантов, залогов и индивидуальных графиков подрядных платежей. Показатели казначейства фиксируются с момента установки v3.5.</p>';
 return out;
}
function v35bind(){
 document.querySelectorAll('[data-v35-budget]').forEach(x=>x.onclick=v35budget);
 document.querySelectorAll('[data-v35-loan]').forEach(x=>x.onclick=v35borrow);
 document.querySelectorAll('[data-v35-repay]').forEach(x=>x.onclick=()=>v35repay(Number(x.dataset.v35Repay)));
}
const v35oldAward=v27award;
v27award=async function(id,bidId){
 let d=v28migrateNames(),t=d.tenders.find(x=>x.id===id),b=t?.bids?.find(x=>x.id===bidId);
 if(!t||!b)return v35oldAward(id,bidId);
 if(V35_CAPEX_TYPES.has(t.type)){
  let current=v35contracts().capex.reduce((a,c)=>a+c.price,0);
  let budget=v35init().budget;
  if(current+b.price>budget)return uiAlert('Лимит CAPEX превышен: требуется '+m(current+b.price)+' при бюджете '+m(budget)+'. Увеличьте бюджет в разделе «Финансы».');
 }
 let before=v28migrateNames().contracts.length;
 let cashBefore=s.cash;
 let result=await v35oldAward(id,bidId);
 if(v28migrateNames().contracts.length>before&&s.cash<cashBefore){
  v35record(V35_CAPEX_TYPES.has(t.type)?'capex':'contract_opex',cashBefore-s.cash,'Договор №'+v28migrateNames().contracts[0].id);
 }
 return result;
};
const v35oldDay=v26day;
v26day=function(){v35oldDay();v35day()};
const v35oldRender=render;
render=function(){v35oldRender();if(tab==='finance'){let el=document.getElementById('body');if(el){el.insertAdjacentHTML('beforeend',v35view());v35bind()}}};
