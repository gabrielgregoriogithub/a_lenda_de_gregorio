// Simula lutas reais contra os chefes rodando o loop do motor (g.update) com um "jogador" automático simples.
import './env.mjs';
import {Adventure} from '../lib/adventure.ts';
import {makeGame} from './env.mjs';
import {bossDef} from '../lib/bosses.ts';
const dirTo=(dx,dy)=>Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up');
export function fight(zone,id,setup,maxSeconds=240){
  const g=makeGame(Adventure);g.cheats.life=true;g.start();g.dismissDialog();setup(g);g.zone=zone;g.visited.add(zone);
  const e=g.map.enemies.find(q=>q.id===id);for(const q of g.map.enemies)if(q!==e)q.hp=0;
  const def=bossDef(e);const log={phases:new Set([0]),stuns:0,weakStuns:0,blocked:0,intro:false,states:new Set()};
  // aproxima o jogador
  {let best=null;for(let r=150;r<=230&&!best;r+=20)for(let i=0;i<16&&!best;i++){const a=i*Math.PI/8,x=e.x+Math.cos(a)*r,y=e.y+Math.sin(a)*r;if(!g.collides(x,y,9))best=[x,y];}g.player.x=best[0];g.player.y=best[1];}
  if(zone==='temple'){g.player.x=e.x;g.player.y=e.y+120;}
  let t=0;const dt=1/60;let lastStun=0;
  while(t<maxSeconds&&e.hp>0){t+=dt;if(g.dialog)g.dismissDialog();g.update(dt);if(g.bossIntro>0)log.intro=true;
    log.phases.add(e.phase??0);log.states.add(e.st);if(e.stun>0&&lastStun<=0){log.stuns++;}lastStun=e.stun??0;
    const p=g.player,dx=e.x-p.x,dy=e.y-p.y,d=Math.hypot(dx,dy);p.dir=dirTo(dx,dy);
    const open=e.kind!=='boss'||e.stun>0||e.st==='recover';
    if(open&&d<70){g.attack();}
    else if(p.cooldown<=0&&Math.random()<.03){ // usa a fraqueza à distância
      const w=def.weak[0];if(['fire','ice','light'].includes(w)){g.bow=true;g.arrowKinds.add(w);g.arrow=w;g.shoot();}
      else{g.wands.add(w);g.wand=w;g.castWand();}}
    else if(open&&d>=70){const k=Math.min(d-50,3);if(!g.collides(p.x+dx/d*k,p.y,9))p.x+=dx/d*k;if(!g.collides(p.x,p.y+dy/d*k,9))p.y+=dy/d*k;}
    else if(d<120){const k=2;if(!g.collides(p.x-dx/d*k,p.y,9))p.x-=dx/d*k;if(!g.collides(p.x,p.y-dy/d*k,9))p.y-=dy/d*k;}
    if(!Number.isFinite(e.x+e.y))throw new Error(id+': posição inválida');}
  if(process.env.DBG)console.log('fim',e.x/32,e.y/32,g.player.x/32,g.player.y/32,e.hp,e.st);
  return {id,won:e.hp<=0,seconds:+t.toFixed(1),phases:[...log.phases],stuns:log.stuns,intro:log.intro,states:[...log.states].join(',')};
}
if(process.argv[1]?.endsWith('bossfight.mjs')){
  const all=[['temple','guardian',g=>{g.chapter=1;g.bossKey=true;}],['eclipse','eclipse-warden',g=>{g.chapter=3;}],['sanctum','sanctum-warden',g=>{g.chapter=5;}],['aerie','aerie-dune-warden',g=>{g.chapter=6;}],['fortress','fortress-warden',g=>{g.chapter=4;g.gloves=true;}],['grotto','tidewarden',g=>{g.chapter=2;}],['bastion','litorea-beast',g=>{g.chapter=4;}],['grove','grove-heartwarden',g=>{g.chapter=7;}]];
  for(const [z,id,s] of all)console.log(JSON.stringify(fight(z,id,s)));
}
