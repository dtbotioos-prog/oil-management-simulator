/* v3.9.1 — candidates have an explicit target position, automatic appointment. */
const CV391=[
 {name:'Арман Серикович Байжанов',sex:'М',birth:1991,experience:11,skills:87,discipline:84,salary:740000,
 job:'Мастер по добыче нефти и газа',dept:'Добыча',education:'Техническое образование, нефтегазовое дело',
 strong:'Организация ремонтных работ и производственных смен',weak:'Ограниченный опыт руководства большим коллективом'},
 {name:'Тимур Ермекович Абилов',sex:'М',birth:1984,experience:18,skills:94,discipline:69,salary:920000,
 job:'Инженер по добыче нефти и газа',dept:'Добыча',education:'Высшее нефтегазовое образование',
 strong:'Большой опыт эксплуатации нефтяных скважин',weak:'Требуется развитие навыков командной работы'},
 {name:'Асель Маратовна Сейтова',sex:'Ж',birth:1997,experience:5,skills:77,discipline:95,salary:580000,
 job:'Инженер по промышленной безопасности и охране труда',dept:'Безопасность',education:'Высшее техническое образование',
 strong:'Внимательность, соблюдение процедур и обучаемость',weak:'Небольшой производственный стаж'}
];
v11candidates=function(){
 let z=v11init();
 return CV391.map((p,i)=>{
 let employed=z.employees.some(x=>x.name===p.name&&x.status==='Работает');
 return '<div class="v11panel"><b>'+esc(p.name)+'</b>'
 +'<div><strong>Желаемая должность: '+esc(p.job)+'</strong></div>'
 +'<div class="muted">Подразделение: '+esc(p.dept)+'</div>'
 +'<div class="muted">'+(s.v8.year-p.birth)+' лет · стаж '+p.experience+' лет · желаемый оклад '+f(p.salary)+' ₸/мес.</div>'
 +'<div>Образование: '+esc(p.education)+'</div>'
 +row('Компетентность',v11status(p.skills))+row('Дисциплина',v11status(p.discipline))
 +'<div>Опыт и сильные стороны: '+esc(p.strong)+'</div>'
 +'<div class="muted">Зоны развития: '+esc(p.weak)+'</div>'
 +'<button class="mini-btn" data-v11-hire="'+i+'" '+(employed?'disabled':'')+'>'+(employed?'Уже принят':'Принять на должность «'+esc(p.job)+'»')+'</button></div>';
 }).join('');
};
v11hire=async function(i){
 let p=CV391[i];if(!p)return;
 let z=v11init();
 if(z.employees.some(x=>x.name===p.name&&x.status==='Работает'))return uiAlert('Кандидат уже принят на работу.');
 if(!await uiConfirm('Принять '+p.name+' на должность «'+p.job+'» с окладом '+f(p.salary)+' ₸/мес.?'))return;
 z.employees.push({id:Date.now(),name:p.name,sex:p.sex,birth:p.birth,experience:p.experience,
 skills:p.skills,discipline:p.discipline,leadership:65,salary:p.salary,strong:p.strong,
 weak:p.weak,job:p.job,dept:p.dept,education:p.education,status:'Работает'});
 v8init().salaryFund+=p.salary/1e6;
 if(typeof v38init==='function')v38init().decisions.unshift(v8date()+': нанят '+p.name+' · '+p.job+' · оклад '+f(p.salary)+' ₸');
 z.inbox.unshift('Принят сотрудник '+p.name+' на должность '+p.job);
 z.actions.unshift(v8date()+': трудоустройство '+p.name+' — '+p.job);
 if(s.small&&typeof ensureHR==='function'){
  let h=ensureHR(),free=h.positions.find(x=>!x.employeeId&&x.role===p.job);
  if(free){free.employeeId=z.employees[z.employees.length-1].id;free.salary=p.salary/1e6;}
 }
 save();v11beep('success');render();
};
