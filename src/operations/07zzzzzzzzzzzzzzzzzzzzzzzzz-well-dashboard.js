// v4.1.4 — сводка по фактическому фонду скважин на главном экране.
function well414Dashboard(){
 ensureAssets();
 const wells=s.assets?.wellList||[];
 const working=wells.filter(w=>w.status==='Работает');
 const stopped=wells.filter(w=>w.status!=='Работает');
 const repairs=stopped.filter(w=>/ремонт/i.test(w.status||''));
 const conservation=stopped.filter(w=>/консервац/i.test(w.status||''));
 const percent=wells.length?Math.round(working.length*100/wells.length):0;
 const cards=[['Всего скважин',wells.length],['В работе',working.length],['Не работают',stopped.length],['В ремонте',repairs.length],['Консервация',conservation.length]];
 const header='<section class="well414" aria-label="Контроль фонда скважин"><div class="well414-head"><h2>Контроль фонда скважин</h2><span class="well414-pill '+(stopped.length?'well414-warn':'')+'">'+(stopped.length?'⚠ Требуют внимания: '+stopped.length:'✓ Все скважины работают')+'</span></div>';
 const summary='<div class="well414-grid">'+cards.map((x,i)=>'<div class="well414-tile '+(i===2&&stopped.length?'well414-alert':'')+'"><small>'+x[0]+'</small><strong>'+x[1]+'</strong></div>').join('')+'</div><div class="well414-meter"><span style="width:'+percent+'%"></span></div><p class="muted">Работает '+percent+'% фонда · сведения обновляются по фактическому состоянию скважин.</p>';
 const problems=stopped.length?'<div class="well414-problems"><h3>Скважины, требующие внимания</h3>'+stopped.slice(0,8).map(w=>'<div class="well414-problem"><b>№'+esc(w.id)+'</b><span>'+esc(w.unit||'ГУ не указана')+'</span><span>'+esc(w.status||'Статус не указан')+'</span><small>Состояние: '+f(w.health??0)+'%</small></div>').join('')+(stopped.length>8?'<p class="muted">И ещё '+(stopped.length-8)+' скважин — в реестре.</p>':'')+'</div>':'';
 return header+summary+problems+'<button class="mini-btn" id="well414-open">Открыть реестр скважин →</button></section>';
}
const well414PreviousRender=render;
render=function(){well414PreviousRender();if(!s||tab!=='overview')return;const body=document.getElementById('body');if(!body)return;const container=document.createElement('div');container.innerHTML=well414Dashboard();const hero=body.querySelector('.v11hero');if(hero)hero.insertAdjacentElement('afterend',container);else body.prepend(container);container.querySelector('#well414-open')?.addEventListener('click',()=>{tab='assetsTree';render()});};
