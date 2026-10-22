
/* v3.8.7 — repairs are condition-driven, not random recurring jobs. */
function repair87state(){if(!s.repair87)s.repair87={jobs:[],seq:0,history:[],lastWearMonth:null};return s.repair87}
function repair87well(id){return (s.assets?.wellList||[]).find(w=>Number(w.id)===Number(id))}
function repair87active(id){
 return repair87state().jobs.some(j=>j.well===Number(id)&&j.status==='В работе')||
 v26init().orders.some(j=>j.well===Number(id)&&j.status==='В работе')||
 ensureTree().workorders.some(j=>j.well===Number(id)&&j.status==='В работе')||
 v27init().contracts.some(j=>j.well===Number(id)&&j.status==='Исполняется');
}
function repair87normalize(){
 if(!s?.small)return;
 for(let w of s.assets?.wellList||[]){
  w.equipment||={type:'ШГН'};
  if(!Number.isFinite(+w.equipment.life)||+w.equipment.life<=0)w.equipment.life=12;
  if(!Number.isFinite(+w.equipment.age)||+w.equipment.age<0)w.equipment.age=1.3;
  w.equipment.condition=w.health;
  if(!w.repair87)w.repair87={lastCompletedDay:-9999,failures:0};
 }
}
function repair87needs(w){
 if(!w)return '';
 if(w.status==='Консервация')return 'Скважина в консервации';
 if(w.health<45)return 'Требуется диагностика и решение о КРС';
 if(w.health<70)return 'Рекомендуется диагностика / ПРС по результатам';
 if(w.status==='Остановлена')return 'Установить причину остановки перед пуском';
 return 'Плановое наблюдение, ремонт не требуется';
}
async function repair87start(id,type){
 repair87normalize();
 let w=repair87well(id),d=repair87state();
 if(!w)return uiAlert('Скважина не найдена');
 if(repair87active(id))return uiAlert('На скважине уже выполняются работы. Повторный ремонт запрещён.');
 if(w.status==='Консервация')return uiAlert('Скважина законсервирована. Нужна отдельная процедура вывода.');
 let params={
 diagnose:{name:'Диагностика',cost:2,days:2,delta:0},
 service:{name:'Плановое ТО ШГН',cost:3,days:1,delta:4},
 prs:{name:'ПРС',cost:28,days:10,delta:20},
 krs:{name:'КРС',cost:105,days:28,delta:40}
 }[type];
 if(!params)return;
 if(type==='prs'&&w.health>=70&&w.status==='Работает')return uiAlert('ПРС не обоснован: состояние '+w.health+'%. Проведите плановое ТО при необходимости.');
 if(type==='krs'&&w.health>=45&&w.status==='Работает')return uiAlert('КРС не обоснован: состояние '+w.health+'%. Сначала проведите диагностику.');
 if(type==='service'&&w.health>=90&&w.status==='Работает')return uiAlert('Плановое ТО пока не требуется.');
 if(s.cash<params.cost)return uiAlert('Недостаточно средств: '+m(params.cost));
 if(!await uiConfirm('Начать '+params.name+' скважины №'+w.id+'?\n'+m(params.cost)+' · '+params.days+' игровых дней\nРезультат появится только после завершения работ.'))return;
 s.cash-=params.cost;v25post('maintenance',params.cost,{description:params.name+' скважины №'+w.id,well:w.id,type});
 d.jobs.unshift({id:++d.seq,well:w.id,type,name:params.name,cost:params.cost,remaining:params.days,days:params.days,status:'В работе',before:w.health,wasStopped:w.status!=='Работает'});
 if(type!=='diagnose')w.status='Ремонт';
 d.history.unshift(v8date()+': '+params.name+' №'+w.id+' начат, '+m(params.cost));
 save();render();
}
function repair87day(){
 if(!s?.small)return;
 repair87normalize();
 let d=repair87state();
 for(let job of d.jobs){
  if(job.status!=='В работе')continue;
  job.remaining--;
  if(job.remaining>0)continue;
  let w=repair87well(job.well);job.status='Завершён';job.remaining=0;job.completed=v8date();
  if(w){
   if(job.type==='diagnose'){
    w.repair87.diagnosedAt=v8init().daysElapsed;
    w.repair87.diagnosis=w.health<45?'КРС':w.health<70?'ПРС':'ТО / наблюдение';
   }else{
    const improve={service:4,prs:20,krs:40}[job.type]||0;
    w.health=Math.min(98,Math.round(w.health+improve));
    w.equipment.condition=w.health;
    w.repair87.lastCompletedDay=v8init().daysElapsed;
    // A stopped well stays stopped until the player explicitly confirms restart.
    w.status='Остановлена';
    w.repair87.readyForStart=true;
   }
  }
  d.history.unshift(v8date()+': '+job.name+' №'+job.well+' завершён'+(w?'; состояние '+w.health+'%':''));
  if(typeof v19notify==='function')v19notify('Завершено: '+job.name+' скважины №'+job.well);
 }
 // Wear only once per calendar month; the old large-field engine already models other effects.
 let v=v8init(),key=v.year+'-'+v8idx();
 if(d.lastWearMonth!==key){
  d.lastWearMonth=key;
  for(let w of s.assets.wellList){
   if(w.status==='Работает'){
    w.health=Math.max(20,Math.round((w.health-.3)*10)/10);
    w.equipment.condition=w.health;
   }
  }
 }
}
const repair87oldAdvance=v8advance;
v8advance=function(){repair87oldAdvance();repair87day()};
const repair87oldTreeAction=treeAction;
treeAction=async function(id,act){
 if(!s?.small)return repair87oldTreeAction(id,act);
 if(act==='open'){treeWell=Number(id);render();return}
 let w=repair87well(id);if(!w)return;
 if(act==='stop'){
  if(repair87active(id))return uiAlert('Скважина находится в ремонте');
  if(w.status==='Работает'){w.status='Остановлена';w.repair87||={};w.repair87.manualStop=true;save();render();return}
  if(w.status!=='Остановлена')return uiAlert('Пуск недоступен для статуса: '+w.status);
  if(w.health<45)return uiAlert('Пуск запрещён: низкое техническое состояние. Необходима диагностика.');
  if(v8init().inspection.some(x=>x.well===w.id&&!x.closed))return uiAlert('Действует ограничение после происшествия.');
  if(!await uiConfirm('Подтвердить безопасную готовность скважины №'+w.id+' к пуску?'))return;
  w.status='Работает';w.repair87||={};w.repair87.readyForStart=false;save();render();return;
 }
 if(act==='prs'||act==='krs')return repair87start(id,act);
 if(act==='replace')return repair87start(id,'krs');
 return repair87oldTreeAction(id,act);
};
const repair87oldTreeView=treeView;
treeView=function(){
 if(!s?.small)return repair87oldTreeView();
 repair87normalize();
 let html=repair87oldTreeView(),w=repair87well(treeWell);
 html=html.replace(/undefined лет/g,'12 лет');
 if(!w)return html;
 let detail=repair87needs(w);
 // Replace legacy buttons in the well passport with explicit condition-driven actions.
 html=html.replace(/<button class="btn secondary compact" data-tree-action="prs"[\s\S]*?<button class="btn secondary compact" data-tree-action="replace"[^>]*>[\s\S]*?<\/button>/,
 '<button class="btn secondary compact" data-repair87="diagnose" data-well-id="'+w.id+'">Диагностика · 2 млн ₸</button>'+
 '<button class="btn secondary compact" data-repair87="service" data-well-id="'+w.id+'">ТО · 3 млн ₸</button>'+
 '<button class="btn secondary compact" data-repair87="prs" data-well-id="'+w.id+'">ПРС · 28 млн ₸</button>'+
 '<button class="btn secondary compact" data-repair87="krs" data-well-id="'+w.id+'">КРС · 105 млн ₸</button>');
 let jobs=repair87state().jobs.filter(j=>j.well===w.id);
 let note='<div class="notice"><b>Оценка состояния:</b> '+esc(detail)+'. ПРС — текущие ремонтные работы; КРС — сложное восстановление скважины. Игровые критерии, не нормативы.</div>';
 if(jobs.length)note+='<div class="notice"><b>Последняя работа:</b> '+esc(jobs[0].name)+' · '+esc(jobs[0].status)+(jobs[0].status==='В работе'?' · '+jobs[0].remaining+' дн.':'')+'</div>';
 html=html.replace('<h3>Ремонты в работе</h3>',note+'<h3>Ремонты в работе</h3>');
 html=html.replace('<h3>История операций</h3>',repair87state().jobs.filter(j=>j.status==='В работе').map(j=>row('Скв. №'+j.well+' · '+j.name,j.remaining+' дн.')).join('')+'<h3>История операций</h3>');
 return html;
};
document.addEventListener('click',e=>{let b=e.target.closest('[data-repair87]');if(b)repair87start(Number(b.dataset.wellId),b.dataset.repair87)});
const repair87oldRequest=v26requestRepair;
v26requestRepair=async function(w){
 if(s?.small)return repair87start(w.id,'diagnose');
 return repair87oldRequest(w);
};
