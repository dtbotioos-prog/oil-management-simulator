
(()=>{const KEY='oil-management-v01';let s=null,tab='overview';const $=x=>document.getElementById(x),f=n=>new Intl.NumberFormat('ru-RU',{maximumFractionDigits:1}).format(n),m=n=>f(n)+' млн ₸',esc=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),cl=(n,a,b)=>Math.min(b,Math.max(a,n)),r=(a,b)=>a+Math.random()*(b-a);function save(){localStorage.setItem(KEY,JSON.stringify(s))}function log(t){s.events.unshift('Месяц '+s.month+': '+t);s.events=s.events.slice(0,60)}function show(){$('setup').classList.add('hide');$('game').classList.remove('hide');render()}function row(a,b){return '<div class="row"><span class="muted">'+a+'</span><b>'+b+'</b></div>'}function stat(a,b){return '<div class="stat"><small>'+a+'</small><b>'+b+'</b></div>'}function action(t){const x={drill:[950,'Начато бурение скважины'],repair:[180,'Капитальный ремонт фонда'],service:[80,'Плановое техобслуживание'],hse:[65,'Обучение и профилактика HSE'],survey:[110,'Геологическое исследование']}[t];if(!x||s.cash<x[0])return uiAlert('Недостаточно средств');s.cash-=x[0];if(t==='drill')s.pending.push(2);if(t==='repair'){s.condition=cl(s.condition+16,0,100);s.rate+=.5}if(t==='service')s.condition=cl(s.condition+10,0,100);if(t==='hse')s.safety=cl(s.safety+14,0,100);if(t==='survey')s.rate+=.15;log(x[1]+' — '+m(x[0]));save();render()}function next(){if(s.dead)return;s.month++;assetMonth();treeMonth();s.pending=s.pending.map(n=>n-1);let done=s.pending.filter(n=>n===0).length;s.pending=s.pending.filter(n=>n>0);for(let i=0;i<done;i++){if(Math.random()<.82){s.wells++;log('Новая скважина успешно запущена')}else log('Бурение не дало промышленного притока')}s.oil=cl(s.oil+r(-18,18),45,115);s.usd=cl(s.usd+r(-12,12),380,600);s.water=cl(s.water+r(.1,.8),0,95);s.condition=cl(s.condition-r(1.5,3),0,100);s.safety=cl(s.safety-r(.5,2),0,100);s.rate=cl(s.rate-r(.05,.2),2,30);let downtime=cl((100-s.condition)*.004,0,.65);if(Math.random()<(100-s.safety)*.0015){downtime+=.2;s.cash-=55;log('Инцидент: внеплановый простой, расходы 55 млн ₸')}ensureAssets();s.assets.wellList.forEach(w=>{w.health=Math.max(10,Math.round(w.health-(1+Math.random()*3)));w.water=Math.min(95,Math.round(w.water+Math.random()*1.3));w.rate=Math.max(1,Math.round((w.rate-.08-Math.random()*.12)*10)/10)});let activeRatio=s.assets.wellList.filter(w=>w.status==='Работает').length/Math.max(1,s.wells);v25closeMonth();s.history.push({volume:s.volume,profit:s.profit});enterpriseMonth();opsMonth();if(s.enterprise&&s.enterprise.hr)hrMonth();if(s.cash<0){s.dead=true;log('Неплатёжеспособность: карьера завершена')}save();render()}function ensureAssets(){if(!s.assets)s.assets={};if(!s.assets.wellList)s.assets.wellList=[];while(s.assets.wellList.length<s.wells){let n=Math.max(1000,...s.assets.wellList.map(w=>w.id))+1;s.assets.wellList.push({id:n,unit:'ГУ-'+(1+Math.floor((n-1)/16)),status:'Работает',rate:Math.round((s.rate||18)*(0.75+Math.random()*.5)*10)/10,water:Math.round(Math.min(95,Math.max(2,(s.water||28)+(Math.random()-.5)*18))),health:Math.round(Math.min(100,Math.max(20,(s.condition||88)+(Math.random()-.5)*22)))})}if(s.assets.wellList.length>s.wells)s.assets.wellList.length=s.wells;if(!s.assets.infrastructure)s.assets.infrastructure=[{id:'ГУ-1',type:'Групповая установка',health:92},{id:'ГУ-2',type:'Групповая установка',health:88},{id:'ГУ-3',type:'Групповая установка',health:90},{id:'ДНС-1',type:'Дожимная насосная станция',health:86},{id:'ЦППН',type:'Подготовка нефти',health:91},{id:'ППД-1',type:'Поддержание пластового давления',health:83}];}function dispatchAction(id,act){ensureAssets();let w=s.assets.wellList.find(x=>x.id===Number(id));if(!w)return;let cost=act==='repair'?42:act==='stop'?0:0;if(s.cash<cost)return uiAlert('Недостаточно средств');if(act==='repair'){v26requestRepair(w);return}if(act==='stop'){w.status=w.status==='Остановлена'?'Работает':'Остановлена';log('Скважина №'+id+': '+w.status)}save();render()}let v13Page=0;function dispatchView(){ensureAssets();let a=s.assets.wellList,active=a.filter(w=>w.status==='Работает').length,avg=(k)=>a.length?(a.reduce((n,w)=>n+w[k],0)/a.length).toFixed(1):'0';let out='<div class="dispatch-head"><div><h2 style="margin:0">Диспетчерская месторождения</h2><p class="muted">Оперативная модель · данные игрового месяца</p></div><span class="live-dot">● СИМУЛЯЦИЯ</span></div><div class="dispatch-kpis"><div><small>Фонд скважин</small><strong>'+a.length+'</strong></div><div><small>В работе</small><strong>'+active+'</strong></div><div><small>Средний дебит</small><strong>'+avg('rate')+' т/сут</strong></div><div><small>Средняя обводнённость</small><strong>'+avg('water')+'%</strong></div></div><h3>Производственные объекты</h3><div class="asset-grid">'+s.assets.infrastructure.map(o=>'<div class="asset"><div class="asset-top"><b>'+esc(o.id)+'</b><span class="good">● В работе</span></div><small>'+esc(o.type)+'</small><div class="meter"><i style="width:'+o.health+'%"></i></div><small>Готовность оборудования '+o.health+'%</small></div>').join('')+'</div><h3>Реестр скважин</h3><div class="table-scroll"><table class="well-table"><thead><tr><th>№</th><th>Объект</th><th>Статус</th><th>Дебит, т/сут</th><th>Вода, %</th><th>Состояние, %</th><th>Управление</th></tr></thead><tbody>'+a.slice(v13Page*40,(v13Page+1)*40).map(w=>'<tr><td><b>'+w.id+'</b></td><td>'+esc(w.unit)+'</td><td><span class="'+(w.status==='Работает'?'good':'warn')+'">● '+w.status+'</span></td><td>'+w.rate.toFixed(1)+'</td><td>'+w.water+'</td><td><div class="mini-meter"><i style="width:'+w.health+'%"></i></div>'+w.health+'%</td><td><button class="mini-btn" data-well="'+w.id+'" data-op="stop">'+(w.status==='Работает'?'Остановить':'Запустить')+'</button> <button class="mini-btn" data-well="'+w.id+'" data-op="repair" '+(s.cash<42?'disabled':'')+'>Ремонт · 42 млн ₸</button></td></tr>').join('')+'</tbody></table></div><div class="v13pager"><button data-v13-page="prev" '+(v13Page===0?'disabled':'')+'>← Назад</button><span>Страница '+(v13Page+1)+' / '+Math.max(1,Math.ceil(a.length/40))+'</span><button data-v13-page="next" '+((v13Page+1)*40>=a.length?'disabled':'')+'>Далее →</button></div><div class="notice">Показатели скважин и готовности объектов — учебная модель. Для расчёта финансов используется агрегированная модель версии 0.1; остановка скважин отражается в добыче при переходе к следующему месяцу.</div>';return out}
const ORG=["Служба корпоративного секретаря", "Служба внутреннего аудита", "Служба комплаенс", "Руководство", "Департамент правового обеспечения", "Департамент безопасности и охраны труда, охраны окружающей среды", "Служба безопасности и охраны труда", "Служба производственного контроля", "Служба охраны окружающей среды и парниковых газов", "Группа пожарной безопасности", "Служба гражданской обороны и чрезвычайных ситуаций", "Департамент перспективного развития и управления рисками", "Департамент автоматизации, информационных технологий и связи", "Центральный инженерно-технологический департамент", "Производственно-технический департамент", "Отдел главного энергетика", "Отдел главного механика", "Транспортный департамент", "Департамент капитального строительства", "ПУ «Сарытаунефть»", "ПУ «Боздалаойл»"];
const CONTRACT_TYPES={prs:{label:'ПРС · текущий ремонт скважины',cost:35,term:1,eff:6},krs:{label:'КРС · капитальный ремонт скважины',cost:125,term:2,eff:18},drill:{label:'Бурение эксплуатационной скважины',cost:950,term:3,eff:0},env:{label:'Экологический мониторинг и рекультивация',cost:60,term:2,eff:12},maint:{label:'Диагностика и обслуживание объектов',cost:95,term:2,eff:12}};
function ensureEnterprise(){if(!s.enterprise)s.enterprise={target:7500,staff:240,training:72,environment:78,industrial:77,contractors:[],fines:0,emissions:0,waste:0,report:[],monthContractId:0,dept:ORG.map((name,i)=>({name,headcount:i<4?3:10,chief:i<4?'Руководитель службы':'Начальник подразделения'})),audit:72};let e=s.enterprise;e.contractors ||= [];e.report ||= [];e.dept ||= ORG.map(name=>({name,headcount:8,chief:'Руководитель'}));e.fines ||=0;e.emissions ||=0;e.waste ||=0;e.target ??=7500;e.staff ??=240;e.training ??=72;e.environment ??=78;e.industrial ??=77;e.audit ??=72;e.monthContractId ||=0;return e}
async function enterpriseAct(kind,arg){let e=ensureEnterprise(),cost=0,msg='';if(kind==='contract'){let type=CONTRACT_TYPES[arg];if(!type)return;cost=type.cost*.3;let id=++e.monthContractId;e.contractors.push({id,type:arg,contractor:'Подрядчик №'+id,remaining:type.term,initial:type.term,price:type.cost,paid:cost,penalty:0,status:'В работе'});msg='Заключён договор №'+id+': '+type.label+'; аванс '+m(cost)}else if(kind==='hire'){cost=24;e.staff+=12;msg='Приняты 12 работников, затраты на подбор '+m(cost)}else if(kind==='train'){cost=30;e.training=cl(e.training+18,0,100);s.safety=cl(s.safety+8,0,100);msg='Обучение, проверка знаний и инструктажи'}else if(kind==='eco'){cost=50;e.environment=cl(e.environment+15,0,100);msg='Экологическая программа: мониторинг, отходы, выбросы'}else if(kind==='industrial'){cost=65;e.industrial=cl(e.industrial+17,0,100);s.condition=cl(s.condition+4,0,100);msg='Экспертиза, диагностика ОТУ и промышленная безопасность'}else if(kind==='audit'){cost=18;e.audit=cl(e.audit+15,0,100);msg='Проведён внутренний аудит и контроль исполнения'}else if(kind==='target'){let n=Number(await uiPrompt('План добычи нефти, тонн за месяц:',e.target));if(!Number.isFinite(n)||n<0||n>1e7)return;e.target=Math.round(n);msg='План добычи установлен: '+f(e.target)+' т'}else return;if(s.cash<cost)return uiAlert('Недостаточно средств для операции: '+m(cost));s.cash-=cost;log(msg);save();render()}
function enterpriseMonth(){let e=ensureEnterprise();let report=[];for(let c of e.contractors){if(c.status!=='В работе')continue;let late=Math.random()<cl((100-e.audit)*.003+.05,.04,.3);if(late){let penalty=Math.round(c.price*.05*10)/10;c.penalty+=penalty;e.fines+=penalty;s.cash+=penalty;report.push('Просрочка договора №'+c.id+' — начислена неустойка '+m(penalty));continue}c.remaining--;if(c.remaining<=0){c.status='Завершён';let t=CONTRACT_TYPES[c.type];let final=t.cost-c.paid;s.cash-=final;c.paid=t.cost;if(c.type==='drill'){s.wells++;report.push('Бурение по договору №'+c.id+' завершено: введена скважина')}if(c.type==='prs'){s.rate+=.25;s.condition=cl(s.condition+3,0,100);report.push('ПРС: восстановлен дебит')}if(c.type==='krs'){s.rate+=.6;s.condition=cl(s.condition+8,0,100);report.push('КРС: восстановлена производительность')}if(c.type==='env')e.environment=cl(e.environment+12,0,100);if(c.type==='maint')s.condition=cl(s.condition+12,0,100);report.push('Договор №'+c.id+' исполнен')}}e.training=cl(e.training-1.5,0,100);e.environment=cl(e.environment-1.3,0,100);e.industrial=cl(e.industrial-1.2,0,100);e.audit=cl(e.audit-.7,0,100);let payroll=e.staff*.14;s.cash-=payroll;s.expense+=payroll;let envRisk=(100-e.environment)*.0018,indRisk=(100-e.industrial)*.0016;if(Math.random()<envRisk){let fine=35+Math.round(Math.random()*75);s.cash-=fine;e.fines+=fine;report.push('Экологическое нарушение: штраф '+m(fine));s.safety=cl(s.safety-3,0,100)}if(Math.random()<indRisk){let fine=45+Math.round(Math.random()*95);s.cash-=fine;e.fines+=fine;report.push('Нарушение промышленной безопасности: штраф '+m(fine));s.condition=cl(s.condition-4,0,100)}e.emissions=Math.round((s.volume||0)*.035);e.waste=Math.round((s.volume||0)*.007);e.report=[{month:s.month,plan:e.target,actual:Math.round(s.volume),pct:e.target?Math.round(s.volume/e.target*100):0,payroll,fines:e.fines},...e.report].slice(0,24);for(let x of report)log(x);if(report.length===0)log('Производственный цикл завершён без новых договорных и надзорных событий')}
function enterpriseView(){let e=ensureEnterprise();if(tab==='plan'){let pct=e.target?Math.round(s.volume/e.target*100):0;return '<h2>План и производственный цикл</h2><div class="three"><div class="mini-card"><small>План на месяц</small><strong>'+f(e.target)+' т</strong></div><div class="mini-card"><small>Факт последнего месяца</small><strong>'+f(s.volume)+' т</strong></div><div class="mini-card"><small>Выполнение</small><strong class="'+(pct>=100?'good':'warn')+'">'+pct+'%</strong><div class="progress"><i style="width:'+cl(pct,0,100)+'%"></i></div></div></div><div class="actions"><button class="btn" data-enterprise="target">Изменить план добычи</button></div><h3>Производственная цепочка</h3>'+['Геология и планирование','Бурение и ввод скважин','Добыча и эксплуатация фонда','Сбор нефти и газа: ГУ → ДНС','Подготовка нефти: ЦППН','Транспортировка и реализация','ППД и поддержание пластового давления','ПРС / КРС / техническое обслуживание'].map((x,i)=>row('0'+(i+1)+' · '+x,i<3?'Активно':'Моделируется')).join('')+'<h3>История плана</h3>'+e.report.slice(0,8).map(x=>row('Месяц '+x.month+' · план '+f(x.plan)+' т',f(x.actual)+' т · '+x.pct+'%')).join('')}
if(tab==='contracts'){return '<h2>Подрядные организации и договоры</h2><p class="muted">Подрядчик, договор, аванс, срок исполнения, риск просрочки и договорная неустойка. Подрядчики в игре вымышленные.</p><div class="three">'+Object.entries(CONTRACT_TYPES).map(([k,t])=>'<div class="mini-card"><small>'+t.label+'</small><strong>'+m(t.cost)+'</strong><div class="fine">Нормативный игровой срок: '+t.term+' мес.</div><button class="btn compact wide" data-enterprise="contract" data-arg="'+k+'">Заключить договор</button></div>').join('')+'</div><h3>Реестр договоров</h3><div class="table-scroll"><table><thead><tr><th>Договор</th><th>Подрядчик / работа</th><th>Срок</th><th>Цена</th><th>Штрафы</th><th>Статус</th></tr></thead><tbody>'+e.contractors.map(c=>'<tr><td>№'+c.id+'</td><td>'+esc(c.contractor)+'<div class="fine">'+CONTRACT_TYPES[c.type].label+'</div></td><td>'+c.remaining+' мес.</td><td>'+m(c.price)+'</td><td>'+m(c.penalty)+'</td><td>'+esc(c.status)+'</td></tr>').join('')+'</tbody></table></div>'+row('Начисленные штрафы подрядчикам и регуляторные штрафы (совокупно)',m(e.fines))}
if(tab==='staff')return '<h2>Штат и развитие работников</h2><div class="three"><div class="mini-card"><small>Штат</small><strong>'+e.staff+' чел.</strong></div><div class="mini-card"><small>Обучение и проверка знаний</small><strong>'+Math.round(e.training)+'%</strong></div><div class="mini-card"><small>Условный ФОТ / месяц</small><strong>'+m(e.staff*.14)+'</strong></div></div><div class="actions"><button class="btn secondary" data-enterprise="hire">Нанять 12 работников · 24 млн ₸</button><button class="btn secondary" data-enterprise="train">Обучение и инструктажи · 30 млн ₸</button></div><h3>Кадровые направления</h3>'+['Операторы добычи нефти и газа','Мастера и инженеры ЦДНГ','Буровые и ремонтные бригады подрядчиков','Механики и энергетики','Специалисты БиОТ, промышленной безопасности и экологии','Экономисты, финансисты, юристы и закупки'].map(x=>row(x,'Штат / подряд')).join('');
if(tab==='ecology')return '<h2>Экология, БиОТ и промышленная безопасность</h2><div class="three">'+[['Экология',e.environment],['Промышленная безопасность',e.industrial],['БиОТ / HSE',s.safety],['Внутренний аудит',e.audit]].map(([n,v])=>'<div class="mini-card"><small>'+n+'</small><strong>'+Math.round(v)+'%</strong><div class="progress"><i style="width:'+v+'%"></i></div></div>').join('')+'</div>'+row('Расчётные выбросы за месяц',f(e.emissions)+' усл. ед.')+row('Расчётные отходы за месяц',f(e.waste)+' усл. ед.')+row('Совокупные штрафы',m(e.fines))+'<div class="actions"><button class="btn secondary" data-enterprise="eco">Экологические мероприятия · 50 млн ₸</button><button class="btn secondary" data-enterprise="industrial">Промбезопасность · 65 млн ₸</button><button class="btn secondary" data-enterprise="train">Обучение БиОТ · 30 млн ₸</button><button class="btn secondary" data-enterprise="audit">Внутренний аудит · 18 млн ₸</button></div><div class="notice">Штрафы, индексы, выбросы и сроки — игровые допущения, а не расчёт по нормативам РК.</div>';
if(tab==='org')return '<h2>Организационная структура</h2><p class="muted">Структура должностей основана на названиях подразделений в телефонном справочнике от 14.08.2026. ФИО и контакты сотрудников не используются. Игровые численность и назначения условные.</p><div class="three">'+e.dept.map((d,i)=>'<div class="mini-card"><small>Подразделение '+(i+1)+'</small><strong>'+esc(d.name)+'</strong><div class="fine">Должность: '+esc(d.chief)+'<div>Плановый штат: '+d.headcount+' ед.</div></div></div>').join('')+'</div>';
return ''}

const HR_MALE=['Айдар','Данияр','Марат','Ерлан','Нурлан','Бекзат','Арман','Руслан','Ермек','Азамат','Самат','Тимур','Аскар','Жанболат'];const HR_FEMALE=['Асель','Алия','Жанар','Мадина','Сауле','Гульнар','Айгуль','Динара','Аружан','Гульмира'];
const HR_LAST=['Сериков','Ахметов','Тлеубаев','Омаров','Ибраев','Касымов','Жумабаев','Нургалиев','Есенов','Абдрахманов','Муратов','Бекенов','Смагулов','Кенжебаев'];
const HR_ROLES={
'Руководство':['Генеральный директор','Первый заместитель генерального директора','Заместитель генерального директора по производству','Заместитель генерального директора по экономике и финансам','Советник генерального директора'],
'Служба корпоративного секретаря':['Корпоративный секретарь','Главный специалист','Ведущий специалист'],
'Служба внутреннего аудита':['Руководитель службы','Главный аудитор','Внутренний аудитор'],
'Служба комплаенс':['Руководитель службы','Главный комплаенс-офицер','Специалист по комплаенс'],
'Департамент правового обеспечения':['Директор департамента','Начальник отдела','Главный юрисконсульт','Юрисконсульт'],
'Департамент безопасности и охраны труда, охраны окружающей среды':['Директор департамента','Заместитель директора','Главный специалист'],
'Служба безопасности и охраны труда':['Начальник службы','Ведущий инженер по БиОТ','Инженер по БиОТ'],
'Служба производственного контроля':['Начальник службы','Ведущий инженер производственного контроля','Инженер производственного контроля'],
'Служба охраны окружающей среды и парниковых газов':['Начальник службы','Ведущий эколог','Инженер-эколог'],
'Группа пожарной безопасности':['Руководитель группы','Инженер пожарной безопасности','Специалист пожарной безопасности'],
'Служба гражданской обороны и чрезвычайных ситуаций':['Начальник службы','Ведущий инженер ГО и ЧС','Инженер ГО и ЧС'],
'Департамент перспективного развития и управления рисками':['Директор департамента','Начальник отдела рисков','Главный специалист по рискам'],
'Департамент автоматизации, информационных технологий и связи':['Директор департамента','Начальник отдела ИТ','Системный администратор','Инженер АСУ ТП'],
'Центральный инженерно-технологический департамент':['Директор департамента','Главный технолог','Ведущий инженер-технолог','Инженер-технолог'],
'Производственно-технический департамент':['Директор департамента','Начальник отдела','Ведущий инженер','Инженер'],
'Отдел главного энергетика':['Главный энергетик','Ведущий инженер-энергетик','Инженер-энергетик'],
'Отдел главного механика':['Главный механик','Ведущий инженер-механик','Инженер-механик'],
'Транспортный департамент':['Директор департамента','Начальник транспортного отдела','Инженер по транспорту','Диспетчер'],
'Департамент капитального строительства':['Директор департамента','Начальник отдела капитального строительства','Инженер по строительству'],
'ПУ «Сарытаунефть»':['Начальник производственного управления','Главный инженер','Начальник ЦДНГ','Начальник ЦППД','Начальник ЦППН','Мастер добычи нефти и газа','Оператор добычи нефти и газа','Инженер по ПРС и КРС'],
'ПУ «Боздалаойл»':['Начальник производственного управления','Главный инженер','Начальник ЦДНГ','Начальник ЦППД','Начальник ЦППН','Мастер добычи нефти и газа','Оператор добычи нефти и газа','Инженер по ПРС и КРС']};
let hrDept='Руководство',hrQuery='',hrStatus='active',hrPerson=null;
function hrSalary(role){return /Генеральный директор/.test(role)?2.6:/Директор департамента|Начальник производственного управления/.test(role)?1.5:/Начальник|Руководитель|Главный инженер|Главный энергетик|Главный механик|Корпоративный секретарь/.test(role)?1.05:/Ведущий|Главный|аудитор/.test(role)?.68:.42}
// Каждый автоматически созданный сотрудник получает отдельную фамилию.
const HR_SURNAME_STEMS=['Алим','Аман','Аргын','Аскар','Байжан','Баймурат','Бакыт','Бекжан','Бекмурат','Берик','Болат','Данияр','Даулет','Ербол','Ержан','Ермек','Ернар','Есен','Жаксылык','Жанат','Жанболат','Жанибек','Жарас','Жума','Заман','Иман','Кайрат','Канат','Карим','Кенже','Куат','Куаныш','Мади','Максат','Марат','Мейрам','Мурат','Нариман','Нурбол','Нуржан','Нурлан','Олжас','Омар','Рахат','Руслан','Сабит','Сакен','Самат','Санжар','Серик','Султан','Талгат','Темир','Тимур','Тлеу','Турсын','Улан','Хамит','Шынгыс','Ырыс','Абзал','Адилет','Айбек','Айдос','Айтуар','Акжол','Алмас','Алпыс','Ануар','Арман','Асыл','Бауыржан','Бекзат','Досжан','Ерлан','Жандос','Жасулан','Кайсар','Миржан','Нурбек','Ораз','Рустем','Саян','Торегали','Шерхан','Еркебулан','Асылбек','Мырзабек','Нурислам','Бейбит','Тыныш','Мухтар','Жолдас','Еркин','Жумабек','Сагын','Нуртас','Асылхан','Тлек','Амангелди'];
function hrSurname(i,female){let n=Math.max(0,i-1),stem=HR_SURNAME_STEMS[n%HR_SURNAME_STEMS.length],round=Math.floor(n/HR_SURNAME_STEMS.length);let ending=round%2?'ев':'ов';let surname=stem+(round>=2?String(Math.floor(round/2)+1):'')+ending;return surname+(female?'а':'')}
function hrName(i){let female=i%4===0;return hrSurname(i,female)+' '+(female?HR_FEMALE[(i*11+5)%HR_FEMALE.length]:HR_MALE[(i*11+5)%HR_MALE.length])}
function hrNormalizeSurname(name){let last=String(name||'').trim().split(/\s+/)[0]||'';return last.replace(/(ова|ева)$/,'ов').toLocaleLowerCase('ru')}
function hrUniqueNames(h){if(h.uniqueSurnameV18)return;let used=new Set();for(let emp of h.employees){let parts=String(emp.name||'').trim().split(/\s+/),given=parts[1]||'',female=HR_FEMALE.includes(given),male=HR_MALE.includes(given),key=hrNormalizeSurname(emp.name);if(!key)continue;if(used.has(key)&& (female||male)){let i=1,candidate;do{candidate=hrSurname(1000+i++,female)}while(used.has(hrNormalizeSurname(candidate)));emp.name=candidate+' '+parts.slice(1).join(' ');key=hrNormalizeSurname(emp.name)}used.add(key)}h.uniqueSurnameV18=true}

function ensureHR(){let e=ensureEnterprise();if(!e.hr){let positions=[],employees=[],id=0;for(let name of ORG){let roles=HR_ROLES[name]||['Начальник подразделения','Ведущий специалист','Специалист'];for(let role of roles){id++;let occupied=id%7!==0;positions.push({id:'P'+id,dept:name,role,salary:hrSalary(role),employeeId:occupied?'E'+id:null});if(occupied)employees.push({id:'E'+id,name:hrName(id),positionId:'P'+id,experience:2+id%23,performance:60+(id*17)%39,training:65+(id*13)%36,status:'Работает'})}}e.hr={positions,employees,history:[],seq:id,initial:employees.length,baseStaff:e.staff,selected:'Руководство'}}e.hr.history ||= [];e.hr.positions ||= [];e.hr.employees ||= [];hrUniqueNames(e.hr);return e.hr}
function hrActive(){return ensureHR().employees.filter(x=>x.status==='Работает')}
function hrSync(){let e=ensureEnterprise(),h=ensureHR();e.staff=Math.max(0,h.baseStaff+hrActive().length-h.initial)}
async function hrAction(op,id){let h=ensureHR(),p=h.positions.find(x=>x.id===id),emp=p&&h.employees.find(x=>x.id===p.employeeId);if(op==='open'){hrPerson=id;render();return}if(op==='close'){hrPerson=null;render();return}if(op==='hire'){if(!p||p.employeeId)return uiAlert('Должность занята');let name=await uiPrompt('ФИО нового вымышленного сотрудника:',hrName(++h.seq));if(!name||!name.trim())return;if(h.employees.some(x=>hrNormalizeSurname(x.name)===hrNormalizeSurname(name)))return uiAlert('Эта фамилия уже есть в кадровом реестре. Укажите другую фамилию для нового персонажа.');let fee=Math.max(.5,p.salary*.7);if(s.cash<fee)return uiAlert('Недостаточно средств на подбор');s.cash-=fee;let eid='E'+(++h.seq);p.employeeId=eid;h.employees.push({id:eid,name:name.trim().slice(0,90),positionId:p.id,experience:1,performance:70,training:70,status:'Работает'});hrRecord('Приём: '+name.trim()+' — '+p.role+' / '+p.dept);hrSync()}
if(op==='fire'){if(!emp||!await uiConfirm('Уволить '+emp.name+' с должности «'+p.role+'»?'))return;emp.status='Уволен';emp.positionId=null;p.employeeId=null;hrRecord('Увольнение: '+emp.name+' / '+p.dept);hrSync();hrPerson=null}
if(op==='transfer'||op==='promote'){if(!emp)return;let options=h.positions.filter(x=>!x.employeeId&&x.id!==p.id);if(op==='promote')options=options.filter(x=>x.salary>p.salary);if(!options.length)return uiAlert('Нет подходящих вакансий');let msg=options.map((x,i)=>(i+1)+'. '+x.dept+' — '+x.role+' ('+f(x.salary)+' млн ₸/мес.)').join('\n');let choice=await uiPrompt('Выбери номер вакантной должности для '+emp.name+':\n'+msg);if(choice===null)return;let n=Number(choice);if(!Number.isInteger(n)||n<1||n>options.length)return uiAlert('Неверный номер');let dest=options[n-1];if(!await uiConfirm('Перевести '+emp.name+' на должность «'+dest.role+'»?'))return;p.employeeId=null;dest.employeeId=emp.id;emp.positionId=dest.id;hrRecord((op==='promote'?'Повышение':'Перевод')+': '+emp.name+' → '+dest.role+' / '+dest.dept);hrDept=dest.dept;hrPerson=dest.id}
if(op==='train'){if(!emp)return;let cost=1.2;if(s.cash<cost)return uiAlert('Недостаточно средств');s.cash-=cost;emp.training=cl(emp.training+18,0,100);emp.performance=cl(emp.performance+4,0,100);hrRecord('Обучение: '+emp.name+' — '+p.dept)}
if(op==='raise'){if(!p||!emp)return;let value=Number(await uiPrompt('Новый оклад, млн ₸ в месяц:',p.salary));if(!Number.isFinite(value)||value<.1||value>20)return uiAlert('Недопустимый оклад');p.salary=Math.round(value*100)/100;hrRecord('Изменение оклада: '+emp.name+' — '+m(p.salary))}
save();render()}
function hrRecord(t){let h=ensureHR();h.history.unshift({month:s.month,text:t});h.history=h.history.slice(0,100);log('HR: '+t)}
function hrMonth(){let h=ensureHR();for(let x of hrActive()){x.training=cl(x.training-.6,0,100);x.performance=cl(x.performance+(x.training>=70?.25:-.45),20,100)}hrSync()}
function hrView(){let h=ensureHR(),positions=h.positions,active=hrActive(),vacancies=positions.filter(p=>!p.employeeId),totalPay=positions.filter(p=>p.employeeId).reduce((a,p)=>a+p.salary,0),avg=active.length?Math.round(active.reduce((a,e)=>a+e.performance,0)/active.length):0;
let kpis='<div class="hr-kpis">'+[['Работников в реестре',active.length+' чел.'],['Штатных единиц',positions.length],['Вакансий',vacancies.length],['ФОТ реестра / мес.',m(totalPay)]].map(([a,b])=>'<div class="hr-kpi"><small>'+a+'</small><b>'+b+'</b></div>').join('')+'</div>';
let barData=ORG.map(name=>({name,ps:positions.filter(p=>p.dept===name)}));let dept=h.selected&&ORG.includes(h.selected)?h.selected:hrDept;hrDept=dept;let current=positions.filter(p=>p.dept===dept),filled=current.filter(p=>p.employeeId).length;
let search=hrQuery.trim().toLocaleLowerCase('ru');let displayed=current.filter(p=>{let e=h.employees.find(x=>x.id===p.employeeId);return (!search||[p.role,e?.name||'',p.id].some(x=>x.toLocaleLowerCase('ru').includes(search)))&&(hrStatus==='all'||(hrStatus==='vacant'?!p.employeeId:!!p.employeeId))});
let nav='<div class="hr-list">'+barData.map(d=>{let filled=d.ps.filter(p=>p.employeeId).length;return '<button class="hr-dept '+(d.name===dept?'selected':'')+'" data-hrdept="'+esc(d.name)+'"><b>'+esc(d.name)+'</b><small>'+filled+' / '+d.ps.length+' занято · '+(d.ps.length-filled)+' вакансий</small><div class="hr-progress"><i style="width:'+Math.round(100*filled/Math.max(1,d.ps.length))+'%"></i></div></button>'}).join('')+'</div>';
let profile='';if(hrPerson){let p=positions.find(x=>x.id===hrPerson);if(p){let e=h.employees.find(x=>x.id===p.employeeId);profile='<div class="hr-profile"><div class="hr-top"><h3>Карточка должности · '+esc(p.id)+'</h3><button class="mini-btn" data-hrop="close" data-hrid="'+p.id+'">Закрыть ✕</button></div>'+row('Подразделение',esc(p.dept))+row('Должность',esc(p.role))+row('Оклад / месяц',m(p.salary))+(e?row('Сотрудник',esc(e.name))+row('Стаж',e.experience+' лет')+row('Результативность',Math.round(e.performance)+'%')+row('Обученность',Math.round(e.training)+'%'):'<div class="notice">Вакансия свободна</div>')+'<div class="hr-actions">'+(e?'<button class="btn compact" data-hrop="transfer" data-hrid="'+p.id+'">Перевести</button><button class="btn compact" data-hrop="promote" data-hrid="'+p.id+'">Повысить</button><button class="btn secondary compact" data-hrop="train" data-hrid="'+p.id+'">Обучить</button><button class="btn secondary compact" data-hrop="raise" data-hrid="'+p.id+'">Изменить оклад</button><button class="btn secondary compact" data-hrop="fire" data-hrid="'+p.id+'">Уволить</button>':'<button class="btn compact" data-hrop="hire" data-hrid="'+p.id+'">Назначить сотрудника</button>')+'</div></div>'}};
let table='<div class="table-scroll"><table class="hr-table"><thead><tr><th>Должность</th><th>Сотрудник</th><th>Оклад</th><th>KPI</th><th>Статус</th><th></th></tr></thead><tbody>'+displayed.map(p=>{let e=h.employees.find(x=>x.id===p.employeeId);return '<tr><td><button class="hr-link" data-hrop="open" data-hrid="'+p.id+'">'+esc(p.role)+'</button><div class="fine">'+p.id+'</div></td><td>'+esc(e?.name||'—')+'</td><td>'+m(p.salary)+'</td><td>'+(e?Math.round(e.performance)+'%':'—')+'</td><td><span class="hr-chip '+(e?'':'vacant')+'">'+(e?'Занято':'Вакансия')+'</span></td><td><button class="mini-btn" data-hrop="open" data-hrid="'+p.id+'">Открыть</button></td></tr>'}).join('')+'</tbody></table></div>';
return '<div class="hr-top"><div><h2>Персонал · кадровая ERP</h2><p class="muted">Штатное расписание, подразделения СП/ПСП, назначения, переводы, увольнения и аналитика</p></div><span class="tag ok">HR ANALYTICS</span></div>'+kpis+'<div class="hr-layout"><aside><h3>Структура подразделений · '+ORG.length+'</h3>'+nav+'</aside><div class="hr-panel"><div class="hr-top"><div><h3>'+esc(dept)+'</h3><p class="fine">Занято '+filled+' из '+current.length+' · Укомплектованность '+Math.round(100*filled/Math.max(1,current.length))+'%</p></div><span class="tag">Средний KPI '+avg+'%</span></div><div class="hr-toolbar"><input id="hr-search" placeholder="Поиск должности или сотрудника" value="'+esc(hrQuery)+'"><select id="hr-filter"><option value="all" '+(hrStatus==='all'?'selected':'')+'>Все должности</option><option value="active" '+(hrStatus==='active'?'selected':'')+'>Занятые</option><option value="vacant" '+(hrStatus==='vacant'?'selected':'')+'>Вакансии</option></select></div>'+profile+table+'</div></div><h3>Кадровые решения</h3><div class="table-scroll"><table><thead><tr><th>Месяц</th><th>Действие</th></tr></thead><tbody>'+h.history.slice(0,12).map(x=>'<tr><td>'+x.month+'</td><td>'+esc(x.text)+'</td></tr>').join('')+'</tbody></table></div><p class="hr-note">Реестр — игровая модель на основе названий подразделений. Все сотрудники вымышлены. Оклады, штат, KPI и численность условные. Общее число работников компании включает также агрегированный производственный персонал, не представленный индивидуальными карточками.</p>'}
function hrBind(){document.querySelectorAll('[data-hrdept]').forEach(b=>b.onclick=()=>{hrDept=b.dataset.hrdept;ensureHR().selected=hrDept;hrPerson=null;hrQuery='';render()});document.querySelectorAll('[data-hrop]').forEach(b=>b.onclick=()=>hrAction(b.dataset.hrop,b.dataset.hrid));let q=$('hr-search');if(q)q.oninput=()=>{hrQuery=q.value;let start=q.selectionStart;render();let el=$('hr-search');if(el){el.focus();el.setSelectionRange(start,start)}};let fil=$('hr-filter');if(fil)fil.onchange=()=>{hrStatus=fil.value;render()}}


// Oil Management v0.5: simulated stock, asset lifecycle and renewal; baseline aggregates are reference only.
const PLANT_TYPES=[
 ['Сосуды под давлением',549,387,387,12],['Грузоподъёмные краны',17,14,14,18],
 ['Печи подогрева',247,231,231,14],['Компрессоры',10,3,3,25],
 ['Станки-качалки',1987,1322,1322,9],['Насосы',316,155,155,6],
 ['РВС',43,15,15,90],['АГЗУ',215,92,92,22],['Блоки реагента',17,14,14,11],
 ['Дренажные ёмкости',151,null,null,5],['Групповые установки',74,null,null,60],['Замерные установки',27,null,null,25]
];
const STOCK_TYPES=[['Спецодежда (комплект)',360,120,0.08],['Каски защитные',260,80,0.015],['Защитные очки',420,140,0.008],['Перчатки (пары)',1200,400,0.002],['Фильтрующие СИЗОД',210,70,0.025],['Запасные насосы',12,5,5],['Подшипники СК',95,30,0.14],['Уплотнения насосов',170,55,0.06],['Клапаны',85,25,0.24],['Датчики давления',65,20,0.18],['Ремкомплекты ёмкостей',26,10,1.2]];
function ensurePlant(){if(!s.plant){s.plant={types:PLANT_TYPES.map((x,i)=>({id:i,name:x[0],qty:x[1],expired:x[2],extended:x[3],price:x[4],condition:75+(i*7)%20,maintenance:0,renewed:0})),stock:STOCK_TYPES.map((x,i)=>({id:i,name:x[0],qty:x[1],minimum:x[2],price:x[3],consumed:0})),history:[],investment:0,warehouseSpend:0,selected:0,warning:'Сводные количества взяты из документов ПУ «Сарытаунефть» на октябрь 2026 года. В игровой карьере они используются как справочная стартовая модель и не являются текущими данными предприятия.'};save()}return s.plant}
function plantRecord(message){let p=ensurePlant();p.history.unshift({month:s.month,text:message});p.history=p.history.slice(0,80);log('МТО: '+message)}
function assetMonth(){let p=ensurePlant();for(let item of p.types){item.condition=cl(item.condition-(.15+(item.expired||0)/Math.max(1,item.qty)*.5),0,100);item.maintenance=Math.max(0,item.maintenance-1)}for(let x of p.stock){let use=/Спецодежда|Каски|очки|Перчатки|СИЗОД/.test(x.name)?Math.ceil(x.minimum*.055):Math.ceil(x.minimum*.035);x.qty=Math.max(0,x.qty-use);x.consumed+=use}let shortages=p.stock.filter(x=>x.qty<x.minimum);if(shortages.length){s.condition=cl(s.condition-shortages.length*.18,0,100);s.safety=cl(s.safety-shortages.filter(x=>/Спецодежда|Каски|очки|Перчатки|СИЗОД/.test(x.name)).length*.35,0,100);plantRecord('Дефицит на складе: '+shortages.map(x=>x.name).slice(0,3).join(', '))}let critical=p.types.filter(x=>x.condition<50).length;if(critical)s.condition=cl(s.condition-critical*.2,0,100)}
async function plantAction(action,id){let p=ensurePlant(),a=p.types.find(x=>x.id===id),x=p.stock.find(x=>x.id===id);if(action==='buy'){let n=Number(await uiPrompt('Количество к закупке:',x.minimum));if(!Number.isInteger(n)||n<=0||n>100000)return;let cost=n*x.price;if(s.cash<cost)return uiAlert('Недостаточно средств. Требуется '+m(cost));s.cash-=cost;p.warehouseSpend+=cost;x.qty+=n;plantRecord('Закуплено: '+x.name+' — '+n+' ед. за '+m(cost))}
if(action==='service'){let cost=Math.max(5,a.qty*.015);if(s.cash<cost)return uiAlert('Недостаточно средств');s.cash-=cost;p.investment+=cost;a.condition=cl(a.condition+13,0,100);a.maintenance=6;plantRecord('Проведено ТО: '+a.name+', затраты '+m(cost))}
if(action==='replace'){let n=Number(await uiPrompt('Количество единиц для замены (не более '+a.qty+'):',Math.min(1,a.qty)));if(!Number.isInteger(n)||n<1||n>a.qty)return;let cost=n*a.price;if(s.cash<cost)return uiAlert('Недостаточно средств. Требуется '+m(cost));s.cash-=cost;p.investment+=cost;a.renewed+=n;a.expired=a.expired===null?null:Math.max(0,a.expired-n);a.extended=a.extended===null?null:Math.min(a.extended,a.expired);a.condition=cl(a.condition+n/a.qty*100,0,100);plantRecord('Техперевооружение: заменено '+n+' ед. '+a.name+' за '+m(cost))}
save();render()}
function warehouseView(){let p=ensurePlant(),low=p.stock.filter(x=>x.qty<x.minimum),value=p.stock.reduce((a,x)=>a+x.qty*x.price,0);return '<div class="dispatch-head"><div><h2>Склад · материально-техническое обеспечение</h2><p class="muted">Спецодежда, СИЗ, запасные части, насосы и ремонтные материалы</p></div><span class="tag '+(low.length?'alert':'ok')+'">'+low.length+' позиций ниже минимума</span></div><div class="dispatch-kpis">'+[['Номенклатура',p.stock.length],['Стоимость запасов',m(value)],['Ниже минимума',low.length],['Закупки за карьеру',m(p.warehouseSpend)]].map(x=>'<div><small>'+x[0]+'</small><strong>'+x[1]+'</strong></div>').join('')+'</div><div class="table-scroll"><table><thead><tr><th>Номенклатура</th><th>Остаток</th><th>Мин. запас</th><th>Обеспеченность</th><th>Действие</th></tr></thead><tbody>'+p.stock.map(x=>'<tr><td>'+esc(x.name)+'</td><td>'+f(x.qty)+'</td><td>'+f(x.minimum)+'</td><td><span class="tag '+(x.qty<x.minimum?'alert':'ok')+'">'+Math.round(x.qty/x.minimum*100)+'%</span></td><td><button class="mini-btn" data-plant="buy" data-id="'+x.id+'">Закупить</button></td></tr>').join('')+'</tbody></table></div><p class="fine">Потребление запасов происходит при переходе к следующему месяцу. Цены и нормы расхода условные игровые.</p>'+plantHistory(p)}
function v13PumpStats(){ensureTree();let a=s.assets.wellList,installed=a.filter(w=>w.equipment?.type==='Станок-качалка');return {total:a.length,installed:installed.length,other:a.length-installed.length,unlinked:0}}
function v13EquipmentSummary(){let x=v13PumpStats();return '<div class="notice"><b>Сверка фонда и установленного оборудования</b>'+row('Скважины по всем ГУ',f(x.total))+row('Установлено станков-качалок',f(x.installed))+row('Скважины с иным способом эксплуатации',f(x.other))+'<p class="muted">Ниже — отдельный исторический справочный перечень оборудования. Его агрегированные числа не являются текущим количеством установленных станков-качалок в этой карьере. Для изменения установленного оборудования откройте паспорт конкретной скважины.</p><button class="mini-btn" data-v11-tab="assetsTree">Перейти к ГУ и скважинам →</button></div>'}
function equipmentView(){let p=ensurePlant(),count=p.types.reduce((a,x)=>a+x.qty,0),expired=p.types.reduce((a,x)=>a+(x.expired||0),0),renewed=p.types.reduce((a,x)=>a+x.renewed,0);return v13EquipmentSummary()+'<div class="dispatch-head"><div><h2>Справочный перечень оборудования и техническое перевооружение</h2><p class="muted">Ресурс, продление эксплуатации, техническое состояние, ТО и замена</p></div><span class="tag">Паспортизация · игровая модель</span></div><div class="dispatch-kpis">'+[['В справочнике, единиц',f(count)],['Отработало срок*',f(expired)],['Заменено в игре',f(renewed)],['CAPEX / ТО',m(p.investment)]].map(x=>'<div><small>'+x[0]+'</small><strong>'+x[1]+'</strong></div>').join('')+'</div><div class="notice">'+esc(p.warning)+'</div><div class="table-scroll"><table><thead><tr><th>Оборудование</th><th>Всего</th><th>Отработало срок*</th><th>Продлено*</th><th>Состояние (игра)</th><th>Мероприятия</th></tr></thead><tbody>'+p.types.map(x=>'<tr><td>'+esc(x.name)+'</td><td>'+f(x.qty)+'</td><td>'+(x.expired===null?'н/д':f(x.expired))+'</td><td>'+(x.extended===null?'н/д':f(x.extended))+'</td><td><span class="tag '+(x.condition<60?'alert':'ok')+'">'+Math.round(x.condition)+'%</span></td><td><button class="mini-btn" data-plant="service" data-id="'+x.id+'">ТО</button> <button class="mini-btn" data-plant="replace" data-id="'+x.id+'">Заменить</button></td></tr>').join('')+'</tbody></table></div><p class="fine">* По перечню на 13.10.2026. Для дренажных ёмкостей, ГУ и замерных установок нормативный срок и продление не указаны. Состояние и цены — игровые допущения; продление не означает неисправность.</p>'+plantHistory(p)}
function plantHistory(p){return '<h3>Журнал МТО и перевооружения</h3>'+(p.history.length?p.history.slice(0,8).map(x=>'<div class="row"><span>'+esc(x.text)+'</span><small class="muted">Мес. '+x.month+'</small></div>').join(''):'<p class="muted">Операций пока нет.</p>')}
function assetBind(){document.querySelectorAll('[data-plant]').forEach(b=>b.onclick=()=>plantAction(b.dataset.plant,Number(b.dataset.id)))}


const SHOP_NAMES=['ЦДНГ-1','ЦДНГ-2','ЦДНГ-3','ЦДНГ-4','ЦППД','ЦКППН','ЦПТЖ','ЦДПиТГ','ПРЦЭО','ЦТВСиК'];
const SHOP_KIND=['oil','oil','oil','oil','water','processing','fluid','gas','service','utilities'];
const EVENT_TEMPLATES=[
{key:'sensor',level:'Мелкое',title:'Отказ датчика давления',description:'На производственном объекте выявлен отказ контрольно-измерительного прибора.',loss:1.6,days:1,options:[['Срочная замена','repair',2.2],['Плановый ремонт','wait',.5],['Проверка подрядчика','audit',1.2]]},
{key:'ppe',level:'Мелкое',title:'Недостаток СИЗ на участке',description:'Склад не обеспечил участок средствами индивидуальной защиты в установленный срок.',loss:1.2,days:0,options:[['Экстренная закупка','repair',1.8],['Перераспределить остатки','transfer',.4],['Служебная проверка','audit',.8]]},
{key:'pump',level:'Среднее',title:'Остановка насосного оборудования',description:'Неисправность насосного оборудования вызвала простой и потери добычи.',loss:9,days:3,options:[['Срочный ремонт','repair',5.5],['Ремонт своими силами','wait',1.8],['Замена оборудования','replace',14]]},
{key:'prs',level:'Среднее',title:'Просрочка подрядчика ПРС',description:'Подрядчик нарушил согласованный график ремонта скважины.',loss:7,days:4,options:[['Применить неустойку','penalty',1],['Привлечь другую бригаду','repair',7],['Проверить причины','audit',1.4]]},
{key:'environment',level:'Крупное',title:'Разлив технологической жидкости',description:'Требуется локализация, оценка последствий и расследование причин.',loss:30,days:6,options:[['Аварийная ликвидация','repair',17],['Привлечь специализированного подрядчика','replace',23],['Расследование и локализация','audit',12]]},
{key:'safety',level:'Крупное',title:'Нарушение промышленной безопасности',description:'При проверке выявлены нарушения, требующие остановки опасных работ до устранения.',loss:18,days:5,options:[['Устранить нарушения','repair',9],['Независимая экспертиза','audit',6],['Модернизировать оборудование','replace',28]]},
{key:'outage',level:'Критическое',title:'Крупное отключение электроснабжения',description:'Отключение нескольких производственных объектов повлияло на план добычи.',loss:68,days:8,options:[['Аварийное восстановление','repair',30],['Резервное энергоснабжение','replace',52],['Расследование и восстановление','audit',21]]},
{key:'market',level:'Критическое',title:'Резкое падение цены нефти',description:'Снижение рыночной цены требует пересмотра инвестиционной программы.',loss:40,days:0,options:[['Оптимизировать OPEX','transfer',4],['Сократить CAPEX','wait',1],['Антикризисный штаб','audit',6]]}
];
function ensureOperations(){if(!s.operations)s.operations={shops:SHOP_NAMES.map((name,i)=>({id:i,name,kind:SHOP_KIND[i],plan:i<4?Math.round((s.enterprise?.target||7500)/4):0,efficiency:78+i*2,discipline:84,chief:'Вакансия · начальник цеха',history:[],warnings:0,invested:0,review:0})),cases:[],closed:[],sequence:0,logs:[],selected:0,losses:0,prevented:0,issued:0};let o=s.operations; o.shops ||= [];o.cases ||= [];o.closed ||= [];o.logs ||= [];o.sequence ||= 0;o.selected ??=0;o.losses ||=0;o.prevented ||=0;o.issued ||=0;return o}
function shopName(id){return ensureOperations().shops.find(x=>x.id===Number(id))?.name||'Подразделение'}
function openCase(template,shop,forced=false){let o=ensureOperations(),id=++o.sequence;let c={id,shop:shop.id,key:template.key,level:template.level,title:template.title,description:template.description,loss:template.loss,days:template.days,options:template.options,month:s.month,status:'Ожидает решения',forced};o.cases.unshift(c);o.cases=o.cases.slice(0,24);o.logs.unshift('Мес. '+s.month+': '+shop.name+' — '+c.title);log('Событие '+shop.name+': '+c.title);return c}
function opsMonth(){let o=ensureOperations(),e=ensureEnterprise(),a=s.assets?.wellList||[];let active=a.filter(x=>x.status==='Работает');let total=active.reduce((sum,w)=>sum+w.rate*(1-w.water/100)*30,0);let alloc=total>0?active.map(w=>({unit:w.unit,qty:w.rate*(1-w.water/100)*30})):[];let production=s.volume;let shopWeights=o.shops.slice(0,4).map((_,i)=>alloc.filter(w=>{let n=parseInt((w.unit||'').split('-')[1],10)||1;return (n-1)%4===i}).reduce((v,w)=>v+w.qty,0));let sum=shopWeights.reduce((a,b)=>a+b,0);if(!sum)shopWeights=[.25,.25,.25,.25],sum=1;
for(let sh of o.shops){let actual=sh.kind==='oil'?production*shopWeights[sh.id]/sum:0;let plan=sh.kind==='oil'?sh.plan:0;let pct=plan?actual/plan*100:0;let short=plan-actual;let kpi=sh.kind==='oil'?cl(pct*.60+s.condition*.18+s.safety*.12+sh.discipline*.10,0,110):cl(sh.efficiency*.5+s.condition*.25+s.safety*.25,0,100);sh.efficiency=cl(sh.efficiency+(kpi-85)*.05,30,100);sh.history.unshift({month:s.month,plan,actual:Math.round(actual),pct:Math.round(pct*10)/10,kpi:Math.round(kpi),delta:Math.round(-short)});sh.history=sh.history.slice(0,36);if(sh.kind==='oil'&&pct<90){sh.warnings++;if(sh.warnings%3===0)openCase({key:'plan',level:'Среднее',title:'Систематическое невыполнение плана',description:'Три периода с существенным отклонением. Требуется анализ причин, включая ресурсы и подрядчиков.',loss:8,days:0,options:[['Корректирующий план','repair',2],['Служебная проверка','audit',2],['Техническая программа','replace',15]]},sh,true)}}
let avg=s.condition*.32+s.safety*.28+e.industrial*.20+e.environment*.20;let p=cl(.04+(100-avg)*.003, .03,.32);if(Math.random()<p&&o.cases.filter(c=>c.status==='Ожидает решения').length<4){let t=Math.random(),pool=EVENT_TEMPLATES.filter(x=>t<.72?['Мелкое','Среднее'].includes(x.level):t<.94?x.level==='Крупное':x.level==='Критическое');let template=pool[Math.floor(Math.random()*pool.length)];let sh=o.shops[Math.floor(Math.random()*o.shops.length)];openCase(template,sh)}
for(let c of o.cases.filter(c=>c.status==='Ожидает решения')){if(s.month>c.month){let loss=c.loss*.35;s.cash-=loss;s.profit-=loss;o.losses+=loss;c.loss+=loss;c.days+=1;if(c.days>10)s.safety=cl(s.safety-.6,0,100)}}
}
function opsDecision(id,option){let o=ensureOperations(),c=o.cases.find(x=>x.id===id);if(!c||c.status!=='Ожидает решения')return;let op=c.options[option];if(!op)return;let [label,kind,cost]=op;if(s.cash<cost)return uiAlert('Недостаточно денежных средств');s.cash-=cost;s.expense+=cost;s.profit-=cost;let residual=kind==='repair'?c.loss*.18:kind==='replace'?c.loss*.10:kind==='penalty'?c.loss*.55:kind==='transfer'?c.loss*.38:kind==='audit'?c.loss*.42:c.loss*.70;let recovery=c.loss-residual;s.cash-=residual;s.profit-=residual;o.losses+=residual;o.prevented+=recovery;let sh=o.shops[c.shop];if(kind==='replace'){s.condition=cl(s.condition+4,0,100);sh.invested+=cost}else if(kind==='repair'){s.condition=cl(s.condition+1.8,0,100)}else if(kind==='audit'){sh.discipline=cl(sh.discipline+3,0,100)}else if(kind==='penalty'){let compensated=Math.min(3,c.loss*.2);s.cash+=compensated;o.prevented+=compensated}if(c.key==='ppe'||c.key==='safety')s.safety=cl(s.safety+(kind==='repair'||kind==='replace'?2:.5),0,100);c.status='Решено';c.decision=label;c.residual=Math.round(residual*10)/10;c.cost=cost;c.closedMonth=s.month;o.closed.unshift(c);o.closed=o.closed.slice(0,80);o.cases=o.cases.filter(x=>x.id!==id);o.logs.unshift('Мес. '+s.month+': '+sh.name+' — '+label+' по событию «'+c.title+'»; потери '+m(residual));log('Решение по '+sh.name+': '+label+' · '+m(cost));save();render()}
async function shopAction(id,kind){let o=ensureOperations(),sh=o.shops.find(x=>x.id===id);if(!sh)return;let cost=0,message='';if(kind==='plan'){let n=Number(await uiPrompt('План добычи '+sh.name+', тонн/месяц:',sh.plan));if(!Number.isFinite(n)||n<0||n>1e7)return;sh.plan=Math.round(n);message='Изменён план '+sh.name+': '+f(sh.plan)+' т'}else if(kind==='improve'){cost=12;sh.efficiency=cl(sh.efficiency+7,0,100);sh.invested+=cost;message='Программа повышения эффективности '+sh.name}else if(kind==='audit'){cost=2.5;sh.discipline=cl(sh.discipline+5,0,100);sh.review++;message='Проверка работы '+sh.name+'; материалы направлены на рассмотрение'}else if(kind==='chief'){let name=await uiPrompt('Назначить вымышленного начальника '+sh.name+':',sh.chief.startsWith('Вакансия')?'':sh.chief);if(!name||!name.trim())return;sh.chief=name.trim().slice(0,80);sh.discipline=cl(sh.discipline+2,0,100);message='Назначен руководитель '+sh.name+': '+sh.chief}else if(kind==='remove'){if(!await uiConfirm('Начать процедуру освобождения руководителя от должности? В игре потребуется обоснование.'))return;sh.chief='Вакансия · начальник цеха';sh.efficiency=cl(sh.efficiency-5,0,100);message='После рассмотрения принято кадровое решение по '+sh.name+'; должность вакантна'}else return;if(s.cash<cost)return uiAlert('Недостаточно средств');s.cash-=cost;s.expense+=cost;s.profit-=cost;o.logs.unshift('Мес. '+s.month+': '+message);log(message);save();render()}
function opsView(){let o=ensureOperations(),sh=o.shops[o.selected]||o.shops[0],r=sh.history[0],total=o.shops.filter(x=>x.kind==='oil').reduce((sum,x)=>sum+(x.history[0]?.actual||0),0);let pct=r?.pct??0;let cards='<div class="dispatch-kpis">'+[['Производственные подразделения',o.shops.length],['Факт добычи по цехам',f(total)+' т'],['Открытые события',o.cases.length],['Убытки от событий',m(o.losses)]].map(x=>'<div><small>'+x[0]+'</small><strong>'+x[1]+'</strong></div>').join('')+'</div>';let tiles=o.shops.map(x=>{let z=x.history[0],p=z?.pct||0;return '<div class="work-tile"><h3>'+esc(x.name)+'</h3><div class="tiny">'+(x.kind==='oil'?'Добыча нефти':'Обеспечивающий цех')+'</div><div class="big">'+(x.kind==='oil'?(z?f(p)+'%':'—'):(z?f(z.kpi)+' KPI':'—'))+'</div><div class="meter"><i style="width:'+cl(x.kind==='oil'?p:z?.kpi||0,0,100)+'%"></i></div><div class="tiny">'+(x.kind==='oil'?'План '+f(x.plan)+' т · факт '+f(z?.actual||0)+' т · Δ '+f(z?.delta||0)+' т':'Индекс эффективности · условная модель')+'</div><div class="buttons"><button class="mini-btn" data-shop-select="'+x.id+'">Открыть цех →</button></div></div>'}).join('');let details='<h2>Карточка '+esc(sh.name)+'</h2><p class="muted">Начальник: '+esc(sh.chief)+'</p><div class="three"><div class="mini-card">План / мес.<strong>'+f(sh.plan)+' т</strong></div><div class="mini-card">Факт / мес.<strong>'+f(r?.actual||0)+' т</strong></div><div class="mini-card">KPI цеха<strong>'+f(r?.kpi||0)+'</strong></div></div><div class="actions"><button class="btn secondary compact" data-shop-action="plan" data-shop-id="'+sh.id+'">Установить план</button><button class="btn secondary compact" data-shop-action="improve" data-shop-id="'+sh.id+'">Повысить эффективность · 12 млн ₸</button><button class="btn secondary compact" data-shop-action="audit" data-shop-id="'+sh.id+'">Служебная проверка</button><button class="btn secondary compact" data-shop-action="chief" data-shop-id="'+sh.id+'">Назначить начальника</button><button class="btn secondary compact" data-shop-action="remove" data-shop-id="'+sh.id+'">Освободить от должности</button></div><h3>История плана, факта и KPI</h3><div class="table-scroll"><table class="small-table"><thead><tr><th>Месяц</th><th>План, т</th><th>Факт, т</th><th>Отклонение, т</th><th>Выполнение</th><th>KPI</th></tr></thead><tbody>'+sh.history.slice(0,12).map(x=>'<tr><td>'+x.month+'</td><td>'+f(x.plan)+'</td><td>'+f(x.actual)+'</td><td>'+f(x.delta)+'</td><td>'+f(x.pct)+'%</td><td>'+x.kpi+'</td></tr>').join('')+'</tbody></table></div><p class="fine">Добыча распределяется по скважинам игрового фонда. Обеспечивающие цеха оцениваются по условному индексу. Служебная проверка не означает автоматического взыскания.</p>';return '<h2>Производственные цеха · эффективность</h2><p class="muted">План/факт, отклонения, KPI, начальники цехов, программы улучшений и кадровые решения.</p>'+cards+'<div class="work-grid">'+tiles+'</div><div class="card">'+details+'</div>'}
function decisionsView(){let o=ensureOperations();let active=o.cases.map(c=>'<div class="decision-card"><div><span class="pill '+(c.level==='Критическое'?'critical':c.level==='Крупное'?'medium':'')+'">'+c.level+'</span> <span class="fine">'+shopName(c.shop)+' · месяц '+c.month+'</span></div><h3>'+esc(c.title)+'</h3><p>'+esc(c.description)+'</p><div class="three"><div class="mini-card">Ущерб без мер<strong>'+m(c.loss)+'</strong></div><div class="mini-card">Простой<strong>'+c.days+' сут.</strong></div><div class="mini-card">Статус<strong>Требует решения</strong></div></div><h4>Управленческое решение</h4><div class="options">'+c.options.map((x,i)=>'<button data-case="'+c.id+'" data-option="'+i+'" '+(s.cash<x[2]?'disabled':'')+'>'+esc(x[0])+' · '+m(x[2])+'</button>').join('')+'</div></div>').join('');return '<h2>Центр событий и решений</h2><p class="muted">События появляются при переходе месяца; риск зависит от состояния оборудования, БиОТ, экологии и промышленной безопасности. Убытки и решения изменяют бюджет.</p><div class="dispatch-kpis">'+[['Ожидают решения',o.cases.length],['Завершено',o.closed.length],['Финансовые потери',m(o.losses)],['Предотвращённые потери',m(o.prevented)]].map(x=>'<div><small>'+x[0]+'</small><strong>'+x[1]+'</strong></div>').join('')+'</div>'+(active||'<div class="notice good">Новых событий нет. Перейди к следующему месяцу.</div>')+'<h3>История решений</h3>'+o.closed.slice(0,18).map(x=>'<div class="row"><span>'+esc(shopName(x.shop))+' · '+esc(x.title)+'<br><small class="muted">'+esc(x.decision)+' · месяц '+x.closedMonth+'</small></span><strong>'+m(x.residual)+'</strong></div>').join('')+'<h3>Управленческий журнал</h3>'+o.logs.slice(0,12).map(x=>'<div class="row">'+esc(x)+'</div>').join('')}
function opsBind(){document.querySelectorAll('[data-shop-select]').forEach(b=>b.onclick=()=>{ensureOperations().selected=Number(b.dataset.shopSelect);save();render()});document.querySelectorAll('[data-shop-action]').forEach(b=>b.onclick=()=>shopAction(Number(b.dataset.shopId),b.dataset.shopAction));document.querySelectorAll('[data-case]').forEach(b=>b.onclick=()=>opsDecision(Number(b.dataset.case),Number(b.dataset.option)))}


const TREE_SHOPS=['ЦДНГ-1','ЦДНГ-2','ЦДНГ-3','ЦДНГ-4'];
let treeShop=0,treeUnit='ГУ-1',treeWell=null,treeFilter='all';
function normalizeFiction(){if(!s)return;let names={'ПУ «Каламкасмунайгаз»':'ПУ «Сарытаунефть»','ПУ «Жетыбаймунайгаз»':'ПУ «Боздалаойл»'};let e=s.enterprise;if(e){(e.dept||[]).forEach(d=>{d.name=names[d.name]||d.name});if(e.hr){(e.hr.positions||[]).forEach(p=>{p.dept=names[p.dept]||p.dept});(e.hr.employees||[]).forEach(x=>{let parts=(x.name||'').trim().split(/\s+/);let given=parts[1];if(given&&HR_FEMALE.includes(given)&&parts[0]&&!parts[0].endsWith('а'))x.name=parts[0]+'а '+given;else if(given&&HR_MALE.includes(given)&&parts[0].endsWith('ова'))x.name=parts[0].slice(0,-1)+' '+given;else if(given&&HR_MALE.includes(given)&&parts[0].endsWith('ева'))x.name=parts[0].slice(0,-1)+' '+given})}}}
function ensureTree(){ensureAssets();if(!s.tree)s.tree={history:[],workorders:[],seq:0};let t=s.tree;if(!t.v13Grouped){for(let w of s.assets.wellList){w.shop=Math.floor((w.id-1001)/16)%4;w.unit='ГУ-'+(Math.floor((w.id-1001)/16)+1)}t.v13Grouped=true;}for(let w of s.assets.wellList){if(w.shop===undefined)w.shop=Math.floor((w.id-1001)/16)%4;w.unit ||= 'ГУ-'+(Math.floor((w.id-1001)/16)+1);if(!w.equipment)w.equipment={type:(w.id%3===0?'ЭЦН':'Станок-качалка'),serial:'SIM-'+w.id,age:2+(w.id%12),life:12,condition:w.health,maintenance:0};}return t}
function treeMonth(){let t=ensureTree();for(let w of s.assets.wellList){w.equipment.condition=w.health;w.equipment.age+=1/12}for(let x of t.workorders.filter(x=>x.status==='В работе')){x.remaining--;if(x.remaining<=0){let w=s.assets.wellList.find(w=>w.id===x.well);if(w){w.health=cl(w.health+(x.type==='КРС'?35:18),0,100);w.equipment.condition=w.health;w.status='Работает';if(x.type==='КРС')w.rate+=2.5;else w.rate+=.8;}x.status='Завершён';t.history.unshift('Месяц '+s.month+': '+x.type+' скважины №'+x.well+' завершён')}}}
async function treeAction(id,act){let t=ensureTree(),w=s.assets.wellList.find(x=>x.id===Number(id));if(!w)return;if(act==='open'){treeWell=w.id;render();return}if(act==='stop'){w.status=w.status==='Работает'?'Остановлена':'Работает';t.history.unshift('Месяц '+s.month+': '+w.status+' скважина №'+w.id)}else if(act==='prs'||act==='krs'){let type=act==='prs'?'ПРС':'КРС',cost=act==='prs'?28:105,duration=act==='prs'?1:2;if(t.workorders.some(x=>x.well===w.id&&x.status==='В работе'))return uiAlert('На скважине уже идёт ремонт');if(s.cash<cost)return uiAlert('Недостаточно средств');if(!await uiConfirm('Оформить '+type+' скважины №'+w.id+' за '+m(cost)+'? Срок '+duration+' мес.'))return;s.cash-=cost;w.status='Ремонт';t.workorders.unshift({id:++t.seq,well:w.id,type,cost,remaining:duration,status:'В работе',start:s.month});t.history.unshift('Месяц '+s.month+': '+type+' №'+w.id+' — '+m(cost))}else if(act==='replace'){let cost=75;if(s.cash<cost)return uiAlert('Недостаточно средств');if(!await uiConfirm('Заменить привод скважины №'+w.id+' за '+m(cost)+'?'))return;s.cash-=cost;w.equipment.age=0;w.health=95;w.equipment.condition=95;w.equipment.serial='SIM-'+w.id+'-'+s.month;t.history.unshift('Месяц '+s.month+': замена оборудования №'+w.id+' — '+m(cost))}save();render()}
function treeView(){let t=ensureTree(),all=s.assets.wellList,shop=Number(treeShop),ws=all.filter(w=>w.shop===shop),units=[...new Set(ws.map(w=>w.unit))].sort((a,b)=>Number(a.slice(3))-Number(b.slice(3)));if(!units.includes(treeUnit))treeUnit=units[0]||'ГУ-1';let uw=ws.filter(w=>w.unit===treeUnit),filtered=uw.filter(w=>treeFilter==='all'||(treeFilter==='active'?w.status==='Работает':w.status!=='Работает'));let active=ws.filter(w=>w.status==='Работает'),day=active.reduce((a,w)=>a+w.rate*(1-w.water/100),0),avg=ws.length?ws.reduce((a,w)=>a+w.water,0)/ws.length:0;let shopButtons=TREE_SHOPS.map((name,i)=>'<button class="mini-btn '+(shop===i?'selected-tree':'')+'" data-tree-shop="'+i+'">'+name+'</button>').join('');let unitButtons=units.map(u=>'<button class="mini-btn '+(u===treeUnit?'selected-tree':'')+'" data-tree-unit="'+esc(u)+'">'+esc(u)+' ('+ws.filter(w=>w.unit===u).length+')</button>').join('');let chosen=all.find(w=>w.id===treeWell&&w.shop===shop&&w.unit===treeUnit);let detail=chosen?'<div class="card tree-detail"><h3>Паспорт скважины №'+chosen.id+'</h3><div class="three"><div class="mini-card">Состояние<strong>'+esc(chosen.status)+'</strong></div><div class="mini-card">Дебит<strong>'+f(chosen.rate)+' т/сут</strong></div><div class="mini-card">Обводнённость<strong>'+f(chosen.water)+'%</strong></div></div>'+row('Цех / объект',TREE_SHOPS[chosen.shop]+' / '+chosen.unit)+row('Оборудование',esc(chosen.equipment.type))+row('Условный заводской №',esc(chosen.equipment.serial))+row('Возраст оборудования',f(chosen.equipment.age)+' лет')+row('Модельный срок службы',chosen.equipment.life+' лет')+row('Состояние',chosen.health+'%')+'<div class="actions"><button class="btn secondary compact" data-tree-action="stop" data-tree-id="'+chosen.id+'">'+(chosen.status==='Работает'?'Остановить':'Запустить')+'</button><button class="btn secondary compact" data-tree-action="prs" data-tree-id="'+chosen.id+'">ПРС · 28 млн ₸</button><button class="btn secondary compact" data-tree-action="krs" data-tree-id="'+chosen.id+'">КРС · 105 млн ₸</button><button class="btn secondary compact" data-tree-action="replace" data-tree-id="'+chosen.id+'">Заменить привод · 75 млн ₸</button></div></div>':'';return '<h2>Производственная структура · объекты и скважины</h2><p class="muted">Откройте цех → ГУ → скважину → паспорт оборудования. Игровая структура, номера и сроки службы условные.</p><div class="dispatch-kpis"><div><small>Фонд цеха</small><strong>'+ws.length+'</strong></div><div><small>Работает</small><strong>'+active.length+'</strong></div><div><small>Добыча, оценка</small><strong>'+f(day)+' т/сут</strong></div><div><small>Обводнённость</small><strong>'+f(avg)+'%</strong></div></div><h3>Выбрать цех</h3><div class="actions">'+shopButtons+'</div><h3>Групповые установки</h3><div class="actions">'+unitButtons+'</div><div class="actions"><button class="mini-btn '+(treeFilter==='all'?'selected-tree':'')+'" data-tree-filter="all">Все</button><button class="mini-btn '+(treeFilter==='active'?'selected-tree':'')+'" data-tree-filter="active">В работе</button><button class="mini-btn '+(treeFilter==='stopped'?'selected-tree':'')+'" data-tree-filter="stopped">Простой / ремонт</button></div><div class="table-scroll"><table class="well-table"><thead><tr><th>Скважина</th><th>Состояние</th><th>Дебит, т/сут</th><th>Вода, %</th><th>Оборудование</th><th>Состояние, %</th><th></th></tr></thead><tbody>'+filtered.map(w=>'<tr><td><b>№'+w.id+'</b></td><td>'+esc(w.status)+'</td><td>'+f(w.rate)+'</td><td>'+f(w.water)+'</td><td>'+esc(w.equipment.type)+'</td><td>'+w.health+'%</td><td><button class="mini-btn" data-tree-action="open" data-tree-id="'+w.id+'">Открыть →</button></td></tr>').join('')+'</tbody></table></div>'+(filtered.length?'':'<p class="muted">Скважин по выбранному фильтру нет.</p>')+detail+'<h3>Ремонты в работе</h3>'+(t.workorders.filter(x=>x.status==='В работе').map(x=>'<div class="row"><span>'+x.type+' · скв. №'+x.well+'</span><b>Осталось '+x.remaining+' мес.</b></div>').join('')||'<p class="muted">Активных заявок нет.</p>')+'<h3>История операций</h3>'+t.history.slice(0,12).map(x=>'<div class="row">'+esc(x)+'</div>').join('')+'<p class="fine">Скважины, ГУ, паспорта и производственные параметры — вымышленные. Реальные данные компании не используются. Срок службы — модельный, не юридический норматив.</p>'}
function treeBind(){document.querySelectorAll('[data-tree-shop]').forEach(b=>b.onclick=()=>{treeShop=Number(b.dataset.treeShop);treeWell=null;render()});document.querySelectorAll('[data-tree-unit]').forEach(b=>b.onclick=()=>{treeUnit=b.dataset.treeUnit;treeWell=null;render()});document.querySelectorAll('[data-tree-filter]').forEach(b=>b.onclick=()=>{treeFilter=b.dataset.treeFilter;render()});document.querySelectorAll('[data-tree-action]').forEach(b=>b.onclick=()=>treeAction(b.dataset.treeId,b.dataset.treeAction))}


/* v0.8 extension: additive data under v8, preserves v0.7 localStorage */
const V8_NAMES_CITY=[['Ерлан Нурланов','Директор по производству'],['Алия Омарова','Директор по экономике'],['Данияр Сапаров','Главный инженер'],['Мадина Жумабаева','Директор по персоналу'],['Руслан Сейтов','Начальник департамента'],['Айгуль Садыкова','Директор по финансам'],['Ербол Каримов','Директор по снабжению'],['Асем Бекенова','Начальник юридического управления'],['Мурат Касымов','Директор по развитию'],['Гульмира Абдрахманова','Начальник управления планирования']];
const V8_NAMES_FIELD=[['Нуржан Бекетов','Начальник ЦДНГ-1'],['Серик Муратов','Начальник ЦППД'],['Болат Смагулов','Начальник ЦДНГ-2'],['Кайрат Иманов','Начальник ЦДНГ-3'],['Руслан Ахметов','Начальник ЦКППН'],['Ермек Нуртаев','Начальник ЦДНГ-4'],['Данияр Алиев','Начальник участка ПРС'],['Аскар Жумабаев','Начальник участка подготовки нефти'],['Марат Оспанов','Начальник ремонтного участка'],['Талгат Ержанов','Начальник участка ППД']];
const V8_MONTHS=['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];

/* v2.6: well repair orders consume spare parts, take game days and cause downtime. */
function v26init(){
 if(!s.v26)s.v26={orders:[],seq:0,history:[]};
 s.v26.orders||=[];s.v26.history||=[];s.v26.seq||=0;
 return s.v26;
}
async function v26requestRepair(w){
 let d=v26init(),p=ensurePlant();
 if(d.orders.some(x=>x.well===w.id&&x.status==='В работе'))return uiAlert('На скважине уже проводится ремонт');
 const materials=[{id:6,qty:2},{id:7,qty:2},{id:9,qty:1}];
 let missing=materials.filter(x=>(p.stock.find(z=>z.id===x.id)?.qty||0)<x.qty);
 if(missing.length)return uiAlert('Недостаточно запасных частей на складе: '+missing.map(x=>p.stock.find(z=>z.id===x.id)?.name||x.id).join(', ')+'. Закупите материалы в разделе «Склад».');
 let cost=42,days=3;
 if(s.cash<cost)return uiAlert('Недостаточно средств для ремонта: '+m(cost));
 if(!await uiConfirm('Начать ремонт скважины №'+w.id+'?\nСтоимость: '+m(cost)+'\nСрок: '+days+' игровых дня.\nБудут списаны подшипники, уплотнения и датчик давления. Скважина остановится на время ремонта.'))return;
 for(let item of materials){let x=p.stock.find(z=>z.id===item.id);x.qty-=item.qty;x.consumed+=item.qty;}
 s.cash-=cost;v25post('maintenance',cost,{well:w.id,description:'Ремонт скважины'});
 d.orders.push({id:++d.seq,well:w.id,unit:w.unit,days,status:'В работе',cost,started:v8date(),restoreStatus:w.status});
 w.status='Ремонт';
 d.history.unshift(v8date()+' · Скважина №'+w.id+': начат ремонт на '+days+' дня, списано '+m(cost));
 log('Ремонт скважины №'+w.id+' — '+m(cost)+', '+days+' дня');save();render();
}
function v26day(){
 let d=v26init();ensureAssets();
 for(let order of d.orders){
  if(order.status!=='В работе')continue;
  order.days--;
  if(order.days>0)continue;
  let w=s.assets.wellList.find(x=>x.id===order.well);
  order.status='Завершён';order.completed=v8date();
  if(w){w.health=Math.min(100,(w.health||60)+35);if(w.status==='Ремонт')w.status='Работает';}
  d.history.unshift(v8date()+' · Скважина №'+order.well+': ремонт завершён, оборудование восстановлено');
  v19notify('Завершён ремонт скважины №'+order.well);
 }
 if(d.history.length>150)d.history.length=150;
}
function v26view(){
 let d=v26init(),active=d.orders.filter(x=>x.status==='В работе');
 return '<h3>Ремонты скважин · заказы-наряды</h3><p class="muted">Ремонт требует запасных частей со склада, денежных средств и игрового времени. Во время ремонта скважина не добывает нефть.</p>'+
 row('Ремонтов в работе',active.length)+row('Всего заказов',d.orders.length)+
 '<div class="table-scroll"><table><thead><tr><th>Скважина</th><th>ГУ</th><th>Статус</th><th>Осталось</th><th>Стоимость</th></tr></thead><tbody>'+
 d.orders.slice(-20).reverse().map(x=>'<tr><td>№'+x.well+'</td><td>'+esc(x.unit)+'</td><td>'+esc(x.status)+'</td><td>'+(x.status==='В работе'?x.days+' дн.':'—')+'</td><td>'+m(x.cost)+'</td></tr>').join('')+'</tbody></table></div>';
}
function v8init(){if(!s)return null;if(!s.v8){let base=Math.max(1000,Math.round((s.enterprise?.target||s.wells*s.rate*30*(1-s.water/100))/100)*100);s.v8={day:1,year:2022,plans:Array.from({length:12},()=>base),originalPlans:Array.from({length:12},()=>base),monthActual:0,monthCosts:0,dailyHistory:[],monthHistory:[],morale:68,conditions:65,workload:50,bonuses:[0,10,15,20],salaryFund:Math.max(30,Math.round((s.enterprise?.staff||240)*.65)),bonusPaid:0,incidents:[],inspection:[],seq:0,rankCity:V8_NAMES_CITY.map((x,i)=>({name:x[0],job:x[1],score:Math.round(67+Math.sin(i*3)*16)})),rankField:V8_NAMES_FIELD.map((x,i)=>({name:x[0],job:x[1],score:Math.round(68+Math.cos(i*2)*17)})),notifications:[],daysElapsed:0};}let v=s.v8;if(!v.v11NamesFixed){v.rankField=V8_NAMES_FIELD.map((x,i)=>({name:x[0],job:x[1],score:v.rankField?.[i]?.score??Math.round(62+Math.sin(i*2)*18)}));v.rankCity=V8_NAMES_CITY.map((x,i)=>({name:x[0],job:x[1],score:v.rankCity?.[i]?.score??Math.round(66+Math.cos(i*2)*16)}));v.v11NamesFixed=true;}v.day=cl(Math.round(v.day||1),1,31);v.plans ||= Array(12).fill(7500);v.originalPlans ||=v.plans.slice();v.incidents ||= [];v.inspection ||= [];v.notifications ||= [];v.dailyHistory ||= [];v.monthHistory ||= [];return v}

/* v2.2 — deterministic fictional weather tied to career calendar. */
function v22weather(){
 if(!s||!s.v8)return null;
 let y=s.v8.year,m=v8idx(),day=s.v8.day;
 let season=m===11||m<=1?'Зима':m<=4?'Весна':m<=7?'Лето':'Осень';
 let seed=((y*3719+(m+1)*157+day*41)>>>0);
 let rand=k=>{let x=Math.sin((seed+k*997)*.0137)*43758.5453;return x-Math.floor(x)};
 let base=[-4,-3,5,14,23,29,32,30,22,13,5,-1][m];
 let temp=Math.round(base+(rand(1)-.5)*12),wind=Math.round(3+rand(2)*12);
 let wet=rand(3),dust=wind>=11&&(m>=3&&m<=9)&&rand(4)>.54;
 let snow=temp<=0&&wet>.68, rain=temp>0&&wet>.76;
 let kind=dust?'Пыльная буря':snow?'Снег':rain?'Дождь':wind>=12?'Сильный ветер':wet<.33?'Ясно':'Облачно';
 let icon=dust?'🌪️':snow?'🌨️':rain?'🌧️':wind>=12?'💨':wet<.33?'☀️':'☁️';
 let severity=dust?3:wind>=12?2:snow?2:rain?1:0;
 return {season,temp,wind,kind,icon,severity,date:v8date(),fictional:true};
}
function v22weatherHtml(){let w=v22weather();if(!w)return '';
 return '<div class="v22weather" title="Игровая погода: рассчитывается по календарю карьеры, не является реальным прогнозом"><span class="v22weather-icon">'+w.icon+'</span><span><strong>'+w.season+' · '+w.temp+'°C</strong><small>'+w.kind+' · ветер '+w.wind+' м/с</small></span></div>';
}
function v22weatherImpact(){let w=v22weather();return w?{risk:w.severity*.0008,output:w.severity===3?.94:w.severity===2?.98:1}: {risk:0,output:1};}

function v8idx(){return ((s.month%12)+12)%12}function v8days(){return new Date(s.v8.year,v8idx()+1,0).getDate()}function v8date(){return String(s.v8.day).padStart(2,'0')+'.'+String(v8idx()+1).padStart(2,'0')+'.'+s.v8.year}function v8plan(){return s.v8.plans[v8idx()]||0}
function v8dailyProduction(){return v21calc().oil}
function v8advance(){if(s.dead)return;let v=v8init(),daily=v8dailyProduction(),lost=0;let weatherEffect=v22weatherImpact();daily*=weatherEffect.output;v.daysElapsed++;let incidentRisk=cl((100-s.safety)*.00045+(100-s.condition)*.00028+(100-v.morale)*.00012+weatherEffect.risk,.001,.095);if(Math.random()<incidentRisk){let k=Math.random(),severity=k<.62?'Инцидент без травм':k<.89?'Несчастный случай':k<.98?'Авария':'Тяжёлый несчастный случай';let expense=severity==='Инцидент без травм'?2:severity==='Несчастный случай'?12:severity==='Авария'?38:90;let stop=severity==='Инцидент без травм'?1:severity==='Несчастный случай'?2:severity==='Авария'?5:12;let w=s.assets.wellList.filter(x=>x.status==='Работает')[0];if(w){w.status='Остановлена';v.inspection.unshift({well:w.id,days:stop,reason:severity,closed:false});lost=w.rate*(1-w.water/100)}v.incidents.unshift({id:++v.seq,date:v8date(),severity,expense,stop,well:w?.id||'—',status:'Расследование',insured:severity.includes('несчастный')||severity.includes('Несчастный')});s.cash-=expense;v.monthCosts+=expense;v25post("incident",expense,{severity});v.morale=cl(v.morale-7,0,100);v.notifications.unshift(severity+': '+expense+' млн ₸, остановка объекта и расследование');log(severity+' · '+expense+' млн ₸; зарегистрировано расследование');}
for(const x of v.inspection){if(!x.closed){x.days--;if(x.days<=0){x.closed=true;v.notifications.unshift('Ограничение по скв. №'+x.well+' завершилось. Требуется решение о безопасном пуске.')}}}
daily=Math.max(0,daily-lost);
let v32=v32settle(daily);
daily=v32.sold;
v.monthActual+=v32.produced;v.dailyHistory.push({date:v8date(),oil:v32.produced,sold:daily});if(v.dailyHistory.length>400)v.dailyHistory.shift();let dailyPayroll=v.salaryFund/v8days();let dailyOpex=daily*.006;let dailyRevenue=v34invoice(v32);
let collected=v34collect();
s.cash+=collected-dailyOpex-dailyPayroll;
v25post("sale",dailyRevenue,{tons:daily,produced:v32.produced,processed:v32.processed,stored:v32.stored,unmet:v32.unmet,collected});v25post("opex",dailyOpex);v25post("payroll",dailyPayroll);v.monthCosts+=dailyPayroll+dailyOpex;v.morale=cl(v.morale+(v.conditions-55)*.002-(v.workload-55)*.003-.012,0,100);if(v.day<v8days()){v.day++}else{let idx=v8idx(),pct=v8plan()?v.monthActual/v8plan()*100:100;let bonusPct=pct>=110?v.bonuses[3]:pct>=105?v.bonuses[2]:pct>=100?v.bonuses[1]:v.bonuses[0];let pay=v.salaryFund*bonusPct/100;if(s.cash>=pay){s.cash-=pay;v25post("bonus",pay);v.bonusPaid+=pay;v.morale=cl(v.morale+bonusPct*.11,0,100)}v.monthHistory.push({year:v.year,month:idx,plan:v8plan(),original:v.originalPlans[idx],actual:v.monthActual,bonus:pay,rate:pct});for(const [arr,weight] of [[v.rankCity,.35],[v.rankField,.7]])for(const person of arr){person.score=cl(Math.round(person.score*.75+(.25*(65+(pct-100)*weight+v.morale*.25)+(Math.random()-.5)*8)),0,100)};v.notifications.unshift('Закрыт '+V8_MONTHS[idx]+': добыча '+f(v.monthActual)+' т, план '+f(v8plan())+' т, премия '+m(pay));v.monthActual=0;v.monthCosts=0;v.day=1;if(idx===11)v.year++;next();}save();render()}
function v8dailyView(){let v=v8init(),idx=v8idx(),plan=v8plan(),days=v8days(),left=Math.max(0,plan-v.monthActual),remain=Math.max(1,days-v.day+1),needed=left/remain,forecast=v.monthActual+v8dailyProduction()*remain,progress=plan?Math.min(100,v.monthActual/plan*100):100;let hist=v.monthHistory.slice(-6).reverse();return '<h2>Суточная добыча · план-факт</h2><p class="muted">'+v8date()+' · '+V8_MONTHS[idx]+' · посуточная симуляция</p><div class="v8grid">'+[['План месяца',f(plan)+' т'],['Фактически добыто',f(v.monthActual)+' т'],['Осталось до плана',f(left)+' т'],['Необходимо в сутки',f(needed)+' т'],['Текущий дебит',f(v8dailyProduction())+' т/сут'],['Прогноз месяца',f(forecast)+' т']].map(x=>'<div class="v8tile"><small>'+x[0]+'</small><strong>'+x[1]+'</strong></div>').join('')+'</div><div class="v8line"><i style="width:'+progress+'%"></i></div><p class="v8small">Выполнение '+f(progress)+'% · до закрытия '+remain+' дн. · первоначальный план '+f(v.originalPlans[idx])+' т</p><h3>Корректировка планов по месяцам</h3><p class="v8small">Изменения фиксируются в журнале. Исходный план сохраняется для объективной оценки.</p><div class="table-scroll"><table class="v8table"><thead><tr><th>Месяц</th><th>Исходный</th><th>Утверждённый, т</th><th>Изменить</th></tr></thead><tbody>'+V8_MONTHS.map((name,i)=>'<tr><td>'+name+'</td><td>'+f(v.originalPlans[i])+'</td><td><b>'+f(v.plans[i])+'</b></td><td><button class="mini-btn" data-v8-plan="'+i+'" data-v8-delta="-1000">−1 000</button> <button class="mini-btn" data-v8-plan="'+i+'" data-v8-delta="1000">+1 000</button></td></tr>').join('')+'</tbody></table></div><h3>Закрытые месяцы</h3>'+(hist.map(x=>'<div class="row"><span>'+V8_MONTHS[x.month]+' '+x.year+' · '+f(x.actual)+' / '+f(x.plan)+' т</span><b>'+f(x.rate)+'%</b></div>').join('')||'<p class="muted">История появится после закрытия первого месяца.</p>')+'<div class="notice">Производственная модель учебная. Дневной дебит зависит от фонда работающих скважин и обводнённости. Существующие месячные механики предыдущих версий запускаются при закрытии месяца.</div>'}
function v8peopleView(){let v=v8init();let rank=(arr,title)=>'<h3>'+title+'</h3>'+arr.map((x,i)=>'<div class="row"><span>'+(i+1)+'. '+esc(x.name)+'<small class="v8small" style="display:block">'+esc(x.job)+'</small></span><b>'+x.score+'/100</b></div>').join('');let group=(data,title)=>{let sorted=[...data].sort((a,b)=>b.score-a.score);return '<div class="v8card"><h2>'+title+'</h2><div class="fields"><div>'+rank(sorted.slice(0,5),'🏆 ТОП-5 лучших')+'</div><div>'+rank(sorted.slice(-5).reverse(),'↘ ТОП-5 требующих внимания')+'</div></div></div>'};return '<h2>Коллектив · мотивация · руководители</h2><div class="v8grid">'+[['Настроение работников',f(v.morale)+'/100'],['Фонд оплаты труда',m(v.salaryFund)+'/мес'],['Условия труда',v.conditions+'/100']].map(x=>'<div class="v8tile"><small>'+x[0]+'</small><strong>'+x[1]+'</strong></div>').join('')+'</div><h3>Управленческие решения</h3><div class="actions"><button class="mini-btn" data-v8-people="conditions">Улучшить условия · 8 млн ₸</button><button class="mini-btn" data-v8-people="support">Программа поддержки · 4 млн ₸</button><button class="mini-btn" data-v8-people="load">Снизить нагрузку · 3 млн ₸</button></div><h3>Премирование за выполнение плана</h3><div class="v8card">'+['<100%','100–104,9%','105–109,9%','≥110%'].map((label,i)=>'<div class="row"><span>'+label+'</span><span><button class="mini-btn" data-v8-bonus="'+i+'" data-v8-delta="-5">−</button> <b>'+v.bonuses[i]+'%</b> <button class="mini-btn" data-v8-bonus="'+i+'" data-v8-delta="5">+</button></span></div>').join('')+'<p class="v8small">Премия начисляется при закрытии месяца от игрового ФОТ. Настройки сохраняются.</p></div>'+group(v.rankCity,'Городской аппарат')+group(v.rankField,'Месторождения')+'<p class="v8small">Рейтинг — игровой сравнительный показатель, обновляется при закрытии месяца. Оценки основаны на условных KPI и не являются характеристикой реальных людей.</p>'}
function v8incidentsView(){let v=v8init();return '<h2>Происшествия · остановки · государственный надзор</h2><div class="v8grid">'+[['Зарегистрировано',v.incidents.length],['Ограничения',v.inspection.filter(x=>!x.closed).length],['Затраты на события',m(v.incidents.reduce((a,x)=>a+x.expense,0))]].map(x=>'<div class="v8tile"><small>'+x[0]+'</small><strong>'+x[1]+'</strong></div>').join('')+'</div><h3>Реестр происшествий</h3>'+(v.incidents.length?v.incidents.slice(0,20).map(x=>'<div class="v8card"><b>№'+x.id+' · '+esc(x.severity)+'</b><div class="v8small">'+x.date+' · скв. №'+x.well+'</div>'+row('Статус',x.status)+row('Прямые расходы',m(x.expense))+row('Остановка, суток',x.stop)+row('Страхование',x.insured?'Требуется определение покрытия':'По условиям договора')+'</div>').join(''):'<p class="muted">Зарегистрированных событий пока нет.</p>')+'<h3>Остановленные объекты</h3>'+(v.inspection.filter(x=>!x.closed).map(x=>'<div class="row"><span>Скв. №'+x.well+' · '+esc(x.reason)+'</span><b>Осталось '+Math.max(0,x.days)+' дн.</b></div>').join('')||'<p class="muted">Активных ограничений нет.</p>')+'<h3>Завершённые ограничения</h3>'+(v.inspection.filter(x=>x.closed).map(x=>'<div class="row"><span>Скв. №'+x.well+' · проверка готовности</span><button class="mini-btn" data-v8-restart="'+x.well+'">Проверить и запустить</button></div>').join('')||'<p class="muted">Нет объектов к повторному пуску.</p>')+'<div class="notice">Демонстрационная система: инспекции, расследования, страховые выплаты и санкции требуют отдельной нормативной модели. Автоматических «законных штрафов» и гарантированных страховых выплат здесь нет.</div>'}
async function v8bind(){document.querySelectorAll('[data-v8-plan]').forEach(b=>b.onclick=async()=>{let v=v8init(),i=+b.dataset.v8Plan,d=+b.dataset.v8Delta;if(i<v8idx())return uiAlert('Закрытый месяц нельзя менять');let reason=await uiPrompt('Причина корректировки плана (обязательно):');if(!reason||!reason.trim())return;v.plans[i]=Math.max(0,v.plans[i]+d);v.notifications.unshift('Корректировка '+V8_MONTHS[i]+': '+(d>0?'+':'')+f(d)+' т. '+reason.slice(0,120));save();render()});document.querySelectorAll('[data-v8-bonus]').forEach(b=>b.onclick=async()=>{let v=v8init(),i=+b.dataset.v8Bonus;v.bonuses[i]=cl(v.bonuses[i]+Number(b.dataset.v8Delta),0,100);save();render()});document.querySelectorAll('[data-v8-people]').forEach(b=>b.onclick=()=>{let v=v8init(),kind=b.dataset.v8People,cost={conditions:8,support:4,load:3}[kind];if(s.cash<cost)return uiAlert('Недостаточно средств');s.cash-=cost;if(kind==='conditions'){v.conditions=cl(v.conditions+8,0,100);v.morale=cl(v.morale+3,0,100)}if(kind==='support')v.morale=cl(v.morale+5,0,100);if(kind==='load'){v.workload=cl(v.workload-8,0,100);v.morale=cl(v.morale+2,0,100)}v.notifications.unshift('Мероприятие по персоналу: '+m(cost));save();render()});document.querySelectorAll('[data-v8-restart]').forEach(b=>b.onclick=async()=>{let v=v8init(),id=Number(b.dataset.v8Restart),w=s.assets.wellList.find(x=>x.id===id);if(!w)return;if(w.health<40)return uiAlert('Необходимо восстановить техническое состояние оборудования');if(!await uiConfirm('Подтверждены устранение причин, проверки готовности и необходимые разрешения для пуска?'))return;w.status='Работает';v.inspection=v.inspection.filter(x=>x.well!==id);v.notifications.unshift('После проверки готовности возобновлена работа скв. №'+id);save();render()})}


/* v1.1: integrated daily calendar, personnel careers, inbox, quick actions, sounds, visual scene */
const V11_MENU=[['overview','🏠','Кабинет директора'],['inbox','✉','Входящие'],['daily','📅','Добыча · планы'],['dispatch','📡','Диспетчерская'],['assetsTree','🛢','Скважины · ГУ'],['workshops','🏭','Цеха · KPI'],['people','🏆','Рейтинг'],['career','👥','Кадры · найм'],['staff','🪪','Штатное расписание'],['finance','₸','Финансы'],['market','📈','Рынок нефти'],['incidents','🚨','Происшествия'],['equipment','⚙','Оборудование'],['warehouse','📦','Склад'],['contracts','🤝','Подрядчики'],['hse','🛡','Охрана труда'],['decisions','⚡','Решения'],['events','📜','Журнал']];
let v11sound=true,v11busy=false,v11focus=null;
function v11beep(type='click'){if(!v11sound)return;try{let C=window.AudioContext||window.webkitAudioContext;if(!C)return;let c=new C(),o=c.createOscillator(),g=c.createGain();o.type='sine';o.frequency.value=type==='alarm'?440:type==='success'?740:520;g.gain.setValueAtTime(.045,c.currentTime);g.gain.exponentialRampToValueAtTime(.0001,c.currentTime+.13);o.connect(g);g.connect(c.destination);o.start();o.stop(c.currentTime+.14);setTimeout(()=>c.close(),300)}catch(e){}}
function v11init(){let v=v8init();if(!s.v11)s.v11={employees:[],marketDay:0,actions:[],inbox:[],hired:0};let z=s.v11;z.employees||=[];z.inbox||=[];z.actions||=[];if(!z.employees.length){let names=['Ерлан Серикович Нурланов','Болат Маратович Смагулов','Нуржан Ермекович Бекетов','Алия Кайратовна Омарова','Мадина Сериковна Жумабаева','Руслан Талгатович Ахметов'];z.employees=names.map((name,i)=>({id:100+i,name,sex:i===3||i===4?'Ж':'М',birth:1969+i*5,experience:Math.max(1,27-i*3),job:i<3?'Начальник производственного участка':'Руководитель службы',salary:750000+i*90000,skills:cl(75+i*3,0,100),discipline:cl(92-i*5,0,100),leadership:cl(76+i*2,0,100),weak:i%2?'Сложности с делегированием':'Нуждается в развитии цифровых навыков',strong:i%2?'Техническая экспертиза':'Организованность',status:'Работает'}))}return z}
function v11age(p){return Math.max(18,s.v8.year-p.birth)}
function v11market(){let v=v8init(),z=v11init(),n=(v.year-2022)*365+v.daysElapsed;let ref={2022:100.9,2023:82.5,2024:80.5,2025:69.1,2026:70};let yr=ref[v.year]||Math.max(38,75+15*Math.sin((v.year-2026)*.41));let oil=cl(yr+7*Math.sin(n/31)+3*Math.sin(n/9),28,180);let fx=cl((v.year===2022?461:v.year===2023?456:v.year===2024?469:v.year===2025?521:510+(v.year-2026)*3)+15*Math.sin(n/27)+6*Math.sin(n/7),330,950);s.oil=oil;s.usd=fx;return {oil,fx}}
function v11step(n){if(v11busy||s.dead)return;v11busy=true;let limit=typeof n==='number'?n:n==='month'?new Date(s.v8.year,v8idx()+1,0).getDate()-s.v8.day+1:(new Date(s.v8.year+1,0,1)-new Date(s.v8.year,v8idx(),s.v8.day))/86400000;limit=Math.min(366,Math.max(1,Math.round(limit)));let count=0;function tick(){if(count>=limit||s.dead){v11busy=false;v11beep('success');render();return}let old=s.v8.incidents.length;v11market();v8advance();v19day();save();count++;let v=s.v8;if(v.incidents.length>old){v11busy=false;v11beep('alarm');tab='inbox';render();uiAlert('Критическое событие: переход времени остановлен. Проверьте входящие и происшествия.');return}if(count%25===0)setTimeout(tick,0);else tick()}tick()}
function v11sidebar(){let el=$('v11side');el.classList.toggle('hide',!s);if(!s)return;$('v11sideitems').innerHTML=V11_MENU.map(([id,ico,label])=>'<button class="v11sidebtn '+(tab===id?'active':'')+'" data-v11-tab="'+id+'"><span class="ico">'+ico+'</span><span class="txt">'+label+'</span></button>').join('')}
function v11hero(){let label=V11_MENU.find(x=>x[0]===tab)?.[2]||'Управление компанией';return '<div class="v11hero"><div><h2>'+esc(label)+'</h2><p>'+esc(s.name)+' · '+esc(s.field)+' · '+v8date()+'</p><span class="v11pill">Brent $'+f(s.oil)+' · USD/KZT '+f(s.usd)+'</span></div><svg viewBox="0 0 460 180" aria-hidden="true"><circle cx="355" cy="50" r="33" fill="#edc67d"/><path d="M0 180L60 155 130 162 195 133 260 154 325 115 460 155V180" fill="#29536a"/><path d="M90 170V70m-35 28h125m-112-28h44l40 28m-63-28l-34 28m34-28l48 28m-48-28v95M325 172V48m-38 45h77m-39-45l-38 45m38-45l39 45M270 175h100" stroke="#b3d0d4" stroke-width="7" fill="none"/><path d="M210 180V125h65v55M390 180V110h42v70" fill="#527c87"/></svg></div>'}
function v11status(x){return '<span class="v11status '+(x>=80?'green':x>=60?'yellow':'red')+'">'+f(x)+'/100</span>'}
function v11personCard(p){return '<div class="v11panel"><div class="v11visual"><div class="v11avatar">'+(p.sex==='Ж'?'👩‍💼':'👨‍💼')+'</div><div><h3>'+esc(p.name)+'</h3><div class="muted">'+esc(p.job)+' · '+p.status+'</div></div></div>'+row('Возраст',v11age(p)+' лет')+row('Стаж',p.experience+' лет')+row('Зарплата',f(p.salary)+' ₸/мес')+row('До пенсионного возраста (ориентир)',Math.max(0,(p.sex==='Ж'?61:63)-v11age(p))+' лет')+row('Профессионализм',v11status(p.skills))+row('Дисциплина',v11status(p.discipline))+row('Лидерство',v11status(p.leadership))+'<p>Сильные стороны: '+esc(p.strong)+'</p><p class="muted">Зоны развития: '+esc(p.weak)+'</p><div class="v11quick"><button data-v11-person="'+p.id+'" data-v11-act="bonus">Премия</button><button data-v11-person="'+p.id+'" data-v11-act="train">Обучить</button><button data-v11-person="'+p.id+'" data-v11-act="raise">Повысить оклад</button><button data-v11-person="'+p.id+'" data-v11-act="dismiss">Инициировать увольнение</button></div></div>'}
function v11career(){let z=v11init(),people=z.employees.filter(p=>p.status==='Работает');let cards=people.map(p=>'<div class="v11person" data-v11-open="'+p.id+'">'+esc(p.name)+' <span class="muted">· '+esc(p.job)+' · '+v11age(p)+' лет</span> '+v11status(p.skills)+'</div>').join('');let p=people.find(x=>x.id===v11focus);return '<h2>Кадровая служба · личные дела</h2><p class="muted">Возраст и стаж обновляются по игровому календарю. При достижении пенсионного возраста работник не увольняется автоматически.</p><div class="v8grid">'+[['Штат',people.length],['Средний возраст',f(people.reduce((a,p)=>a+v11age(p),0)/Math.max(1,people.length))],['Кандидатов на подбор','3']].map(x=>'<div class="v8tile"><small>'+x[0]+'</small><strong>'+x[1]+'</strong></div>').join('')+'</div><h3>Действующие сотрудники</h3>'+cards+(p?v11personCard(p):'<div class="notice">Выберите сотрудника, чтобы открыть личное дело и принять решение.</div>')+'<h3>Кандидаты · мини-резюме</h3>'+v11candidates()}
function v11candidates(){let list=[['Арман Серикович Байжанов','М',1991,11,87,84,740000,'Умеет организовать ремонт','Ограниченный опыт управления'],['Тимур Ермекович Абилов','М',1984,18,94,69,920000,'Большой опыт в добыче','Конфликтность'],['Асель Маратовна Сейтова','Ж',1997,5,77,95,580000,'Внимательность и обучаемость','Небольшой стаж']];return list.map((p,i)=>'<div class="v11panel"><b>'+p[0]+'</b><div class="muted">'+(s.v8.year-p[2])+' лет · стаж '+p[3]+' лет · запрос '+f(p[6])+' ₸</div>'+row('Компетентность',v11status(p[4]))+row('Дисциплина',v11status(p[5]))+'<div>Плюсы: '+p[7]+'</div><div class="muted">Риски: '+p[8]+'</div><button class="mini-btn" data-v11-hire="'+i+'">Принять на работу</button></div>').join('')}
function v11rank(){let v=v8init();let block=(arr,title)=>{let a=[...arr].sort((x,y)=>y.score-x.score);return '<div class="v11panel"><h3>'+title+'</h3><h4>🏆 ТОП-5 лучших</h4>'+a.slice(0,5).map(x=>v11rankRow(x)).join('')+'<h4>⚠ ТОП-5 низких результатов</h4>'+a.slice(-5).reverse().map(x=>v11rankRow(x,true)).join('')+'</div>'};return '<h2>Эффективность руководителей</h2><p class="muted">Нажмите на руководителя, чтобы принять решение прямо здесь. Город и месторождения оцениваются отдельно.</p>'+block(v.rankCity,'Городской аппарат')+block(v.rankField,'Месторождения')+(v11focus!==null?v11leaderPanel():'')}
function v11rankRow(p,bad=false){return '<div class="v11person '+(bad?'bad':'')+'" data-v11-leader="'+esc(p.name)+'"><b>'+esc(p.name)+'</b><div class="muted">'+esc(p.job)+'</div>'+v11status(p.score)+'</div>'}
function v11leaderPanel(){let p=[...s.v8.rankCity,...s.v8.rankField].find(x=>x.name===v11focus);if(!p)return '';return '<div class="v11panel"><h3>'+esc(p.name)+'</h3>'+row('Должность',esc(p.job))+row('Результативность',v11status(p.score))+'<p class="muted">Решения влияют на бюджет, эффективность и историю кадровых действий.</p><div class="v11quick"><button data-v11-leaderact="bonus">Премировать</button><button data-v11-leaderact="train">Обучение</button><button data-v11-leaderact="plan">План улучшений</button><button data-v11-leaderact="dismiss">Процедура увольнения</button></div></div>'}
let v14Selected=null,v14Filter='active';
function v14Hash(text){let h=2166136261;for(let i=0;i<text.length;i++){h^=text.charCodeAt(i);h=Math.imul(h,16777619)}return (h>>>0).toString(36)}
function v14Category(t){if(/несчаст|инцидент|авари|травм|пожар|разлив|останов|отказ|полом/i.test(t))return 'incident';if(/ремонт|оборудован|насос|скважин|техник/i.test(t))return 'technical';if(/кадр|увольн|работник|персонал|преми|обучен|назначен/i.test(t))return 'hr';if(/договор|подряд|закуп|поставк|склад|заявк/i.test(t))return 'supply';if(/план|добыч|обводн|дебит/i.test(t))return 'production';return 'general'}
function v14Sync(){let z=v11init(),v=v8init();if(!s.mailbox||!Array.isArray(s.mailbox.items))s.mailbox={items:[],seq:0};let db=s.mailbox;let sources=[...(v.notifications||[]).map(x=>String(x)),...(z.inbox||[]).map(x=>String(x))];for(const t of sources){let id='src-'+v14Hash(t);if(!db.items.some(x=>x.id===id)){db.items.unshift({id,text:t,category:v14Category(t),created:v8date(),status:'new',choice:null,outcome:'',readAt:null});}}if(db.items.length>450)db.items=db.items.slice(0,450);return db}
function v14Scenario(item){let t=item.text,kind=item.category,well=(t.match(/(?:№|скважин[аые]?\s*)(\d{3,6})/i)||[])[1];let place=(t.match(/(?:ГУ|ЦДНГ)-\d+/i)||[])[0]||'производственный объект';let detail,options;
if(kind==='incident'){detail='ОПЕРАТИВНАЯ СВОДКА\n'+t+'\n\nМесто: '+place+(well?', скважина №'+well:'')+'.\nПо поступившему сообщению зафиксировано отклонение от нормального режима работы. Дежурный персонал передал информацию руководству. Масштаб последствий и непосредственная причина пока не подтверждены.\n\nЧто необходимо установить: хронологию, состояние оборудования, допуски к работам, записи технического обслуживания, ранее поданные заявки и действия ответственных лиц.\n\nВажно: сам факт происшествия не доказывает вину конкретного руководителя. До окончания проверки персональные санкции недопустимо считать обоснованными.';options=[['Обеспечить безопасность и начать расследование','Ограничить опасные работы, собрать документы и назначить комиссию','investigate'],['Организовать аварийный ремонт','Дополнительно направить средства и ремонтную бригаду','repair'],['Запросить уточнённую сводку','Сохранить событие открытым до получения фактов','clarify']];}
else if(kind==='technical'){detail='ТЕХНИЧЕСКОЕ СООБЩЕНИЕ\n'+t+'\n\nПоступила информация о технической потребности или состоянии объекта. Для решения требуется проверить паспорт оборудования, дефектную ведомость, остаток запасных частей и влияние на производственный график.\n\nОжидаемые последствия зависят от состояния скважины и сроков ремонта. При отсутствии подтверждённой дефектовки расчёты считаются предварительными.';options=[['Согласовать диагностику и подготовку ремонта','Предварительные затраты 8 млн ₸','diagnose'],['Поручить проверку склада и закупок','Сформировать заявку на обеспечение','supply'],['Запросить техническое обоснование','Пока не принимать затратное решение','clarify']];}
else if(kind==='hr'){detail='КАДРОВОЕ ОБРАЩЕНИЕ\n'+t+'\n\nПеред принятием решения необходимо проверить документы, должностные обязанности, объяснения работника, результаты труда и основания процедуры.\n\nПри наличии нарушений требуется установить факты и причинную связь. Увольнение не может выполняться автоматически по одному сообщению или показателю KPI.';options=[['Направить в кадровую службу на проверку','Запросить основания и подтверждающие материалы','investigate'],['Назначить беседу и план улучшений','Организационное решение без увольнения','coaching'],['Запросить дополнительные документы','Оставить обращение открытым','clarify']];}
else if(kind==='supply'){detail='СЛУЖЕБНАЯ ЗАПИСКА ПО СНАБЖЕНИЮ\n'+t+'\n\nНеобходимо оценить остатки склада, критичность потребности, договорные сроки, альтернативных поставщиков и бюджет. Согласование закупки не означает немедленной поставки.';options=[['Проверить наличие на складе','Поручить сверку остатков','supply'],['Согласовать предварительное финансирование','Резервировать 12 млн ₸ на обеспечение','fund'],['Запросить коммерческие предложения','Не тратить средства до сравнения условий','clarify']];}
else if(kind==='production'){detail='ПРОИЗВОДСТВЕННАЯ СВОДКА\n'+t+'\n\nТребуется сопоставить план и фактическую добычу, действующий фонд, простои, обводнённость и ограничения оборудования. Ответственность определяется после выяснения причин отклонений и проверки принятых решений.';options=[['Назначить производственный разбор','Запросить данные ГУ и ЦДНГ','investigate'],['Выделить средства на диагностику фонда','Предварительные затраты 8 млн ₸','diagnose'],['Запросить уточнение показателей','Оставить событие открытым','clarify']];}
else{detail='ИНФОРМАЦИОННОЕ СООБЩЕНИЕ\n'+t+'\n\nСообщение зарегистрировано во входящих. Перед исполнением поручения следует определить ответственного, необходимые документы и ожидаемый результат.';options=[['Принять к сведению','Закрыть информационное сообщение','ack'],['Направить на проверку','Создать поручение ответственному подразделению','investigate'],['Запросить подробности','Оставить сообщение на рассмотрении','clarify']];}
return {detail:detail.replace(/\\n/g,'\n'),options};}
function v14Badge(item){let labels={new:'Новое',read:'Прочитано',pending:'На рассмотрении',done:'Выполнено',rejected:'Отклонено'};return '<span class="v14badge '+(item.status==='new'?'new':item.status==='done'?'done':'wait')+'">'+(labels[item.status]||item.status)+'</span>'}
function v11inbox(){let db=v14Sync(),a=db.items;let newCount=a.filter(x=>x.status==='new').length,pending=a.filter(x=>['new','read','pending'].includes(x.status)).length;let h='<h2>✉ Входящие директора</h2><p class="muted">События и решения сохраняются в карьере. Прочитанное письмо не считается выполненным.</p><div class="v14tools"><button class="'+(v14Filter==='active'?'on':'')+'" data-v14-filter="active">Требуют внимания ('+pending+')</button><button class="'+(v14Filter==='all'?'on':'')+'" data-v14-filter="all">Все ('+a.length+')</button><button class="'+(v14Filter==='done'?'on':'')+'" data-v14-filter="done">Архив</button><span class="v14filtercount">Новых: '+newCount+'</span></div>';
let selected=a.find(x=>x.id===v14Selected);if(selected){let sc=v14Scenario(selected);h+='<button class="v14back" data-v14-close="1">← Вернуться к письмам</button><div class="v14case"><div class="v14lettertop"><h2>Дело №'+esc(selected.id.slice(-8))+'</h2>'+v14Badge(selected)+'</div><div class="v14meta">Получено: '+esc(selected.created)+' · '+esc(selected.category)+'</div><h3>'+esc(selected.text)+'</h3><div class="v14detail">'+esc(sc.detail)+'</div></div>';if(selected.choice){h+='<div class="v14outcome"><b>Решение принято</b><p>'+esc(selected.outcome)+'</p><small>Повторное исполнение заблокировано. Запись сохранена в истории карьеры.</small></div>'}else{h+='<h3>Варианты управленческого решения</h3><div class="v14choices">'+sc.options.map((o,i)=>'<button data-v14-choice="'+i+'"><b>'+esc(o[0])+'</b><small>'+esc(o[1])+'</small></button>').join('')+'</div><button class="mini-btn" data-v14-pending="1">Отложить решение</button>'}return h;}
let shown=a.filter(x=>v14Filter==='all'||(v14Filter==='done'?['done','rejected'].includes(x.status):!['done','rejected'].includes(x.status)));h+=shown.length?shown.map(x=>'<article class="v14letter '+(x.status==='new'?'unread':x.status==='done'?'done':'')+'"><div class="v14lettertop"><div><div class="v14meta">'+esc(x.created)+' · '+esc(x.category)+'</div><h3>'+esc(x.text)+'</h3></div>'+v14Badge(x)+'</div><p class="muted">'+(x.choice?'Решение зафиксировано.':'Откройте полное описание, причины и варианты действий.')+'</p><button data-v14-open="'+esc(x.id)+'">'+(x.choice?'История решения':'Открыть дело →')+'</button></article>').join(''):'<div class="notice">В выбранном разделе писем нет.</div>';return h}
async function v14Choose(i){let item=v14Sync().items.find(x=>x.id===v14Selected);if(!item||item.choice)return;let opt=v14Scenario(item).options[i];if(!opt)return;let cost={repair:42,diagnose:8,fund:12}[opt[2]]||0;if(cost>s.cash)return uiAlert('Недостаточно средств: требуется '+m(cost));if(!await uiConfirm('Подтвердить решение?\n\n'+opt[0]+'\n'+opt[1]+(cost?'\nРасход: '+m(cost):'')+'\n\nПовторно выполнить это решение нельзя.'))return;
if(item.choice)return;let outcome='Дата: '+v8date()+'. '+opt[0]+'. '+opt[1]+'.';if(cost){s.cash-=cost;outcome+=' Списано '+m(cost)+'.'}if(opt[2]==='repair'){s.condition=cl(s.condition+2,0,100);outcome+=' Выполнены первоочередные восстановительные мероприятия; полный ремонт и расследование требуют отдельного контроля.'}if(opt[2]==='coaching'){s.v8.morale=cl(s.v8.morale+1,0,100)}if(opt[2]==='clarify'){item.status='pending';item.readAt||=v8date();item.outcome='Запрошены дополнительные сведения. Решение пока не принято.';s.v11.actions.unshift(v8date()+': запрос сведений по '+item.text);save();render();return}
item.choice=opt[2];item.status='done';item.outcome=outcome;item.resolvedAt=v8date();s.v11.actions.unshift(outcome+' Источник: '+item.text);s.events.unshift('Решение директора: '+opt[0]+' — '+item.text);s.events=s.events.slice(0,60);save();render()}
function v14Bind(){document.querySelectorAll('[data-v14-filter]').forEach(b=>b.onclick=()=>{v14Filter=b.dataset.v14Filter;v14Selected=null;render()});document.querySelectorAll('[data-v14-open]').forEach(b=>b.onclick=()=>{v14Selected=b.dataset.v14Open;let x=v14Sync().items.find(q=>q.id===v14Selected);if(x&&x.status==='new'){x.status='read';x.readAt=v8date();save()}render()});document.querySelectorAll('[data-v14-close]').forEach(b=>b.onclick=()=>{v14Selected=null;render()});document.querySelectorAll('[data-v14-choice]').forEach(b=>b.onclick=()=>v14Choose(+b.dataset.v14Choice));document.querySelectorAll('[data-v14-pending]').forEach(b=>b.onclick=()=>{let x=v14Sync().items.find(q=>q.id===v14Selected);if(x&&!x.choice){x.status='pending';save();v14Selected=null;render()}})}
function v11marketView(){let v=v8init(),z=v11init();return '<h2>Мировой рынок нефти</h2><div class="v8grid"><div class="v8tile"><small>Brent · USD/барр.</small><strong>$'+f(s.oil)+'</strong></div><div class="v8tile"><small>USD/KZT</small><strong>'+f(s.usd)+' ₸</strong></div><div class="v8tile"><small>Год</small><strong>'+v.year+'</strong></div></div><div class="notice">Игровой рынок меняется автоматически каждый день. Исторические годовые ориентиры 2022–2025 использованы для сценарной модели; ежедневные значения являются симуляцией, а не точными биржевыми котировками.</div><h3>Финансовое влияние</h3>'+row('Условная выручка за сутки',m(v8dailyProduction()*7.3*s.oil*s.usd/1e6*.79))}
function v11bind(){v11sidebar();document.querySelectorAll('[data-v11-tab]').forEach(b=>b.onclick=()=>{tab=b.dataset.v11Tab;v11focus=null;v11beep();render()});document.querySelectorAll('[data-v11-step]').forEach(b=>b.onclick=()=>v11step(b.dataset.v11Step==='month'||b.dataset.v11Step==='year'?b.dataset.v11Step:+b.dataset.v11Step));document.querySelectorAll('[data-v11-sound]').forEach(b=>{b.textContent=v11sound?'🔊 Звук: вкл.':'🔇 Звук: выкл.';b.onclick=()=>{v11sound=!v11sound;render()}});document.querySelectorAll('[data-v11-open]').forEach(b=>b.onclick=()=>{v11focus=+b.dataset.v11Open;v11beep();render()});document.querySelectorAll('[data-v11-leader]').forEach(b=>b.onclick=()=>{v11focus=b.dataset.v11Leader;v11beep();render()});document.querySelectorAll('[data-v11-person]').forEach(b=>b.onclick=()=>v11personAction(+b.dataset.v11Person,b.dataset.v11Act));document.querySelectorAll('[data-v11-leaderact]').forEach(b=>b.onclick=()=>v11leaderAction(b.dataset.v11Leaderact));document.querySelectorAll('[data-v11-hire]').forEach(b=>b.onclick=()=>v11hire(+b.dataset.v11Hire))}
async function v11personAction(id,act){let z=v11init(),p=z.employees.find(x=>x.id===id);if(!p)return;let costs={bonus:p.salary/1e6,train:2,raise:0,dismiss:0};if(s.cash<costs[act])return uiAlert('Недостаточно средств');if(act==='dismiss'){let reason=await uiPrompt('Основание для начала кадровой процедуры (не является автоматическим увольнением):');if(!reason?.trim())return;z.actions.unshift(v8date()+': инициирована проверка кадрового основания по '+p.name+': '+reason);z.inbox.unshift('Кадровая служба: проверить основания и документы для решения по '+p.name);uiAlert('Создано кадровое поручение. Увольнение не выполнено автоматически.')}else if(act==='raise'){p.salary=Math.round(p.salary*1.05);z.actions.unshift('Повышен оклад '+p.name+' до '+f(p.salary)+' ₸')}else{s.cash-=costs[act];if(act==='train')p.skills=cl(p.skills+4,0,100);if(act==='bonus')s.v8.morale=cl(s.v8.morale+1,0,100);z.actions.unshift((act==='train'?'Обучение: ':'Премия: ')+p.name)}v11beep('success');save();render()}
async function v11leaderAction(act){let p=[...s.v8.rankCity,...s.v8.rankField].find(x=>x.name===v11focus);if(!p)return;let cost=act==='bonus'?2:act==='train'?1:0;if(s.cash<cost)return uiAlert('Недостаточно средств');if(act==='dismiss'){let reason=await uiPrompt('Причина инициирования процедуры (не автоматическое увольнение):');if(!reason?.trim())return;s.v11.inbox.unshift('Кадровое поручение: проверить основания по '+p.name+' — '+reason)}else if(act==='plan'){let reason=await uiPrompt('План улучшений для '+p.name+':');if(!reason?.trim())return;s.v11.inbox.unshift('План улучшений: '+p.name+' — '+reason)}else{s.cash-=cost;p.score=cl(p.score+(act==='train'?3:1),0,100)}s.v11.actions.unshift(v8date()+': '+act+' · '+p.name);v11beep('success');save();render()}
async function v11hire(i){let list=[['Арман Серикович Байжанов','М',1991,11,87,84,740000,'Умеет организовать ремонт','Ограниченный опыт управления'],['Тимур Ермекович Абилов','М',1984,18,94,69,920000,'Большой опыт в добыче','Конфликтность'],['Асель Маратовна Сейтова','Ж',1997,5,77,95,580000,'Внимательность и обучаемость','Небольшой стаж']];let x=list[i],z=v11init();if(z.employees.some(p=>p.name===x[0]&&p.status==='Работает'))return uiAlert('Кандидат уже принят');let job=await uiPrompt('Должность для кандидата '+x[0]+':','Инженер');if(!job?.trim())return;if(!await uiConfirm('Принять '+x[0]+' на должность '+job+' с окладом '+f(x[6])+' ₸?'))return;z.employees.push({id:Date.now(),name:x[0],sex:x[1],birth:x[2],experience:x[3],skills:x[4],discipline:x[5],leadership:65,salary:x[6],strong:x[7],weak:x[8],job:job.trim(),status:'Работает'});z.inbox.unshift('Принят сотрудник '+x[0]+' · '+job);save();v11beep('success');render()}


function v13Dialog(message,mode='alert',defaultValue=''){
 return new Promise(resolve=>{let host=$('v13modalhost');host.innerHTML='<div class="v13overlay" role="presentation"><div class="v13dialog" role="dialog" aria-modal="true"><h2>'+({alert:'Уведомление',confirm:'Подтверждение действия',prompt:'Укажите основание или значение'}[mode])+'</h2><p id="v13message"></p>'+(mode==='prompt'?'<input id="v13input" autocomplete="off">':'')+'<div class="actions">'+(mode==='alert'?'':'<button class="btn secondary" id="v13cancel">Отмена</button>')+'<button class="btn" id="v13ok">'+(mode==='alert'?'Понятно':'Подтвердить')+'</button></div></div></div>';
 $('v13message').textContent=message;let inp=$('v13input');if(inp){inp.value=String(defaultValue??'');inp.focus();inp.select()};let done=v=>{host.innerHTML='';resolve(v)};$('v13ok').onclick=()=>done(mode==='prompt'?inp.value:true);let cancel=$('v13cancel');if(cancel)cancel.onclick=()=>done(mode==='prompt'?null:false);host.querySelector('.v13overlay').onclick=e=>{if(e.target.classList.contains('v13overlay'))done(mode==='prompt'?null:false)};host.onkeydown=e=>{if(e.key==='Escape')done(mode==='prompt'?null:false);if(e.key==='Enter'){e.preventDefault();$('v13ok')?.click()}};
 });
}
const uiAlert=msg=>v13Dialog(msg,'alert'),uiConfirm=msg=>v13Dialog(msg,'confirm'),uiPrompt=(msg,def='')=>v13Dialog(msg,'prompt',def);
function v13Bar(){if(!s)return '';let a=v13PumpStats(),on=a.installed;let v=s.v8;let progress=v?cl(v.monthActual/Math.max(1,v8plan())*100,0,150):0;let readiness=s.assets.wellList.length?s.assets.wellList.reduce((q,w)=>q+w.health,0)/s.assets.wellList.length:0;let cls=(n,reverse=false)=>reverse?(n<35?'v13green':n<65?'v13yellow':'v13red'):(n>=95?'v13green':n>=75?'v13yellow':'v13red');let meter=(n,c)=>'<div class="v13meter"><i class="'+c+'" style="width:'+cl(n,0,100)+'%"></i></div>';return '<div class="v13bar"><button data-v13-go="overview">⌂ Главная</button><button data-v13-back="1">← Назад</button><input id="v13search" placeholder="Поиск: № скважины, ГУ, раздел…" aria-label="Поиск по игре"><button data-v13-go="inbox">✉ Входящие</button><button data-v13-go="assetsTree">ГУ / Скважины</button><button data-v13-go="equipment">Оборудование</button><div id="v13results" class="v13results hide"></div></div><div class="v13metrics"><div class="v13metric"><small>План добычи за месяц</small><strong>'+f(progress)+'%</strong>'+meter(progress,cls(progress))+'</div><div class="v13metric"><small>Техническая готовность</small><strong>'+f(readiness)+'%</strong>'+meter(readiness,cls(readiness))+'</div><div class="v13metric"><small>Скважины / станки-качалки</small><strong>'+a.total+' / '+on+'</strong>'+meter(on/Math.max(1,a.total)*100,'v13green')+'</div><div class="v13metric"><small>Индекс безопасности</small><strong>'+f(s.safety)+'%</strong>'+meter(s.safety,cls(s.safety))+'</div></div>'}
let v13History=[];
function v13Go(t,well){if(tab!==t)v13History.push({tab,treeShop,treeUnit,treeWell});tab=t;if(well){ensureTree();let w=s.assets.wellList.find(x=>x.id===Number(well));if(w){treeShop=w.shop;treeUnit=w.unit;treeWell=w.id}}render()}
function v13Bind(){document.querySelectorAll('[data-v13-go]').forEach(b=>b.onclick=()=>v13Go(b.dataset.v13Go));document.querySelectorAll('[data-v13-back]').forEach(b=>b.onclick=()=>{let old=v13History.pop();if(old){tab=old.tab;treeShop=old.treeShop;treeUnit=old.treeUnit;treeWell=old.treeWell;render()}});document.querySelectorAll('[data-v13-page]').forEach(b=>b.onclick=()=>{v13Page=Math.max(0,v13Page+(b.dataset.v13Page==='next'?1:-1));render()});let search=$('v13search'),res=$('v13results');if(search)search.oninput=()=>{let q=search.value.trim().toLowerCase();if(!q){res.classList.add('hide');return}let a=[];for(let w of s.assets.wellList){if(String(w.id).includes(q)||w.unit.toLowerCase().includes(q)){a.push({label:'Скважина №'+w.id+' · '+w.unit,tab:'assetsTree',well:w.id});if(a.length>=12)break}}for(let [id,ico,label] of V11_MENU){if(label.toLowerCase().includes(q))a.push({label,tab:id})}res.innerHTML=a.slice(0,15).map((x,i)=>'<button data-v13-result="'+i+'">'+esc(x.label)+'</button>').join('')||'<p class="muted">Совпадений нет</p>';res.classList.remove('hide');res.querySelectorAll('[data-v13-result]').forEach(b=>b.onclick=()=>v13Go(a[+b.dataset.v13Result].tab,a[+b.dataset.v13Result].well))};}


/* v1.9: phased well construction, commissioning, conservation and abandonment */
function v19init(){if(!s.v19)s.v19={seq:0,projects:[],retired:[],journal:[]};return s.v19}
function v19notify(msg){let p=v19init();p.journal.unshift(v8date()+' · '+msg);p.journal=p.journal.slice(0,80);log(msg);if(s.v8){s.v8.notifications.unshift(msg);s.v8.notifications=s.v8.notifications.slice(0,100)}}

/* v2.1: Integrated production flow — fictional educational parameters. */
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
 if(!await uiConfirm((kind==='upgrade'?'Модернизация':'Ремонт')+' '+id+': '+m(cost)+', '+days+' игровых дней?'))return;
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
 return '<h2>Производственная цепочка · единая модель</h2><p class="muted">Скважины → ГУ → ДНС → ЦППН; электроснабжение и ППД ограничивают итоговую добычу. Значения являются игровыми, не проектными характеристиками реальных объектов.</p>'+
 '<div class="v8grid">'+[['Товарная нефть, т/сут',f(calc.oil)],['Жидкость, м³/сут',f(calc.liquid)],['Добывающих в работе',calc.wellCount],['Нагнетательных в работе',calc.injectors],['Обеспеченность ППД',f(calc.support*100)+'%'],['Макс. загрузка',f(calc.maxLoad*100)+'%']].map(x=>'<div class="v8tile"><small>'+x[0]+'</small><strong>'+x[1]+'</strong></div>').join('')+'</div>'+
 '<div class="notice">'+(bottlenecks.length?'Ограничения / риск перегрузки: '+esc(bottlenecks.join(', ')):'Критических ограничений мощностей не выявлено')+'</div>'+
 '<h3>Объекты цепочки и решения директора</h3><div class="asset-grid">'+rows+'</div>'+
 '<h3>Инвестиционные проекты и ремонты</h3><div class="table-scroll"><table class="well-table"><thead><tr><th>Объект</th><th>Работы</th><th>Затраты</th><th>Срок</th><th>Статус</th></tr></thead><tbody>'+d.projects.slice(-25).reverse().map(x=>'<tr><td>'+esc(x.node)+'</td><td>'+(x.kind==='upgrade'?'Расширение':'Ремонт')+'</td><td>'+m(x.cost)+'</td><td>'+x.days+' дн.</td><td>'+esc(x.status)+'</td></tr>').join('')+'</tbody></table></div>'+
 '<h3>Анализ потерь и производственные рекомендации</h3>'+row('Ограничение на ГУ, усл. м³/сут',f(calc.losses.gu))+row('Ограничение ДНС, усл. м³/сут',f(calc.losses.dns))+row('Ограничение ЦППН, усл. т/сут',f(calc.losses.plant))+row('Ограничение электроснабжения, усл. кВт',f(calc.losses.power))+row('Дефицит закачки ППД, усл. м³/сут',f(calc.losses.ppd))+
 '<div class="notice">Потери в разных единицах нельзя складывать. Модель применяет ограничения последовательно к каждой скважине. Расходы на проекты списываются один раз при утверждении; изменения мощностей вступают в силу после завершения работ.</div>';
}
function v21bind(){document.querySelectorAll('[data-v21-node]').forEach(b=>b.onclick=()=>v21action(b.dataset.v21Node,b.dataset.v21Kind))}

function v20init(){
 let p=v19init();
 if(!p.network)p.network={};
 ensureAssets();
 const groups=[...new Set(s.assets.wellList.map(w=>w.unit||'ГУ-1'))];
 for(const gu of groups){
   let count=s.assets.wellList.filter(w=>(w.unit||'ГУ-1')===gu).length;
   if(!p.network[gu])p.network[gu]={capacity:count+3,fluidCapacity:Math.max(100,Math.ceil(count*25*1.25)),powerCapacity:Math.max(100,Math.ceil(count*12*1.25)),health:85,upgrade:null};
 }
 return p.network;
}
function v20load(gu){
 const a=s.assets.wellList.filter(w=>(w.unit||'ГУ-1')===gu && w.status==='Работает');
 return {slots:s.assets.wellList.filter(w=>(w.unit||'ГУ-1')===gu).length,
 fluid:Math.round(a.reduce((n,w)=>n+(w.wellKind==='Нагнетательная'?0:(w.rate||0)/(1-Math.min(95,w.water||0)/100)),0)),
 power:Math.round(a.reduce((n,w)=>n+(w.equipment?.type==='ЭЦН'?18:w.wellKind==='Нагнетательная'?15:8),0))};
}
function v20canCommission(gu,kind,method,rate,water){
 let n=v20init()[gu];if(!n)return {ok:false,reason:'ГУ не найден'};
 let a=v20load(gu),f=kind==='Нагнетательная'?0:Math.ceil(rate/(1-Math.min(95,water)/100)),power=kind==='Нагнетательная'?15:method==='ЭЦН'?18:8;
 let issues=[];
 if(a.slots+1>n.capacity)issues.push('лимит подключений '+a.slots+'/'+n.capacity);
 if(a.fluid+f>n.fluidCapacity)issues.push('пропускная способность '+a.fluid+'/'+n.fluidCapacity+' м³/сут');
 if(a.power+power>n.powerCapacity)issues.push('электроснабжение '+a.power+'/'+n.powerCapacity+' кВт');
 return {ok:!issues.length,reason:issues.join('; ')};
}
async function v20act(gu){
 let n=v20init()[gu];if(!n)return;
 if(n.upgrade)return uiAlert('На '+gu+' модернизация уже выполняется');
 if(s.cash<180)return uiAlert('Недостаточно средств: требуется 180 млн ₸');
 if(!await uiConfirm('Модернизировать '+gu+'? Стоимость 180 млн ₸, срок 30 игровых дней. Дополнительно 12 подключений, 350 м³/сут и 200 кВт.'))return;
 s.cash-=180;n.upgrade={remaining:30,cost:180};
 v19notify('Начата модернизация '+gu+' — 180 млн ₸, 30 дней');
 save();render();
}
function v20day(){
 let network=v20init();
 for(const [gu,n] of Object.entries(network)){
  if(!n.upgrade)continue;
  n.upgrade.remaining--;
  if(n.upgrade.remaining<=0){
   n.capacity+=12;n.fluidCapacity+=350;n.powerCapacity+=200;n.health=Math.min(100,n.health+8);n.upgrade=null;
   v19notify('Завершена модернизация '+gu+': увеличена мощность и число подключений');
  }
 }
}
function v20view(){
 let net=v20init(),out='<h3>Инфраструктура ГУ · пропускная способность</h3><p class="muted">Условные игровые мощности. Строительство скважин ограничено свободными подключениями, пропускной способностью жидкости и электроснабжением. Модернизация занимает 30 дней.</p><div class="asset-grid">';
 for(const [gu,n] of Object.entries(net)){
  let a=v20load(gu),pct=Math.max(a.slots/n.capacity,a.fluid/n.fluidCapacity,a.power/n.powerCapacity)*100;
  out+='<div class="asset"><b>'+esc(gu)+'</b><div class="row"><span class="muted">Подключения</span><b>'+a.slots+' / '+n.capacity+'</b></div><div class="row"><span class="muted">Жидкость, м³/сут</span><b>'+a.fluid+' / '+n.fluidCapacity+'</b></div><div class="row"><span class="muted">Мощность, кВт</span><b>'+a.power+' / '+n.powerCapacity+'</b></div><div class="meter"><i style="width:'+cl(pct,0,100)+'%;background:'+(pct>95?'#e75b59':pct>80?'#e4a53b':'#35b884')+'"></i></div><small>Максимальная загрузка '+Math.round(pct)+'%</small><p>'+(n.upgrade?'Модернизация: осталось '+n.upgrade.remaining+' дн.':'<button class="mini-btn" data-v20-gu="'+esc(gu)+'">Расширить · 180 млн ₸</button>')+'</p></div>';
 }
 return out+'</div>';
}
function v19unit(w){return w.unit||'ГУ-1'}
function v19view(){ensureTree();let p=v19init(),all=s.assets.wellList,oper=all.filter(w=>w.status==='Работает').length,stopped=all.filter(w=>w.status!=='Работает').length,projects=p.projects.filter(x=>!['Введена','Отменён','Неуспешна'].includes(x.status));let gu=[...new Set(all.map(v19unit))].sort((a,b)=>Number(a.slice(3))-Number(b.slice(3)));if(!gu.length)gu=['ГУ-1'];let h='<h2>Фонд скважин и ввод новых объектов</h2><p class="muted">Строительство скважины проходит стадии: геология → согласование проекта → бурение → испытание → ввод. Денежные затраты, сроки и геологический риск моделируются поэтапно.</p><div class="dispatch-kpis"><div><small>Всего на балансе</small><strong>'+all.length+'</strong></div><div><small>Добывающие в работе</small><strong>'+oper+'</strong></div><div><small>Не работают</small><strong>'+stopped+'</strong></div><div><small>Строятся</small><strong>'+projects.length+'</strong></div></div>';
h+='<div class="card"><h3>Инициировать проект новой скважины</h3><p class="muted">Сначала проводится оценка и подготовка. Ввод возможен только после прохождения всех этапов. Все суммы — игровые оценки в млн ₸.</p><div class="fields"><label>Размещение на ГУ<select id="v19gu">'+gu.map(g=>'<option value="'+esc(g)+'">'+esc(g)+'</option>').join('')+'</select></label><label>Тип скважины<select id="v19kind"><option value="Добывающая">Добывающая</option><option value="Нагнетательная">Нагнетательная</option></select></label><label>Способ эксплуатации<select id="v19method"><option value="Станок-качалка">Станок-качалка</option><option value="ЭЦН">ЭЦН</option><option value="Фонтанная">Фонтанная</option></select></label></div><button class="btn secondary" data-v19="create">Начать проект · геология 45 млн ₸</button></div>';
h+=v20view();h+='<h3>Проекты и этапы согласования</h3>'+(p.projects.length?p.projects.slice().reverse().map(x=>'<div class="card"><b>Проект №'+x.id+' · '+esc(x.kind)+' · '+esc(x.gu)+'</b><div class="row"><span class="muted">Этап</span><b>'+esc(x.status)+'</b></div><div class="row"><span class="muted">Финансирование</span><b>'+f(x.spent)+' млн ₸</b></div><div class="row"><span class="muted">Прогресс</span><b>'+x.progress+' / '+x.duration+' игровых дней</b></div><div class="meter"><i style="width:'+cl(x.progress/Math.max(1,x.duration)*100,0,100)+'%"></i></div><p class="muted">'+esc(x.note||'Ожидается завершение этапа')+'</p>'+(x.status==='Ожидает решения'?'<button class="mini-btn" data-v19="approve" data-id="'+x.id+'">'+esc(x.nextLabel||'Продолжить')+'</button> <button class="mini-btn" data-v19="cancel" data-id="'+x.id+'">Отменить проект</button>':'')+'</div>').join(''):'<p class="muted">Пока нет проектов.</p>');
h+='<h3>Управление действующим фондом</h3><p class="muted">Консервация сохраняет скважину на балансе, но прекращает добычу. Ликвидация — отдельный проект с проверкой оснований и затратами. Простое изменение численности скважин вручную исключено.</p><div class="fields"><label>Скважина<select id="v19well">'+all.map(w=>'<option value="'+w.id+'">№'+w.id+' · '+esc(w.unit)+' · '+esc(w.status)+'</option>').join('')+'</select></label></div><div class="actions"><button class="mini-btn" data-v19="conserve">Консервировать</button><button class="mini-btn" data-v19="resume">Возобновить эксплуатацию</button><button class="mini-btn" data-v19="abandon">Ликвидировать · 90 млн ₸</button></div>';
h+='<h3>История изменения фонда</h3>'+(p.journal.length?p.journal.slice(0,15).map(t=>'<div class="row">'+esc(t)+'</div>').join(''):'<p class="muted">Пока нет записей.</p>');return h}
async function v19act(action,id){let p=v19init();ensureTree();if(action==='create'){if(s.cash<45)return uiAlert('Недостаточно средств на геологическую оценку');let gu=document.getElementById('v19gu')?.value,kind=document.getElementById('v19kind')?.value,method=document.getElementById('v19method')?.value;if(!gu||!kind||!method)return;if(!await uiConfirm('Начать проект '+kind.toLowerCase()+' скважины на '+gu+'? Геологическая оценка: 45 млн ₸, срок 14 дней.'))return;s.cash-=45;let x={id:++p.seq,gu,kind,method,status:'Геологическая оценка',progress:0,duration:14,spent:45,note:'Изучение геологических данных и перспективности бурения'};p.projects.push(x);v19notify('Открыт проект №'+x.id+' ('+gu+'), геологическая оценка');}
else if(['approve','cancel'].includes(action)){let x=p.projects.find(x=>x.id===Number(id));if(!x||x.status!=='Ожидает решения')return;if(action==='cancel'){if(!await uiConfirm('Закрыть проект №'+x.id+'? Ранее понесённые расходы не возвращаются.'))return;x.status='Отменён';v19notify('Проект №'+x.id+' отменён');}else{let stage=x.stage;if(stage==='design'){if(s.cash<120)return uiAlert('Недостаточно средств: требуется 120 млн ₸');if(!await uiConfirm('Утвердить проектирование скважины №'+x.id+'? 120 млн ₸, 25 дней.'))return;s.cash-=120;x.spent+=120;x.status='Проектирование и согласование';x.progress=0;x.duration=25;}else if(stage==='drill'){if(s.cash<650)return uiAlert('Недостаточно средств: требуется 650 млн ₸');if(!await uiConfirm('Начать бурение по проекту №'+x.id+'? 650 млн ₸, 65 дней. Возможен геологический неуспех.'))return;s.cash-=650;x.spent+=650;x.status='Бурение';x.progress=0;x.duration=65;}else if(stage==='test'){if(s.cash<85)return uiAlert('Недостаточно средств: требуется 85 млн ₸');if(!await uiConfirm('Начать испытание и освоение? 85 млн ₸, 18 дней.'))return;s.cash-=85;x.spent+=85;x.status='Испытание';x.progress=0;x.duration=18;}else if(stage==='commission'){if(s.cash<75)return uiAlert('Недостаточно средств: требуется 75 млн ₸');if(!await uiConfirm('Ввести скважину в эксплуатацию после испытаний? 75 млн ₸, 7 дней.'))return;s.cash-=75;x.spent+=75;x.status='Подготовка к вводу';x.progress=0;x.duration=7;}else return;v19notify('Проект №'+x.id+': '+x.status);}}
else{let w=s.assets.wellList.find(x=>x.id===Number(document.getElementById('v19well')?.value));if(!w)return uiAlert('Скважина не выбрана');if(action==='conserve'){if(w.status!=='Работает')return uiAlert('Консервация доступна только для работающей скважины');if(!await uiConfirm('Законсервировать скважину №'+w.id+'? Добыча прекратится, объект останется на балансе.'))return;w.status='Консервация';v19notify('Скважина №'+w.id+' переведена в консервацию');}else if(action==='resume'){if(w.status!=='Консервация')return uiAlert('Возобновление доступно только для законсервированной скважины');if(w.health<45)return uiAlert('Техническое состояние ниже допустимого игрового порога. Сначала требуется ремонт.');if(!await uiConfirm('Возобновить эксплуатацию скважины №'+w.id+' после проверки готовности?'))return;w.status='Работает';v19notify('Возобновлена эксплуатация скважины №'+w.id);}else if(action==='abandon'){if(w.status==='Работает')return uiAlert('Сначала остановите и законсервируйте скважину');if(s.cash<90)return uiAlert('Недостаточно средств на ликвидацию');if(!await uiConfirm('Ликвидировать скважину №'+w.id+'? Стоимость 90 млн ₸. Действие необратимо и изменит фонд скважин.'))return;s.cash-=90;p.retired.push({...w,retiredAt:v8date()});s.assets.wellList=s.assets.wellList.filter(x=>x.id!==w.id);s.wells=s.assets.wellList.length;v19notify('Ликвидирована скважина №'+w.id+', затраты 90 млн ₸');}}
save();render()}
function v19day(){v26day();v21day();v20day();let p=v19init();for(let x of p.projects){if(x.status==='Ожидает инфраструктуру'){x.status='Подготовка к вводу';x.progress=x.duration; }if(['Ожидает решения','Введена','Отменён','Неуспешна'].includes(x.status))continue;x.progress++;if(x.progress<x.duration)continue;if(x.status==='Геологическая оценка'){x.stage='design';x.status='Ожидает решения';x.nextLabel='Утвердить проектирование · 120 млн ₸';x.note='Геологическая оценка подготовлена. Требуется решение по проектированию.';}else if(x.status==='Проектирование и согласование'){x.stage='drill';x.status='Ожидает решения';x.nextLabel='Начать бурение · 650 млн ₸';x.note='Проектная документация подготовлена в рамках игровой модели.';}else if(x.status==='Бурение'){if(Math.random()<.12){x.status='Неуспешна';x.note='Испытания не подтвердили промышленную продуктивность; затраты понесены.';v19notify('Проект №'+x.id+': бурение оказалось непродуктивным');continue}x.stage='test';x.status='Ожидает решения';x.nextLabel='Провести испытание · 85 млн ₸';x.note='Бурение завершено. Нужны испытание и освоение.';}else if(x.status==='Испытание'){x.stage='commission';x.status='Ожидает решения';x.nextLabel='Подготовить ввод · 75 млн ₸';x.note='Испытания завершены. Требуется подготовка к вводу.';}else if(x.status==='Подготовка к вводу'){ensureAssets();let a=s.assets.wellList;let id=Math.max(1000,...a.map(w=>w.id),...p.retired.map(w=>w.id))+1;let sample=a.find(w=>w.unit===x.gu);let shop=sample?.shop??0;let w={id,unit:x.gu,shop,status:'Работает',rate:x.kind==='Нагнетательная'?0:Math.round((8+Math.random()*13)*10)/10,water:Math.round(15+Math.random()*35),health:96,wellKind:x.kind,equipment:{type:x.kind==='Нагнетательная'?'Нагнетательный насос':x.method,serial:'SIM-'+id,age:0,life:12,condition:96,maintenance:0}};let check=v20canCommission(x.gu,x.kind,x.method,w.rate,w.water);
 if(!check.ok){x.status='Ожидает инфраструктуру';x.note='Ввод приостановлен: '+check.reason+'. Расширьте мощность ГУ.';v19notify('Проект №'+x.id+': ввод отложен — '+check.reason);continue;}
 a.push(w);s.wells=a.length;x.status='Введена';x.wellId=id;x.note='Скважина №'+id+' введена в фонд '+x.gu;v19notify('Введена новая '+x.kind.toLowerCase()+' скважина №'+id+' на '+x.gu);}if(x.status==='Ожидает решения')v19notify('Проект №'+x.id+': завершён этап, требуется решение руководителя');}}
function v19bind(){document.querySelectorAll('[data-v19]').forEach(b=>b.onclick=()=>v19act(b.dataset.v19,b.dataset.id));document.querySelectorAll('[data-v20-gu]').forEach(b=>b.onclick=()=>v20act(b.dataset.v20Gu))}

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
function render() {normalizeFiction();v8init();v11init();v11market();ensureTree();ensureOperations();ensurePlant();ensureAssets();ensureEnterprise();$('title').textContent=s.name;$('where').textContent=s.region+' · '+s.field;$('period').textContent=v8date()+' · '+s.wells+' скважин';$('v22weather').innerHTML=v22weatherHtml();$('stats').innerHTML=stat('Денежные средства',m(s.cash))+stat('Добыча прошлого месяца',f(s.volume)+' т')+stat('Прибыль / месяц',m(s.profit))+stat('Нефть', '$'+f(s.oil)+'/барр.');$('next').disabled=s.dead;document.querySelectorAll('[data-tab]').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));let h='';if(tab==='daily')h=v8dailyView();if(tab==='inbox')h=v11inbox();if(tab==='career')h=v11career();if(tab==='market')h=v11marketView();if(tab==='people')h=v11rank();if(tab==='people')h=v8peopleView();if(tab==='incidents')h=v8incidentsView();if(tab==='dispatch')h=v21view()+dispatchView()+v26view();if(tab==='assetsTree')h=treeView();if(tab==='workshops')h=opsView();if(tab==='decisions')h=decisionsView();if(['plan','contracts','ecology','org'].includes(tab))h=enterpriseView();if(tab==='staff')h=hrView();if(tab==='warehouse')h=warehouseView();if(tab==='equipment')h=equipmentView();if(tab==='overview'){h='<h2>Панель директора</h2>'+row('Скважины',s.wells)+row('Обводнённость',f(s.water)+'%')+row('Состояние оборудования',f(s.condition)+'%')+row('Индекс HSE',f(s.safety)+'%')+'<h2>Добыча за последние 12 месяцев</h2>';let a=s.history.slice(-12),max=Math.max(1,...a.map(x=>x.volume));h+=a.length?'<div class="bars">'+a.map(x=>'<div title="'+f(x.volume)+' тонн" style="height:'+Math.max(2,x.volume/max*100)+'%"></div>').join('')+'</div>':'<p class="muted">Нажми «Следующий день», чтобы получить первый результат.</p>';h+='<div class="notice">'+esc(s.events[0])+'</div>'}if(tab==='field')h='<h2>Месторождение «'+esc(s.field)+'»</h2>'+row('Действующие скважины',s.wells)+row('Потенциальный дебит',f(s.rate)+' т/сут на скважину')+row('Обводнённость',f(s.water)+'%')+row('Техническое состояние',f(s.condition)+'%')+row('Бурение в работе',s.pending.length)+'<p class="muted">Новые скважины создаются через поэтапные проекты ниже. Добыча зависит от всей инфраструктуры.</p><div class="actions">'+btn('repair','Капремонт',180)+btn('service','ТО',80)+btn('survey','Геология',110)+'</div>';if(tab==='field')h+=v19view()+v21view();if(tab==='finance')h=v25view()+'<h2>Финансовый отчёт · последний закрытый месяц</h2>'+row('Выручка',m(s.revenue))+row('Операционные расходы',m(s.expense))+row('Прибыль',m(s.profit))+row('Денежные средства',m(s.cash))+row('USD/KZT',f(s.usd))+'<div class="notice">Расчётная прибыль включает реализацию нефти и основные суточные расходы. Денежный остаток дополнительно учитывает инвестиции, закупки, штрафы и прочие игровые операции. Полный бухгалтерский учёт, налоги и амортизация пока не реализованы.</div>';if(tab==='hse')h='<h2>Безопасность и надёжность</h2>'+row('Индекс HSE',f(s.safety)+'%')+row('Состояние оборудования',f(s.condition)+'%')+'<p class="muted">Износ увеличивает простои, слабая профилактика повышает вероятность инцидентов.</p><div class="actions">'+btn('hse','Профилактика HSE',65)+btn('service','Плановое ТО',80)+'</div>';if(tab==='events')h='<h2>Журнал событий</h2>'+s.events.map(x=>'<div class="row">'+esc(x)+'</div>').join('');if(s.dead)h='<div class="notice bad">Компания неплатёжеспособна. Начни новую карьеру.</div>'+h;$('body').innerHTML=v11hero()+h;$('v13nav').innerHTML=v13Bar();v8bind();v11bind();v13Bind();if(tab==='inbox')v14Bind();if(tab==='field'){v19bind();v21bind();}if(tab==='dispatch')v21bind();if(tab==='staff')hrBind();if(tab==='assetsTree')treeBind();if(tab==='workshops'||tab==='decisions')opsBind();if(tab==='warehouse'||tab==='equipment')assetBind();document.querySelectorAll('[data-enterprise]').forEach(b=>b.onclick=()=>enterpriseAct(b.dataset.enterprise,b.dataset.arg));document.querySelectorAll('[data-action]').forEach(b=>b.onclick=()=>action(b.dataset.action));document.querySelectorAll('[data-well]').forEach(b=>b.onclick=()=>dispatchAction(b.dataset.well,b.dataset.op))}
/* v2.7 — fictional procurement, competitive tenders, contracts and repair crews. */
const V27_SUPPLIERS=[
['Альфа Петролеум Сервис',['drill','krs','prs','pipeline'],82,1.12,3,88],
['Нова Энерджи Групп',['electrical','maint','automation'],88,1.06,4,91],
['Гранд Ремонт Инжиниринг',['prs','krs','rvs_repair','building_repair'],75,.91,2,79],
['Прайм ТехСервис',['maint','automation','electrical','painting'],91,1.16,3,93],
['Орион Ойл Ремонт',['prs','krs','pipeline','rvs_repair'],79,.94,2,85],
['Вектор Велл Солюшнс',['drill','krs','prs'],94,1.28,5,96],
['БурТех Альянс',['drill','krs','earthworks'],83,1.02,4,89],
['ПромИнж Сервис',['building','building_repair','painting','roads','fencing'],77,.92,3,81],
['ЭнергоПрофи Групп',['electrical','maint','automation','lighting'],87,1.08,3,90],
['ЭкоСтандарт Инжиниринг',['env','rvs_clean','painting'],92,1.21,3,94],
['ЭкоКонтроль Плюс',['env','rvs_clean'],80,.87,2,84],
['Эверест Консалтинг',['env','design','survey'],89,1.13,4,90],
['ТехЭксперт Диагностика',['maint','prs','rvs_repair','inspection'],86,1.01,3,88],
['Форвард Филд Сервис',['prs','krs','drill','pipeline'],85,1.07,4,87],
['Спектр Ремонт',['prs','krs','maint','building_repair','painting'],78,.89,2,82],
['ПромМонтаж Альянс',['maint','drill','rvs_build','building','pipeline'],82,.98,3,85],
['ПрофОйл Сервис',['prs','krs','maint','rvs_repair','rvs_clean'],90,1.19,4,93],
['ГеоБур Инжиниринг',['drill','earthworks','roads','survey'],89,1.14,4,91],
['Монолит Проект',['rvs_build','building','building_repair','foundation'],84,1.05,3,88],
['СтальКонструкция Групп',['rvs_build','rvs_repair','pipeline','fencing'],90,1.13,3,92],
['Индустриал Колор',['painting','anticorrosion','rvs_repair'],86,.96,4,87],
['Антикор Профи',['painting','anticorrosion','rvs_clean'],93,1.14,3,94],
['Горизонт Инфрастрой',['roads','earthworks','building','foundation'],83,1.04,4,86],
['Интеграл Автоматика',['automation','electrical','lighting','inspection'],92,1.17,4,94]
];
const V27_TYPES={
prs:{label:'ПРС · текущий ремонт скважины',base:35,days:14,crew:5},
krs:{label:'КРС · капитальный ремонт скважины',base:125,days:35,crew:7},
drill:{label:'Бурение новой скважины',base:950,days:110,crew:12},
maint:{label:'ТО и диагностика оборудования',base:95,days:25,crew:6},
env:{label:'Экологический мониторинг',base:60,days:45,crew:4},
rvs_build:{label:'Строительство резервуара РВС',base:1200,days:150,crew:24,category:'Строительство'},
rvs_repair:{label:'Капитальный ремонт резервуара РВС',base:360,days:65,crew:15,category:'РВС'},
rvs_clean:{label:'Зачистка и очистка РВС',base:95,days:20,crew:9,category:'РВС'},
building:{label:'Строительство производственного здания',base:850,days:180,crew:25,category:'Строительство'},
building_repair:{label:'Ремонт зданий и сооружений',base:180,days:60,crew:12,category:'Строительство'},
painting:{label:'Покраска зданий, сооружений и оборудования',base:65,days:28,crew:8,category:'Покраска'},
anticorrosion:{label:'Антикоррозионная защита и окраска РВС',base:140,days:45,crew:10,category:'Покраска'},
pipeline:{label:'Строительство и ремонт трубопроводов',base:520,days:110,crew:20,category:'Инфраструктура'},
roads:{label:'Строительство и ремонт дорог',base:440,days:95,crew:18,category:'Инфраструктура'},
earthworks:{label:'Земляные работы и планировка',base:95,days:30,crew:9,category:'Строительство'},
foundation:{label:'Фундаменты и бетонные работы',base:175,days:55,crew:13,category:'Строительство'},
electrical:{label:'Электромонтажные работы',base:170,days:48,crew:9,category:'Инфраструктура'},
automation:{label:'КИПиА и автоматизация',base:160,days:42,crew:7,category:'Инфраструктура'},
lighting:{label:'Наружное освещение',base:90,days:32,crew:7,category:'Инфраструктура'},
fencing:{label:'Ограждения и благоустройство',base:105,days:40,crew:9,category:'Строительство'},
design:{label:'Проектно-сметная документация',base:75,days:65,crew:5,category:'Проектирование'},
survey:{label:'Инженерные изыскания',base:65,days:40,crew:6,category:'Проектирование'},
inspection:{label:'Техническое обследование объектов',base:55,days:24,crew:5,category:'Диагностика'}
};
function v27init(){if(!s.v27)s.v27={tenders:[],contracts:[],seq:0,contractSeq:0};let x=s.v27;x.tenders||=[];x.contracts||=[];x.seq||=0;x.contractSeq||=0;return x}
const V28_NAME_MAP=Object.freeze({"КаспийСервис Бурение": "Альфа Петролеум Сервис", "Маңғыстау Мұнай Сервис": "Нова Энерджи Групп", "Ақтау Ремонт Групп": "Гранд Ремонт Инжиниринг", "Қаламқас ТехСервис": "Прайм ТехСервис", "Жетібай Ойл Ремонт": "Орион Ойл Ремонт", "Caspian Well Solutions": "Вектор Велл Солюшнс", "БатысБұрғылау": "БурТех Альянс", "НефтеСтрой Сервис": "ПромИнж Сервис", "Атырау ЭнергоСервис": "ЭнергоПрофи Групп", "Теңіз Экология": "ЭкоСтандарт Инжиниринг", "ЭкоКаспий Контроль": "ЭкоКонтроль Плюс", "Green Step Consulting": "Эверест Консалтинг", "Мұнай ТехДиагностика": "ТехЭксперт Диагностика", "West Field Services": "Форвард Филд Сервис", "Қаражанбас Сервис": "Спектр Ремонт", "Каспий ПромМонтаж": "ПромМонтаж Альянс", "Orda Oil Service": "ПрофОйл Сервис", "Маңғыстау ГеоБұрғылау": "ГеоБур Инжиниринг"});
function v28migrateNames(){
 let d=v27init();if(d.namesV28)return d;
 for(let t of d.tenders)for(let b of (t.bids||[]))if(V27_SUPPLIERS[b.id])b.name=V27_SUPPLIERS[b.id][0];
 for(let c of d.contracts){c.supplier=V28_NAME_MAP[c.supplier]||c.supplier;}
 d.namesV28=true;return d;
}
function v27bids(type,seed){let t=V27_TYPES[type];return V27_SUPPLIERS.map((a,i)=>({id:i,name:a[0],quality:a[2],price:Math.round(t.base*a[3]*(.97+((seed+i*7)%9)*.008)*10)/10,days:Math.max(2,Math.round(t.days*(1.20-a[2]/420)+((seed+i*3)%9)-4)),capacity:a[4],reliability:a[5],crew:t.crew})).filter(b=>V27_SUPPLIERS[b.id][1].includes(type)).sort((a,b)=>a.price-b.price)}
function v27newTender(type,well){
 let d=v28migrateNames(),t=V27_TYPES[type];if(!t)return uiAlert('Неизвестный вид работ');
 if(well){let a=v40assets().find(x=>x.key==='well:'+well);if(!a)return uiAlert('Скважина не найдена');return v40createTender(type,a)}
 v40openPicker(type);
}
function v27award(id,bidId){let d=v28migrateNames(),t=d.tenders.find(x=>x.id===id);if(!t||t.status!=='Приём заявок')return uiAlert('Тендер закрыт');let b=t.bids.find(x=>x.id===bidId);if(!b)return;let active=d.contracts.filter(x=>x.supplier===b.name&&x.status==='Исполняется').length;if(active>=b.capacity)return uiAlert('Бригады подрядчика заняты. Выберите другого исполнителя.');if(s.cash<b.price)return uiAlert('Недостаточно средств для заключения договора: '+m(b.price));if(t.assetKey&&d.contracts.some(c=>c.assetKey===t.assetKey&&c.status==='Исполняется'))return uiAlert('По объекту уже выполняются подрядные работы');
let w=null,materials=[];if(t.well){ensureAssets();w=s.assets.wellList.find(x=>x.id===t.well);if(!w)return uiAlert('Скважина не найдена');if(w.status==='Ремонт'||w.status==='Ремонт подрядчика')return uiAlert('Скважина уже ремонтируется');let stock=ensurePlant().stock;materials=[{id:6,qty:2},{id:7,qty:2},{id:9,qty:1}];let miss=materials.filter(x=>(stock.find(z=>z.id===x.id)?.qty||0)<x.qty);if(miss.length)return uiAlert('Недостаточно материалов на складе: '+miss.map(x=>stock.find(z=>z.id===x.id)?.name||x.id).join(', '));}
let advance=Math.round(b.price*.3*10)/10;
if(!confirm('Заключить договор с «'+b.name+'»?\n\nЦена: '+m(b.price)+'\nСрок: '+b.days+' игровых дней\nБригада: '+b.crew+' чел.\nАванс: '+m(advance)+'\nОстаток: '+m(b.price-advance)+'\n\nОбщая сумма резервируется в момент заключения.'))return;
if(w){let stock=ensurePlant().stock;for(let a of materials){let item=stock.find(z=>z.id===a.id);item.qty-=a.qty;item.consumed=(item.consumed||0)+a.qty;}w.status='Ремонт подрядчика';}
s.cash-=b.price;v25post('maintenance',b.price,{description:'Договор подряда',supplier:b.name,tender:id,well:t.well});
let c={id:++d.contractSeq,tender:id,type:t.type,well:t.well,assetKey:t.assetKey||null,assetHealthBefore:t.assetHealthBefore??null,objectName:t.objectName||'',supplier:b.name,price:b.price,advance,remaining:b.days,initialDays:b.days,quality:b.quality,reliability:b.reliability,crew:b.crew,status:'Исполняется',started:v8date(),endDate:'',penalty:0,warranty:Math.max(30,Math.round(b.quality*1.8)),progress:0};
d.contracts.unshift(c);t.status='Договор заключён';t.winner=b.id;t.contract=c.id;log('Договор №'+c.id+' с '+b.name+' на '+m(c.price)+'; срок '+c.remaining+' дн.');save();render()}
function v27day(){let d=v28migrateNames();for(let c of d.contracts){if(c.status!=='Исполняется')continue;let weather=typeof v22weather==='function'?v22weather():null;let severe=(weather?.severity||0)>=3;let delay=severe&&c.type==='drill'&&c.remaining%5===0;if(!delay)c.remaining--;c.progress=Math.min(100,Math.round((1-c.remaining/c.initialDays)*100));if(c.remaining>0)continue;c.status='Завершён';c.endDate=v8date();let q=c.quality;
if(c.well){let w=s.assets.wellList.find(x=>x.id===c.well);if(w){w.status='Работает';w.health=Math.min(100,(w.health||60)+Math.round(q*.32));w.rate=Math.round((w.rate||10)*(1+(q-70)/500)*10)/10;}}
else if(c.type==='drill'){s.wells++;ensureAssets();}else if(V27_TYPES[c.type]?.category){d.completedProjects||=[];d.completedProjects.unshift({contract:c.id,type:c.type,objectName:c.objectName||'',completed:c.endDate,cost:c.price});}else if(c.type==='maint'){s.condition=cl(s.condition+Math.round(q/12),0,100)}else if(c.type==='env'){ensureEnterprise().environment=cl(ensureEnterprise().environment+Math.round(q/9),0,100)}
log('Подрядчик '+c.supplier+' завершил договор №'+c.id);if(typeof v19notify==='function')v19notify('Исполнен договор №'+c.id+' — '+c.supplier);}
}

