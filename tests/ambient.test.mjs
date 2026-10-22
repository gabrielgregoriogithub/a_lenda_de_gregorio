// Mundo vivo: clima, vento, fauna, reações, eventos, som e desempenho do sistema de ambiente, rodando sobre o motor real.
import './env.mjs';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Adventure,ZONES} from '../lib/adventure.ts';
import {makeGame} from './env.mjs';
import {Ambient} from '../lib/ambient.ts';
import {BIOME_PROFILE,ZONE_PROFILE,SPECIES,WEATHER,profileOf} from '../lib/ambient-data.ts';
import {BIOMES} from '../lib/world.ts';
import {drawCritter,SPRITE_SPECIES} from '../lib/ambient-sprites.ts';

const T=32;
// gerador determinístico para os testes não dependerem da sorte
const seeded=(s=7)=>()=>{s=(s*1103515245+12345)&0x7fffffff;return s/0x7fffffff;};
const fresh=()=>{const g=makeGame(Adventure);g.cheats.life=true;g.start();g.dismissDialog();g.ambient=new Ambient(seeded());return g;};
const view=g=>({W:g.canvas.width/g.zoom,H:g.canvas.height/g.zoom});
const look=(g,x,y)=>{const {W,H}=view(g);g.player.x=x;g.player.y=y;g.camera.x=x-W/2;g.camera.y=y-H/2;};
// um ponto de chão livre bem dentro de cada bioma
function spots(g){const out={};for(const z of ['world','north','south']){g.zone=z;const m=g.maps[z];const all={};
  for(let y=4;y<m.height-4;y++)for(let x=4;x<m.width-4;x++){const b=m.biome[y][x];if(m.tiles[y][x]!==0||g.collides(x*T+16,y*T+16,9))continue;let same=0;for(let a=-3;a<=3;a++)for(let c=-3;c<=3;c++)if(m.biome[y+a]?.[x+c]===b)same++;if(same>=45)(all[b]??=[]).push([x*T+16,y*T+16]);}
  for(const [b,l] of Object.entries(all))if(!out[b])out[b]={zone:z,p:l[Math.floor(l.length/2)]};}g.zone='world';return out;}
const run=(g,sec,each)=>{for(let i=0;i<sec*60;i++){g.ambient.update(g,1/60);each?.(i);}};
const calmDown=g=>{for(const z of ZONES)for(const e of g.maps[z].enemies)e.hp=0;};

test('todo bioma e todo interior têm ecossistema próprio: clima, fauna, partículas, sons e eventos',()=>{
  for(const b of Object.keys(BIOMES)){const p=BIOME_PROFILE[b];assert.ok(p,`perfil para ${b}`);assert.ok(p.fauna.length>=3,`${b}: fauna`);assert.ok(p.weather.length>=1&&p.sound.calls.length>=1&&p.events.length>=1,`${b}: clima, sons, eventos`);
    for(const [s] of p.fauna)assert.ok(SPECIES[s]&&SPRITE_SPECIES.includes(s),`${b}: ${s} tem comportamento e desenho`);for(const [w] of p.weather)assert.ok(WEATHER[w],`${b}: clima ${w}`);}
  for(const z of ZONES){const p=profileOf(z,null);assert.ok(p.fauna.length>=1&&p.weather.length>=1,`interior ${z} tem perfil`);}
  // biomas não são o mesmo efeito recolorido: a combinação de fauna difere entre todos os pares
  const keys=Object.keys(BIOME_PROFILE);for(let i=0;i<keys.length;i++)for(let j=i+1;j<keys.length;j++){const a=BIOME_PROFILE[keys[i]].fauna.map(f=>f[0]).sort().join(),b=BIOME_PROFILE[keys[j]].fauna.map(f=>f[0]).sort().join();assert.notEqual(a,b,`${keys[i]} x ${keys[j]}`);}
  // clima coerente: sem chuva no deserto, sem neve na selva, sem chuva dentro de cavernas
  const kinds=b=>BIOME_PROFILE[b].weather.map(w=>w[0]);
  assert.ok(!kinds('desert').some(k=>['rain','drizzle','snow','storm'].includes(k)));assert.ok(!kinds('rainforest').some(k=>['snow','blizzard','sandstorm'].includes(k)));
  assert.ok(kinds('snow').includes('blizzard')&&kinds('stormdesert').includes('sandstorm')&&kinds('forest').includes('storm')&&kinds('ash').includes('ash'));
  for(const [z,p] of Object.entries(ZONE_PROFILE))assert.ok(!p.weather.some(([k])=>['drizzle','storm','sandstorm','blizzard'].includes(k)),`interior ${z} sem tempestade`);
});

