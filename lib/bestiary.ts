// Bestiário: famílias de inimigos com pixel art própria, comportamentos distintos e ataques sempre avisados.
// O motor (lib/adventure.ts) chama estas funções com a própria instância do jogo, como em lib/bosses.ts.
import type {Entity} from './adventure';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Game = any;
const T=32;

export type BeastKind='spider'|'archer'|'skeleton'|'mole'|'shaman'|'magmite'|'serpent'|'crab';
export const BEAST_KINDS:BeastKind[]=['spider','archer','skeleton','mole','shaman','magmite','serpent','crab'];
export const isBeast=(e:Pick<Entity,'kind'>)=>(BEAST_KINDS as string[]).includes(e.kind);
export const BEAST_HP:Record<BeastKind,number>={spider:3,archer:3,skeleton:4,mole:4,shaman:4,magmite:4,serpent:5,crab:5};
export const BEAST_COINS:Record<BeastKind,number>={spider:9,archer:10,skeleton:11,mole:12,shaman:15,magmite:12,serpent:14,crab:13};
export const BEAST_NAME:Record<BeastKind,string>={spider:'Aranha da Copa',archer:'Goblin Arqueiro',skeleton:'Esqueleto Guerreiro',mole:'Toupeira Escavadora',shaman:'Xamã do Brejo',magmite:'Brasa Viva',serpent:'Serpente das Marés',crab:'Caranguejo-Escudo'};
export const ELITE_NAME:Record<BeastKind,string>={spider:'Aranha-Rainha',archer:'Capitão Goblin',skeleton:'Rei Esqueleto',mole:'Toupeira Colossal',shaman:'Xamã Ancião',magmite:'Coração de Magma',serpent:'Serpente Abissal',crab:'Caranguejo-Rei'};
// fraquezas que ensinam a usar o equipamento certo
export const BEAST_AFFINITY:Record<BeastKind,{weak?:string[];resist?:string[];immune?:string[]}>={
  spider:{weak:['fire','spin']},
  archer:{weak:['missile','lightning']},
  skeleton:{weak:['light','wave'],resist:['normal']},
  mole:{weak:['wave','ice']},
  shaman:{weak:['fire','light']},
  magmite:{weak:['ice','wave'],immune:['fire']},
  serpent:{weak:['lightning'],resist:['fire']},
  crab:{weak:['lightning','spin'],resist:['normal']},
};
export const isElite=(e:Pick<Entity,'id'>)=>e.id.startsWith('elite-');
// Torna um inimigo comum o encontro marcante da região: maior, mais resistente, mais lento para se recuperar e com nome.
export function makeElite(e:Entity){e.hp=e.maxHp=e.maxHp*3;e.scale=1.45;return e;}

