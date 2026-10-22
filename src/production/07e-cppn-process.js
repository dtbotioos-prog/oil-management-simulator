
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