test('clima: transições suaves, só estados permitidos pelo bioma, e a chuva molha/a neve acumula',()=>{
  const g=fresh();calmDown(g);const S=spots(g);
  for(const b of ['forest','desert','snow','swamp','ash','rainforest']){const {zone,p}=S[b];g.zone=zone;look(g,...p);const A=g.ambient;let last=A.weather.i,seen=new Set();
    run(g,900,i=>{const w=A.weather;assert.ok(w.i>=0&&w.i<=1);assert.ok(Math.abs(w.i-last)<=1/60/7+1e-9,`${b}: salto de intensidade`);last=w.i;if(i>600&&w.i>.05)seen.add(w.kind);});
    for(const k of seen)assert.ok(BIOME_PROFILE[b].weather.some(([w])=>w===k),`${b}: clima ${k} não pertence ao bioma`);
    assert.ok(seen.size>=1,`${b}: o clima muda ao longo do tempo (${[...seen]})`);}
  const A=fresh().ambient;A.weather={kind:'rain',i:1,target:1,timer:99,pending:null};A.profile=BIOME_PROFILE.forest;A.updateWeather({outdoors:true},20,true);assert.ok(A.wet>.9,'chuva molha a floresta (gotas pingam depois)');
  A.weather={kind:'snow',i:1,target:1,timer:99,pending:null};A.profile=BIOME_PROFILE.snow;for(let i=0;i<60;i++)A.updateWeather({outdoors:true},1,true);assert.ok(A.snowCover>.9,'a neve acumula');
  A.weather={kind:'clear',i:0,target:0,timer:9999,pending:null};for(let i=0;i<200;i++)A.updateWeather({outdoors:true},1,true);assert.equal(A.snowCover,0,'e derrete sem neve');
});

test('tempestade: relâmpagos com trovão; perto de chefes o clima não atrapalha a leitura',()=>{
  const g=fresh();calmDown(g);const S=spots(g);g.zone='world';look(g,...S.forest.p);const A=g.ambient;A.update(g,1/60);
  A.weather={kind:'storm',i:1,target:1,timer:999,pending:null};run(g,120,()=>{A.weather.kind='storm';A.weather.target=1;});
  assert.ok(A.events.filter(e=>e==='lightning').length>=2,'raios caem durante a tempestade');assert.ok(A.audio.played.includes('thunder'),'trovão acompanha o raio');
  g.bossActiveId='x';run(g,30,()=>{A.weather.target=1;});assert.ok(A.weather.i<=.51,'durante luta de chefe a intensidade é limitada');
});

test('fauna: cada bioma recebe seus animais, que nunca entram em paredes, água, obstáculos ou peças de puzzle',()=>{
  const g=fresh();calmDown(g);const S=spots(g);
  for(const [b,{zone,p}] of Object.entries(S)){g.zone=zone;look(g,...p);const A=g.ambient;A.critters=[];A.update(g,1/60);const prof=BIOME_PROFILE[b];const kinds=new Set();
    run(g,40,i=>{g.player.x=p[0]+Math.sin(i/120)*40;if(i%20)return;
      for(const k of A.critters){if(k.alpha<=0)continue;kinds.add(k.sp);const mv=SPECIES[k.sp].move;
        if((mv==='hop'||mv==='walk'||mv==='climb'||mv==='wade')&&!['climb','hide','cross','dive','circle'].includes(k.state)){assert.ok(A.landOk(g,k.x,k.y),`${b}: ${k.sp} em lugar inválido (${k.state}) ${k.x|0},${k.y|0}`);}
        if(mv==='swim')assert.equal(A.tileAt(g.map,k.x,k.y),2,`${b}: ${k.sp} fora da água`);}
      assert.ok(A.critters.length<=A.cap+12,'população limitada');});
    const own=[...kinds].filter(s=>prof.fauna.some(([f])=>f===s));assert.ok(own.length>=2,`${b}: fauna própria apareceu (${[...kinds]})`);}
});