function v28extend(id){
 let d=v28migrateNames(),c=d.contracts.find(x=>x.id===id);
 if(!c||c.status!=='Исполняется')return uiAlert('Продлить можно только действующий договор');
 let raw=prompt('Дополнительное соглашение №'+(1+(c.amendments||[]).length)+' — на сколько игровых дней продлить договор? (1–180)','7');
 if(raw===null)return;
 let days=Number(raw);if(!Number.isInteger(days)||days<1||days>180)return uiAlert('Укажите целое число от 1 до 180');
 let reason=prompt('Основание дополнительного соглашения','Изменение производственного графика');
 if(reason===null)return;
 c.remaining+=days;c.initialDays+=days;c.amendments||=[];c.amendments.push({date:v8date(),days,reason:reason.slice(0,150)});
 log('Допсоглашение к договору №'+id+': продление на '+days+' дн.');save();render();
}
function v28rating(){
 let d=v28migrateNames();
 return V27_SUPPLIERS.map((p,id)=>{
 let completed=d.contracts.filter(c=>c.supplier===p[0]&&c.status==='Завершён');
 let active=d.contracts.filter(c=>c.supplier===p[0]&&c.status==='Исполняется').length;
 let score=completed.length?Math.round(completed.reduce((a,c)=>a+c.quality,0)/completed.length):null;
 return {id,name:p[0],completed:completed.length,active,score};
 }).sort((a,b)=>b.completed-a.completed||a.name.localeCompare(b.name,'ru'));
}

