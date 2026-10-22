/* v3.8.3 — only for small-company careers. Existing large-company saves are unchanged. */
const SMALL_START_POSITIONS=[
 ['Управление','Генеральный директор',.55],['Производство','Мастер участка',.42],
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
 {name:'Управление и обеспечение',headcount:3,chief:'Генеральный директор'},
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
 let v=v8init();v.rankCity=[{name:employees[0].name,job:'Генеральный директор',score:77}];
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
