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
  assert.equal(g.chapter,7);assert.ok(g.finished,'o Coração da Selva encerra a aventura');
  assert.deepEqual([...r.entries.keys()].sort(),[...ZONES].sort(),'todas as regiões são visitadas');
  const closed=ZONES.flatMap(z=>g.maps[z].props.filter(p=>p.kind==='chest'&&!p.open).map(p=>`${z}:${p.id}`));
  assert.deepEqual(closed,[],'todo baú pode ser aberto');
});
test('o Santuário das Raízes exige fogo, força e o guardião vegetal',()=>{
  const g=fresh();g.chapter=7;g.zone='grove';g.visited.add('grove');g.bow=true;g.arrowKinds.add('fire');g.gloves=true;
  for(const id of ['grove-torch-a','grove-torch-b']){const p=prop(g,'grove',id);p.open=true;p.solid=false;}g.checkBarriers();assert.equal(prop(g,'grove','grove-root-barrier'),undefined);
  assert.equal(prop(g,'grove','grove-plate-a'),undefined,'as placas sem função foram removidas');assert.equal(prop(g,'grove','grove-heart-barrier'),undefined);
  const boss=g.map.enemies.find(e=>e.id==='grove-heartwarden');assert.equal(boss.kind,'vinebeast');const hp=boss.hp;boss.timer=1;g.hitEnemy(boss,1,0,1,'sword');assert.equal(boss.hp,hp-1);boss.hp=0;g.player.x=prop(g,'grove','grove-heart').x;g.player.y=prop(g,'grove','grove-heart').y+30;g.interact();for(let i=0;i<220&&g.heartChestTimer>0;i++)g.update(1/60);g.dismissDialog();assert.equal(g.player.maxHp,7);
  g.map.enemies.forEach(e=>e.hp=0);const core=prop(g,'grove','grove-core');g.player.x=core.x-30;g.player.y=core.y;g.update(1/60);assert.equal(g.finished,true);
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
  open(g,'citadel1','cit1-torch-a','cit1-torch-b');
  const iceWall=prop(g,'citadel1','cit1-ice-wall');iceWall.burnHits=10;g.zone='citadel1';g.map.props=g.map.props.filter(p=>p!==iceWall);g.rebuildGrid('citadel1');
  assert.equal(reachable(g,'citadel1',cit1,'cit1-ice'),true);
  assert.equal(reachable(g,'citadel1',cit1,'cit1-up'),false,'escada só depois das 4 tochas do salão norte');
  open(g,'citadel1','cit1-torch-c','cit1-torch-d','cit1-torch-e','cit1-torch-f');assert.equal(reachable(g,'citadel1',cit1,'cit1-up'),true);
  const cit2={x:c(15),y:c(20)};
  assert.equal(reachable(g,'citadel2',cit2,'cit2-up'),false,'Terraço: a lava não serve de atalho');
  open(g,'citadel2','cit2-lever-a','cit2-lever-b');assert.equal(reachable(g,'citadel2',cit2,'cit2-up'),true);
  assert.equal(reachable(g,'citadel',{x:c(15),y:c(22)},'aurora-crown'),false,'coroa só depois dos braseiros');
  const bas={x:c(4),y:c(20)};
  assert.equal(reachable(g,'bastion',bas,'bastion-armor'),false,'a pedra da coluna fecha o leste (nem saltando)');
  assert.equal(reachable(g,'bastion',bas,'bastion-core'),false);
  assert.equal(reachable(g,'bastion',bas,'bastion-gloves'),true,'as Luvas ficam do lado da chegada');
  g.zone='bastion';g.map.props=g.map.props.filter(p=>p.id!=='bastion-gate');g.rebuildGrid('bastion');g.arrowKinds.add('light');open(g,'bastion','bastion-seal-a','bastion-seal-b');
  assert.equal(reachable(g,'bastion',bas,'bastion-core'),true);
  assert.equal(reachable(g,'aerie',{x:c(4),y:c(19)},'aerie-core'),false,'o abismo é largo demais para saltar');
  g.zone='aerie';for(const id of ['aerie-wind-target-a','aerie-wind-target-b','aerie-wind-target-c'])prop(g,'aerie',id).open=true;for(const e of g.map.enemies)e.hp=0;g.updateAerieBridge();
  assert.equal(reachable(g,'aerie',{x:c(4),y:c(19)},'aerie-core'),true,'a ponte de vento surge quando todos caem');
});

test('chegadas não caem dentro de paredes nem em cima de escadas',()=>{
  const g=fresh(),arrivals=[];
  for(const z of ZONES)for(const p of g.maps[z].props)if(p.to)arrivals.push([p.to,p.ax??12,p.ay??12,`${z}:${p.id}`]);
  arrivals.push(['cave1',12.5,16,'porta do templo'],['eclipse',3,20,'capítulo 3'],['bastion',4,20,'capítulo 4'],['sanctum',4,19,'capítulo 5'],['aerie',4,19,'capítulo 6'],['grove',4,22,'capítulo 7']);
  const bad=[];for(const [z,ax,ay,from] of arrivals){g.zone=z;const x=c(ax),y=c(ay);
    if(g.collides(x,y,9))bad.push(`${from} → ${z} (${ax},${ay}) dentro de obstáculo`);
    const stairs=g.map.props.find(p=>(p.kind==='stairs'||p.kind==='exit')&&Math.hypot(p.x-x,p.y-y)<24);
    if(stairs)bad.push(`${from} → ${z} cai em cima de ${stairs.id}`);}
  assert.deepEqual(bad,[]);
});

