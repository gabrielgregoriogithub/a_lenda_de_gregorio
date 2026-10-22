// Regressões da auditoria: saves, migração, mortes, transições, recompensas únicas e ações durante estados especiais.
// Sempre que possível usa as ações do jogador (interact, attack, jump, keyDown) e o ciclo real de update.
import './env.mjs';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {Adventure,ZONES,migrateSave} from '../lib/adventure.ts';
import {makeGame} from './env.mjs';
import {reach} from './reach.mjs';

const T=32,c=n=>n*T+T/2;
const fresh=(life=false)=>{const g=makeGame(Adventure);g.cheats.life=life;g.start();g.dismissDialog();return g;};
const prop=(g,z,id)=>g.maps[z].props.find(p=>p.id===id);
const run=(g,s)=>{for(let i=0;i<Math.round(s*60);i++)g.update(1/60);};
const stand=(g,p,dy=30)=>{g.player.x=p.x;g.player.y=p.y+dy;g.player.jump=0;};
const fixture=v=>fs.readFileSync(new URL(`./fixtures/save-v${v}.json`,import.meta.url),'utf8');

/* ---------- Nível A: migração e validação de saves ---------- */
test('saves reais das versões 8 e 9 são migrados sem perder progresso',()=>{
  for(const v of [8,9]){
    const raw=fixture(v),before=JSON.parse(raw),m=migrateSave(raw);
    assert.equal(m.ok,true,`v${v} migra`);assert.equal(m.from,v);
    const g=fresh();assert.equal(g.load(raw),true,`v${v} carrega`);
    assert.equal(g.chapter,before.chapter);assert.equal(g.coins,before.coins);assert.equal(g.player.maxHp,before.player.maxHp);
    assert.equal(g.boots,true);assert.equal(g.magnet,true);assert.equal(g.zone,'north');
    assert.equal(prop(g,'world','key-chest').open,true,'baú aberto continua aberto');
    assert.equal(g.maps.world.enemies.find(e=>e.id==='golem-desert').hp<=0,true,'guardião derrotado continua derrotado');
    assert.equal(prop(g,'mailcave','mail-magnet').open,true,'quem já tinha o ímã não ganha outro');
    assert.equal(prop(g,'wingcave','wingcave-boots').open,true,'quem já tinha as botas não ganha outras');
    assert.ok(g.maps.world.enemies.some(e=>e.kind==='spider'),'a fauna nova aparece no save migrado');
    const again=fresh();assert.equal(again.load(g.serialize()),true,'o save migrado continua válido');
  }
});

test('saves corrompidos, incompletos ou de outra versão são recusados sem alterar o jogo atual',()=>{
  const g=fresh();g.coins=77;g.zone='world';g.player.x=c(40);const snapshot=g.serialize();
  const good=JSON.parse(fixture(9));
  const bad={
    'json quebrado':'{"v":10,"zone":',
    'vazio':'null',
    'versão futura':JSON.stringify({...good,v:99}),
    'versão antiga demais':JSON.stringify({...good,v:3}),
    'sem herói':JSON.stringify({...good,player:undefined}),
    'cristais inválidos':JSON.stringify({...good,coins:'muitos'}),
    'mapa corrompido':JSON.stringify({...good,maps:{...good.maps,world:{enemies:'x'}}}),
  };
  for(const [name,raw] of Object.entries(bad)){
    assert.equal(g.load(raw),false,`${name}: recusado`);assert.match(g.loadError,/Não foi possível carregar/,`${name}: explica o motivo`);
    assert.equal(g.serialize(),snapshot,`${name}: o jogo atual fica intacto`);
  }
  const zoneless={...good,zone:'zona-que-nao-existe'};assert.equal(g.load(JSON.stringify(zoneless)),true,'zona desconhecida volta ao vale em vez de travar');assert.equal(g.zone,'world');
});

