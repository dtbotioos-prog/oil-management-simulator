/* Oil Management v4.0.6 — thematic tab audio, generated with Web Audio (offline). */
const AUDIO406_THEMES={
 overview:'command',daily:'clock',people:'people',incidents:'alarm',dispatch:'radio',assetsTree:'pump',field:'pump',finance:'coins',hse:'alarm',plan:'pump',contracts:'stamp',staff:'people',ecology:'nature',org:'paper',warehouse:'metal',equipment:'metal',workshops:'metal',decisions:'stamp',events:'radio',inbox:'paper',ranking:'fanfare',companies:'fanfare',treasury:'coins',sales:'coins',security:'alarm',fire:'alarm'
};
let audio406Context=null,audio406Last=0;
function audio406Enabled(){try{let v=localStorage.getItem('oil406_sound');return v===null?typeof v11sound==='undefined'||v11sound:v==='1'}catch(e){return typeof v11sound==='undefined'||v11sound}}
function audio406Play(theme){
 if(!audio406Enabled())return;
 try{
  const C=window.AudioContext||window.webkitAudioContext;if(!C)return;
  if(!audio406Context)audio406Context=new C();
  const ctx=audio406Context;if(ctx.state==='suspended')ctx.resume().catch(()=>{});
  const now=ctx.currentTime+0.008;
  const tone=(hz,at,duration,kind='sine',volume=.024,down=0)=>{
   const osc=ctx.createOscillator(),gain=ctx.createGain();osc.type=kind;
   osc.frequency.setValueAtTime(hz,now+at);if(down)osc.frequency.exponentialRampToValueAtTime(Math.max(40,down),now+at+duration);
   gain.gain.setValueAtTime(.0001,now+at);gain.gain.linearRampToValueAtTime(volume,now+at+.008);
   gain.gain.exponentialRampToValueAtTime(.0001,now+at+duration);
   osc.connect(gain);gain.connect(ctx.destination);osc.start(now+at);osc.stop(now+at+duration+.015);
  };
  const noise=(at,duration,volume=.012)=>{
   const len=Math.max(1,Math.ceil(ctx.sampleRate*duration)),buf=ctx.createBuffer(1,len,ctx.sampleRate),d=buf.getChannelData(0);
   for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*(1-i/len);
   const src=ctx.createBufferSource(),gain=ctx.createGain(),filter=ctx.createBiquadFilter();src.buffer=buf;filter.type='lowpass';filter.frequency.value=1200;
   gain.gain.value=volume;src.connect(filter);filter.connect(gain);gain.connect(ctx.destination);src.start(now+at);src.stop(now+at+duration);
  };
  switch(theme){
   case 'pump':tone(105,0,.17,'sawtooth',.013,85);tone(160,.12,.16,'triangle',.022,110);noise(.04,.12,.006);break;
   case 'coins':tone(880,0,.11,'sine',.024);tone(1175,.09,.19,'sine',.020);break;
   case 'alarm':tone(490,0,.11,'triangle',.022);tone(360,.14,.15,'triangle',.020);break;
   case 'radio':noise(0,.07,.014);tone(630,.08,.08,'square',.012);tone(730,.19,.08,'square',.009);break;
   case 'nature':tone(1050,0,.16,'sine',.011,760);tone(1340,.13,.19,'sine',.009,1100);break;
   case 'metal':tone(330,0,.08,'triangle',.026);tone(510,.06,.15,'sine',.017);break;
   case 'paper':noise(0,.16,.013);tone(430,.09,.07,'sine',.012);break;
   case 'stamp':tone(155,0,.09,'triangle',.035,85);noise(0,.09,.015);break;
   case 'people':tone(392,0,.11,'sine',.018);tone(494,.10,.12,'sine',.018);tone(587,.21,.14,'sine',.017);break;
   case 'clock':tone(790,0,.045,'sine',.019);tone(590,.13,.06,'sine',.017);break;
   case 'fanfare':tone(392,0,.11,'triangle',.020);tone(523,.11,.11,'triangle',.020);tone(659,.22,.19,'triangle',.021);break;
   default:tone(480,0,.08,'sine',.019);tone(650,.10,.12,'sine',.016);
  }
 }catch(e){/* Sound is optional; game mechanics must never depend on it. */}
}
// Capture tab clicks before the application's own handlers. Works with dynamically rendered sidebar.
document.addEventListener('click',function(e){
 const btn=e.target.closest&&e.target.closest('[data-v11-tab],[data-tab]');if(!btn)return;
 const id=btn.dataset.v11Tab||btn.dataset.tab||'overview';
 const time=Date.now();if(time-audio406Last<90)return;audio406Last=time;
 audio406Play(AUDIO406_THEMES[id]||'command');
},true);
// Keep the original sound toggle, while retaining the choice between page reloads.
const audio406OldBind=v11bind;
v11bind=function(){
 audio406OldBind();
 document.querySelectorAll('[data-v11-sound]').forEach(btn=>{
  if(btn.dataset.audio406Bound)return;btn.dataset.audio406Bound='1';
  btn.addEventListener('click',()=>{try{localStorage.setItem('oil406_sound',v11sound?'1':'0')}catch(e){}},false);
 });
};
try{const preference=localStorage.getItem('oil406_sound');if(preference!==null)v11sound=preference==='1'}catch(e){}
// Old generic click tone would play over each themed cue; retain success/alarm sounds.
const audio406OldBeep=v11beep;
v11beep=function(type='click'){if(type!=='click')return audio406OldBeep(type)};
