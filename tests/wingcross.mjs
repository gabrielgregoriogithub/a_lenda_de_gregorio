// Atravessa a Gruta das Botas Aladas com o motor real: anda até o ponto de salto, espera a plataforma
// chegar à posição certa, salta (K) e confere a aterrissagem em cada plataforma, de 1 a 8, até a margem final.
import {WING_PLATFORMS,WING_END_EDGE,wingPlatformPos} from '../lib/wingcave.ts';
const DT=1/60;
// limites caminháveis do apoio atual (margem inicial ou plataforma), já descontando o corpo do herói (9 px)
function support(g,i){if(i===0)return {x0:40,x1:5*32-10};const q=wingPlatformPos(WING_PLATFORMS[i-1],g.wingClock),w=WING_PLATFORMS[i-1].w/2;return {x0:q.x-w+10,x1:q.x+w-10};}
export function crossWingCave(g,{log=()=>{},maxSeconds=90}={}){
  const p=g.player,reachX=230*g.jumpTime;let frames=0;const limit=maxSeconds*60;
  const step=()=>{g.update(DT);frames++;if(g.dialog)g.dismissDialog();};
  for(let i=0;i<=8;i++){
    const target=i<8?WING_PLATFORMS[i]:null;let jumped=false;
    while(!jumped){
      if(frames>limit)return {ok:false,reason:`tempo esgotado antes da plataforma ${i+1}`,frames};
      if(g.screen!=='playing')return {ok:false,reason:`tela ${g.screen}`,frames};
      const s=support(g,i),t1=g.wingClock+g.jumpTime;
      let want,yOk;
      if(target){const q=wingPlatformPos(target,t1);want=q.x-reachX;yOk=Math.abs(q.y-p.y)<=target.h/2-8;}
      else{want=WING_END_EDGE+40-reachX;yOk=true;}
      const goal=Math.max(s.x0,Math.min(s.x1,want));
      g.keys.delete('arrowright');g.keys.delete('arrowleft');
      if(Math.abs(p.x-goal)>3)g.keys.add(p.x<goal?'arrowright':'arrowleft');
      else if(yOk&&Math.abs(p.x-want)<=6&&p.jumpCooldown<=0){p.dir='right';g.keyDown('k');g.keyUp('k');if(p.jump>0)jumped=true;}
      step();
    }
    g.keys.clear();
    while(p.jump>0&&frames<limit)step();
    for(let k=0;k<4;k++)step();
    if(target){if(g.wingStep!==target.n)return {ok:false,reason:`não aterrissou na plataforma ${target.n} (passo ${g.wingStep})`,frames};log(`plataforma ${target.n} em ${(frames/60).toFixed(1)} s`);}
    else if(p.x<WING_END_EDGE)return {ok:false,reason:'não chegou à margem final',frames};
  }
  return {ok:true,frames};
}