test('masmorras independentes: cada uma entra e sai pelas Terras do Sul, sem portais entre elas',()=>{
  const g=fresh(),links=new Map();
  for(const z of ZONES)for(const p of g.maps[z].props)if(p.to)links.set(`${z}>${p.to}`,p.minChapter??0);
  const dungeons=['eclipse','bastion','sanctum','aerie','fortress'];
  for(const [d,ch] of [['eclipse',3],['bastion',4],['sanctum',5],['aerie',6]]){
    assert.equal(links.get(`south>${d}`),ch,`a entrada de ${d} desperta no capítulo ${ch}`);assert.ok(links.has(`${d}>south`),`${d} sai para as Terras do Sul`);}
  for(const a of dungeons)for(const b of dungeons)assert.equal(links.has(`${a}>${b}`),false,`${a} não leva direto a ${b}`);
  assert.equal(links.has('citadel>eclipse'),false,'a Cidadela não leva direto ao Eclipse');
  g.chapter=3;g.wands.add('lightning');g.zone='south';const portal=prop(g,'south','south-bastion');g.player.x=portal.x;g.player.y=portal.y+30;g.interact();
  assert.equal(g.zone,'south','entrada adormecida antes do capítulo 4');
  g.chapter=4;g.interact();assert.equal(g.zone,'bastion');g.dismissDialog();const out=prop(g,'bastion','bastion-return');g.player.x=out.x;g.player.y=out.y-30;g.interact();assert.equal(g.zone,'south','sair do Bastião volta à Floresta da Chuva');
});

test('núcleos e coroa já conquistados não pulam capítulos',()=>{
  const g=fresh();g.chapter=3;g.colossusDead=true;g.zone='citadel';const crown=prop(g,'citadel','aurora-crown');
  g.player.x=crown.x;g.player.y=crown.y+30;g.interact();
  assert.equal(g.screen,'playing');assert.equal(g.chapter,3);
  g.chapter=5;g.zone='eclipse';g.eclipseDead=true;g.map.enemies.find(e=>e.id==='eclipse-warden').hp=0;open(g,'eclipse','eclipse-totem');const core=prop(g,'eclipse','eclipse-heart');
  g.player.x=core.x;g.player.y=core.y+30;g.update(1/60);assert.equal(g.screen,'playing','Núcleo do Eclipse no capítulo 5 não vence de novo');
  g.chapter=3;g.update(1/60);assert.equal(g.screen,'won','no capítulo 3 o núcleo encerra o capítulo');
});

test('o Núcleo do Eclipse exige o totem energizado',()=>{
  const g=fresh();g.chapter=3;g.zone='eclipse';g.visited.add('eclipse');g.tide=true;g.arrowKinds.add('light');g.swiftBoots=true;g.wands.add('lightning');g.eclipseDead=true;g.map.enemies.find(e=>e.id==='eclipse-warden').hp=0;open(g,'eclipse','eclipse-seal-a','eclipse-seal-b');const core=prop(g,'eclipse','eclipse-heart');
  g.player.x=core.x;g.player.y=core.y+30;g.update(1/60);assert.equal(g.screen,'playing');
  assert.match(g.objective,/totem/);
});

test('voltar no tempo e carregar preservam capítulo, arma ativa e pontes',()=>{
  const g=fresh();g.chapter=6;g.boots=true;g.wands.add('missile');g.wand='missile';g.ranged='wand';g.zone='aerie';
  for(const id of ['aerie-wind-target-a','aerie-wind-target-b','aerie-wind-target-c'])prop(g,'aerie',id).open=true;for(const e of g.map.enemies)e.hp=0;g.updateAerieBridge();const save=g.serialize();
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
    for(const e of m.enemies){const heavy=['boss','golem','colossus','tidewarden','stonebeast','vinebeast'].includes(e.kind),air=e.kind==='bat'||e.kind==='wisp';
      assert.equal(g.collides(e.x,e.y,heavy?16:7,air),false,`${z}:${e.id} não nasce preso`);}
    const ids=m.props.map(p=>p.id);assert.equal(new Set(ids).size,ids.length,`${z}: ids únicos`);}
  for(const z of ZONES)assert.ok(makeMap(z).width>0);
});

test('a passagem para o Eclipse exige conquistar a Gruta da Maré',()=>{
  const g=fresh();g.chapter=2;g.colossusDead=true;g.screen='won';g.zone='citadel';g.continueAdventure();
  assert.equal(g.zone,'citadel','continuar a jornada não teletransporta: o herói segue a pé');assert.equal(g.chapter,3);g.zone='north';
  const gate=prop(g,'north','north-eclipse-gate');g.player.x=gate.x;g.player.y=gate.y+30;g.interact();
  assert.equal(g.zone,'north','a passagem permanece fechada sem a Onda Arcana');
  g.zone='grotto';assert.equal(g.maps.grotto.props.filter(p=>p.kind==='barrier').length,2);
  open(g,'grotto','grotto-torch-a','grotto-torch-b');
  assert.equal(g.maps.grotto.props.some(p=>p.kind==='barrier'),false,'as duas tochas abrem a galeria inundada');
  g.tide=true;g.zone='north';g.player.x=gate.x;g.player.y=gate.y+30;g.interact();
  assert.equal(g.zone,'south','a Onda Arcana abre a Passagem Inundada até as Terras do Sul');g.dismissDialog();
  const ecl=prop(g,'south','south-eclipse');g.player.x=ecl.x;g.player.y=ecl.y+30;g.interact();assert.equal(g.zone,'eclipse','o Caminho do Eclipse fica na Floresta das Trevas');
});

