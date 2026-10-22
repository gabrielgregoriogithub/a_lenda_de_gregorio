// Ferramenta (não é teste): abre o jogo no servidor de desenvolvimento e fotografa cada bioma, com climas forçados.
// Uso: node tests/e2e/biome-shots.mjs <pasta-de-saída> [bioma,bioma]
import {createServer} from 'vite';import {chromium} from 'playwright-core';
const ROOT='/home/claude/a_lenda_de_gregorio/',OUT=process.argv[2],only=process.argv[3]?.split(',');
const server=await createServer({configFile:ROOT+'vite.pages.config.ts',server:{port:5199,host:'127.0.0.1'},logLevel:'error'});await server.listen();
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const page=await b.newPage({viewport:{width:1280,height:860}});const errs=[];page.on('pageerror',e=>errs.push(e.message));page.on('console',m=>{if(m.type()==='error')errs.push(m.text());});
await page.goto('http://127.0.0.1:5199/a_lenda_de_gregorio/');await page.getByRole('button',{name:/Começar aventura/}).click();await page.waitForFunction(()=>window.__lenda?.screen==='playing');
const spots=await page.evaluate(()=>{const g=window.__lenda;g.cheats.life=true;const out={};for(const z of ['world','north','south']){g.zone=z;const m=g.maps[z];for(let y=3;y<m.height-3;y++)for(let x=3;x<m.width-3;x++){const b=m.biome[y][x];if(m.tiles[y][x]===0&&!g.collides(x*32+16,y*32+16,9)){(out[b]??=[]).push([x*32+16,y*32+16,z]);}}}
  const pick={};for(const [b,l] of Object.entries(out))pick[b]=l[Math.floor(l.length/2)];g.zone='world';return pick;});
const plan=[...Object.keys(spots).map(b=>({b})),{b:'forest',weather:'storm'},{b:'snow',weather:'blizzard'},{b:'desert',weather:'sandstorm'},{b:'ash',weather:'ash'},{b:'darkwood',weather:'fog'},{b:'forest',night:true},{b:'rainforest',weather:'rain'}];
for(const s of plan){if(only&&!only.includes(s.b))continue;const name=s.b+(s.weather?'-'+s.weather:'')+(s.night?'-night':'');
  const info=await page.evaluate(({p,s})=>{const g=window.__lenda;g.dialog='';g.zone=p[2];g.player.x=p[0];g.player.y=p[1];g.snapCamera=true;g.draw();const A=g.ambient;A.critters=[];A.quality='full';A.frameMs=5;g.map.enemies.forEach(e=>{if(Math.hypot(e.x-p[0],e.y-p[1])<500)e.hp=0;});
    if(s.night)g.elapsed=240*.8;
    for(let i=0;i<900;i++){A.update(g,1/60);if(s.weather){A.weather.kind=s.weather;A.weather.i=1;A.weather.target=1;A.weather.pending=null;}}A.eventTimer=0;A.update(g,1/60);A.quality='full';A.frameMs=5;const t0=performance.now();for(let i=0;i<30;i++)g.draw();const ms=(performance.now()-t0)/30;A.frameMs=5;return {...A.info(),drawMs:+ms.toFixed(2)};},{p:spots[s.b],s});
  await page.waitForTimeout(1200);await page.screenshot({path:`${OUT}/${name}.png`,clip:{x:46,y:236,width:860,height:575}});console.log(name,JSON.stringify(info));}
console.log('errors',errs.slice(0,5));await b.close();await server.close();