function v27view(){let d=v28migrateNames(),out='<h2>Тендеры и подрядные организации</h2><p class="muted">24 вымышленных подрядчика. Цены, сроки, загрузка бригад, качество, гарантия и результаты закупки — параметры игровой модели. Тендер проводится по выбору игрока, без реального ожидания календарных дней.</p><div class="actions">'+Object.entries(V27_TYPES).map(([k,v])=>'<button class="btn secondary" data-v27-new="'+k+'">Объявить тендер: '+esc(v.label)+'</button>').join('')+'</div>';
out+='<h3>Тендерные процедуры</h3>';if(!d.tenders.length)out+='<p class="muted">Объявите тендер, чтобы получить коммерческие предложения.</p>';
for(let t of d.tenders.slice(0,12)){out+='<div class="mini-card" style="margin:12px 0"><b>Тендер №'+t.id+' · '+esc(V27_TYPES[t.type].label)+(t.objectName?' · '+esc(t.objectName):t.well?' · скв. №'+t.well:'')+'</b>'+row('Объявлен',esc(t.created))+row('Статус',esc(t.status));if(t.status==='Приём заявок'){out+='<div class="table-scroll"><table><thead><tr><th>Подрядчик</th><th>Цена</th><th>Срок</th><th>Качество</th><th>Надёжность</th><th>Бригада</th><th>Решение</th></tr></thead><tbody>'+t.bids.map(b=>'<tr><td>'+esc(b.name)+'</td><td>'+m(b.price)+'</td><td>'+b.days+' дн.</td><td>'+b.quality+'/100</td><td>'+b.reliability+'/100</td><td>'+b.crew+' чел.</td><td><button class="mini-btn" data-v27-award="'+t.id+'" data-v27-bid="'+b.id+'">Выбрать</button></td></tr>').join('')+'</tbody></table></div>';}out+='</div>';}
out+='<h3>Рейтинг подрядчиков по завершённым договорам</h3><div class="table-scroll"><table><thead><tr><th>Компания</th><th>Завершено</th><th>В работе</th><th>Оценка качества</th></tr></thead><tbody>'+v28rating().map(x=>'<tr><td>'+esc(x.name)+'</td><td>'+x.completed+'</td><td>'+x.active+'</td><td>'+(x.score===null?'Нет истории':x.score+'/100')+'</td></tr>').join('')+'</tbody></table></div>';out+='<h3>Реестр договоров</h3><div class="table-scroll"><table><thead><tr><th>№</th><th>Подрядчик</th><th>Работа</th><th>Стоимость</th><th>Срок / остаток</th><th>Гарантия</th><th>Статус</th></tr></thead><tbody>'+d.contracts.slice(0,50).map(c=>'<tr><td>'+c.id+'</td><td>'+esc(c.supplier)+'</td><td>'+esc(V27_TYPES[c.type].label)+(c.objectName?' · '+esc(c.objectName):c.well?' · №'+c.well:'')+'</td><td>'+m(c.price)+'</td><td>'+c.initialDays+' / '+Math.max(0,c.remaining)+' дн.</td><td>'+c.warranty+' дн.</td><td>'+esc(c.status)+'</td></tr>').join('')+'</tbody></table></div>';return out}
function v27bind(){document.querySelectorAll('[data-v28-extend]').forEach(b=>b.onclick=()=>v28extend(Number(b.dataset.v28Extend)));document.querySelectorAll('[data-v27-new]').forEach(b=>b.onclick=()=>v27newTender(b.dataset.v27New));document.querySelectorAll('[data-v27-award]').forEach(b=>b.onclick=()=>v27award(Number(b.dataset.v27Award),Number(b.dataset.v27Bid)))}
const v27oldEnterpriseAct=enterpriseAct;
enterpriseAct=async function(kind,arg){if(kind==='contract')return v27newTender(arg);return v27oldEnterpriseAct(kind,arg)};
const v27oldEnterpriseView=enterpriseView;
enterpriseView=function(){if(tab==='contracts')return v27view();return v27oldEnterpriseView()};
const v27oldRepair=v26requestRepair;
v26requestRepair=async function(w){if(!w)return;v27newTender('prs',w.id);tab='contracts';render()};
const v27oldRender=render;
render=function(){v27oldRender();if(tab==='contracts')v27bind()};
const v27oldDay=v26day;
v26day=function(){v27oldDay();v27day()};

