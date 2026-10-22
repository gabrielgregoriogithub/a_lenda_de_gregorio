// Chefes, afinidades elementais e perigos de arena.
// Inspirado no padrão de Zelda (fraqueza ligada ao item da região, ataques avisados, janelas de vulnerabilidade)
// e no espetáculo de Final Fantasy (fases com transformação, introdução e derrota cinematográficas).
// O motor (lib/adventure.ts) chama estas funções; elas só usam a API pública da instância do jogo.
import type {Entity} from './adventure';

const T=32;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Game=any;
export type Source='sword'|'spin'|'wave'|'wand'|'lightning'|'missile'|'repulse'|'normal'|'fire'|'ice'|'light';
export type BossMove='charge'|'fan'|'ring'|'slam'|'rocks'|'blink'|'clones'|'summon'|'pull'|'spiral';
export type BossDef={name:string;title:string;weak:Source[];weakText:string;color:string;moves:BossMove[][];minion?:Entity['kind'];minionTint?:string};

/* ---------- definições dos chefes ---------- */
export const BOSSES:Record<string,BossDef>={
  guardian:{name:'Guardião de Pedra',title:'Sentinela do Templo Lunar',weak:['fire'],color:'#e8bd74',
    weakText:'A pedra racha com fogo: acerte uma Flecha de Fogo. Ou desvie da investida para ele se chocar contra a parede.',
    moves:[['charge','fan','charge'],['charge','slam','summon','rocks','fan']],minion:'skeleton'},
  'eclipse-warden':{name:'Guardião do Eclipse',title:'Senhor das Sombras Gêmeas',weak:['light','lightning'],color:'#b48cff',
    weakText:'Sombras temem a luz: Flecha de Luz ou o Relâmpago o deixam indefeso. As ilusões não sentem a luz.',
    moves:[['blink','fan','blink','ring'],['blink','clones','ring','spiral'],['blink','spiral','clones','rocks']],minion:'shade',minionTint:'#a88cff'},
  'sanctum-warden':{name:'Guardião da Repulsão',title:'Mestre da Gravidade',weak:['repulse'],color:'#9c8cff',
    weakText:'Ele dobra a gravidade a seu favor. Devolva a força com o raio da Varinha da Repulsão.',
    moves:[['pull','charge','fan'],['pull','spiral','charge'],['pull','summon','slam','spiral']],minion:'wisp',minionTint:'#c7c5ff'},
  'aerie-dune-warden':{name:'Guardião das Dunas',title:'Rei da Tempestade de Areia',weak:['missile'],color:'#d7a56b',
    weakText:'Ele salta alto demais para a espada. Um Míssil de energia o derruba no ar.',
    moves:[['slam','fan','slam'],['slam','spiral','summon'],['slam','rocks','charge','spiral']],minion:'mole',minionTint:'#e0b56a'},
  'fortress-warden':{name:'Guardião da Fortaleza',title:'A Armadura Esquecida',weak:['light','lightning'],color:'#6f8fc4',
    weakText:'A armadura conduz energia: Flecha de Luz ou Relâmpago a paralisam. Desviar da investida também abre a guarda.',
    moves:[['charge','fan'],['charge','ring','summon','rocks']],minion:'skeleton'},
  // chefes com IA própria: recebem fases, fraqueza (atordoamento) e intro, mas mantêm seus movimentos
  tidewarden:{name:'Guardião das Correntes',title:'Senhor da Maré Profunda',weak:['fire','ice','lightning'],color:'#57c7df',
    weakText:'O choque térmico o paralisa: flechas de Fogo ou de Gelo.',moves:[[],[]]},
  colossus:{name:'Colosso de Cinzas',title:'Coração da Cidadela',weak:['ice'],color:'#ff7a2a',
    weakText:'Congele-o com Flechas de Gelo: congelado, recebe dano dobrado.',moves:[[],[]]},
  'litorea-beast':{name:'Besta Litórea',title:'Fera do Litoral Petrificado',weak:['lightning','light'],color:'#7fd5d0',
    weakText:'A carapaça úmida conduz eletricidade: o Relâmpago ou a Flecha de Luz a atordoam.',moves:[[],[]]},
  'grove-heartwarden':{name:'Coração da Selva',title:'Raiz Primordial',weak:['fire'],color:'#66b56e',
    weakText:'As vinhas temem o fogo: Flechas de Fogo queimam a casca e o deixam exposto.',moves:[[],[],[]]},
};
const GENERIC:BossDef={name:'Guardião',title:'',weak:['fire','light'],color:'#e8bd74',weakText:'Procure a fraqueza dele com suas flechas e varinhas.',moves:[['charge','fan'],['charge','ring','rocks']]};
export const bossDef=(e:Entity)=>BOSSES[e.id]??(e.kind==='colossus'?BOSSES.colossus:GENERIC);
export const bossPhases=(e:Entity)=>Math.max(1,bossDef(e).moves.length);
export const isBoss=(e:Entity)=>e.kind==='boss'||e.kind==='colossus'||e.kind==='tidewarden'||e.kind==='stonebeast'||e.kind==='vinebeast';
export const BOSS_DYING=1.8;

