/* v4.0.5 — unified workforce, safety case index and financial obligations. */
function hr405PrepareBaseline(){const h=ensureHR();if(h.initialSalaryFund===undefined)h.initialSalaryFund=h.positions.filter(p=>p.employeeId).reduce((n,p)=>n+(+p.salary||0),0);if(h.baseSalaryFund===undefined)h.baseSalaryFund=v8init().salaryFund}
function hr405MassHire(count){
 hr405PrepareBaseline();
 const h=ensureHR();for(let i=0;i<count;i++){
  let n=++h.seq,id='P'+n,eid='E'+n;
  let dept=ORG[n%ORG.length]||'Производство',role='Оператор производства';
  h.positions.push({id,dept,role,salary:hrSalary(role),employeeId:eid});
  h.employees.push({id:eid,name:hrName(n),positionId:id,experience:1,performance:70,training:70,status:'Работает'});
 }
 hrSync();hrRecord('Массовый приём: '+count+' человек, штатное расписание и ФОТ обновлены');
}
function hr405Reconcile(){
 const h=ensureHR(),byId=new Map(h.employees.map(e=>[e.id,e])),used=new Set();
 for(const p of h.positions){if(!p.employeeId)continue;let e=byId.get(p.employeeId);
  if(!e||e.status!=='Работает'||used.has(e.id)){p.employeeId=null;continue}
  used.add(e.id);e.positionId=p.id;
 }
 for(const e of h.employees)if(e.status==='Работает'&&!used.has(e.id)){e.status='Без назначения';e.positionId=null}
 hrSync();return {active:used.size,vacant:h.positions.filter(p=>!p.employeeId).length};
}
function safe405Reconcile(){
 const d=safe403Init(),legacy=v8init().incidents||[];d.legacyIndex||={};
 for(const ev of legacy){let key='v8:'+ev.id;if(d.legacyIndex[key])continue;
  const id=++d.next;d.events.unshift({id,origin:key,area:ev.severity==='Авария'?'industrial':'labor',title:ev.severity,place:ev.well&&ev.well!=='—'?'Скважина №'+ev.well:'Производственный объект',context:'автоматически зарегистрированное производственное событие',severity:ev.severity,created:ev.date,status:'Ожидает решения',scope:'Производственный цех',impact:0,decision:null,expense:ev.expense});d.legacyIndex[key]=id;
 }
 // Legacy events are mirrored, not regenerated: costs and safety penalties remain booked only once.
 return {total:d.events.length,legacy:Object.keys(d.legacyIndex).length,open:d.events.filter(e=>e.status==='Ожидает решения').length};
}
function fin405Init(){if(!s.fin405)s.fin405={items:[],lastReconciled:null};return s.fin405}
function fin405Reconcile(){
 const f=fin405Init(),items=[];
 const contracts=v28migrateNames().contracts||[];
 for(const c of contracts){items.push({key:'contract:'+c.id,kind:'Подряд',name:'Договор №'+c.id+' · '+(c.supplier||''),total:+c.price||0,paid:+c.price||0,due:0,status:c.status,source:'v28'});}
 const loans=v35init().loans||[];
 for(const l of loans){let balance=Math.max(0,+l.balance||0);items.push({key:'loan:'+l.id,kind:'Кредит',name:'Кредит №'+l.id,total:+l.principal||0,paid:+l.principalPaid||0,due:balance,status:l.status,source:'v35'});}
 const bonus=Math.max(0,+safe403Init().unpaidBonus||0);
 if(bonus)items.push({key:'bonus:unpaid',kind:'Персонал',name:'Начисленная невыплаченная премия',total:bonus,paid:0,due:bonus,status:'К выплате',source:'safe403'});
 const existing=new Map(f.items.map(x=>[x.key,x]));
 f.items=items.map(x=>({...x,firstSeen:existing.get(x.key)?.firstSeen||v8date()}));f.lastReconciled=v8date();
 return {items:f.items,debt:f.items.reduce((n,x)=>n+x.due,0),contracts:f.items.filter(x=>x.kind==='Подряд').length};
}
function fin405View(){let a=fin405Reconcile(),v=a.items;return '<section class="fin405"><h2>Сверка финансовых обязательств</h2>'+row('Непогашенные обязательства',m(a.debt))+row('Договоров в реестре',a.contracts)+row('Кредитов',v.filter(x=>x.kind==='Кредит').length)+'<p class="muted">Договоры в текущей модели оплачиваются полностью при подписании. Остаток долга включает кредитный основной долг и начисленные невыплаченные премии; проценты будущих периодов не включены. Это реестр обязательств, а не полный баланс предприятия.</p><div class="table-scroll"><table><thead><tr><th>Обязательство</th><th>Сумма</th><th>Оплачено</th><th>Остаток</th><th>Статус</th></tr></thead><tbody>'+v.slice(-60).reverse().map(x=>'<tr><td>'+esc(x.name)+'</td><td>'+m(x.total)+'</td><td>'+m(x.paid)+'</td><td>'+m(x.due)+'</td><td>'+esc(x.status||'—')+'</td></tr>').join('')+'</tbody></table></div></section>'}
const safe405Advance=v8advance;v8advance=function(){let before=v8init().daysElapsed;let result=safe405Advance();if(v8init().daysElapsed!==before){safe405Reconcile();fin405Reconcile()}return result};
const safe405Render=render;render=function(){if(s){hr405Reconcile();safe405Reconcile()}safe405Render();if(s&&tab==='finance'){let body=document.getElementById('body');if(body)body.insertAdjacentHTML('beforeend',fin405View())}};
