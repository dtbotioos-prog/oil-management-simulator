/* v3.6.1 — fictional annual league of 100 oil companies, including player. */
const V37_ASPECTS=[['production','Добыча',20],['finance','Финансы',20],['hse','Промышленная безопасность',18],['ecology','Экология',10],['equipment','Оборудование',10],['staff','Персонал',8],['camp','Вахтовый посёлок',7],['investment','Инвестиции',7]];
const V37_PREFIX=['Север','Восток','Запад','Юг','Альфа','Бета','Гео','Прайм','Орбита','Континент','Атлас','Горизонт','Энерго','Стандарт','Пром','Терра','Вектор','Меридиан','Сфера','Норд'];
const V37_SUFFIX=['Нефть','Ойл','Петролеум','Энерджи','Ресурс'];
function v37init(){
 if(!s.v37)s.v37={years:{},currentYear:null,selectedYear:null};
 let d=s.v37;d.years||={};d.history||=[];d.live||=null;return d;
}
function v37seedSeason(year){
 let d=v37init();
 // First season always starts at the bottom. Later seasons inherit 80% of earned reputation.
 let carry=d.history.length?Math.max(0,Math.min(85,d.history[d.history.length-1].score*.8)):0;
 d.live={year,dayIndex:v8init().daysElapsed||0,score:carry,previousRank:100,rank:100,change:0,trend:[],first:true};
 d.currentYear=year;
}
function v37hash(a,b,c){let x=Math.sin(a*127.1+b*311.7+c*74.7)*43758.5453123;return x-Math.floor(x)}
function v37score(aspects){let weighted=V37_ASPECTS.reduce((sum,x)=>sum+(Number(aspects[x[0]])||0)*x[2],0)/100;return Math.round(weighted*10)/10}
function v37player(year){
 let v=v8init(),camp=v36init().camp,treasury=v35init(),contracts=v28migrateNames().contracts;
 let hist=v.monthHistory.filter(x=>x.year===year),production=hist.length?hist.reduce((a,x)=>a+Math.min(140,Math.max(0,x.rate)),0)/hist.length:100;
 let cash=s.cash,debt=treasury.loans.reduce((a,x)=>a+(x.balance||0),0);
 let incidents=v.incidents.filter(x=>x.date.endsWith(String(year))).length;
 let done=contracts.filter(x=>x.endDate?.endsWith(String(year))).length,active=contracts.filter(x=>x.status==='Исполняется').length;
 let clip=x=>Math.max(0,Math.min(100,Math.round(x)));
 let a={production:clip(65+(production-85)*.7),finance:clip(65+Math.max(-35,Math.min(35,cash/250))-debt/250),hse:clip(s.safety-incidents*2.5),ecology:clip(60+(s.safety-60)*.4-(incidents*.8)),equipment:clip(s.condition),staff:clip(v.morale*.55+v.conditions*.45),camp:clip((camp.mealQuality+camp.housing+camp.cleanliness+camp.security)/4-(camp.residents>camp.beds?12:0)),investment:clip(65+done*4-active*2+(treasury.budget>0?Math.min(12,contracts.length*2):0))};
 return {id:'player',name:s.name||'Моя нефтяная компания',aspects:a,score:v37score(a),player:true};
}
function v37generate(year){
 let d=v37init(),companies=[];
 for(let i=0;i<99;i++){
  let a={},base=42+v37hash(i,year,1)*48;
  V37_ASPECTS.forEach((x,j)=>{a[x[0]]=Math.round(Math.max(12,Math.min(99,base+(v37hash(i,year,j+3)-.5)*27)))});
  let competitor={id:'r'+i,name:V37_PREFIX[Math.floor(i/5)]+' '+V37_SUFFIX[i%5]+' '+(i+1),aspects:a,score:v37score(a),player:false};
  // Deterministic competitor movement as the season advances.
  let ticks=Math.max(0,(v8init().daysElapsed||0)-(d.live?.dayIndex||0));
  competitor.score=Math.max(8,Math.min(99,Math.round((competitor.score+Math.sin(ticks/8+i*2.3)*2.5+Math.sin(ticks/25+i*.6)*2)*10)/10));
  companies.push(competitor);
 }
 let player=v37player(year);
 if(d.live?.year===year)player.score=Math.round(d.live.score*10)/10;
 companies.push(player);return v37sort(companies);
}
function v37sort(items){items.sort((a,b)=>b.score-a.score||(a.name||'').localeCompare(b.name||''));items.forEach((x,i)=>x.rank=i+1);return items}
function v37refresh(){
 let d=v37init(),year=v8init().year;
 if(!d.live||d.live.year!==year)v37seedSeason(year);
 d.years[year]=v37generate(year);
 return d;
}
function v37tick(){
 let d=v37refresh(),year=v8init().year,live=d.live;
 let player=v37player(year),target=player.score;
 // Daily progression is gradual, and can move downward if company performance falls.
 // Early career starts in 100th place and does not jump to top ranks in one day.
 let age=(v8init().daysElapsed||0)-live.dayIndex;
 let maxRise=age<30?.32:age<90?.23:.17;
 let delta=(target-live.score)*.025;
 live.score=Math.max(0,Math.min(100,live.score+Math.max(-.8,Math.min(maxRise,delta))));
 let list=v37generate(year),mine=list.find(x=>x.player),oldRank=live.rank;
 live.previousRank=oldRank;live.rank=mine.rank;live.change=oldRank-mine.rank;
 live.trend.push({date:v8date(),rank:mine.rank,score:Math.round(live.score*10)/10});
 if(live.trend.length>365)live.trend.shift();
 d.years[year]=list;
 if(live.change!==0){let direction=live.change>0?'поднялась':'опустилась';log('Рейтинг компаний: ваша компания '+direction+' на '+Math.abs(live.change)+' поз., место '+live.rank+'/100')}
}
function v37annualSnapshot(oldYear){
 let d=v37init(),list=d.years[oldYear]||[],mine=list.find(x=>x.player);
 d.history.push({year:oldYear,rank:mine.rank,score:mine.score,trend:d.live.trend.slice()});
 d.currentYear=null;
 log('Итоги рейтинга '+oldYear+': '+mine.rank+' место из 100, '+mine.score+' балла');
}
function v37view(){
 let d=v37refresh(),years=Object.keys(d.years).map(Number).sort((a,b)=>b-a),selected=years.includes(d.selectedYear)?d.selectedYear:v8init().year;
 let list=d.years[selected]||[],mine=list.find(x=>x.player),isCurrent=selected===v8init().year,live=d.live,trend=isCurrent?live?.trend:(d.history.find(x=>x.year===selected)?.trend||[]);
 let out='<section class="v37-league"><h2>🏆 Рейтинг 100 нефтяных компаний</h2><p class="muted">'+(isCurrent?'Текущий предварительный рейтинг':'Итоговый рейтинг')+' за '+selected+' год. Все конкуренты вымышлены; их оценки генерируются по игровой модели, а показатели вашего предприятия зависят от решений в карьере.</p>';
 out+='<div class="actions"><label for="v37-year">Год:</label><select id="v37-year">'+years.map(y=>'<option value="'+y+'"'+(y===selected?' selected':'')+'>'+y+'</option>').join('')+'</select></div>';
 if(mine)out+='<div class="v37-summary"><div><small>Место вашей компании</small><strong>'+mine.rank+' / 100</strong></div><div><small>Итоговый балл</small><strong>'+mine.score+' / 100</strong></div><div><small>Лидер рейтинга</small><strong>'+list[0].score+' / 100</strong></div></div>';
 if(isCurrent&&live){
  let movement=live.change>0?'▲ +'+live.change+' место':live.change<0?'▼ '+live.change+' место':'● Без изменений';
  out+='<div class="v37-motion"><span class="v37-motion-value">'+movement+'</span><span>Изменение за последний игровой день</span><span>Старт сезона: '+(d.history.length?'с перенесённой репутацией':'100-е место')+'</span></div>';
 }
 if(trend&&trend.length){
  let last=trend.slice(-45),width=660,height=125,pts=last.map((x,i)=>(i/(Math.max(1,last.length-1))*width).toFixed(1)+','+(12+(x.rank-1)/99*(height-24)).toFixed(1)).join(' ');
  out+='<h3>Движение позиции · последние '+last.length+' игровых дней</h3><div class="v37-chart"><div class="v37-chart-labels"><span>1 место</span><span>100 место</span></div><svg viewBox="0 0 660 125" role="img" aria-label="График места компании в рейтинге"><line x1="0" y1="12" x2="660" y2="12" stroke="currentColor" opacity=".2"/><line x1="0" y1="113" x2="660" y2="113" stroke="currentColor" opacity=".2"/><polyline fill="none" stroke="#269f96" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" points="'+pts+'"/></svg></div>';
 }
 out+='<h3>Оценка вашей компании по направлениям</h3><div class="v37-aspects">';
 for(let a of V37_ASPECTS){let score=mine?.aspects[a[0]]||0;out+='<div class="v37-aspect"><span>'+a[1]+' · вес '+a[2]+'%</span><b>'+score+'/100</b><div class="v37-track"><i style="width:'+score+'%"></i></div></div>'}
 out+='</div><h3>Турнирная таблица · 100 компаний</h3><div class="table-scroll"><table class="v37-table"><thead><tr><th>Место</th><th>Компания</th><th>Общий балл</th>'+V37_ASPECTS.map(a=>'<th title="'+a[1]+'">'+a[1]+'</th>').join('')+'</tr></thead><tbody>';
 for(let c of list)out+='<tr'+(c.player?' class="v37-player"':'')+'><td>'+c.rank+'</td><td>'+esc(c.name)+(c.player?' ★':'')+'</td><td><b>'+c.score+'</b></td>'+V37_ASPECTS.map(a=>'<td>'+c.aspects[a[0]]+'</td>').join('')+'</tr>';
 out+='</tbody></table></div><p class="muted">Весовая формула: добыча 20%, финансы 20%, безопасность 18%, экология 10%, оборудование 10%, персонал 8%, посёлок 7%, инвестиции 7%. Это не официальный рейтинг реальных компаний. История итоговых лет хранится в сохранении игры.</p></section>';return out;
}
function v37bind(){let e=document.getElementById('v37-year');if(e)e.onchange=()=>{v37init().selectedYear=Number(e.value);render()}}
const v37oldAdvance=v8advance;
v8advance=function(){
 let year=v8init().year;
 v37refresh();
 v37oldAdvance();
 if(v8init().year!==year){
  // Freeze last completed year and then start a new competition.
  v37annualSnapshot(year);
  v37seedSeason(v8init().year);
  v37refresh();
 }else v37tick();
};
const v37oldRender=render;
render=function(){v37oldRender();if(['overview','people','finance'].includes(tab)){let el=document.getElementById('body');if(el){el.insertAdjacentHTML('beforeend',v37view());v37bind()}}};

