/* v4.0.7: recoverable catering and reliable inbox bulk deletion. */
function fix407FoodBuy(days=30){
 const c=v36init().camp,x=v39init();
 const n=Math.max(0,Math.ceil(c.residents*3*days-c.mealStock));
 if(!c.residents)return {ok:false,reason:'Нет проживающих в посёлке'};
 if(!n)return {ok:true,portions:0,cost:0};
 const cost=+(n*x.mealPrice).toFixed(3);
 if(s.cash+1e-8<cost)return {ok:false,reason:'Недостаточно средств',cost,portions:n};
 s.cash-=cost;c.mealStock+=n;c.mealQuality=v30safe(c.mealQuality+2);
 v25post('opex',cost,{description:'Закупка питания для вахтового посёлка',portions:n});
 x.cateringLog.unshift({date:v8date(),key:v39key(),portions:n,paid:cost,status:'Оплачено'});
 x.cateringLog=x.cateringLog.slice(0,36);
 return {ok:true,portions:n,cost};
}
// Monthly procurement may fail when cash is short; retry on later days, not only next month.
v39catering=function(){
 const x=v39init(),c=v36init().camp,key=v39key();
 if(!c.residents)return;
 const days=v8days();
 if(c.mealStock>=c.residents*3*days){if(!x.cateringKeys.includes(key))x.cateringKeys.push(key);return;}
 // Once a month, procure a full month's food. If cash was insufficient, try again
 // after revenue is received; no duplicate charge for already stocked portions.
 if(x.cateringKeys.includes(key))return;
 const result=fix407FoodBuy(days);
 if(result.ok){x.cateringKeys.push(key);v39mail(key,'catering','Столовая · питание пополнено','Закуплено '+result.portions+' порций за '+m(result.cost)+'.');}
 else if(!x.alerts.includes('food-'+key)){
  x.alerts.push('food-'+key);
  v39mail(key,'catering','Срочно: недостаточно средств на питание','Питание не закуплено. Нужно '+m(result.cost||0)+'. Закупка повторится при наличии денег; доступна ручная закупка.');
 }
};
// Manual purchase has an actual affordable amount, unlike the old fixed 14m price.
const fix407OldPurchase=v36purchase;
v36purchase=async function(kind){
 if(kind!=='food')return fix407OldPurchase(kind);
 const c=v36init().camp,x=v39init();
 if(!c.residents)return uiAlert('В посёлке нет проживающих работников');
 const n=Math.max(0,Math.ceil(c.residents*3*30-c.mealStock));
 if(!n)return uiAlert('Запаса питания достаточно на 30 суток');
 const cost=+(n*x.mealPrice).toFixed(3);
 if(s.cash+1e-8<cost)return uiAlert('Недостаточно средств: требуется '+m(cost));
 if(!await uiConfirm('Закупить '+n+' порций на 30 суток за '+m(cost)+'?'))return;
 const result=fix407FoodBuy(30);
 if(!result.ok)return uiAlert(result.reason);
 x.cateringKeys.push(v39key());x.cateringKeys=[...new Set(x.cateringKeys)];
 log('Питание: закуплено '+result.portions+' порций за '+m(result.cost));save();render();
};
const fix407OldCampView=v36campView;
v36campView=function(){
 return fix407OldCampView().replace('Закупить продукты · 14 млн ₸','Пополнить питание на 30 суток (по фактической потребности)');
};
// Clear every inbox source and store tombstones so old notifications cannot regenerate.
mail86deleteAll=function(){
 if(!confirm('Удалить все письма? Выполненные решения и расходы сохраняются.'))return;
 const db=mail86db();
 db.deletedIds=[...new Set([...(db.deletedIds||[]),...db.items.map(x=>x.id)])].slice(-10000);
 db.items.length=0;
 v11init().inbox.length=0;
 v8init().notifications.length=0;
 v14Selected=null;
 if(typeof mail396Search!=='undefined')mail396Search='';
 save();render();
};
// Keep bulk controls visible even if another inbox layout replaces the list.
const fix407OldInbox=v11inbox;
v11inbox=function(){
 let html=fix407OldInbox();
 if(!html.includes('data-mail86="deleteall"')){
  html=html.replace('<h2>✉ Входящие директора</h2>','<h2>✉ Входящие директора</h2><div class="v14tools"><button data-mail86="readall">✓ Прочитать все</button><button data-mail86="deleteall">🗑 Удалить все письма</button></div>');
 }
 return html;
};
const fix407OldBind=v14Bind;
v14Bind=function(){
 fix407OldBind();
 document.querySelectorAll('[data-mail86="deleteall"]').forEach(b=>b.onclick=()=>mail86deleteAll());
 document.querySelectorAll('[data-mail86="readall"]').forEach(b=>b.onclick=()=>mail86readAll());
};