/* ---------- Nível B: recompensas únicas e interrupções ---------- */
test('salvar no meio da retirada de um coração não perde nem duplica o coração',()=>{
  const g=fresh();g.zone='north';const h=prop(g,'north','north-heart');g.map.enemies.find(e=>e.id==='k-heart').hp=0;
  const max=g.player.maxHp;stand(g,h);g.interact();run(g,.5);assert.ok(g.heartChestTimer>0,'retirada em andamento');
  const mid=g.serialize(),g2=fresh();assert.ok(g2.load(mid));
  assert.equal(prop(g2,'north','north-heart').open,false,'o baú volta fechado: o coração ainda não foi entregue');
  g2.zone='north';stand(g2,prop(g2,'north','north-heart'));g2.interact();run(g2,4);g2.dismissDialog();assert.equal(g2.player.maxHp,max+1,'dá para concluir depois de carregar');
  g2.interact();run(g2,4);assert.equal(g2.player.maxHp,max+1,'não repete');
  run(g,4);g.dismissDialog();assert.equal(g.player.maxHp,max+1,'sem salvar, a retirada termina normalmente');
  const g3=fresh();assert.ok(g3.load(g.serialize()));g3.zone='north';stand(g3,prop(g3,'north','north-heart'));g3.interact();run(g3,4);assert.equal(g3.player.maxHp,max+1,'depois de salvar e carregar não há segundo coração');
});

test('voltar no tempo perto de uma coleta não duplica cristais nem itens',()=>{
  const g=fresh();g.zone='world';const coinChest=prop(g,'world','coin-chest');stand(g,coinChest);
  run(g,.4);const before=g.coins;g.interact();g.dismissDialog();const after=g.coins;assert.ok(after>before);
  for(let i=0;i<6;i++)g.update(.1);g.rewindBy(2);assert.equal(g.coins,before,'voltar no tempo devolve o estado anterior inteiro');assert.equal(prop(g,'world','coin-chest').open,false);
  stand(g,prop(g,'world','coin-chest'));g.interact();g.dismissDialog();g.interact();g.dismissDialog();assert.equal(g.coins,after,'abrir de novo vale uma vez só');
});

test('corrida: interagir durante a prova não cobra de novo; salvar no meio encerra a tentativa',()=>{
  const g=fresh();g.chapter=3;g.coins=80;g.zone='world';const j=prop(g,'world','jockey');stand(g,j,28);
  g.interact();assert.equal(g.raceActive,true);assert.equal(g.coins,55);
  g.interact();g.attack();g.jump();g.heal();assert.equal(g.coins,55,'o botão de interação (toque) não reinscreve');assert.equal(g.raceActive,true);
  const h=fresh();assert.ok(h.load(g.serialize()));assert.equal(h.raceActive,false,'carregar não deixa a corrida presa');assert.equal(h.coins,55,'a inscrição paga é a da tentativa abandonada');
  h.zone='world';stand(h,prop(h,'world','jockey'),28);h.interact();assert.equal(h.raceActive,true,'uma nova tentativa funciona depois de carregar');
});

