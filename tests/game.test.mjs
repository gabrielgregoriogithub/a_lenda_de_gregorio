// Testes do motor real (lib/adventure.ts) sem navegador: rode com `npm test`.
import './env.mjs';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Adventure,ZONES,makeMap} from '../lib/adventure.ts';
import {makeGame} from './env.mjs';
import {reach} from './reach.mjs';
import {solve} from './solver.mjs';

const T=32,c=n=>n*T+T/2;
const fresh=()=>{const g=makeGame(Adventure);g.cheats.life=true;g.start();g.dismissDialog();return g;};
const prop=(g,z,id)=>g.maps[z].props.find(p=>p.id===id);
const reachable=(g,z,start,id)=>{g.zone=z;const p=prop(g,z,id);assert.ok(p,`${id} existe`);return reach(g,start).has(p.x,p.y,56);};
const open=(g,z,...ids)=>{g.zone=z;for(const id of ids){const p=prop(g,z,id);p.open=true;}g.checkBarriers();};

test('a aventura inteira pode ser concluída, do capítulo 1 ao 6',()=>{
  const g=makeGame(Adventure),r=solve(g);
  assert.equal(g.chapter,6);assert.ok(g.finished,'o Núcleo dos Ventos encerra a aventura');
  assert.deepEqual([...r.entries.keys()].sort(),[...ZONES].sort(),'todas as regiões são visitadas');
  const closed=ZONES.flatMap(z=>g.maps[z].props.filter(p=>p.kind==='chest'&&!p.open).map(p=>`${z}:${p.id}`));
  assert.deepEqual(closed,[],'todo baú pode ser aberto');
});

test('puzzles não podem ser contornados',()=>{
  const g=fresh();
  assert.equal(reachable(g,'cave1',{x:c(12.5),y:c(16)},'c1-down'),false,'1º andar: escada só depois das tochas');
  open(g,'cave1','c1-torch-a','c1-torch-b');assert.equal(reachable(g,'cave1',{x:c(12.5),y:c(16)},'c1-down'),true);
  assert.equal(reachable(g,'cave2',{x:c(2),y:c(12.5)},'c2-bosskey'),false,'2º andar: sala do golem só depois das tochas');
  g.boots=true;
  assert.equal(reachable(g,'north',{x:c(16),y:c(43.5)},'citadel-door'),false,'Botas Aladas não bastam para cruzar a lava');
  g.boots=false;assert.equal(reachable(g,'north',{x:c(16),y:c(43.5)},'amulet-chest'),false,'o abismo exige as Botas Aladas');
  g.amulet=true;g.boots=true;
  const cit1={x:c(15),y:c(20)};
  assert.equal(reachable(g,'citadel1',cit1,'cit1-ice'),false,'Flechas de Gelo só depois das tochas');
  open(g,'citadel1','cit1-torch-a','cit1-torch-b');assert.equal(reachable(g,'citadel1',cit1,'cit1-ice'),true);
  assert.equal(reachable(g,'citadel1',cit1,'cit1-up'),false,'escada só depois dos selos de gelo');
  open(g,'citadel1','cit1-ice-seal-a','cit1-ice-seal-b');assert.equal(reachable(g,'citadel1',cit1,'cit1-up'),true);
  const cit2={x:c(15),y:c(20)};
  assert.equal(reachable(g,'citadel2',cit2,'cit2-up'),false,'Terraço: a lava não serve de atalho');
  open(g,'citadel2','cit2-lever-a','cit2-lever-b');assert.equal(reachable(g,'citadel2',cit2,'cit2-up'),true);
  assert.equal(reachable(g,'citadel',{x:c(15),y:c(22)},'aurora-crown'),false,'coroa só depois dos braseiros');
  const bas={x:c(4),y:c(20)};
  assert.equal(reachable(g,'bastion',bas,'bastion-armor'),false,'a pedra da coluna fecha o leste (nem saltando)');
  assert.equal(reachable(g,'bastion',bas,'bastion-core'),false);
  assert.equal(reachable(g,'bastion',bas,'bastion-gloves'),true,'as Luvas ficam do lado da chegada');
  g.zone='bastion';g.map.props=g.map.props.filter(p=>p.id!=='bastion-gate');g.rebuildGrid('bastion');
  assert.equal(reachable(g,'bastion',bas,'bastion-core'),true);
  assert.equal(reachable(g,'aerie',{x:c(4),y:c(19)},'aerie-core'),false,'o abismo é largo demais para saltar');
  g.zone='aerie';for(const e of g.map.enemies)e.hp=0;g.updateAerieBridge();
  assert.equal(reachable(g,'aerie',{x:c(4),y:c(19)},'aerie-core'),true,'a ponte de vento surge quando todos caem');
});

