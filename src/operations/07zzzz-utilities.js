/* v3.9.3 — utilities: generation -> switchgear -> loads, water -> sewer -> treatment. */
const UTIL393=[
 {id:'gtes',name:'ГТЭС — газотурбинная электростанция, 500 кВт',kind:'Электроснабжение',cost:850,days:100,upkeep:2.8,kw:500,desc:'Собственная генерация; требует топлива и обслуживания'},
 {id:'rp',name:'Распределительный пункт РП-1, 500 кВт',kind:'Электроснабжение',cost:165,days:36,upkeep:.24,kw:500,desc:'Увеличивает пропускную способность распределения электроэнергии'},
 {id:'tp',name:'Комплектная трансформаторная подстанция КТП, 350 кВт',kind:'Электроснабжение',cost:120,days:30,upkeep:.17,kw:350,desc:'Дополнительная трансформация и питание промысловых объектов'},
 {id:'powerline',name:'Воздушная линия электропередачи ВЛ-6 кВ',kind:'Электроснабжение',cost:95,days:25,upkeep:.12,kw:250,desc:'Подключение удалённых скважин и распределительных пунктов'},
 {id:'waterprep',name:'Станция водоподготовки, 25 м³/сут',kind:'Водоснабжение и канализация',cost:185,days:44,upkeep:.30,water:25,desc:'Подготовка воды для бытовых и производственных нужд'},
 {id:'sewer',name:'Канализационная насосная станция КНС',kind:'Водоснабжение и канализация',cost:125,days:34,upkeep:.22,sewer:20,desc:'Перекачка бытовых стоков на очистные сооружения'},
 {id:'kos',name:'Канализационные очистные сооружения КОС, 30 м³/сут',kind:'Водоснабжение и канализация',cost:360,days:65,upkeep:.58,sewer:30,desc:'Очистка бытовых сточных вод перед разрешённым отведением'},
 {id:'emergency',name:'Аварийная дизельная электростанция, 120 кВт',kind:'Электроснабжение',cost:110,days:22,upkeep:.12,kw:120,desc:'Резерв для критичных потребителей, не для постоянной добычи'}
];
function util393init(){if(!s?.small)return null;return s.small.util393||(s.small.util393={built:[],projects:[],log:[],spent:0,externalKw:125,gridLimitKw:160,septicM3:5,waterM3:8,down:false});}
function util393built(id){return !!util393init()?.built.includes(id)}
function util394count(id){return (util393init()?.built||[]).filter(x=>x===id).length}
function util393state(){let z=util393init();if(!z)return null;
 let active=(s.assets?.wellList||[]).filter(w=>w.status==='Работает'&&w.wellKind!=='Нагнетательная');
 let generation=(z.down?0:z.externalKw)+(util394count('gtes')*500);
 let distribution=z.gridLimitKw+(util394count('rp')*500)+(util394count('tp')*350);
 let capacity=Math.min(generation,distribution);
 let other=35+(util393built('canteen')?18:0)+(util393built('dorm')?20:0)+(util393built('workshop')?16:0)+(util393built('lab')?12:0)+(util393built('waterprep')?9:0)+(util393built('kos')?12:0)+(util393built('sewer')?5:0);
 let perWell=w=>w.equipment?.type==='ЭЦН'?90:48;
 let available=Math.max(0,capacity-other),powered=[],unpowered=[];
 for(let w of active){let kw=perWell(w);if(available>=kw){powered.push(w.id);available-=kw}else unpowered.push(w.id)}
 let sewage=1+(util393built('canteen')?3:0)+(util393built('dorm')?7:0);
 let waterNeed=2+(util393built('canteen')?3:0)+(util393built('dorm')?6:0);
 let waterCapacity=z.waterM3+(util394count('waterprep')*25);
 let sewerCapacity=z.septicM3+Math.min(util394count('sewer')*20,util394count('kos')*30);
 let welfareOk=waterNeed<=waterCapacity&&sewage<=sewerCapacity;
 return {generation,distribution,capacity,other,need:other+active.reduce((a,w)=>a+perWell(w),0),powered,unpowered,waterNeed,waterCapacity,sewage,sewerCapacity,welfareOk,active:active.length};
}
function util393build(id){let z=util393init(),f=UTIL393.find(x=>x.id===id);if(!z||!f)return;
 // Multiple modules are allowed: each commissioning increases installed capacity.
 if(s.cash<f.cost)return uiAlert('Недостаточно средств: необходимо '+m(f.cost));
 s.cash-=f.cost;v25post('maintenance',f.cost,{description:'Капвложения: '+f.name});z.spent+=f.cost;
 z.projects.push({id,days:f.days});z.log.unshift('Начато строительство: '+f.name+' · '+f.days+' дн.');save();render();}