function btn(t,label,cost){return '<button class="btn secondary" data-action="'+t+'" '+(s.cash<cost||s.dead?'disabled':'')+'>'+label+' · '+m(cost)+'</button>'}$('new').onclick=async()=>{if(s&&!await uiConfirm('Заменить текущую карьеру?'))return;s={name:$('name').value.trim()||'Моя компания',region:$('region').value.trim()||'Мой регион',field:$('field').value.trim()||'Моё месторождение',cash:+$('capital').value,month:0,wells:240,rate:18,water:28,condition:88,safety:82,oil:75,usd:475,volume:0,revenue:0,expense:0,profit:0,pending:[],history:[],events:['Компания создана'],dead:false};save();show()};$('load').onclick=()=>{try{s=JSON.parse(localStorage.getItem(KEY));show()}catch(e){uiAlert('Не удалось открыть сохранение')}};$('next').onclick=()=>v11step(1);$('reset').onclick=async()=>{if(await uiConfirm('Вернуться к созданию компании?')){$('game').classList.add('hide');$('setup').classList.remove('hide');$('load').classList.remove('hide')}};$('tabs').onclick=e=>{let b=e.target.closest('[data-tab]');if(b){tab=b.dataset.tab;render()}};if(localStorage.getItem(KEY))$('load').classList.remove('hide');
/* v1.2: save manager. Compatible with the existing v0.1-v1.1 localStorage key. */

