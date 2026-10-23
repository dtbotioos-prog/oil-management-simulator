/* v4.0.0: turnkey contractor PRS/KRS, no local parts and no duplicate repair charges. */
const turnkey400OldRepair=repair87start;
repair87start=async function(id,type){
 if(!s?.small||!['prs','krs'].includes(type))return turnkey400OldRepair(id,type);
 repair87normalize();let w=repair87well(id);
 if(!w)return uiAlert('Скважина не найдена');
 if(repair87active(id))return uiAlert('По скважине уже ведутся работы.');
 let r=w.repair87?.report;
 if(!r||r.resolved)return uiAlert('Сначала завершите диагностику и получите действующее техническое заключение.');
 if(r.recommendation!==type.toUpperCase())return uiAlert('Заключение рекомендует: '+r.recommendation+'. '+r.reason);
 let d=v28migrateNames();
 let existing=d.tenders.find(t=>t.well===Number(id)&&t.type===type&&t.status==='Приём заявок');
 if(existing){tab='contracts';save();render();return uiAlert('Тендер №'+existing.id+' уже объявлен. Выберите подрядчика и заключите договор.');}
 let asset=v40assets().find(x=>x.key==='well:'+id);
 if(!asset)return uiAlert('Скважина отсутствует в реестре');
 v40createTender(type,asset);
 tab='contracts';save();render();
};
const turnkey400OldAward=v27award;
v27award=function(id,bidId){
 let d=v28migrateNames(),t=d.tenders.find(x=>x.id===id);
 if(t&&['prs','krs'].includes(t.type)&&s.small){
  let w=repair87well(t.well),r=w?.repair87?.report;
  if(!r||r.resolved||r.recommendation!==t.type.toUpperCase())return uiAlert('Для договора нужен действующий диагноз: '+t.type.toUpperCase()+'. Проведите диагностику скважины.');
 }
 return turnkey400OldAward(id,bidId);
};
/* Clear upfront terms in contractor offers, including scope and cost breakdown. */
const turnkey400OldContractView=v27view;
v27view=function(){
 let h=turnkey400OldContractView();
 if(!s?.small)return h;
 let d=v28migrateNames();
 let active=d.contracts.filter(x=>x.status==='Исполняется');
 let total=active.reduce((a,x)=>a+x.price,0);
 let completed=d.contracts.filter(x=>x.status==='Завершён').length;
 let count=d.tenders.filter(x=>x.status==='Приём заявок').length;
 let tiles=[['Договоров в работе',active.length],['Общая стоимость действующих',m(total)],['Завершено',completed],['Открыто тендеров',count]];
 let top='<div class="turnkey400-dashboard">'+tiles.map(x=>'<div class="turnkey400-tile"><small>'+x[0]+'</small><b>'+x[1]+'</b></div>').join('')+'</div>';
 top+='<div class="turnkey400-explain"><b>Договор под ключ</b><p>Цена коммерческого предложения — полная стоимость ПРС, КРС или бурения: работа бригады, техника, материалы, доставка, испытания и сдача результата. Компания оплачивает один договор, а не отдельные запчасти и ремонт.</p><p>ПРС и КРС назначаются после диагностики скважины. Бурение новой скважины оформляется отдельным тендером с выбором подрядчика, цены и срока.</p></div>';
 for(let c of active){let percent=Math.max(0,Math.min(100,c.progress||0));top+='<div class="turnkey400-job"><div><b>Договор №'+c.id+' · '+esc(c.supplier)+'</b><span>'+percent+'%</span></div><div class="turnkey400-bar"><i style="width:'+percent+'%"></i></div><small>'+esc(V27_TYPES[c.type]?.label||c.type)+' · '+m(c.price)+' · осталось '+c.remaining+' дн.</small></div>'}
 return top+h;
};