test('chegadas não caem dentro de paredes nem em cima de escadas',()=>{
  const g=fresh(),arrivals=[];
  for(const z of ZONES)for(const p of g.maps[z].props)if(p.to)arrivals.push([p.to,p.ax??12,p.ay??12,`${z}:${p.id}`]);
  arrivals.push(['cave1',12.5,16,'porta do templo'],['eclipse',3,20,'capítulo 3'],['bastion',4,20,'capítulo 4'],['sanctum',4,19,'capítulo 5'],['aerie',4,19,'capítulo 6']);
  const bad=[];for(const [z,ax,ay,from] of arrivals){g.zone=z;const x=c(ax),y=c(ay);
    if(g.collides(x,y,9))bad.push(`${from} → ${z} (${ax},${ay}) dentro de obstáculo`);
    const stairs=g.map.props.find(p=>(p.kind==='stairs'||p.kind==='exit')&&Math.hypot(p.x-x,p.y-y)<24);
    if(stairs)bad.push(`${from} → ${z} cai em cima de ${stairs.id}`);}
  assert.deepEqual(bad,[]);
});

test('regiões já conquistadas continuam ligadas: dá para voltar e seguir em frente',()=>{
  const g=fresh(),links=new Map();
  for(const z of ZONES)for(const p of g.maps[z].props)if(p.to)links.set(`${z}>${p.to}`,p.minChapter??0);
  for(const [a,b,ch] of [['citadel','eclipse',3],['eclipse','bastion',4],['bastion','sanctum',5],['sanctum','aerie',6]]){
    assert.ok(links.has(`${b}>${a}`),`${b} volta para ${a}`);assert.equal(links.get(`${a}>${b}`),ch,`${a} segue para ${b} a partir do capítulo ${ch}`);}
  g.chapter=3;g.zone='eclipse';const portal=prop(g,'eclipse','eclipse-bastion');g.player.x=portal.x;g.player.y=portal.y+30;g.interact();
  assert.equal(g.zone,'eclipse','portal adormecido antes do capítulo 4');
  g.chapter=4;g.interact();assert.equal(g.zone,'bastion');
});

test('núcleos e coroa já conquistados não pulam capítulos',()=>{
  const g=fresh();g.chapter=3;g.colossusDead=true;g.zone='citadel';const crown=prop(g,'citadel','aurora-crown');
  g.player.x=crown.x;g.player.y=crown.y+30;g.interact();
  assert.equal(g.screen,'playing');assert.equal(g.chapter,3);
  g.chapter=5;g.zone='eclipse';g.eclipseDead=true;open(g,'eclipse','eclipse-totem');const core=prop(g,'eclipse','eclipse-heart');
  g.player.x=core.x;g.player.y=core.y+30;g.update(1/60);assert.equal(g.screen,'playing','Núcleo do Eclipse no capítulo 5 não vence de novo');
  g.chapter=3;g.update(1/60);assert.equal(g.screen,'won','no capítulo 3 o núcleo encerra o capítulo');
});

test('o Núcleo do Eclipse exige o totem energizado',()=>{
  const g=fresh();g.chapter=3;g.zone='eclipse';g.visited.add('eclipse');g.arrowKinds.add('light');g.swiftBoots=true;g.wands.add('lightning');g.eclipseDead=true;const core=prop(g,'eclipse','eclipse-heart');
  g.player.x=core.x;g.player.y=core.y+30;g.update(1/60);assert.equal(g.screen,'playing');
  assert.match(g.objective,/totem/);
});

test('voltar no tempo e carregar preservam capítulo, arma ativa e pontes',()=>{
  const g=fresh();g.chapter=6;g.boots=true;g.wands.add('missile');g.wand='missile';g.ranged='wand';g.zone='aerie';
  for(const e of g.map.enemies)e.hp=0;g.updateAerieBridge();const save=g.serialize();
  g.chapter=1;g.ranged='bow';g.rewindBy(0);
  const h=fresh();h.boots=true;assert.ok(h.load(save));
  assert.equal(h.chapter,6);assert.equal(h.ranged,'wand');
  h.zone='aerie';assert.equal(reach(h,{x:c(4),y:c(19)}).has(c(16.5),c(3),56),true,'ponte de vento continua de pé depois de carregar');
  h.history=[save];h.chapter=1;h.rewindBy(1);assert.equal(h.chapter,6,'voltar no tempo não rebaixa o capítulo');
});

