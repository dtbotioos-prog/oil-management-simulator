/* v3.9.6 — compact dated inbox and transparent financial journal. */
let mail396Search='';
let mail396GroupOpen={};
function mail396DateKey(x){
 let d=String(x.created||'').trim();
 let m=d.match(/(\d{4})-(\d{2})-(\d{2})/);
 if(m)return m[1]+'-'+m[2]+'-'+m[3];
 m=d.match(/(\d{2})\.(\d{2})\.(\d{4})/);
 if(m)return m[3]+'-'+m[2]+'-'+m[1];
 return d.split(' ')[0]||'Без даты';
}
function mail396GroupLabel(date){
 let today=mail396DateKey({created:v8date()});
 if(date===today)return 'Сегодня · '+date;
 return date;
}
const mail396PreviousInbox=v11inbox;
v11inbox=function(){
 let base=mail396PreviousInbox();
 if(v14Selected)return base;
 let db=mail86db(),items=db.items.filter(x=>v14Filter==='all'||(v14Filter==='done'?['done','rejected'].includes(x.status):!['done','rejected'].includes(x.status)));
 let query=mail396Search.trim().toLowerCase();
 if(query)items=items.filter(x=>(x.text+' '+x.category+' '+x.created).toLowerCase().includes(query));
 let groups=new Map();
 for(let item of items){let k=mail396DateKey(item);if(!groups.has(k))groups.set(k,[]);groups.get(k).push(item)}
 let html='<section class="compact-mail"><div class="compact-mail-toolbar"><label>Поиск писем <input id="mail396-search" placeholder="Тема, дата или категория" value="'+esc(mail396Search)+'"></label><button data-mail396-clear="1">Очистить</button><span>Найдено: '+items.length+'</span></div>';
 if(!items.length)html+='<p class="muted">Письма не найдены.</p>';
 for(let [date,group] of [...groups].sort((a,b)=>b[0].localeCompare(a[0]))){
  let unread=group.filter(x=>x.status==='new').length;
  html+='<details class="compact-mail-group" '+(mail396GroupOpen[date]===true?'open':mail396GroupOpen[date]===false?'':unread?'open':'')+' data-mail396-group="'+esc(date)+'"><summary><b>'+esc(mail396GroupLabel(date))+'</b><span>'+group.length+' писем'+(unread?' · непрочитанных '+unread:'')+'</span></summary>';
  for(let item of group){
   html+='<button class="compact-mail-row '+(item.status==='new'?'unread':'')+'" data-v14-open="'+esc(item.id)+'"><span class="compact-mail-subject">'+esc(item.text)+'</span><small>'+esc(item.category)+' · '+esc(item.status)+'</small></button>';
  }
  html+='</details>';
 }
 html+='</section>';
 let idx=base.indexOf('<article class="v14letter');
 if(idx>=0)base=base.slice(0,idx)+html;
 else base=base.replace('<div class="notice">В выбранном разделе писем нет.</div>',html);
 return base;
};
const mail396OldBind=v14Bind;
v14Bind=function(){
 mail396OldBind();
 let q=document.querySelector('#mail396-search');
 if(q)q.onchange=()=>{mail396Search=q.value;render()};
 document.querySelectorAll('[data-mail396-clear]').forEach(x=>x.onclick=()=>{mail396Search='';render()});
 document.querySelectorAll('[data-mail396-group]').forEach(x=>x.ontoggle=()=>{mail396GroupOpen[x.dataset.mail396Group]=x.open});
};
function econ396Category(e){
 const map={sale:'Реализация нефти',opex:'Эксплуатационные расходы',payroll:'Фонд оплаты труда',incident:'Аварии и происшествия',bonus:'Премирование',maintenance:'Ремонт и капитальные работы'};
 return map[e.type]||'Прочие операции: '+e.type;
}
function econ396Detail(e){
 let m=e.meta||{};
 return m.description||m.severity|| (e.type==='sale'?'Реализация '+f(m.tons||0)+' т; начисленная выручка, фактическая оплата может поступить позже':'Без дополнительной детализации в исходной операции');
}
function econ396Sum(entries){
 let totals={};
 for(let e of entries){let key=econ396Category(e);totals[key]=(totals[key]||0)+e.amount}
 return totals;
}
const econ396Previous=v25view;
v25view=function(){
 let l=v25init(),months=[...new Set(l.entries.map(x=>x.month))].sort((a,b)=>b-a);
 let selected=s.econ396Month;
 if(!months.includes(selected))selected=months[0]??s.month;
 let entries=l.entries.filter(x=>x.month===selected);
 let income=entries.filter(x=>x.type==='sale').reduce((a,x)=>a+x.amount,0);
 let expenses=entries.filter(x=>x.type!=='sale').reduce((a,x)=>a+x.amount,0);
 let cats=econ396Sum(entries);
 let options=months.slice(0,18).map(x=>'<option value="'+x+'" '+(x===selected?'selected':'')+'>Месяц '+x+(x===s.month?' · текущий':'')+'</option>').join('');
 let h='<h2>Экономика · подробные доходы и расходы</h2><p class="muted">Все суммы в млн ₸. Выручка начисляется при реализации; поступления денежных средств могут происходить позже. Капитальные затраты и разовые списания отражаются в журнале по назначению операции.</p>';
 h+='<div class="econ396-select"><label>Период <select id="econ396-month">'+options+'</select></label></div>';
 h+='<div class="small-economy-grid"><div><small>Начисленная выручка</small><b>'+m(income)+'</b></div><div><small>Расходы по журналу</small><b>'+m(expenses)+'</b></div><div><small>Разница</small><b>'+m(income-expenses)+'</b></div><div><small>Денежные средства</small><b>'+m(s.cash)+'</b></div></div>';
 h+='<h3>Структура начислений</h3>';
 h+=Object.entries(cats).sort((a,b)=>b[1]-a[1]).map(([name,sum])=>row(name,m(sum))).join('')||'<p>Операций нет.</p>';
 h+='<h3>Каждая операция · '+entries.length+'</h3><div class="econ396-scroll">';
 h+=entries.slice().reverse().map(e=>'<details class="econ396-entry"><summary><span>'+esc(e.date)+' · '+esc(econ396Category(e))+'</span><b>'+m(e.amount)+'</b></summary><div>'+esc(econ396Detail(e))+'</div></details>').join('')||'<p>Операций нет.</p>';
 h+='</div><p class="muted">Важно: суммы, списанные напрямую без записи в бухгалтерский журнал в старых сохранениях, восстановить задним числом нельзя. В новых операциях нужно всегда указывать назначение.</p>';
 return h;
};
const econ396OldRender=render;
render=function(){
 econ396OldRender();
 let sel=document.querySelector('#econ396-month');
 if(sel)sel.onchange=()=>{s.econ396Month=Number(sel.value);save();render()};
};
