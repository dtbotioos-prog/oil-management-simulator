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