test('fauna é só ambiente: não bloqueia o herói, não entra no combate, no save nem nos puzzles',()=>{
  const g=fresh();calmDown(g);const S=spots(g);g.zone='world';look(g,...S.forest.p);run(g,20);const A=g.ambient;assert.ok(A.critters.length>0);
  const k=A.critters.find(c=>SPECIES[c.sp].move==='hop'||SPECIES[c.sp].move==='walk');
  if(k){assert.equal(g.collides(k.x,k.y,9),g.collides(k.x,k.y,9),'determinístico');const before=g.collides(k.x,k.y,9);A.critters=[];assert.equal(g.collides(k.x,k.y,9),before,'animal não muda a colisão');}
  const enemies=JSON.stringify(g.map.enemies.map(e=>e.id)),props=g.map.props.length;run(g,10);assert.equal(JSON.stringify(g.map.enemies.map(e=>e.id)),enemies);assert.equal(g.map.props.length,props);
  const save=g.serialize();assert.ok(!/critter|ambient|songbird|rabbit/.test(save),'nada do ambiente vai para o save');
  const h=fresh();assert.equal(h.load(save),true);
  // longe de baús, portas, alavancas, tochas e peças de puzzle
  for(const c of A.critters)if(SPECIES[c.sp].move!=='fly'&&SPECIES[c.sp].move!=='flutter'&&SPECIES[c.sp].move!=='perch')assert.ok(!A.inKeep(c.x,c.y),`${c.sp} perto de peça de puzzle`);
});

test('reações: coelho foge para o arbusto, ave levanta voo, insetos se dispersam, grama se inclina, pegadas na areia e na neve',()=>{
  const g=fresh();calmDown(g);const S=spots(g);const A=g.ambient;
  g.zone='world';look(g,...S.forest.p);A.update(g,1/60);A.critters=[];
  const [x,y]=S.forest.p;let rabbit=null;for(let dx=-120;dx<=120&&!rabbit;dx+=16)for(let dy=-90;dy<=90&&!rabbit;dy+=16)if(A.landOk(g,x+dx,y+dy)&&Math.hypot(dx,dy)>70)rabbit=A.spawn(g,0,{sp:'rabbit',x:x+dx,y:y+dy,state:'idle'});
  assert.ok(rabbit);const d0=Math.hypot(rabbit.x-g.player.x,rabbit.y-g.player.y);
  for(let i=0;i<90;i++){const a=Math.atan2(rabbit.y-g.player.y,rabbit.x-g.player.x);const nx=g.player.x+Math.cos(a)*2,ny=g.player.y+Math.sin(a)*2;if(!g.collides(nx,ny,9)){g.player.x=nx;g.player.y=ny;}A.update(g,1/60);}
  assert.ok(['flee','hide'].includes(rabbit.state)||!A.critters.includes(rabbit),`o coelho reage (${rabbit.state})`);
  const tree=g.map.props.find(q=>q.kind==='tree'&&Math.abs(q.x-x)<400&&Math.abs(q.y-y)<300);A.trees=[tree];const bird=A.spawn(g,0,{sp:'songbird',x:tree.x,y:tree.y-52,state:'perch'});bird.home=tree;bird.t=99;
  g.player.x=tree.x+30;g.player.y=tree.y+10;A.lastPx=g.player.x-5;for(let i=0;i<20;i++){g.player.x+=.5;A.update(g,1/60);}assert.equal(bird.state,'fly','a ave pousada levanta voo');
  const bf=A.spawn(g,0,{sp:'butterfly',x:g.player.x+20,y:g.player.y,state:'hover'});A.react(g,bf,[g.player.x,g.player.y,20]);assert.ok(bf.ax>g.player.x+40,'a borboleta se afasta');
  assert.ok(Math.abs(A.plantShear(g.player.x+10,g.player.y,g.player))>Math.abs(A.plantShear(g.player.x+300,g.player.y,g.player))-1,'a grama perto do herói se inclina mais');
  const near=A.plantShear(g.player.x+8,g.player.y,g.player)-A.plantShear(g.player.x-8,g.player.y,g.player);assert.ok(near>4,'o herói abre a grama para os dois lados');
  for(const [b,kind] of [['desert','sand'],['snow','snow'],['forest',null]]){const {zone,p}=S[b];g.zone=zone;look(g,...p);A.update(g,1/60);A.prints=[];
    for(let i=0;i<60;i++){const nx=g.player.x+1.2;if(!g.collides(nx,g.player.y,9))g.player.x=nx;else g.player.y+=1.2;A.update(g,1/60);}
    if(kind)assert.ok(A.prints.length>=3&&A.prints.every(f=>f.k===kind),`${b}: pegadas de ${kind}`);else assert.equal(A.prints.length,0,'sem pegadas na grama');}
  assert.ok(d0>60);
});

