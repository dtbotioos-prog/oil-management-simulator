
/* v3.0: Operational CPPN, tank register, animated instrumentation and fire-safety controls.
   Values are fictional game simulations, not physical safety setpoints. */
function v30init(){
 if(!s.v30)s.v30={tanks:[
  {id:1,name:'РВС-5000 №1',capacity:5000,level:2500,health:87,paint:72,fire:84},
  {id:2,name:'РВС-5000 №2',capacity:5000,level:1600,health:91,paint:88,fire:88},
  {id:3,name:'РВС-10000 №1',capacity:10000,level:3800,health:85,paint:70,fire:86}
 ],facilities:[{name:'ЦППН — производственный корпус',kind:'building',health:85,paint:72,fire:85}],fire:{pumps:92,hydrants:87,alarm:90,foam:88,training:80},inflow:0,outflow:0,alarms:[],processedContracts:[]};
 let d=s.v30;
 d.tanks||=[];d.facilities||=[];d.fire||={pumps:90,hydrants:90,alarm:90,foam:90,training:80};
 d.alarms||=[];d.processedContracts||=[];
 return d;
}
function v30safe(x){return Math.max(0,Math.min(100,Number(x)||0))}
function v30metric(){
 let d=v30init(),p=v21init(),calc=v21calc(),n=p.nodes['ЦППН'],power=p.nodes['ПС-1'];
 let load=(calc.load['ЦППН']||0)/Math.max(1,n.capacity*v21nodeAvailable(n));
 let powerLoad=(calc.load['ПС-1']||0)/Math.max(1,power.capacity*v21nodeAvailable(power));
 let pressure=Math.round((1.1+2.4*Math.min(1.2,load))*10)/10;
 let energy=Math.round(powerLoad*100);
 let fire=(Object.values(d.fire).reduce((a,b)=>a+v30safe(b),0)/Object.keys(d.fire).length);
 let tanks=d.tanks.reduce((a,t)=>a+t.level,0),capacity=d.tanks.reduce((a,t)=>a+t.capacity,0);
 return {pressure,energy,load:Math.round(load*100),fire:Math.round(fire),oil:Math.round(calc.oil),tanks,capacity,fill:capacity?Math.round(tanks/capacity*100):0,plantHealth:n.health};
}
function v30day(){
 let d=v30init(),calc=v21calc(),oil=Math.max(0,calc.oil);
 // This is a simulated tank-buffer balance; daily sales remain in the v2.5 finance model.
 // v3.2 owns the tank mass balance and dispatches the actual daily movement.
 d.tanks.forEach(t=>{t.level=Math.round(t.level*10)/10;t.fire=v30safe(t.fire-.012);t.paint=v30safe(t.paint-.007)});
 d.fire.pumps=v30safe(d.fire.pumps-.009);d.fire.alarm=v30safe(d.fire.alarm-.007);
 let m=v30metric(),alerts=[];
 if(m.fill>=90)alerts.push('Высокое заполнение резервуарного парка: '+m.fill+'%');
 if(m.energy>=90)alerts.push('Повышенная загрузка электроснабжения: '+m.energy+'%');
 if(m.fire<70)alerts.push('Требуется усилить противопожарную готовность');
 if(m.plantHealth<55)alerts.push('Низкое техническое состояние ЦППН');
 d.alarms=alerts;
 // Process new completed contractor work once. Previous contract history remains untouched.
 let contracts=v28migrateNames().contracts;
 for(let c of contracts){
  if(c.status!=='Завершён'||d.processedContracts.includes(c.id))continue;
  d.processedContracts.push(c.id);
  let name=(c.objectName||'').toLowerCase(),tank=d.tanks.find(t=>t.name.toLowerCase()===name);
  if(c.type==='rvs_build'){
   if(!tank){let match=name.match(/рвс[-\s]*(\d+)/i),capacity=match?Number(match[1]):5000;capacity=Math.max(100,Math.min(50000,capacity));d.tanks.push({id:Math.max(0,...d.tanks.map(t=>t.id))+1,name:c.objectName||'Новый РВС',capacity,level:0,health:100,paint:100,fire:95});}
  }else if(tank&&c.type==='rvs_repair'){tank.health=100;tank.fire=Math.min(100,tank.fire+10)}
  else if(tank&&c.type==='rvs_clean'){tank.health=Math.min(100,tank.health+12)}
  else if(tank&&['painting','anticorrosion'].includes(c.type)){tank.paint=100;tank.fire=Math.min(100,tank.fire+5)}
  else if(c.type==='building'){d.facilities.push({name:c.objectName||'Новое здание',kind:'building',health:100,paint:100,fire:90})}
  else if(['painting','building_repair'].includes(c.type)){let building=d.facilities.find(x=>x.name.toLowerCase()===name);if(building){if(c.type==='painting')building.paint=100;else building.health=100}}
 }
 if(d.processedContracts.length>1500)d.processedContracts=d.processedContracts.slice(-1000);
}
function v30gauge(label,value,max,unit,warning){
 let pct=Math.max(0,Math.min(100,value/max*100)),angle=-120+pct*240;
 return '<div class="v30-gauge"><div class="v30-dial"><div class="v30-ticks"></div><div class="v30-needle" style="transform:translateX(-50%) rotate('+angle+'deg)"></div><div class="v30-pin"></div></div><b>'+esc(label)+'</b><strong>'+value+' '+unit+'</strong><div class="v30-meter"><span style="width:'+pct+'%;background:'+(warning?'#e5a34a':'#34a7a1')+'"></span></div></div>';
}
function v30view(){
 let d=v30init(),m=v30metric(),out='<h2>ЦППН · цифровой пульт управления</h2><p class="muted">Игровая модель технологических параметров. Показания изменяются при ходе времени, ремонтах и изменении добычи. Это не нормативные уставки реального оборудования.</p>';
 out+='<div class="v30-grid">'+v30gauge('Загрузка энергии',m.energy,100,'%',m.energy>90)+v30gauge('Загрузка ЦППН',m.load,100,'%',m.load>90)+v30gauge('Заполнение РВС',m.fill,100,'%',m.fill>90)+v30gauge('Состояние ЦППН',m.plantHealth,100,'%',m.plantHealth<55)+'</div>';
 out+='<h3>Материальный поток</h3>'+row('Нефть на входе (модель)',m.oil+' т/сут')+row('В резервуары за день',d.inflow+' условных м³')+row('Отгрузка из резервуаров',d.outflow+' условных м³')+row('Запас в резервуарах',Math.round(m.tanks).toLocaleString('ru-RU')+' / '+m.capacity.toLocaleString('ru-RU')+' м³');
 out+='<h3>Резервуарный парк</h3>';
 for(let t of d.tanks){let pct=Math.round(t.level/t.capacity*100);out+='<div class="v30-tankrow"><div class="v30-tank"><div class="v30-liquid" style="height:'+pct+'%"></div><span>'+pct+'%</span></div><div style="flex:1"><b>'+esc(t.name)+'</b>'+row('Заполнение',Math.round(t.level)+' / '+t.capacity+' м³')+row('Техсостояние',Math.round(t.health)+'%')+row('Покрытие / покраска',Math.round(t.paint)+'%')+row('Пожарная защита',Math.round(t.fire)+'%')+'<button class="mini-btn" data-v30-tender="rvs_repair" data-v30-object="'+esc(t.name)+'">Ремонт</button> <button class="mini-btn" data-v30-tender="anticorrosion" data-v30-object="'+esc(t.name)+'">Покраска</button></div></div>';}
 out+='<h3>Пожарная безопасность</h3><p class="muted">Контроль пожарных насосов, гидрантов, сигнализации, пенообразования и подготовки персонала.</p>';
 for(let [key,label] of Object.entries({pumps:'Пожарные насосы',hydrants:'Гидранты и водоснабжение',alarm:'Сигнализация и оповещение',foam:'Пенное пожаротушение',training:'Подготовка персонала'}))out+=row(label,Math.round(d.fire[key])+'%');
 out+='<div class="actions"><button class="btn secondary" data-v30-fire="inspect">Проверить системы · 8 млн ₸</button><button class="btn secondary" data-v30-fire="training">Провести учение · 4 млн ₸</button><button class="btn secondary" data-v30-fire="service">ТО противопожарных систем · 25 млн ₸</button></div>';
 if(d.alarms.length)out+='<div class="notice bad"><b>Сигналы диспетчера:</b> '+d.alarms.map(esc).join(' · ')+'</div>';
 out+='<h3>Строительство и модернизация</h3><div class="actions"><button class="btn secondary" data-v30-tender="rvs_build">Тендер на новый РВС</button><button class="btn secondary" data-v30-tender="building">Тендер на здание</button><button class="btn secondary" data-v30-tender="painting">Тендер на покраску</button></div>';
 return out;
}
function v30fireAction(type){
 let d=v30init(),cost={inspect:8,training:4,service:25}[type];if(!cost)return;
 if(s.cash<cost)return uiAlert('Недостаточно средств');
 if(!confirm('Выполнить мероприятие по пожарной безопасности за '+m(cost)+'?'))return;
 s.cash-=cost;v25post('maintenance',cost,{description:'Пожарная безопасность: '+type});
 if(type==='inspect'){d.fire.alarm=v30safe(d.fire.alarm+8);d.fire.hydrants=v30safe(d.fire.hydrants+5)}
 if(type==='training')d.fire.training=v30safe(d.fire.training+18);
 if(type==='service'){d.fire.pumps=v30safe(d.fire.pumps+20);d.fire.foam=v30safe(d.fire.foam+18);d.fire.hydrants=v30safe(d.fire.hydrants+12)}
 log('Пожарная безопасность: '+type);save();render();
}
function v30bind(){
 document.querySelectorAll('[data-v30-fire]').forEach(b=>b.onclick=()=>v30fireAction(b.dataset.v30Fire));
 document.querySelectorAll('[data-v30-tender]').forEach(b=>b.onclick=()=>{
  let type=b.dataset.v30Tender,object=b.dataset.v30Object;
  if(object){let d=v28migrateNames(),t=V27_TYPES[type];let x={id:++d.seq,type,well:null,objectName:object,created:v8date(),status:'Приём заявок',bids:v27bids(type,d.seq)};d.tenders.unshift(x);log('Тендер №'+x.id+': '+t.label+' — '+object);tab='contracts';save();render();}
  else{tab='contracts';v27newTender(type)}
 });
}
const v30previousRender=render;
render=function(){v30previousRender();if(tab==='dispatch'||tab==='hse'){let content=document.getElementById('body');if(content){content.insertAdjacentHTML('beforeend',v30view());v30bind()}}};
const v30previousDay=v26day;
v26day=function(){v30previousDay();v30day()};
