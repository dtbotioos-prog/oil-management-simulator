/* v4.0.9: mobile navigation remains fully expanded and centered app confirmations. */
function fix409Nav(){
 const side=document.getElementById('v11side'),host=document.getElementById('v11sideitems');
 if(!side||!host||!s)return;
 if(window.matchMedia('(max-width:800px)').matches){
  side.classList.remove('hide');
  host.querySelectorAll('details.group397-nav').forEach(d=>{d.open=true;d.setAttribute('open','')});
  host.querySelectorAll('button[data-v11-tab]').forEach(b=>{
   const label=b.querySelector('.txt')?.textContent?.trim()||b.dataset.v11Tab;
   b.title=label;b.setAttribute('aria-label',label);
  });
 }
}
const fix409Render=render;
render=function(){fix409Render();fix409Nav()};
// Mail deletion uses the game's centered modal instead of Safari's top-of-screen confirm.
fix408DeleteAll=async function(){
 if(!s)return;
 if(!await uiConfirm('Удалить все письма? Принятые решения и финансовые операции сохранятся.'))return;
 const db=mail86db();
 db.deletedIds=[...new Set([...(db.deletedIds||[]),...db.items.map(x=>x.id)])];db.items=[];
 const z=v11init(),v=v8init();z.inbox=[];v.notifications=[];
 v14Selected=null;v14Filter='all';
 if(typeof mail396Search!=='undefined')mail396Search='';
 save();render();
};
