import http from 'http'; import fs from 'fs'; import path from 'path';
const pw = await import('playwright');
const [,, clip, f0, f1, outdir] = process.argv; fs.mkdirSync(outdir, {recursive:true});
const root = path.resolve('.');
const srv = http.createServer((q,s)=>{const p=path.join(root,decodeURIComponent(q.url.split('?')[0])); if(!fs.existsSync(p)){s.writeHead(404);return s.end();} const ext=path.extname(p); s.writeHead(200,{'Content-Type':ext==='.js'?'text/javascript':ext==='.css'?'text/css':ext==='.html'?'text/html':'application/json'}); fs.createReadStream(p).pipe(s);}).listen(0);
await new Promise(r=>srv.on('listening',r));
const b = await pw.chromium.launch({proxy:{server:process.env.HTTPS_PROXY, bypass:'localhost,127.0.0.1'}, args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
const pg = await b.newPage({viewport:{width:540,height:960}});
pg.on('pageerror',e=>console.log('ERR',e.message));
await pg.goto(`http://localhost:${srv.address().port}/map.html?clip=${clip}`);
await pg.waitForFunction(()=>window.ready,null,{timeout:60000});
const A=+f0,B=+f1;
for(let f=+(process.env.START||A);f<=B;f++){ if(process.env.STOP&&f>+process.env.STOP) break; const out=path.join(outdir,`m${String(f).padStart(4,'0')}.jpg`); if(fs.existsSync(out)&&process.env.RESUME) continue;
  await pg.evaluate(u=>window.setF(u),(f-A)/(B-A));
  await pg.evaluate(()=>new Promise(r=>{let n=0;const go=()=>{ if(window.map.loaded()||++n>60) r(); else setTimeout(go,100)}; window.map.triggerRepaint(); setTimeout(go,200);}));
  await pg.screenshot({path:out,type:'jpeg',quality:92}); }
await b.close(); srv.close(); console.log('ok');
