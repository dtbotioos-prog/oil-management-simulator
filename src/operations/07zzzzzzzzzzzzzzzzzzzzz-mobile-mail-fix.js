/* v4.0.8: mobile icon navigation and inbox controls independent of heading text. */
function fix408Sidebar(){
 const host=document.getElementById('v11sideitems');if(!host)return;
 host.querySelectorAll('[data-v11-tab]').forEach(b=>{
  const label=b.querySelector('.txt')?.textContent?.trim()||b.dataset.v11Tab;
  b.setAttribute('title',label);b.setAttribute('aria-label',label);
 });
}
function fix408MailControls(){
 if(tab!=='inbox'||!s)return;
 const body=document.getElementById('body');if(!body)return;
 // Do not depend on exact heading wording or the active mail filter.
 let toolbar=body.querySelector('#fix408-mail-tools');
 if(!toolbar){
  toolbar=document.createElement('div');toolbar.id='fix408-mail-tools';toolbar.className='v14tools';
  toolbar.innerHTML='<button type="button" data-fix408-mail="read">✓ Прочитать все</button><button type="button" data-fix408-mail="delete">🗑 Удалить все письма</button>';
  const title=body.querySelector('h2');if(title)title.insertAdjacentElement('afterend',toolbar);else body.prepend(toolbar);
 }
 // Legacy versions may insert extra duplicate controls; keep one reliable toolbar.
 body.querySelectorAll('[data-mail86="deleteall"],[data-mail86="readall"]').forEach(b=>b.remove());
}
function fix408DeleteAll(){
 if(!s)return;
 if(!confirm('Удалить все письма? Принятые решения и финансовые операции сохранятся.'))return;
 const db=mail86db();
 const ids=db.items.map(x=>x.id);
 db.deletedIds=[...new Set([...(db.deletedIds||[]),...ids])];
 db.items=[];
 const z=v11init(),v=v8init();
 z.inbox=[];v.notifications=[];
 v14Selected=null;v14Filter='all';
 if(typeof mail396Search!=='undefined')mail396Search='';
 save();render();
}
const fix408Render=render;
render=function(){fix408Render();fix408Sidebar();fix408MailControls()};
// Capture phase takes precedence over older per-button onclick handlers.
document.addEventListener('click',function(e){
 const b=e.target.closest?.('[data-fix408-mail]');if(!b)return;
 e.preventDefault();e.stopImmediatePropagation();
 if(b.dataset.fix408Mail==='delete')fix408DeleteAll();
 else mail86readAll();
},true);