test('o Eclipse exige os dois selos antes da arena do guardião',()=>{
  const g=fresh();g.chapter=3;g.zone='eclipse';g.visited.add('eclipse');
  const wall=prop(g,'eclipse','eclipse-warden-barrier');assert.ok(wall);
  assert.notEqual(g.map.tiles[9][17],0,'a muralha começa fechada');
  open(g,'eclipse','eclipse-seal-a');assert.ok(prop(g,'eclipse','eclipse-warden-barrier'),'um selo não basta');
  open(g,'eclipse','eclipse-seal-b');assert.equal(prop(g,'eclipse','eclipse-warden-barrier'),undefined);
  assert.equal(g.map.tiles[9][17],0,'os dois selos abrem a muralha');
  const save=g.serialize(),h=fresh();assert.ok(h.load(save));h.zone='eclipse';assert.equal(h.map.tiles[9][17],0,'a abertura permanece após carregar');
});

test('o Bastião exige Luvas, selos e preserva a arena aberta no save',()=>{
  const g=fresh();g.chapter=4;g.zone='bastion';g.visited.add('bastion');g.gloves=false;
  const gate=prop(g,'bastion','bastion-gate');g.player.x=gate.x;g.player.y=gate.y+30;g.interact();
  assert.ok(prop(g,'bastion','bastion-gate'),'a pedra não sai sem as Luvas');
  g.gloves=true;g.interact();assert.equal(prop(g,'bastion','bastion-gate'),undefined,'as Luvas removem a pedra da coluna');
  open(g,'bastion','bastion-seal-a');assert.ok(prop(g,'bastion','bastion-arena-barrier'));
  open(g,'bastion','bastion-seal-b');assert.equal(prop(g,'bastion','bastion-arena-barrier'),undefined);
  const save=g.serialize(),h=fresh();assert.ok(h.load(save));h.zone='bastion';assert.equal(h.map.tiles[14][23],0,'a abertura da arena permanece após carregar');
});

test('o Santuário exige dois estágios do orbe da Repulsão',()=>{
  const g=fresh();g.chapter=5;g.zone='sanctum';g.visited.add('sanctum');g.wands.add('repulse');g.wand='repulse';g.ranged='wand';g.map.enemies.forEach(e=>e.hp=0);
  const orb=prop(g,'sanctum','sanctum-orb'),a=prop(g,'sanctum','sanctum-button-a'),b=prop(g,'sanctum','sanctum-button-b');
  const shove=(dir,count)=>{for(let i=0;i<count;i++){g.player.dir=dir;g.player.x=dir==='right'?orb.x-100:dir==='down'?orb.x-6:orb.x;g.player.y=dir==='up'?orb.y+100:dir==='down'?orb.y-40:orb.y;g.wandCooldown=0;g.castWand();}};
  shove('right',11);shove('up',3);assert.equal(a.open,true,'o primeiro botão deve ser ativado');assert.equal(!!b.open,false,'o segundo botão ainda deve estar fechado');assert.ok(prop(g,'sanctum','sanctum-barrier'),'a barreira exige os dois botões');
  const saved=g.serialize(),h=fresh();assert.ok(h.load(saved));assert.equal(prop(h,'sanctum','sanctum-orb').target,'sanctum-button-b','o segundo alvo permanece após carregar');
  shove('down',4);assert.equal(b.open,true,'o segundo botão deve ser ativado');assert.equal(prop(g,'sanctum','sanctum-barrier'),undefined,'a passagem abre após a sequência completa');
});

test('o Abismo exige os alvos de vento antes da ponte',()=>{
  const g=fresh();g.chapter=6;g.zone='aerie';g.visited.add('aerie');g.wands.add('missile');g.wand='missile';g.map.enemies.forEach(e=>e.hp=0);
  const target=id=>prop(g,'aerie',id),a=target('aerie-wind-target-a'),b=target('aerie-wind-target-b'),c=target('aerie-wind-target-c');
  const fire=t=>{g.player.x=t.x-80;g.player.y=t.y;g.player.dir='right';g.wandCooldown=0;g.castWand();for(let i=0;i<180&&g.wandShots.length;i++)g.updateWandShots(1/60);};
  fire(b);assert.equal(!!b.open,false,'a ordem impede começar pelo segundo alvo');fire(a);fire(b);fire(c);assert.equal(a.open,true);assert.equal(b.open,true);assert.equal(c.open,true);g.update(1/60);assert.equal(prop(g,'aerie','aerie-bridge-16-9').open,true,'a ponte surge após alvos e combate');
});

test('a ruína astral do Norte é uma rota opcional persistente',()=>{
  const g=fresh();g.chapter=3;g.zone='north';g.visited.add('north');
  const barrier=prop(g,'north','north-ruin-barrier');assert.ok(barrier);assert.equal(reachable(g,'north',{x:c(16),y:c(43.5)},'north-crystals'),false,'a alcova não pode ser contornada');g.maps.north.props.find(p=>p.id==='north-ruin-seal-a').open=true;g.maps.north.props.find(p=>p.id==='north-ruin-seal-b').open=true;g.checkBarriers();
  assert.equal(prop(g,'north','north-ruin-barrier'),undefined,'os dois selos removem a barreira');assert.equal(g.maps.north.tiles[28][39],0,'a abertura da ruína fica transitável');assert.ok(reachable(g,'north',{x:c(16),y:c(43.5)},'north-crystals'),'a alcova fica acessível após o puzzle');const shortcut=prop(g,'north','north-ruin-shortcut');assert.ok(shortcut);g.player.x=shortcut.x-30;g.player.y=shortcut.y;g.interact();assert.equal(g.zone,'grotto','a ruína abre um atalho funcional para a Gruta da Maré');
  const h=fresh();assert.ok(h.load(g.serialize()));assert.equal(h.maps.north.tiles[28][39],0,'a abertura persiste no carregamento');
});

