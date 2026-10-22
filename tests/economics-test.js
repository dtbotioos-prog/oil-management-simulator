const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..');const source=fs.readFileSync(path.join(root,'src/economics/07-ledger.js'),'utf8');
const ctx={s:{month:0},v8date:()=>"01.01.2022",f:n=>String(n),m:n=>String(n),row:()=>'',esc:x=>String(x)};vm.createContext(ctx);vm.runInContext(source,ctx);
ctx.v25post('sale',10,{tons:200});ctx.v25post('opex',2);ctx.v25post('payroll',3);ctx.v25post('incident',1);ctx.v25post('bonus',.5);
ctx.s.month=1;ctx.v25closeMonth();assert.equal(ctx.s.volume,200);assert.equal(ctx.s.revenue,10);assert.equal(ctx.s.expense,6.5);assert.equal(ctx.s.profit,3.5);
assert.equal(ctx.s.v25.closed.length,1);assert.equal(ctx.s.v25.entries.length,5);
ctx.v25post('sale',4,{tons:50});ctx.s.month=2;ctx.v25closeMonth();assert.equal(ctx.s.profit,4);assert.equal(ctx.s.volume,50);assert.equal(ctx.s.v25.closed.length,2);
console.log('PASS: daily journal, monthly reconciliation, isolated periods');