/* v3.6.3: persistent rank in the top bar on every gameplay screen. */
function v37topRank(){
 let d=v37refresh(),live=d.live,rank=live?.rank||100,delta=live?.change||0;
 let move=delta>0?'▲ +'+delta:delta<0?'▼ '+delta:'● 0';
 let direction=delta>0?'up':delta<0?'down':'flat';
 return '<button type="button" id="v37-top-rank" class="v37-top-rank '+direction+'" title="Открыть рейтинг 100 компаний" aria-label="Рейтинг компании: место '+rank+' из 100. Открыть таблицу рейтинга">'+
 '<span class="v37-top-icon">🏆</span><span class="v37-top-content"><span class="v37-top-label">МЕСТО В РЕЙТИНГЕ</span><span class="v37-top-number">№ '+rank+' <small>/ 100</small></span></span><span class="v37-top-change">'+move+'</span></button>';
}
const v37topOldRender=render;
render=function(){
 v37topOldRender();
 let header=document.querySelector('.v11content > header');
 if(!header)return;
 let holder=document.getElementById('v37-top-holder');
 if(!holder){holder=document.createElement('div');holder.id='v37-top-holder';header.appendChild(holder)}
 holder.innerHTML=v37topRank();
 let button=document.getElementById('v37-top-rank');
 if(button)button.onclick=()=>{tab='overview';v37init().selectedYear=v8init().year;render();let section=document.querySelector('.v37-league');if(section)section.scrollIntoView({behavior:'smooth',block:'start'})};
};