/* ---------- pixel art ---------- */
type Sprite={pal:Record<string,string>;frames:string[][]};
const S:Record<string,Sprite>={
  spider:{pal:{o:'#160b1f',b:'#4a2862',h:'#8556a8',e:'#ff4a3d',l:'#2a1739',f:'#e9dcc0'},frames:[[
    '..l..........l..','...l...oo...l...','l...l.obbo.l...l','.l...obhhbo...l.','..lllobbbbollll.','....obbebbebo...','..lllobbbbbolll.','.l...obbbbbo..l.','l...l.obffbo.l..','...l...oooo..l..','..l...........l.'],[
    '.l............l.','..l....oo....l..','...l..obbo..l...','l...lobhhbol...l','.lll.obbbbo.lll.','....obbebbebo...','.lll.obbbbbo.ll.','l...lobbbbbol..l','...l..obffbo.l..','..l....oooo...l.','.l............l.']]},
  archer:{pal:{o:'#1c1a10',h:'#6b3f22',H:'#8a5530',g:'#77b84e',d:'#4f8a35',e:'#ffe24a',t:'#7d6a3c',T:'#5c4c28',w:'#c9a063',s:'#efe6cf',b:'#3b2a18'},frames:[[
    '....oooo......','...oHhhHo.....','..oHhhhhHo.w..','..ohggggho.ws.','gogeggegog.w.s','..ogggggdo.w.s','...odggdo..w.s','..ottttttogw.s','.gotTttTto.w.s','..otttttto.ws.','...oTttTo..w..','...ot..to.....','...ob..bo.....','..obb..bbo....'],[
    '....oooo......','...oHhhHo.....','..oHhhhhHo.w..','..ohggggho.ws.','gogeggegog.w.s','..ogggggdo.w.s','...odggdo..w.s','..ottttttogw.s','.gotTttTto.w.s','..otttttto.ws.','...oTttTo..w..','....ot.to.....','....ob.bo.....','...obb.bbo....']]},
  skeleton:{pal:{o:'#1a1a1f',w:'#e8e4d4',W:'#b9b3a0',k:'#2a2a33',r:'#ff6040',s:'#9aa7b8',S:'#d9e2ee',h:'#8a6a3a'},frames:[[
    '....oooooo....','...owwwwwwo...','..owwwwwwwwo..','..owkrwwkrwo..','..owwwkkwwwo..','...owwwwwwo...','....okwkwko..S.','.....owwo....S.','...owwWWwwo..S.','..ow.wWWw.wohh.','..o.owWWwo.o.h.','...ow.ww.wo....','.....owwo......','....ow..wo.....','....w....w.....','...ow....wo....','..oww....wwo...'],[
    '....oooooo....','...owwwwwwo...','..owwwwwwwwo..','..owkrwwkrwo..','..owwwkkwwwo..','...owwwwwwo...','....okwkwko..S.','.....owwo....S.','...owwWWwwo..S.','..ow.wWWw.wohh.','..o.owWWwo.o.h.','...ow.ww.wo....','.....owwo......','.....w..wo.....','....ow...w.....','...oww...wo....','.........wwo...']]},
  bones:{pal:{o:'#1a1a1f',w:'#e8e4d4',W:'#b9b3a0',k:'#2a2a33',r:'#ff6040'},frames:[[
    '..............','..............','..............','..............','..............','..............','..............','..............','..............','..............','....oooo......','...owkrwo.....','.w.owwwwo..ww.','ww..oooo..ww..','.wWw..w.wWw...','..ww.wWw..w...']]},
  mole:{pal:{o:'#1d140e',b:'#6b4a33',B:'#8c6447',p:'#f2a7b8',c:'#e8dcc4',k:'#111111'},frames:[[
    '.....oooooo.....','...ooBBBBBBoo...','..oBbbbbbbbbBo..','.oBbbkbbbbkbbBo.','.obbbbbppbbbbbo.','.obbbbbppbbbbbo.','ccobbbbbbbbbbocc','cccobbbbbbbbocc.','.c.oobbbbbboo.c.','....oooooooo....']]},
  shaman:{pal:{o:'#14141a',r:'#3f7a6c',R:'#2c5a4f',m:'#e8d9b0',e:'#7dffb0',s:'#8a6a3a',k:'#f2ecd8'},frames:[[
    '.........kk...','........kkkk..','...oooo..kk...','..orrrro.s....','.orrrrrro.s...','.ormmmmro.s...','.omemmemo.s...','.ormmmmro.s...','..orrrro..s...','.orRrrRro.s...','orrRrrRrros...','orrRrrRrro.s..','.orRrrRro..s..','.orrrrrro..s..','.oRRrrRRo..s..','..oooooo...s..']]},
  magmite:{pal:{o:'#2a0f08',c:'#5a2a1a',C:'#3d1c12',m:'#ff6a2a',y:'#ffd25a',e:'#fff3a0'},frames:[[
    '.....oooo.....','...ooccccoo...','..ocCmmccCco..','.ocmmyymmmcco.','.ocmeymmeymco.','ocmmmyyyymmmco','ocCmmmmmmmmCco','occmmmyymmmcco','.occmmmmmmcco.','..oocccccoo...','....oooooo....']]},
  cooled:{pal:{o:'#1a1a1a',c:'#4a4440',C:'#33302c',m:'#6e6660',y:'#8f857c',e:'#c9c2b8'},frames:[[
    '.....oooo.....','...ooccccoo...','..ocCmmccCco..','.ocmmyymmmcco.','.ocmeymmeymco.','ocmmmyyyymmmco','ocCmmmmmmmmCco','occmmmyymmmcco','.occmmmmmmcco.','..oocccccoo...','....oooooo....']]},
  serpent:{pal:{o:'#0c1d2a',b:'#2f7fa6',B:'#1f5e80',l:'#a8e6d8',e:'#ffe14d',f:'#6fd0e8'},frames:[[
    '....ffff......','...oooooo.....','..obbbbbbo....','.obbebbbbbo...','.obbbbbbBbbo..','..obllllbbbo..','...obllbBbbo..','....oblbbbo...','....obllbbo...','...obllbbbo...','..obllbbbo....','..obllbbo.....','...obbbbo.....']]},
  crab:{pal:{o:'#2a0e08',r:'#d0482e',R:'#9e2f1d',y:'#f2b07a',e:'#111111'},frames:[[
    '.oo..........oo.','orro........orro','orRro.e..e.orRro','.oRRo.o..o.oRRo.','..oo.oooooo.oo..','....orrrrrro....','...orryyyyrro...','..orrryyyyrrro..','..oRrrrrrrrrRo..','..o.R.R..R.R.o..','..o.o.o..o.o.o..'],[
    '..oo........oo..','.orro......orro.','.orRro.e..e.orRro','..oRRoo..ooRRo..','...oo.oooooo.oo.','....orrrrrro....','...orryyyyrro...','..orrryyyyrrro..','..oRrrrrrrrrRo..','...R.R....R.R...','...o.o....o.o...']]},
  knight:{pal:{o:'#121418',a:'#aeb8c6',A:'#7c8797',v:'#22262e',p:'#c0392b',s:'#dfe7f1',h:'#c9a24a',c:'#3b4f7a'},frames:[[
    '.....pp.......','....ppp.......','...oooooo.....','..oaaaaaao....','..oavvvvao....','..oaaAaaao..s.','...oaaaao...s.','..ocAaaAco..s.','.ocaAaaAaco.s.','.ocaaAAaaco.s.','.oca.aa.aco.h.','..oaAaaAao.hhh','..ocaaaaco..h.','...oaa.aao....','...oaa.aao....','...oAA.AAo....','..ooo...ooo...'],[
    '.....pp.......','....ppp.......','...oooooo.....','..oaaaaaao....','..oavvvvao....','..oaaAaaao..s.','...oaaaao...s.','..ocAaaAco..s.','.ocaAaaAaco.s.','.ocaaAAaaco.s.','.oca.aa.aco.h.','..oaAaaAao.hhh','..ocaaaaco..h.','...oaa.aao....','....aa.aao....','...oAA..AAo...','..ooo....ooo..']]},
  frostwolf:{pal:{o:'#1a2a36',w:'#e6f6ff',W:'#b5d6e6',b:'#7fb3cf',e:'#1c3f5a',n:'#222222'},frames:[[
    '..o.o.............','.owowo............','.owwwwoo..........','oweWwwwwoooooooo..','nwwwwwwwwwwwwwwwo.','.ooowwwWWwwwwwwwwo','...owwWWWwwwwbbwo.','...owwwWWwwwbbbo..','...owo.owwo..owo..','...owo.owo...owo..','...oo..oo....oo...'],[
    '..o.o.............','.owowo............','.owwwwoo..........','oweWwwwwoooooooo..','nwwwwwwwwwwwwwwwo.','.ooowwwWWwwwwwwwwo','...owwWWWwwwwbbwo.','...owwwWWwwwbbbo..','....owowwo..owo...','...owo..owo..owo..','..oo....oo....oo..']]},
  salamander:{pal:{o:'#2a0d06',r:'#c8442a',R:'#8f2b18',y:'#ffcf55',f:'#ff7a2a',e:'#fff3a0'},frames:[[
    '........f.f.f.....','.......ofofofo....','.ooooooorrrrrroo..','orrRrrRrrrrrrrrro.','orrrrrrrrrrrreyrro','.orRrrRrrrrrrrrro.','..oyyyyyyyyyyyo...','..oro.oro..oro....','..oo..oo...oo.....'],[
    '.........f.f.f....','.......ofofofo....','.ooooooorrrrrroo..','orrRrrRrrrrrrrrro.','orrrrrrrrrrrreyrro','.orRrrRrrrrrrrrro.','..oyyyyyyyyyyyo...','...oro.oro.oro....','...oo..oo..oo.....']]},
  shade:{pal:{o:'#0d140f',s:'#2f4a35',S:'#1e3022',g:'#9dffb4',w:'#4f7a58'},frames:[[
    '....oooooo....','...osssssso...','..osSssssSso..','..osgsssgsso..','..ossssssso...','.ossSssssSsso.','.osssssssssso.','osssSssssSssso','osssssssssssso','.osSssssssSso.','.osssssssssso.','..osswsswsso..','..ow.ws.ws.wo.','...w..w..w....']]},
  sandworm:{pal:{o:'#2a1a0a',s:'#c89452',S:'#9a6a32',t:'#f2e8cf',m:'#5a1a14'},frames:[[
    '....oooooooo....','...osSssssSso...','..osmmmmmmmmso..','..omtmtmtmtmmo..','..ommmmmmmmmmo..','..otmtmtmtmtmo..','...osmmmmmmso...','...osssssssso...','....oSssssSo....','....osssssso....','...oSssssssSo...','..osssssssssso..','.oSsssssssssSso.']]},
  wisp:{pal:{c:'#ffffff',b:'#bff6ff',B:'#6fd8ff',o:'#2a6f9a'},frames:[[
    '....b.....','...bb.....','...bBb.b..','..bBBbbb..','..bBcBBb..','.bBcccBBb.','.bBcccccB.','.bBcccccBb','..BccccB..','..BBccBB..','...BBBB...','....oo....'],[
    '.....b....','....bb..b.','..b.bBbbb.','..bBBbbb..','..bBcBBb..','.bBcccBBb.','.bBcccccB.','bBcccccBb.','..BccccB..','..BBccBB..','...BBBB...','....oo....']]},
};
export const SPRITE_KINDS=new Set(['spider','archer','skeleton','mole','shaman','magmite','serpent','crab','knight','shieldknight','frostwolf','salamander','shade','sandworm','wisp']);
const U=4,cache=new Map<string,HTMLCanvasElement>();
let generatedSprites:Partial<Record<BeastKind,HTMLImageElement>>|undefined;
function frameCanvas(name:string,i:number){const key=`${name}:${i}`;let cv=cache.get(key);if(cv)return cv;const sp=S[name],rows=sp.frames[i%sp.frames.length],w=Math.max(...rows.map(r=>r.length)),h=rows.length;
  cv=document.createElement('canvas');cv.width=w*U;cv.height=h*U;const c=cv.getContext('2d')!;rows.forEach((row,y)=>[...row].forEach((ch,x)=>{const col=sp.pal[ch];if(!col)return;c.fillStyle=col;c.fillRect(x*U,y*U,U,U);}));cache.set(key,cv);return cv;}