/* v3.0: Operational CPPN, tank register, animated instrumentation and fire-safety controls.
   Values are fictional game simulations, not physical safety setpoints. */
function v30init(){
 if(!s.v30)s.v30={tanks:[
  {id:1,name:'РВС-5000 №1',capacity:5000,level:2500,health:87,paint:72,fire:84},
  {id:2,name:'РВС-5000 №2',capacity:5000,level:1600,health:91,paint:88,fire:88},
  {id:3,name:'РВС-10000 №1',capacity:10000,level:3800,health:85,paint:70,fire:86}
 ],facilities:[{name:'ЦППН — производственный корпус',kind:'building',health:85,paint:72,fire:85}],fire:{pumps:92,hydrants:87,alarm:90,foam:88,training:80},inflow:0,outflow:0,alarms:[],processedContracts:[]};
 let d=s.v30;
 d.tanks||=[];d.facilities||=[];d.fire||={pumps:90,hydrants:90,alarm:90,foam:90,training:80};
 d.alarms||=[];d.processedContracts||=[];
 return d;
}
function v30safe(x){return Math.max(0,Math.min(100,Number(x)||0))}
function v30metric(){
 let d=v30init(),p=v21init(),calc=v21calc(),n=p.nodes['ЦППН'],power=p.nodes['ПС-1'];
 let load=(calc.load['ЦППН']||0)/Math.max(1,n.capacity*v21nodeAvailable(n));
 let powerLoad=(calc.load['ПС-1']||0)/Math.max(1,power.capacity*v21nodeAvailable(power));
 let pressure=Math.round((1.1+2.4*Math.min(1.2,load))*10)/10;
 let energy=Math.round(powerLoad*100);
 let fire=(Object.values(d.fire).reduce((a,b)=>a+v30safe(b),0)/Object.keys(d.fire).length);
 let tanks=d.tanks.reduce((a,t)=>a+t.level,0),capacity=d.tanks.reduce((a,t)=>a+t.capacity,0);
 return {pressure,energy,load:Math.round(load*100),fire:Math.round(fire),oil:Math.round(calc.oil),tanks,capacity,fill:capacity?Math.round(tanks/capacity*100):0,plantHealth:n.health};
}
function v30day(){
 let d=v30init(),calc=v21calc(),oil=Math.max(0,calc.oil);
 // This is a simulated tank-buffer balance; daily sales remain in the v2.5 finance model.
 // v3.2 owns the tank mass balance and dispatches the actual daily movement.
 d.tanks.forEach(t=>{t.level=Math.round(t.level*10)/10;t.fire=v30safe(t.fire-.012);t.paint=v30safe(t.paint-.007)});
 d.fire.pumps=v30safe(d.fire.pumps-.009);d.fire.alarm=v30safe(d.fire.alarm-.007);
 let m=v30metric(),alerts=[];
 if(m.fill>=90)alerts.push('Высокое заполнение резервуарного парка: '+m.fill+'%');
 if(m.energy>=90)alerts.push('Повышенная загрузка электроснабжения: '+m.energy+'%');
 if(m.fire<70)alerts.push('Требуется усилить противопожарную готовность');
 if(m.plantHealth<55)alerts.push('Низкое техническое состояние ЦППН');
 d.alarms=alerts;
 // Process new completed contractor work once. Previous contract history remains untouched.
 let contracts=v28migrateNames().contracts;
 for(let c of contracts){
  if(c.status!=='Завершён'||d.processedContracts.includes(c.id))continue;
  d.processedContracts.push(c.id);
  let name=(c.objectName||'').toLowerCase(),tank=d.tanks.find(t=>t.name.toLowerCase()===name);
  if(c.type==='rvs_build'){
   if(!tank){let match=name.match(/рвс[-\s]*(\d+)/i),capacity=match?Number(match[1]):5000;capacity=Math.max(100,Math.min(50000,capacity));d.tanks.push({id:Math.max(0,...d.tanks.map(t=>t.id))+1,name:c.objectName||'Новый РВС',capacity,level:0,health:100,paint:100,fire:95});}
  }else if(tank&&c.type==='rvs_repair'){tank.health=100;tank.fire=Math.min(100,tank.fire+10)}
  else if(tank&&c.type==='rvs_clean'){tank.health=Math.min(100,tank.health+12)}
  else if(tank&&['painting','anticorrosion'].includes(c.type)){tank.paint=100;tank.fire=Math.min(100,tank.fire+5)}
  else if(c.type==='building'){d.facilities.push({name:c.objectName||'Новое здание',kind:'building',health:100,paint:100,fire:90})}
  else if(['painting','building_repair'].includes(c.type)){let building=d.facilities.find(x=>x.name.toLowerCase()===name);if(building){if(c.type==='painting')building.paint=100;else building.health=100}}
 }
 if(d.processedContracts.length>1500)d.processedContracts=d.processedContracts.slice(-1000);
}
function v30gauge(label,value,max,unit,warning){
 let pct=Math.max(0,Math.min(100,value/max*100)),angle=-120+pct*240;
 return '<div class="v30-gauge"><div class="v30-dial"><div class="v30-ticks"></div><div class="v30-needle" style="transform:translateX(-50%) rotate('+angle+'deg)"></div><div class="v30-pin"></div></div><b>'+esc(label)+'</b><strong>'+value+' '+unit+'</strong><div class="v30-meter"><span style="width:'+pct+'%;background:'+(warning?'#e5a34a':'#34a7a1')+'"></span></div></div>';
}
function v30view(){
 let d=v30init(),m=v30metric(),out='<h2>ЦППН · цифровой пульт управления</h2><p class="muted">Игровая модель технологических параметров. Показания изменяются при ходе времени, ремонтах и изменении добычи. Это не нормативные уставки реального оборудования.</p>';
 out+='<div class="v30-grid">'+v30gauge('Загрузка энергии',m.energy,100,'%',m.energy>90)+v30gauge('Загрузка ЦППН',m.load,100,'%',m.load>90)+v30gauge('Заполнение РВС',m.fill,100,'%',m.fill>90)+v30gauge('Состояние ЦППН',m.plantHealth,100,'%',m.plantHealth<55)+'</div>';
 out+='<h3>Материальный поток</h3>'+row('Нефть на входе (модель)',m.oil+' т/сут')+row('В резервуары за день',d.inflow+' условных м³')+row('Отгрузка из резервуаров',d.outflow+' условных м³')+row('Запас в резервуарах',Math.round(m.tanks).toLocaleString('ru-RU')+' / '+m.capacity.toLocaleString('ru-RU')+' м³');
 out+='<h3>Резервуарный парк</h3>';
 for(let t of d.tanks){let pct=Math.round(t.level/t.capacity*100);out+='<div class="v30-tankrow"><div class="v30-tank"><div class="v30-liquid" style="height:'+pct+'%"></div><span>'+pct+'%</span></div><div style="flex:1"><b>'+esc(t.name)+'</b>'+row('Заполнение',Math.round(t.level)+' / '+t.capacity+' м³')+row('Техсостояние',Math.round(t.health)+'%')+row('Покрытие / покраска',Math.round(t.paint)+'%')+row('Пожарная защита',Math.round(t.fire)+'%')+'<button class="mini-btn" data-v30-tender="rvs_repair" data-v30-object="'+esc(t.name)+'">Ремонт</button> <button class="mini-btn" data-v30-tender="anticorrosion" data-v30-object="'+esc(t.name)+'">Покраска</button></div></div>';}
 out+='<h3>Пожарная безопасность</h3><p class="muted">Контроль пожарных насосов, гидрантов, сигнализации, пенообразования и подготовки персонала.</p>';
 for(let [key,label] of Object.entries({pumps:'Пожарные насосы',hydrants:'Гидранты и водоснабжение',alarm:'Сигнализация и оповещение',foam:'Пенное пожаротушение',training:'Подготовка персонала'}))out+=row(label,Math.round(d.fire[key])+'%');
 out+='<div class="actions"><button class="btn secondary" data-v30-fire="inspect">Проверить системы · 8 млн ₸</button><button class="btn secondary" data-v30-fire="training">Провести учение · 4 млн ₸</button><button class="btn secondary" data-v30-fire="service">ТО противопожарных систем · 25 млн ₸</button></div>';
 if(d.alarms.length)out+='<div class="notice bad"><b>Сигналы диспетчера:</b> '+d.alarms.map(esc).join(' · ')+'</div>';
 out+='<h3>Строительство и модернизация</h3><div class="actions"><button class="btn secondary" data-v30-tender="rvs_build">Тендер на новый РВС</button><button class="btn secondary" data-v30-tender="building">Тендер на здание</button><button class="btn secondary" data-v30-tender="painting">Тендер на покраску</button></div>';
 return out;
}
function v30fireAction(type){
 let d=v30init(),cost={inspect:8,training:4,service:25}[type];if(!cost)return;
 if(s.cash<cost)return uiAlert('Недостаточно средств');
 if(!confirm('Выполнить мероприятие по пожарной безопасности за '+m(cost)+'?'))return;
 s.cash-=cost;v25post('maintenance',cost,{description:'Пожарная безопасность: '+type});
 if(type==='inspect'){d.fire.alarm=v30safe(d.fire.alarm+8);d.fire.hydrants=v30safe(d.fire.hydrants+5)}
 if(type==='training')d.fire.training=v30safe(d.fire.training+18);
 if(type==='service'){d.fire.pumps=v30safe(d.fire.pumps+20);d.fire.foam=v30safe(d.fire.foam+18);d.fire.hydrants=v30safe(d.fire.hydrants+12)}
 log('Пожарная безопасность: '+type);save();render();
}
function v30bind(){
 document.querySelectorAll('[data-v30-fire]').forEach(b=>b.onclick=()=>v30fireAction(b.dataset.v30Fire));
 document.querySelectorAll('[data-v30-tender]').forEach(b=>b.onclick=()=>{
  let type=b.dataset.v30Tender,object=b.dataset.v30Object;
  if(object){let d=v28migrateNames(),t=V27_TYPES[type];let x={id:++d.seq,type,well:null,objectName:object,created:v8date(),status:'Приём заявок',bids:v27bids(type,d.seq)};d.tenders.unshift(x);log('Тендер №'+x.id+': '+t.label+' — '+object);tab='contracts';save();render();}
  else{tab='contracts';v27newTender(type)}
 });
}
const v30previousRender=render;
render=function(){v30previousRender();if(tab==='dispatch'||tab==='hse'){let content=document.getElementById('body');if(content){content.insertAdjacentHTML('beforeend',v30view());v30bind()}}};
const v30previousDay=v26day;
v26day=function(){v30previousDay();v30day()};

