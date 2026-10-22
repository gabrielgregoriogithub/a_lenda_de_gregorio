// Ciclo completo da Técnica Ancestral com o motor real:
// Eremita → Portão do Eco (pilares) → Câmara do Eco (símbolos e placas) → baú dourado → animação → Ataque Giratório.
import {reach} from './reach.mjs';
const T=32,c=n=>n*T+T/2;
export const prop=(g,z,id)=>g.maps[z].props.find(p=>p.id===id);
// Leva o jogador até perto de um objeto usando só pontos realmente alcançáveis pela colisão do motor.
export function walkTo(g,id,from,r=56){const p=prop(g,g.zone,id);const pts=reach(g,from).pts;let best=null,bd=r;for(const q of pts){const d=Math.hypot(q[0]-p.x,q[1]-p.y);if(d<bd){bd=d;best=q;}}if(!best)throw new Error(`${id} inalcançável em ${g.zone}`);g.player.x=best[0];g.player.y=best[1];g.player.dir=Math.abs(p.x-best[0])>Math.abs(p.y-best[1])?(p.x>best[0]?'right':'left'):(p.y>best[1]?'down':'up');return best;}
export function runSpinQuest(g,{log=()=>{}}={}){
  const settle=()=>{if(g.dialog)g.dismissDialog();};
  g.zone='world';const start={x:g.player.x,y:g.player.y};
  walkTo(g,'eremita',start);g.interact();log(g.dialogTitle);settle();
  if(!g.spinLore)throw new Error('o Eremita não contou a história');
  // pilares fora de ordem apagam; na ordem certa abrem o portão
  walkTo(g,'echo-pillar-s',start);g.interact();
  walkTo(g,'echo-pillar-n',start);g.interact();
  walkTo(g,'echo-pillar-e',start);g.interact();
  const lit=['n','e','s','w'].filter(k=>prop(g,'world',`echo-pillar-${k}`).open).length;
  for(const k of ['s','w']){walkTo(g,`echo-pillar-${k}`,start);g.interact();}
  if(!g.echoGateOpen)throw new Error(`portão fechado (${lit} acesos após o erro)`);
  walkTo(g,'echo-gate',start);g.interact();settle();
  if(g.zone!=='dojo')throw new Error('não entrou na Câmara do Eco');
  const entry={x:g.player.x,y:g.player.y};
  walkTo(g,'dojo-mural',entry);g.interact();log(g.dialog.slice(0,60));settle();
  for(const id of ['dojo-sym-moon','dojo-sym-star','dojo-sym-sun','dojo-sym-wind']){walkTo(g,id,entry);g.interact();}
  if(prop(g,'dojo','dojo-rune-barrier'))throw new Error('símbolos não abriram a porta norte');
  // placas: pisa em todas dentro do tempo
  for(const id of ['dojo-plate-a','dojo-plate-b','dojo-plate-d','dojo-plate-c']){const q=prop(g,'dojo',id);walkTo(g,id,entry,40);g.player.x=q.x;g.player.y=q.y;g.update(1/60);for(let i=0;i<60;i++)g.update(1/60);}
  if(prop(g,'dojo','dojo-wind-barrier'))throw new Error('placas não abriram a passagem secreta');
  walkTo(g,'dojo-scroll',entry,60);g.interact();
  if(!g.spinUnlocked||g.spinReveal<=0)throw new Error('o baú dourado não iniciou a animação');
  return true;
}
