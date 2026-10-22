
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
function v27newTender(type,well){let d=v28migrateNames(),t=V27_TYPES[type];if(!t)return uiAlert('Неизвестный вид работ');if(well&&d.contracts.some(c=>c.well===well&&c.status==='Исполняется'))return uiAlert('По этой скважине уже идёт работа подрядчика');let objectName=well?'Скважина №'+well:prompt('Укажите объект работ (например, РВС-5000 №3, АБК, насосная станция)','');if(objectName===null)return;if(!objectName.trim())return uiAlert('Укажите название объекта работ');objectName=objectName.trim().slice(0,120);let x={id:++d.seq,type,well:well||null,objectName,created:v8date(),status:'Приём заявок',bids:v27bids(type,d.seq)};d.tenders.unshift(x);log('Объявлен тендер №'+x.id+': '+t.label+(well?' · скважина №'+well:''));save();render()}
function v27award(id,bidId){let d=v28migrateNames(),t=d.tenders.find(x=>x.id===id);if(!t||t.status!=='Приём заявок')return uiAlert('Тендер закрыт');let b=t.bids.find(x=>x.id===bidId);if(!b)return;let active=d.contracts.filter(x=>x.supplier===b.name&&x.status==='Исполняется').length;if(active>=b.capacity)return uiAlert('Бригады подрядчика заняты. Выберите другого исполнителя.');if(s.cash<b.price)return uiAlert('Недостаточно средств для заключения договора: '+m(b.price));
let w=null,materials=[];if(t.well){ensureAssets();w=s.assets.wellList.find(x=>x.id===t.well);if(!w)return uiAlert('Скважина не найдена');if(w.status==='Ремонт'||w.status==='Ремонт подрядчика')return uiAlert('Скважина уже ремонтируется');let stock=ensurePlant().stock;materials=[{id:6,qty:2},{id:7,qty:2},{id:9,qty:1}];let miss=materials.filter(x=>(stock.find(z=>z.id===x.id)?.qty||0)<x.qty);if(miss.length)return uiAlert('Недостаточно материалов на складе: '+miss.map(x=>stock.find(z=>z.id===x.id)?.name||x.id).join(', '));}
let advance=Math.round(b.price*.3*10)/10;
if(!confirm('Заключить договор с «'+b.name+'»?\n\nЦена: '+m(b.price)+'\nСрок: '+b.days+' игровых дней\nБригада: '+b.crew+' чел.\nАванс: '+m(advance)+'\nОстаток: '+m(b.price-advance)+'\n\nОбщая сумма резервируется в момент заключения.'))return;
if(w){let stock=ensurePlant().stock;for(let a of materials){let item=stock.find(z=>z.id===a.id);item.qty-=a.qty;item.consumed=(item.consumed||0)+a.qty;}w.status='Ремонт подрядчика';}
s.cash-=b.price;v25post('maintenance',b.price,{description:'Договор подряда',supplier:b.name,tender:id,well:t.well});
let c={id:++d.contractSeq,tender:id,type:t.type,well:t.well,objectName:t.objectName||'',supplier:b.name,price:b.price,advance,remaining:b.days,initialDays:b.days,quality:b.quality,reliability:b.reliability,crew:b.crew,status:'Исполняется',started:v8date(),endDate:'',penalty:0,warranty:Math.max(30,Math.round(b.quality*1.8)),progress:0};
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