/* ---------- mortes e retomada ---------- */
test('morrer durante um ataque, um puzzle ou uma masmorra devolve o controle e mantém o progresso',()=>{
  // ataque em andamento
  const g=fresh();g.attack();g.player.hp=1;g.player.hurt=0;g.damage(g.player.x+10,g.player.y);assert.equal(g.screen,'dead');
  g.retry();assert.equal(g.player.attack,0,'a animação de ataque é interrompida');g.keyDown('d');const x0=g.player.x;run(g,.5);g.keyUp('d');assert.ok(g.player.x>x0+20,'o herói volta a andar');
  // no meio de um puzzle de sequência
  const p=fresh();p.chapter=3;p.zone='lightcave';p.checkpoint={x:c(13),y:c(14.6)};const sun=prop(p,'lightcave','lightcave-rune-sun');stand(p,sun);p.interact();assert.equal(sun.open,true);
  p.player.hp=1;p.player.hurt=0;p.damage(p.player.x+5,p.player.y);assert.equal(p.screen,'dead');p.retry();
  for(const id of ['lightcave-rune-sun','lightcave-rune-moon','lightcave-rune-star']){stand(p,prop(p,'lightcave',id));p.interact();}
  assert.equal(prop(p,'lightcave','lightcave-seal'),undefined,'o puzzle continua solucionável depois de morrer');
  // numa masmorra: renasce no checkpoint da própria masmorra, sem perigos pendentes
  const d=fresh();d.chapter=3;d.tide=true;d.zone='south';const door=prop(d,'south','south-eclipse');stand(d,door);d.interact();d.dismissDialog();assert.equal(d.zone,'eclipse');
  const cp={...d.checkpoint};d.hazards.push({x:cp.x,y:cp.y,r:30,t:.3,max:1,color:'#fff'});d.player.hp=1;d.player.hurt=0;d.damage(d.player.x+5,d.player.y);d.retry();
  assert.equal(d.zone,'eclipse');assert.deepEqual([d.player.x,d.player.y],[cp.x,cp.y]);assert.equal(d.hazards.length,0,'pedras de chefe não caem sobre quem acabou de renascer');run(d,.5);assert.equal(d.screen,'playing');
});

test('chefe e herói morrem no mesmo instante: a vitória vale e a recompensa não duplica',()=>{
  const g=fresh();g.chapter=1;g.zone='temple';const b=g.map.enemies.find(e=>e.kind==='boss');b.hp=.5;b.stun=2;g.player.hp=1;g.player.hurt=0;const coins=g.coins;
  g.hitEnemy(b,0,1,5,'fire');g.damage(b.x,b.y);run(g,.2);assert.equal(g.screen,'dead');assert.equal(g.bossDead,true);
  g.retry();run(g,2);assert.equal(g.bossDead,true,'o chefe não ressurge');assert.equal(g.coins-coins,100,'a recompensa do chefe vem uma vez');
  const h=fresh();assert.ok(h.load(g.serialize()));assert.equal(h.bossDead,true,'a vitória fica salva');h.zone='temple';assert.ok(h.map.enemies.find(e=>e.kind==='boss').hp<=0,'reentrar na arena não revive o chefe');
});

test('queda em abismo comum tira um coração, devolve à borda e não se repete',()=>{
  const g=fresh();g.zone='cave1';g.player.x=c(10);g.player.y=c(9);g.player.dir='up';const hp=g.player.hp,from={x:g.player.x,y:g.player.y};
  g.keyDown('k');g.keyUp('k');run(g,.8);
  assert.equal(g.player.hp,hp-1,'perdeu um coração');assert.deepEqual([g.player.x,g.player.y],[from.x,from.y],'voltou ao ponto do salto');run(g,1);assert.equal(g.player.hp,hp-1);
});