test('eventos espontâneos acontecem, variam e são raros; nenhum durante luta',()=>{
  const g=fresh();calmDown(g);const S=spots(g);const A=g.ambient;const seen=new Set();let fired=0;
  for(const b of ['forest','plains','desert','darkwood','lake','snow']){const {zone,p}=S[b];g.zone=zone;look(g,...p);const before=A.events.length;run(g,240);fired+=A.events.length-before;for(const e of A.events)seen.add(e);}
  assert.ok(seen.size>=5,`variedade de eventos: ${[...seen]}`);assert.ok(fired>=6&&fired<=6*240/20,`frequência razoável: ${fired} em 24 min`);
  const n=A.eventCount;g.bossActiveId='boss';A.eventTimer=0;run(g,120);assert.equal(A.eventCount,n,'sem eventos com chefe ativo');
});

test('som ambiente: leitos seguem o clima e a água; chamados variam; nada toca com o som desligado',()=>{
  // Web Audio falso que registra o que é criado
  const made=[];const node=()=>new Proxy({},{get:(t,k)=>k in t?t[k]:k==='connect'||k==='disconnect'||k==='start'||k==='stop'?()=>{}:k==='gain'||k==='frequency'||k==='Q'||k==='delayTime'||k==='playbackRate'?(t[k]={value:0,setValueAtTime(){},exponentialRampToValueAtTime(){},setTargetAtTime(v){this.value=v;}}):undefined,set:(t,k,v)=>{t[k]=v;return true;}});
  const ctx={currentTime:0,sampleRate:8000,destination:node(),createGain:()=>{made.push('gain');return node();},createBiquadFilter:()=>node(),createBufferSource:()=>{made.push('src');return node();},createOscillator:()=>{made.push('osc');return node();},createDelay:()=>node(),createBuffer:(c,l)=>({getChannelData:()=>new Float32Array(l)})};
  const g=fresh();calmDown(g);const S=spots(g);g.zone='world';look(g,...S.lake.p);g.sound=true;g.audio=ctx;const A=g.ambient;A.update(g,1/60);
  A.weather={kind:'rain',i:1,target:1,timer:999,pending:null};run(g,60,()=>{A.weather.kind='rain';A.weather.target=1;});
  assert.ok(A.audio.level.rain>.6,'a chuva aparece no som');assert.ok(A.audio.beds.rain.gain.value>0);
  const calls=new Set(A.audio.played);assert.ok(calls.size>=2,`chamados variados: ${[...calls]}`);
  g.sound=false;const n=made.length;run(g,30);assert.equal(made.length,n,'som desligado não cria sons');assert.equal(A.audio.ctx,null);
});

