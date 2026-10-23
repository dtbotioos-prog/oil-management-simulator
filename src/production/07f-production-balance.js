
/* v3.2 — common daily material balance, tonnes, simplified 1 tonne = 1 storage unit.
   Called once from v8advance before posting daily revenue.
   Existing v30 visual RVS simulation no longer moves inventory independently. */
function v32init(){
 if(!s.v32)s.v32={days:[],totalProduced:0,totalProcessed:0,totalSold:0,totalUnmet:0,capacityNote:'Игровое допущение: 1 т = 1 условная единица объёма РВС.'};
 let d=s.v32;d.days||=[];return d;
}
function v32settle(produced){
 let d=v32init(),t=v30init(),p=v31init();
 let tanks=t.tanks,storedBefore=tanks.reduce((n,x)=>n+(Number(x.level)||0),0);
 let totalCapacity=tanks.reduce((n,x)=>n+(Number(x.capacity)||0),0);
 let processed=0;
 if(!p.shutdown&&!p.fireEvent){
  processed=Math.max(0,produced);
  for(let meta of V31_STAGES){
   let stage=p.stages.find(x=>x.id===meta.id);
   if(!stage||!stage.online||stage.health<1){processed=0;break}
   processed=Math.min(processed,meta.capacity*Math.max(.35,stage.health/100));
  }
 }
 // The refinery-to-storage path first transfers processed oil to tanks, then dispatches
 // from stock. Daily dispatch is capped by a fixed simplified export line capacity.
 // Load processed oil into tanks, then dispatch only physically available inventory.
 let free=Math.max(0,totalCapacity-storedBefore);
 let added=Math.min(processed,free),remainder=added;
 for(let tank of tanks){let volume=Math.min(Math.max(0,tank.capacity-tank.level),remainder);tank.level+=volume;remainder-=volume;}
 let available=tanks.reduce((n,x)=>n+x.level,0);
 let dispatchCapacity=9000;
 let shipment=v33dispatch(Math.min(dispatchCapacity,available));
 let sold=shipment.sold,out=sold;
 for(let tank of tanks){let taken=Math.min(tank.level,out);tank.level-=taken;out-=taken;tank.level=Math.round(tank.level*100)/100;}
 let actualStored=added,unmet=Math.max(0,produced-processed),overflow=Math.max(0,processed-actualStored);
 t.inflow=Math.round(actualStored);t.outflow=Math.round(sold);
 let result={date:v8date(),produced:Math.round(produced*100)/100,processed:Math.round(processed*100)/100,sold:Math.round(sold*100)/100,stored:Math.round(tanks.reduce((n,x)=>n+x.level,0)*100)/100,contracts:shipment.allocations,unmet:Math.round(unmet*100)/100,overflow:Math.round(overflow*100)/100};
 d.days.push(result);if(d.days.length>730)d.days.shift();
 d.totalProduced=(d.totalProduced||0)+result.produced;
 d.totalProcessed=(d.totalProcessed||0)+result.processed;
 d.totalSold=(d.totalSold||0)+result.sold;
 d.totalUnmet=(d.totalUnmet||0)+result.unmet;
 return result;
}
function v32view(){
 let d=v32init(),last=d.days[d.days.length-1];
 let rows=last?[
 ['Добыто за сутки',last.produced+' т'],['Подготовлено на ЦППН',last.processed+' т'],
 ['Отгружено / реализовано',last.sold+' т'],['Остаток в РВС',last.stored+' усл. ед.'],
 ['Не подготовлено из-за ограничений',last.unmet+' т'],['Не размещено в РВС',last.overflow+' т']
 ]:[];
 return '<h2>Единый производственный баланс · v3.3</h2><p class="muted">Финансовая выручка рассчитывается по отгруженному объёму. Простой ЦППН останавливает подготовку, а остаток в РВС может быть реализован до исчерпания запасов.</p>'+
 (rows.map(x=>row(x[0],x[1])).join('')||'<p class="muted">Данные появятся после следующего дня.</p>')+
 '<div class="notice">Расчётная модель: 1 т = 1 условная единица хранения, отгрузочная линия — до 9 000 т/сут. Потери из-за ограничений показываются отдельно, физические свойства нефти и точная конверсия т/м³ не рассчитываются.</div>';
}
const v32oldRender=render;
render=function(){v32oldRender();if(['dispatch','finance'].includes(tab)){let el=document.getElementById('body');if(el)el.insertAdjacentHTML('beforeend',v32view())}};
