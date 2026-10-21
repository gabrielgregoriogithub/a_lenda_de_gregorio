// Executa o desenho real (com contexto 2D falso) em todas as zonas e estados de chefe para pegar erros de execução.
import './env.mjs';
import {Adventure,ZONES} from '../lib/adventure.ts';
import {makeGame} from './env.mjs';
export function drawSmoke(){const g=makeGame(Adventure);const draw=Adventure.prototype.draw;const img={width:256,height:256,complete:true};g.assets=new Proxy({},{get:()=>img});g.cheats.life=true;g.start();g.dismissDialog();
  g.tripleBow=g.runeBow=g.windBlade=g.wandMaster=g.echoCloak=true;g.bow=true;g.arrowKinds.add('fire');g.arrow='fire';
  for(const z of ZONES){g.zone=z;g.visited.add(z);draw.call(g);
    for(const e of g.map.enemies){g.player.x=e.x;g.player.y=e.y+120;for(const st of ['windup','charge','recover','transform','pull','stun']){e.st=st;e.move=st==='windup'?'slam':'charge';e.tx=e.x;e.ty=e.y;e.cdx=1;e.cdy=0;e.stun=st==='stun'?1:0;draw.call(g);}e.st='idle';e.stun=0;}
    g.hazards=[{x:g.player.x,y:g.player.y,t:.3,max:1,r:26,color:'#d9cfb4'}];g.bossIntro=1.3;g.bossIntroId=g.map.enemies[0]?.id??'';g.bowCharging=true;g.bowCharge=.5;g.screenFlash=.3;g.spawnSlash();draw.call(g);g.update(1/60);draw.call(g);g.bossIntro=0;g.hazards=[];g.wandShots=[];g.bowCharging=false;}
  return true;}
if(process.argv[1]?.endsWith('drawsmoke.mjs'))console.log('ok',drawSmoke());
