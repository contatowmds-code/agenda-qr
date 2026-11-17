const {chromium}=require('playwright');const fs=require('fs');
const [k,n,start]=process.argv.slice(2).map(Number);const FPS=+(process.env.FPS||60);
const D=JSON.parse(fs.readFileSync('words.json'));const NF=Math.round(D.total*FPS);
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
const p=await b.newPage({viewport:{width:1080,height:1920}});
await p.goto('http://localhost:8123/dolar.html?w=/dolar.js');await p.waitForFunction('window.__ready',{timeout:240000});
fs.mkdirSync('frames',{recursive:true});
for(let i=(start||0)+k;i<NF;i+=n){const f=`frames/f${String(i).padStart(5,'0')}.jpg`;if(fs.existsSync(f)&&fs.statSync(f).size>5000)continue;await p.evaluate(t=>setT(t),i/FPS);await p.screenshot({path:f,type:'jpeg',quality:92});if(i%120===k)console.log(k,i,NF,Date.now())}
await b.close();console.log('done',k)})()