/* ---------- afinidades elementais dos inimigos comuns ---------- */
// fraco: dano dobrado · resiste: metade · imune: nenhum dano. As pistas estão no visual (gelo, fogo, metal, espírito).
type Aff={weak?:Source[];resist?:Source[];immune?:Source[]};
export const AFFINITY:Partial<Record<Entity['kind'],Aff>>={
  slime:{weak:['fire']},
  bat:{weak:['lightning','missile']},
  golem:{weak:['lightning','repulse'],resist:['fire','normal']},
  spitter:{weak:['ice']},
  knight:{weak:['lightning'],resist:['normal']},
  shieldknight:{weak:['lightning'],resist:['normal','missile']},
  wisp:{weak:['light'],resist:['sword','normal']},
  frostwolf:{weak:['fire'],resist:['ice']},
  salamander:{weak:['ice','wave'],immune:['fire']},
  shade:{weak:['light','lightning'],resist:['sword','spin','normal']},
  sandworm:{weak:['ice','missile'],resist:['fire']},
};
export function affinity(e:Entity,source:Source){const a=AFFINITY[e.kind];if(!a)return 1;if(a.immune?.includes(source))return 0;if(a.weak?.includes(source))return 2;if(a.resist?.includes(source))return .5;return 1;}

/* ---------- armadura, fraqueza e atordoamento ---------- */
// Retorna true quando o golpe é bloqueado. Chefes "comuns" (kind boss) só sofrem dano atordoados ou na janela
// de recuperação depois de uma investida/salto. Os demais chefes aceitam golpes com breve invulnerabilidade.
export function bossArmor(g:Game,e:Entity,source:Source){const def=bossDef(e),now=g.elapsed;
  if(e.st==='transform'||e.st==='intro'){spark(g,e,'#ffffff');return true;}
  if(now<e.bossHitUntil)return true;
  const weak=def.weak.includes(source);
  if(weak&&!(e.stun>0)&&now>=(e.stunReady??0)){const secs=e.kind==='boss'?3:2.6;stunBoss(g,e,secs,true);e.stunReady=now+secs+4.5;e.bossHitUntil=now+.25;return false;}
  if(weak&&!(e.stun>0)&&e.kind==='boss'&&e.st!=='recover'){spark(g,e,def.color);g.floatText(e.x,e.y-70,'EM ALERTA','#ffd36b');return true;}
  const open=e.stun>0||e.st==='recover'||e.kind!=='boss';
  if(!open){e.deflects=(e.deflects??0)+1;spark(g,e,def.color);g.tone(1760,.04,'square');g.tone(880,.06,'square');g.floatText(e.x,e.y-70,'BLOQUEOU','#d8d8d8');
    if(e.deflects%3===1)g.message(`Dica: ${def.weakText}`);return true;}
  e.bossHitUntil=now+(e.stun>0||e.st==='recover'?.3:.7);return false;}
export function stunBoss(g:Game,e:Entity,secs:number,weak=false){e.stun=secs;e.st='stun';e.vx=0;e.vy=0;g.projectiles=g.projectiles.filter((p:{reflected?:boolean})=>p.reflected);
  g.floatText(e.x,e.y-80,weak?'FRAQUEZA! ATORDOADO':'ATORDOADO!','#ffe27a',20);g.ring(e.x,e.y-30,'#ffe27a',90);g.burst(e.x,e.y-30,'#fff1b7',26);g.kick(6,.25);g.tone(330,.12,'triangle');g.tone(660,.16,'triangle');}
const spark=(g:Game,e:Entity,color:string)=>{g.burst(e.x,e.y-30,color,8);g.ring(e.x,e.y-28,color,30);};
// Dano extra enquanto atordoado.
export const bossDamageScale=(e:Entity)=>e.stun>0?1.5:1;