test('o Astrônomo transforma a ruína em missão com recompensa única',()=>{
  const g=fresh();g.chapter=3;g.zone='north';g.visited.add('north');const npc=prop(g,'north','astronomo');g.player.x=npc.x-30;g.player.y=npc.y;g.interact();assert.match(g.dialog,/dois totens|selos/i);
  g.dismissDialog();g.maps.north.props.find(p=>p.id==='north-ruin-seal-a').open=true;g.maps.north.props.find(p=>p.id==='north-ruin-seal-b').open=true;g.checkBarriers();const before=g.coins;g.player.x=npc.x-30;g.player.y=npc.y;g.interact();assert.equal(g.coins,before+25);g.dismissDialog();const saved=g.serialize(),h=fresh();assert.ok(h.load(saved));const hn=prop(h,'north','astronomo');h.player.x=hn.x-30;h.player.y=hn.y;h.interact();assert.equal(h.coins,before+25,'a recompensa não pode ser duplicada após carregar');
});

test('as Ruínas do Sol exigem maré, ordem de luz e guardião antes do coração',()=>{
  const g=fresh();g.chapter=3;g.tide=true;g.arrowKinds.add('light');g.zone='north';g.visited.add('north');const gate=prop(g,'north','north-sunken-gate');g.player.x=gate.x;g.player.y=gate.y+30;g.interact();assert.equal(g.zone,'sunken');
  const order=['sunken-seal-a','sunken-seal-b','sunken-seal-c'];const shot=id=>{const p=prop(g,'sunken',id);return g.hitTarget({x:p.x,y:p.y,kind:'light',life:1,vx:1,vy:0});};
  assert.equal(shot(order[1]),true);assert.equal(prop(g,'sunken',order[0]).open,false,'a sequência errada reinicia os selos');shot(order[0]);shot(order[1]);shot(order[2]);assert.equal(prop(g,'sunken','sunken-seal-barrier'),undefined,'os três selos abrem a passagem');
  const firstSave=g.serialize(),savedGame=fresh();assert.ok(savedGame.load(firstSave));assert.equal(prop(savedGame,'sunken',order[0]).open,true,'o primeiro selo permanece após salvar');
  const sentinel=g.map.enemies.find(e=>e.id==='sunken-sentinel');sentinel.hp=0;const heart=prop(g,'sunken','sunken-heart');g.player.x=heart.x;g.player.y=heart.y+30;g.interact();for(let i=0;i<220&&g.heartChestTimer>0;i++)g.update(1/60);assert.equal(heart.open,true);assert.equal(g.player.maxHp,7,'o coração é entregue somente após o guardião');
});

test('a Fortaleza Esquecida usa as Luvas e exige a sequência dos selos',()=>{
  const g=fresh();g.chapter=4;g.tide=true;g.zone='south';g.visited.add('south');const gate=prop(g,'south','south-fortress');g.player.x=gate.x;g.player.y=gate.y+30;g.interact();assert.equal(g.zone,'south','o portão permanece fechado sem as Luvas da Força');
  g.gloves=true;g.interact();assert.equal(g.zone,'fortress');g.dismissDialog();const shield=g.map.enemies.find(e=>e.id==='fortress-shieldknight');shield.timer=1;const shieldHp=shield.hp;g.hitEnemy(shield,1,0,1,'sword');assert.equal(shield.hp,shieldHp,'o escudo bloqueia golpes comuns durante a guarda');shield.hit=0;g.hitEnemy(shield,1,0,2,'fire');assert.equal(shield.hp,shieldHp-2,'fogo atravessa a guarda do escudeiro');const push=(rockId,plateId)=>{const rock=prop(g,'fortress',rockId),plate=prop(g,'fortress',plateId);g.player.x=plate.x;g.player.y=plate.y+84;rock.x=plate.x;rock.y=plate.y+42;g.interact();};
  push('fortress-stone-a','fortress-plate-a');assert.equal(prop(g,'fortress','fortress-plate-a').open,true,'a pedra ativa a primeira placa');push('fortress-stone-b','fortress-plate-b');push('fortress-stone-c','fortress-plate-c');assert.equal(prop(g,'fortress','fortress-seal-barrier'),undefined,'a ala leste abre após as três placas');
  const guard=g.map.enemies.find(e=>e.id==='fortress-knight');guard.hp=0;const chest=prop(g,'fortress','fortress-crystals');g.player.x=chest.x;g.player.y=chest.y+30;g.interact();assert.equal(chest.open,true,'a primeira recompensa comum fica protegida por combate');
  const warden=g.map.enemies.find(e=>e.id==='fortress-warden');warden.hp=0;const vault=prop(g,'fortress','fortress-vault');g.player.x=vault.x;g.player.y=vault.y+30;g.interact();assert.equal(vault.open,true,'o guardião da ala protege o cofre final');
});