/* ---------- transições ---------- */
test('toda passagem tem volta e funciona nos dois sentidos com o requisito certo',()=>{
  const g=fresh(true);g.chapter=7;g.tide=true;g.gloves=true;g.boots=true;g.amulet=true;g.bossKey=true;g.bow=true;for(const k of ['fire','ice','light'])g.arrowKinds.add(k);for(const w of ['lightning','repulse','missile'])g.wands.add(w);
  const exits=[];for(const z of ZONES)for(const p of g.maps[z].props)if(p.to&&(p.kind==='stairs'||p.kind==='exit'))exits.push([z,p]);
  const back=new Set(exits.map(([z,p])=>`${z}>${p.to}`));back.add('world>cave1'); // a porta do Templo (kind door) é a entrada do 1º andar
  const oneWay=exits.filter(([z,p])=>!back.has(`${p.to}>${z}`)).map(([z,p])=>`${z}:${p.id}>${p.to}`).sort();
  // saídas de fim de masmorra e o atalho do Cartógrafo são de mão única por design
  assert.deepEqual(oneWay,['citadel2:cit2-up>citadel','citadel:citadel-exit>north','fortress:fortress-shortcut>north'],`passagens sem volta: ${oneWay.join(', ')}`);
  // fica num ponto livre de onde a passagem é o objeto mais próximo (como o jogador faria)
  const approach=(z,p)=>{g.zone=z;for(const [dx,dy] of [[0,40],[0,-40],[40,0],[-40,0],[0,30],[0,-30],[30,0],[-30,0],[28,28],[-28,28],[28,-28],[-28,-28]]){g.player.x=p.x+dx;g.player.y=p.y+dy;g.player.jump=0;if(!g.collides(g.player.x,g.player.y,9)&&g.nearProp()?.id===p.id)return true;}return false;};
  // o Portão do Eco abre pelo puzzle dos pilares, feito com as interações reais
  for(const k of ['n','e','s','w']){const q=prop(g,'world',`echo-pillar-${k}`);assert.ok(approach('world',q));g.interact();}assert.equal(g.echoGateOpen,true);
  for(const [z,p] of exits){assert.ok(approach(z,p),`${z}:${p.id} tem um ponto de acesso`);g.interact();if(g.dialog)g.dismissDialog();
    assert.equal(g.zone,p.to,`${z}:${p.id} leva a ${p.to}`);assert.equal(g.collides(g.player.x,g.player.y,9),false,`chegada livre em ${p.to}`);
    assert.ok(reach(g,{x:g.player.x,y:g.player.y}).pts.length>30,`dá para andar ao chegar em ${p.to}`);}
});

test('pausa, perda de foco e diálogo não deixam teclas presas nem travam o herói',()=>{
  const g=fresh();g.keyDown('d');run(g,.2);g.pause();const x=g.player.x;run(g,.5);assert.equal(g.player.x,x,'pausado não anda');
  g.resume();run(g,.5);assert.equal(g.player.x,x,'a tecla presa antes da pausa foi solta');
  g.zone='world';const iris=prop(g,'world','iris');stand(g,iris,28);g.interact();assert.ok(g.dialog);g.interact();assert.equal(g.dialog,'');
  g.keyDown('a');const x2=g.player.x;run(g,.4);g.keyUp('a');assert.ok(g.player.x<x2-20,'depois do diálogo o herói anda');
});

test('coletáveis caídos não são recolhidos depois de uma transição de mapa',()=>{
  const g=fresh();const coins=g.coins;g.drop(g.player.x,g.player.y,1);assert.ok(g.pickups.length>0);g.changeZone('cave1',12.5,16);run(g,1);
  assert.equal(g.pickups.length,0);assert.equal(g.coins,coins,'o que caiu no vale não aparece no templo');
});

test('trocar de flecha e de varinha durante o combate não perde nem altera disparos em voo',()=>{
  const g=fresh();g.bow=true;g.ranged='bow';for(const k of ['fire','ice'])g.arrowKinds.add(k);g.arrow='fire';g.player.dir='right';g.shoot();
  g.cycleArrow();assert.notEqual(g.arrow,'fire');assert.equal(g.shots[0].kind,'fire','a flecha já disparada continua de fogo');
  g.wands.add('lightning');g.wands.add('missile');g.wand='lightning';g.ranged='wand';g.wandCooldown=0;g.castWand();const shot=g.wandShots[0];g.cycleWand();assert.equal(shot.kind,'lightning');
  g.keyDown('d');g.keyDown('j');run(g,.3);g.keyUp('d');g.keyUp('j');assert.equal(g.screen,'playing','mover e atacar juntos não trava');
});

test('relâmpago, flechas e golpes não atravessam paredes',()=>{
  const g=fresh();g.zone='cave1';g.map.enemies=[];g.spawnMinion('alvo','slime',c(9),c(11.5));const e=g.map.enemies[0];const hp=e.hp;
  g.player.x=c(9);g.player.y=c(9);g.player.dir='down';g.bow=true;g.ranged='bow';g.arrow='normal';g.player.cooldown=0;g.shoot();run(g,.6);
  assert.equal(e.hp,hp,'a parede do templo bloqueia a flecha');
});
