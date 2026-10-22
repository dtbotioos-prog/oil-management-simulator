// Run: node tests/smoke-test.js
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),cp=require('node:child_process');
const root=path.resolve(__dirname,'..'),html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const scripts=[...html.matchAll(/<script\s+src="([^"]+)"\s*><\/script>/g)].map(x=>x[1]);
const styles=[...html.matchAll(/<link\s+rel="stylesheet"\s+href="([^"]+)"\s*>/g)].map(x=>x[1]);
assert(scripts.length>=1,'Game script missing');assert(styles.length>=1,'Styles missing');
for(const file of [...scripts,...styles,'manifest.webmanifest'])assert(fs.existsSync(path.join(root,file)),'Missing '+file);
for(const file of scripts){const check=cp.spawnSync(process.execPath,['--check',path.join(root,file)],{encoding:'utf8'});assert.equal(check.status,0,check.stderr)}
assert(html.includes('id="setup"')&&html.includes('id="game"'),'UI anchors missing');
const code=fs.readFileSync(path.join(root,scripts[0]),'utf8');
for(const token of ['function v21calc(', 'function v22weather(', 'function v19init(', 'function save(', 'function render('])assert(code.includes(token),'Missing '+token);
console.log('PASS: scripts '+scripts.length+', styles '+styles.length+', links valid, JS syntax, core modules present');