/* ---------- fases e transformação ---------- */
export function bossOnDamage(g:Game,e:Entity){if(!isBoss(e)||e.hp<=0)return;const n=bossPhases(e);if(n<2)return;const phase=e.phase??0,next=Math.min(n-1,Math.floor((1-e.hp/e.maxHp)*n));if(next<=phase)return;e.phase=next;e.scale=(e.scale??1)+.1;
  const def=bossDef(e),last=next===n-1;if(e.kind==='boss'){e.st='transform';e.stT=1.6;e.stun=0;}
  g.projectiles=[];g.kick(10,.5);g.freeze=Math.max(g.freeze,.25);g.flashScreen?.(last?'#ff6a5c':'#ffffff',.5);g.ring(e.x,e.y-30,def.color,150);g.ring(e.x,e.y-30,'#ffffff',90);g.burst(e.x,e.y-30,def.color,60);g.tone(98,.35,'sawtooth');g.tone(147,.4,'sawtooth');
  g.message(`${def.name} se transforma! ${last?'Fúria final: ataques novos e mais rápidos.':'Ele aprendeu novos ataques.'}`);}

/* ---------- derrota cinematográfica ---------- */
export function bossDeathFx(g:Game,e:Entity){if(Math.random()<.35){const x=e.x+(Math.random()-.5)*70,y=e.y-20-Math.random()*60,c=Math.random()<.5?bossDef(e).color:'#ffffff';g.burst(x,y,c,12);g.impact?.(x,y,1.2,c);if(Math.random()<.4)g.tone(80+Math.random()*120,.08,'sawtooth');}
  if(e.dying<.12&&!e.deathFlash){e.deathFlash=true;g.flashScreen?.('#ffffff',.6);g.ring(e.x,e.y-30,'#ffffff',200);g.burst(e.x,e.y-30,bossDef(e).color,80);g.kick(12,.6);g.tone(523,.3,'triangle');g.tone(784,.4,'triangle');g.tone(1046,.5,'triangle');for(let i=0;i<3;i++)g.pickups.push({x:e.x+(i-1)*24,y:e.y+10,kind:'heart',life:20});}}

/* ---------- IA dos chefes comuns (kind boss) ---------- */
const dist=(ax:number,ay:number,bx:number,by:number)=>Math.hypot(ax-bx,ay-by);
function step(g:Game,e:Entity,mx:number,my:number,r:number){let hit=false;if(!g.collides(e.x+mx,e.y,r))e.x+=mx;else hit=true;if(!g.collides(e.x,e.y+my,r))e.y+=my;else hit=true;return hit;}
function aim(g:Game,e:Entity,speed:number,count:number,spread:number,color:string){const p=g.player,a0=Math.atan2(p.y-e.y,p.x-e.x);for(let i=0;i<count;i++){const a=a0+(count===1?0:(i/(count-1)-.5)*spread);g.projectiles.push({x:e.x,y:e.y-20,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,life:3,color});}}
function ring(g:Game,e:Entity,n:number,speed:number,color:string,offset=0){for(let i=0;i<n;i++){const a=offset+i*Math.PI*2/n;g.projectiles.push({x:e.x,y:e.y-20,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,life:3,color});}}
function teleportNear(g:Game,e:Entity,radius:number){const p=g.player;for(let i=0;i<12;i++){const a=Math.random()*Math.PI*2,x=p.x+Math.cos(a)*radius,y=p.y+Math.sin(a)*radius*.8;if(!g.collides(x,y,16)&&dist(x,y,e.homeX,e.homeY)<420){e.x=x;e.y=y;return true;}}return false;}
export function addRocks(g:Game,cx:number,cy:number,n:number,spread:number,delay=1.1,color='#d9cfb4'){for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,r=i===0?0:30+Math.random()*spread;g.hazards.push({x:cx+Math.cos(a)*r,y:cy+Math.sin(a)*r,t:delay+i*.12,max:delay+i*.12,r:26,color});}}

function begin(g:Game,e:Entity,move:BossMove){const phase=e.phase??0,p=g.player;e.move=move;e.st='windup';e.stT=Math.max(.42,(move==='charge'?.85:move==='slam'?.8:move==='blink'?.4:.6)-phase*.08);
  if(move==='charge'){const d=dist(p.x,p.y,e.x,e.y)||1;e.cdx=(p.x-e.x)/d;e.cdy=(p.y-e.y)/d;}
  if(move==='slam'){e.tx=p.x;e.ty=p.y;}
  g.tone(220,.08,'square');}
