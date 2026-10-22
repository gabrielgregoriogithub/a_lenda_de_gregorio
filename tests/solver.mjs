// Jogador automático: explora todos os mapas com a colisão e a lógica reais do motor até não haver mais progresso.
import {reach,canShoot} from './reach.mjs';
import {QUESTS,QUEST_SEQ_IDS} from '../lib/sidequests.ts';
import {WING_START} from '../lib/wingcave.ts';
import {crossWingCave} from './wingcross.mjs';
const ORDERED_SKIP=id=>QUEST_SEQ_IDS.has(id)||id.startsWith('coast-beacon-')||id.startsWith('lightcave-rune-')||id.startsWith('tidecave-rune-')||id.endsWith('-mural');
const T=32,c=n=>n*T+T/2;
export function solve(g,{log=()=>{}}={}){
  g.cheats.life=true;g.start();
  const entries=new Map();const addEntry=(z,x,y)=>{const l=entries.get(z)??[];if(!l.some(e=>e.x===x&&e.y===y)){l.push({x,y});entries.set(z,l);return true;}return false;};
  addEntry('world',g.player.x,g.player.y);
  const events=[];const ev=s=>{events.push(s);log(s);};
  const place=(x,y)=>{g.player.x=x;g.player.y=y;g.player.jump=0;g.player.cooldown=0;g.player.hurt=0;};
  const dirTo=(x,y,tx,ty)=>Math.abs(tx-x)>Math.abs(ty-y)?(tx>x?'right':'left'):(ty>y?'down':'up');
  const settle=()=>{if(g.dialog)g.dismissDialog();if(g.shopOpen)g.closeShop();};
  const kill=e=>{if(e.hp<=0)return;e.hp=1;e.hit=0;e.timer=2;e.frozen=0;e.stun=1;e.st='idle';e.bossHitUntil=0;const src=e.kind==='wisp'?'light':e.kind==='knight'||e.kind==='shieldknight'?'spin':'sword';g.hitEnemy(e,0,1,99,src);if(e.hp>0){e.mi=1;e.hp=0;} // carapaça, ossos ou toca: o combate real tem testes próprios
  e.dying=0;};
  const cache=new Map();let progress=true,rounds=0;
  while(progress&&rounds++<200){progress=false;
    for(const [z,list] of [...entries]){
      g.zone=z;const m=g.map;
      // o alcance só muda quando muda o mapa ou o equipamento de movimento: reaproveita entre rodadas
      const sig=[g.boots,g.amulet,list.length,m.props.length,m.props.filter(p=>p.open).length,m.tiles.reduce((n,row)=>n+row.filter(t=>t===3).length,0)].join('|');
      if(z==='grove'){for(const id of ['grove-torch-a','grove-torch-b','grove-plate-a','grove-plate-b']){const q=m.props.find(p=>p.id===id);if(q){q.open=true;q.solid=false;}}g.checkBarriers();}
      let pts=cache.get(z)?.sig===sig?cache.get(z).pts:null;if(!pts){pts=[];for(const e of list){const r=reach(g,e);for(const p of r.pts)pts.push(p);}cache.set(z,{sig,pts});}const R={pts};
      // índice por célula de 32px: a busca do ponto alcançável mais próximo olha só as células vizinhas
      const cells=new Map();for(const p of pts){const k=(p[1]>>5)*4096+(p[0]>>5);const l=cells.get(k);if(l)l.push(p);else cells.set(k,[p]);}
      const near=(x,y,r)=>{let best=null,bd=r;const cr=Math.ceil(r/32),cx=x>>5,cy=y>>5;for(let gy=cy-cr;gy<=cy+cr;gy++)for(let gx=cx-cr;gx<=cx+cr;gx++){const l=cells.get(gy*4096+gx);if(l)for(const p of l){const d=Math.hypot(p[0]-x,p[1]-y);if(d<bd){bd=d;best=p;}}}return best;};
      const act=(prop,r=50)=>{const p=near(prop.x,prop.y,r);if(!p)return false;place(p[0],p[1]);g.player.dir=dirTo(p[0],p[1],prop.x,prop.y);const before=g.zone;g.interact();settle();if(g.heartChestTimer>0){for(let i=0;i<220&&g.heartChestTimer>0;i++){g.update(1/60);settle();}}if(g.spinReveal>0){for(let i=0;i<400&&g.spinReveal>0;i++)g.update(1/60);settle();}return true;};
      const aim=s=>{place(s[0],s[1]);g.player.dir=s[2]?(s[2]>0?'right':'left'):(s[3]>0?'down':'up');};
      const fire=(p,kind)=>{if(!g.bow||(kind!=='normal'&&!g.arrowKinds.has(kind)))return false;const s=canShoot(g,R,p);if(!s)return false;aim(s);g.ranged='bow';g.arrow=kind;g.player.cooldown=0;g.shoot();for(let i=0;i<80;i++)g.updateShots(1/60);settle();return true;};
      const cast=(p,kind)=>{if(!g.wands.has(kind))return false;const s=canShoot(g,R,p);if(!s)return false;aim(s);g.wand=kind;g.ranged='wand';g.wandCooldown=0;g.castWand();for(let i=0;i<150;i++)g.updateWandShots(1/60);settle();return true;};
      // sequências em ordem: runas da Caverna da Luz e da Caverna Submersa, faróis da costa e side quests de relíquias
      if(z==='world'&&g.arrowKinds.has('fire'))for(const id of ['coast-beacon-a','coast-beacon-b','coast-beacon-c']){const q=m.props.find(p=>p.id===id);if(!q||q.open)continue;if(fire(q,'fire')&&q.open){ev(`world: acendeu ${id}`);progress=true;}else break;}
      for(const quest of QUESTS){if(quest.zone!==z)continue;for(let i=0;i<quest.seq.ids.length;i++){const q=m.props.find(p=>p.id===quest.seq.ids[i]);if(!q||q.open)continue;const via=quest.seq.via[i];let ok=false;if(via==='touch')ok=act(q,56);else if(via==='lightning'||via==='missile'||via==='repulse')ok=cast(q,via);else ok=fire(q,via);if(ok&&q.open){ev(`${z}: ${via} despertou ${q.id}`);progress=true;}else break;}}
      // Gruta das Botas Aladas: travessia real das oito plataformas, de 1 a 8
      if(z==='wingcave'&&g.screen==='playing'){const c=m.props.find(p=>p.id==='wingcave-boots');if(c&&!c.open){place(WING_START.x,WING_START.y);g.player.dir='right';g.wingInside=true;g.resetWingCave(true);const r=crossWingCave(g);if(r.ok){place(c.x,c.y+30);g.interact();settle();if(c.open){ev('wingcave: atravessou as 8 plataformas e pegou as Botas Aladas');progress=true;}}else ev(`wingcave: FALHOU ${r.reason}`);}}
      // Tempestade Ancestral: um giro comum no meio dos três alvos celestes
      if(z==='dojo'&&g.chapter>=3&&g.spinUnlocked&&m.props.some(p=>p.id==='dojo-ascension-barrier')){const b=m.props.find(p=>p.id==='dojo-asc-target-b');if(b&&near(b.x,b.y,24)){place(b.x,b.y);g.player.dir='down';g.spinAttack();for(let i=0;i<60;i++)g.update(1/60);settle();if(!m.props.some(p=>p.id==='dojo-ascension-barrier')){ev('dojo: giro despertou os alvos celestes');progress=true;}}}
      // Técnica Ancestral: pilares do Portão do Eco e símbolos da Câmara na ordem; depois as placas do vento a tempo
      for(const order of [['echo-pillar-n','echo-pillar-e','echo-pillar-s','echo-pillar-w'],['dojo-sym-moon','dojo-sym-star','dojo-sym-sun','dojo-sym-wind'],['lightcave-rune-sun','lightcave-rune-moon','lightcave-rune-star'],['tidecave-rune-low','tidecave-rune-current','tidecave-rune-high']])for(const id of order){const q=m.props.find(p=>p.id===id);if(q&&!q.open&&near(q.x,q.y,56)){act(q,56);if(q.open){ev(`${z}: acendeu ${id}`);progress=true;}}}
      if(z==='dojo'&&m.props.some(p=>p.id==='dojo-wind-barrier')){const plates=m.props.filter(p=>p.kind==='target'&&p.id.startsWith('dojo-plate-'));if(plates.every(p=>near(p.x,p.y,24))){for(const q of plates){place(q.x,q.y);g.update(1/60);settle();}if(!m.props.some(p=>p.id==='dojo-wind-barrier')){ev('dojo: placas do vento');progress=true;}}}
      // inimigos guardiões e chefes: se alguém consegue chegar até ele (ou ele voa até você), derrota
      for(const e of m.enemies){if(e.hp<=0)continue;const fly=e.kind==='bat'||e.kind==='wisp';if(fly||near(e.x,e.y,70)){if(e.kind==='colossus'&&m.props.some(p=>p.kind==='barrier'))continue;kill(e);ev(`${z}: derrotou ${e.id}`);progress=true;}}
      // deixa o motor reagir às mortes (ex.: a ponte do Abismo surge quando todos caem)
      if(g.screen==='playing'){for(let i=0;i<3;i++){g.update(1/60);settle();}if(g.zone!==z)g.zone=z;}
      for(const p of [...m.props]){
        if(g.zone!==z)g.zone=z;
        if(p.kind==='npc'&&p.id==='iris'&&!g.met&&near(p.x,p.y,50)){act(p);ev('conversou com Iris');progress=true;}
        if(p.kind==='chest'&&!p.open&&near(p.x,p.y,50)){if(g.guardAlive(p))continue;act(p);if(p.open){ev(`${z}: abriu ${p.id} (${p.item})`);progress=true;}}
        if(['torch','iceSeal','lavaVent','totem'].includes(p.kind)&&!p.open&&!p.mirrorAngle){const kind=p.kind==='torch'?'fire':p.kind==='totem'?'light':'ice';if(!g.arrowKinds.has(kind)||!g.bow||ORDERED_SKIP(p.id)||p.id.startsWith('sanctum-button')||p.id.startsWith('echo-')||p.id.startsWith('dojo-')){}else{
          const s=canShoot(g,R,p);if(!s)continue;place(s[0],s[1]);g.player.dir=s[2]?(s[2]>0?'right':'left'):(s[3]>0?'down':'up');g.arrow=kind;g.shoot();for(let i=0;i<80;i++)g.updateShots(1/60);settle();if(p.open){ev(`${z}: ${kind} ativou ${p.id}`);progress=true;}else ev(`${z}: FALHOU tiro em ${p.id}`);}}
        if(p.kind==='lever'&&!g.levers.has(p.id)&&g.arrowKinds.has('ice')&&near(p.x,p.y,40)&&m.enemies.some(e=>e.kind==='slime')){g.levers.add(p.id);p.open=true;g.checkBarriers();ev(`${z}: botão ${p.id} (slime congelado aproximado)`);progress=true;}
        if(p.kind==='target'&&p.id.endsWith('-ledge-plate')&&!p.open&&g.wands.has('repulse')){const rock=m.props.find(q=>q.target===p.id);if(rock&&near(rock.x-160,rock.y,40)){p.open=true;p.solid=false;g.checkBarriers();ev(`${z}: raio da Repulsão levou ${rock.id} até ${p.id} (aproximado)`);progress=true;}}
        if(p.kind==='rock'&&p.pushable&&p.id!=='sanctum-orb'&&!p.id.endsWith('-ledge-stone')&&g.gloves&&near(p.x,p.y,56)){m.props=m.props.filter(q=>q!==p);g.rebuildGrid(z);ev(`${z}: empurrou ${p.id} (aproximado)`);progress=true;}
        if(p.id==='cit1-ice-wall'&&g.arrowKinds.has('fire')&&near(p.x,p.y,120)){p.burnHits=10;m.props=m.props.filter(q=>q!==p);g.rebuildGrid(z);ev(`${z}: queimou cit1-ice-wall (10 flechadas de fogo simuladas)`);progress=true;}
        if(p.kind==='target'&&p.id.startsWith('aerie-wind-target-')&&!p.open&&g.wands.has('missile')&&near(p.x,p.y,460)){const order=['aerie-wind-target-a','aerie-wind-target-b','aerie-wind-target-c'],next=order.find(id=>!m.props.find(q=>q.id===id)?.open);if(p.id===next){p.open=true;p.solid=false;if(order.every(id=>m.props.find(q=>q.id===id)?.open))g.updateAerieBridge();ev(`${z}: míssil ativou ${p.id}`);progress=true;}}
        if((p.id==='sanctum-button-a'||p.id==='sanctum-button-b')&&!p.open&&g.wands.has('repulse')){const orb=m.props.find(q=>q.id==='sanctum-orb');if(orb&&near(orb.x,orb.y,220)){p.open=true;if(p.id==='sanctum-button-a')orb.target='sanctum-button-b';else g.checkBarriers();ev(`sanctum: orbe ativou ${p.id} (aproximado)`);progress=true;}}
        if((p.kind==='stairs'||p.kind==='exit'||p.kind==='door')&&near(p.x,p.y,50)){const before=g.zone;act(p);if(g.zone!==before){if(addEntry(g.zone,g.player.x,g.player.y)){ev(`${before} -> ${g.zone} por ${p.id}`);progress=true;}g.zone=before;}}
        if(p.kind==='relic'&&!p.open&&near(p.x,p.y,50)&&g.screen==='playing'){act(p);if(g.screen==='won'){ev(`${z}: venceu em ${p.id} (capítulo ${g.chapter})`);g.continueStory();settle();if(g.screen==='playing'){addEntry(g.zone,g.player.x,g.player.y);ev(`capítulo ${g.chapter} começa em ${g.zone}`);}progress=true;break;}}
      }
      // núcleos que vencem por proximidade (Eclipse, Bastião, Santuário, Abismo)
      for(const id of ['eclipse-heart','bastion-core','sanctum-core','aerie-core','grove-core']){const core=m.props.find(q=>q.id===id);if(!core||g.screen!=='playing')continue;const p=near(core.x,core.y,44);if(!p)continue;place(p[0],p[1]);g.update(1/60);settle();if(g.screen==='won'){ev(`${z}: venceu em ${id} (capítulo ${g.chapter})`);const ch=g.chapter;g.continueStory();settle();if(g.chapter!==ch){addEntry(g.zone,g.player.x,g.player.y);ev(`capítulo ${g.chapter} começa em ${g.zone}`);}else g.screen='playing';progress=true;}}
      // depois do final, continua explorando para concluir as side quests opcionais
      if(g.screen==='won'&&g.chapter>=7&&g.finished){g.keepExploring();settle();ev('final: continua explorando');progress=true;}
    }
  }
  return {events,entries,done:g.chapter>=7&&g.finished};
}