function blit(c:CanvasRenderingContext2D,name:string,frame:number,x:number,y:number,face:number,sx:number,sy:number,filter:string,alpha=1){
  const generated=generatedSprites?.[name as BeastKind];c.save();c.globalAlpha*=alpha;c.translate(Math.round(x),Math.round(y));c.scale(face*sx,sy);if(filter&&filter!=='none')c.filter=filter;
  if(generated?.complete&&generated.naturalWidth){const fw=generated.naturalWidth/4;c.imageSmoothingEnabled=false;c.drawImage(generated,(frame%4)*fw,0,fw,generated.naturalHeight,-36,-68,72,68);}else{const cv=frameCanvas(name,frame),w=cv.width,h=cv.height;c.drawImage(cv,-w/2,-h,w,h);}c.restore();}

const dist=(ax:number,ay:number,bx:number,by:number)=>Math.hypot(ax-bx,ay-by);
function step(g:Game,e:Entity,mx:number,my:number,r:number,air=false){if(!g.collides(e.x+mx,e.y,r,air))e.x+=mx;if(!g.collides(e.x,e.y+my,r,air))e.y+=my;}
function toward(g:Game,e:Entity,tx:number,ty:number,speed:number,dt:number,r:number){const d=dist(tx,ty,e.x,e.y)||1;step(g,e,(tx-e.x)/d*speed*dt,(ty-e.y)/d*speed*dt,r);}
const setSt=(e:Entity,st:string,t:number)=>{e.st=st;e.stT=t;};
const elite=(e:Entity)=>isElite(e)?1.25:1;