test('o Cartógrafo transforma a Fortaleza em missão e libera um atalho persistente',()=>{
  const g=fresh();g.chapter=4;g.gloves=true;g.zone='fortress';g.visited.add('fortress');const npc=prop(g,'fortress','cartografo');const guardian=g.map.enemies.find(e=>e.id==='fortress-warden');assert.match(g.snapshot().sideObjective,/guardião|Cartógrafo/i);g.player.x=npc.x-30;g.player.y=npc.y;g.interact();assert.match(g.dialog,/guardião|atalho/i);g.dismissDialog();guardian.hp=0;const before=g.coins;g.player.x=npc.x-30;g.player.y=npc.y;g.interact();assert.equal(g.coins,before+20);assert.equal(prop(g,'fortress','fortress-shortcut-barrier'),undefined,'a missão remove a barreira do atalho');g.dismissDialog();assert.equal(g.snapshot().sideObjective,null,'a pista opcional some após liberar o atalho');const saved=g.serialize(),h=fresh();assert.ok(h.load(saved));assert.equal(prop(h,'fortress','fortress-shortcut-barrier'),undefined,'o atalho persiste após carregar');
});

test('entrar na arena registra checkpoint antes da luta',()=>{
  const g=fresh();g.chapter=6;g.zone='aerie';g.visited.add('aerie');const boss=g.maps.aerie.enemies.find(e=>e.id==='aerie-dune-warden');g.player.x=boss.x-180;g.player.y=boss.y;g.update(1/60);assert.ok(g.bossIntro>0,'a introdução cinematográfica começa');assert.equal(g.bossIntroId,'aerie-dune-warden');assert.deepEqual(g.checkpoint,{x:g.player.x,y:g.player.y});
});

test('o Núcleo dos Ventos encerra o capítulo final quando a ponte está pronta',()=>{
  const g=fresh();g.chapter=6;g.zone='aerie';g.visited.add('aerie');g.wands.add('missile');for(const p of g.map.props)if(p.id.startsWith('aerie-wind-target-')||p.id.startsWith('aerie-bridge-')){p.open=true;p.solid=false;}for(const e of g.map.enemies)e.hp=0;const core=prop(g,'aerie','aerie-core');g.player.x=core.x-30;g.player.y=core.y;g.update(1/60);assert.equal(g.finished,false);assert.equal(g.screen,'won');g.continueStory();assert.equal(g.chapter,7);assert.equal(g.zone,'aerie','sem teletransporte: o herói continua no Abismo');assert.equal(prop(g,'aerie','aerie-return').to,'south','o Abismo sai para o Deserto das Tempestades');assert.equal(prop(g,'world','world-grove-gate').minChapter<=g.chapter,true,'o Santuário das Raízes fica aberto para quem chegar a pé');
});

test('a Repulsão empurra pedras de borda que a Luva não alcança',()=>{
  const g=fresh();g.chapter=5;g.zone='sanctum';g.visited.add('sanctum');g.gloves=true;g.wands.add('repulse');g.wand='repulse';g.ranged='wand';g.map.enemies.forEach(e=>e.hp=0);
  const stone=prop(g,'sanctum','sanctum-ledge-stone'),plate=prop(g,'sanctum','sanctum-ledge-plate');
  const sx=stone.x;g.player.x=stone.x+34;g.player.y=stone.y;g.interact();assert.equal(stone.x,sx,'a Luva só empurraria a pedra para o abismo');
  assert.equal(reachable(g,'sanctum',{x:c(3),y:c(20)},'sanctum-wind-blade'),false,'a alcova começa fechada');
  for(let i=0;i<3;i++){g.player.x=c(2);g.player.y=c(17);g.player.dir='right';g.wandCooldown=0;g.castWand();}
  assert.equal(plate.open,true,'o raio leva a pedra até a placa');assert.equal(prop(g,'sanctum','sanctum-alcove-barrier'),undefined);
  assert.equal(reachable(g,'sanctum',{x:c(3),y:c(20)},'sanctum-wind-blade'),true);
  const h=fresh();g.zone='aerie';g.visited.add('aerie');g.map.enemies.forEach(e=>e.hp=0);
  for(const b of g.map.props.filter(q=>q.id.startsWith('aerie-bridge'))){b.open=true;g.map.tiles[Math.floor(b.y/32)][Math.floor(b.x/32)]=3;}g.rebuildGrid('aerie');
  const ap=prop(g,'aerie','aerie-ledge-plate');
  for(let i=0;i<3;i++){g.player.x=c(18);g.player.y=c(2);g.player.dir='right';g.wandCooldown=0;g.castWand();}
  assert.equal(ap.open,true,'da margem oeste, o raio empurra a pedra até a placa');assert.equal(prop(g,'aerie','aerie-alcove-barrier'),undefined);
});

test('relâmpago e míssil podem ser lançados sem inimigos e seguem em linha reta',()=>{
  const g=fresh();g.chapter=5;g.zone='sanctum';g.wands.add('lightning');g.wands.add('missile');g.map.enemies.forEach(e=>e.hp=0);
  for(const w of ['lightning','missile']){g.wand=w;g.player.x=c(20);g.player.y=c(21);g.player.dir='right';g.wandCooldown=0;g.castWand();assert.equal(g.wandShots.length,1);const y0=g.wandShots[0].y;g.updateWandShots(1/30);assert.ok(g.wandShots[0].x>c(20)&&g.wandShots[0].y===y0,'voa reto');g.wandShots=[];}
});

