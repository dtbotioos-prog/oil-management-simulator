/* v2.5: Daily accounting ledger, figures in million KZT. */
function v25init(){
 if(!s.v25)s.v25={entries:[],closed:[],seq:0};
 if(!Array.isArray(s.v25.entries))s.v25.entries=[];
 if(!Array.isArray(s.v25.closed))s.v25.closed=[];
 if(!Number.isFinite(s.v25.seq))s.v25.seq=0;
 return s.v25;
}
function v25post(type,amount,meta){
 if(!Number.isFinite(amount)||amount<0)throw Error('Invalid ledger amount');
 let l=v25init();l.entries.push({id:++l.seq,date:v8date(),month:s.month,type,amount,meta:meta||{}});
 if(l.entries.length>15000)l.entries.splice(0,l.entries.length-15000);
}
function v25totals(entries){
 let t={sale:0,opex:0,payroll:0,incident:0,bonus:0,maintenance:0,volume:0};
 for(let e of entries){if(Object.prototype.hasOwnProperty.call(t,e.type))t[e.type]+=e.amount;if(e.type==='sale')t.volume+=Number(e.meta?.tons)||0;}
 t.expense=t.opex+t.payroll+t.incident+t.bonus+t.maintenance;
 t.profit=t.sale-t.expense;
 return t;
}
function v25closeMonth(){
 let l=v25init(),entries=l.entries.filter(x=>x.month===s.month-1),t=v25totals(entries);
 s.volume=t.volume;s.revenue=t.sale;s.expense=t.expense;s.profit=t.profit;
 l.closed.push({month:s.month-1,date:v8date(),...t});if(l.closed.length>240)l.closed.shift();
}
function v25view(){
 let l=v25init(),current=v25totals(l.entries.filter(x=>x.month===s.month)),last=l.closed[l.closed.length-1];
 let lines=[['Реализация нефти',current.sale],['Операционные расходы',current.opex],['Зарплата (суточное начисление)',current.payroll],['Происшествия',current.incident],['Премии',current.bonus],['Ремонт скважин',current.maintenance],['Расчётный результат',current.profit]];
 return '<h2>Единый журнал суточной экономики</h2><p class="muted">Выручка начисляется по фактической отгрузке и условиям договоров. Денежные поступления учитываются отдельно. Все суммы — млн ₸. Списания по договорам, модернизации и прочим отдельным действиям пока учитываются в денежных средствах, но не включены в эту таблицу прибыли.</p>'+lines.map(x=>row(x[0],m(x[1]))).join('')+
 '<h3>Последний закрытый месяц</h3>'+(last?row('Реализовано',f(last.volume)+' т')+row('Выручка',m(last.sale))+row('Основные расходы',m(last.expense))+row('Результат',m(last.profit)):'<p class="muted">Месяц ещё не закрыт.</p>')+
 '<h3>Последние операции</h3>'+l.entries.slice(-20).reverse().map(x=>'<div class="row"><span>'+esc(x.date)+' · '+esc(({sale:'Реализация',opex:'Операционные расходы',payroll:'ФОТ',incident:'Происшествие',bonus:'Премия',maintenance:'Ремонт скважины'})[x.type]||x.type)+'</span><b>'+m(x.amount)+'</b></div>').join('');
}