/* v3.1: fictional CPPN process stages, emergency shutdown and fire drills. */
const V31_STAGES=[
 {id:'separation',name:'Сепарация',capacity:12500,wear:.015},
 {id:'heating',name:'Подогрев',capacity:11500,wear:.025},
 {id:'dehydration',name:'Обезвоживание',capacity:10500,wear:.022},
 {id:'desalting',name:'Обессоливание',capacity:10200,wear:.018},
 {id:'pumps',name:'Насосная перекачки',capacity:12000,wear:.026}
];
function v31init(){
 if(!s.v31)s.v31={stages:V31_STAGES.map(x=>({id:x.id,health:90,online:true})),shutdown:false,fireEvent:null,incidentHistory:[],last:{feed:0,oil:0,water:0,gas:0,salt:0},lastDrill:null,interventions:[]};
 let d=s.v31;d.stages||=V31_STAGES.map(x=>({id:x.id,health:90,online:true}));d.incidentHistory||=[];d.interventions||=[];d.last||={feed:0,oil:0,water:0,gas:0,salt:0};
 return d;
}
function v31calculate(){
 let d=v31init(),raw=Math.max(0,v21calc().oil),feed=raw;
 for(let meta of V31_STAGES){let stage=d.stages.find(x=>x.id===meta.id);if(!stage||!stage.online||d.shutdown||d.fireEvent){feed=0;break}feed=Math.min(feed,meta.capacity*Math.max(.35,stage.health/100))}
 let watercut=Math.max(0,Math.min(.95,(Number(s.water)||0)/100));
 let dry=feed*(1-watercut*.15);
 let gas=feed*.025,water=feed-dry,oil=Math.max(0,dry-gas);
 return {feed:Math.round(feed),oil:Math.round(oil),water:Math.round(water),gas:Math.round(gas),salt:Math.round(Math.max(0,oil*.0002)),load:Math.round(feed/12500*100)};
}
function v31day(){
 let d=v31init();
 for(let meta of V31_STAGES){let st=d.stages.find(x=>x.id===meta.id);if(st&&st.online&&!d.shutdown)st.health=Math.max(0,Math.round((st.health-meta.wear)*1000)/1000)}
 if(d.fireEvent){d.fireEvent.days++;if(d.fireEvent.days>3){d.incidentHistory.unshift({...d.fireEvent,resolved:v8date()});d.fireEvent=null;d.shutdown=true;log('Ликвидирована игровая аварийная ситуация на ЦППН. Требуется восстановление и разрешение пуска.');}}
 d.last=v31calculate();
}
function v31action(kind,id){
 let d=v31init(),st=d.stages.find(x=>x.id===id),meta=V31_STAGES.find(x=>x.id===id);
 if(kind==='shutdown'){if(d.shutdown)return;d.shutdown=true;log('Оператор инициировал аварийную остановку ЦППН');save();render();return}
 if(kind==='restart'){if(d.fireEvent)return uiAlert('Нельзя запустить ЦППН до ликвидации аварии');if(d.stages.some(x=>!x.online||x.health<40))return uiAlert('Не все установки готовы к пуску');d.shutdown=false;log('ЦППН возвращён в работу после проверки готовности');save();render();return}
 if(kind==='simulate'){if(d.fireEvent)return uiAlert('Сценарий уже активен');if(!confirm('Запустить учебный сценарий пожара на ЦППН? Производство будет остановлено.'))return;d.fireEvent={type:'Учебный сценарий пожара',started:v8date(),days:0};d.shutdown=true;log('Учебный сценарий: пожар на ЦППН, аварийная остановка');save();render();return}
 if(kind==='reset'){if(!d.fireEvent)return;d.incidentHistory.unshift({...d.fireEvent,resolved:v8date()});d.fireEvent=null;log('Учебный сценарий завершён; ЦППН остаётся остановленным до пуска');save();render();return}
 if(kind==='repair'&&st&&meta){let cost=22;if(s.cash<cost)return uiAlert('Недостаточно средств');if(!confirm('Выполнить обслуживание '+meta.name+' за '+m(cost)+'?'))return;s.cash-=cost;v25post('maintenance',cost,{description:'ТО установки '+meta.name});st.health=Math.min(100,st.health+20);st.online=true;d.interventions.unshift({date:v8date(),stage:id,cost});log('ТО '+meta.name);save();render()}
}
function v31view(){
 let d=v31init(),calc=v31calculate();
 let out='<h2>ЦППН · технологическая схема</h2><p class="muted">Симуляция этапов подготовки нефти: условные потоки, состояния установок и технологическая готовность. Не является схемой реального объекта.</p>';
 out+='<div class="v31-flow"><div class="v31-unit"><b>Сбор нефти</b><span>'+calc.feed+' усл. ед./сут</span></div>';
 for(let meta of V31_STAGES){let st=d.stages.find(x=>x.id===meta.id);out+='<span class="v31-arrow">➜</span><div class="v31-unit '+(!st.online||d.shutdown?'v31-off':'')+'"><b>'+esc(meta.name)+'</b><span>Состояние '+Math.round(st.health)+'%</span><span>'+(st.online?'В работе':'Отключена')+'</span><button class="mini-btn" data-v31-action="repair" data-v31-id="'+meta.id+'">ТО · 22 млн ₸</button></div>';}
 out+='<span class="v31-arrow">➜</span><div class="v31-unit"><b>РВС</b><span>'+calc.oil+' усл. ед./сут</span></div></div>';
 out+='<h3>Разделение потоков</h3><div class="v31-flows">'+row('Подготовленная нефть',calc.oil+' усл. ед./сут')+row('Выделенная вода',calc.water+' усл. ед./сут')+row('Газ (условно)',calc.gas+' усл. ед./сут')+row('Условный остаток солей',calc.salt+' ед.')+'</div>';
 out+='<h3>Управление технологией</h3><div class="actions"><button class="btn secondary" data-v31-action="shutdown">Аварийная остановка</button><button class="btn secondary" data-v31-action="restart">Проверить и запустить</button><button class="btn secondary" data-v31-action="simulate">Учебный сценарий пожара</button>'+(d.fireEvent?'<button class="btn secondary" data-v31-action="reset">Завершить сценарий</button>':'')+'</div>';
 if(d.shutdown)out+='<div class="notice bad">ЦППН остановлен. Возобновление возможно после проверки состояния установок.</div>';
 if(d.fireEvent)out+='<div class="notice bad">Учебная пожарная ситуация: '+esc(d.fireEvent.type)+' · '+d.fireEvent.days+' игровых дней</div>';
 out+='<p class="muted">Учебный сценарий и остановка влияют на технологический поток этого экрана. Финансовая реализация нефти в версии 3.1 по-прежнему рассчитывается прежней моделью; полная интеграция технологического потока с продажами запланирована отдельно.</p>';
 return out;
}
function v31bind(){document.querySelectorAll('[data-v31-action]').forEach(b=>b.onclick=()=>v31action(b.dataset.v31Action,b.dataset.v31Id))}
const v31oldRender=render;
render=function(){v31oldRender();if(tab==='dispatch'){let el=document.getElementById('body');if(el){el.insertAdjacentHTML('beforeend',v31view());v31bind()}}};
const v31oldDay=v26day;
v26day=function(){v31oldDay();v31day()};

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

/* v3.2 — common daily material balance, tonnes, simplified 1 tonne = 1 storage unit.
   Called once from v8advance before posting daily revenue.
   Existing v30 visual RVS simulation no longer moves inventory independently. */
function v32init(){
 if(!s.v32)s.v32={days:[],totalProduced:0,totalProcessed:0,totalSold:0,totalUnmet:0,capacityNote:'Игровое допущение: 1 т = 1 условная единица объёма РВС.'};
 let d=s.v32;d.days||=[];return d;
}
function v32settle(produced){
 let d=v32init(),t=v30init(),p=v31init();
 let tanks=t.tanks,storedBefore=tanks.reduce((n,x)=>n+(Number(x.level)||0),0);
 let totalCapacity=tanks.reduce((n,x)=>n+(Number(x.capacity)||0),0);
 let processed=0;
 if(!p.shutdown&&!p.fireEvent){
  processed=Math.max(0,produced);
  for(let meta of V31_STAGES){
   let stage=p.stages.find(x=>x.id===meta.id);
   if(!stage||!stage.online||stage.health<1){processed=0;break}
   processed=Math.min(processed,meta.capacity*Math.max(.35,stage.health/100));
  }
 }
 // The refinery-to-storage path first transfers processed oil to tanks, then dispatches
 // from stock. Daily dispatch is capped by a fixed simplified export line capacity.
 // Load processed oil into tanks, then dispatch only physically available inventory.
 let free=Math.max(0,totalCapacity-storedBefore);
 let added=Math.min(processed,free),remainder=added;
 for(let tank of tanks){let volume=Math.min(Math.max(0,tank.capacity-tank.level),remainder);tank.level+=volume;remainder-=volume;}
 let available=tanks.reduce((n,x)=>n+x.level,0);
 let dispatchCapacity=9000;
 let shipment=v33dispatch(Math.min(dispatchCapacity,available));
 let sold=shipment.sold,out=sold;
 for(let tank of tanks){let taken=Math.min(tank.level,out);tank.level-=taken;out-=taken;tank.level=Math.round(tank.level*100)/100;}
 let actualStored=added,unmet=Math.max(0,produced-processed),overflow=Math.max(0,processed-actualStored);
 t.inflow=Math.round(actualStored);t.outflow=Math.round(sold);
 let result={date:v8date(),produced:Math.round(produced*100)/100,processed:Math.round(processed*100)/100,sold:Math.round(sold*100)/100,stored:Math.round(tanks.reduce((n,x)=>n+x.level,0)*100)/100,contracts:shipment.allocations,unmet:Math.round(unmet*100)/100,overflow:Math.round(overflow*100)/100};
 d.days.push(result);if(d.days.length>730)d.days.shift();
 d.totalProduced=(d.totalProduced||0)+result.produced;
 d.totalProcessed=(d.totalProcessed||0)+result.processed;
 d.totalSold=(d.totalSold||0)+result.sold;
 d.totalUnmet=(d.totalUnmet||0)+result.unmet;
 return result;
}
function v32view(){
 let d=v32init(),last=d.days[d.days.length-1];
 let rows=last?[
 ['Добыто за сутки',last.produced+' т'],['Подготовлено на ЦППН',last.processed+' т'],
 ['Отгружено / реализовано',last.sold+' т'],['Остаток в РВС',last.stored+' усл. ед.'],
 ['Не подготовлено из-за ограничений',last.unmet+' т'],['Не размещено в РВС',last.overflow+' т']
 ]:[];
 return '<h2>Единый производственный баланс · v3.3</h2><p class="muted">Финансовая выручка рассчитывается по отгруженному объёму. Простой ЦППН останавливает подготовку, а остаток в РВС может быть реализован до исчерпания запасов.</p>'+
 (rows.map(x=>row(x[0],x[1])).join('')||'<p class="muted">Данные появятся после следующего игрового дня.</p>')+
 '<div class="notice">Учебная модель: 1 т = 1 условная единица хранения, отгрузочная линия — до 9 000 т/сут. Потери из-за ограничений показываются отдельно, физические свойства нефти и точная конверсия т/м³ не рассчитываются.</div>';
}
const v32oldRender=render;
render=function(){v32oldRender();if(['dispatch','finance'].includes(tab)){let el=document.getElementById('body');if(el)el.insertAdjacentHTML('beforeend',v32view())}};

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
 out+='<h3>Производственные показатели · последние 31 игровой день</h3>'+row('Добыто',f(produced)+' т')+row('Подготовлено',f(processed)+' т')+row('Реализовано',f(sold)+' т');
 out+='<h3>Неоплаченные счета</h3><div class="table-scroll"><table><thead><tr><th>№</th><th>Покупатель</th><th>Сумма</th><th>Дней до/после срока</th><th>Статус</th></tr></thead><tbody>';
 for(let x of pending.slice(-35).reverse())out+='<tr><td>'+x.id+'</td><td>'+esc(x.buyer)+'</td><td>'+m(x.amount-x.paid)+'</td><td>'+Math.round(x.dueDay-v34date())+'</td><td>'+esc(x.status)+'</td></tr>';
 out+='</tbody></table></div>';
 out+='<p class="muted">Модель оплаты: покупатель оплачивает счёт в течение 0–3 игровых дней после договорного срока. Начисленная пеня не гарантирует поступления денег. Авансы являются денежными поступлениями, а не дополнительной выручкой.</p>';
 return out;
}
const v34oldRender=render;
render=function(){v34oldRender();if(['finance','dispatch'].includes(tab)){let el=document.getElementById('body');if(el)el.insertAdjacentHTML('beforeend',v34view())}};

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
function v35budget(){
 let val=prompt('Установить бюджет капитальных вложений (млн ₸, 0–100000)',''+v35init().budget);
 if(val===null)return;
 let n=Number(val);if(!Number.isFinite(n)||n<0||n>100000)return uiAlert('Укажите бюджет от 0 до 100 000 млн ₸');
 v35init().budget=n;log('Утверждён план CAPEX: '+m(n));save();render();
}
function v35borrow(){
 let d=v35init();
 let raw=prompt('Сумма кредита, млн ₸ (100–10000)','1000');if(raw===null)return;
 let amount=Number(raw);if(!Number.isFinite(amount)||amount<100||amount>10000)return uiAlert('Сумма кредита: от 100 до 10 000 млн ₸');
 let yearsRaw=prompt('Срок кредита, игровых месяцев (3–60)','24');if(yearsRaw===null)return;
 let months=Number(yearsRaw);if(!Number.isInteger(months)||months<3||months>60)return uiAlert('Срок: от 3 до 60 месяцев');
 let rateRaw=prompt('Годовая ставка, % (5–35)','16');if(rateRaw===null)return;
 let rate=Number(rateRaw);if(!Number.isFinite(rate)||rate<5||rate>35)return uiAlert('Ставка: от 5 до 35%');
 if(!confirm('Привлечь кредит '+m(amount)+' на '+months+' мес. под '+rate+'% годовых?'))return;
 let loan={id:++d.loanSeq,principal:amount,balance:amount,rate,months,remainingDays:months*30,started:v8date(),status:'Действует',interestPaid:0,principalPaid:0};
 d.loans.push(loan);s.cash+=amount;v35record('credit_in',amount,'Кредит №'+loan.id);
 log('Привлечён кредит №'+loan.id+' на '+m(amount));save();render();
}
function v35repay(id){
 let loan=v35init().loans.find(x=>x.id===id&&x.status==='Действует');if(!loan)return;
 let raw=prompt('Досрочное погашение основного долга, млн ₸ (остаток '+loan.balance.toFixed(2)+')',loan.balance.toFixed(2));if(raw===null)return;
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
 out+='<h3>Денежные потоки казначейства · последние 30 игровых дней</h3>';
 out+=row('Привлечение кредитов',m(flows.credit_in))+row('Погашение основного долга',m(flows.credit_out))+row('Проценты по кредитам',m(flows.interest))+row('Оплата капитальных договоров',m(flows.capex))+row('Оплата подрядных работ OPEX',m(flows.contract_opex));
 out+='<h3>Реестр капитальных договоров</h3><div class="table-scroll"><table><thead><tr><th>№</th><th>Объект</th><th>Вид работ</th><th>Стоимость</th><th>Статус</th></tr></thead><tbody>';
 for(let c of parts.capex.slice(0,35))out+='<tr><td>'+c.id+'</td><td>'+esc(c.objectName||'—')+'</td><td>'+esc(V27_TYPES[c.type]?.label||c.type)+'</td><td>'+m(c.price)+'</td><td>'+esc(c.status)+'</td></tr>';
 out+='</tbody></table></div><p class="muted">Учебная модель: нет налогов, амортизации, НДС, банковских ковенантов, залогов и индивидуальных графиков подрядных платежей. Показатели казначейства фиксируются с момента установки v3.5.</p>';
 return out;
}
function v35bind(){
 document.querySelectorAll('[data-v35-budget]').forEach(x=>x.onclick=v35budget);
 document.querySelectorAll('[data-v35-loan]').forEach(x=>x.onclick=v35borrow);
 document.querySelectorAll('[data-v35-repay]').forEach(x=>x.onclick=()=>v35repay(Number(x.dataset.v35Repay)));
}
const v35oldAward=v27award;
v27award=function(id,bidId){
 let d=v28migrateNames(),t=d.tenders.find(x=>x.id===id),b=t?.bids?.find(x=>x.id===bidId);
 if(!t||!b)return v35oldAward(id,bidId);
 if(V35_CAPEX_TYPES.has(t.type)){
  let current=v35contracts().capex.reduce((a,c)=>a+c.price,0);
  let budget=v35init().budget;
  if(current+b.price>budget)return uiAlert('Лимит CAPEX превышен: требуется '+m(current+b.price)+' при бюджете '+m(budget)+'. Увеличьте бюджет в разделе «Финансы».');
 }
 let before=v28migrateNames().contracts.length;
 let cashBefore=s.cash;
 let result=v35oldAward(id,bidId);
 if(v28migrateNames().contracts.length>before&&s.cash<cashBefore){
  v35record(V35_CAPEX_TYPES.has(t.type)?'capex':'contract_opex',cashBefore-s.cash,'Договор №'+v28migrateNames().contracts[0].id);
 }
 return result;
};
const v35oldDay=v26day;
v26day=function(){v35oldDay();v35day()};
const v35oldRender=render;
render=function(){v35oldRender();if(tab==='finance'){let el=document.getElementById('body');if(el){el.insertAdjacentHTML('beforeend',v35view());v35bind()}}};

/* v3.6 — camp catering, dormitories, site security, and contract milestone acceptance.
   Game economics only: existing contract price is still deducted in full at award.
   Stage accounting records acceptance but does not deduct contract price again. */