/* ---------- comportamento ---------- */
export function updateBeast(g:Game,e:Entity,d:number,ex:number,ey:number,dt:number,r:number){
  const p=g.player,k=e.kind as BeastKind;if(!e.st)setSt(e,k==='spider'?'hide':k==='mole'?'under':k==='serpent'?'sub':'idle',k==='archer'?1+Math.random():k==='shaman'?3:0);
  e.stT-=dt;const awake=d<(k==='archer'?320:k==='shaman'?300:220);
  if(k==='spider'){ // emboscada: escondida até o herói chegar perto, avisa e salta
    if(e.st==='hide'){if(d<105){setSt(e,'rise',.5);g.tone(220,.08,'triangle');}return;}
    if(e.st==='rise'){if(e.stT<=0){const l=d||1;e.cdx=ex/l;e.cdy=ey/l;setSt(e,'lunge',.32);}return;}
    if(e.st==='lunge'){step(g,e,e.cdx*270*elite(e)*dt,e.cdy*270*elite(e)*dt,r);if(d<22)g.damage(e.x,e.y);if(e.stT<=0)setSt(e,'recover',.9);return;}
    if(e.st==='recover'){if(e.stT<=0)setSt(e,'chase',1.6);return;}
    toward(g,e,p.x,p.y,58,dt,r);if(d<20)g.damage(e.x,e.y);if(e.stT<=0)setSt(e,d>150?'hide':'rise',.5);return;}
  if(k==='archer'){ // atirador: mantém distância e mira com uma linha de aviso
    if(!awake)return;if(e.st==='aim'){if(e.stT>.25){e.tx=p.x;e.ty=p.y;}if(e.stT<=0){const a=Math.atan2(e.ty-(e.y-14),e.tx-e.x),v=235;g.projectiles.push({x:e.x,y:e.y-14,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:2.2,color:'#e9dcc0'});if(isElite(e))for(const da of [-.2,.2])g.projectiles.push({x:e.x,y:e.y-14,vx:Math.cos(a+da)*v,vy:Math.sin(a+da)*v,life:2.2,color:'#e9dcc0'});g.tone(880,.05,'square');setSt(e,'idle',2.1+Math.random()*.6);}return;}
    const l=d||1;if(d<125)step(g,e,-ex/l*62*dt,-ey/l*62*dt,r);else if(d>235)step(g,e,ex/l*48*dt,ey/l*48*dt,r);else{const s=e.mi?1:-1;step(g,e,-ey/l*34*s*dt,ex/l*34*s*dt,r);}
    if(Math.random()<dt*.4)e.mi=e.mi?0:1;if(e.stT<=0&&d<300)setSt(e,'aim',.75);if(d<16)g.damage(e.x,e.y);return;}
  if(k==='skeleton'){ // perseguidor: ergue a espada antes do golpe; desmonta uma vez e se remonta
    if(e.st==='bones'){if(e.stT<=0){e.hp=Math.ceil(e.maxHp/2);setSt(e,'rise',.6);g.burst(e.x,e.y-10,'#e8e4d4',16);g.message('O esqueleto se remontou! Golpeie os ossos enquanto estão no chão.');}return;}
    if(e.st==='rise'){if(e.stT<=0)setSt(e,'idle',0);return;}
    if(!awake)return;if(e.st==='wind'){if(e.stT<=0){const l=d||1;e.cdx=ex/l;e.cdy=ey/l;setSt(e,'slash',.2);}return;}
    if(e.st==='slash'){step(g,e,e.cdx*170*dt,e.cdy*170*dt,r);if(d<26)g.damage(e.x,e.y);if(e.stT<=0)setSt(e,'rest',.6);return;}
    if(e.st==='rest'){if(e.stT<=0)setSt(e,'idle',0);return;}
    toward(g,e,p.x,p.y,56*elite(e),dt,r);if(d<20)g.damage(e.x,e.y);if(d<48)setSt(e,'wind',.45);return;}
  if(k==='mole'){ // emboscada subterrânea: o monte de terra persegue, avisa e a toupeira salta para fora
    if(e.st==='under'){if(!awake){e.stT=0;return;}toward(g,e,p.x,p.y,72,dt,r);if((d<26||e.stT<-3.2))setSt(e,'emerge',.65);return;}
    if(e.st==='emerge'){if(e.stT<=0){g.burst(e.x,e.y-6,'#8a6a45',22);g.kick(3,.12);if(d<38)g.damage(e.x,e.y);setSt(e,'exposed',isElite(e)?1.3:1.6);}return;}
    if(e.st==='exposed'){if(e.stT<=0)setSt(e,'under',0);return;}setSt(e,'under',0);return;}
  if(k==='shaman'){ // suporte: cura aliados ou cria espinhos sob o herói
    if(!awake)return;const l=d||1;if(d<140)step(g,e,-ex/l*55*dt,-ey/l*55*dt,r);else if(d>240)step(g,e,ex/l*40*dt,ey/l*40*dt,r);
    if(e.st==='chant'){if(e.stT<=0){const hurt=g.map.enemies.filter((q:Entity)=>q!==e&&q.hp>0&&q.dying<=0&&q.hp<q.maxHp&&!['boss','colossus','tidewarden','stonebeast','vinebeast'].includes(q.kind)&&dist(q.x,q.y,e.x,e.y)<170);
      if(hurt.length){for(const q of hurt){q.hp=Math.min(q.maxHp,q.hp+2);g.ring(q.x,q.y-12,'#7dffb0',40);g.floatText(q.x,q.y-40,'+2','#7dffb0');}g.message('O Xamã do Brejo curou os aliados! Derrube-o primeiro.');}
      else addZone(g,p.x,p.y,26,'thorn',.8,1.4);setSt(e,'idle',isElite(e)?3:4.2);}return;}
    if(e.stT<=0)setSt(e,'chant',.9);return;}
  if(k==='magmite'){ // área: incha avisando, explode e deixa brasas no chão; depois esfria e fica vulnerável
    if(e.st==='cool'){if(e.stT<=0)setSt(e,'idle',0);return;}
    if(e.st==='swell'){if(e.stT<=0){g.burst(e.x,e.y-12,'#ff8a3c',30);g.ring(e.x,e.y-6,'#ffb35c',70);g.kick(5,.2);if(d<44)g.damage(e.x,e.y);addZone(g,e.x,e.y,isElite(e)?40:30,'ember',.25,3);setSt(e,'cool',2.2);}return;}
    if(!awake)return;const hop=Math.abs(Math.sin(e.timer*5));toward(g,e,p.x,p.y,(40+hop*30)*elite(e),dt,r);if(d<70)setSt(e,'swell',.75);return;}
  if(k==='serpent'){ // aquática: mergulha, reaparece avisando e cospe em leque
    if(e.st==='sub'){if(e.stT<=-1.8&&awake){relocate(g,e);setSt(e,'rise',.55);}return;}
    if(e.st==='rise'){if(e.stT<=0){const a=Math.atan2(ey,ex);for(const da of isElite(e)?[-.32,-.16,0,.16,.32]:[-.22,0,.22])g.projectiles.push({x:e.x,y:e.y-18,vx:Math.cos(a+da)*140,vy:Math.sin(a+da)*140,life:2.6,color:'#8fe8ff'});g.tone(330,.08,'triangle');setSt(e,'up',1.3);}return;}
    if(e.st==='up'){if(e.stT<=0)setSt(e,'sub',0);return;}setSt(e,'sub',0);return;}
  if(k==='crab'){ // defensivo: a carapaça bloqueia golpes de frente; vira devagar, então flanqueie
    const want=Math.atan2(ey,ex);let diff=want-(e.phase??want);diff=Math.atan2(Math.sin(diff),Math.cos(diff));e.phase=(e.phase??want)+Math.sign(diff)*Math.min(Math.abs(diff),1.5*dt);
    if(!awake)return;if(e.st==='snap'){if(e.stT<=0){e.cdx=Math.cos(e.phase);e.cdy=Math.sin(e.phase);setSt(e,'dash',.2);}return;}
    if(e.st==='dash'){step(g,e,e.cdx*200*dt,e.cdy*200*dt,r);if(d<24)g.damage(e.x,e.y);if(e.stT<=0)setSt(e,'rest',.7);return;}
    if(e.st==='rest'){if(e.stT<=0)setSt(e,'idle',1.2);return;}
    if(e.stT<=0){e.mi=e.mi?0:1;e.stT=1.2;}const s=e.mi?1:-1;step(g,e,-Math.sin(e.phase)*40*s*dt,Math.cos(e.phase)*40*s*dt,r);
    if(d<58&&Math.abs(diff)<.6)setSt(e,'snap',.5);return;}
}
function relocate(g:Game,e:Entity){const tx=Math.floor(e.homeX/T),ty=Math.floor(e.homeY/T),spots:[number,number][]=[];for(let y=ty-3;y<=ty+3;y++)for(let x=tx-3;x<=tx+3;x++)if(g.map.tiles[y]?.[x]===2)spots.push([x,y]);if(!spots.length)return;const [x,y]=spots[Math.floor(Math.random()*spots.length)];e.x=x*T+T/2;e.y=y*T+T/2;}