function execute(g:Game,e:Entity){const def=bossDef(e),phase=e.phase??0,p=g.player,c=def.color;switch(e.move){
  case 'charge':e.st='charge';e.stT=1.05;g.tone(140,.2,'sawtooth');return;
  case 'fan':aim(g,e,120+phase*18,5+phase*2,.9+phase*.15,c);e.st='rest';e.stT=.75;g.tone(196,.1,'sawtooth');return;
  case 'ring':ring(g,e,10+phase*3,110+phase*12,c,g.elapsed);g.ring(e.x,e.y-20,c,70);e.st='rest';e.stT=.8;return;
  case 'slam':{const tx=e.tx??p.x,ty=e.ty??p.y;if(!g.collides(tx,ty,16)){e.x=tx;e.y=ty;}g.kick(9,.35);g.ring(e.x,e.y,c,110);g.burst(e.x,e.y,'#d9cfb4',30);if(dist(p.x,p.y,e.x,e.y)<62)g.damage(e.x,e.y);ring(g,e,8+phase*2,120,c);g.tone(70,.25,'sawtooth');e.st='recover';e.stT=1.15;return;}
  case 'rocks':addRocks(g,p.x,p.y,4+phase*2,120);g.message('Pedras despencam do teto! Fuja das sombras.');e.st='rest';e.stT=.5;return;
  case 'blink':g.burst(e.x,e.y-20,c,18);teleportNear(g,e,150);g.ring(e.x,e.y-20,c,60);aim(g,e,140+phase*15,3+phase,.5,c);e.st='rest';e.stT=.65;return;
  case 'clones':case 'summon':{const kind=def.minion??'slime',alive=g.map.enemies.filter((q:Entity)=>q.id.startsWith(e.id+'-m')&&q.hp>0).length;for(let i=alive;i<(e.move==='clones'?2:3);i++){const a=Math.random()*Math.PI*2;g.spawnMinion(`${e.id}-m${Math.floor(g.elapsed*100)}-${i}`,kind,e.x+Math.cos(a)*90,e.y+Math.sin(a)*70,def.minionTint);}g.message(e.move==='clones'?'Ilusões surgem das sombras! Só o verdadeiro sente a luz.':`${def.name} invoca reforços!`);e.st='rest';e.stT=.5;return;}
  case 'pull':e.st='pull';e.stT=1.7;g.message('A gravidade puxa Gregório para o guardião!');return;
  case 'spiral':e.st='spiral';e.stT=1.5;e.spin=0;return;
}}
// Os chefes alternam ataques avisados (windup) com janelas: investida/salto → recuperação vulnerável.
export function updateBoss(g:Game,e:Entity,d:number,ex:number,ey:number,dt:number,r:number){
  const p=g.player,awake=e.woke||(g.zone==='temple'?p.y<9*T:d<300);if(g.bossIntro>0||!awake)return;e.woke=true;const far=dist(e.x,e.y,e.homeX,e.homeY);
  const def=bossDef(e),phase=e.phase??0;e.st=e.st??'idle';e.stT=(e.stT??.8)-dt;
  if(e.stun>0){e.stun=Math.max(0,e.stun-dt);if(e.stun<=0){e.st='rest';e.stT=.6;}return;}
  if(e.hit>0&&e.st!=='charge')return;
  const speedUp=1+phase*.18;
  switch(e.st){
    case 'stun':e.st='rest';e.stT=.5;break;
    case 'transform':if(e.stT<=0){e.st='rest';e.stT=.6;}return;
    case 'idle':case 'rest':{const keep=e.st==='rest'?0:90;if(far>230){const sp=(60+phase*10)*dt,hx=e.homeX-e.x,hy=e.homeY-e.y;step(g,e,hx/far*sp,hy/far*sp,r);}else if(d>keep+20){const sp=(28+phase*10)*dt;step(g,e,ex/(d||1)*sp,ey/(d||1)*sp,r);}if(e.stT<=0){const list=def.moves[Math.min(phase,def.moves.length-1)];e.mi=(e.mi??-1)+1;begin(g,e,list[e.mi%list.length]);}break;}
    case 'windup':if(e.stT<=0)execute(g,e);break;
    case 'charge':{const sp=(320+phase*35)*dt,hit=step(g,e,(e.cdx??0)*sp,(e.cdy??0)*sp,r);if(Math.random()<.6)g.particles.push({x:e.x+(Math.random()-.5)*30,y:e.y,vx:-(e.cdx??0)*60,vy:-20,life:.35,color:'#d9cfb4'});
      if(hit){g.kick(10,.4);g.ring(e.x,e.y-20,'#ffffff',90);g.message(`${def.name} se chocou contra a parede! Ataque agora!`);stunBoss(g,e,2.2);e.stunReady=g.elapsed+2.2+3;return;}
      if(e.stT<=0||far>300){e.st='recover';e.stT=1.1;}break;}
    case 'recover':if(e.stT<=0){e.st='rest';e.stT=.5;}break;
    case 'pull':{const k=(170+phase*30)*dt,dd=d||1;if(d>40&&p.jump<=0)g.move(-ex/dd*k,-ey/dd*k);if(Math.floor(e.stT*10)%3===0&&Math.random()<.5)g.effects.push({x:p.x,y:p.y-12,x2:e.x,y2:e.y-24,life:.15,max:.15,kind:'beam',size:1,color:def.color});
      e.spin=(e.spin??0)+dt;if(e.spin>.35){e.spin=0;ring(g,e,6,95,def.color,g.elapsed*2);}if(e.stT<=0){e.st='rest';e.stT=.7;}break;}
    case 'spiral':{e.spin=(e.spin??0)+dt;if(e.spin>.09/speedUp){e.spin=0;const a=g.elapsed*5;for(const k of [0,Math.PI])g.projectiles.push({x:e.x,y:e.y-20,vx:Math.cos(a+k)*125,vy:Math.sin(a+k)*125,life:2.8,color:def.color});}if(e.stT<=0){e.st='rest';e.stT=.8;}break;}
  }
  if(d<30&&e.st!=='recover'&&e.st!=='transform')g.damage(e.x,e.y);}

