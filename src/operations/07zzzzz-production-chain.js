/* v3.9.4 — connected production chain and investment planning. */
function chain394(){if(!s?.small)return null;
 const u=util393state(),f=fac392init(),staff=staff90KPIs(),built=id=>f.completed.includes(id),wells=s.assets.wellList.filter(w=>w.status==='Работает'&&w.wellKind!=='Нагнетательная');
 const shortage=Math.max(0,u.need-u.capacity),extraPower=Math.ceil(shortage/500),extraWater=Math.max(0,u.waterNeed-u.waterCapacity),extraSewer=Math.max(0,u.sewage-u.sewerCapacity);
 const conditions={power:u.unpowered.length===0,water:u.waterNeed<=u.waterCapacity,sewer:u.sewage<=u.sewerCapacity,staff:staff.coverage>=1};
 const poweredRatio=wells.length?u.powered.length/wells.length:1;
 const utilityRisk=conditions.water&&conditions.sewer?1:.92;
 const logistics=built('warehouse')&&built('transport')?1:built('warehouse')||built('transport')?.97:.94;
 const preparation=built('lab')?1:.98;
 const oilFactor=utilityRisk*logistics*preparation;
 const recommendations=[];
 if(shortage>0)recommendations.push({title:'Дефицит электроснабжения: '+shortage+' кВт',reason:'Часть скважин не получает питание. Требуется достаточная генерация и пропускная способность сети.',actions:['ГТЭС (+500 кВт генерации)','РП (+500 кВт распределения)','КТП (+350 кВт распределения)']});
 if(extraWater>0)recommendations.push({title:'Недостаток водоснабжения: '+extraWater+' м³/сут',reason:'Бытовые объекты не обеспечены водой.',actions:['Станция водоподготовки (+25 м³/сут)']});
 if(extraSewer>0)recommendations.push({title:'Недостаток очистки стоков: '+extraSewer+' м³/сут',reason:'Для расширения нужна полная цепочка КНС → КОС.',actions:['КНС (+20 м³/сут)','КОС (+30 м³/сут)']});
 if(!conditions.staff)recommendations.push({title:'Недостаточно операторов',reason:'Штат не обеспечивает потребность действующих скважин.',actions:['Нанять операторов по добыче нефти и газа']});
 if(!built('warehouse'))recommendations.push({title:'Нет склада МТР',reason:'Возможны задержки поставки запчастей и расходных материалов.',actions:['Построить центральный склад МТР']});
 if(!built('lab'))recommendations.push({title:'Нет производственной лаборатории',reason:'Снижена надёжность контроля качества подготовки продукции.',actions:['Построить производственную лабораторию']});
 return {u,staff,conditions,oilFactor,poweredRatio,recommendations,shortage,extraWater,extraSewer};
}
const chain394OldProd=v8dailyProduction;
v8dailyProduction=function(){let b=chain394OldProd();if(!s?.small)return b;return b*chain394().oilFactor;};
function chain394view(){let c=chain394();if(!c)return '';
 const label=(yes)=>yes?'Обеспечено':'Дефицит';
 let h='<section class="small-panel"><h2>Единая производственная цепочка и решения генерального директора</h2><p class="muted">Скважины → электроснабжение → добыча → контроль качества → отгрузка. Персонал, вода, канализация, склад и ремонтная база обеспечивают работу предприятия. Ограничения уменьшают фактический результат; строительство расширяет мощности после ввода объекта.</p>';
 h+='<div class="small-economy-grid">'+[
 ['Электроснабжение',label(c.conditions.power)],['Водоснабжение',label(c.conditions.water)],['КНС и КОС',label(c.conditions.sewer)],['Операторские смены',label(c.conditions.staff)],['Добыча: инфраструктурный коэффициент',Math.round(c.oilFactor*100)+'%'],['Денежные средства',m(s.cash)]
 ].map(x=>'<div><small>'+x[0]+'</small><b>'+x[1]+'</b></div>').join('')+'</div>';
 h+='<h3>Что ограничивает развитие</h3>';
 if(!c.recommendations.length)h+='<p>Критичных ограничений не выявлено. Можно планировать новые скважины и резерв мощности.</p>';
 for(let r of c.recommendations)h+='<div class="small-project"><b>'+esc(r.title)+'</b><p>'+esc(r.reason)+'</p><small>Решение: '+r.actions.map(esc).join('; ')+'</small></div>';
 h+='<p class="muted">Можно строить несколько однотипных ГТЭС, РП, КТП, КНС, КОС и станций водоподготовки. Каждая стройка оплачивается отдельно и после завершения добавляет мощность. Резервная ДЭС не считается постоянной генерацией.</p></section>';
 return h;
}
const chain394OldView=smallView;smallView=function(){return chain394view()+chain394OldView()};