// Retorna true quando o golpe não causa dano (enterrado, submerso, carapaça de frente).
export function beastBlocks(g:Game,e:Entity,kx:number,ky:number,source:string){
  if(!isBeast(e))return false;const k=e.kind as BeastKind;
  const clank=(txt:string)=>{g.floatText(e.x,e.y-40,txt,'#bdbdbd');g.burst(e.x,e.y-16,'#d9d2c0',6);g.tone(1200,.04,'square');e.hit=.15;return true;};
  if(k==='mole'&&e.st==='under'){if(source==='wave'){setSt(e,'exposed',1.8);return false;}return clank('enterrada');}
  if(k==='serpent'&&e.st==='sub')return clank('submersa');
  if(k==='spider'&&e.st==='hide')setSt(e,'recover',.9);
  if(k==='skeleton'&&e.st==='bones'){e.hp=Math.min(e.hp,.1);return false;}
  if(k==='crab'){if(source==='spin'||source==='wave'||source==='lightning')return false;if(source==='repulse'){e.stun=2;g.message('O Caranguejo-Escudo virou de barriga para cima!');return false;}
    const front=Math.cos((e.phase??0)-Math.atan2(-ky,-kx));if(front>.45)return clank('carapaça!');}
  return false;
}
// Golpe fatal no esqueleto: na primeira vez ele desmonta em vez de morrer.
export function beastOnLethal(g:Game,e:Entity){if(e.kind==='skeleton'&&!e.mi&&e.st!=='bones'){e.mi=1;e.hp=1;setSt(e,'bones',3);e.vx=0;e.vy=0;g.burst(e.x,e.y-10,'#e8e4d4',20);g.message('O esqueleto desmontou! Acerte os ossos antes que se remontem.');return true;}return false;}

