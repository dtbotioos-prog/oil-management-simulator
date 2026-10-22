/* v3.9.0 — vacancy names and measurable staff effects in the small-field career. */
const STAFF90_ROLES=[
 {key:'operator',name:'Оператор по добыче нефти и газа',dept:'Добыча',count:2,salary:.55,days:8,description:'Увеличивает покрытие смен и устойчивость добычи'},
 {key:'mechanic',name:'Слесарь-ремонтник нефтепромыслового оборудования',dept:'Ремонт',count:2,salary:.62,days:9,description:'Ускоряет восстановление технического состояния'},
 {key:'electrician',name:'Электромонтёр по ремонту и обслуживанию электрооборудования',dept:'Энергетика',count:1,salary:.68,days:11,description:'Снижает эксплуатационные потери от неисправностей электроснабжения'},
 {key:'foreman',name:'Мастер по добыче нефти и газа',dept:'Добыча',count:1,salary:.88,days:15,description:'Улучшает организацию смен и производственную дисциплину'},
 {key:'safety',name:'Инженер по промышленной безопасности и охране труда',dept:'Безопасность',count:1,salary:.78,days:13,description:'Повышает показатель безопасности и снижает риск происшествий'},
 {key:'environment',name:'Инженер по охране окружающей среды',dept:'Экология',count:1,salary:.72,days:12,description:'Улучшает экологический контроль и снижает вероятность нарушений'},
 {key:'fire',name:'Специалист по пожарной безопасности',dept:'Безопасность',count:1,salary:.72,days:12,description:'Повышает готовность к предотвращению пожаров'},
 {key:'lab',name:'Лаборант химического анализа',dept:'Лаборатория',count:1,salary:.52,days:10,description:'Повышает качество контроля подготовки нефти'},
 {key:'driver',name:'Водитель автомобиля',dept:'Логистика',count:2,salary:.50,days:8,description:'Улучшает обеспеченность транспорта'},
 {key:'support',name:'Работник хозяйственного обеспечения',dept:'Обеспечение',count:5,salary:.43,days:8,description:'Обеспечивает бытовое обслуживание при росте штата'}
];
function staff90Init(){
 if(!s?.small)return null;
 let x=s.small.staff90;
 if(!x)s.small.staff90=x={version:1,history:[]};
 return x;
}
function staff90Counts(){
 let h=ensureHR(),p=h.positions.filter(x=>x.employeeId);
 const role=(re)=>p.filter(x=>re.test(x.role||'')).length;
 return {operator:role(/оператор добычи/i),mechanic:role(/слесарь/i),
 electrician:role(/электромонт/i),foreman:role(/мастер участка|мастер по добыче/i),
 safety:role(/промышленной безопасности|БиОТ/i),environment:role(/эколог|окружающей среды/i),
 fire:role(/пожарной безопасности/i),lab:role(/лаборант/i),
 driver:role(/водитель/i),support:role(/хозяйственного обеспечения/i)};
}
function staff90KPIs(){
 if(!s?.small)return null;
 let n=staff90Counts(),wells=(s.assets?.wellList||[]).filter(x=>x.status==='Работает').length;
 let needOp=Math.max(2,wells*2),needMech=Math.max(1,Math.ceil(wells/2));
 let coverage=Math.min(1,n.operator/needOp);
 let repair=Math.min(1,n.mechanic/needMech);
 let power=Math.min(1,n.electrician/Math.max(1,Math.ceil(wells/4)));
 let management=Math.min(1,n.foreman/Math.max(1,Math.ceil(wells/5)));
 let prod=0.82+.12*coverage+.03*power+.03*management;
 return {n,wells,needOp,needMech,coverage,repair,power,management,
 production:Math.min(1,prod),repairSpeed:1+(repair>=1?.15:0),
 safety:Math.min(100,70+Math.min(15,n.safety*6)+Math.min(10,n.fire*5)),
 ecology:Math.min(100,70+Math.min(20,n.environment*8)),
 notes:coverage<1?'Не хватает операторов для покрытия производственных смен':wells===0?'Нет действующих скважин':'Производственные смены укомплектованы'};
}
function staff90Suggest(){
 let k=staff90KPIs();if(!k)return null;
 let n=k.n;
 if(n.operator<k.needOp)return 0;
 if(n.mechanic<k.needMech)return 1;
 if(n.electrician<Math.ceil(Math.max(1,k.wells)/4))return 2;
 if(n.foreman<Math.ceil(Math.max(1,k.wells)/5))return 3;
 return 4;
}
const staff90OldHire=growHire;
growHire=function(i){
 if(!s?.small)return staff90OldHire(i);
 let role=STAFF90_ROLES[i],g=growInit();
 if(!role||!g||g.hiring||g.building)return uiAlert('Завершите текущий подбор или строительный этап.');
 let h=ensureHR(),k=staff90KPIs();
 if(role.key==='operator'&&k.n.operator>=Math.max(2,(k.wells+1)*2))return uiAlert('Штат операторов достаточен для действующих и ближайшей новой скважины.');
 let fee=Math.round(role.count*role.salary*.3*100)/100;
 if(s.cash<fee)return uiAlert('Недостаточно средств для подбора: '+m(fee));
 s.cash-=fee;v25post('opex',fee,{description:'Подбор: '+role.name});
 g.hiring={job:role.name,dept:role.dept,count:role.count,salary:role.salary,days:role.days,fee,key:role.key};
 g.log.unshift('Подбор: '+role.name+' · '+role.count+' чел. · '+role.days+' дн. · ожидаемый эффект: '+role.description);
 save();render();
};
const staff90OldGrowDay=growDay;
growDay=function(){
 if(!s?.small)return staff90OldGrowDay();
 let g=growInit(),hiring=g?.hiring?{...g.hiring}:null;
 let before=g?.staff||0;
 staff90OldGrowDay();
 if(!hiring||g.staff<=before)return;
 let h=ensureHR(),added=h.positions.slice(-hiring.count);
 for(let p of added){p.role=hiring.job;p.dept=hiring.dept;p.salary=hiring.salary;}
 let x=staff90Init();x.history.unshift(v8date()+': приняты '+hiring.count+' чел. на должность «'+hiring.job+'»');
 if(x.history.length>100)x.history.length=100;
};
const staff90OldView=growView;
growView=function(){
 if(!s?.small)return staff90OldView();
 let k=staff90KPIs(),g=growInit(),recommended=staff90Suggest();
 let html='<section class="small-panel"><h2>Вакансии и эффективность персонала</h2><p class="muted">Наименование должности устанавливается автоматически. Эффект возникает после завершения подбора и внесения работников в штат. При нехватке работников эффективность снижается; избыток не создаёт бесконечных бонусов.</p>';
 html+='<div class="small-economy-grid">'+[
 ['Обеспеченность смен',Math.round(k.coverage*100)+'%'],
 ['Коэффициент добычи',Math.round(k.production*100)+'%'],
 ['Обеспечение ремонтов',Math.round(k.repair*100)+'%'],
 ['Безопасность (кадры)',k.safety+'/100'],
 ['Экологический контроль (кадры)',k.ecology+'/100'],
 ['ФОТ в месяц',m(v8init().salaryFund)]
 ].map(x=>'<div><small>'+x[0]+'</small><b>'+x[1]+'</b></div>').join('')+'</div>';
 html+='<p class="notice">'+esc(k.notes)+'. Для '+k.wells+' работающих скважин требуется '+k.needOp+' операторов и минимум '+k.needMech+' слесарей.</p>';
 html+='<h3>Набор на конкретные должности</h3><div class="grow-actions">';
 STAFF90_ROLES.forEach((r,i)=>{
  let suggested=i===recommended;
  html+='<div><b>'+esc(r.name)+'</b><small>'+esc(r.dept)+' · '+r.count+' чел. · '+m(r.count*r.salary)+'/мес. · '+r.days+' дн.</small><p class="muted">'+esc(r.description)+'</p><button class="mini-btn" data-grow-hire="'+i+'" '+(g.hiring||g.building?'disabled':'')+'>'+(suggested?'Рекомендуется: начать подбор':'Начать подбор')+'</button></div>';
 });
 html+='</div>';
 if(g.hiring)html+='<p class="notice">Оформляется: '+esc(g.hiring.job)+' · осталось '+g.hiring.days+' дн. Эффект появится после приёма.</p>';
 html+='</section>';
 // Preserve camp progress and history, but replace the legacy duplicate generic hiring cards.
 let old=staff90OldView();
 old=old.replace(/<h3>Поэтапный набор персонала<\/h3><div class="grow-actions">[\s\S]*?<\/div><h3>Вахтовый посёлок/, '<h3>Вахтовый посёлок');
 return html+old;
};
const staff90OldProduction=v8dailyProduction;
v8dailyProduction=function(){
 let base=staff90OldProduction();
 if(!s?.small)return base;
 return base*staff90KPIs().production;
};
const staff90OldDay=smallDay;
smallDay=function(){
 staff90OldDay();
 if(!s?.small)return;
 let k=staff90KPIs(),v=v8init();
 // Staff influences existing safety and environmental indicators gradually, never instant +100.
 s.safety=Math.min(100,Math.max(0,s.safety+(k.safety-s.safety)*.002));
 if(s.enterprise)s.enterprise.environment=Math.min(100,Math.max(0,(s.enterprise.environment||70)+(k.ecology-(s.enterprise.environment||70))*.002));
};