test('itens únicos não podem ser coletados duas vezes',()=>{
  const g=fresh();g.zone='world';const key=prop(g,'world','key-chest');
  g.openChest(key);g.dismissDialog();const coins=g.coins;g.openChest(key);g.dismissDialog();
  assert.equal(g.coins,coins);
  // coração: voltar no tempo durante a retirada não pode dar o coração e fechar o baú de novo
  g.zone='north';const heart=prop(g,'north','north-heart');for(const e of g.map.enemies)if(e.id==='k-heart')e.hp=0;
  const before=g.serialize(),max=g.player.maxHp;g.player.x=heart.x;g.player.y=heart.y+30;g.interact();
  g.history=[before];g.rewindBy(1);for(let i=0;i<220;i++)g.update(1/60);
  assert.equal(g.player.maxHp,max,'a retirada interrompida não entrega o coração');
});

test('equipamentos importantes precisam ser conquistados',()=>{
  const g=fresh(),needGuard=['bow','heart','fragment','bosskey','boots','amulet','tide','ice','light','swift-boots','wand-lightning','armor','gloves','cloak','wand-repulse','wand-missile'];
  for(const z of ZONES)for(const p of g.maps[z].props){if(p.kind!=='chest'||!needGuard.includes(p.item))continue;
    const guard=p.guard&&ZONES.some(q=>g.maps[q].enemies.some(e=>e.id===p.guard));
    assert.ok(guard,`${z}:${p.id} (${p.item}) tem um guardião existente`);}
  const sword=prop(g,'world','lake-sword');g.zone='world';g.player.x=sword.x;g.player.y=sword.y+40;g.interact();
  assert.equal(g.sword,1,'a Espada Lunar exige derrotar o golem');
});

test('mapas consistentes: barreiras, inimigos e chegada',()=>{
  const g=fresh();
  for(const z of ZONES){g.zone=z;const m=g.map;
    for(const b of m.props.filter(p=>p.by))for(const id of b.by)assert.ok(m.props.some(p=>p.id===id),`${z}:${b.id} depende de ${id}, que existe`);
    for(const e of m.enemies){const heavy=['boss','golem','colossus','tidewarden','stonebeast'].includes(e.kind),air=e.kind==='bat'||e.kind==='wisp';
      assert.equal(g.collides(e.x,e.y,heavy?16:7,air),false,`${z}:${e.id} não nasce preso`);}
    const ids=m.props.map(p=>p.id);assert.equal(new Set(ids).size,ids.length,`${z}: ids únicos`);}
  for(const z of ZONES)assert.ok(makeMap(z).width>0);
});

test('a passagem para o Eclipse exige conquistar a Gruta da Maré',()=>{
  const g=fresh();g.chapter=2;g.colossusDead=true;g.screen='won';g.continueAdventure();
  assert.equal(g.zone,'north','a continuação retorna ao mundo aberto');
  const gate=prop(g,'north','north-eclipse-gate');g.player.x=gate.x;g.player.y=gate.y+30;g.interact();
  assert.equal(g.zone,'north','a passagem permanece fechada sem a Onda Arcana');
  g.zone='grotto';assert.equal(g.maps.grotto.props.filter(p=>p.kind==='barrier').length,2);
  open(g,'grotto','grotto-torch-a','grotto-torch-b');
  assert.equal(g.maps.grotto.props.some(p=>p.kind==='barrier'),false,'as duas tochas abrem a galeria inundada');
  g.tide=true;g.zone='north';g.player.x=gate.x;g.player.y=gate.y+30;g.interact();
  assert.equal(g.zone,'eclipse','a conquista libera o Caminho do Eclipse');
});

test('o Eclipse exige os dois selos antes da arena do guardião',()=>{
  const g=fresh();g.chapter=3;g.zone='eclipse';g.visited.add('eclipse');
  const wall=prop(g,'eclipse','eclipse-warden-barrier');assert.ok(wall);
  assert.equal(g.map.tiles[9][17],4,'a muralha começa fechada');
  open(g,'eclipse','eclipse-seal-a');assert.ok(prop(g,'eclipse','eclipse-warden-barrier'),'um selo não basta');
  open(g,'eclipse','eclipse-seal-b');assert.equal(prop(g,'eclipse','eclipse-warden-barrier'),undefined);
  assert.equal(g.map.tiles[9][17],0,'os dois selos abrem a muralha');
  const save=g.serialize(),h=fresh();assert.ok(h.load(save));h.zone='eclipse';assert.equal(h.map.tiles[9][17],0,'a abertura permanece após carregar');
});