/* ---------- zonas perigosas no chão (espinhos do xamã, brasas da Brasa Viva) ---------- */
type Zone={x:number;y:number;r:number;kind:'thorn'|'ember';warn:number;t:number;max:number;zone:string};
function addZone(g:Game,x:number,y:number,r:number,kind:Zone['kind'],warn:number,life:number){g.beastZones=(g.beastZones??[]).concat([{x,y,r,kind,warn,t:warn+life,max:warn+life,zone:g.zone}]);}
export function updateBeastZones(g:Game,dt:number){const p=g.player;g.beastZones=(g.beastZones??[]).filter((z:Zone)=>z.zone===g.zone&&(z.t-=dt)>0);
  for(const z of g.beastZones as Zone[]){const active=z.max-z.t>z.warn;if(active&&p.jump<=0&&dist(p.x,p.y,z.x,z.y)<z.r)g.damage(z.x,z.y);}}
export function drawBeastZones(g:Game,c:CanvasRenderingContext2D){for(const z of (g.beastZones??[]) as Zone[]){const age=z.max-z.t,active=age>z.warn,k=active?Math.min(1,z.t/.4):age/z.warn;c.save();
  if(!active){c.globalAlpha=.35+.35*Math.abs(Math.sin(g.elapsed*14));c.strokeStyle=z.kind==='ember'?'#ffb35c':'#7dffb0';c.lineWidth=2;c.beginPath();c.ellipse(z.x,z.y,z.r*k,z.r*.5*k,0,0,Math.PI*2);c.stroke();c.restore();continue;}
  c.globalAlpha=.55*k;c.fillStyle=z.kind==='ember'?'#ff6a2a':'#3d7a4a';c.beginPath();c.ellipse(z.x,z.y,z.r,z.r*.5,0,0,Math.PI*2);c.fill();c.globalAlpha=k;
  for(let i=0;i<7;i++){const a=i*0.9+z.x,rx=Math.cos(a)*z.r*.7,ry=Math.sin(a)*z.r*.35;if(z.kind==='ember'){c.fillStyle=i%2?'#ffd25a':'#ff8a3c';c.fillRect(z.x+rx-2,z.y+ry-3-Math.abs(Math.sin(g.elapsed*8+i))*4,4,4);}else{c.fillStyle='#b9ff9e';c.beginPath();c.moveTo(z.x+rx-4,z.y+ry);c.lineTo(z.x+rx,z.y+ry-12);c.lineTo(z.x+rx+4,z.y+ry);c.fill();}}c.restore();}}