test('itens reimaginados: arco tríplice, arco rúnico, lâmina do vento, varinha das varinhas, fênix e ímã',()=>{
  const g=fresh();g.zone='world';g.map.enemies.forEach(e=>e.hp=0);g.bow=true;g.tripleBow=true;g.player.cooldown=0;g.player.dir='right';g.shoot();assert.equal(g.shots.length,3,'três flechas em leque');
  g.shots=[];g.runeBow=true;g.arrowKinds.add('fire');g.arrow='fire';g.player.cooldown=0;g.keyDown('l');assert.equal(g.shots.length,0,'segurar L carrega');g.bowCharge=1;g.keyUp('l');assert.ok(g.shots.length===3&&g.shots.every(s=>s.power),'solta um disparo carregado');
  g.shots=[];g.windBlade=true;g.player.cooldown=0;g.attack();assert.ok(g.wandShots.some(w=>w.kind==='slash'),'a espada lança um corte');
  g.wandShots=[];g.wands.add('missile');g.wand='missile';g.wandMaster=true;g.wandCooldown=0;g.castWand();assert.equal(g.wandShots.length,3,'o míssil se divide em três');
  g.phoenix=true;g.player.hp=0;g.onZeroHp();assert.equal(g.screen,'playing');assert.ok(g.player.hp>0);assert.equal(g.phoenix,false);
  const save=g.serialize(),h=fresh();assert.ok(h.load(save));assert.equal(h.tripleBow,true);assert.equal(h.wandMaster,true);assert.deepEqual(h.snapshot().relics.slice(0,2),['Arco Tríplice','Arco Rúnico']);
  assert.equal(h.load(save.replace('"v":7','"v":6')),false,'saves antigos são descartados');
});

test('portais exigem os itens da região anterior e têm atalhos',()=>{
  const g=fresh();g.chapter=4;g.zone='south';g.visited.add('south');const gate=prop(g,'south','south-bastion');
  g.player.x=gate.x;g.player.y=gate.y+30;g.interact();assert.equal(g.zone,'south','sem a Varinha do Relâmpago a entrada fica selada');assert.equal(g.missingNeed(gate),'wand-lightning');
  g.wands.add('lightning');g.interact();assert.equal(g.zone,'bastion','com a varinha do Eclipse a entrada abre');
  const h=fresh();h.chapter=3;h.zone='world';const road=prop(h,'world','world-south-gate');h.player.x=road.x;h.player.y=road.y-30;h.interact();assert.equal(h.zone,'world','a Estrada do Sul exige a Onda Arcana');h.tide=true;h.interact();assert.equal(h.zone,'south','a Estrada do Sul liga o Vale às Terras do Sul');
});

test('chefes têm armadura, fraqueza, fases e podem ser derrotados em luta simulada',async()=>{
  const {fight}=await import('./bossfight.mjs');
  const g=fresh();g.chapter=1;g.zone='temple';const boss=g.map.enemies.find(e=>e.id==='guardian');const hp=boss.hp;
  g.hitEnemy(boss,0,1,3,'sword');assert.equal(boss.hp,hp,'a espada é bloqueada pela armadura');
  g.hitEnemy(boss,0,1,2,'fire');assert.ok(boss.stun>0,'a Flecha de Fogo o atordoa');assert.ok(boss.hp<hp);
  for(const [z,id,s] of [['temple','guardian',g=>{g.chapter=1;g.bossKey=true;}],['eclipse','eclipse-warden',g=>{g.chapter=3;}],['sanctum','sanctum-warden',g=>{g.chapter=5;}],['aerie','aerie-dune-warden',g=>{g.chapter=6;}],['fortress','fortress-warden',g=>{g.chapter=4;g.gloves=true;}]]){
    const r=fight(z,id,s,200);assert.ok(r.won,`${id} pode ser derrotado`);assert.ok(r.intro,`${id} tem introdução`);assert.ok(r.phases.length>=2,`${id} muda de fase`);assert.ok(r.stuns>=1,`${id} tem janela de atordoamento`);}
});

test('afinidades elementais: fraquezas, resistências e imunidades',()=>{
  const g=fresh();g.zone='world';const mk=k=>{const e={id:'t-'+k,kind:k,x:g.player.x+40,y:g.player.y,hp:10,maxHp:10,timer:0,hit:0,bossHitUntil:0,homeX:0,homeY:0,vx:0,vy:0,flash:0,dying:0,frozen:0};g.map.enemies.push(e);return e;};
  const wolf=mk('frostwolf');g.hitEnemy(wolf,1,0,2,'fire');assert.equal(wolf.hp,6,'lobo de gelo é fraco a fogo');
  const sal=mk('salamander');g.hitEnemy(sal,1,0,2,'fire');assert.equal(sal.hp,10,'salamandra é imune a fogo');
  const shade=mk('shade');shade.timer=2;g.hitEnemy(shade,1,0,2,'sword');assert.equal(shade.hp,9,'espírito resiste à espada');
});

test('o desenho real roda sem erros em todas as zonas e estados de chefe',async()=>{const {drawSmoke}=await import('./drawsmoke.mjs');assert.equal(drawSmoke(),true);});

