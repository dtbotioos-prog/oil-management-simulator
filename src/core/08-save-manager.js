const BACKUP_KEY=KEY+'-backup';
const fileInput=document.createElement('input');fileInput.type='file';fileInput.accept='.json,application/json';fileInput.style.display='none';document.body.appendChild(fileInput);
const saveBar=document.createElement('div');saveBar.id='save-manager';
saveBar.innerHTML=`<button type="button" id="game-settings-toggle" aria-label="Настройки игры" aria-expanded="false" aria-controls="game-settings-menu" title="Настройки игры">⚙</button><div id="game-settings-menu" hidden><div class="settings-title">Управление карьерой</div><button type="button" id="save-now">💾 Сохранить</button><button type="button" id="save-import">📂 Загрузить</button><button type="button" id="game-new-career">✚ Новая игра</button><small id="save-status" aria-live="polite">Автосохранение включено</small></div>`;
document.body.appendChild(saveBar);
const style=document.createElement('style');style.textContent=`
html,body{width:100%;max-width:100%;overflow-x:hidden}
#save-manager{position:fixed;right:max(12px,env(safe-area-inset-right));top:max(12px,env(safe-area-inset-top));bottom:auto!important;left:auto!important;z-index:9500;display:block!important;width:auto!important;max-width:calc(100vw - 24px);background:transparent!important;border:0!important;padding:0!important;box-shadow:none!important;font:13px system-ui}
#game-settings-toggle{width:46px;height:46px;border-radius:13px;border:1px solid #527d87;background:#173646;color:#e9f7f9;font-size:26px;line-height:1;box-shadow:0 7px 24px #0008;cursor:pointer;touch-action:manipulation}
#game-settings-menu{position:absolute;right:0;top:53px;width:min(265px,calc(100vw - 24px));padding:12px;border:1px solid #507887;border-radius:14px;background:#142b39;box-shadow:0 18px 48px #000c;display:flex;flex-direction:column;gap:7px}
#game-settings-menu[hidden]{display:none!important}
#game-settings-menu .settings-title{font-weight:800;color:#d7eff4;margin:2px 3px 6px}
#game-settings-menu button{width:100%;min-height:43px;text-align:left;border:1px solid #3e6573;border-radius:9px;background:#24485b;color:#fff;padding:10px 12px;font-size:14px;cursor:pointer;touch-action:manipulation}
#game-settings-menu button:hover{background:#30647a}
#game-settings-menu small{font-size:11px;color:#a8c7d0;padding:6px 3px 0;overflow-wrap:anywhere}
#reset{display:none!important}
.v11content{min-width:0;overflow-x:hidden}
@media(max-width:800px){
 html,body{height:100%;overflow:hidden!important;overscroll-behavior:none}
 .v11shell{height:100dvh!important;min-height:0!important;overflow:hidden!important;display:flex!important}
 .v11sidebar{height:100dvh!important;max-height:100dvh!important;position:relative!important;top:auto!important;overflow-y:auto!important;overscroll-behavior:contain;flex-shrink:0}
 .v11content{height:100dvh!important;max-height:100dvh!important;min-height:0!important;overflow-y:auto!important;overflow-x:hidden!important;overscroll-behavior-y:contain;-webkit-overflow-scrolling:touch;padding-top:calc(12px + env(safe-area-inset-top))!important;padding-bottom:calc(20px + env(safe-area-inset-bottom))!important}
 .v11content>header{padding-right:53px;min-height:46px}
 #save-manager{right:8px!important;top:calc(8px + env(safe-area-inset-top))!important;bottom:auto!important;left:auto!important}
 #game-settings-toggle{width:42px;height:42px}
 .v11content .table-scroll{max-width:100%;overflow-x:auto}
 .v11content input,.v11content select,.v11content textarea{font-size:16px}
}
`;document.head.appendChild(style);
const settingsToggle=document.getElementById('game-settings-toggle');
const settingsMenu=document.getElementById('game-settings-menu');
function closeSettings(){settingsMenu.hidden=true;settingsToggle.setAttribute('aria-expanded','false')}
settingsToggle.addEventListener('click',()=>{settingsMenu.hidden=!settingsMenu.hidden;settingsToggle.setAttribute('aria-expanded',String(!settingsMenu.hidden))});
document.addEventListener('pointerdown',e=>{if(!saveBar.contains(e.target))closeSettings()});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeSettings()});
document.getElementById('game-new-career').onclick=()=>{closeSettings();document.getElementById('reset').click()};
function saveStatus(msg){document.getElementById('save-status').textContent=msg}
function validSave(x){return x&&typeof x==='object'&&!Array.isArray(x)&&typeof x.name==='string'&&x.name.length<=200&&Number.isFinite(x.cash)&&Number.isFinite(x.wells)&&x.wells>=0&&x.wells<=100000&&Array.isArray(x.history)&&Array.isArray(x.events)&&Array.isArray(x.pending)&&typeof x.dead==='boolean'}
function downloadSave(){if(!s)return uiAlert('Сначала создайте или загрузите карьеру');try{save();const data={format:'oil-management-save',version:1,exportedAt:new Date().toISOString(),game:s};const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='Oil_Management_save_'+new Date().toISOString().slice(0,10)+'.json';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),15000);saveStatus('Файл сохранения подготовлен')}catch(e){uiAlert('Ошибка экспорта: '+e.message)}}
document.getElementById('save-now').onclick=()=>{closeSettings();if(!s)return uiAlert('Нет активной карьеры');try{save();saveStatus('Сохранено: '+new Date().toLocaleTimeString('ru-RU'))}catch(e){uiAlert('Не удалось сохранить: '+e.message)}};

document.getElementById('save-import').onclick=()=>{closeSettings();fileInput.value='';fileInput.click()};
fileInput.onchange=async()=>{const file=fileInput.files&&fileInput.files[0];if(!file)return;if(file.size>15*1024*1024)return uiAlert('Файл слишком большой (максимум 15 МБ)');try{const parsed=JSON.parse(await file.text());const incoming=parsed&&parsed.format==='oil-management-save'?parsed.game:parsed;if(!validSave(incoming))throw new Error('Неверная структура файла сохранения');if(!await uiConfirm('Загрузить карьеру «'+incoming.name+'»? Текущая карьера будет заменена; перед заменой создаётся резервная копия.'))return;const old=localStorage.getItem(KEY);if(old)localStorage.setItem(BACKUP_KEY,old);localStorage.setItem(KEY,JSON.stringify(incoming));s=incoming;tab='overview';show();$('load').classList.remove('hide');saveStatus('Карьера загружена: '+incoming.name)}catch(e){uiAlert('Не удалось загрузить файл: '+e.message)}};

})();
