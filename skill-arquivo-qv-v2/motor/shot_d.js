const {chromium}=require('playwright');
(async()=>{const ts=process.argv.slice(2).map(Number);
const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
const p=await b.newPage({viewport:{width:1080,height:1920}});
p.on('pageerror',e=>console.log('ERR',e.message)); p.on('console',m=>{if(m.type()==='error'||m.type()==='warning')console.log('CON',m.text().slice(0,300))});
await p.goto('http://localhost:8123/dolar.html?w=/dolar.js'); await p.waitForFunction('window.__ready',{timeout:240000});
for(const t of ts){const t0=Date.now();await p.evaluate(t=>setT(t),t);await p.screenshot({path:`s_${t}.jpg`,type:'jpeg',quality:88});console.log(t,Date.now()-t0,'ms')}
await b.close()})()
