// Percorre uma side quest de relíquia com o motor real: entrada, ordem errada, sequência, selo, guardiões e baú.
import {reach,canShoot} from './reach.mjs';
const T=32,c=n=>n*T+T/2;
const prop=(g,z,id)=>g.maps[z].props.find(p=>p.id===id);
const nearest=(pts,x,y,r)=>{let best=null,bd=r;for(const p of pts){const d=Math.hypot(p[0]-x,p[1]-y);if(d<bd){bd=d;best=p;}}return best;};
export function equip(g,q){
  g.bow=true;for(const k of ['fire','ice','light'])g.arrowKinds.add(k);for(const w of ['lightning','missile','repulse'])g.wands.add(w);
  g.chapter=Math.max(g.chapter,q.door.minChapter??1);
}
export function has(g,item){return item==='magnet'?g.magnet:item==='cloak'?g.echoCloak:item==='armor'?g.armor:item==='rune-bow'?g.runeBow:item==='wind-blade'?g.windBlade:g.wandMaster;}
// Ativa um marco pelo meio exigido (toque, flecha ou varinha), partindo de um ponto alcançável.
export function activate(g,q,id,start){
  const p=prop(g,q.zone,id),i=q.seq.ids.indexOf(id),via=q.seq.via[i],r=reach(g,start);
  if(via==='touch'){const s=nearest(r.pts,p.x,p.y,56);if(!s)throw new Error(`${id} inalcançável`);g.player.x=s[0];g.player.y=s[1];g.player.jump=0;g.interact();if(g.dialog)g.dismissDialog();return;}
  const s=canShoot(g,r,p);if(!s)throw new Error(`${id} sem linha de tiro`);
  g.player.x=s[0];g.player.y=s[1];g.player.dir=s[2]?(s[2]>0?'right':'left'):(s[3]>0?'down':'up');g.player.cooldown=0;
  if(via==='lightning'||via==='missile'||via==='repulse'){g.wand=via;g.ranged='wand';g.wandCooldown=0;g.castWand();for(let k=0;k<150;k++)g.updateWandShots(1/60);}
  else{g.ranged='bow';g.arrow=via;g.shoot();for(let k=0;k<80;k++)g.updateShots(1/60);}
}
export function runQuest(g,q){
  const out={};
  equip(g,q);g.zone=q.from;const door=prop(g,q.from,q.door.id);
  g.player.x=door.x;g.player.y=door.y+40;g.interact();if(g.dialog)g.dismissDialog();
  out.entered=g.zone===q.zone;if(!out.entered)return out;
  const start={x:c(q.arrive.x),y:c(q.arrive.y)},chest=prop(g,q.zone,q.chest);
  out.chestBlockedBefore=!reach(g,start).has(chest.x,chest.y,56);
  // ordem errada: o segundo marco antes do primeiro apaga a sequência
  activate(g,q,q.seq.ids[0],start);activate(g,q,q.seq.ids[2],start);
  out.wrongOrderResets=!prop(g,q.zone,q.seq.ids[0]).open;
  for(const id of q.seq.ids)activate(g,q,id,start);
  out.sealOpen=!prop(g,q.zone,q.seal);
  out.chestReachable=reach(g,start).has(chest.x,chest.y,56);
  const spot=nearest(reach(g,start).pts,chest.x,chest.y,56);g.player.x=spot[0];g.player.y=spot[1];g.interact();
  out.guardedWhileAlive=!chest.open&&!has(g,q.item);
  for(const id of q.guards){const e=g.map.enemies.find(e=>e.id===id);if(e)e.hp=0;}
  g.interact();if(g.dialog)g.dismissDialog();
  out.rewarded=has(g,q.item)&&!!chest.open;
  return out;
}