test('desenho: todos os animais, todos os climas e todos os mapas desenham sem erro; desempenho por quadro',()=>{
  const ctx=new Proxy({},{get:(t,k)=>k==='canvas'?{width:960,height:640}:typeof k==='string'&&k.startsWith('create')?()=>({addColorStop(){}}):()=>{},set:()=>true});
  for(const s of SPRITE_SPECIES)for(const st of ['idle','feed','rest','fly','perch','jump'])drawCritter(ctx,s,10,10,-1,1,{moving:true,flying:st==='fly',state:st,ph:1.3,z:st==='jump'?5:0,alpha:1});
  const g=fresh();calmDown(g);const A=g.ambient;
  for(const z of ZONES){g.zone=z;const m=g.map;let p=[m.width*16,m.height*16];outer:for(let y=2;y<m.height-2;y++)for(let x=2;x<m.width-2;x++)if((m.tiles[y][x]===0||m.tiles[y][x]===3)&&!g.collides(x*T+16,y*T+16,9)){p=[x*T+16,y*T+16];break outer;}
    look(g,...p);run(g,5);for(const k of Object.keys(WEATHER)){A.weather.kind=k;A.weather.i=1;A.drawGround(ctx,g,0,30,0,22);A.drawAir(ctx);A.drawGlow(ctx,g);A.drawSky(ctx,g,960,640);for(const d of A.drawables(g,ctx,()=>true))d.render();}}
  // custo do sistema: atualização média bem abaixo de 1 ms por quadro mesmo com população cheia
  const S=spots(g);g.zone='world';look(g,...S.plains?.p??S.forest.p);run(g,10);const t0=performance.now();run(g,10);const ms=(performance.now()-t0)/600;
  assert.ok(ms<1,`atualização do ambiente: ${ms.toFixed(3)} ms/quadro`);
  // qualidade automática: quadros pesados reduzem o ambiente; leves por tempo devolvem
  A.frameMs=30;run(g,3);assert.equal(A.quality,'low');assert.ok(A.critters.length<=A.cap+12);A.frameMs=4;for(let i=0;i<9*60;i++){A.frameMs=4;A.update(g,1/60);}assert.equal(A.quality,'full');
});

test('o mundo continua vivo com o herói parado e o ambiente acompanha a troca de mapa',()=>{
  const g=fresh();calmDown(g);const S=spots(g);g.zone='world';look(g,...S.autumn.p);const A=g.ambient;run(g,20);
  const pos=()=>A.critters.map(k=>`${k.x.toFixed(1)},${k.y.toFixed(1)},${k.state}`).join('|');const a=pos(),sway=A.sway(100,100,'tree');run(g,3);
  assert.notEqual(pos(),a,'animais se movem sem o herói');assert.notEqual(A.sway(100,100,'tree'),sway,'árvores balançam');assert.ok(A.liveParts>0,'folhas e partículas no ar');
  assert.notEqual(A.sway(100,100,'tree'),A.sway(400,260,'tree'),'árvores não balançam em sincronia');
  g.zone='cave1';g.player.x=g.map.width*16;g.player.y=g.map.height*16;A.update(g,1/60);assert.equal(A.zone,'cave1');assert.equal(A.critters.filter(k=>!['bat','moth'].includes(k.sp)).length,0,'troca de mapa limpa a fauna anterior');
  assert.equal(A.profile.id,'cave');
});

test('esquilo sobe na árvore ao fugir, some na copa e desce depois',()=>{
  const g=fresh();calmDown(g);const S=spots(g);g.zone='world';look(g,...S.autumn.p);const A=g.ambient;A.update(g,1/60);A.critters=[];
  A.keepKey='';A.scanProps(g);const tree=g.map.props.find(q=>q.kind==='tree'&&A.landOk(g,q.x+34,q.y+12)&&A.landOk(g,q.x+4,q.y+16));assert.ok(tree);look(g,tree.x+300,tree.y);A.update(g,1/60);A.critters=[];
  const sq=A.spawn(g,0,{sp:'squirrel',x:tree.x+34,y:tree.y+12,state:'idle'});sq.home=tree;sq.tx=tree.x;sq.ty=tree.y+16;sq.state='flee';sq.t=5;
  g.player.x=tree.x+400;let top=0,down=false;for(let i=0;i<60*14;i++){A.update(g,1/60);top=Math.max(top,sq.z);if(top>=44&&sq.state==='idle'&&sq.z===0){down=true;break;}}
  assert.ok(top>=44,'subiu até a copa');assert.ok(down,'desceu e voltou a explorar');
});
