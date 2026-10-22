/* v3.9.2 — standalone construction of auxiliary facilities with cash, lead times and running costs. */
const FAC392=[
 {id:'canteen',name:'Столовая на 40 посадочных мест',kind:'Социальные объекты',cost:125,days:32,upkeep:.28,capacity:40,benefit:'Питание работников и улучшение бытовых условий'},
 {id:'dorm',name:'Общежитие на 40 мест',kind:'Социальные объекты',cost:280,days:55,upkeep:.36,capacity:40,benefit:'40 дополнительных мест для проживания персонала'},
 {id:'workshop',name:'Ремонтно-механический участок',kind:'Вспомогательные участки',cost:175,days:40,upkeep:.32,capacity:1,benefit:'Подготовка к ремонту оборудования и сокращение простоев'},
 {id:'electrical',name:'Электротехнический участок',kind:'Вспомогательные участки',cost:145,days:35,upkeep:.25,capacity:1,benefit:'Обслуживание электросетей и электрооборудования'},
 {id:'transport',name:'Транспортный участок и гараж',kind:'Вспомогательные участки',cost:190,days:42,upkeep:.38,capacity:1,benefit:'Обслуживание транспорта и логистики'},
 {id:'warehouse',name:'Центральный склад МТР',kind:'Вспомогательные участки',cost:110,days:28,upkeep:.16,capacity:1,benefit:'Сокращение задержек обеспечения материалами'},
 {id:'lab',name:'Производственная лаборатория',kind:'Вспомогательные участки',cost:135,days:38,upkeep:.27,capacity:1,benefit:'Усиление контроля качества нефти и производственных проб'},
 {id:'water',name:'Участок водоснабжения и водоотведения',kind:'Вспомогательные участки',cost:210,days:48,upkeep:.30,capacity:1,benefit:'Обеспечение бытовых объектов водой и водоотведением'}
];
function fac392init(){if(!s?.small)return null;return s.small.fac392||(s.small.fac392={projects:[],completed:[],log:[],spent:0});}
function fac392built(id){return !!fac392init()?.completed.includes(id)}
function fac392build(id){let z=fac392init(),f=FAC392.find(x=>x.id===id);if(!z||!f)return;
 if(fac392built(id)||z.projects.some(x=>x.id===id))return uiAlert('Этот объект уже построен или строится.');
 if(s.cash<f.cost)return uiAlert('Недостаточно средств: требуется '+m(f.cost)+'.');
 s.cash-=f.cost;v25post('maintenance',f.cost,{description:'Капитальные вложения: '+f.name});z.spent+=f.cost;
 z.projects.push({id:f.id,days:f.days,cost:f.cost});z.log.unshift('Начато строительство: '+f.name+' · '+f.days+' дней · '+m(f.cost));save();render();}
function fac392day(){let z=fac392init();if(!z)return;
 for(let i=z.projects.length-1;i>=0;i--){let p=z.projects[i];if(--p.days>0)continue;
 let f=FAC392.find(x=>x.id===p.id);z.projects.splice(i,1);z.completed.push(p.id);
 z.log.unshift('Объект введён в эксплуатацию: '+f.name);
 if(p.id==='dorm'){let c=v36init().camp;c.beds=(c.beds||0)+40;c.housing=Math.min(100,(c.housing||80)+5);}
 if(p.id==='canteen'){let c=v36init().camp;c.cleanliness=Math.min(100,(c.cleanliness||80)+4);}
 }
 // Operating costs charged once a month, separate from construction cost.
 let d=v8init();if(d.day===1){let cost=FAC392.filter(f=>z.completed.includes(f.id)).reduce((a,f)=>a+f.upkeep,0);
 if(cost>0){s.cash-=cost;v25post('opex',cost,{description:'Содержание вспомогательных объектов'});}}
 if(z.log.length>60)z.log.length=60;
}
function fac392view(){let z=fac392init();if(!z)return '';
 let html='<section class="small-panel"><h2>Строительство объектов и вспомогательных участков</h2><p class="muted">Объекты можно строить независимо от численности штата, если хватает денежных средств. Сумма списывается при начале строительства, объект начинает работать после завершения работ.</p>';
 html+='<div class="small-economy-grid">'+[['Средства',m(s.cash)],['Построено',z.completed.length],['Строится',z.projects.length],['Капвложения',m(z.spent)],['Содержание в месяц',m(FAC392.filter(f=>z.completed.includes(f.id)).reduce((a,f)=>a+f.upkeep,0))]].map(x=>'<div><small>'+x[0]+'</small><b>'+x[1]+'</b></div>').join('')+'</div>';
 for(let kind of ['Социальные объекты','Вспомогательные участки']){html+='<h3>'+kind+'</h3><div class="grow-actions">';
 for(let f of FAC392.filter(x=>x.kind===kind)){let p=z.projects.find(x=>x.id===f.id),built=fac392built(f.id);
 html+='<div><b>'+esc(f.name)+'</b><small>'+m(f.cost)+' · '+f.days+' дн. · содержание '+m(f.upkeep)+'/мес.</small><p class="muted">'+esc(f.benefit)+'</p>'+
 (built?'<strong>Введён в эксплуатацию</strong>':p?'<strong>Строительство: осталось '+p.days+' дн.</strong>':'<button class="mini-btn" data-fac392="'+f.id+'" '+(s.cash<f.cost?'disabled':'')+'>Построить</button>')+'</div>';}
 html+='</div>';}
 html+='<h3>Журнал строительства</h3>'+z.log.slice(0,6).map(x=>'<p class="muted">'+esc(x)+'</p>').join('')+'</section>';return html;}
const fac392OldDay=smallDay;smallDay=function(){fac392OldDay();fac392day();};
const fac392OldView=smallView;smallView=function(){return fac392OldView()+fac392view();};
// The independent dormitory does not require the five-stage camp project.
const fac392OldCampDaily=v36daily;v36daily=function(){let r=fac392OldCampDaily();if(s?.small&&fac392built('dorm')){let c=v36init().camp;c.beds=Math.max(c.beds||0,40);c.residents=Math.min(growStaffCount(),c.beds);}return r;};
const fac392OldCampView=v36campView;v36campView=function(){if(s?.small&&fac392built('dorm')&&!growInit()?.campReady){let c=v36init().camp;return '<section class="small-panel"><h3>Общежитие</h3><p>Введено в эксплуатацию: '+c.beds+' мест. Проживает '+c.residents+' работников.</p></section>';}return fac392OldCampView();};
// Utility buildings improve measurable staffing-related indicators without removing the need for qualified staff.
const fac392OldKPIs=staff90KPIs;staff90KPIs=function(){let k=fac392OldKPIs();if(!k||!s?.small)return k;
 if(fac392built('workshop'))k.repairSpeed=Math.round((k.repairSpeed+.12)*100)/100;
 if(fac392built('electrical'))k.production=Math.min(1,k.production+.015);
 if(fac392built('transport'))k.production=Math.min(1,k.production+.005);
 if(fac392built('lab'))k.ecology=Math.min(100,k.ecology+4);
 if(fac392built('canteen'))k.safety=Math.min(100,k.safety+2);
 return k;};
document.addEventListener('click',e=>{let b=e.target.closest('[data-fac392]');if(b)fac392build(b.dataset.fac392);});