function v36init(){
 if(!s.v36)s.v36={camp:{residents:180,beds:220,mealStock:900,mealQuality:84,housing:87,cleanliness:85,security:82,guards:12,incidents:0,mealsServed:0,missedMeals:0},contracts:{},events:[],spent:0};
 let d=s.v36;d.camp||={residents:180,beds:220,mealStock:900,mealQuality:84,housing:87,cleanliness:85,security:82,guards:12,incidents:0,mealsServed:0,missedMeals:0};d.contracts||={};d.events||=[];return d;
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
function v36purchase(kind){
 let d=v36init(),c=d.camp,price={food:14,repair:25,clean:7,guards:18,security:30,beds:85}[kind];
 if(!price)return;
 if(s.cash<price)return uiAlert('Недостаточно денежных средств');
 if(!confirm('Выполнить мероприятие за '+m(price)+'?'))return;
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
function v36setResidents(){
 let c=v36init().camp,raw=prompt('Количество проживающих работников (0–1000)',String(c.residents));if(raw===null)return;
 let n=Number(raw);if(!Number.isInteger(n)||n<0||n>1000)return uiAlert('Укажите от 0 до 1000 работников');
 c.residents=n;save();render();
}
function v36accept(id,index){
 let c=v28migrateNames().contracts.find(x=>x.id===id);if(!c)return;
 let x=v36contract(c),stage=x.milestones[index];if(!stage||stage.accepted)return;
 let progress=c.status==='Завершён'?100:Number(c.progress)||0,threshold=[20,70,100][index];
 if(progress<threshold)return uiAlert('Работы по этапу ещё не выполнены: требуется '+threshold+'% готовности');
 if(index>0&&!x.milestones[index-1].accepted)return uiAlert('Сначала примите предыдущий этап');
 if(index===2&&!x.qualityDocs)return uiAlert('Перед итоговой приёмкой подтвердите исполнительную документацию');
 if(!confirm('Подписать игровой акт по этапу «'+stage.name+'» договора №'+id+'?'))return;
 stage.accepted=true;stage.date=v8date();
 if(index===2){x.acceptedAt=v8date();x.commissioned=true}
 log('Принят этап '+(index+1)+' договора №'+id);save();render();
}
function v36docs(id){
 let c=v28migrateNames().contracts.find(x=>x.id===id);if(!c)return;
 let x=v36contract(c);
 if(c.status!=='Завершён')return uiAlert('Исполнительная документация проверяется после завершения работ');
 if(!confirm('Подтвердить комплектность исполнительной документации по договору №'+id+'?'))return;
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
 if(c.mealStock<c.residents*3)out+='<div class="notice bad">Недостаточно продовольствия на следующий игровой день. Необходимо пополнить склад столовой.</div>';
 if(c.residents>c.beds)out+='<div class="notice bad">Превышена вместимость общежитий.</div>';
 if(c.security<55)out+='<div class="notice bad">Недостаточный уровень охраны производственных объектов.</div>';
 out+='<div class="actions"><button class="btn secondary" data-v36-residents>Изменить численность</button><button class="btn secondary" data-v36-buy="food">Закупить продукты · 14 млн ₸</button><button class="btn secondary" data-v36-buy="repair">Ремонт общежитий · 25 млн ₸</button><button class="btn secondary" data-v36-buy="clean">Санобработка · 7 млн ₸</button><button class="btn secondary" data-v36-buy="guards">Нанять охрану · 18 млн ₸</button><button class="btn secondary" data-v36-buy="security">Усилить безопасность · 30 млн ₸</button><button class="btn secondary" data-v36-buy="beds">Расширить общежитие · 85 млн ₸</button></div>';
 out+='<h3>Функции службы безопасности</h3><p class="muted">В игровой модели служба отвечает за контроль доступа, охрану имущества, режим объектов, обходы и реагирование на нарушения. Численность охраны влияет на показатель надёжности.</p>';
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
  if(x.commissioned)out+='<div class="notice">Приёмка завершена: '+esc(x.acceptedAt)+'. Объект принят в игровой реестр.</div>';
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
/* v3.6.1 — fictional annual league of 100 oil companies, including player. */
const V37_ASPECTS=[['production','Добыча',20],['finance','Финансы',20],['hse','Промышленная безопасность',18],['ecology','Экология',10],['equipment','Оборудование',10],['staff','Персонал',8],['camp','Вахтовый посёлок',7],['investment','Инвестиции',7]];
const V37_PREFIX=['Север','Восток','Запад','Юг','Альфа','Бета','Гео','Прайм','Орбита','Континент','Атлас','Горизонт','Энерго','Стандарт','Пром','Терра','Вектор','Меридиан','Сфера','Норд'];
const V37_SUFFIX=['Нефть','Ойл','Петролеум','Энерджи','Ресурс'];
function v37init(){
 if(!s.v37)s.v37={years:{},currentYear:null,selectedYear:null};
 let d=s.v37;d.years||={};d.history||=[];d.live||=null;return d;
}
function v37seedSeason(year){
 let d=v37init();
 // First season always starts at the bottom. Later seasons inherit 80% of earned reputation.
 let carry=d.history.length?Math.max(0,Math.min(85,d.history[d.history.length-1].score*.8)):0;
 d.live={year,dayIndex:v8init().daysElapsed||0,score:carry,previousRank:100,rank:100,change:0,trend:[],first:true};
 d.currentYear=year;
}
function v37hash(a,b,c){let x=Math.sin(a*127.1+b*311.7+c*74.7)*43758.5453123;return x-Math.floor(x)}
function v37score(aspects){let weighted=V37_ASPECTS.reduce((sum,x)=>sum+(Number(aspects[x[0]])||0)*x[2],0)/100;return Math.round(weighted*10)/10}
function v37player(year){
 let v=v8init(),camp=v36init().camp,treasury=v35init(),contracts=v28migrateNames().contracts;
 let hist=v.monthHistory.filter(x=>x.year===year),production=hist.length?hist.reduce((a,x)=>a+Math.min(140,Math.max(0,x.rate)),0)/hist.length:100;
 let cash=s.cash,debt=treasury.loans.reduce((a,x)=>a+(x.balance||0),0);
 let incidents=v.incidents.filter(x=>x.date.endsWith(String(year))).length;
 let done=contracts.filter(x=>x.endDate?.endsWith(String(year))).length,active=contracts.filter(x=>x.status==='Исполняется').length;
 let clip=x=>Math.max(0,Math.min(100,Math.round(x)));
 let a={production:clip(65+(production-85)*.7),finance:clip(65+Math.max(-35,Math.min(35,cash/250))-debt/250),hse:clip(s.safety-incidents*2.5),ecology:clip(60+(s.safety-60)*.4-(incidents*.8)),equipment:clip(s.condition),staff:clip(v.morale*.55+v.conditions*.45),camp:clip((camp.mealQuality+camp.housing+camp.cleanliness+camp.security)/4-(camp.residents>camp.beds?12:0)),investment:clip(65+done*4-active*2+(treasury.budget>0?Math.min(12,contracts.length*2):0))};
 return {id:'player',name:s.name||'Моя нефтяная компания',aspects:a,score:v37score(a),player:true};
}
function v37generate(year){
 let d=v37init(),companies=[];
 for(let i=0;i<99;i++){
  let a={},base=42+v37hash(i,year,1)*48;
  V37_ASPECTS.forEach((x,j)=>{a[x[0]]=Math.round(Math.max(12,Math.min(99,base+(v37hash(i,year,j+3)-.5)*27)))});
  let competitor={id:'r'+i,name:V37_PREFIX[Math.floor(i/5)]+' '+V37_SUFFIX[i%5]+' '+(i+1),aspects:a,score:v37score(a),player:false};
  // Deterministic competitor movement as the season advances.
  let ticks=Math.max(0,(v8init().daysElapsed||0)-(d.live?.dayIndex||0));
  competitor.score=Math.max(8,Math.min(99,Math.round((competitor.score+Math.sin(ticks/8+i*2.3)*2.5+Math.sin(ticks/25+i*.6)*2)*10)/10));
  companies.push(competitor);
 }
 let player=v37player(year);
 if(d.live?.year===year)player.score=Math.round(d.live.score*10)/10;
 companies.push(player);return v37sort(companies);
}
function v37sort(items){items.sort((a,b)=>b.score-a.score||(a.name||'').localeCompare(b.name||''));items.forEach((x,i)=>x.rank=i+1);return items}
function v37refresh(){
 let d=v37init(),year=v8init().year;
 if(!d.live||d.live.year!==year)v37seedSeason(year);
 d.years[year]=v37generate(year);
 return d;
}
function v37tick(){
 let d=v37refresh(),year=v8init().year,live=d.live;
 let player=v37player(year),target=player.score;
 // Daily progression is gradual, and can move downward if company performance falls.
 // Early career starts in 100th place and does not jump to top ranks in one day.
 let age=(v8init().daysElapsed||0)-live.dayIndex;
 let maxRise=age<30?.32:age<90?.23:.17;
 let delta=(target-live.score)*.025;
 live.score=Math.max(0,Math.min(100,live.score+Math.max(-.8,Math.min(maxRise,delta))));
 let list=v37generate(year),mine=list.find(x=>x.player),oldRank=live.rank;
 live.previousRank=oldRank;live.rank=mine.rank;live.change=oldRank-mine.rank;
 live.trend.push({date:v8date(),rank:mine.rank,score:Math.round(live.score*10)/10});
 if(live.trend.length>365)live.trend.shift();
 d.years[year]=list;
 if(live.change!==0){let direction=live.change>0?'поднялась':'опустилась';log('Рейтинг компаний: ваша компания '+direction+' на '+Math.abs(live.change)+' поз., место '+live.rank+'/100')}
}
function v37annualSnapshot(oldYear){
 let d=v37init(),list=d.years[oldYear]||[],mine=list.find(x=>x.player);
 d.history.push({year:oldYear,rank:mine.rank,score:mine.score,trend:d.live.trend.slice()});
 d.currentYear=null;
 log('Итоги рейтинга '+oldYear+': '+mine.rank+' место из 100, '+mine.score+' балла');
}
function v37view(){
 let d=v37refresh(),years=Object.keys(d.years).map(Number).sort((a,b)=>b-a),selected=years.includes(d.selectedYear)?d.selectedYear:v8init().year;
 let list=d.years[selected]||[],mine=list.find(x=>x.player),isCurrent=selected===v8init().year,live=d.live,trend=isCurrent?live?.trend:(d.history.find(x=>x.year===selected)?.trend||[]);
 let out='<section class="v37-league"><h2>🏆 Рейтинг 100 нефтяных компаний</h2><p class="muted">'+(isCurrent?'Текущий предварительный рейтинг':'Итоговый рейтинг')+' за '+selected+' год. Все конкуренты вымышлены; их оценки генерируются по игровой модели, а показатели вашего предприятия зависят от решений в карьере.</p>';
 out+='<div class="actions"><label for="v37-year">Год:</label><select id="v37-year">'+years.map(y=>'<option value="'+y+'"'+(y===selected?' selected':'')+'>'+y+'</option>').join('')+'</select></div>';
 if(mine)out+='<div class="v37-summary"><div><small>Место вашей компании</small><strong>'+mine.rank+' / 100</strong></div><div><small>Итоговый балл</small><strong>'+mine.score+' / 100</strong></div><div><small>Лидер рейтинга</small><strong>'+list[0].score+' / 100</strong></div></div>';
 if(isCurrent&&live){
  let movement=live.change>0?'▲ +'+live.change+' место':live.change<0?'▼ '+live.change+' место':'● Без изменений';
  out+='<div class="v37-motion"><span class="v37-motion-value">'+movement+'</span><span>Изменение за последний игровой день</span><span>Старт сезона: '+(d.history.length?'с перенесённой репутацией':'100-е место')+'</span></div>';
 }
 if(trend&&trend.length){
  let last=trend.slice(-45),width=660,height=125,pts=last.map((x,i)=>(i/(Math.max(1,last.length-1))*width).toFixed(1)+','+(12+(x.rank-1)/99*(height-24)).toFixed(1)).join(' ');
  out+='<h3>Движение позиции · последние '+last.length+' игровых дней</h3><div class="v37-chart"><div class="v37-chart-labels"><span>1 место</span><span>100 место</span></div><svg viewBox="0 0 660 125" role="img" aria-label="График места компании в рейтинге"><line x1="0" y1="12" x2="660" y2="12" stroke="currentColor" opacity=".2"/><line x1="0" y1="113" x2="660" y2="113" stroke="currentColor" opacity=".2"/><polyline fill="none" stroke="#269f96" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" points="'+pts+'"/></svg></div>';
 }
 out+='<h3>Оценка вашей компании по направлениям</h3><div class="v37-aspects">';
 for(let a of V37_ASPECTS){let score=mine?.aspects[a[0]]||0;out+='<div class="v37-aspect"><span>'+a[1]+' · вес '+a[2]+'%</span><b>'+score+'/100</b><div class="v37-track"><i style="width:'+score+'%"></i></div></div>'}
 out+='</div><h3>Рейтинг нефтяных компаний · 100 участников</h3><div class="table-scroll"><table class="v37-table"><thead><tr><th>Место</th><th>Компания</th><th>Общий балл</th>'+V37_ASPECTS.map(a=>'<th title="'+a[1]+'">'+a[1]+'</th>').join('')+'</tr></thead><tbody>';
 for(let c of list)out+='<tr'+(c.player?' class="v37-player"':'')+'><td>'+c.rank+'</td><td>'+esc(c.name)+(c.player?' ★':'')+'</td><td><b>'+c.score+'</b></td>'+V37_ASPECTS.map(a=>'<td>'+c.aspects[a[0]]+'</td>').join('')+'</tr>';
 out+='</tbody></table></div><p class="muted">Весовая формула: добыча 20%, финансы 20%, безопасность 18%, экология 10%, оборудование 10%, персонал 8%, посёлок 7%, инвестиции 7%. Это не официальный рейтинг реальных компаний. История итоговых лет хранится в сохранении игры.</p></section>';return out;
}
function v37bind(){let e=document.getElementById('v37-year');if(e)e.onchange=()=>{v37init().selectedYear=Number(e.value);render()}}
const v37oldAdvance=v8advance;
v8advance=function(){
 let year=v8init().year;
 v37refresh();
 v37oldAdvance();
 if(v8init().year!==year){
  // Freeze last completed year and then start a new competition.
  v37annualSnapshot(year);
  v37seedSeason(v8init().year);
  v37refresh();
 }else v37tick();
};
const v37oldRender=render;
render=function(){v37oldRender();if(tab==='people'){let el=document.getElementById('body');if(el){el.insertAdjacentHTML('beforeend',v37view());v37bind()}}};

/* v3.6.3: persistent rank in the top bar on every gameplay screen. */
function v37topRank(){
 let d=v37refresh(),live=d.live,rank=live?.rank||100,delta=live?.change||0;
 let move=delta>0?'▲ +'+delta:delta<0?'▼ '+delta:'● 0';
 let direction=delta>0?'up':delta<0?'down':'flat';
 return '<button type="button" id="v37-top-rank" class="v37-top-rank '+direction+'" title="Открыть рейтинг 100 компаний" aria-label="Рейтинг компании: место '+rank+' из 100. Открыть таблицу рейтинга">'+
 '<span class="v37-top-icon">🏆</span><span class="v37-top-content"><span class="v37-top-label">МЕСТО В РЕЙТИНГЕ</span><span class="v37-top-number">№ '+rank+' <small>/ 100</small></span></span><span class="v37-top-change">'+move+'</span></button>';
}
const v37topOldRender=render;
render=function(){
 v37topOldRender();
 let header=document.querySelector('.v11content > header');
 if(!header)return;
 let holder=document.getElementById('v37-top-holder');
 if(!holder){holder=document.createElement('div');holder.id='v37-top-holder';header.appendChild(holder)}
 holder.innerHTML=v37topRank();
 let button=document.getElementById('v37-top-rank');
 if(button)button.onclick=()=>{tab='overview';v37init().selectedYear=v8init().year;render();let section=document.querySelector('.v37-league');if(section)section.scrollIntoView({behavior:'smooth',block:'start'})};
};

/* v3.7: annual production targets, workshop monthly fact, monthly mail, personnel decisions. */
function v38init(){
 if(!s.v38)s.v38={year:v8init().year,annual:0,shops:{},closed:[],decisions:[],reportIds:[]};
 let x=s.v38;x.shops||={};x.closed||=[];x.decisions||=[];x.reportIds||=[];
 if(x.year!==v8init().year){x.year=v8init().year;x.annual=0}
 if(!x.annual)x.annual=v8init().plans.reduce((a,b)=>a+b,0);
 return x;
}
function v38shops(){
 let v=v8init(),d=v38init(),shops=TREE_SHOPS||[];
 let wells=s.assets.wellList||[],weights=shops.map((_,i)=>wells.filter(w=>w.shop===i&&w.status==='Работает').reduce((a,w)=>a+Math.max(0,w.rate*(1-w.water/100)),0));
 let sum=weights.reduce((a,b)=>a+b,0);
 if(!sum)weights=shops.map(()=>1),sum=shops.length;
 return shops.map((name,i)=>({id:i,name,weight:weights[i]/sum}));
}
function v38month(i){
 let d=v38init(),k=v8init().year+'-'+i;
 if(!d.shops[k]){
  let shop=v38shops(),plan=v8init().plans[i];
  d.shops[k]={rows:shop.map(x=>({id:x.id,name:x.name,plan:Math.round(plan*x.weight),actual:0})),locked:false};
  let rows=d.shops[k].rows;if(rows.length)rows[rows.length-1].plan+=plan-rows.reduce((a,x)=>a+x.plan,0);
 }
 return d.shops[k];
}
function v38allocate(dayOil,i){
 let d=v38month(i),shop=v38shops();
 for(let x of d.rows){let w=shop.find(y=>y.id===x.id)?.weight||0;x.actual+=dayOil*w}
}
function v38report(year,i){
 let d=v38init(),v=v8init(),h=v.monthHistory.find(x=>x.year===year&&x.month===i),data=d.shops[year+'-'+i];
 if(!h||!data)return;
 data.locked=true;
 let rows=data.rows.map(x=>({...x,rate:x.plan?100*x.actual/x.plan:100})),met=rows.filter(x=>x.rate>=100),miss=rows.filter(x=>x.rate<100);
 let id='monthly-'+year+'-'+i;
 if(d.reportIds.includes(id))return;
 let lines=rows.map(x=>x.name+': '+f(x.actual)+' / '+f(x.plan)+' т ('+f(x.rate)+'%)');
 let text='ЕЖЕМЕСЯЧНАЯ СВОДКА ПО ДОБЫЧЕ — '+V8_MONTHS[i]+' '+year+
 '\nПлан предприятия: '+f(h.plan)+' т; факт: '+f(h.actual)+' т; выполнение: '+f(h.rate)+'%; отклонение: '+f(h.actual-h.plan)+' т.'+
 '\nЦеха, выполнившие план: '+met.length+'; не выполнившие: '+miss.length+'.\n'+lines.join('\n')+
 '\nПричины отклонений необходимо проверить по фонду работающих скважин, простоям и обводнённости. Данные цехов рассчитаны по игровой модели.';
 let db=v14Sync();
 db.items.unshift({id,text,category:'production',created:v8date(),status:'new',choice:null,outcome:'',readAt:null});
 d.reportIds.push(id);d.closed.unshift({year,month:i,plan:h.plan,actual:h.actual,rows});
 if(d.closed.length>60)d.closed.length=60;
}
const v38oldAdvance=v8advance;
v8advance=function(){
 let v=v8init(),year=v.year,i=v8idx(),before=v.monthHistory.length;
 let weights=v38shops();
 let prior=v.monthActual;
 v38month(i);
 v38oldAdvance();
 let actual=v.year!==year||v8idx()!==i?(v.monthHistory[v.monthHistory.length-1]?.actual||prior)-prior:v.monthActual-prior;
 // Allocation uses real recorded daily produced oil, not theoretical well rates.
 let data=v38init().shops[year+'-'+i];
 if(data){let total=weights.reduce((a,x)=>a+x.weight,0)||1;for(let r of data.rows)r.actual+=Math.max(0,actual)*(weights.find(x=>x.id===r.id)?.weight||0)/total}
 if(v.monthHistory.length>before){
  // On December transition v38init resets year but old shop record remains.
  v38report(year,i);
 }
};
function v38setAnnual(){
 let d=v38init(),v=v8init(),n=prompt('Годовой план добычи, тонн:',String(Math.round(d.annual)));if(n===null)return;
 let total=Number(n);if(!Number.isFinite(total)||total<12000||total>100000000)return uiAlert('Укажите годовой план от 12 000 до 100 000 000 т');
 let reason=prompt('Основание корректировки годового плана:');if(!reason?.trim())return;
 let old=v.plans.slice(),start=v8idx(),fixed=old.slice(0,start).reduce((a,b)=>a+b,0);
 if(total<fixed)return uiAlert('Годовой план меньше уже утверждённых закрытых месяцев');
 let remaining=total-fixed,weights=old.slice(start).map((n,j)=>new Date(v.year,start+j+1,0).getDate());
 let sum=weights.reduce((a,b)=>a+b,0);
 for(let j=start;j<12;j++)v.plans[j]=Math.round(remaining*weights[j-start]/sum);
 v.plans[11]+=total-v.plans.reduce((a,b)=>a+b,0);
 d.annual=v.plans.reduce((a,b)=>a+b,0);
 for(let j=start;j<12;j++)delete d.shops[v.year+'-'+j];
 d.decisions.unshift(v8date()+': годовой план '+f(d.annual)+' т; '+reason.trim());
 v11init().inbox.unshift('Утверждена корректировка годового плана: '+f(d.annual)+' т. Основание: '+reason.trim());
 save();render();
}
function v38setShop(i){
 let v=v8init(),m=v8idx(),data=v38month(m),r=data.rows.find(x=>x.id===i);if(!r)return;
 let raw=prompt('План цеха '+r.name+' на '+V8_MONTHS[m]+', т:',String(r.plan));if(raw===null)return;
 let n=Number(raw);if(!Number.isFinite(n)||n<0||n>v.plans[m])return uiAlert('Некорректный план цеха');
 let reason=prompt('Основание перераспределения:');if(!reason?.trim())return;
 let other=data.rows.filter(x=>x!==r),rest=v.plans[m]-n,prev=other.reduce((a,x)=>a+x.plan,0);
 r.plan=n;let assigned=0;other.forEach((x,j)=>{x.plan=j===other.length-1?rest-assigned:Math.round(rest*(prev?x.plan/prev:1/other.length));assigned+=x.plan});
 v38init().decisions.unshift(v8date()+': план '+r.name+' = '+f(n)+' т; '+reason.trim());save();render();
}
function v38plansView(){
 let v=v8init(),d=v38init(),m=v8idx(),data=v38month(m),yearPlan=v.plans.reduce((a,b)=>a+b,0);
 let closed=v.monthHistory.filter(x=>x.year===v.year).reduce((a,x)=>a+x.actual,0),annualActual=closed+v.monthActual;
 let out='<section class="v38-panel"><h2>Годовой план добычи и выполнение по цехам</h2><div class="v38-stats"><div><small>Годовой план</small><strong>'+f(yearPlan)+' т</strong></div><div><small>Добыто с начала года</small><strong>'+f(annualActual)+' т</strong></div><div><small>Выполнение годового плана</small><strong>'+f(yearPlan?annualActual/yearPlan*100:0)+'%</strong></div></div>';
 out+='<button class="mini-btn" data-v38-annual>Утвердить / изменить годовой план</button><p class="muted">Годовой план распределяется по месяцам с учётом количества календарных дней. Месячный план распределяется по добывающим цехам пропорционально текущему фонду скважин. Корректировки требуют основания, общий план месяца сохраняется.</p>';
 out+='<h3>Цеха добычи — '+V8_MONTHS[m]+' '+v.year+'</h3><div class="table-scroll"><table class="v8table"><thead><tr><th>Цех</th><th>План, т</th><th>Факт, т</th><th>Выполнение</th><th>Решение</th></tr></thead><tbody>';
 for(let r of data.rows)out+='<tr><td>'+esc(r.name)+'</td><td>'+f(r.plan)+'</td><td>'+f(r.actual)+'</td><td>'+f(r.plan?r.actual/r.plan*100:100)+'%</td><td><button class="mini-btn" data-v38-shop="'+r.id+'">Изменить план</button></td></tr>';
 out+='</tbody></table></div><h3>Закрытые месяцы · разбор по цехам</h3>';
 for(let x of d.closed.slice(0,12)){
  let good=x.rows.filter(r=>r.plan===0||r.actual>=r.plan),bad=x.rows.filter(r=>r.plan>0&&r.actual<r.plan);
  out+='<details class="v38-closed"><summary><b>'+V8_MONTHS[x.month]+' '+x.year+'</b> · '+f(x.actual)+' / '+f(x.plan)+' т · выполнили '+good.length+', не выполнили '+bad.length+'</summary>';
  out+='<p><b>Выполнили:</b> '+(good.map(r=>esc(r.name)).join(', ')||'нет')+'</p><p><b>Не выполнили:</b> '+(bad.map(r=>esc(r.name)).join(', ')||'нет')+'</p>';
  for(let r of x.rows)out+=row(esc(r.name),f(r.actual)+' / '+f(r.plan)+' т · '+f(r.plan?r.actual/r.plan*100:100)+'%');
  out+='</details>';
 }
 return out+'</section>';
}
function v38leaderAct(name,act){
 let p=[...v8init().rankCity,...v8init().rankField].find(x=>x.name===name);if(!p)return;
 if(act==='promote'){
  let reason=prompt('Новая должность / основание повышения '+name+':');if(!reason?.trim())return;
  p.job=reason.trim();p.score=cl(p.score+2,0,100);
  v38init().decisions.unshift(v8date()+': повышен '+name+' — '+p.job);
 }else if(act==='dismiss'){
  let reason=prompt('Основание для кадровой проверки по '+name+':');if(!reason?.trim())return;
  v11init().inbox.unshift('Кадровое поручение: проверить основания для увольнения '+name+'. '+reason.trim());
  v38init().decisions.unshift(v8date()+': инициирована процедура проверки по '+name);
  uiAlert('Поручение создано. Увольнение без проверки оснований не выполняется.');
 }
 save();render();
}
function v38leadersView(){
 let v=v8init(),a=[...v.rankCity,...v.rankField].sort((a,b)=>b.score-a.score).slice(0,5);
 return '<section class="v38-panel"><h2>ТОП-5 работников · кадровые решения</h2>'+a.map(p=>'<div class="v38-person"><div><b>'+esc(p.name)+'</b><small>'+esc(p.job)+' · KPI '+p.score+'/100</small></div><div><button class="mini-btn" data-v38-promote="'+esc(p.name)+'">Повысить</button> <button class="mini-btn" data-v38-dismiss="'+esc(p.name)+'">Начать увольнение</button></div></div>').join('')+'<p class="muted">Повышение меняет должность в рейтинге руководителей. Увольнение начинается с кадровой проверки, не производится автоматически.</p></section>';
}
const v38oldHire=v11hire;
v11hire=async function(i){let z=v11init(),before=z.employees.length;await v38oldHire(i);if(z.employees.length>before){let p=z.employees[z.employees.length-1];v8init().salaryFund+=p.salary/1e6;v38init().decisions.unshift(v8date()+': нанят '+p.name+' · оклад '+f(p.salary)+' ₸');save();render()}};
const v38oldPersonAction=v11personAction;
v11personAction=async function(id,act){
 let p=v11init().employees.find(x=>x.id===id),before=p?.salary||0;
 await v38oldPersonAction(id,act);
 if(p&&act==='raise'&&p.salary!==before){v8init().salaryFund+=(p.salary-before)/1e6;save()}
};
const v38oldRender=render;
render=function(){
 v38oldRender();
 let el=document.getElementById('body');if(!el||!s)return;
 if(tab==='daily'){el.insertAdjacentHTML('beforeend',v38plansView());}
 
 el.querySelectorAll('[data-v38-annual]').forEach(b=>b.onclick=v38setAnnual);
 el.querySelectorAll('[data-v38-shop]').forEach(b=>b.onclick=()=>v38setShop(Number(b.dataset.v38Shop)));
 el.querySelectorAll('[data-v38-promote]').forEach(b=>b.onclick=()=>v38leaderAct(b.dataset.v38Promote,'promote'));
 el.querySelectorAll('[data-v38-dismiss]').forEach(b=>b.onclick=()=>v38leaderAct(b.dataset.v38Dismiss,'dismiss'));
};

const v38oldScenario=v14Scenario;
v14Scenario=function(item){
 if(item.id&&item.id.startsWith('monthly-')){
  let text=item.text;
  return {detail:'ОТЧЁТ О ВЫПОЛНЕНИИ ПРОИЗВОДСТВЕННОГО ПЛАНА\n'+text+'\n\nДействия должны учитывать конкретные отстающие цеха, фактический фонд скважин и причины недобора. Пересмотр плана не заменяет восстановление добычи.',options:[
   ['Поручить анализ отклонений по цехам','Проверить простои, обводнённость, фактические дебиты и технические ограничения','investigate'],
   ['Утвердить корректирующие мероприятия','Подготовить адресный план повышения добычи и контроль сроков','coaching'],
   ['Запросить уточнённые производственные данные','Оставить письмо открытым до получения обоснований','clarify']
  ]};
 }
 return v38oldScenario(item);
};

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
 text+='\nРекомендуемое решение: поручить ответственным цехов диагностику, подтвердить причины остановок, приоритизировать критическое оборудование, оформить заявки на ремонт и проверить безопасную готовность к пуску. Состояние 75% и 55% — игровые пороги, не нормативные требования.';
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
 '<p class="muted">В начале каждого игрового месяца закупается недостающий объём порций из расчёта три приёма пищи в день. Цена игровой порции — '+m(x.mealPrice)+'. Если средств недостаточно, списания нет и во «Входящие» поступает предупреждение.</p>'+
 (latest?row('Последняя закупка',latest.date+' · '+latest.status+' · '+m(latest.paid)+' · '+latest.portions+' порций'):'')+'</section>';
 return html+info;
};
/* v3.7.2 — live asset registry, searchable tender selector, acceptance updates. */
function v40assets(){
 ensureAssets();let a=[];
 for(let w of s.assets.wellList)a.push({key:'well:'+w.id,name:'Скважина №'+w.id,area:w.unit||'Фонд скважин',kind:'Скважины',health:Number(w.health)||0,status:w.status||'Не указан',ref:w});
 for(let o of s.assets.infrastructure)a.push({key:'infra:'+o.id,name:o.id,area:o.type||'Инфраструктура',kind:'Инфраструктура',health:Number(o.health)||0,ref:o});
 let n=v20init();for(let [name,o] of Object.entries(n))a.push({key:'gu:'+name,name:name+' · оборудование',area:'Групповая установка',kind:'Оборудование',health:Number(o.health)||0,ref:o});
 let p=ensurePlant();for(let o of p.types)a.push({key:'plant:'+o.id,name:o.name,area:'Производственное оборудование',kind:'Оборудование',health:Number(o.condition)||0,ref:o});
 let d=v30init();for(let o of d.tanks)a.push({key:'tank:'+o.id,name:o.name,area:'ЦППН · резервуарный парк',kind:'Резервуары',health:Number(o.health)||0,ref:o});
 for(let i=0;i<d.facilities.length;i++){let o=d.facilities[i];a.push({key:'building:'+i,name:o.name,area:'Здания и сооружения',kind:'Здания',health:Number(o.health)||0,ref:o})}
 let extra=v40init();for(let o of extra.assets)a.push({key:'extra:'+o.id,name:o.name,area:o.area,kind:o.kind,health:Number(o.health)||0,ref:o});
 return a;
}
function v40init(){if(!s.v40)s.v40={assets:[],next:0,acceptance:[]};s.v40.assets||=[];s.v40.acceptance||=[];return s.v40}
function v40allowed(type){
 if(['prs','krs'].includes(type))return ['Скважины'];
 if(['rvs_repair','rvs_clean','anticorrosion'].includes(type))return ['Резервуары'];
 if(['building_repair','painting'].includes(type))return ['Здания','Резервуары','Оборудование','Инфраструктура'];
 if(['maint','automation','electrical','inspection'].includes(type))return ['Оборудование','Инфраструктура','Резервуары','Здания'];
 if(['roads','fencing','pipeline','lighting','foundation','earthworks'].includes(type))return ['Инфраструктура','Здания'];
 return ['Скважины','Резервуары','Оборудование','Здания','Инфраструктура'];
}
function v40createTender(type,asset,customName){
 let d=v28migrateNames(),t=V27_TYPES[type];if(!t)return;
 let name=asset?asset.name:customName;
 if(!name)return uiAlert('Выберите объект');
 if(asset&&(d.contracts.some(c=>c.assetKey===asset.key&&c.status==='Исполняется')||d.tenders.some(x=>x.assetKey===asset.key&&x.status==='Приём заявок')))return uiAlert('По объекту уже есть активный договор или тендер');
 let w=asset?.key.startsWith('well:')?Number(asset.key.split(':')[1]):null;
 let x={id:++d.seq,type,well:w,assetKey:asset?.key||null,assetHealthBefore:asset?.health??null,objectName:name,created:v8date(),status:'Приём заявок',bids:v27bids(type,d.seq)};
 d.tenders.unshift(x);log('Объявлен тендер №'+x.id+': '+t.label+' · '+name);save();v40close();render();
}
function v40close(){document.getElementById('v40picker')?.remove()}
function v40openPicker(type){
 v40close();let kinds=v40allowed(type),newBuild=['building','rvs_build','drill','design','survey'].includes(type);
 let modal=document.createElement('div');modal.id='v40picker';modal.className='v40-overlay';modal.innerHTML='<div class="v40-dialog" role="dialog" aria-modal="true" aria-label="Выбор объекта работ"><div class="v40-top"><h2>Выбор объекта · '+esc(V27_TYPES[type].label)+'</h2><button type="button" id="v40close">✕ Закрыть</button></div><p class="muted">Состояние берётся из реестров действующей игры. Выберите объект — название и состояние заполнятся автоматически.</p><div class="v40-filters"><input id="v40search" placeholder="Поиск по номеру, названию, цеху"><select id="v40kind"><option value="">Все категории</option>'+kinds.map(k=>'<option>'+esc(k)+'</option>').join('')+'</select><select id="v40sort"><option value="health">Сначала проблемные</option><option value="name">По названию</option></select></div><div id="v40results" class="v40-results"></div>'+(newBuild?'<div class="v40-new"><label>Новый объект / проект строительства</label><input id="v40new" placeholder="Название нового объекта"><button id="v40add">Создать тендер на новый объект</button></div>':'')+'</div>';
 document.body.appendChild(modal);
 const update=()=>{
  let q=modal.querySelector('#v40search').value.toLowerCase(),k=modal.querySelector('#v40kind').value,sort=modal.querySelector('#v40sort').value;
  let list=v40assets().filter(a=>kinds.includes(a.kind)&&(!k||a.kind===k)&&(a.name+' '+a.area).toLowerCase().includes(q));
  list.sort((a,b)=>sort==='health'?a.health-b.health:a.name.localeCompare(b.name,'ru'));
  let busy=v28migrateNames();modal.querySelector('#v40results').innerHTML=list.slice(0,180).map(a=>{
   let locked=busy.contracts.some(c=>c.assetKey===a.key&&c.status==='Исполняется')||busy.tenders.some(t=>t.assetKey===a.key&&t.status==='Приём заявок');
   let color=a.health<=55?'#e56767':a.health<=75?'#f0b54e':'#56c894';
   return '<button type="button" class="v40-item" data-key="'+esc(a.key)+'" '+(locked?'disabled':'')+'><span><b>'+esc(a.name)+'</b><small>'+esc(a.area)+' · '+esc(a.kind)+' · '+esc(a.status||'')+(locked?' · УЖЕ В РАБОТЕ':'')+'</small></span><span class="v40-meter"><b style="color:'+color+'">'+Math.round(a.health)+'%</b><i><em style="width:'+Math.max(0,Math.min(100,a.health))+'%;background:'+color+'"></em></i></span></button>';
  }).join('')||'<p class="muted">Объекты не найдены</p>';
  modal.querySelectorAll('[data-key]').forEach(b=>b.onclick=()=>v40createTender(type,v40assets().find(a=>a.key===b.dataset.key)));
 };
 for(let id of ['v40search','v40kind','v40sort'])modal.querySelector('#'+id).addEventListener(id==='v40search'?'input':'change',update);
 modal.querySelector('#v40close').onclick=v40close;
 modal.addEventListener('click',e=>{if(e.target===modal)v40close()});
 if(newBuild)modal.querySelector('#v40add').onclick=()=>{let name=modal.querySelector('#v40new').value.trim().slice(0,120);if(!name)return uiAlert('Введите название нового объекта');v40createTender(type,null,name)};
 update();modal.querySelector('#v40search').focus();
}
function v40acceptRepair(c){
 if(!c.assetKey||v40init().acceptance.includes(c.id))return;
 let asset=v40assets().find(a=>a.key===c.assetKey);if(!asset)return;
 let x=v36contract(c);if(!x.acceptedAt)return;
 let value=asset.ref,quality=Math.max(0,Math.min(100,Number(c.quality)||70));
 let target=Math.min(100,Math.round(75+quality*.25));
 if(['rvs_repair','building_repair','maint','prs','krs','pipeline','electrical','automation','inspection'].includes(c.type)){
  if('health' in value)value.health=Math.max(Number(value.health)||0,target);
  if('condition' in value)value.condition=Math.max(Number(value.condition)||0,target);
 }
 if(['painting','anticorrosion'].includes(c.type)&&'paint' in value)value.paint=Math.max(Number(value.paint)||0,target);
 if(c.type==='rvs_clean'&&'health' in value)value.health=Math.min(100,(Number(value.health)||0)+12);
 v40init().acceptance.push(c.id);
 log('Приняты работы по объекту '+asset.name+' · договор №'+c.id+' · состояние обновлено');
}
const v40oldAccept=v36accept;
v36accept=function(id,index){v40oldAccept(id,index);if(index===2){let c=v28migrateNames().contracts.find(c=>c.id===id);if(c)v40acceptRepair(c)}save()};
const v40oldContractsView=v27view;
v27view=function(){let out=v40oldContractsView();return '<p class="v40-hint">Для тендера выберите объект из реестра: скважины, насосы, оборудование, РВС, здания и инфраструктура. Состояние и местоположение заполняются автоматически. Для нового строительства доступен ввод названия проекта.</p>'+out};

/* v3.7.3: unified shop plan/fact, personnel succession, mobile layout */
function v40init(){
 if(!s.v40)s.v40={staffChanges:[],vacancies:[],audit:[],productionMigration:false};
 return s.v40;
}
function v40syncShops(){
 let v=v8init(),d=v38month(v8idx()),o=ensureOperations();
 for(let sh of o.shops.filter(x=>x.kind==='oil')){
  let r=d.rows.find(x=>x.id===sh.id);
  if(!r)continue;
  sh.plan=r.plan;
 }
}
const v40oldOpsView=opsView;
opsView=function(){
 v40syncShops();
 let o=ensureOperations(),d=v38month(v8idx()),saved=[];
 for(let sh of o.shops.filter(x=>x.kind==='oil')){
  let x=d.rows.find(r=>r.id===sh.id);if(!x)continue;
  saved.push({sh,history:sh.history});
  let actual=x.actual,pct=x.plan?actual/x.plan*100:0;
  sh.history=[{actual,plan:x.plan,pct,delta:actual-x.plan,kpi:Math.min(100,Math.round(pct))},...sh.history];
 }
 try{return v40oldOpsView()}
 finally{for(let x of saved)x.sh.history=x.history}
};
const v40oldShopAction=shopAction;
shopAction=async function(act,id){
 if(act==='plan'){
  let sh=ensureOperations().shops.find(x=>x.id===Number(id));
  if(sh?.kind==='oil')return v38setShop(sh.id);
 }
 return v40oldShopAction(act,id);
};
function v40candidateList(exclude){
 let v=v8init(),list=[...v.rankCity,...v.rankField].filter(x=>x.name!==exclude&&!x.dismissed);
 return list.sort((a,b)=>b.score-a.score);
}
async function v40personnel(name,act){
 let v=v8init(),p=[...v.rankCity,...v.rankField].find(x=>x.name===name&&!x.dismissed);
 if(!p)return uiAlert('Сотрудник не найден или уже уволен');
 let d=v40init(),oldJob=p.job;
 if(act==='promote'){
  let title=await uiPrompt('Новая должность для '+p.name+':',p.job);
  if(!title?.trim()||title.trim()===p.job)return;
  let reason=await uiPrompt('Основание повышения:');
  if(!reason?.trim())return;
  if(!await uiConfirm('Назначить '+p.name+' на должность '+title.trim()+'?'))return;
  p.job=title.trim();p.score=cl(p.score+2,0,100);
  d.staffChanges.unshift(v8date()+' · повышение: '+p.name+' · '+oldJob+' → '+p.job+' · '+reason);
 }else if(act==='dismiss'){
  let reason=await uiPrompt('Основание увольнения '+p.name+' (учебная модель):');
  if(!reason?.trim())return;
  let candidates=v40candidateList(name);
  let choices=candidates.slice(0,10).map((x,i)=>(i+1)+'. '+x.name+' ('+x.job+', KPI '+x.score+')').join('\n');
  let answer=await uiPrompt('Выберите преемника (номер 1–10), либо 0 — оставить вакансию с и.о.:\n'+choices,'1');
  if(answer===null)return;
  let index=Number(answer),successor=index===0?null:candidates[index-1];
  if(!Number.isInteger(index)||index<0||index>10||(index>0&&!successor))return uiAlert('Некорректный выбор кандидата');
  let message='Уволить '+p.name+' с должности '+oldJob+'. '+(successor?'Назначить '+successor.name+' на освободившуюся должность.':'Открыть вакансию и назначить временное исполнение обязанностей.');
  if(!await uiConfirm(message))return;
  p.dismissed=true;p.job='Уволен · '+oldJob;
  let hr=v11init().employees.find(x=>x.name===p.name&&x.status==='Работает');
  if(hr){hr.status='Уволен';v.salaryFund=Math.max(0,v.salaryFund-hr.salary/1e6)}
  if(successor){
   let previous=successor.job;
   successor.job=oldJob;
   d.vacancies.push({job:previous,previous:successor.name,created:v8date(),status:'Вакансия'});
   d.staffChanges.unshift(v8date()+' · увольнение '+p.name+'; '+successor.name+' назначен на '+oldJob+'; открыта вакансия '+previous+' · '+reason);
  }else{
   d.vacancies.push({job:oldJob,previous:p.name,created:v8date(),status:'И.о. / вакансия'});
   d.staffChanges.unshift(v8date()+' · увольнение '+p.name+'; вакансия '+oldJob+' · '+reason);
  }
  v11init().inbox.unshift('Кадровый приказ: '+d.staffChanges[0]);
 }
 if(d.staffChanges.length>100)d.staffChanges.length=100;
 save();render();
}
const v40oldPeopleView=v8peopleView;
v8peopleView=function(){
 let v=v8init(),d=v40init(),old=v40oldPeopleView();
 // Original TOP-5 cards stay, but each row now has its own management controls.
 let make=(people)=>people.map(p=>'<div class="v40-actions"><button class="mini-btn" data-v40-person="'+esc(p.name)+'" data-v40-action="promote">Повысить</button><button class="mini-btn" data-v40-person="'+esc(p.name)+'" data-v40-action="dismiss">Уволить / заменить</button></div>');
 let groups=[v.rankCity,v.rankField];
 let j=0;
 // Replace each TOP-5 row by a row plus actions; target rows inside original two group cards only.
 let wrapper=document.createElement('div');wrapper.innerHTML=old;
 let cards=wrapper.querySelectorAll('.v8card');
 for(let card of cards){
  if(!card.textContent.includes('ТОП-5 лучших'))continue;
  let data=groups[j++]||[];
  let sorted=[...data].filter(x=>!x.dismissed).sort((a,b)=>b.score-a.score);
  let ranks=card.querySelectorAll('.fields > div');
  for(let [i,list] of [sorted.slice(0,5),sorted.slice(-5).reverse()].entries()){
   if(!ranks[i])continue;
   ranks[i].innerHTML='<h3>'+(i?'↘ ТОП-5 требующих внимания':'🏆 ТОП-5 лучших')+'</h3>'+
    list.map(p=>'<div class="v40-employee"><div><b>'+esc(p.name)+'</b><small>'+esc(p.job)+' · KPI '+p.score+'/100</small></div><div class="v40-actions"><button class="mini-btn" data-v40-person="'+esc(p.name)+'" data-v40-action="promote">Повысить</button><button class="mini-btn" data-v40-person="'+esc(p.name)+'" data-v40-action="dismiss">Уволить / заменить</button></div></div>').join('');
  }
 }
 let vacancies='<section class="v38-panel"><h3>Кадровые назначения и вакансии</h3>'+
 (d.vacancies.length?d.vacancies.slice(-10).reverse().map(x=>row(esc(x.job),esc(x.status)+' · '+esc(x.created))).join(''):'<p class="muted">Открытых вакансий пока нет.</p>')+
 '<h3>Журнал кадровых решений</h3>'+d.staffChanges.slice(0,10).map(x=>'<p class="v8small">'+esc(x)+'</p>').join('')+'</section>';
 return wrapper.innerHTML+vacancies;
};
const v40oldRender=render;
render=function(){
 v40oldRender();
 if(tab!=='people')return;
 let el=document.getElementById('body');if(!el)return;
 el.querySelectorAll('[data-v40-person]').forEach(b=>b.onclick=()=>v40personnel(b.dataset.v40Person,b.dataset.v40Action));
};
/* v3.7.4: remove duplicated month controls and reconcile monthly shop reporting. */
function v41reconcile(year,month,actual,plan){
 let d=v38init(),k=year+'-'+month,data=d.shops[k];if(!data||!data.rows.length)return;
 // The monthly company actual is authoritative. Keep shop shares and force exact sum.
 let rows=data.rows,prev=rows.reduce((a,r)=>a+Math.max(0,Number(r.actual)||0),0);
 let weights=prev>0?rows.map(r=>Math.max(0,Number(r.actual)||0)/prev):rows.map(r=>Math.max(0,Number(r.plan)||0)/Math.max(1,plan));
 let sum=weights.reduce((a,b)=>a+b,0)||1,assigned=0;
 rows.forEach((r,i)=>{r.actual=i===rows.length-1?actual-assigned:Math.round(actual*weights[i]/sum*10)/10;assigned+=r.actual});
 let planned=rows.reduce((a,r)=>a+Number(r.plan||0),0);
 if(Math.abs(planned-plan)>0.5){let ratio=planned>0?plan/planned:0,total=0;rows.forEach((r,i)=>{r.plan=i===rows.length-1?plan-total:Math.round(r.plan*ratio);total+=r.plan})}
}
// Show only one production-planning interface: annual plan, shop breakdown and detailed closures.
const v41oldDailyView=v8dailyView;
v8dailyView=function(){
 let html=v41oldDailyView();
 let start=html.indexOf('<h3>Корректировка планов по месяцам</h3>');
 if(start<0)return html;
 return html.slice(0,start)+'<p class="v8small">Изменение планов и разбор закрытых месяцев находятся ниже, в едином разделе «Годовой план добычи и выполнение по цехам».</p>';
};
const v41oldReport=v38report;
v38report=function(year,month){
 let v=v8init(),h=v.monthHistory.find(x=>x.year===year&&x.month===month);
 if(h){v41reconcile(year,month,h.actual,h.plan);let d=v38init(),existing=d.closed.find(x=>x.year===year&&x.month===month);if(existing){existing.actual=h.actual;existing.plan=h.plan;existing.rows=d.shops[year+'-'+month]?.rows.map(r=>({...r,rate:r.plan?r.actual/r.plan*100:100}))||existing.rows}}
 return v41oldReport(year,month);
};
// Repair older saves with impossible shop sums and inconsistent completion counts.
const v41oldPlansView=v38plansView;
v38plansView=function(){
 let v=v8init(),d=v38init();
 for(let h of v.monthHistory){let k=h.year+'-'+h.month,entry=d.shops[k];if(!entry)continue;
  let total=entry.rows.reduce((a,r)=>a+(Number(r.actual)||0),0);
  if(Math.abs(total-h.actual)>0.5){v41reconcile(h.year,h.month,h.actual,h.plan);let closed=d.closed.find(x=>x.year===h.year&&x.month===h.month);if(closed){closed.actual=h.actual;closed.plan=h.plan;closed.rows=entry.rows.map(r=>({...r,rate:r.plan?r.actual/r.plan*100:100}))}}
 }
 return v41oldPlansView();
};
/* Small active company: one existing well, staged development, legacy saves preserved. */
const SMALL_STEPS=[['Геологическое обоснование',12,28],['Проектирование и согласования',20,42],['Подготовка площадки',15,65],['Тендер и договор на бурение',10,90],['Бурение',45,600],['Испытание и освоение',12,75],['Обустройство и подключение',20,145],['Приёмка и ввод',7,30]];
function smallInit(){return s.small|| (s.small={projects:[],seq:0,events:[],tankCapacity:1000})}
function smallNew(){s.wells=1;s.rate=16;s.water=23;s.pending=[];s.assets={wellList:[{id:1001,unit:'ГУ-1',shop:0,status:'Работает',rate:16,water:23,health:87,equipment:{type:'ШГН'}}],infrastructure:[{id:'РВС-1',type:'Резервуар',health:90},{id:'ВЛ-1',type:'Выкидная линия',health:91},{id:'УУН-1',type:'Узел учёта',health:90},{id:'ВАГ-1',type:'Вагончик',health:92}]};s.small={projects:[],seq:0,events:['Старт: одна действующая скважина, один РВС и минимальная инфраструктура'],tankCapacity:1000};s.v8=null;s.v21=null;s.v38=null;save()}
function smallStart(){let d=smallInit();if(d.projects.some(x=>x.status==='В работе'))return uiAlert('Завершите текущий проект');let well=Math.max(1000,...s.assets.wellList.map(x=>+x.id||0))+1;d.projects.push({id:++d.seq,well,phase:0,days:0,status:'В работе'});save();render()}
function smallPhase(id){let p=smallInit().projects.find(x=>x.id===id);if(!p||p.days||p.status!=='В работе')return;let [name,days,cost]=SMALL_STEPS[p.phase];if(s.cash<cost)return uiAlert('Недостаточно средств');s.cash-=cost;p.days=days;smallInit().events.unshift('Скважина №'+p.well+': '+name+' · '+days+' дн. · '+cost+' млн ₸');save();render()}
function smallDay(){if(!s?.small)return;for(let p of s.small.projects){if(p.status!=='В работе'||p.days<=0)continue;if(--p.days>0)continue;if(p.phase===5){p.rate=Math.random()<.78?Math.round((7+Math.random()*15)*10)/10:0;if(!p.rate){p.status='Без притока';s.small.events.unshift('Скважина №'+p.well+': промышленный приток не получен');continue}}p.phase++;if(p.phase===SMALL_STEPS.length){p.status='Введена';s.wells++;s.assets.wellList.push({id:p.well,unit:'ГУ-1',shop:0,status:'Работает',rate:p.rate,water:25,health:96,equipment:{type:'ШГН'}});s.small.events.unshift('Введена новая скважина №'+p.well)}}}
function smallView(){let d=smallInit();return '<section class="small-panel"><h2>Поэтапное развитие скважин</h2><p class="muted">На старте одна действующая скважина и один РВС. Следующие скважины вводятся только после выполнения восьми этапов.</p><p><b>Фонд скважин: '+s.assets.wellList.length+'</b> · РВС-1: '+d.tankCapacity+' т</p>'+(d.projects.some(p=>p.status==='В работе')?'':'<button class="btn" data-small="new">Начать проект новой скважины</button>')+d.projects.map(p=>'<div class="small-project"><b>Скважина №'+p.well+' · '+p.status+'</b><p>'+(p.phase<8?'Этап '+(p.phase+1)+'/8: '+SMALL_STEPS[p.phase][0]:'Проект завершён')+'</p>'+(p.status==='В работе'?(p.days>0?'<span>Осталось '+p.days+' дней</span>':'<button class="btn secondary" data-small="phase" data-id="'+p.id+'">Начать этап · '+SMALL_STEPS[p.phase][2]+' млн ₸</button>'):'')+'</div>').join('')+'</section>'}
const smallOldAction=action;action=function(t){if(s?.small&&t==='drill')return uiAlert('Новые скважины вводятся через раздел «Поэтапное развитие скважин»');return smallOldAction(t)};
const smallOldAdvance=v8advance;v8advance=function(){smallOldAdvance();smallDay()};
const smallOldRender=render;render=function(){smallOldRender();if(!s||tab!=='overview')return;let el=document.querySelector('#body');if(el){let box=document.createElement('div');box.innerHTML=smallView();el.prepend(box)}};
document.addEventListener('click',e=>{let b=e.target.closest('[data-small]');if(!b)return;if(b.dataset.small==='new')smallStart();if(b.dataset.small==='phase')smallPhase(+b.dataset.id)});
const smallOldNew=$('new').onclick;$('new').onclick=async()=>{await smallOldNew();if(s?.wells===240){smallNew();render()}};
/* v3.8.1: economy of one producing well; old careers unchanged. */
function v41init(){if(!s?.small)return null;return s.small.economy||(s.small.economy={monthlyFixed:.9,notes:[]})}
function v41bootstrap(){if(!s?.small)return;let e=v41init();if(e.bootstrapped)return;
 let v=v8init();v.salaryFund=3.6;v.plans=Array(12).fill(300);v.originalPlans=[...v.plans];if(s.enterprise){s.enterprise.staff=12;s.enterprise.target=300}
 s.v30=null;v30init().tanks=[{id:1,name:'РВС-1000 №1',capacity:1000,level:0,health:90,paint:90,fire:90}];
 s.v33=null;let c=v33init();c.seq=1;c.contracts=[{id:1,buyer:'Каспийский Нефтетрейдер',daily:35,remaining:10000,fulfilled:0,status:'Действует',created:'Стартовый договор',priceMultiplier:1,terms:7,advancePct:0}];c.shipments=[];s.v32=null;
 e.bootstrapped=true;e.notes.unshift('Стартовый баланс: 1 скважина, РВС 1000 т, договор 35 т/сут, ФОТ 3,6 млн ₸/мес.');}
const v41oldSmallNew=smallNew;smallNew=function(){v41oldSmallNew();v41bootstrap();save()};
const v41oldSmallDay=smallDay;smallDay=function(){v41oldSmallDay();if(!s?.small)return;let e=v41init(),t=v30init().tanks[0],d=v32init(),last=d.days[d.days.length-1];if(!last)return;
 let fixed=e.monthlyFixed/v8days();s.cash-=fixed;v25post('opex',fixed,{description:'Содержание промысла и обязательные договоры'});
 if(t.level>=t.capacity*.9&&!e.warned){e.warned=true;e.notes.unshift('РВС заполнен более чем на 90%. Проверьте договор отгрузки.')}if(t.level<t.capacity*.75)e.warned=false;
 if(s.cash<0&&!s.dead){s.dead=true;log('Недостаточно средств для содержания предприятия')}};
const v41oldSmallView=smallView;smallView=function(){if(!s?.small)return '';let e=v41init(),t=v30init().tanks[0],d=v32init(),last=d.days[d.days.length-1],v=v8init(),c=v33init().contracts.filter(x=>x.status==='Действует');
 let items=[['Работающих скважин',s.assets.wellList.filter(x=>x.status==='Работает').length],['Добыто за сутки',f(last?.produced||0)+' т'],['План месяца',f(v8plan())+' т'],['РВС',f(t.level)+' / '+f(t.capacity)+' т'],['Отгружено за сутки',f(last?.sold||0)+' т'],['Договоры реализации',c.length],['ФОТ в месяц',m(v.salaryFund)],['Содержание в месяц',m(e.monthlyFixed)]];
 return '<section class="small-panel"><h2>Экономика малого промысла</h2><p class="muted">Добыча → подготовка → РВС → договорная отгрузка → оплата. Добыча не равна продаже.</p><div class="small-economy-grid">'+items.map(x=>'<div><small>'+x[0]+'</small><b>'+x[1]+'</b></div>').join('')+'</div><div class="v41tank">Заполнение РВС: '+f(t.level/t.capacity*100)+'%<div><i style="width:'+Math.min(100,t.level/t.capacity*100)+'%"></i></div></div>'+(c.length?'':'<p class="notice bad">Нет действующего договора продажи. Нефть накапливается.</p>')+(e.notes.length?'<p class="muted">'+esc(e.notes[0])+'</p>':'')+'</section>'+v41oldSmallView()};
/* v3.8.2 — incremental staffing, real cash movement, gated shift-camp construction. */
const GROW_ROLES=[['Оператор добычи',2,.55,8],['Слесарь-ремонтник',2,.62,9],['Электромонтёр',1,.68,11],['Мастер участка',1,.88,15],['Инженер по промышленной безопасности',1,.78,13],['Инженер-эколог',1,.72,12],['Специалист по пожарной безопасности',1,.72,12],['Лаборант',1,.52,10],['Водитель',2,.5,8],['Работники обеспечения',5,.43,8]];
const GROW_BUILD=[['Проектирование вахтового посёлка',30,85],['Подготовка территории и коммуникаций',45,180],['Строительство жилого корпуса на 60 мест',75,550],['Столовая и санитарно-бытовой корпус',50,300],['Противопожарное оснащение и приёмка',20,125]];
function growInit(){if(!s?.small)return null;return s.small.growth||(s.small.growth={staff:12,roster:[],hiring:null,building:null,campReady:false,stage:0,log:[],costs:0,buildings:[]})}
function growBootstrap(){if(!s?.small)return;let g=growInit();if(g.ready)return;g.ready=true;g.staff=12;g.roster=[{job:'Минимальная производственная смена и управление',count:12,salary:3.6}];g.log.unshift('Старт: 12 работников, отдельного вахтового посёлка нет. Временный бытовой вагончик уже действует.');let c=v36init().camp;c.residents=0;c.beds=0;c.guards=0;c.mealStock=0;c.housing=85;c.cleanliness=85;c.security=85;v8init().salaryFund=3.6;}
function growStaffCount(){let g=growInit();return g?g.staff:0}
function growHire(i){let g=growInit();if(!g||g.hiring||g.building)return uiAlert('Сначала завершите текущее кадровое или строительное мероприятие.');let r=GROW_ROLES[i];if(!r)return;let [job,count,salary,days]=r,fee=Math.round(count*salary*.3*100)/100;if(s.cash<fee)return uiAlert('Недостаточно средств для подбора персонала.');s.cash-=fee;v25post('opex',fee,{description:'Подбор персонала: '+job});g.hiring={job,count,salary,days,fee};g.log.unshift('Открыт подбор: '+job+' ('+count+' чел.), срок '+days+' дней.');save();render()}
function growBuild(){let g=growInit();if(!g||g.building)return;if(g.staff<50)return uiAlert('Вахтовый посёлок доступен после достижения штата 50 работников.');if(g.stage>=GROW_BUILD.length)return;let [name,days,cost]=GROW_BUILD[g.stage];if(s.cash<cost)return uiAlert('Недостаточно денег: требуется '+m(cost));s.cash-=cost;v25post('maintenance',cost,{description:'Строительство вахтового посёлка: '+name});g.costs+=cost;g.building={name,days,cost};g.log.unshift('Начаты работы: '+name+', '+days+' дней.');save();render()}
function growDay(){if(!s?.small)return;let g=growInit();if(!g.ready)growBootstrap();if(g.hiring&&--g.hiring.days<=0){let h=g.hiring;g.staff+=h.count;g.roster.push({job:h.job,count:h.count,salary:h.count*h.salary});v8init().salaryFund=Math.round(g.roster.reduce((a,r)=>a+r.salary,0)*100)/100;if(s.enterprise)s.enterprise.staff=g.staff;g.log.unshift('Приняты '+h.count+' чел.: '+h.job+'. Штат '+g.staff+', ФОТ '+m(v8init().salaryFund)+'/мес.');g.hiring=null;}
 if(g.building&&--g.building.days<=0){let b=g.building;g.buildings.push(b.name);g.stage++;g.log.unshift('Принят этап: '+b.name);g.building=null;if(g.stage===GROW_BUILD.length){g.campReady=true;let c=v36init().camp;c.beds=60;c.guards=3;c.mealStock=60*3*10;c.residents=Math.min(g.staff,60);g.log.unshift('Вахтовый посёлок введён: 60 мест. Начались расходы на питание, охрану и содержание.')}}
 if(g.campReady){let c=v36init().camp;c.residents=Math.min(g.staff,c.beds)}
 if(g.log.length>100)g.log.length=100;
}
function growView(){let g=growInit();if(!g)return '';let e=s.small.economy||{},cash=Number(s.cash)||0;let pct=g.staff/50*100;let html='<section class="small-panel"><h2>Развитие штата и вахтового посёлка</h2><p class="muted">Работники принимаются после подбора; ФОТ увеличивается только после оформления. До 50 работников используются существующие бытовые помещения и подрядные услуги. Посёлок не появляется автоматически.</p><div class="small-economy-grid">'+[['Штат',g.staff+' чел.'],['До порога посёлка',Math.max(0,50-g.staff)+' чел.'],['ФОТ за месяц',m(v8init().salaryFund)],['Денежные средства',m(cash)],['Этап посёлка',g.stage+'/5'],['Капвложения в посёлок',m(g.costs)]].map(x=>'<div><small>'+x[0]+'</small><b>'+x[1]+'</b></div>').join('')+'</div>';
 if(g.hiring)html+='<p class="notice">Подбор: '+esc(g.hiring.job)+' · осталось '+g.hiring.days+' дн.</p>';
 html+='<h3>Поэтапный набор персонала</h3><div class="grow-actions">'+GROW_ROLES.map((r,i)=>'<div><b>'+esc(r[0])+'</b><small>'+r[1]+' чел. · +'+m(r[1]*r[2])+'/мес. · '+r[3]+' дн.</small><button class="mini-btn" data-grow-hire="'+i+'" '+(g.hiring||g.building?'disabled':'')+'>Начать подбор</button></div>').join('')+'</div>';
 html+='<h3>Вахтовый посёлок · после 50 работников</h3>';
 if(g.staff<50)html+='<p class="notice">Строительство пока недоступно: требуется штат не менее 50 человек. Осталось '+(50-g.staff)+' чел.</p>';
 else if(g.campReady)html+='<p class="notice">Посёлок введён в эксплуатацию: 60 мест. Проживание, питание и охрана учитываются в расходах.</p>';
 else{let b=GROW_BUILD[g.stage];html+='<p class="muted">'+(g.building?'Выполняется '+esc(g.building.name)+', осталось '+g.building.days+' дн.':'Следующий этап: '+esc(b[0])+' · '+b[1]+' дн. · '+m(b[2]))+'</p>'+(g.building?'':'<button class="btn" data-grow-build="1" '+(cash<b[2]?'disabled':'')+'>Начать строительный этап</button>')}
 html+='<h3>Принятый персонал</h3>'+g.roster.map(r=>'<div class="row"><span>'+esc(r.job)+' · '+r.count+' чел.</span><b>'+m(r.salary)+'/мес.</b></div>').join('')+'<h3>История решений</h3>'+g.log.slice(0,6).map(x=>'<p class="muted">'+esc(x)+'</p>').join('')+'</section>';return html}
const growOldBootstrap=v41bootstrap;v41bootstrap=function(){growOldBootstrap();growBootstrap()};
const growOldDay=smallDay;smallDay=function(){growOldDay();growDay()};
const growOldView=smallView;smallView=function(){return growOldView()+growView()};
const growOldCampDaily=v36daily;v36daily=function(){if(s?.small){let g=growInit();if(!g?.campReady){let c=v36init().camp;c.residents=0;c.guards=0;c.beds=0;c.mealStock=0;} }return growOldCampDaily()};
const growOldCampView=v36campView;v36campView=function(){if(s?.small&&!growInit()?.campReady)return '<section class="small-panel"><h3>Вахтовый посёлок</h3><p class="muted">Посёлок ещё не построен. Доступен после достижения штата 50 человек и завершения пяти строительных этапов.</p></section>';return growOldCampView()};
document.addEventListener('click',e=>{let b=e.target.closest('[data-grow-hire],[data-grow-build]');if(!b)return;if(b.hasAttribute('data-grow-hire'))growHire(+b.dataset.growHire);else growBuild()});
/* v3.8.3 — only for small-company careers. Existing large-company saves are unchanged. */
const SMALL_START_POSITIONS=[
 ['Управление','Директор предприятия',.55],['Производство','Мастер участка',.42],
 ['Производство','Оператор добычи (вахта 1)',.29],['Производство','Оператор добычи (вахта 2)',.29],
 ['Ремонт','Слесарь-ремонтник',.28],['Энергетика','Электромонтёр',.31],
 ['Диспетчеризация','Диспетчер',.26],['Логистика','Водитель',.25],
 ['Безопасность','Специалист по БиОТ и промышленной безопасности',.35],
 ['Экология','Инженер-эколог',.27],['Учёт','Бухгалтер',.22],
 ['Обеспечение','Работник хозяйственного обеспечения',.12]
];
function v43setup(){
 if(!s?.small)return;
 let x=s.small;if(x.cleaned)return;
 const g=growInit();if(!g.ready)growBootstrap();
 // Replace the fictional large company's staff list, instead of just changing its total.
 let e=ensureEnterprise();e.staff=g.staff;e.target=300;
 e.dept=[{name:'Малый производственный участок',headcount:7,chief:'Мастер участка'},
 {name:'Управление и обеспечение',headcount:3,chief:'Директор предприятия'},
 {name:'Безопасность и экология',headcount:2,chief:'Ответственные специалисты'}];
 let employees=[],positions=[];
 SMALL_START_POSITIONS.forEach(([dept,role,salary],i)=>{
  let id='S'+(i+1),eid='SE'+(i+1);
  positions.push({id,dept,role,salary,employeeId:eid});
  employees.push({id:eid,name:hrName(i+1),positionId:id,experience:3+i%8,performance:72+i%16,training:78,status:'Работает'});
 });
 e.hr={positions,employees,history:[],seq:12,initial:12,baseStaff:0,selected:'Управление',uniqueSurnameV18:true};
 // Reconcile payroll once. The growth module remains the only source for future hiring.
 g.roster=[{job:'Стартовый штат (12 должностей)',count:12,salary:3.6}];
 v8init().salaryFund=3.6;
 // Remove automatically generated company-wide warehouses and hundreds of equipment units.
 s.plant={types:[{id:0,name:'Станок-качалка',qty:1,expired:0,extended:0,price:5,condition:87,maintenance:0,renewed:0},
 {id:1,name:'Узел учёта',qty:1,expired:0,extended:0,price:4,condition:90,maintenance:0,renewed:0}],
 stock:[{id:0,name:'ЗИП и расходные материалы',qty:12,minimum:4,price:.2,consumed:0}],
 history:[],investment:0,warehouseSpend:0,selected:0,warning:'Стартовый склад малого нефтепромысла; дополнительные активы приобретаются по мере развития.'};
 // Only one collection point; no fictional second field or PPD complex.
 s.operations={shops:[{id:0,name:'Производственный участок №1',kind:'Добыча',plan:300,efficiency:86,discipline:85,chief:'Мастер участка',history:[],warnings:0,invested:0,review:0}],cases:[],closed:[],sequence:0,logs:[],selected:0,losses:0,prevented:0,issued:0};
 s.assets.infrastructure=[{id:'ГУ-1',type:'Малая групповая установка',health:91},
 {id:'РВС-1',type:'Резервуар 1000 т',health:90},
 {id:'ВЛ-1',type:'Выкидная линия',health:91},
 {id:'УУН-1',type:'Узел учёта',health:90},
 {id:'ВАГ-1',type:'Бытовой вагончик',health:92}];
 s.v21=null;
 let nodes=v21init().nodes;
 for(let id of Object.keys(nodes))if(!['ГУ-1','ДНС-1','ЦППН','ППД-1','ПС-1'].includes(id))delete nodes[id];
 Object.assign(nodes['ГУ-1'],{capacity:55,desc:'Малый сборный узел'});
 Object.assign(nodes['ДНС-1'],{capacity:55,desc:'Малая перекачка'});
 Object.assign(nodes['ЦППН'],{capacity:55,desc:'Модуль подготовки нефти'});
 Object.assign(nodes['ПС-1'],{capacity:80,desc:'Электропитание малого промысла'});
 Object.assign(nodes['ППД-1'],{capacity:55,desc:'Технологическое обеспечение'});
 let v=v8init();v.rankCity=[{name:employees[0].name,job:'Директор предприятия',score:77}];
 v.rankField=[{name:employees[1].name,job:'Мастер участка',score:78}];
 // Discard old manager samples; they must not appear as additional payroll or people.
 s.v11={employees:[],marketDay:0,actions:[],inbox:[],hired:0};
 x.cleaned=true;
 x.events.unshift('Стартовые подразделения, активы и кадровые реестры приведены к одной скважине.');
}
const v43oldBootstrap=v41bootstrap;
v41bootstrap=function(){v43oldBootstrap();v43setup()};
const v43oldHrView=hrView;
hrView=function(){
 if(!s?.small)return v43oldHrView();
 let g=growInit(),h=ensureHR();
 let total=g.staff,filled=h.positions.filter(p=>p.employeeId).length;
 return '<section class="small-panel"><h2>Штат малого промысла</h2><p class="muted">Начальный реестр — 12 работников. Новые должности появляются по мере найма в блоке развития штата; крупные департаменты отсутствуют.</p>'+row('Фактический штат',total+' чел.')+row('Первоначальные должности',filled+' / 12')+row('Единый ФОТ',m(v8init().salaryFund)+'/мес.')+
 '<div class="table-scroll"><table><thead><tr><th>Подразделение</th><th>Должность</th><th>Работник</th></tr></thead><tbody>'+h.positions.map(p=>{let person=h.employees.find(e=>e.id===p.employeeId);return '<tr><td>'+esc(p.dept)+'</td><td>'+esc(p.role)+'</td><td>'+esc(person?.name||'Вакансия')+'</td></tr>'}).join('')+'</tbody></table></div><p class="muted">Новые сотрудники, сроки подбора и затраты учитываются в разделе развития штата на главном экране.</p></section>';
};
const v43oldOrgView=enterpriseView;
enterpriseView=function(){
 if(!s?.small)return v43oldOrgView();
 if(tab==='org')return '<section class="small-panel"><h2>Структура малого предприятия</h2>'+ensureEnterprise().dept.map(d=>row(esc(d.name),d.headcount+' чел.')).join('')+'<p class="muted">Большие департаменты создаются по мере роста производства и численности.</p></section>';
 if(tab==='staff')return hrView();
 return v43oldOrgView();
};
// Prevent the generic HR subsystem from changing the total to a phantom 240-person base.
const v43oldHrSync=hrSync;
hrSync=function(){if(s?.small){ensureEnterprise().staff=growInit().staff;return}v43oldHrSync()};
// Ensure future saves and existing small-company careers are migrated without affecting other modes.
const v43oldRender=render;
render=function(){if(s?.small&&!s.small.cleaned)v43setup();v43oldRender()};
// A successful staged hire creates real roster entries rather than an invisible headcount.
const v43oldGrowDay=growDay;
growDay=function(){
 let before=s?.small?growInit().staff:0;
 v43oldGrowDay();
 if(!s?.small)return;
 let g=growInit(),h=ensureHR();
 if(g.staff<=before)return;
 let newest=g.roster[g.roster.length-1],count=g.staff-before;
 for(let i=0;i<count;i++){
  let seq=++h.seq,id='S'+seq,eid='SE'+seq;
  h.positions.push({id,dept:'Расширение производства',role:newest.job,salary:newest.salary/newest.count,employeeId:eid});
  h.employees.push({id:eid,name:hrName(seq),positionId:id,experience:2+seq%7,performance:70,training:75,status:'Работает'});
 }
 ensureEnterprise().staff=g.staff;
};
/* v3.8.4 — small-field reports and size-neutral company rating. Legacy saves unchanged. */
function small44active(){return !!s?.small}
function small44wells(){return (s.assets?.wellList||[]).filter(w=>w.status==='Работает')}
function small44shops(){
 let wells=small44wells(),names=[...new Set(wells.map(w=>w.unit||'ГУ-1'))];
 if(!names.length)names=['ГУ-1'];
 let total=names.map(n=>wells.filter(w=>(w.unit||'ГУ-1')===n).reduce((a,w)=>a+Math.max(0,(+w.rate||0)*(1-(+w.water||0)/100)),0));
 let sum=total.reduce((a,b)=>a+b,0);
 return names.map((name,i)=>({id:i,name,weight:sum?total[i]/sum:1/names.length}));
}
const small44oldShops=v38shops;
v38shops=function(){return small44active()?small44shops():small44oldShops()};
const small44OldMonth=v38month;
v38month=function(i){
 if(!small44active())return small44OldMonth(i);
 let d=v38init(),v=v8init(),key=v.year+'-'+i,entry=d.shops[key],shops=small44shops();
 if(!entry||(!entry.locked&&(entry.rows.length!==shops.length||entry.rows.some((r,j)=>r.name!==shops[j].name)))){
  let plan=Number(v.plans[i])||0,allocated=0,rows=shops.map((sh,j)=>{
   let p=j===shops.length-1?plan-allocated:Math.round(plan*sh.weight);
   allocated+=p;
   return {id:sh.id,name:sh.name,plan:p,actual:0};
  });
  // Preserve recorded production if the operating unit was renamed mid-month.
  let actual=entry?.rows?.reduce((a,r)=>a+(Number(r.actual)||0),0)||0;
  let assigned=0;rows.forEach((r,j)=>{r.actual=j===rows.length-1?actual-assigned:Math.round(actual*shops[j].weight*10)/10;assigned+=r.actual});
  d.shops[key]={rows,locked:false};
 }
 return d.shops[key];
};
const small44OldAnnual=v38setAnnual;
v38setAnnual=function(){
 if(!small44active())return small44OldAnnual();
 let d=v38init(),v=v8init(),current=v.plans.reduce((a,b)=>a+b,0);
 let raw=prompt('Годовой план малого промысла, тонн:',String(Math.round(current)));
 if(raw===null)return;
 let total=Number(raw),idx=v8idx(),closed=v.plans.slice(0,idx).reduce((a,b)=>a+b,0);
 if(!Number.isFinite(total)||total<0||total>1000000||total<closed)return uiAlert('План должен быть не меньше утверждённых закрытых месяцев и не более 1 000 000 т.');
 let reason=prompt('Основание изменения плана:');if(!reason?.trim())return;
 let days=Array.from({length:12-idx},(_,i)=>new Date(v.year,idx+i+1,0).getDate());
 let remaining=total-closed,den=days.reduce((a,b)=>a+b,0),assigned=0;
 for(let j=idx;j<12;j++){let n=j===11?remaining-assigned:Math.round(remaining*days[j-idx]/den);v.plans[j]=n;assigned+=n;delete d.shops[v.year+'-'+j]}
 d.annual=v.plans.reduce((a,b)=>a+b,0);
 d.decisions.unshift(v8date()+': скорректирован план малого промысла до '+d.annual+' т. '+reason.trim());
 save();render();
};
const small44OldPlans=v38plansView;
v38plansView=function(){
 if(!small44active())return small44OldPlans();
 let v=v8init(),d=v38init(),idx=v8idx(),entry=v38month(idx);
 let yearPlan=v.plans.reduce((a,b)=>a+(Number(b)||0),0);
 let fact=v.monthHistory.filter(h=>h.year===v.year).reduce((a,h)=>a+(Number(h.actual)||0),0)+(Number(v.monthActual)||0);
 let pct=(p,a)=>p>0?f(a/p*100)+'%':(a>0?'Вне плана':'—');
 let out='<section class="v38-panel"><h2>План и факт малого нефтепромысла</h2><p class="muted">Отчёт показывает только существующие производственные узлы и действующие скважины. Добыча не приравнивается к реализации.</p>';
 out+='<div class="v38-stats"><div><small>Годовой план</small><strong>'+f(yearPlan)+' т</strong></div><div><small>Добыто с начала года</small><strong>'+f(fact)+' т</strong></div><div><small>Выполнение</small><strong>'+pct(yearPlan,fact)+'</strong></div></div>';
 out+='<button class="mini-btn" data-v38-annual>Изменить годовой план</button>';
 out+='<h3>Действующие производственные узлы · '+V8_MONTHS[idx]+'</h3><div class="table-scroll"><table class="v8table"><thead><tr><th>Узел</th><th>План, т</th><th>Факт, т</th><th>Выполнение</th></tr></thead><tbody>';
 for(let r of entry.rows)out+='<tr><td>'+esc(r.name)+'</td><td>'+f(r.plan)+'</td><td>'+f(r.actual)+'</td><td>'+pct(r.plan,r.actual)+'</td></tr>';
 out+='</tbody></table></div><h3>Закрытые месяцы</h3>';
 for(let h of v.monthHistory.filter(x=>x.year===v.year).slice(-12).reverse()){
  let rows=d.closed.find(x=>x.year===h.year&&x.month===h.month)?.rows||[];
  out+='<details class="v38-closed"><summary>'+V8_MONTHS[h.month]+': '+f(h.actual)+' / '+f(h.plan)+' т · '+pct(h.plan,h.actual)+'</summary>';
  for(let r of rows)out+=row(esc(r.name),f(r.actual)+' / '+f(r.plan)+' т · '+pct(r.plan,r.actual));
  out+='</details>';
 }
 return out+'</section>';
};
const small44OldPlayer=v37player;
v37player=function(year){
 let result=small44OldPlayer(year);
 if(!small44active())return result;
 let v=v8init(),hist=v.monthHistory.filter(h=>h.year===year);
 let plan=hist.reduce((a,h)=>a+(+h.plan||0),0)+(v.year===year?(+v.plans[v8idx()]||0):0);
 let actual=hist.reduce((a,h)=>a+(+h.actual||0),0)+(v.year===year?(+v.monthActual||0):0);
 let clamp=x=>Math.max(0,Math.min(100,Math.round(x)));
 // Evaluate efficiency against the company's own plan, never absolute large-field output.
 result.aspects.production=clamp(plan>0?Math.min(100,actual/Math.max(1,plan)*100):50);
 let g=growInit(),campReady=!!g?.campReady;
 // A camp is not mandatory for a 12-person field. No phantom penalties or bonuses.
 result.aspects.camp=campReady?result.aspects.camp:70;
 result.aspects.staff=clamp((v.morale||70)*.5+(v.conditions||70)*.5);
 result.aspects.investment=clamp(55+Math.min(25,(s.small.projects||[]).filter(p=>p.status==='Введена').length*12));
 result.score=v37score(result.aspects);
 return result;
};
const small44OldEquip=v39equipment;
v39equipment=function(){
 if(!small44active())return small44OldEquip();
 let key=v39key(),wells=s.assets?.wellList||[],problem=wells.filter(w=>+w.health<=75||w.status!=='Работает');
 let text='ЕЖЕМЕСЯЧНАЯ ТЕХНИЧЕСКАЯ СВОДКА МАЛОГО ПРОМЫСЛА\nДата: '+v8date()+
 '\nВсего скважин: '+wells.length+'; действующих: '+small44wells().length+
 '\nРВС: '+(v30init().tanks||[]).length+'; производственные узлы: '+small44shops().length+'.\n';
 if(!problem.length)text+='Остановленных скважин и скважин с состоянием 75% и ниже не выявлено.';
 else text+=problem.map(w=>'Скв. №'+w.id+' · '+(w.unit||'ГУ-1')+' · '+w.status+' · состояние '+w.health+'%').join('\n');
 text+='\nИгровые пороги состояния оборудования не являются нормативными требованиями.';
 v39mail(key,'equipment','Техническая сводка малого промысла',text);
};
const small44OldCampView=v36campView;
v36campView=function(){
 if(!small44active()||growInit()?.campReady)return small44OldCampView();
 return '<section class="small-panel"><h3>Бытовое обеспечение</h3><p class="muted">Используется бытовой вагончик и подрядные услуги. Вахтовый посёлок отсутствует; показатели общежитий и столовой не применяются.</p></section>';
};
/* v3.8.5: state inspector findings and environmental penalties; fictional game values, mln KZT. */
const COMPLY_CASES=[
 {agency:'ДЧС',name:'Отсутствует актуальный акт проверки предохранительного устройства',cost:2.4,days:6,weight:3},
 {agency:'ДЧС',name:'Неисправное ограждение опасного участка',cost:1.8,days:4,weight:2},
 {agency:'ДЧС',name:'Не проведена проверка технического состояния оборудования',cost:3.2,days:9,weight:3},
 {agency:'Экология',name:'Нарушение порядка обращения с производственными отходами',cost:1.6,days:5,weight:2},
 {agency:'Экология',name:'Утечка нефтесодержащей жидкости на площадке',cost:4.8,days:12,weight:4},
 {agency:'Экология',name:'Не выполнено мероприятие экологического контроля',cost:1.2,days:4,weight:2}
];
function complyInit(){
 if(!s.comply)s.comply={cases:[],seq:0,inspections:0,events:[],lastMonth:-1};
 return s.comply;
}
function complyFinding(kind){
 let c=complyInit(),pool=COMPLY_CASES.filter(x=>x.agency===kind);
 let base=pool[Math.floor(Math.random()*pool.length)],id=++c.seq;
 let x={id,agency:kind,name:base.name,repairCost:base.cost,repairDays:base.days,
  fine:kind==='Экология'?+(base.cost*(.4+Math.random()*.9)).toFixed(2):0,
  finePaid:false,status:'Выявлено',remaining:0,created:v8date(),weight:base.weight};
 c.cases.unshift(x);c.events.unshift(kind+': выявлено несоответствие №'+id+' — '+x.name);
 if(kind==='Экология'&&x.fine>0){s.cash-=x.fine;v25post('incident',x.fine,{description:'Игровой экологический штраф: '+x.name,agency:kind,caseId:id});x.finePaid=true;c.events.unshift('Оплачен экологический штраф '+m(x.fine)+' по №'+id)}
 log('Проверка '+kind+': '+x.name);save();return x;
}
function complyFix(id){
 let x=complyInit().cases.find(z=>z.id===id);
 if(!x||x.status!=='Выявлено')return;
 if(s.cash<x.repairCost)return uiAlert('Недостаточно средств для устранения: '+m(x.repairCost));
 s.cash-=x.repairCost;
 v25post('maintenance',x.repairCost,{description:'Устранение предписания '+x.agency+' №'+x.id,agency:x.agency,caseId:x.id});
 x.status='Устранение';x.remaining=x.repairDays;
 complyInit().events.unshift('Начаты работы по предписанию №'+id+'; затраты '+m(x.repairCost));
 save();render();
}
function complyDay(){
 if(!s?.small)return;
 let c=complyInit();
 for(let x of c.cases){
  if(x.status==='Устранение'&&x.remaining>0&&--x.remaining===0){
   x.status='Устранено';c.events.unshift('Предписание '+x.agency+' №'+x.id+' исполнено');log('Устранено несоответствие №'+x.id);
  }
 }
 // Inspect only occasionally; one check per three game months, with a small chance of finding a problem.
 let v=v8init(),key=v.year*12+v8idx();
 if(s.day!==1||key%3!==0||c.lastMonth===key)return;
 c.lastMonth=key;c.inspections++;
 let kind=(c.inspections%2?'ДЧС':'Экология');
 if(Math.random()<.5)complyFinding(kind);
 else c.events.unshift('Проверка '+kind+': новых несоответствий не выявлено');
}
function complyView(){
 if(!s?.small)return '';
 let c=complyInit(),open=c.cases.filter(x=>x.status!=='Устранено');
 let spent=c.cases.reduce((a,x)=>a+(x.finePaid?x.fine:0)+(x.status!=='Выявлено'?x.repairCost:0),0);
 let h='<section class="small-panel"><h2>Государственные проверки и экология</h2><p class="muted">ДЧС: предписания и расходы на устранение. Экология: устранение нарушений и игровые штрафы. Суммы условные, не являются расчётом штрафов по законодательству РК.</p>';
 h+='<div class="small-economy-grid"><div><small>Открытые предписания</small><b>'+open.length+'</b></div><div><small>Всего проверок</small><b>'+c.inspections+'</b></div><div><small>Расходы и штрафы</small><b>'+m(spent)+'</b></div></div>';
 h+='<div class="small-project"><b>Учебная проверка</b><p class="muted">Для тестирования механики; не влияет на реальную инспекционную периодичность.</p><button class="btn secondary" data-comply="inspect" data-agency="ДЧС">Проверка ДЧС</button> <button class="btn secondary" data-comply="inspect" data-agency="Экология">Проверка экологии</button></div>';
 for(let x of c.cases.slice(0,15)){
  h+='<div class="small-project"><b>'+esc(x.agency)+' · №'+x.id+' · '+esc(x.status)+'</b><p>'+esc(x.name)+'</p><p>Устранение: '+m(x.repairCost)+' / '+x.repairDays+' дней'+(x.agency==='Экология'?' · штраф: '+m(x.fine)+(x.finePaid?' (оплачен)':''):'')+'</p>';
  if(x.status==='Выявлено')h+='<button class="btn secondary" data-comply="fix" data-id="'+x.id+'">Профинансировать устранение</button>';
  if(x.status==='Устранение')h+='<p>Осталось '+x.remaining+' дней</p>';
  h+='</div>';
 }
 h+='<h3>Журнал проверок</h3>'+c.events.slice(0,10).map(t=>'<p class="muted">'+esc(t)+'</p>').join('')+'</section>';
 return h;
}
const complyOldAdvance=v8advance;
v8advance=function(){complyOldAdvance();complyDay()};
const complyOldRender=render;
render=function(){
 complyOldRender();
 if(!s?.small||tab!=='overview')return;
 let el=document.querySelector('#body');
 if(el){let wrap=document.createElement('div');wrap.innerHTML=complyView();el.append(wrap)}
};
document.addEventListener('click',e=>{
 let b=e.target.closest('[data-comply]');if(!b||!s?.small)return;
 if(b.dataset.comply==='fix')complyFix(+b.dataset.id);
 if(b.dataset.comply==='inspect'){complyInit().inspections++;complyFinding(b.dataset.agency);render()}
});
const BACKUP_KEY=KEY+'-backup';
const fileInput=document.createElement('input');fileInput.type='file';fileInput.accept='.json,application/json';fileInput.style.display='none';document.body.appendChild(fileInput);
const saveBar=document.createElement('div');saveBar.id='save-manager';
saveBar.innerHTML=`<button type="button" id="game-settings-toggle" aria-label="Настройки игры" aria-expanded="false" aria-controls="game-settings-menu" title="Настройки игры">⚙</button><div id="game-settings-menu" hidden><div class="settings-title">Управление карьерой</div><button type="button" id="save-now">💾 Сохранить</button><button type="button" id="save-import">📂 Загрузить</button><button type="button" id="game-new-career">✚ Новая игра</button><small id="save-status" aria-live="polite">Автосохранение включено</small></div>`;
document.body.appendChild(saveBar);
const style=document.createElement('style');style.textContent=`
html,body{width:100%;max-width:100%;overflow-x:hidden}
#save-manager{position:fixed;right:max(12px,env(safe-area-inset-right));top:max(12px,env(safe-area-inset-top));bottom:auto!important;left:auto!important;z-index:9500;display:block!important;width:auto!important;max-width:calc(100vw - 24px);background:transparent!important;border:0!important;padding:0!important;box-shadow:none!important;font:13px system-ui}
#game-settings-toggle{width:46px;height:46px;border-radius:13px;border:1px solid #527d87;background:#173646;color:#e9f7f9;font-size:26px;line-height:1;box-shadow:0 7px 24px #0008;cursor:pointer;touch-action:manipulation}
#game-settings-menu{position:absolute;right:0;top:53px;width:min(265px,calc(100vw - 24px));padding:12px;border:1px solid #507887;border-radius:14px;background:#142b39;box-shadow:0 18px 48px #000c;display:flex;flex-direction:column;gap:7px}
#game-settings-menu[hidden]{display:none!important}
#game-settings-menu .settings-title{font-weight:800;color:#d7eff4;margin:2px 3px 6px}
#game-settings-menu button{width:100%;min-height:43px;text-align:left;border:1px solid #3e6573;border-radius:9px;background:#24485b;color:#fff;padding:10px 12px;font-size:14px;cursor:pointer;touch-action:manipulation}
#game-settings-menu button:hover{background:#30647a}
#game-settings-menu small{font-size:11px;color:#a8c7d0;padding:6px 3px 0;overflow-wrap:anywhere}
#reset{display:none!important}
.v11content{min-width:0;overflow-x:hidden}
@media(max-width:800px){
 html,body{height:100%;overflow:hidden!important;overscroll-behavior:none}
 .v11shell{height:100dvh!important;min-height:0!important;overflow:hidden!important;display:flex!important}
 .v11sidebar{height:100dvh!important;max-height:100dvh!important;position:relative!important;top:auto!important;overflow-y:auto!important;overscroll-behavior:contain;flex-shrink:0}
 .v11content{height:100dvh!important;max-height:100dvh!important;min-height:0!important;overflow-y:auto!important;overflow-x:hidden!important;overscroll-behavior-y:contain;-webkit-overflow-scrolling:touch;padding-top:calc(12px + env(safe-area-inset-top))!important;padding-bottom:calc(20px + env(safe-area-inset-bottom))!important}
 .v11content>header{padding-right:53px;min-height:46px}
 #save-manager{right:8px!important;top:calc(8px + env(safe-area-inset-top))!important;bottom:auto!important;left:auto!important}
 #game-settings-toggle{width:42px;height:42px}
 .v11content .table-scroll{max-width:100%;overflow-x:auto}
 .v11content input,.v11content select,.v11content textarea{font-size:16px}
}
`;document.head.appendChild(style);
const settingsToggle=document.getElementById('game-settings-toggle');
const settingsMenu=document.getElementById('game-settings-menu');
function closeSettings(){settingsMenu.hidden=true;settingsToggle.setAttribute('aria-expanded','false')}
settingsToggle.addEventListener('click',()=>{settingsMenu.hidden=!settingsMenu.hidden;settingsToggle.setAttribute('aria-expanded',String(!settingsMenu.hidden))});
document.addEventListener('pointerdown',e=>{if(!saveBar.contains(e.target))closeSettings()});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeSettings()});
document.getElementById('game-new-career').onclick=()=>{closeSettings();document.getElementById('reset').click()};
function saveStatus(msg){document.getElementById('save-status').textContent=msg}
function validSave(x){return x&&typeof x==='object'&&!Array.isArray(x)&&typeof x.name==='string'&&x.name.length<=200&&Number.isFinite(x.cash)&&Number.isFinite(x.wells)&&x.wells>=0&&x.wells<=100000&&Array.isArray(x.history)&&Array.isArray(x.events)&&Array.isArray(x.pending)&&typeof x.dead==='boolean'}
function downloadSave(){if(!s)return uiAlert('Сначала создайте или загрузите карьеру');try{save();const data={format:'oil-management-save',version:1,exportedAt:new Date().toISOString(),game:s};const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='Oil_Management_save_'+new Date().toISOString().slice(0,10)+'.json';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),15000);saveStatus('Файл сохранения подготовлен')}catch(e){uiAlert('Ошибка экспорта: '+e.message)}}
document.getElementById('save-now').onclick=()=>{closeSettings();if(!s)return uiAlert('Нет активной карьеры');try{save();saveStatus('Сохранено: '+new Date().toLocaleTimeString('ru-RU'))}catch(e){uiAlert('Не удалось сохранить: '+e.message)}};

document.getElementById('save-import').onclick=()=>{closeSettings();fileInput.value='';fileInput.click()};
fileInput.onchange=async()=>{const file=fileInput.files&&fileInput.files[0];if(!file)return;if(file.size>15*1024*1024)return uiAlert('Файл слишком большой (максимум 15 МБ)');try{const parsed=JSON.parse(await file.text());const incoming=parsed&&parsed.format==='oil-management-save'?parsed.game:parsed;if(!validSave(incoming))throw new Error('Неверная структура файла сохранения');if(!await uiConfirm('Загрузить карьеру «'+incoming.name+'»? Текущая карьера будет заменена; перед заменой создаётся резервная копия.'))return;const old=localStorage.getItem(KEY);if(old)localStorage.setItem(BACKUP_KEY,old);localStorage.setItem(KEY,JSON.stringify(incoming));s=incoming;tab='overview';show();$('load').classList.remove('hide');saveStatus('Карьера загружена: '+incoming.name)}catch(e){uiAlert('Не удалось загрузить файл: '+e.message)}};

})();