/* ---------- desenho: avisos de ataque, atordoamento e perigos ---------- */
export function drawBossFx(g:Game,c:CanvasRenderingContext2D,e:Entity){const t=g.elapsed,def=bossDef(e);c.save();
  if(e.st==='windup'){const k=Math.abs(Math.sin(t*16));if(e.move==='charge'){c.globalAlpha=.18+.2*k;c.strokeStyle='#ff4b3e';c.lineWidth=28;c.lineCap='round';c.beginPath();c.moveTo(e.x,e.y-8);c.lineTo(e.x+(e.cdx??0)*320,e.y-8+(e.cdy??0)*320);c.stroke();}
    if(e.move==='slam'&&e.tx!==undefined){c.globalAlpha=.25+.25*k;c.fillStyle='#ff4b3e';c.beginPath();c.ellipse(e.tx,e.ty,62,30,0,0,Math.PI*2);c.fill();c.globalAlpha=.8;c.strokeStyle='#ffb3a8';c.lineWidth=2;c.stroke();}
    c.globalAlpha=1;c.fillStyle='#ff6b5c';c.font='bold 24px Georgia, serif';c.textAlign='center';c.fillText('!',e.x,e.y-96*(e.scale??1));}
  if(e.st==='recover'){c.globalAlpha=.3+.2*Math.sin(t*10);c.strokeStyle='#ffe27a';c.lineWidth=3;c.beginPath();c.arc(e.x,e.y-34,40,0,Math.PI*2);c.stroke();}
  if(e.stun>0){c.globalAlpha=1;for(let i=0;i<4;i++){const a=t*5+i*Math.PI/2;c.fillStyle=i%2?'#fff1b7':'#ffe27a';const x=e.x+Math.cos(a)*30,y=e.y-86*(e.scale??1)+Math.sin(a)*8;c.beginPath();for(let j=0;j<5;j++){const b=j*Math.PI*.8-Math.PI/2;c.lineTo(x+Math.cos(b)*6,y+Math.sin(b)*6);}c.fill();}}
  if(e.st==='transform'){c.globalAlpha=.25+.25*Math.sin(t*20);c.fillStyle='#ffffff';c.beginPath();c.arc(e.x,e.y-34,60*(1+(1.6-(e.stT??0))*.3),0,Math.PI*2);c.fill();}
  if(e.st==='pull'){c.globalAlpha=.4;c.strokeStyle=def.color;c.lineWidth=2;for(let i=0;i<3;i++){const rr=((t*120+i*40)%120)+20;c.beginPath();c.arc(e.x,e.y-24,140-rr,0,Math.PI*2);c.stroke();}}
  c.restore();}