/* ---------- desenho ---------- */
export function drawBeastSprite(g:Game,c:CanvasRenderingContext2D,e:Entity,filter:string,sx:number,sy:number,yo:number){
  generatedSprites=g.assets?.enemySprites;
  const p=g.player,t=g.elapsed,face=(e.vx?e.vx<0:p.x<e.x)?-1:1,walk=Math.floor((e.timer+e.x*.01)*6)%2,x=e.x,y=e.y+yo,k=e.kind;
  if(k==='spider'){if(e.st==='hide'){c.save();c.globalAlpha*=.5;c.fillStyle='#1b2614';c.beginPath();c.ellipse(x,y-4,16,7,0,0,Math.PI*2);c.fill();c.restore();c.fillStyle='#ff4a3d';c.fillRect(x-5,y-8,3,3);c.fillRect(x+3,y-8,3,3);return;}
    if(e.st==='rise')warn(c,x,y-34,t);blit(c,'spider',e.st==='lunge'?1:walk,x+(e.st==='rise'?Math.sin(t*50)*1.5:0),y,face,sx,sy,filter);return;}
  if(k==='archer'){blit(c,'archer',walk,x,y,face,sx,sy,filter);if(e.st==='aim'){const lock=e.stT<=.25;c.save();c.globalAlpha=lock?.85:.25+.4*(1-e.stT/.75);c.strokeStyle=lock?'#ff6b5c':'#ffe9a8';c.lineWidth=lock?2:1;c.setLineDash([6,5]);c.beginPath();c.moveTo(x,y-14);c.lineTo(e.tx,e.ty-6);c.stroke();c.restore();}return;}
  if(k==='skeleton'){if(e.st==='bones'){blit(c,'bones',0,x,y,face,1,1,filter);c.save();c.globalAlpha=.6;c.strokeStyle='#ff6040';c.lineWidth=2;c.beginPath();c.arc(x,y-10,14,-Math.PI/2,-Math.PI/2+Math.PI*2*Math.max(0,Math.min(1,1-e.stT/3)));c.stroke();c.restore();return;}
    if(e.st==='wind')warn(c,x,y-58,t);blit(c,'skeleton',walk,x,y-(e.st==='rise'?(e.stT/.6)*-8:0),face,sx,sy*(e.st==='rise'?Math.max(.3,1-e.stT/.6):1),filter);return;}
  if(k==='mole'){if(e.st==='under'||e.st==='emerge'){const sh=e.st==='emerge'?Math.sin(t*60)*2:0;c.fillStyle='#6b4f34';c.beginPath();c.ellipse(x+sh,y-3,15,7,0,0,Math.PI*2);c.fill();c.fillStyle='#8a6a45';c.fillRect(x-6+sh,y-8,4,3);c.fillRect(x+3+sh,y-9,5,3);if(e.st==='emerge'){c.save();c.globalAlpha=.4+.4*Math.abs(Math.sin(t*16));c.strokeStyle='#ff6b5c';c.lineWidth=2;c.beginPath();c.ellipse(x,y,38,19,0,0,Math.PI*2);c.stroke();c.restore();}return;}
    blit(c,'mole',0,x,y,face,sx,sy,filter);return;}
  if(k==='shaman'){if(e.st==='chant'){c.save();c.globalAlpha=.3+.3*Math.abs(Math.sin(t*10));c.strokeStyle='#7dffb0';c.lineWidth=2;c.beginPath();c.arc(x,y-24,18+Math.max(0,Math.min(.9,.9-e.stT))*20,0,Math.PI*2);c.stroke();c.restore();}blit(c,'shaman',0,x,y+Math.sin(t*3)*1.5,face,sx,sy,filter);c.save();c.globalAlpha=.5+.4*Math.sin(t*6);c.fillStyle='#9dffcf';c.fillRect(x+face*(19)-3,y-50,6,6);c.restore();return;}
  if(k==='magmite'){const hop=e.st==='cool'?0:Math.abs(Math.sin(e.timer*5))*6;if(e.st==='swell'){c.save();c.globalAlpha=.35+.35*Math.abs(Math.sin(t*18));c.strokeStyle='#ffb35c';c.lineWidth=2;c.beginPath();c.ellipse(x,y,44,22,0,0,Math.PI*2);c.stroke();c.restore();}
    const sw=e.st==='swell'?1+Math.max(0,Math.min(.75,.75-e.stT))*.5:1;blit(c,e.st==='cool'?'cooled':'magmite',0,x,y-hop,face,sx*sw,sy*sw,filter);return;}
  if(k==='serpent'){c.save();c.globalAlpha=.6;c.strokeStyle='#bfefff';c.lineWidth=1.5;for(let i=0;i<2;i++){const rr=10+((t*20+i*12)%24);c.beginPath();c.ellipse(x,y,rr,rr*.4,0,0,Math.PI*2);c.stroke();}c.restore();
    if(e.st==='sub')return;const rise=e.st==='rise'?1-e.stT/.55:1;if(e.st==='rise'){c.save();c.globalAlpha=.6;c.fillStyle='#bfefff';for(let i=0;i<4;i++)c.fillRect(x-10+i*7,y-6-((t*40+i*9)%16),3,3);c.restore();}
    c.save();c.beginPath();c.rect(x-40,y-80,80,80);c.clip();blit(c,'serpent',0,x,y+(1-rise)*36,face,sx,sy,filter);c.restore();return;}
  if(k==='crab'){if(e.st==='snap')warn(c,x,y-40,t);c.save();c.translate(x,y);blit(c,'crab',e.st==='dash'||e.st==='snap'?1:walk,0,0,Math.cos(e.phase??0)<0?-1:1,sx,sy,filter);c.restore();
    if(e.stun>0){c.fillStyle='#ffe9a8';c.fillRect(x-8,y-36+Math.sin(t*12)*2,4,4);c.fillRect(x+5,y-38+Math.cos(t*12)*2,4,4);}return;}
  // inimigos antigos com sprite novo (antes eram o golem ou o morcego recoloridos)
  if(k==='knight'||k==='shieldknight'){blit(c,'knight',walk,x,y,face,sx,sy,filter);return;}
  if(k==='frostwolf'){blit(c,'frostwolf',walk,x,y,face,sx,sy,filter);return;}
  if(k==='salamander'){c.save();c.globalAlpha*=.3+.12*Math.sin(t*8);c.fillStyle='#ff6332';c.beginPath();c.arc(x,y-12,24,0,Math.PI*2);c.fill();c.restore();blit(c,'salamander',walk,x,y,face,sx,sy,filter);return;}
  if(k==='shade'){const ph=e.timer%3.6;blit(c,'shade',0,x,y+Math.sin(t*3)*2,face,sx,sy,filter,ph<1.1?.25:.9);return;}
  if(k==='sandworm'){const buried=e.timer%4.2<1.55;if(buried){c.fillStyle='#a77a42';c.beginPath();c.ellipse(x,y-4,20,9,0,0,Math.PI*2);c.fill();c.fillStyle='#c89452';c.fillRect(x-8,y-10,5,4);c.fillRect(x+4,y-11,6,4);return;}blit(c,'sandworm',0,x,y,face,sx,sy,filter);return;}
  if(k==='wisp'){blit(c,'wisp',walk,x,y,1,sx,sy,filter);return;}
}
function warn(c:CanvasRenderingContext2D,x:number,y:number,t:number){c.save();c.globalAlpha=.6+.4*Math.abs(Math.sin(t*14));c.fillStyle='#ff6b5c';c.fillRect(x-2,y-10,4,8);c.fillRect(x-2,y,4,3);c.restore();}
// Coroa e nome dos encontros marcantes.
export function drawEliteMark(c:CanvasRenderingContext2D,e:Entity,t:number){if(!isElite(e)||!isBeast(e))return;const y=e.y-50*(e.scale??1)+Math.sin(t*3)*2;c.save();c.fillStyle='#ffd45a';c.fillRect(e.x-9,y,18,4);for(const dx of [-9,-2,5])c.fillRect(e.x+dx,y-5,4,5);c.font='bold 10px Georgia, serif';c.textAlign='center';c.fillStyle='rgba(0,0,0,.6)';c.fillText(ELITE_NAME[e.kind as BeastKind],e.x+1,y-8);c.fillStyle='#ffe9a8';c.fillText(ELITE_NAME[e.kind as BeastKind],e.x,y-9);c.restore();}