function util393day(){let z=util393init();if(!z)return;
 for(let i=z.projects.length-1;i>=0;i--){let p=z.projects[i];if(--p.days>0)continue;
 let f=UTIL393.find(x=>x.id===p.id);z.projects.splice(i,1);z.built.push(p.id);z.log.unshift('Введён объект: '+f.name);}
 let st=util393state();
 // Purchased power + GTES gas/service costs and utility upkeep, all in million tenge.
 let charge=st.need*.000018+(util394count('gtes')*.065);
 s.cash-=charge;v25post('opex',charge,{description:'Электроэнергия и эксплуатация энергосистемы'});
 if(v8init().day===1){let upkeep=UTIL393.reduce((a,x)=>a+util394count(x.id)*x.upkeep,0);
 if(upkeep){s.cash-=upkeep;v25post('opex',upkeep,{description:'Содержание инженерных сетей, ГТЭС и КОС'});}}
 if(st.unpowered.length&&z.log[0]!==('Недостаток мощности: без питания скважины '+st.unpowered.join(', '))){z.log.unshift('Недостаток мощности: без питания скважины '+st.unpowered.join(', '));}
 if(!st.welfareOk&&z.built.some(id=>['canteen','dorm'].includes(id))&&z.log[0]!=='Недостаточная мощность водоснабжения/очистки стоков')z.log.unshift('Недостаточная мощность водоснабжения/очистки стоков');
 z.log.length=Math.min(z.log.length,30);
}
const util393OldProduction=v8dailyProduction;
v8dailyProduction=function(){let base=util393OldProduction();if(!s?.small)return base;
 let st=util393state();if(!st||!st.active)return base;
 // Weighted well rates, so electricity loss affects actual output, not only UI status.
 let wells=s.assets.wellList.filter(w=>w.status==='Работает'&&w.wellKind!=='Нагнетательная');
 let total=wells.reduce((a,w)=>a+(+w.rate||0)*(1-(+w.water||0)/100),0);
 let on=wells.filter(w=>st.powered.includes(w.id)).reduce((a,w)=>a+(+w.rate||0)*(1-(+w.water||0)/100),0);
 return base*(total>0?on/total:0);
};
const util393OldSmallDay=smallDay;smallDay=function(){util393OldSmallDay();util393day()};
function util393view(){let z=util393init();if(!z)return '';let st=util393state();
 let html='<section class="small-panel"><h2>Инженерные сети: электроэнергия, вода, канализация</h2><p class="muted">Цепочка: внешняя сеть / ГТЭС → РП и КТП → насосные установки и цехи. Вода → потребители → КНС → КОС. Если мощности не хватает, часть скважин остаётся без питания и не даёт добычу.</p>';
 html+='<div class="small-economy-grid">'+[
 ['Генерация',st.generation+' кВт'],['Распределение',st.distribution+' кВт'],['Доступная мощность',st.capacity+' кВт'],['Потребность',st.need+' кВт'],['Скважин с питанием',st.powered.length+' / '+st.active],['Скважин без питания',st.unpowered.length],['Вода',st.waterNeed+' / '+st.waterCapacity+' м³/сут'],['Бытовые стоки',st.sewage+' / '+st.sewerCapacity+' м³/сут']
 ].map(x=>'<div><small>'+x[0]+'</small><b>'+x[1]+'</b></div>').join('')+'</div>';
 if(st.unpowered.length)html+='<p class="notice">Недостаточно электроэнергии: скважины №'+st.unpowered.join(', №')+' не работают до подключения дополнительной мощности. Капитальный ремонт не устраняет отсутствие питания.</p>';
 if(!st.welfareOk)html+='<p class="notice">Водоснабжение или очистка стоков недостаточны для всех бытовых объектов. Необходимо расширение инфраструктуры.</p>';
 for(let kind of ['Электроснабжение','Водоснабжение и канализация']){html+='<h3>'+kind+'</h3><div class="grow-actions">';
 for(let f of UTIL393.filter(x=>x.kind===kind)){let ongoing=z.projects.filter(x=>x.id===f.id),count=util394count(f.id);
 html+='<div><b>'+esc(f.name)+'</b><small>'+m(f.cost)+' · '+f.days+' дн. · содержание '+m(f.upkeep)+'/мес.</small><p class="muted">'+esc(f.desc)+'</p>'+('<p class="muted">В эксплуатации: '+count+' · строится: '+ongoing.length+'</p><button class="mini-btn" data-util393="'+f.id+'" '+(s.cash<f.cost?'disabled':'')+'>Построить ещё один</button>')+'</div>';
 }html+='</div>'}
 html+='<h3>События инженерных сетей</h3>'+z.log.slice(0,5).map(x=>'<p class="muted">'+esc(x)+'</p>').join('')+'</section>';return html;
}
const util393OldSmallView=smallView;smallView=function(){return util393OldSmallView()+util393view()};
// Welfare benefits depend on functioning water and sewer infrastructure.
const util393OldKPIs=staff90KPIs;staff90KPIs=function(){let k=util393OldKPIs();if(!k||!s?.small)return k;
 if(!util393state().welfareOk){if(util393built('canteen'))k.safety=Math.max(0,k.safety-2);if(util393built('dorm'))k.safety=Math.max(0,k.safety-3);}return k;};
document.addEventListener('click',e=>{let b=e.target.closest('[data-util393]');if(b)util393build(b.dataset.util393)});