test('Ataque Giratório: bloqueado no início, conquistado na Câmara do Eco e salvo',async()=>{
  const {runSpinQuest}=await import('./spinquest.mjs');
  const g=fresh();
  g.keyDown('j');for(let i=0;i<60;i++)g.update(1/60);assert.equal(g.player.charge,0,'sem a técnica a espada não carrega');g.keyUp('j');assert.equal(g.player.spin,0);
  assert.match(g.sideObjective??'',/Eremita da Neve/,'o diário aponta para o Eremita');
  assert.equal(runSpinQuest(g),true);
  for(let i=0;i<400&&g.spinReveal>0;i++){g.update(1/60);assert.equal(g.zone,'dojo');}
  assert.match(g.dialogTitle,/Nova habilidade desbloqueada/);g.dismissDialog();
  assert.equal(g.sideObjective,null,'a missão foi concluída');
  const chest=prop(g,'dojo','dojo-scroll');assert.equal(chest.open,true);
  const g2=makeGame(Adventure);g2.start();assert.equal(g2.load(g.serialize()),true);
  assert.equal(g2.spinUnlocked,true,'o desbloqueio fica no save');assert.equal(prop(g2,'dojo','dojo-scroll').open,true,'o baú continua aberto');
  g2.zone='dojo';g2.player.x=chest.x;g2.player.y=chest.y+30;g2.interact();assert.equal(g2.spinReveal,0,'o pergaminho não é coletado de novo');
});
test('o giro causa a espada +2, acerta em volta e não atravessa paredes',()=>{
  const g=fresh();g.spinUnlocked=true;g.changeZone('dojo',5,14.3);g.dismissDialog();const P=g.player;
  const [a,b,...rest]=g.map.enemies;rest.forEach(e=>e.hp=0);for(const e of [a,b]){e.hp=e.maxHp=99;e.hit=0;}
  a.x=P.x;a.y=c(12);b.x=P.x+60;b.y=P.y+10;assert.equal(g.clearLine(P.x,P.y-8,a.x,a.y-8),false,'a parede bloqueia a linha');
  g.spinAttack();assert.equal(99-a.hp,0,'inimigo atrás da parede não é atingido');assert.equal(99-b.hp,g.swordPower+2,'giro = espada +2');
  P.spin=0;g.spinUnlocked=false;g.spinAttack();assert.equal(P.spin,0,'sem a técnica não há giro');
});
test('Tempestade Ancestral: puzzle de três alvos, recompensa e golpe evoluído persistem',()=>{
  const g=fresh();g.chapter=3;g.spinUnlocked=true;g.visited.add('dojo');g.zone='dojo';
  const P=g.player;P.x=c(14);P.y=c(9);P.dir='down';
  assert.ok(prop(g,'dojo','dojo-ascension-barrier'),'o selo da prova existe');
  g.spinAttack();
  assert.equal(prop(g,'dojo','dojo-asc-target-a').open,true,'o giro acerta o alvo esquerdo');
  assert.equal(prop(g,'dojo','dojo-asc-target-b').open,true,'o giro acerta o alvo central');
  assert.equal(prop(g,'dojo','dojo-asc-target-c').open,true,'o giro acerta o alvo direito');
  assert.equal(prop(g,'dojo','dojo-ascension-barrier'),undefined,'um único giro remove o selo');
  const chest=prop(g,'dojo','dojo-ascension-chest');assert.ok(chest);
  P.x=chest.x;P.y=chest.y+30;g.interact();
  assert.equal(g.spinMasterUnlocked,true,'a recompensa desbloqueia a evolução');
  assert.match(g.dialogTitle,/Tempestade Ancestral/);
  const g2=makeGame(Adventure);g2.start();assert.equal(g2.load(g.serialize()),true);
  assert.equal(g2.spinMasterUnlocked,true,'a evolução permanece no save');
  const e=g2.map.enemies[0];e.hp=e.maxHp=99;e.hit=0;
  g2.spinAttack(true);
  assert.equal(99-e.hp,g2.swordPower+5,'a Tempestade causa espada +5');
  assert.equal(g2.player.spin,.72,'a animação do golpe evoluído tem duração maior');
});
test('a forja da espada vale uma vez: +1 de ataque por 250 cristais, depois esgota',()=>{
  const g=fresh();g.coins=1000;g.openShop();const before=g.swordPower;g.buy('sword');assert.equal(g.swordPower,before+1);assert.equal(g.coins,750);
  g.buy('sword');assert.equal(g.coins,750,'segunda compra recusada');assert.equal(g.soldOut('sword'),true);
  g.sword=3;assert.equal(g.swordPower,4,'a forja continua valendo com a Espada Lunar');
  const g2=makeGame(Adventure);g2.start();g2.load(g.serialize());assert.equal(g2.forged,true);
});
test('o mapa em tela cheia pausa a ação e fecha pelo mesmo comando',()=>{
  const g=fresh();g.toggleMap();assert.equal(g.mapOpen,true);const x=g.player.x;g.keys.add('d');g.update(1/60);assert.equal(g.player.x,x,'com o mapa aberto o herói não se move');
  g.keyDown('n');assert.equal(g.mapOpen,false);g.keyUp('n');g.keyDown('n');assert.equal(g.mapOpen,true);g.toggleMap(false);assert.equal(g.mapOpen,false);
});
test('portões e barreiras explicam exatamente o que falta',()=>{
  const g=fresh();g.zone='world';const gate=prop(g,'world','echo-gate');g.player.x=gate.x;g.player.y=gate.y+40;
  assert.match(g.hint,/Norte → Leste → Sul → Oeste/);
  g.zone='dojo';const bar=prop(g,'dojo','dojo-rune-barrier');assert.match(g.barrierHint(bar,true),/Lua → Estrela → Sol → Vento/);
  const north=prop(g,'world','north-gate');g.zone='world';g.maps.world.props=[north];g.rebuildGrid('world');g.player.x=north.x;g.player.y=north.y+40;g.interact();assert.match(g.notice,/Relíquia Lunar/);
});
test('depois do final dá para continuar explorando e achar as missões opcionais',()=>{
  const g=fresh();g.chapter=7;g.finished=true;g.screen='won';assert.match(g.sideObjective??'',/Eremita/,'a missão opcional continua visível depois do final');
  g.keepExploring();assert.equal(g.screen,'playing');assert.equal(g.finished,true);g.update(1/60);assert.equal(g.screen,'playing','o final não se repete sozinho');
});
test('barreiras de totens e tochas bloqueiam de verdade (Bastião e Raízes)',()=>{
  for(const boots of [false,true]){
    let g=fresh();g.boots=boots;g.zone='bastion';g.map.props=g.map.props.filter(p=>p.id!=='bastion-gate');g.rebuildGrid('bastion');
    assert.equal(reach(g,{x:c(20),y:c(13)}).has(c(30),c(14),40),false,'a arena da Besta só abre com os dois selos');
    g=fresh();g.boots=boots;g.zone='grove';const core=prop(g,'grove','grove-core');
    assert.equal(reach(g,{x:c(5),y:c(22)}).has(core.x,core.y,56),false,'o coração da selva só abre com as duas tochas');
    for(const id of ['grove-torch-a','grove-torch-b']){const q=prop(g,'grove',id);q.open=true;q.solid=false;}g.checkBarriers();
    assert.equal(reach(g,{x:c(5),y:c(22)}).has(core.x,core.y,56),true);
  }
});
test('o Mercador Errante surge depois de dois chefes e vende um coração por 2000 cristais, uma vez',()=>{
  const g=fresh();g.zone='north';const m=prop(g,'north','mercador');assert.ok(m);g.player.x=m.x;g.player.y=m.y+30;
  g.chapter=2;assert.notEqual(g.nearProp()?.id,'mercador','antes dos dois chefes ele não aparece');
  g.chapter=3;assert.equal(g.nearProp()?.id,'mercador');g.interact();assert.equal(g.shopOpen,true);assert.equal(g.shopKind,'merchant');
  g.coins=1999;g.buy('bigheart');assert.equal(g.merchantHeart,false,'faltam cristais');
  g.coins=2500;const hp=g.player.maxHp;g.buy('bigheart');assert.equal(g.player.maxHp,hp+1);assert.equal(g.coins,500);
  g.buy('bigheart');assert.equal(g.coins,500,'compra única');assert.equal(g.soldOut('bigheart'),true);
  const h=makeGame(Adventure);h.start();h.load(g.serialize());assert.equal(h.merchantHeart,true);
});
test('Caverna da Luz abre depois do segundo chefe; Caverna Submersa (Arco Tríplice) só com a Onda Arcana',()=>{
  const g=fresh();g.zone='north';const lc=prop(g,'north','north-lightcave'),tc=prop(g,'north','north-tidecave');
  assert.ok(reachable(g,'north',{x:c(16),y:c(43.5)},'north-lightcave'),'a Caverna da Luz é alcançável a pé');
  g.chapter=2;g.zone='north';g.player.x=lc.x;g.player.y=lc.y+40;g.interact();assert.equal(g.zone,'north','fechada antes do segundo chefe');
  g.chapter=3;g.interact();assert.equal(g.zone,'lightcave','abre no capítulo 3, sem a Onda Arcana');
  assert.equal(reachable(g,'lightcave',{x:c(13),y:c(14.6)},'lightcave-light'),false,'o selo astral bloqueia o baú');
  const lightOrder=['lightcave-rune-sun','lightcave-rune-moon','lightcave-rune-star'];
  g.zone='lightcave';g.touchLightRune(prop(g,'lightcave',lightOrder[1]));assert.equal(prop(g,'lightcave',lightOrder[0]).open,false,'ordem errada reinicia os símbolos');
  for(const id of lightOrder)g.touchLightRune(prop(g,'lightcave',id));
  assert.equal(prop(g,'lightcave','lightcave-seal'),undefined,'Sol, Lua e Estrela removem o selo');
  assert.ok(reachable(g,'lightcave',{x:c(13),y:c(14.6)},'lightcave-light'),'o baú fica alcançável depois do puzzle');
  const light=prop(g,'lightcave','lightcave-light');assert.equal(light.item,'light');
  g.zone='north';g.player.x=tc.x;g.player.y=tc.y+40;g.interact();assert.equal(g.zone,'north','a Caverna Submersa exige a Onda Arcana');
  g.tide=true;g.interact();assert.equal(g.zone,'tidecave');
  assert.equal(reachable(g,'tidecave',{x:c(4),y:c(15.6)},'tidecave-triple-bow'),false,'o selo das marés bloqueia o cofre');
  const tideOrder=['tidecave-rune-low','tidecave-rune-current','tidecave-rune-high'];
  g.zone='tidecave';g.touchTideRune(prop(g,'tidecave',tideOrder[1]));assert.equal(prop(g,'tidecave',tideOrder[0]).open,false,'ordem errada reinicia a sequência');
  for(const id of tideOrder)g.touchTideRune(prop(g,'tidecave',id));
  assert.equal(prop(g,'tidecave','tidecave-bow-seal'),undefined,'as três marés removem o selo');
  assert.ok(reachable(g,'tidecave',{x:c(4),y:c(15.6)},'tidecave-triple-bow'),'o cofre fica alcançável após o puzzle');
  assert.equal(ZONES.flatMap(z=>g.maps[z].props).filter(p=>p.item==='triple-bow').length,1,'só existe um Arco Tríplice');
  assert.equal(prop(g,'tidecave','tidecave-triple-bow').item,'triple-bow');
});
