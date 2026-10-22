/* v3.8.1: economy of one producing well; old careers unchanged. */
function v41init(){if(!s?.small)return null;return s.small.economy||(s.small.economy={monthlyFixed:.9,notes:[]})}
function v41bootstrap(){if(!s?.small)return;let e=v41init();if(e.bootstrapped)return;
 let v=v8init();v.salaryFund=3.6;v.plans=Array(12).fill(300);v.originalPlans=[...v.plans];if(s.enterprise){s.enterprise.staff=12;s.enterprise.target=300}
 s.v30=null;v30init().tanks=[{id:1,name:'РВС-1000 №1',capacity:1000,level:0,health:90,paint:90,fire:90}];
 s.v33=null;let c=v33init();c.seq=1;c.contracts=[{id:1,buyer:'Каспийский Нефтетрейдер',daily:35,remaining:10000,fulfilled:0,status:'Действует',created:'Стартовый договор',priceMultiplier:1,terms:7,advancePct:0}];c.shipments=[];s.v32=null;
 e.bootstrapped=true;e.notes.unshift('Стартовый баланс: 1 скважина, РВС 1000 т, договор 35 т/сут, ФОТ 3,6 млн ₸/мес.');}
const v41oldSmallNew=smallNew;smallNew=function(){v41oldSmallNew();v41bootstrap();save()};
const v41oldSmallDay=smallDay;smallDay=function(){v41oldSmallDay();if(!s?.small)return;let e=v41init(),t=v30init().tanks[0],d=v32init(),last=d.days[d.days.length-1];if(!last)return;
 let fixed=e.monthlyFixed/v8days();s.cash-=fixed;v25post('opex',fixed,{description:'Содержание промысла и обязательные договоры'});
 if(t.level>=t.capacity*.9&&!e.warned){e.warned=true;e.notes.unshift('РВС заполнен более чем на 90%. Проверьте договор отгрузки.')}if(t.level<t.capacity*.75)e.warned=false;
 if(s.cash<0&&!s.dead){s.dead=true;log('Недостаточно средств для содержания предприятия')}};
const v41oldSmallView=smallView;smallView=function(){if(!s?.small)return '';let e=v41init(),t=v30init().tanks[0],d=v32init(),last=d.days[d.days.length-1],v=v8init(),c=v33init().contracts.filter(x=>x.status==='Действует');
 let items=[['Работающих скважин',s.assets.wellList.filter(x=>x.status==='Работает').length],['Добыто за сутки',f(last?.produced||0)+' т'],['План месяца',f(v8plan())+' т'],['РВС',f(t.level)+' / '+f(t.capacity)+' т'],['Отгружено за сутки',f(last?.sold||0)+' т'],['Договоры реализации',c.length],['ФОТ в месяц',m(v.salaryFund)],['Содержание в месяц',m(e.monthlyFixed)]];
 return '<section class="small-panel"><h2>Экономика малого промысла</h2><p class="muted">Добыча → подготовка → РВС → договорная отгрузка → оплата. Добыча не равна продаже.</p><div class="small-economy-grid">'+items.map(x=>'<div><small>'+x[0]+'</small><b>'+x[1]+'</b></div>').join('')+'</div><div class="v41tank">Заполнение РВС: '+f(t.level/t.capacity*100)+'%<div><i style="width:'+Math.min(100,t.level/t.capacity*100)+'%"></i></div></div>'+(c.length?'':'<p class="notice bad">Нет действующего договора продажи. Нефть накапливается.</p>')+(e.notes.length?'<p class="muted">'+esc(e.notes[0])+'</p>':'')+'</section>'+v41oldSmallView()};