export function updateHazards(g:Game,dt:number){for(const h of g.hazards){h.t-=dt;if(h.t<=0){g.burst(h.x,h.y-6,h.color,14);g.ring(h.x,h.y,h.color,40);g.kick(3,.12);const p=g.player;if(p.jump<=0&&dist(p.x,p.y,h.x,h.y)<h.r+8)g.damage(h.x,h.y);}}g.hazards=g.hazards.filter((h:{t:number})=>h.t>0);}
export function drawHazards(g:Game,c:CanvasRenderingContext2D){for(const h of g.hazards){const k=1-h.t/h.max;c.save();c.globalAlpha=.2+.35*k;c.fillStyle='#000';c.beginPath();c.ellipse(h.x,h.y,h.r*(.4+.6*k),h.r*.5*(.4+.6*k),0,0,Math.PI*2);c.fill();c.globalAlpha=.6*k;c.strokeStyle='#ff6b5c';c.lineWidth=2;c.beginPath();c.ellipse(h.x,h.y,h.r,h.r*.5,0,0,Math.PI*2);c.stroke();
  if(k>.55){const y=h.y-(1-k)*260;c.globalAlpha=1;c.fillStyle=h.color;c.beginPath();c.moveTo(h.x-9,y-6);c.lineTo(h.x+2,y-12);c.lineTo(h.x+10,y-2);c.lineTo(h.x+4,y+8);c.lineTo(h.x-8,y+5);c.closePath();c.fill();c.strokeStyle='#5d5446';c.lineWidth=1.5;c.stroke();}c.restore();}}
// Introdução cinematográfica: faixas pretas, nome e título do chefe.
export function drawBossIntro(g:Game,c:CanvasRenderingContext2D,W:number,H:number){if(!(g.bossIntro>0))return;const e=g.map.enemies.find((q:Entity)=>q.id===g.bossIntroId);if(!e)return;const def=bossDef(e),total=2.6,k=1-g.bossIntro/total,bar=Math.min(1,k*4,g.bossIntro*3)*H*.13;c.save();c.fillStyle='#000';c.fillRect(0,0,W,bar);c.fillRect(0,H-bar,W,bar);
  const a=Math.min(1,(k-.15)*4,g.bossIntro*2.5);if(a>0){c.globalAlpha=a;c.textAlign='center';c.fillStyle=def.color;c.font='italic 16px Georgia, serif';c.fillText(def.title,W/2,H*.38);c.fillStyle='#fff3d6';c.font='bold 34px Georgia, serif';c.shadowColor=def.color;c.shadowBlur=18;c.fillText(def.name.toUpperCase(),W/2,H*.38+40);c.shadowBlur=0;c.fillStyle=def.color;c.fillRect(W/2-140*a,H*.38+54,280*a,2);}c.restore();}
export function drawBossBar(g:Game,c:CanvasRenderingContext2D,W:number,H:number){const b=g.bossAlive?.();if(!b||b.hp<=0||g.bossIntro>0)return;const def=bossDef(b),n=bossPhases(b),w=Math.min(440,W-80),x=(W-w)/2,y=H-46,k=Math.max(0,b.hp/b.maxHp);c.save();c.fillStyle='#15242be6';c.fillRect(x-8,y-24,w+16,42);c.strokeStyle=def.color;c.lineWidth=1;c.strokeRect(x-7.5,y-23.5,w+15,41);c.font='14px Georgia, serif';c.textAlign='center';c.fillStyle='#f3dbac';
  const tag=b.stun>0?' · ATORDOADO':b.st==='recover'?' · guarda aberta':(b.phase??0)===n-1&&n>1?' · fúria final':'';c.fillText(def.name+tag,W/2,y-8);c.fillStyle='#2b1f1f';c.fillRect(x,y,w,9);c.fillStyle=b.stun>0?'#ffe27a':(b.phase??0)>0?'#e8645e':def.color;c.fillRect(x,y,w*k,9);c.fillStyle='#ffffff33';c.fillRect(x,y,w*k,3);c.fillStyle='#15242b';for(let i=1;i<n;i++)c.fillRect(x+w*(1-i/n)-1,y-2,2,13);c.restore();}
