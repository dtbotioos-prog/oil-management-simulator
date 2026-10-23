/* v3.9.8 — contractor directory with actionable workflow and project acceptance. */
let v398Search='',v398Group='Все',v398Selected={};
const V398_GROUPS=[
 ['Ремонт скважин',['prs','krs']],
 ['Бурение и геология',['drill','design','survey']],
 ['Оборудование и диагностика',['maint','inspection','automation']],
 ['Энергетика',['electrical','lighting']],
 ['Резервуары',['rvs_build','rvs_repair','rvs_clean','anticorrosion']],
 ['Строительство',['building','building_repair','foundation','earthworks','roads','fencing']],
 ['Трубопроводы',['pipeline']],
 ['Экология',['env']],
 ['Покраска',['painting']]
];
function v398GroupFor(t){return V398_GROUPS.find(x=>x[1].includes(t))?.[0]||'Другие работы'}
function v398Start(id){
 let supplier=V27_SUPPLIERS[id];if(!supplier)return;
 let select=document.querySelector('#v398-select-'+id);
 let type=select?.value||v398Selected[id]||supplier[1][0];
 if(!supplier[1].includes(type))return uiAlert('Подрядчик не выполняет данный вид работ.');
 v398Selected[id]=type;
 s.v398PreferredSupplier=supplier[0];
 v27newTender(type);
}
function v398Availability(p){
 let active=v28migrateNames().contracts.filter(c=>c.supplier===p[0]&&c.status==='Исполняется').length;
 return {active,free:Math.max(0,p[4]-active)};
}
function v398View(){
 let d=v28migrateNames(),groups=['Все',...V398_GROUPS.map(x=>x[0])],completed=d.contracts.filter(c=>c.status==='Завершён').length,active=d.contracts.filter(c=>c.status==='Исполняется').length;
 let html='<h2>Подрядчики · управление работами</h2><p class="muted">24 расчётные подрядные организации. Компании не начинают работы самостоятельно: генеральный директор выбирает вид работ и объект, сравнивает предложения, заключает договор, затем принимает выполненные этапы.</p>';
 html+='<div class="v398-steps"><b>Как задействовать подрядчика</b><span>1. Выберите компанию и вид работ</span><span>2. Укажите скважину, РВС, здание или новый проект</span><span>3. В тендере нажмите «Заключить договор» напротив предложения</span><span>4. Прокручивайте дни, затем подпишите акты и примите объект</span></div>';
 html+='<div class="small-economy-grid"><div><small>Подрядчиков</small><b>'+V27_SUPPLIERS.length+'</b></div><div><small>Договоров в работе</small><b>'+active+'</b></div><div><small>Завершено работ</small><b>'+completed+'</b></div><div><small>Открытых тендеров</small><b>'+d.tenders.filter(t=>t.status==='Приём заявок').length+'</b></div></div>';
 html+='<h3>Выбор подрядчика</h3><div class="v398-controls"><input id="v398-search" placeholder="Найти подрядчика или работу" value="'+esc(v398Search)+'"><select id="v398-group">'+groups.map(g=>'<option '+(v398Group===g?'selected':'')+'>'+esc(g)+'</option>').join('')+'</select></div>';
 let q=v398Search.toLowerCase().trim(),listed=0;
 html+='<div class="v398-directory">';
 V27_SUPPLIERS.forEach((p,id)=>{
  let types=p[1].filter(x=>V27_TYPES[x]);
  if(v398Group!=='Все'&&!types.some(x=>v398GroupFor(x)===v398Group))return;
  if(q&&!(p[0]+' '+types.map(x=>V27_TYPES[x].label).join(' ')).toLowerCase().includes(q))return;
  listed++;
  let a=v398Availability(p),done=d.contracts.filter(c=>c.supplier===p[0]&&c.status==='Завершён').length;
  let chosen=types.includes(v398Selected[id])?v398Selected[id]:types[0];
  html+='<details class="v398-supplier"><summary><b>'+esc(p[0])+'</b><span>'+ (a.free?'Свободно бригад: '+a.free:'Все бригады заняты')+' · завершено '+done+'</span></summary><div class="v398-info">';
  html+='<p>Качество: '+p[2]+'/100 · надёжность: '+p[5]+'/100 · вместимость: '+p[4]+' бригад · действующие договоры: '+a.active+'</p>';
  html+='<label>Вид работ <select id="v398-select-'+id+'">'+types.map(t=>'<option value="'+t+'" '+(t===chosen?'selected':'')+'>'+esc(V27_TYPES[t].label)+'</option>').join('')+'</select></label>';
  html+='<button class="mini-btn" data-v398-start="'+id+'" '+(a.free===0?'disabled':'')+'>Выбрать объект и объявить тендер</button>';
  if(a.free===0)html+='<p class="muted">Бригады заняты: дождитесь окончания действующего договора или выберите другую компанию.</p>';
  html+='</div></details>';
 });
 html+='</div>';
 if(!listed)html+='<p class="muted">По заданным фильтрам подрядчиков не найдено.</p>';
 html+='<h3>Тендеры · предложения и выбор исполнителя</h3>';
 let tenders=d.tenders.slice(0,30);
 if(!tenders.length)html+='<p class="muted">Пока нет тендеров. Выберите подрядчика выше и начните с объекта работ.</p>';
 for(let t of tenders){
  let isOpen=t.status==='Приём заявок';
  html+='<details class="v398-tender" '+(isOpen?'open':'')+'><summary><b>Тендер №'+t.id+' · '+esc(V27_TYPES[t.type]?.label||t.type)+'</b><small>'+esc(t.status)+' · '+esc(t.objectName||'')+'</small></summary>';
  if(isOpen){
   let bids=t.bids.slice().sort((a,b)=>a.price-b.price);
   html+='<p class="muted">Сравните предложения. Сумма списывается один раз при заключении договора. Требуется свободная бригада, достаточный бюджет и, для ПРС/КРС, материалы на складе.</p>';
   html+='<div class="table-scroll"><table><thead><tr><th>Подрядчик</th><th>Цена</th><th>Срок</th><th>Качество</th><th>Бригады</th><th>Действие</th></tr></thead><tbody>';
   for(let b of bids){
    let a=v398Availability(V27_SUPPLIERS[b.id]);
    html+='<tr '+(b.name===s.v398PreferredSupplier?'class="v398-recommended"':'')+'><td>'+esc(b.name)+(b.name===s.v398PreferredSupplier?' · выбран ранее':'')+'</td><td>'+m(b.price)+'</td><td>'+b.days+' дн.</td><td>'+b.quality+'/100</td><td>'+a.free+' свободно</td><td><button class="mini-btn" data-v27-award="'+t.id+'" data-v27-bid="'+b.id+'" '+(!a.free||s.cash<b.price?'disabled':'')+'>Заключить договор</button></td></tr>';
   }
   html+='</tbody></table></div>';
  }else{
   let c=d.contracts.find(c=>c.tender===t.id);
   html+='<p>Договор '+(c?'№'+c.id+' · '+esc(c.supplier)+' · '+Math.round(c.progress||0)+'% готовности':'ещё не оформлен')+'</p>';
  }
  html+='</details>';
 }
 html+='<h3>Действующие и завершённые договоры</h3>';
 let contracts=d.contracts.slice(0,60);
 if(!contracts.length)html+='<p class="muted">Договоров пока нет.</p>';
 for(let c of contracts){
  let x=v36contract(c);
  html+='<details class="v398-contract" '+(c.status==='Завершён'&&!x.commissioned?'open':'')+'><summary><b>№'+c.id+' · '+esc(c.supplier)+'</b><span>'+esc(c.status)+' · '+Math.round(c.progress||0)+'%</span></summary>';
  html+='<div class="v398-info">'+row('Работы',esc(V27_TYPES[c.type]?.label||c.type))+row('Объект',esc(c.objectName||'Не указан'))+row('Стоимость',m(c.price))+row('Осталось',Math.max(0,c.remaining)+' дней')+row('Приёмка',x.commissioned?'Завершена':'Требуется подписание актов после выполнения');
  if(c.status==='Исполняется')html+='<button class="mini-btn" data-v28-extend="'+c.id+'">Продлить срок по допсоглашению</button>';
  if(c.status==='Завершён'&&!x.commissioned)html+='<p class="notice">Работы завершены. Ниже в блоке «Акты, этапы работ и ввод объектов» подпишите 3 этапа и подтвердите исполнительную документацию.</p>';
  html+='</div></details>';
 }
 html+='<p class="muted">Важно: общестроительные тендеры создают подрядный проект. Для увеличения мощностей ГТЭС, РП, КТП, КОС и добычи используйте специализированное строительство в разделе инфраструктуры: обычный договор электромонтажа сам по себе не создаёт генерацию.</p>';
 return html;
}
v27view=function(){return v398View()};
const v398OldBind=v27bind;
v27bind=function(){
 v398OldBind();
 document.querySelectorAll('[data-v398-start]').forEach(b=>b.onclick=()=>v398Start(Number(b.dataset.v398Start)));
 let q=document.querySelector('#v398-search');
 if(q)q.onchange=()=>{v398Search=q.value;render()};
 let g=document.querySelector('#v398-group');
 if(g)g.onchange=()=>{v398Group=g.value;render()};
 document.querySelectorAll('[id^="v398-select-"]').forEach(x=>x.onchange=()=>{v398Selected[Number(x.id.slice('v398-select-'.length))]=x.value});
};
// On acceptance, add genuinely new generic project assets to the register, once.
const v398OldAccept=v36accept;
v36accept=function(id,index){
 let c=v28migrateNames().contracts.find(x=>x.id===id);
 let was=c&&v36contract(c).commissioned;
 v398OldAccept(id,index);
 if(!c||was||!v36contract(c).commissioned)return;
 if(!c.assetKey&&['building','rvs_build','pipeline','roads','fencing','electrical','lighting'].includes(c.type)){
  let v=v40init();
  if(!v.assets.some(a=>a.contractId===c.id)){
   v.assets.push({id:'C'+c.id,name:c.objectName||V27_TYPES[c.type].label,area:'Подрядный проект',kind:c.type==='rvs_build'?'Резервуары':c.type==='building'?'Здания':'Инфраструктура',health:95,contractId:c.id});
   log('Объект по договору №'+c.id+' добавлен в реестр после приёмки');
   save();
  }
 }
};
