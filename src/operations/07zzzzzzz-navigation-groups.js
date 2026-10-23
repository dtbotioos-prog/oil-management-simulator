/* v3.9.7 — collapsible topical navigation and sections, preserving bound actions. */
const GROUP397=[
 ['Управление компанией',['overview','inbox','decisions','events']],
 ['Производство и месторождение',['daily','field','dispatch','assetsTree','workshops']],
 ['Персонал и условия труда',['career','staff','people']],
 ['Экономика и договоры',['finance','market','contracts']],
 ['Инфраструктура и снабжение',['equipment','warehouse']],
 ['Безопасность и экология',['hse','incidents','ecology']]
];
let group397Open={};
let group397Sections={};
function group397Sidebar(){
 let host=document.querySelector('#v11sideitems');if(!host||!host.querySelector('[data-v11-tab]'))return;
 let buttons=[...host.querySelectorAll('[data-v11-tab]')];
 let map=new Map(buttons.map(x=>[x.dataset.v11Tab,x]));
 host.replaceChildren();
 for(let [title,ids] of GROUP397){
  let relevant=ids.map(id=>map.get(id)).filter(Boolean);if(!relevant.length)continue;
  let box=document.createElement('details');box.className='group397-nav';
  let active=ids.includes(tab),open=group397Open[title];
  box.open=open===undefined?active:open;
  let summary=document.createElement('summary');summary.textContent=title+(active?' •':'');
  box.append(summary);relevant.forEach(x=>box.append(x));
  box.addEventListener('toggle',()=>{group397Open[title]=box.open});host.append(box);
 }
 let leftovers=buttons.filter(x=>!GROUP397.some(g=>g[1].includes(x.dataset.v11Tab)));
 if(leftovers.length){let box=document.createElement('details');box.className='group397-nav';box.open=true;let summary=document.createElement('summary');summary.textContent='Дополнительно';box.append(summary);leftovers.forEach(x=>box.append(x));host.append(box)}
}
function group397Content(){
 let body=document.querySelector('#body');if(!body||tab==='inbox')return;
 let children=[...body.children],start=children.findIndex(x=>x.tagName==='H2'||x.tagName==='H3');
 if(start<0)return;
 let count=children.slice(start).filter(x=>x.tagName==='H2'||x.tagName==='H3').length;
 if(count<2)return;
 let fragment=document.createDocumentFragment(),current=null,sectionIndex=0;
 for(let node of children){
  if(node.tagName==='H2'||node.tagName==='H3'){
   let title=node.textContent.trim().slice(0,90),id=tab+':'+title;
   let details=document.createElement('details');details.className='group397-section';
   details.open=group397Sections[id]===undefined?sectionIndex===0:group397Sections[id];
   let summary=document.createElement('summary');summary.textContent=title;
   details.append(summary);
   details.addEventListener('toggle',()=>{group397Sections[id]=details.open});
   fragment.append(details);current=details;sectionIndex++;
  }else if(current){current.append(node)}else fragment.append(node);
 }
 body.replaceChildren(fragment);
 let toolbar=document.createElement('div');toolbar.className='group397-toolbar';
 let all=document.createElement('button');all.textContent='Развернуть все';all.onclick=()=>body.querySelectorAll('.group397-section').forEach(x=>x.open=true);
 let none=document.createElement('button');none.textContent='Свернуть все';none.onclick=()=>body.querySelectorAll('.group397-section').forEach(x=>x.open=false);
 toolbar.append(all,none);body.insertBefore(toolbar,body.querySelector('.group397-section'));
}
const group397OldRender=render;
render=function(){group397OldRender();group397Sidebar();group397Content()};
