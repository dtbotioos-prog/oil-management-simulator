/* v4.0.3: actionable, staged HR procedure linked to safety events and actual staff positions. */
function safe403Init(){let d=safe402init();d.cases||={};d.orders||=[];return d}
function safe403Employees(){let h=ensureHR();return h.positions.filter(p=>p.employeeId).map(p=>({p,e:h.employees.find(e=>e.id===p.employeeId)})).filter(x=>x.e&&x.e.status==='Работает')}
/* Pure preview; never mutates order duration or books an unpaid bonus. */
function safe403BonusPay(gross){let d=safe403Init(),staff=safe403Employees(),total=staff.reduce((n,x)=>n+(+x.p.salary||0),0);if(!total)return gross;let held=staff.reduce((n,x)=>{let a=d.orders.filter(o=>o.employeeId===x.e.id&&o.active&&o.bonusRestriction&&o.remainingMonths>0);return n+(a.length*(+x.p.salary||0)?(+x.p.salary||0)*Math.max(...a.map(o=>o.bonusRestriction)):0)},0);return Math.max(0,gross-Math.min(gross,gross*held/total))}
function safe404CloseBonusMonth(gross,paid){let d=safe403Init(),allowed=safe403BonusPay(gross),withheld=Math.max(0,gross-allowed);if(withheld){d.bonusSavings=(d.bonusSavings||0)+withheld;log('Премия по локальной политике: не начислено '+m(withheld)+'; оклады не затронуты')}if(!paid&&allowed>0){d.unpaidBonus=(d.unpaidBonus||0)+allowed;log('Начислена, но не выплачена премия: '+m(allowed)+' — задолженность перед работниками')}for(let o of d.orders){if(o.active&&o.remainingMonths>0){o.remainingMonths--;if(!o.remainingMonths)o.active=false}}}
function safe403Choose(id,decision){let d=safe403Init(),e=d.events.find(x=>x.id===id);if(!e||e.status!=='Ожидает решения')return;let c=d.cases[id];if(c)return uiAlert('По событию уже открыто кадровое производство');d.cases[id]={id,decision,stage:'select',created:v8date(),employeeId:null};save();render()}
function safe403Select(id,employeeId){let c=safe403Init().cases[id],x=safe403Employees().find(x=>x.e.id===employeeId);if(!c||!x)return uiAlert('Выберите действующего сотрудника');let ev=safe403Init().events.find(e=>e.id===id);if(ev&&ev.place==='Административный аппарат'&&!/админ|город|офис|управлен|дирек|бухгал|кадр/i.test(x.p.dept+' '+x.p.role))return uiAlert('Для события городского аппарата требуется сотрудник соответствующего подразделения');if(ev&&ev.place!=='Административный аппарат'&&/админ|город|офис|управлен|дирек|бухгал|кадр/i.test(x.p.dept+' '+x.p.role))return uiAlert('Для производственного события выберите работника производственного подразделения');c.employeeId=x.e.id;c.employeeName=x.e.name;c.positionId=x.p.id;c.positionName=x.p.role;c.department=x.p.dept;c.stage='investigation';save();render()}
function safe403Stage(id,action){hr405PrepareBaseline();let d=safe403Init(),c=d.cases[id],e=d.events.find(x=>x.id===id);if(!c||!e)return;let x=safe403Employees().find(x=>x.e.id===c.employeeId);if(!x)return uiAlert('Работник больше не занимает должность');if(action==='investigate'&&c.stage==='investigation'){c.stage='explanation';c.investigated=v8date();c.investigationConfirmed=true;}
else if(action==='explain'&&c.stage==='explanation'){c.stage='order';c.explanation=v8date();c.explanationConfirmed=true;}
else if(action==='cancel'){delete d.cases[id];save();render();return}
else if(action==='order'&&c.stage==='order'){
 if(!c.investigationConfirmed||!c.explanationConfirmed)return uiAlert('Не завершены обязательные этапы расследования и объяснения');
 if(c.decision==='dismiss'&&e.severity==='Нарушение')return uiAlert('Для увольнения по этому событию недостаточно оснований. Выберите иную меру или завершите без взыскания.');
 let label={warning:'Замечание',reprimand:'Выговор',dismiss:'Расторжение трудового договора'}[c.decision];if(!label)return;
 let order={id:d.orders.length+1,eventId:id,employeeId:x.e.id,name:x.e.name,department:x.p.dept,position:x.p.role,type:c.decision,label,date:v8date(),active:c.decision!=='dismiss',remainingMonths:c.decision==='warning'?1:c.decision==='reprimand'?3:0,bonusRestriction:c.decision==='warning'?.25:c.decision==='reprimand'?.65:0};
 // Base salary cannot be cut for a disciplinary sanction. Only the conditional monthly performance bonus changes.
 if(c.decision==='dismiss'){
  let h=ensureHR(),p=x.p,emp=x.e,oldSalary=p.salary;
  emp.status='Уволен';emp.positionId=null;p.employeeId=null;
  hrSync();
  v40init().vacancies.push({job:p.role,department:p.dept,previous:emp.name,created:v8date(),status:'Открыта после увольнения'});
  v40init().staffChanges.unshift(v8date()+' · приказ об увольнении: '+emp.name+' · '+p.role+' / '+p.dept+' · событие №'+id);
  if(typeof hrRecord==='function')hrRecord('Увольнение по событию №'+id+': '+emp.name+' / '+p.role);
  if(typeof staff90Counts==='function')s.safety=cl(s.safety-.5,0,100);
 }
 d.orders.unshift(order);e.status='Решение исполнено';e.decision=c.decision;e.resolution=label+' · '+x.e.name+' · приказ №'+order.id;c.stage='complete';c.orderId=order.id;
 d.actions.unshift({eventId:id,decision:c.decision,label:e.resolution,date:v8date(),cost:0});
 if(s.v11?.inbox)s.v11.inbox.unshift('Кадровый приказ №'+order.id+': '+e.resolution);
 log('Исполнен кадровый приказ №'+order.id+': '+e.resolution);save();render();return;
 }else return;save();render()}
