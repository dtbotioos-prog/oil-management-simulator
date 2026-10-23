/* v3.9.9 — essential inventory, supply chain, living conditions and credit transparency. */
const STOCK399=[
 ['Продукты питания (порции)','Питание',900,300,.002],
 ['Питьевая вода (л)','Питание',1200,400,.0003],
 ['Моющие и дезинфицирующие средства','Хозяйственные',80,20,.012],
 ['Постельное бельё (комплект)','Хозяйственные',30,10,.018],
 ['Средства личной гигиены (комплект)','Хозяйственные',100,30,.009],
 ['Подшипники привода ШГН','Запчасти',12,4,.22],
 ['Ремни привода ШГН','Запчасти',18,6,.07],
 ['Уплотнения и сальники ШГН','Запчасти',25,8,.018],
 ['Подшипники электродвигателей','Запчасти',14,4,.085],
 ['Электрические кабели для мелкого ремонта (м)','Энергетика',100,30,.008],
 ['Лампы и светильники','Энергетика',24,8,.045],
 ['Фильтры технологические','Эксплуатация',35,12,.09],
 ['Смазочные материалы (л)','Эксплуатация',500,120,.004],
 ['Запасные предохранители','Энергетика',60,15,.012],
 ['Электроконтакторы','Энергетика',15,4,.18]
];
let stock399Filter='Все';
function stock399Init(){
 let p=ensurePlant();if(s.small){s.stock400Archive||=[];for(let item of [...p.stock])if(['Штанги насосные (шт.)','НКТ (трубы)','Насосы глубинные','Кабель ЭЦН (комплект)'].includes(item.name)){s.stock400Archive.push({...item,removed:v8date()});p.stock.splice(p.stock.indexOf(item),1)}}if(!s.v399)s.v399={init:true,lastMonth:'',shortages:[],history:[]};
 for(let [name,group,qty,minimum,price] of STOCK399){if(!p.stock.some(x=>x.name===name))p.stock.push({id:Math.max(-1,...p.stock.map(x=>x.id))+1,name,group,qty:s.small?Math.max(2,Math.ceil(qty*.3)):qty,minimum:s.small?Math.max(1,Math.ceil(minimum*.3)):minimum,price,consumed:0})}
 return s.v399;
}
function stock399Category(x){if(x.group)return x.group;if(/Спецодежда|Каски|очки|Перчатки|СИЗОД/i.test(x.name))return 'СИЗ';if(/насос|штанг|НКТ|запас|детал|ремонт/i.test(x.name))return 'Запчасти';return 'Эксплуатация'}
async function stock399Purchase(id,qty){let p=ensurePlant(),x=p.stock.find(x=>x.id===id);if(!x)return;
 let n=Math.floor(qty);if(n<=0||n>100000)return uiAlert('Укажите количество от 1 до 100 000');
 let cost=+(n*x.price).toFixed(4);if(s.cash<cost)return uiAlert('Недостаточно средств: '+m(cost));
 if(!await uiConfirm('Закупить «'+x.name+'» — '+n+' ед. за '+m(cost)+'?'))return;
 s.cash-=cost;x.qty+=n;p.warehouseSpend+=cost;
 v25post('maintenance',cost,{description:'Закупка на склад: '+x.name+' · '+n+' ед.',category:stock399Category(x)});
 stock399Init().history.unshift(v8date()+': '+x.name+' +'+n+' · '+m(cost));save();render();
}
function stock399Satisfaction(){
 let c=v36init().camp,staff=s.small?(typeof growInit==='function'?Math.max(1,growInit().staff||8):8):Math.max(1,c.residents);
 let meal=Math.min(1,(c.mealStock||0)/Math.max(1,staff*3*5));
 let beds=c.residents>0?Math.min(1,c.beds/c.residents):1;
 let p=ensurePlant(),hyg=p.stock.find(x=>x.name==='Средства личной гигиены (комплект)'),water=p.stock.find(x=>x.name==='Питьевая вода (л)');
 let hygiene=hyg?Math.min(1,hyg.qty/Math.max(1,staff*.3)):1;
 let drinking=water?Math.min(1,water.qty/Math.max(1,staff*2)):1;
 let foodQuality=Math.max(0,Math.min(1,c.mealQuality/100)),clean=Math.max(0,Math.min(1,c.cleanliness/100));
 let score=Math.round(100*(meal*.22+beds*.18+hygiene*.12+drinking*.13+foodQuality*.17+clean*.18));
 return {score,meal,beds,hygiene,drinking,staff};
}
const stock399OldWarehouse=warehouseView;
warehouseView=function(){stock399Init();let p=ensurePlant(),groups=['Все',...new Set(p.stock.map(stock399Category))];
 let filtered=p.stock.filter(x=>stock399Filter==='Все'||stock399Category(x)===stock399Filter);
 let low=p.stock.filter(x=>x.qty<x.minimum);
 let out='<h2>Складское хозяйство · закупки и потребности</h2><p class="muted">Отдельный учёт продуктов, воды, СИЗ, запчастей, материалов для ремонта, хозяйственных товаров и энергетики. Закупки списывают деньги один раз и пополняют фактический остаток.</p>';
 out+=row('Номенклатура',p.stock.length)+row('Позиций ниже минимума',low.length)+row('Стоимость запасов',m(p.stock.reduce((a,x)=>a+x.qty*x.price,0)));
 out+='<label>Группа склада <select id="stock399-group">'+groups.map(g=>'<option '+(g===stock399Filter?'selected':'')+'>'+esc(g)+'</option>').join('')+'</select></label>';
 for(let x of filtered){let ratio=Math.round(x.qty/Math.max(1,x.minimum)*100),target=Math.max(1,x.minimum*2-x.qty);
 out+='<details class="stock399-row" '+(x.qty<x.minimum?'open':'')+'><summary><b>'+esc(x.name)+'</b><span>'+f(x.qty)+' ед. · '+ratio+'% от минимума</span></summary><div>'+row('Категория',esc(stock399Category(x)))+row('Минимум',f(x.minimum))+row('Цена за единицу',m(x.price))+row('Расход за карьеру',f(x.consumed||0))+'<button class="mini-btn" data-stock399="'+x.id+'" data-qty="'+target+'">Пополнить до двойного минимума · '+target+' ед.</button></div></details>';
 }
 out+='<h3>Последние закупки</h3>'+(stock399Init().history.slice(0,20).map(x=>'<div class="row">'+esc(x)+'</div>').join('')||'<p class="muted">Закупок пока нет.</p>');return out;
};
const stock399OldAssetBind=assetBind;
assetBind=function(){stock399OldAssetBind();let group=document.querySelector('#stock399-group');if(group)group.onchange=()=>{stock399Filter=group.value;render()};document.querySelectorAll('[data-stock399]').forEach(b=>b.onclick=()=>stock399Purchase(+b.dataset.stock399,+b.dataset.qty))};
const stock399OldCampView=v36campView;
v36campView=function(){stock399Init();let c=v36init().camp,k=stock399Satisfaction();
 return '<h2>Потребности и удовлетворённость работников</h2>'+row('Удовлетворённость',k.score+'%')+row('Запас питания на 5 дней',Math.round(k.meal*100)+'%')+row('Койко-места',Math.round(k.beds*100)+'%')+row('Питьевая вода',Math.round(k.drinking*100)+'%')+row('Средства гигиены',Math.round(k.hygiene*100)+'%')+'<p class="muted">Нехватка воды, продуктов и мест проживания ухудшает удовлетворённость. Для пополнения откройте «Склад»; для расширения мест — «Инфраструктура».</p>'+stock399OldCampView();
};
const stock399OldDaily=v36daily;
v36daily=function(){stock399Init();stock399OldDaily();let c=v36init().camp,p=ensurePlant();
 let food=p.stock.find(x=>x.name==='Продукты питания (порции)');
 // Camp catering has its own mealStock and automatic procurement. Transfer from central stock only on shortage; no duplicate cash charge.
 if(food&&c.mealStock<c.residents*3){let n=Math.min(food.qty,Math.max(0,c.residents*3*3-c.mealStock));food.qty-=n;food.consumed+=n;c.mealStock+=n}
 let water=p.stock.find(x=>x.name==='Питьевая вода (л)');if(water){let n=Math.min(water.qty,Math.ceil(c.residents*2));water.qty-=n;water.consumed+=n}
 let satisfaction=stock399Satisfaction();let v=v8init();v.morale=cl(v.morale+(satisfaction.score-v.morale)*.004,0,100);
};
/* Turnkey well repairs are executed by contractor. Warehouse does not hold PRS/KRS downhole materials. */
const stock399OldTreasury=v35view;
v35view=function(){let d=v35init(),debt=d.loans.filter(x=>x.status==='Действует').reduce((a,x)=>a+x.balance,0);
 return '<h2>Кредитование и финансовая нагрузка</h2>'+row('Действующий основной долг',m(debt))+row('Доступный диапазон кредита','100–100 000 млн ₸')+'<p class="muted">Кредит увеличивает денежные средства, но не прибыль. Проценты начисляются ежедневно; основной долг погашается по графику. Крупный кредит может привести к неплатёжеспособности при недостаточной добыче.</p>'+stock399OldTreasury();
};
