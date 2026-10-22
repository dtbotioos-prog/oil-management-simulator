
/* v3.7.3: unified shop plan/fact, personnel succession, mobile layout */
function v40init(){
 if(!s.v40)s.v40={staffChanges:[],vacancies:[],audit:[],productionMigration:false};
 return s.v40;
}
function v40syncShops(){
 let v=v8init(),d=v38month(v8idx()),o=ensureOperations();
 for(let sh of o.shops.filter(x=>x.kind==='oil')){
  let r=d.rows.find(x=>x.id===sh.id);
  if(!r)continue;
  sh.plan=r.plan;
 }
}
const v40oldOpsView=opsView;
opsView=function(){
 v40syncShops();
 let o=ensureOperations(),d=v38month(v8idx()),saved=[];
 for(let sh of o.shops.filter(x=>x.kind==='oil')){
  let x=d.rows.find(r=>r.id===sh.id);if(!x)continue;
  saved.push({sh,history:sh.history});
  let actual=x.actual,pct=x.plan?actual/x.plan*100:0;
  sh.history=[{actual,plan:x.plan,pct,delta:actual-x.plan,kpi:Math.min(100,Math.round(pct))},...sh.history];
 }
 try{return v40oldOpsView()}
 finally{for(let x of saved)x.sh.history=x.history}
};
const v40oldShopAction=shopAction;
shopAction=async function(act,id){
 if(act==='plan'){
  let sh=ensureOperations().shops.find(x=>x.id===Number(id));
  if(sh?.kind==='oil')return v38setShop(sh.id);
 }
 return v40oldShopAction(act,id);
};
function v40candidateList(exclude){
 let v=v8init(),list=[...v.rankCity,...v.rankField].filter(x=>x.name!==exclude&&!x.dismissed);
 return list.sort((a,b)=>b.score-a.score);
}
async function v40personnel(name,act){
 let v=v8init(),p=[...v.rankCity,...v.rankField].find(x=>x.name===name&&!x.dismissed);
 if(!p)return uiAlert('Сотрудник не найден или уже уволен');
 let d=v40init(),oldJob=p.job;
 if(act==='promote'){
  let title=await uiPrompt('Новая должность для '+p.name+':',p.job);
  if(!title?.trim()||title.trim()===p.job)return;
  let reason=await uiPrompt('Основание повышения:');
  if(!reason?.trim())return;
  if(!await uiConfirm('Назначить '+p.name+' на должность '+title.trim()+'?'))return;
  p.job=title.trim();p.score=cl(p.score+2,0,100);
  d.staffChanges.unshift(v8date()+' · повышение: '+p.name+' · '+oldJob+' → '+p.job+' · '+reason);
 }else if(act==='dismiss'){
  let reason=await uiPrompt('Основание увольнения '+p.name+' (учебная модель):');
  if(!reason?.trim())return;
  let candidates=v40candidateList(name);
  let choices=candidates.slice(0,10).map((x,i)=>(i+1)+'. '+x.name+' ('+x.job+', KPI '+x.score+')').join('\n');
  let answer=await uiPrompt('Выберите преемника (номер 1–10), либо 0 — оставить вакансию с и.о.:\n'+choices,'1');
  if(answer===null)return;
  let index=Number(answer),successor=index===0?null:candidates[index-1];
  if(!Number.isInteger(index)||index<0||index>10||(index>0&&!successor))return uiAlert('Некорректный выбор кандидата');
  let message='Уволить '+p.name+' с должности '+oldJob+'. '+(successor?'Назначить '+successor.name+' на освободившуюся должность.':'Открыть вакансию и назначить временное исполнение обязанностей.');
  if(!await uiConfirm(message))return;
  p.dismissed=true;p.job='Уволен · '+oldJob;
  let hr=v11init().employees.find(x=>x.name===p.name&&x.status==='Работает');
  if(hr){hr.status='Уволен';v.salaryFund=Math.max(0,v.salaryFund-hr.salary/1e6)}
  if(successor){
   let previous=successor.job;
   successor.job=oldJob;
   d.vacancies.push({job:previous,previous:successor.name,created:v8date(),status:'Вакансия'});
   d.staffChanges.unshift(v8date()+' · увольнение '+p.name+'; '+successor.name+' назначен на '+oldJob+'; открыта вакансия '+previous+' · '+reason);
  }else{
   d.vacancies.push({job:oldJob,previous:p.name,created:v8date(),status:'И.о. / вакансия'});
   d.staffChanges.unshift(v8date()+' · увольнение '+p.name+'; вакансия '+oldJob+' · '+reason);
  }
  v11init().inbox.unshift('Кадровый приказ: '+d.staffChanges[0]);
 }
 if(d.staffChanges.length>100)d.staffChanges.length=100;
 save();render();
}
const v40oldPeopleView=v8peopleView;
v8peopleView=function(){
 let v=v8init(),d=v40init(),old=v40oldPeopleView();
 // Original TOP-5 cards stay, but each row now has its own management controls.
 let make=(people)=>people.map(p=>'<div class="v40-actions"><button class="mini-btn" data-v40-person="'+esc(p.name)+'" data-v40-action="promote">Повысить</button><button class="mini-btn" data-v40-person="'+esc(p.name)+'" data-v40-action="dismiss">Уволить / заменить</button></div>');
 let groups=[v.rankCity,v.rankField];
 let j=0;
 // Replace each TOP-5 row by a row plus actions; target rows inside original two group cards only.
 let wrapper=document.createElement('div');wrapper.innerHTML=old;
 let cards=wrapper.querySelectorAll('.v8card');
 for(let card of cards){
  if(!card.textContent.includes('ТОП-5 лучших'))continue;
  let data=groups[j++]||[];
  let sorted=[...data].filter(x=>!x.dismissed).sort((a,b)=>b.score-a.score);
  let ranks=card.querySelectorAll('.fields > div');
  for(let [i,list] of [sorted.slice(0,5),sorted.slice(-5).reverse()].entries()){
   if(!ranks[i])continue;
   ranks[i].innerHTML='<h3>'+(i?'↘ ТОП-5 требующих внимания':'🏆 ТОП-5 лучших')+'</h3>'+
    list.map(p=>'<div class="v40-employee"><div><b>'+esc(p.name)+'</b><small>'+esc(p.job)+' · KPI '+p.score+'/100</small></div><div class="v40-actions"><button class="mini-btn" data-v40-person="'+esc(p.name)+'" data-v40-action="promote">Повысить</button><button class="mini-btn" data-v40-person="'+esc(p.name)+'" data-v40-action="dismiss">Уволить / заменить</button></div></div>').join('');
  }
 }
 let vacancies='<section class="v38-panel"><h3>Кадровые назначения и вакансии</h3>'+
 (d.vacancies.length?d.vacancies.slice(-10).reverse().map(x=>row(esc(x.job),esc(x.status)+' · '+esc(x.created))).join(''):'<p class="muted">Открытых вакансий пока нет.</p>')+
 '<h3>Журнал кадровых решений</h3>'+d.staffChanges.slice(0,10).map(x=>'<p class="v8small">'+esc(x)+'</p>').join('')+'</section>';
 return wrapper.innerHTML+vacancies;
};
const v40oldRender=render;
render=function(){
 v40oldRender();
 if(tab!=='people')return;
 let el=document.getElementById('body');if(!el)return;
 el.querySelectorAll('[data-v40-person]').forEach(b=>b.onclick=()=>v40personnel(b.dataset.v40Person,b.dataset.v40Action));
};
