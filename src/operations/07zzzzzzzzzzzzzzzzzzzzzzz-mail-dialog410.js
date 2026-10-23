/* v4.1.0: authoritative inbox clearing and centered confirmations. */
async function mail410Clear(){
 if(!s)return;
 if(!await uiConfirm('Удалить ВСЕ письма, включая прочитанные и архив?\nПринятые решения, задачи и расходы останутся в истории.'))return;
 const db=mail86db();
 const ids=new Set([...(db.deletedIds||[]),...db.items.map(x=>x.id)]);
 // Also tombstone all original sources, so older saves cannot resurrect them on sync.
 const z=v11init(),v=v8init();
 for(const x of [...(z.inbox||[]),...(v.notifications||[])])ids.add('src-'+v14Hash(String(x)));
 db.deletedIds=[...ids];db.items.length=0;
 z.inbox.length=0;v.notifications.length=0;
 v14Selected=null;v14Filter='all';
 if(typeof mail396Search!=='undefined')mail396Search='';
 save();render();
 // Defensive verification: restore empty state if an older render module repopulates it.
 const check=mail86db();
 if(check.items.length){for(const x of check.items)ids.add(x.id);check.deletedIds=[...ids];check.items.length=0;save();render();}
}
const mail410Render=render;
render=function(){
 mail410Render();
 if(!s||tab!=='inbox')return;
 const body=document.getElementById('body');if(!body)return;
 // A single reliable toolbar; old controls are hidden to avoid duplicate click paths.
 body.querySelectorAll('[data-fix408-mail="delete"],[data-mail86="deleteall"]').forEach(b=>{b.hidden=true;});
 let b=body.querySelector('[data-mail410-delete]');
 if(!b){b=document.createElement('button');b.type='button';b.className='btn secondary';b.dataset.mail410Delete='1';b.textContent='🗑 Удалить все письма';
 const toolbar=body.querySelector('#fix408-mail-tools')||body.querySelector('.v14tools');if(toolbar)toolbar.appendChild(b);else body.prepend(b);}
};