function safe403CaseHtml(e){let c=safe403Init().cases[e.id];if(!c)return '';let html='<div class="safe403-case"><h4>Кадровое производство по событию №'+e.id+'</h4>';
 if(c.stage==='select'){
 let staff=safe403Employees(),options=staff.map(x=>'<option value="'+esc(x.e.id)+'">'+esc(x.e.name)+' — '+esc(x.p.role)+' / '+esc(x.p.dept)+'</option>').join('');
 html+='<p>Укажите конкретного работника, чьи действия подлежат проверке. Список формируется из действующего штатного расписания.</p><select id="safe403-employee-'+e.id+'"><option value="">Выберите работника</option>'+options+'</select> <button class="mini-btn" data-safe403-select="'+e.id+'">Начать проверку</button>';
 }else if(c.stage==='investigation')html+='<p><b>'+esc(c.employeeName)+'</b> · '+esc(c.positionName)+' / '+esc(c.department)+'</p><p>Этап 1/3: установите обстоятельства, доказательства и основания. Увольнение по обычному нарушению заблокировано.</p><button class="mini-btn" data-safe403-action="investigate" data-safe403-id="'+e.id+'">Расследование завершено</button>';
 else if(c.stage==='explanation')html+='<p><b>'+esc(c.employeeName)+'</b></p><p>Этап 2/3: запросите письменное объяснение работника. В расчётной модели получение объяснения или составление акта подтверждается игроком.</p><button class="mini-btn" data-safe403-action="explain" data-safe403-id="'+e.id+'">Объяснение получено / акт составлен</button>';
 else if(c.stage==='order')html+='<p><b>'+esc(c.employeeName)+'</b> · '+esc(c.department)+'</p><p>Этап 3/3: издание приказа. '+(c.decision==='dismiss'?'Работник будет исключён из действующего штата; освободится вакансия, ФОТ уменьшится на его оклад.':'Базовый оклад сохраняется. В игре ограничивается только условная премия по локальной политике: '+(c.decision==='warning'?'25% на один месяц':'65% на три месяца')+'.')+'</p><button class="mini-btn" data-safe403-action="order" data-safe403-id="'+e.id+'">Подписать приказ и исполнить решение</button>';
 else html+='<p class="good">Приказ №'+c.orderId+' исполнен, кадровый и финансовый учёт обновлены.</p>';
 if(c.stage!=='complete')html+=' <button class="mini-btn" data-safe403-action="cancel" data-safe403-id="'+e.id+'">Отменить процедуру</button>';
 return html+'</div>'}
const safe403OldView=safe402View;
safe402View=function(){let html=safe403OldView(),d=safe403Init();let node=document.createElement('div');node.innerHTML=html;
 node.querySelectorAll('.safe402-event').forEach(el=>{let match=el.querySelector('summary b')?.textContent.match(/№(\d+)/);if(!match)return;let e=d.events.find(x=>x.id===Number(match[1]));if(!e)return;let content=el.querySelector('.safe402-event-body');if(!content)return;
 if(d.cases[e.id]){content.querySelectorAll('[data-safe-decision]').forEach(b=>b.remove());content.insertAdjacentHTML('beforeend',safe403CaseHtml(e))}
 else if(e.status==='Ожидает решения')content.querySelectorAll('[data-safe-decision="warning"],[data-safe-decision="reprimand"],[data-safe-decision="dismiss"]').forEach(b=>{b.setAttribute('data-safe403-choose',b.dataset.safeDecision);b.removeAttribute('data-safe-decision')});
 });
 let orders=d.orders.slice(0,15);let section=document.createElement('section');section.className='safe403-history';section.innerHTML='<h3>Приказы и исполнение кадровых решений</h3><p class="muted">Оклад выплачивается полностью. Условная премия может не начисляться частично при наличии соответствующей локальной политики. Увольнение меняет штат и ФОТ.</p>'+(orders.length?orders.map(o=>'<div class="row"><span>№'+o.id+' · '+esc(o.name)+' · '+esc(o.label)+'<small style="display:block">'+esc(o.department)+' · '+esc(o.date)+'</small></span><b>'+(o.type==='dismiss'?'Вакансия':o.active?'Ограничение премии '+o.remainingMonths+' мес.':'Завершено')+'</b></div>').join(''):'<p class="muted">Приказов пока нет.</p>');node.append(section);return node.innerHTML};
const safe403OldRender=render;
render=function(){safe403OldRender();if(!['hse','incidents','ecology'].includes(tab))return;
 document.querySelectorAll('[data-safe403-choose]').forEach(b=>b.onclick=()=>safe403Choose(Number(b.dataset.safeId),b.dataset.safe403Choose));
 document.querySelectorAll('[data-safe403-select]').forEach(b=>b.onclick=()=>{let id=Number(b.dataset.safe403Select);safe403Select(id,document.getElementById('safe403-employee-'+id)?.value)});
 document.querySelectorAll('[data-safe403-action]').forEach(b=>b.onclick=()=>safe403Stage(Number(b.dataset.safe403Id),b.dataset.safe403Action));
};
