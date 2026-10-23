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
 if(!await uiConfirm('Модернизировать '+gu+'? Стоимость 180 млн ₸, срок 30 дней. Дополнительно 12 подключений, 350 м³/сут и 200 кВт.'))return;
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
 let net=v20init(),out='<h3>Инфраструктура ГУ · пропускная способность</h3><p class="muted">Условные расчётные мощности. Строительство скважин ограничено свободными подключениями, пропускной способностью жидкости и электроснабжением. Модернизация занимает 30 дней.</p><div class="asset-grid">';
 for(const [gu,n] of Object.entries(net)){
  let a=v20load(gu),pct=Math.max(a.slots/n.capacity,a.fluid/n.fluidCapacity,a.power/n.powerCapacity)*100;
  out+='<div class="asset"><b>'+esc(gu)+'</b><div class="row"><span class="muted">Подключения</span><b>'+a.slots+' / '+n.capacity+'</b></div><div class="row"><span class="muted">Жидкость, м³/сут</span><b>'+a.fluid+' / '+n.fluidCapacity+'</b></div><div class="row"><span class="muted">Мощность, кВт</span><b>'+a.power+' / '+n.powerCapacity+'</b></div><div class="meter"><i style="width:'+cl(pct,0,100)+'%;background:'+(pct>95?'#e75b59':pct>80?'#e4a53b':'#35b884')+'"></i></div><small>Максимальная загрузка '+Math.round(pct)+'%</small><p>'+(n.upgrade?'Модернизация: осталось '+n.upgrade.remaining+' дн.':'<button class="mini-btn" data-v20-gu="'+esc(gu)+'">Расширить · 180 млн ₸</button>')+'</p></div>';
 }
 return out+'</div>';
}
function v19unit(w){return w.unit||'ГУ-1'}
function v19view(){ensureTree();let p=v19init(),all=s.assets.wellList,oper=all.filter(w=>w.status==='Работает').length,stopped=all.filter(w=>w.status!=='Работает').length,projects=p.projects.filter(x=>!['Введена','Отменён','Неуспешна'].includes(x.status));let gu=[...new Set(all.map(v19unit))].sort((a,b)=>Number(a.slice(3))-Number(b.slice(3)));if(!gu.length)gu=['ГУ-1'];let h='<h2>Фонд скважин и ввод новых объектов</h2><p class="muted">Строительство скважины проходит стадии: геология → согласование проекта → бурение → испытание → ввод. Денежные затраты, сроки и геологический риск моделируются поэтапно.</p><div class="dispatch-kpis"><div><small>Всего на балансе</small><strong>'+all.length+'</strong></div><div><small>Добывающие в работе</small><strong>'+oper+'</strong></div><div><small>Не работают</small><strong>'+stopped+'</strong></div><div><small>Строятся</small><strong>'+projects.length+'</strong></div></div>';
h+='<div class="card"><h3>Инициировать проект новой скважины</h3><p class="muted">Сначала проводится оценка и подготовка. Ввод возможен только после прохождения всех этапов. Все суммы — расчётные оценки в млн ₸.</p><div class="fields"><label>Размещение на ГУ<select id="v19gu">'+gu.map(g=>'<option value="'+esc(g)+'">'+esc(g)+'</option>').join('')+'</select></label><label>Тип скважины<select id="v19kind"><option value="Добывающая">Добывающая</option><option value="Нагнетательная">Нагнетательная</option></select></label><label>Способ эксплуатации<select id="v19method"><option value="Станок-качалка">Станок-качалка</option><option value="ЭЦН">ЭЦН</option><option value="Фонтанная">Фонтанная</option></select></label></div><button class="btn secondary" data-v19="create">Начать проект · геология 45 млн ₸</button></div>';
h+=v20view();h+='<h3>Проекты и этапы согласования</h3>'+(p.projects.length?p.projects.slice().reverse().map(x=>'<div class="card"><b>Проект №'+x.id+' · '+esc(x.kind)+' · '+esc(x.gu)+'</b><div class="row"><span class="muted">Этап</span><b>'+esc(x.status)+'</b></div><div class="row"><span class="muted">Финансирование</span><b>'+f(x.spent)+' млн ₸</b></div><div class="row"><span class="muted">Прогресс</span><b>'+x.progress+' / '+x.duration+' дней</b></div><div class="meter"><i style="width:'+cl(x.progress/Math.max(1,x.duration)*100,0,100)+'%"></i></div><p class="muted">'+esc(x.note||'Ожидается завершение этапа')+'</p>'+(x.status==='Ожидает решения'?'<button class="mini-btn" data-v19="approve" data-id="'+x.id+'">'+esc(x.nextLabel||'Продолжить')+'</button> <button class="mini-btn" data-v19="cancel" data-id="'+x.id+'">Отменить проект</button>':'')+'</div>').join(''):'<p class="muted">Пока нет проектов.</p>');
h+='<h3>Управление действующим фондом</h3><p class="muted">Консервация сохраняет скважину на балансе, но прекращает добычу. Ликвидация — отдельный проект с проверкой оснований и затратами. Простое изменение численности скважин вручную исключено.</p><div class="fields"><label>Скважина<select id="v19well">'+all.map(w=>'<option value="'+w.id+'">№'+w.id+' · '+esc(w.unit)+' · '+esc(w.status)+'</option>').join('')+'</select></label></div><div class="actions"><button class="mini-btn" data-v19="conserve">Консервировать</button><button class="mini-btn" data-v19="resume">Возобновить эксплуатацию</button><button class="mini-btn" data-v19="abandon">Ликвидировать · 90 млн ₸</button></div>';
h+='<h3>История изменения фонда</h3>'+(p.journal.length?p.journal.slice(0,15).map(t=>'<div class="row">'+esc(t)+'</div>').join(''):'<p class="muted">Пока нет записей.</p>');return h}
async function v19act(action,id){let p=v19init();ensureTree();if(action==='create'){if(s.cash<45)return uiAlert('Недостаточно средств на геологическую оценку');let gu=document.getElementById('v19gu')?.value,kind=document.getElementById('v19kind')?.value,method=document.getElementById('v19method')?.value;if(!gu||!kind||!method)return;if(!await uiConfirm('Начать проект '+kind.toLowerCase()+' скважины на '+gu+'? Геологическая оценка: 45 млн ₸, срок 14 дней.'))return;s.cash-=45;let x={id:++p.seq,gu,kind,method,status:'Геологическая оценка',progress:0,duration:14,spent:45,note:'Изучение геологических данных и перспективности бурения'};p.projects.push(x);v19notify('Открыт проект №'+x.id+' ('+gu+'), геологическая оценка');}
else if(['approve','cancel'].includes(action)){let x=p.projects.find(x=>x.id===Number(id));if(!x||x.status!=='Ожидает решения')return;if(action==='cancel'){if(!await uiConfirm('Закрыть проект №'+x.id+'? Ранее понесённые расходы не возвращаются.'))return;x.status='Отменён';v19notify('Проект №'+x.id+' отменён');}else{let stage=x.stage;if(stage==='design'){if(s.cash<120)return uiAlert('Недостаточно средств: требуется 120 млн ₸');if(!await uiConfirm('Утвердить проектирование скважины №'+x.id+'? 120 млн ₸, 25 дней.'))return;s.cash-=120;x.spent+=120;x.status='Проектирование и согласование';x.progress=0;x.duration=25;}else if(stage==='drill'){if(s.cash<650)return uiAlert('Недостаточно средств: требуется 650 млн ₸');if(!await uiConfirm('Начать бурение по проекту №'+x.id+'? 650 млн ₸, 65 дней. Возможен геологический неуспех.'))return;s.cash-=650;x.spent+=650;x.status='Бурение';x.progress=0;x.duration=65;}else if(stage==='test'){if(s.cash<85)return uiAlert('Недостаточно средств: требуется 85 млн ₸');if(!await uiConfirm('Начать испытание и освоение? 85 млн ₸, 18 дней.'))return;s.cash-=85;x.spent+=85;x.status='Испытание';x.progress=0;x.duration=18;}else if(stage==='commission'){if(s.cash<75)return uiAlert('Недостаточно средств: требуется 75 млн ₸');if(!await uiConfirm('Ввести скважину в эксплуатацию после испытаний? 75 млн ₸, 7 дней.'))return;s.cash-=75;x.spent+=75;x.status='Подготовка к вводу';x.progress=0;x.duration=7;}else return;v19notify('Проект №'+x.id+': '+x.status);}}
else{let w=s.assets.wellList.find(x=>x.id===Number(document.getElementById('v19well')?.value));if(!w)return uiAlert('Скважина не выбрана');if(action==='conserve'){if(w.status!=='Работает')return uiAlert('Консервация доступна только для работающей скважины');if(!await uiConfirm('Законсервировать скважину №'+w.id+'? Добыча прекратится, объект останется на балансе.'))return;w.status='Консервация';v19notify('Скважина №'+w.id+' переведена в консервацию');}else if(action==='resume'){if(w.status!=='Консервация')return uiAlert('Возобновление доступно только для законсервированной скважины');if(w.health<45)return uiAlert('Техническое состояние ниже допустимого расчётного порога. Сначала требуется ремонт.');if(!await uiConfirm('Возобновить эксплуатацию скважины №'+w.id+' после проверки готовности?'))return;w.status='Работает';v19notify('Возобновлена эксплуатация скважины №'+w.id);}else if(action==='abandon'){if(w.status==='Работает')return uiAlert('Сначала остановите и законсервируйте скважину');if(s.cash<90)return uiAlert('Недостаточно средств на ликвидацию');if(!await uiConfirm('Ликвидировать скважину №'+w.id+'? Стоимость 90 млн ₸. Действие необратимо и изменит фонд скважин.'))return;s.cash-=90;p.retired.push({...w,retiredAt:v8date()});s.assets.wellList=s.assets.wellList.filter(x=>x.id!==w.id);s.wells=s.assets.wellList.length;v19notify('Ликвидирована скважина №'+w.id+', затраты 90 млн ₸');}}
save();render()}
function v19day(){v26day();v21day();v20day();let p=v19init();for(let x of p.projects){if(x.status==='Ожидает инфраструктуру'){x.status='Подготовка к вводу';x.progress=x.duration; }if(['Ожидает решения','Введена','Отменён','Неуспешна'].includes(x.status))continue;x.progress++;if(x.progress<x.duration)continue;if(x.status==='Геологическая оценка'){x.stage='design';x.status='Ожидает решения';x.nextLabel='Утвердить проектирование · 120 млн ₸';x.note='Геологическая оценка подготовлена. Требуется решение по проектированию.';}else if(x.status==='Проектирование и согласование'){x.stage='drill';x.status='Ожидает решения';x.nextLabel='Начать бурение · 650 млн ₸';x.note='Проектная документация подготовлена в рамках расчётный модели.';}else if(x.status==='Бурение'){if(Math.random()<.12){x.status='Неуспешна';x.note='Испытания не подтвердили промышленную продуктивность; затраты понесены.';v19notify('Проект №'+x.id+': бурение оказалось непродуктивным');continue}x.stage='test';x.status='Ожидает решения';x.nextLabel='Провести испытание · 85 млн ₸';x.note='Бурение завершено. Нужны испытание и освоение.';}else if(x.status==='Испытание'){x.stage='commission';x.status='Ожидает решения';x.nextLabel='Подготовить ввод · 75 млн ₸';x.note='Испытания завершены. Требуется подготовка к вводу.';}else if(x.status==='Подготовка к вводу'){ensureAssets();let a=s.assets.wellList;let id=Math.max(1000,...a.map(w=>w.id),...p.retired.map(w=>w.id))+1;let sample=a.find(w=>w.unit===x.gu);let shop=sample?.shop??0;let w={id,unit:x.gu,shop,status:'Работает',rate:x.kind==='Нагнетательная'?0:Math.round((8+Math.random()*13)*10)/10,water:Math.round(15+Math.random()*35),health:96,wellKind:x.kind,equipment:{type:x.kind==='Нагнетательная'?'Нагнетательный насос':x.method,serial:'SIM-'+id,age:0,life:12,condition:96,maintenance:0}};let check=v20canCommission(x.gu,x.kind,x.method,w.rate,w.water);
 if(!check.ok){x.status='Ожидает инфраструктуру';x.note='Ввод приостановлен: '+check.reason+'. Расширьте мощность ГУ.';v19notify('Проект №'+x.id+': ввод отложен — '+check.reason);continue;}
 a.push(w);s.wells=a.length;x.status='Введена';x.wellId=id;x.note='Скважина №'+id+' введена в фонд '+x.gu;v19notify('Введена новая '+x.kind.toLowerCase()+' скважина №'+id+' на '+x.gu);}if(x.status==='Ожидает решения')v19notify('Проект №'+x.id+': завершён этап, требуется решение руководителя');}}
function v19bind(){document.querySelectorAll('[data-v19]').forEach(b=>b.onclick=()=>v19act(b.dataset.v19,b.dataset.id));document.querySelectorAll('[data-v20-gu]').forEach(b=>b.onclick=()=>v20act(b.dataset.v20Gu))}

