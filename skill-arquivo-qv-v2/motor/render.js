const {chromium}=require('playwright');const fs=require('fs');
const [k,n]=process.argv.slice(2).map(Number);const FPS=+(process.env.FPS||30);
const D=JSON.parse(fs.readFileSync('words.json'));const NF=Math.round(D.total*FPS);
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
const p=await b.newPage({viewport:{width:1080,height:1920}});
await p.goto('http://localhost:8123/world.html');await p.waitForFunction('window.__ready',{timeout:120000});
fs.mkdirSync('frames',{recursive:true});
for(let i=k;i<NF;i+=n){await p.evaluate(t=>setT(t),i/FPS);await p.screenshot({path:`frames/f${String(i).padStart(5,'0')}.jpg`,type:'jpeg',quality:92});if(i%100===k)console.log(k,i,NF,flush=true)}
await b.close();console.log('done',k)})()
