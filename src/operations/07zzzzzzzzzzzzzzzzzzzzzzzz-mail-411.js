/* v4.1.1: persistent inbox clear, source tombstones, one delegated click path. */
const mail411OldSync=v14Sync;
v14Sync=function(){
 const db=mail411OldSync();
 db.deletedIds||=[];
 if(db.clearedThrough){
  // A bulk deletion is a checkpoint: all messages present at deletion stay deleted.
  const old=new Set(db.deletedIds);
  db.items=db.items.filter(x=>!old.has(x.id));
 }
 return db;
};
async function mail411Clear(){
 if(!s)return;
 if(!await uiConfirm('Удалить все письма из входящих и архива?\nИстория решений и финансовых операций сохранится.'))return;
 const db=mail86db(),z=v11init(),v=v8init();
 db.items=[];db.deletedIds=[];db.clearedThrough=v8date();
 z.inbox=[];v.notifications=[];
 v14Selected=null;v14Filter='all';mail396Search='';
 save();render();
}
// Window capture precedes legacy document and button handlers.
window.addEventListener('click',function(e){
 const b=e.target.closest?.('[data-mail411-clear],[data-mail410-delete],[data-fix408-mail="delete"],[data-mail86="deleteall"]');
 if(!b||!s)return;
 e.preventDefault();e.stopImmediatePropagation();void mail411Clear();
},true);
const mail411Render=render;
render=function(){
 mail411Render();
 if(!s||tab!=='inbox')return;
 const body=document.getElementById('body');if(!body)return;
 body.querySelectorAll('[data-mail410-delete],[data-fix408-mail="delete"],[data-mail86="deleteall"]').forEach(b=>b.remove());
 let bar=body.querySelector('#fix408-mail-tools')||body.querySelector('.mail86tools')||body.querySelector('.v14tools');
 if(!bar){bar=document.createElement('div');bar.className='v14tools';body.prepend(bar)}
 const btn=document.createElement('button');btn.type='button';btn.className='btn secondary';btn.dataset.mail411Clear='1';btn.textContent='🗑 Удалить все письма';bar.appendChild(btn);
};
