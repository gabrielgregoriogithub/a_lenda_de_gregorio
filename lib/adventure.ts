import {BIOMES,NPCS,makeWorld,type Biome} from './world';
export const T=32;
export const ZOOM_STEPS=[1,1.15,1.3,1.5,1.75,2];
export type Direction='up'|'down'|'left'|'right';
export type Zone='world'|'cave1'|'cave2'|'temple';
export type Entity={id:string;x:number;y:number;hp:number;maxHp:number;kind:'slime'|'bat'|'boss'|'golem';timer:number;hit:number;homeX:number;homeY:number;tint?:string;vx:number;vy:number;flash:number;dying:number;frozen:number;respawn?:number};
export type Prop={id:string;x:number;y:number;kind:'tree'|'rock'|'bush'|'npc'|'chest'|'door'|'exit'|'stairs'|'lever'|'relic'|'torch'|'totem'|'barrier';solid?:boolean;open?:boolean;item?:'key'|'coins'|'fragment'|'heart'|'potion'|'crystals'|'bosskey'|'bow'|ArrowKind;by?:string[];guard?:string;to?:Zone;ax?:number;ay?:number;needs?:'bosskey';label?:string};
export type ArrowKind='fire'|'light'|'ice';
export type Arrow='normal'|ArrowKind;
export const ARROW_NAME:Record<Arrow,string>={normal:'Flecha comum',fire:'Flecha de fogo',light:'Flecha de luz',ice:'Flecha de gelo'};
const ARROW_COLOR:Record<Arrow,string>={normal:'#e9dcc0',fire:'#ff9a3c',light:'#fff3a0',ice:'#9fe6ff'};
export type GameMap={width:number;height:number;tiles:number[][];props:Prop[];enemies:Entity[];biome?:Biome[][]};
export type Cheats={life:boolean;walls:boolean};
export type Snapshot={screen:'ready'|'playing'|'paused'|'dead'|'won';zone:Zone;hp:number;maxHp:number;coins:number;potions:number;key:boolean;met:boolean;entered:boolean;levers:number;bossDead:boolean;objective:string;location:string;hint:string;notice:string;x:number;y:number;defeated:number;elapsed:number;fragments:number;bossKey:boolean;deepest:number;rewinding:boolean;rewindLeft:number;canRewind:boolean;fast:boolean;shop:boolean;sword:number;heartsBought:number;bow:boolean;arrow:Arrow;arrows:ArrowKind[]};
const dirs:Record<Direction,{x:number;y:number;angle:number;row:number}>={down:{x:0,y:1,angle:Math.PI/2,row:0},right:{x:1,y:0,angle:0,row:1},up:{x:0,y:-1,angle:-Math.PI/2,row:2},left:{x:-1,y:0,angle:Math.PI,row:3}};
const center=(n:number)=>n*T+T/2;
const HP:Record<Entity['kind'],number>={boss:12,golem:8,bat:2,slime:3};
const entity=(id:string,x:number,y:number,kind:Entity['kind'],tint?:string):Entity=>({id,x:center(x),y:center(y),homeX:center(x),homeY:center(y),hp:HP[kind],maxHp:HP[kind],kind,timer:0,hit:0,tint,vx:0,vy:0,flash:0,dying:0,frozen:0});
export const ZONES:Zone[]=['world','cave1','cave2','temple'];
const FLOOR:Record<Zone,number>={world:0,cave1:1,cave2:2,temple:3};
const ZONE_NAME:Record<Exclude<Zone,'world'>,string>={cave1:'Templo da Lua · 1º andar',cave2:'Galerias Submersas · 2º andar',temple:'Câmara do Guardião · 3º andar'};
const CAVE_FILTER:Record<Exclude<Zone,'world'>,string>={cave1:'brightness(1.08) saturate(.9)',cave2:'hue-rotate(-28deg) brightness(1) saturate(1.1)',temple:'none'};
const CAVE_FLOOR:Record<Exclude<Zone,'world'>,string>={cave1:'brightness(.58) saturate(.75)',cave2:'hue-rotate(-28deg) brightness(.52) saturate(1.05)',temple:'none'};
const SPAWN={x:center(46),y:center(42)};
const HISTORY_STEP=.1,HISTORY_MAX=300; // ~30 s para voltar no tempo
const JUMP_TIME=.5,JUMP_SPEED=230,JUMP_HEIGHT=26,ATTACK_TIME=.23;
const CAVE_NOTES=[196,233.08,293.66,261.63,220,196,174.61,220],TEMPLE_NOTES=[220,261.63,329.63,293.66,246.94,220,196,246.94];
const SAVE_VERSION=2;
const CHARGE_TIME=.55,SPIN_TIME=.38,PICKUP_LIFE=9,ARROW_SPEED=430,FREEZE_TIME=8,ICE_TIME=10,RESPAWN_TIME=75;
const WARN='brightness(.55) sepia(1) saturate(9) hue-rotate(-35deg)',RAGE='sepia(.45) saturate(1.8) hue-rotate(-25deg)';
// Ciclo do guardião: mais curto na segunda fase (metade da vida).
const bossCycle=(e:Entity)=>e.hp<=e.maxHp/2?2.8:3.4;
type Shot={x:number;y:number;vx:number;vy:number;kind:Arrow;life:number};
export const SHOP=[{id:'potion',name:'Poção de vida',desc:'Recupera todos os corações.',price:25},{id:'heart',name:'Coração extra',desc:'+2 de vida máxima (até 2 vezes).',price:100},{id:'sword',name:'Espada forjada',desc:'Cada golpe causa o dobro de dano.',price:150}] as const;
export type ShopItem=typeof SHOP[number]['id'];
type Pickup={x:number;y:number;kind:'heart'|'gem';life:number};
const WHITE='brightness(0) invert(1)',ICE='hue-rotate(170deg) saturate(.45) brightness(1.45)';

/* ---------- andares do templo ---------- */
function blankFloor(width:number,height:number){return Array.from({length:height},(_,y)=>Array.from({length:width},(_,x)=>x===0||y===0||x===width-1||y===height-1?4:3));}
const fill=(tiles:number[][],x0:number,y0:number,x1:number,y1:number,t:number)=>{for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)tiles[y][x]=t;};
function makeCave1():GameMap{
const tiles=blankFloor(26,20),props:Prop[]=[];
for(let x=1;x<25;x++)if(![6,12,13,19].includes(x))tiles[10][x]=4;
fill(tiles,9,2,16,7,6);fill(tiles,11,4,14,5,3);
fill(tiles,3,14,8,15,6);fill(tiles,17,14,22,15,6);
for(let y=1;y<10;y++)if(y!==5)tiles[y][6]=4;
props.push({kind:'stairs',id:'c1-up',x:center(12.5),y:center(18),solid:true,to:'world',ax:47.5,ay:7,label:'Subir para as Ruínas'});
props.push({kind:'stairs',id:'c1-down',x:center(2),y:center(2),solid:true,to:'cave2',ax:2,ay:12.5,label:'Descer ao 2º andar'});
props.push({kind:'chest',id:'c1-heart',x:center(12.5),y:center(4.5),solid:true,item:'heart'},{kind:'chest',id:'c1-potion',x:center(2),y:center(17),solid:true,item:'potion'},{kind:'chest',id:'c1-crystals',x:center(23),y:center(2),solid:true,item:'crystals'});
props.push({kind:'chest',id:'c1-fire',x:center(23),y:center(7),solid:true,item:'fire'});
props.push({kind:'torch',id:'c1-torch-a',x:center(7),y:center(3),solid:true},{kind:'torch',id:'c1-torch-b',x:center(7),y:center(7),solid:true},{kind:'barrier',id:'c1-barrier',x:center(6),y:center(5),solid:true,by:['c1-torch-a','c1-torch-b']});
props.push({kind:'rock',id:'c1-rock-a',x:center(20),y:center(7),solid:true},{kind:'rock',id:'c1-rock-b',x:center(4),y:center(8),solid:true});
return{width:26,height:20,tiles,props,enemies:[entity('c1-bat-a',4,4,'bat'),entity('c1-bat-b',20,4,'bat'),entity('c1-bat-c',19,13,'bat'),entity('c1-slime-a',8,12,'slime'),entity('c1-slime-b',21,17,'slime'),entity('c1-slime-c',16,8,'slime')]};
}
function makeCave2():GameMap{
const tiles=blankFloor(30,22),props:Prop[]=[];
fill(tiles,14,1,15,20,2);
for(let x=20;x<=28;x++){tiles[2][x]=4;tiles[9][x]=4;}for(let y=2;y<=9;y++){tiles[y][28]=4;if(y!==6)tiles[y][20]=4;}
fill(tiles,4,12,10,17,6);fill(tiles,6,14,8,15,3);
fill(tiles,18,13,24,14,2);
props.push({kind:'stairs',id:'c2-up',x:center(2),y:center(10),solid:true,to:'cave1',ax:2,ay:4,label:'Subir ao 1º andar'});
props.push({kind:'stairs',id:'c2-down',x:center(27),y:center(19),solid:true,to:'temple',ax:12.5,ay:16,needs:'bosskey',label:'Descer à Câmara do Guardião'});
props.push({kind:'chest',id:'c2-bosskey',x:center(26),y:center(4),solid:true,item:'bosskey',guard:'c2-golem'},{kind:'chest',id:'c2-island',x:center(7),y:center(14.5),solid:true,item:'crystals'},{kind:'chest',id:'c2-potion',x:center(3),y:center(19),solid:true,item:'potion'},{kind:'chest',id:'c2-coins',x:center(18),y:center(3),solid:true,item:'coins'},{kind:'chest',id:'c2-light',x:center(18),y:center(7),solid:true,item:'light'},{kind:'chest',id:'c2-ice',x:center(22),y:center(4),solid:true,item:'ice',guard:'c2-golem'});
props.push({kind:'totem',id:'c2-totem',x:center(23),y:center(11),solid:true},{kind:'barrier',id:'c2-barrier',x:center(20),y:center(6),solid:true,by:['c2-totem']});
return{width:30,height:22,tiles,props,enemies:[entity('c2-golem',24,6,'golem','hue-rotate(-30deg) brightness(.85)'),entity('c2-slime-a',8,5,'slime','hue-rotate(110deg)'),entity('c2-slime-b',10,9,'slime','hue-rotate(110deg)'),entity('c2-slime-c',19,17,'slime','hue-rotate(110deg)'),entity('c2-slime-d',24,18,'slime','hue-rotate(110deg)'),entity('c2-bat-a',18,6,'bat'),entity('c2-bat-b',25,12,'bat'),entity('c2-bat-c',11,19,'bat')]};
}
function makeTemple():GameMap{
const width=26,height=20;
const tiles:number[][]=blankFloor(width,height);
const props:Prop[]=[];
const add=(kind:Prop['kind'],x:number,y:number,id:string,solid=false)=>props.push({kind,x:center(x),y:center(y),id,solid});
for(let x=2;x<24;x++)if(x!==12&&x!==13)tiles[8][x]=4;
for(let y=2;y<7;y++){tiles[y][3]=4;tiles[y][22]=4;}
for(let y=11;y<17;y++){tiles[y][4]=4;tiles[y][21]=4;}
for(let x=5;x<21;x++)if(x!==12&&x!==13)tiles[17][x]=4;
props.push({kind:'exit',id:'temple-exit',x:center(12),y:center(18),to:'cave2',ax:27,ay:17,label:'Subir ao 2º andar'});add('lever',7,13,'lever-west');add('lever',18,13,'lever-east');add('relic',12,3,'moon-relic');
add('rock',7,5,'altar-west',true);add('rock',18,5,'altar-east',true);
return{width,height,tiles,props,enemies:[entity('temple-slime-a',9,15,'slime','hue-rotate(160deg)'),entity('temple-slime-b',16,15,'slime','hue-rotate(160deg)'),entity('guardian',12,5,'boss')]};
}
export function makeMap(zone:Zone):GameMap{return zone==='world'?makeWorld(entity):zone==='cave1'?makeCave1():zone==='cave2'?makeCave2():makeTemple();}
const freshMaps=():Record<Zone,GameMap>=>({world:makeMap('world'),cave1:makeMap('cave1'),cave2:makeMap('cave2'),temple:makeMap('temple')});
const freshPlayer=()=>({x:SPAWN.x,y:SPAWN.y,dir:'up' as Direction,hp:6,maxHp:6,hurt:0,attack:0,cooldown:0,dash:0,dashCooldown:0,walk:0,jump:0,jumpCooldown:0,jumpFromX:SPAWN.x,jumpFromY:SPAWN.y,vx:0,vy:0,flash:0,squash:0,charge:0,spin:0,shoot:0});
type Effect={x:number;y:number;life:number;max:number;kind:'impact'|'ring'|'dust'|'ghost';size:number;color:string;frame?:number;row?:number};
type FloatText={x:number;y:number;text:string;life:number;color:string};

export class Adventure{
canvas:HTMLCanvasElement;ctx:CanvasRenderingContext2D;assets:{hero:HTMLImageElement;atlas:HTMLImageElement};onChange:(s:Snapshot)=>void;
maps=freshMaps();base:Record<Zone,Prop[]>={world:[],cave1:[],cave2:[],temple:[]};grids:Record<Zone,Map<number,Prop[]>>={world:new Map(),cave1:new Map(),cave2:new Map(),temple:new Map()};
zone:Zone='world';screen:Snapshot['screen']='ready';
player=freshPlayer();
camera={x:0,y:0};keys=new Set<string>();coins=0;potions=2;hasKey=false;met=false;entered=false;levers=new Set<string>();bossDead=false;defeated=0;elapsed=0;notice='';noticeTime=0;dialog='';dialogTitle='';
fragments=new Set<string>();bossKey=false;deepest=0;region:Biome='forest';banner='';bannerTime=0;checkpoint={...SPAWN};
cheats:Cheats={life:false,walls:false};history:string[]=[];historyTimer=0;rewinding=false;rewindFrame=0;fast=false;fastSpeed=3;padKeys=new Set<string>();
freeze=0;shake=0;shakePower=0;stepTimer=0;shopOpen=false;sword=1;heartsBought=0;pickups:Pickup[]=[];zoom=1.3;bow=false;arrow:Arrow='normal';arrowKinds=new Set<ArrowKind>();shots:Shot[]=[];pushDir:{x:number;y:number}|null=null;ice=new Map<number,number>();tipSpin=false;
particles:{x:number;y:number;vx:number;vy:number;life:number;color:string}[]=[];projectiles:{x:number;y:number;vx:number;vy:number;life:number}[]=[];effects:Effect[]=[];texts:FloatText[]=[];
variants=new Map<string,CanvasImageSource>();ground=new Map<Zone,HTMLCanvasElement>();minimap:HTMLCanvasElement|null=null;heroWhite:HTMLCanvasElement|null=null;
raf=0;lastTime=0;lastEmit=0;disposed=false;audio:AudioContext|null=null;sound=false;musicTimer=0;musicStep=0;
constructor(canvas:HTMLCanvasElement,assets:Adventure['assets'],onChange:Adventure['onChange']){this.canvas=canvas;this.ctx=canvas.getContext('2d')!;this.assets=assets;this.onChange=onChange;canvas.width=960;canvas.height=640;this.indexMaps();this.emit();this.draw();}
get map(){return this.maps[this.zone];}

/* ---------- mapas, colisão e grade espacial ---------- */
indexMaps(){for(const z of ZONES){this.base[z]=this.maps[z].props.map(p=>({...p}));this.rebuildGrid(z);}}
rebuildGrid(z:Zone){const g=new Map<number,Prop[]>();for(const p of this.maps[z].props){if(!p.solid)continue;const k=Math.floor(p.y/T)*1000+Math.floor(p.x/T);const cell=g.get(k);if(cell)cell.push(p);else g.set(k,[p]);}this.grids[z]=g;}
// air=true: no ar (salto ou morcego) passa por água, abismo, arbustos e rochas; paredes e árvores continuam bloqueando.
collides(x:number,y:number,r=9,air=false){const m=this.map;for(const dx of[-r,r])for(const dy of[-r*.55,r*.55]){const tx=Math.floor((x+dx)/T),ty=Math.floor((y+dy)/T);if(tx<0||ty<0||tx>=m.width||ty>=m.height)return true;const t=m.tiles[ty][tx];if(t===4||(!air&&((t===2&&!this.ice.has(ty*1000+tx))||t===6)))return true;if(this.zone==='temple'&&this.levers.size<2&&ty===8&&(tx===12||tx===13))return true;}
const g=this.grids[this.zone],cx=Math.floor(x/T),cy=Math.floor(y/T);for(let gy=cy-2;gy<=cy+2;gy++)for(let gx=cx-2;gx<=cx+2;gx++){const cell=g.get(gy*1000+gx);if(cell&&cell.some(p=>(!air||p.kind==='tree'||p.kind==='npc'||p.kind==='chest'||p.kind==='door'||p.kind==='stairs'||p.kind==='barrier'||p.kind==='torch'||p.kind==='totem')&&Math.abs(p.x-x)<(p.kind==='tree'?17:14)+r&&Math.abs(p.y-y)<(p.kind==='tree'?10:12)+r*.55))return true;}return false;}
move(dx:number,dy:number){const p=this.player,m=this.map,air=p.jump>0;if(this.cheats.walls){p.x=Math.max(T,Math.min(m.width*T-T,p.x+dx));p.y=Math.max(T,Math.min(m.height*T-T,p.y+dy));return;}if(!air&&this.collides(p.x,p.y,9)){p.x+=dx;p.y+=dy;return;}// preso (ex.: gelo derreteu): deixa sair
if(!this.collides(p.x+dx,p.y,9,air))p.x+=dx;if(!this.collides(p.x,p.y+dy,9,air))p.y+=dy;}
nearProp(){return this.map.props.filter(p=>!['tree','bush','rock'].includes(p.kind)&&Math.abs(p.x-this.player.x)<60&&Math.abs(p.y-this.player.y)<60).map(p=>({p,d:Math.hypot(p.x-this.player.x,p.y-this.player.y)})).filter(o=>o.d<55).sort((a,b)=>a.d-b.d)[0]?.p;}
guardAlive(p:Prop){return !!p.guard&&Object.values(this.maps).some(m=>m.enemies.some(e=>e.id===p.guard&&e.hp>0));}

/* ---------- textos ---------- */
get hint(){const p=this.nearProp();if(!p)return '';if(p.kind==='npc')return`Conversar com ${(NPCS[p.id]?.name??'Iris').split(',')[0]}`;if(p.kind==='chest')return p.open?'Baú aberto':this.guardAlive(p)?'Protegido por um golem':'Abrir baú';if(p.kind==='door')return this.hasKey&&this.fragments.size===3?'Entrar no templo':'Porta selada';if(p.kind==='stairs'||p.kind==='exit')return p.needs==='bosskey'&&!this.bossKey?'Porta do Guardião (trancada)':p.label??'Voltar';if(p.kind==='lever')return this.levers.has(p.id)?'Botão ativado':'Botão de pressão';if(p.kind==='torch')return p.open?'Tocha acesa':'Tocha apagada';if(p.kind==='totem')return p.open?'Totem energizado':'Totem sem energia';if(p.kind==='barrier')return'Barreira mágica';if(p.kind==='relic')return this.bossDead?'Recolher a Relíquia Lunar':'Derrote o guardião';return '';}
get objective(){const n=this.fragments.size;if(this.screen==='won')return'A Relíquia Lunar voltou ao vale.';if(!this.met)return'Converse com Iris, aqui no Bosque de Elara.';if(!this.hasKey)return'Encontre a Chave Lunar no baú a leste do bosque.';if(!this.bow)return'Encontre o Arco na Floresta de Outono, a nordeste. A lenhadora sabe onde ele está.';if(n<3)return`Recupere os Fragmentos Lunares (${n}/3): Deserto a oeste, Montanhas a noroeste e Pântano a sudeste.`;if(!this.entered)return'Leve a chave e os fragmentos ao Templo, nas Ruínas da Lua ao norte.';if(this.deepest<2)return this.arrowKinds.has('fire')?'Acenda as duas tochas com flechas de fogo (L) para abrir a passagem até a escada a noroeste.':'No 1º andar, salte os abismos com K e pegue as Flechas de Fogo no baú a leste.';if(!this.arrowKinds.has('light'))return'No 2º andar, salte o canal e pegue as Flechas de Luz.';if(this.maps.cave2.props.some(q=>q.id==='c2-barrier'))return'Energize o totem com uma flecha de luz para abrir a sala do golem.';if(!this.bossKey)return'Derrote o golem e pegue a Chave do Guardião e as Flechas de Gelo.';if(this.deepest<3)return'Desça à Câmara do Guardião pela porta a sudeste do 2º andar.';if(this.levers.size<2)return`Congele os slimes com flechas de gelo e empurre-os sobre os dois botões (${this.levers.size}/2).`;if(!this.bossDead)return'Derrote o Guardião de Pedra.';return'Recolha a Relíquia Lunar no altar.';}
snapshot():Snapshot{return{screen:this.screen,zone:this.zone,hp:this.player.hp,maxHp:this.player.maxHp,coins:this.coins,potions:this.potions,key:this.hasKey,met:this.met,entered:this.entered,levers:this.levers.size,bossDead:this.bossDead,objective:this.objective,location:this.zone==='world'?BIOMES[this.region].name:ZONE_NAME[this.zone],hint:this.hint,notice:this.notice,x:Math.round(this.player.x),y:Math.round(this.player.y),defeated:this.defeated,elapsed:Math.floor(this.elapsed),fragments:this.fragments.size,bossKey:this.bossKey,deepest:this.deepest,rewinding:this.rewinding,rewindLeft:Math.ceil(this.history.length*HISTORY_STEP),canRewind:this.history.length>0,fast:this.fast,shop:this.shopOpen,sword:this.sword,heartsBought:this.heartsBought,bow:this.bow,arrow:this.arrow,arrows:[...this.arrowKinds]};}
emit(){this.onChange(this.snapshot());}
message(text:string){this.notice=text;this.noticeTime=4;this.emit();}

/* ---------- fluxo ---------- */
start(){if(this.screen==='ready'){this.screen='playing';this.showBanner();this.message('Iris está aqui no bosque. Use E para conversar.');}this.keys.clear();this.emit();}
togglePause(){if(this.screen==='playing')this.screen='paused';else if(this.screen==='paused')this.screen='playing';this.keys.clear();this.emit();}
pause(){if(this.screen==='playing'){this.screen='paused';this.keys.clear();this.emit();}}
resume(){if(this.screen==='paused'){this.screen='playing';this.emit();}}
keyDown(k:string){const was=this.keys.has(k);this.keys.add(k);if(was)return;if(k==='r'){this.rewinding=true;this.emit();return;}if(k==='f'){this.fast=true;this.emit();return;}if(k==='escape'){if(this.shopOpen)this.closeShop();else if(this.dialog)this.dismissDialog();else this.togglePause();return;}if(this.screen!=='playing')return;if(this.shopOpen){if(k==='e'||k==='enter')this.closeShop();return;}if(this.dialog){if(k==='e'||k==='enter'||k===' ')this.dismissDialog();return;}if(k==='j'||k===' '){this.attack();return;}if(k==='e'||k==='enter'){this.interact();return;}if(k==='q'){this.heal();return;}if(k==='shift'){this.dash();return;}if(k==='k'){this.jump();return;}if(k==='l'){this.shoot();return;}if(k==='t'){this.cycleArrow();return;}const d=this.directionForKey(k);if(d&&this.player.jump<=0){this.player.dir=d;this.move(dirs[d].x*9,dirs[d].y*9);this.player.walk+=.08;this.draw();this.emit();}}
keyUp(k:string){this.keys.delete(k);if((k==='j'||k===' ')&&!this.keys.has('j')&&!this.keys.has(' ')){if(this.player.charge>=CHARGE_TIME)this.spinAttack();this.player.charge=0;}if(k==='r'){this.rewinding=false;this.emit();}if(k==='f'){this.fast=false;this.emit();}}
directionForKey(k:string):Direction|undefined{return({w:'up',arrowup:'up',s:'down',arrowdown:'down',a:'left',arrowleft:'left',d:'right',arrowright:'right'} as Record<string,Direction>)[k];}
interact(){if(this.screen!=='playing')return;if(this.dialog){this.dismissDialog();return;}if(this.player.jump>0)return;const p=this.nearProp();if(!p){this.message('Aproxime-se de alguém, de um baú ou de um selo.');return;}
if(p.kind==='npc'&&p.id==='ferreiro'){this.openShop();return;}
if(p.kind==='npc'){const npc=NPCS[p.id]??NPCS.iris;if(p.id==='iris')this.met=true;this.openDialog(npc.name,npc.talk({hasKey:this.hasKey,fragments:this.fragments.size}));}
if(p.kind==='chest')this.openChest(p);
if(p.kind==='door'){if(!this.bow&&this.hasKey&&this.fragments.size===3){this.message('Você vai precisar de um arco lá dentro. Procure-o na Floresta de Outono, a nordeste.');return;}if(!this.hasKey){this.message('A porta está selada. Procure a Chave Lunar no Bosque de Elara.');return;}if(this.fragments.size<3){this.message(`A porta tem três encaixes vazios. Faltam ${3-this.fragments.size} Fragmento(s) Lunar(es).`);return;}this.changeZone('cave1',12.5,16);}
if((p.kind==='stairs'||p.kind==='exit')&&p.to){if(p.needs==='bosskey'&&!this.bossKey){this.message('Uma fechadura enorme. Você precisa da Chave do Guardião, guardada pelo golem deste andar.');return;}this.changeZone(p.to,p.ax??12,p.ay??12);}
if(p.kind==='lever')this.message(this.levers.has(p.id)?'Este botão já está pressionado.':'Um botão pesado demais para você. Congele um inimigo com uma flecha de gelo e empurre-o até aqui.');
if(p.kind==='torch')this.message(p.open?'A tocha arde.':'Uma tocha apagada. Acerte-a com uma flecha de fogo.');
if(p.kind==='totem')this.message(p.open?'O totem pulsa de energia.':'Um totem adormecido. Acerte-o com uma flecha de luz.');
if(p.kind==='barrier'){const src=this.map.props.find(q=>q.id===p.by?.[0]);this.message(src?.kind==='torch'?'Uma barreira mágica. As tochas apagadas ao lado parecem ligadas a ela.':'Uma barreira mágica, ligada a algum totem por perto.');}
if(p.kind==='relic'){if(!this.bossDead){this.message('O guardião ainda protege a relíquia.');return;}this.screen='won';this.keys.clear();this.burst(p.x,p.y,'#efce79',60);this.ring(p.x,p.y,'#efce79',120);this.emit();}}
openChest(p:Prop){if(p.open){this.message('Este baú já foi aberto.');return;}if(this.guardAlive(p)){this.message('Um golem de pedra protege este baú. Derrote-o primeiro!');return;}p.open=true;this.tone(784,.13);this.burst(p.x,p.y,'#efce79',16);this.ring(p.x,p.y-10,'#efce79',50);
if(p.item==='key'){this.hasKey=true;this.met=true;this.coins+=15;this.openDialog('Chave Lunar encontrada','A porta do Templo da Lua, nas Ruínas ao norte, tem três encaixes. Recupere os Fragmentos Lunares no Deserto, nas Montanhas e no Pântano. Você também encontrou 15 cristais.');}
else if(p.item==='fragment'){this.fragments.add(p.id);const n=this.fragments.size;this.openDialog(`Fragmento Lunar (${n}/3)`,n<3?`Um pedaço da lua pulsa em suas mãos. Faltam ${3-n}. Consulte o mapa no canto da tela.`:'Os três fragmentos se uniram em uma luz prateada. Siga para o Templo da Lua, nas Ruínas ao norte!');}
else if(p.item==='heart'){this.player.maxHp+=2;this.player.hp=this.player.maxHp;this.openDialog('Coração Lunar','Sua vida máxima aumentou em dois corações.');}
else if(p.item==='bosskey'){this.bossKey=true;this.openDialog('Chave do Guardião','Uma chave pesada, fria como pedra. Ela abre a porta para a Câmara do Guardião, a sudeste deste andar.');}
else if(p.item==='bow'){this.bow=true;this.arrow='normal';this.openDialog('Arco da Floresta','Aperte L para atirar. As flechas voam sobre água e abismos e acertam inimigos de longe. Segure a espada (J) para o golpe giratório.');}
else if(p.item==='fire'||p.item==='light'||p.item==='ice'){this.arrowKinds.add(p.item);this.arrow=p.item;this.openDialog(ARROW_NAME[p.item],(p.item==='fire'?'Acende tochas apagadas e queima inimigos (dano dobrado).':p.item==='light'?'Energiza totens adormecidos e abre barreiras mágicas.':'Congela inimigos pequenos. Empurre o bloco de gelo andando contra ele, por exemplo para cima de botões.')+' Aperte T para trocar de flecha.');}
else if(p.item==='potion'){this.potions+=2;this.floatText(p.x,p.y-30,'+2 poções','#f3b7c2');this.message('Baú aberto: +2 poções.');}
else if(p.item==='crystals'){this.coins+=50;this.floatText(p.x,p.y-30,'+50','#b9e8c2');this.message('Baú aberto: +50 cristais.');}
else{this.coins+=30;this.potions++;this.floatText(p.x,p.y-30,'+30','#b9e8c2');this.message('Baú aberto: +30 cristais e +1 poção.');}this.emit();}
openDialog(title:string,text:string){this.dialogTitle=title;this.dialog=text;this.keys.clear();this.emit();}
dismissDialog(){this.dialog='';this.dialogTitle='';this.keys.clear();this.emit();}
openShop(){this.shopOpen=true;this.keys.clear();this.player.charge=0;this.emit();}
closeShop(){this.shopOpen=false;this.keys.clear();this.emit();}
soldOut(id:ShopItem){return id==='heart'?this.heartsBought>=2:id==='sword'?this.sword>=2:false;}
buy(id:ShopItem){const item=SHOP.find(i=>i.id===id);if(!item||!this.shopOpen)return;if(this.soldOut(id)){this.message('Esgotado.');return;}if(this.coins<item.price){this.message(`Faltam ${item.price-this.coins} cristais.`);return;}this.coins-=item.price;if(id==='potion')this.potions++;else if(id==='heart'){this.heartsBought++;this.player.maxHp+=2;this.player.hp=this.player.maxHp;}else this.sword=2;this.tone(784,.1);this.tone(1046,.14);this.message(`Comprado: ${item.name}.`);}
changeZone(zone:Zone,ax:number,ay:number){this.zone=zone;if(zone!=='world')this.entered=true;this.deepest=Math.max(this.deepest,FLOOR[zone]);this.keys.clear();this.projectiles=[];this.effects=[];this.pickups=[];this.shots=[];this.ice.clear();this.player.charge=0;this.player.x=center(ax);this.player.y=center(ay);this.player.dir=zone==='world'?'down':'up';this.player.jump=0;this.player.vx=0;this.player.vy=0;this.player.hurt=1.2;this.player.hp=Math.min(this.player.maxHp,this.player.hp+2);this.checkpoint={x:this.player.x,y:this.player.y};this.message(zone==='world'?'Você voltou às Ruínas da Lua.':zone==='temple'?'Câmara do Guardião: congele os slimes e empurre-os sobre os botões.':`${ZONE_NAME[zone]}. Use K para saltar os abismos.`);this.showBanner();this.draw();}
showBanner(){this.banner=this.zone==='world'?BIOMES[this.region].name:ZONE_NAME[this.zone];this.bannerTime=2.6;}

/* ---------- combate e movimento ---------- */
attack(){const p=this.player;if(this.screen!=='playing'||this.dialog||p.cooldown>0||p.jump>0)return;p.attack=ATTACK_TIME;p.cooldown=.34;const d=dirs[p.dir];this.tone(220,.06,'triangle');let hits=0;
for(const enemy of this.map.enemies){if(enemy.hp<=0||enemy.hit>0)continue;const dx=enemy.x-p.x,dy=enemy.y-p.y,dist=Math.hypot(dx,dy),heavy=enemy.kind==='boss'||enemy.kind==='golem';if(dist<(heavy?72:62)&&(dx*d.x+dy*d.y)>-10){hits++;this.hitEnemy(enemy,d.x,d.y);}}
this.afterHits(hits);this.cutBushes((dx,dy)=>Math.hypot(dx,dy)<57&&dx*d.x+dy*d.y>-5);this.emit();}
// Golpe carregado: segure a espada e solte para girar, acertando tudo em volta.
spinAttack(){const p=this.player;if(this.screen!=='playing'||this.dialog||this.shopOpen||p.jump>0)return;p.spin=SPIN_TIME;p.attack=0;p.cooldown=.45;this.tone(330,.08,'triangle');this.tone(494,.12,'triangle');this.ring(p.x,p.y-8,'#fff1b7',80);let hits=0;
for(const enemy of this.map.enemies){if(enemy.hp<=0||enemy.hit>0)continue;const dx=enemy.x-p.x,dy=enemy.y-p.y,dist=Math.hypot(dx,dy),heavy=enemy.kind==='boss'||enemy.kind==='golem';if(dist<(heavy?86:76)){hits++;this.hitEnemy(enemy,dist?dx/dist:0,dist?dy/dist:1);}}
this.afterHits(hits);this.cutBushes((dx,dy)=>Math.hypot(dx,dy)<66);this.emit();}
hitEnemy(enemy:Entity,kx:number,ky:number,dmg=this.sword){enemy.frozen=0;const calm=enemy.hp>enemy.maxHp/2;const p=this.player,dx=enemy.x-p.x,dy=enemy.y-p.y,dist=Math.hypot(dx,dy),heavy=enemy.kind==='boss'||enemy.kind==='golem';enemy.hp-=dmg;if(enemy.kind==='boss'&&calm&&enemy.hp>0&&enemy.hp<=enemy.maxHp/2){this.kick(9,.4);this.ring(enemy.x,enemy.y-20,'#ff8a5c',120);this.message('O guardião se enfurece! Ataques mais rápidos. Flechas de luz ferem mais.');this.tone(98,.3,'sawtooth');}enemy.hit=.27;enemy.flash=.12;const k=heavy?70:300;enemy.vx=kx*k+(dist?dx/dist:0)*40;enemy.vy=ky*k+(dist?dy/dist:0)*40;const ix=(p.x+enemy.x)/2,iy=(p.y+enemy.y)/2-14;this.impact(ix,iy,heavy?1.3:1);this.floatText(enemy.x,enemy.y-38,`-${dmg}`,'#fff1b7');this.burst(enemy.x,enemy.y,heavy?'#edc67d':'#c4eeb1',10);
if(enemy.hp<=0){enemy.dying=.4;this.defeated++;this.coins+=enemy.kind==='boss'?100:enemy.kind==='golem'?40:8;this.ring(enemy.x,enemy.y-10,'#ffffff',heavy?90:50);if(enemy.kind==='boss'){this.bossDead=true;this.projectiles=[];this.message('O guardião caiu! Recolha a relíquia no altar ao norte.');}else if(enemy.kind==='golem'){this.burst(enemy.x,enemy.y,'#d9cfb4',40);this.message('O golem desmoronou! +40 cristais. O baú está livre.');}else{this.drop(enemy.x,enemy.y,.9);if(this.zone==='world')enemy.respawn=this.elapsed+RESPAWN_TIME;if(!this.tipSpin&&this.defeated>=2){this.tipSpin=true;this.message('+8 cristais · Dica: segure J (Espada) e solte para o golpe giratório.');}else this.message('+8 cristais');}}}
afterHits(hits:number){if(!hits)return;this.freeze=Math.max(this.freeze,hits>1?.09:.06);this.kick(hits>1?6:4,.16);this.tone(140,.08,'square');}
cutBushes(inReach:(dx:number,dy:number)=>boolean){const p=this.player,before=this.map.props.length;this.map.props=this.map.props.filter(q=>{if(q.kind!=='bush'||!inReach(q.x-p.x,q.y-p.y))return true;this.burst(q.x,q.y,'#8dcd69',14);this.impact(q.x,q.y-12,.7);this.coins++;this.drop(q.x,q.y,.2);return false;});if(this.map.props.length!==before)this.rebuildGrid(this.zone);}
// Itens que caem no chão: coração (se faltar vida) ou cristal. Somem depois de alguns segundos.
drop(x:number,y:number,chance:number){if(Math.random()>chance)return;const kind=this.player.hp<this.player.maxHp&&Math.random()<.6?'heart':'gem';this.pickups.push({x,y,kind,life:PICKUP_LIFE});}
updateIce(dt:number){if(!this.ice.size)return;const p=this.player,under=Math.floor(p.y/T)*1000+Math.floor(p.x/T);for(const[k,life]of this.ice){const left=life-dt;if(left>0)this.ice.set(k,left);else if(k===under)this.ice.set(k,.3);else this.ice.delete(k);}}
collectPickups(dt:number){const p=this.player;for(const q of this.pickups){q.life-=dt;const dist=Math.hypot(q.x-p.x,q.y-p.y);if(dist<70&&dist>1){const pull=Math.min(dist,180*dt);q.x+=(p.x-q.x)/dist*pull;q.y+=(p.y-q.y)/dist*pull;}if(Math.hypot(q.x-p.x,q.y-p.y)>24)continue;q.life=0;if(q.kind==='heart'){p.hp=Math.min(p.maxHp,p.hp+1);this.floatText(q.x,q.y-24,'+1 ♥','#ff9f9f');this.tone(659,.1);}else{this.coins+=5;this.floatText(q.x,q.y-24,'+5','#b9e8c2');this.tone(988,.08);}this.emit();}this.pickups=this.pickups.filter(q=>q.life>0);}
drawPickups(c:CanvasRenderingContext2D){for(const q of this.pickups){if(q.life<2&&Math.floor(q.life*8)%2===0)continue;const y=q.y-8+Math.sin(this.elapsed*5+q.x)*2;c.globalAlpha=.25;c.fillStyle='#000';c.beginPath();c.ellipse(q.x,q.y+3,6,2,0,0,Math.PI*2);c.fill();c.globalAlpha=1;
if(q.kind==='heart'){c.fillStyle='#3a1418';c.beginPath();c.arc(q.x-3.5,y-2,4.5,0,Math.PI*2);c.arc(q.x+3.5,y-2,4.5,0,Math.PI*2);c.moveTo(q.x-8,y);c.lineTo(q.x,y+8);c.lineTo(q.x+8,y);c.fill();c.fillStyle='#e8645e';c.beginPath();c.arc(q.x-3.5,y-2,3.3,0,Math.PI*2);c.arc(q.x+3.5,y-2,3.3,0,Math.PI*2);c.moveTo(q.x-6.6,y-1);c.lineTo(q.x,y+6);c.lineTo(q.x+6.6,y-1);c.fill();c.fillStyle='#ffd0c8';c.fillRect(q.x-5,y-4,2,2);}
else{c.fillStyle='#1d3a2a';c.beginPath();c.moveTo(q.x,y-8);c.lineTo(q.x+6,y);c.lineTo(q.x,y+8);c.lineTo(q.x-6,y);c.fill();c.fillStyle='#6fd59a';c.beginPath();c.moveTo(q.x,y-6);c.lineTo(q.x+4.5,y);c.lineTo(q.x,y+6);c.lineTo(q.x-4.5,y);c.fill();c.fillStyle='#d8ffe6';c.fillRect(q.x-2,y-3,2,3);}}}
// Arco: L atira na direção do herói; T troca o tipo de flecha.
shoot(){const p=this.player;if(this.screen!=='playing'||this.dialog||this.shopOpen||p.cooldown>0||p.jump>0||p.spin>0)return;if(!this.bow){this.message('Você ainda não tem um arco. Procure na Floresta de Outono.');return;}const d=dirs[p.dir];p.shoot=.2;p.cooldown=.36;this.shots.push({x:p.x+d.x*16,y:p.y+d.y*12,vx:d.x*ARROW_SPEED,vy:d.y*ARROW_SPEED,kind:this.arrow,life:.85});this.tone(this.arrow==='ice'?988:this.arrow==='light'?1175:this.arrow==='fire'?587:440,.07,'triangle');}
cycleArrow(){if(!this.bow){this.message('Você ainda não tem um arco.');return;}const list:Arrow[]=['normal',...(['fire','light','ice'] as ArrowKind[]).filter(k=>this.arrowKinds.has(k))];this.arrow=list[(list.indexOf(this.arrow)+1)%list.length];this.message(`${ARROW_NAME[this.arrow]} pronta.`);this.tone(660,.05);}
updateShots(dt:number){for(const s of this.shots){for(let i=0;i<2&&s.life>0;i++){s.x+=s.vx*dt/2;s.y+=s.vy*dt/2;this.shotStep(s);}s.life-=dt;if(s.kind==='fire'&&Math.random()<.5)this.particles.push({x:s.x,y:s.y-12,vx:(Math.random()-.5)*20,vy:-20,life:.25,color:Math.random()<.5?'#ff9a3c':'#ffd36b'});}this.shots=this.shots.filter(s=>s.life>0);}
shotStep(s:Shot){const tx=Math.floor(s.x/T),ty=Math.floor(s.y/T);if(s.kind==='ice'&&this.map.tiles[ty]?.[tx]===2){const k=ty*1000+tx;if(!this.ice.has(k)&&Math.random()<.3)this.burst(s.x,s.y,'#e9fbff',3);this.ice.set(k,ICE_TIME);}
if(s.kind==='fire'){const before=this.map.props.length;this.map.props=this.map.props.filter(q=>{if(q.kind!=='bush'||Math.abs(q.x-s.x)>16||Math.abs(q.y-s.y)>16)return true;this.burst(q.x,q.y,'#ff9a3c',16);this.impact(q.x,q.y-12,.7,'#ffcf8a');this.coins++;this.drop(q.x,q.y,.2);return false;});if(this.map.props.length!==before){this.rebuildGrid(this.zone);this.tone(330,.08,'sawtooth');}}
for(const q of this.map.props){if((q.kind!=='torch'&&q.kind!=='totem')||Math.abs(q.x-s.x)>14||Math.abs(q.y-s.y)>18)continue;s.life=0;if(q.open)return;const right=q.kind==='torch'?s.kind==='fire':s.kind==='light';if(!right){this.burst(s.x,s.y-12,'#d8c9a8',5);this.message(q.kind==='torch'?'A tocha precisa de fogo.':'O totem precisa de luz.');return;}q.open=true;this.burst(q.x,q.y-24,q.kind==='torch'?'#ff9a3c':'#fff3a0',22);this.ring(q.x,q.y-10,q.kind==='torch'?'#ffb35c':'#fff3a0',60);this.tone(q.kind==='torch'?392:880,.15,'triangle');this.message(q.kind==='torch'?'A tocha acendeu!':'O totem despertou!');this.checkBarriers();return;}
for(const e of this.map.enemies){if(e.hp<=0||e.dying>0)continue;const heavy=e.kind==='boss'||e.kind==='golem';if(Math.hypot(e.x-s.x,e.y-s.y)>(heavy?26:17))continue;s.life=0;const kx=Math.sign(s.vx)*.4,ky=Math.sign(s.vy)*.4;
if(s.kind==='ice'&&!heavy){e.frozen=FREEZE_TIME;e.vx=0;e.vy=0;e.hit=0;this.burst(e.x,e.y-10,'#bfefff',16);this.ring(e.x,e.y-8,'#bfefff',44);this.floatText(e.x,e.y-38,'congelado','#bfefff');this.tone(1318,.12,'triangle');}
else{e.frozen=0;this.hitEnemy(e,kx,ky,s.kind==='fire'?2:s.kind==='light'&&e.kind==='boss'?3:1);if(s.kind==='fire')this.burst(e.x,e.y-10,'#ff9a3c',12);}this.afterHits(1);return;}
if(this.collides(s.x,s.y,2,true)){s.life=0;this.burst(s.x,s.y-12,ARROW_COLOR[s.kind],6);}}
checkBarriers(){const done=this.map.props.filter(b=>b.kind==='barrier'&&b.by?.every(id=>this.map.props.find(q=>q.id===id)?.open));if(!done.length)return;for(const b of done){this.burst(b.x,b.y-10,'#c9a6ff',30);this.ring(b.x,b.y,'#c9a6ff',80);}this.map.props=this.map.props.filter(b=>!done.includes(b));this.rebuildGrid(this.zone);this.kick(4,.2);this.tone(523,.2);this.tone(784,.25);this.message('A barreira mágica se desfez!');}
// Inimigo congelado: não ataca, desliza em linha reta quando empurrado e pressiona botões.
updateFrozen(e:Entity,dt:number){const p=this.player;e.frozen=Math.max(0,e.frozen-dt);const dx=e.x-p.x,dy=e.y-p.y,d=this.pushDir;
if(!e.vx&&!e.vy&&d&&Math.hypot(dx,dy)<26&&dx*d.x+dy*d.y>6){if(d.x)e.y=center(Math.floor(e.y/T));else e.x=center(Math.floor(e.x/T));e.vx=d.x*230;e.vy=d.y*230;e.frozen=Math.max(e.frozen,2);this.dust(e.x,e.y,4);this.tone(180,.08,'triangle');}
if(e.vx||e.vy){const mx=e.vx*dt,my=e.vy*dt;if(this.collides(e.x+mx,e.y+my,8)){e.vx=0;e.vy=0;this.kick(2,.1);}else{e.x+=mx;e.y+=my;}}
for(const b of this.map.props){if(b.kind!=='lever'||this.levers.has(b.id)||Math.hypot(b.x-e.x,b.y-e.y)>14)continue;this.levers.add(b.id);e.hp=0;e.dying=.4;e.frozen=0;e.vx=0;e.vy=0;this.burst(b.x,b.y,'#bfefff',26);this.ring(b.x,b.y,'#9de8dc',70);this.tone(660,.15);this.message(this.levers.size===2?'Os dois botões afundaram. A passagem do guardião está aberta!':'O botão afundou sob o gelo. Falta o outro.');this.emit();break;}}
respawnPuzzleSlimes(){for(const e of this.map.enemies)if(e.kind==='slime'&&e.hp<=0&&e.dying<=0){e.hp=e.maxHp;e.x=e.homeX;e.y=e.homeY;e.vx=0;e.vy=0;e.frozen=0;e.timer=0;this.ring(e.x,e.y,'#9de8dc',40);}}
dash(){const p=this.player;if(this.screen!=='playing'||this.dialog||p.dashCooldown>0||p.jump>0)return;p.dash=.18;p.dashCooldown=.9;p.hurt=Math.max(p.hurt,.24);this.tone(330,.08);this.dust(p.x,p.y,6);}
jump(){const p=this.player;if(this.screen!=='playing'||this.dialog||p.jump>0||p.jumpCooldown>0)return;p.jump=JUMP_TIME;p.jumpFromX=p.x;p.jumpFromY=p.y;p.attack=0;this.dust(p.x,p.y,8);this.tone(392,.1,'triangle');this.tone(587,.12);}
land(){const p=this.player;p.jumpCooldown=.22;p.squash=.12;this.dust(p.x,p.y,10);this.tone(160,.06,'triangle');if(this.cheats.walls||!this.collides(p.x,p.y))return;p.x=p.jumpFromX;p.y=p.jumpFromY;this.message('Gregório caiu! Pule mais perto da borda.');this.ring(p.x,p.y,'#9fd8ff',40);if(!this.cheats.life){p.hp--;p.hurt=1.25;p.flash=.15;if(p.hp<=0){this.screen='dead';this.keys.clear();}}this.emit();}
heal(){if(this.screen!=='playing'||this.dialog)return;if(this.potions<=0){this.message('Sem poções.');return;}if(this.player.hp===this.player.maxHp){this.message('Sua vida já está completa.');return;}this.potions--;this.player.hp=this.player.maxHp;this.burst(this.player.x,this.player.y,'#e8acb4',18);this.ring(this.player.x,this.player.y-16,'#f3b7c2',50);this.message('Poção usada. Todos os corações foram recuperados.');this.tone(523,.18);}
damage(sx=this.player.x,sy=this.player.y+1){const p=this.player;if(p.hurt>0||p.jump>0||this.screen!=='playing'||this.dialog||this.cheats.life)return;p.hp--;p.hurt=1.25;p.flash=.14;p.squash=.14;const dx=p.x-sx,dy=p.y-sy,d=Math.hypot(dx,dy)||1;p.vx=dx/d*240;p.vy=dy/d*240;this.freeze=Math.max(this.freeze,.08);this.kick(7,.22);this.impact(p.x-dx/d*12,p.y-16-dy/d*12,1.1,'#ffb3a8');this.floatText(p.x,p.y-48,'-1','#ff8f8f');this.burst(p.x,p.y,'#ef8b83',12);this.tone(110,.14,'sawtooth');if(p.hp<=0){this.screen='dead';this.keys.clear();}this.emit();}
retry(){const p=this.player;p.hp=p.maxHp;p.hurt=2;p.x=this.checkpoint.x;p.y=this.checkpoint.y;p.attack=0;p.cooldown=0;p.dash=0;p.dashCooldown=0;p.jump=0;p.vx=0;p.vy=0;this.projectiles=[];this.map.enemies.forEach(e=>{if(e.hp>0){e.x=e.homeX;e.y=e.homeY;e.timer=0;e.vx=0;e.vy=0;}});this.potions=Math.max(1,this.potions);this.screen='playing';this.dialog='';this.keys.clear();this.message('Você se levantou. A aventura continua.');}
restart(){this.maps=freshMaps();this.indexMaps();this.zone='world';this.player=freshPlayer();this.coins=0;this.potions=2;this.hasKey=false;this.met=false;this.entered=false;this.levers.clear();this.bossDead=false;this.defeated=0;this.elapsed=0;this.particles=[];this.projectiles=[];this.effects=[];this.texts=[];this.dialog='';this.shopOpen=false;this.sword=1;this.heartsBought=0;this.pickups=[];this.bow=false;this.arrow='normal';this.arrowKinds.clear();this.shots=[];this.ice.clear();this.fragments.clear();this.bossKey=false;this.deepest=0;this.region='forest';this.checkpoint={...SPAWN};this.history=[];this.screen='playing';this.keys.clear();this.showBanner();this.message('Uma nova jornada começa. Converse com Iris.');}
setCheat(name:keyof Cheats,on:boolean){this.cheats={...this.cheats,[name]:on};this.emit();}
fillWallet(){this.coins=999;this.emit();}
setZoom(z:number){this.zoom=Math.min(2,Math.max(1,z));this.draw();}

/* ---------- efeitos (quadros intermediários gerados por código) ---------- */
burst(x:number,y:number,color:string,n:number){for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,s=20+Math.random()*75;this.particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:.25+Math.random()*.5,color});}}
impact(x:number,y:number,size=1,color='#fff6d0'){this.effects.push({x,y,life:.22,max:.22,kind:'impact',size,color});}
ring(x:number,y:number,color:string,size:number){this.effects.push({x,y,life:.35,max:.35,kind:'ring',size,color});}
dust(x:number,y:number,n:number){for(let i=0;i<n;i++)this.effects.push({x:x+(Math.random()-.5)*18,y:y+2+(Math.random()-.5)*6,life:.3+Math.random()*.2,max:.5,kind:'dust',size:3+Math.random()*4,color:this.zone==='world'&&this.region==='snow'?'#ffffff':'#d8c9a8'});}
floatText(x:number,y:number,text:string,color:string){this.texts.push({x,y,text,life:.8,color});}
kick(power:number,time:number){this.shakePower=Math.max(this.shakePower,power);this.shake=Math.max(this.shake,time);}

/* ---------- saves e voltar no tempo ---------- */
serialize(){const mapState=(z:Zone)=>{const ids=new Set(this.maps[z].props.map(p=>p.id));return{enemies:this.maps[z].enemies,opened:this.maps[z].props.filter(p=>p.open).map(p=>p.id),removed:this.base[z].filter(p=>!ids.has(p.id)).map(p=>p.id)};};
return JSON.stringify({v:SAVE_VERSION,zone:this.zone,player:this.player,sword:this.sword,heartsBought:this.heartsBought,bow:this.bow,arrow:this.arrow,arrowKinds:[...this.arrowKinds],coins:this.coins,potions:this.potions,hasKey:this.hasKey,met:this.met,entered:this.entered,levers:[...this.levers],bossDead:this.bossDead,defeated:this.defeated,elapsed:this.elapsed,fragments:[...this.fragments],bossKey:this.bossKey,deepest:this.deepest,region:this.region,checkpoint:this.checkpoint,projectiles:this.projectiles,maps:Object.fromEntries(ZONES.map(z=>[z,mapState(z)]))});}
private applyState(json:string){const s=JSON.parse(json);if(s?.v!==SAVE_VERSION||!ZONES.includes(s.zone)||typeof s.player?.x!=='number')throw new Error('Save inválido.');
for(const z of ZONES){const st=s.maps[z],removed=new Set<string>(st.removed),opened=new Set<string>(st.opened);this.maps[z].props=this.base[z].filter(p=>!removed.has(p.id)).map(p=>({...p,open:opened.has(p.id)}));this.maps[z].enemies=(st.enemies as Entity[]).map(e=>({...e,frozen:e.frozen||0}));this.rebuildGrid(z);}
this.zone=s.zone;this.player={...freshPlayer(),...s.player};this.sword=s.sword===2?2:1;this.heartsBought=Math.min(2,s.heartsBought|0);this.bow=!!s.bow;this.arrowKinds=new Set((Array.isArray(s.arrowKinds)?s.arrowKinds:[]).filter((k:string)=>k in ARROW_NAME&&k!=='normal'));this.arrow=s.arrow==='normal'||this.arrowKinds.has(s.arrow)?s.arrow:'normal';this.shots=[];this.coins=s.coins;this.potions=s.potions;this.hasKey=s.hasKey;this.met=s.met;this.entered=s.entered;this.levers=new Set(s.levers);this.bossDead=s.bossDead;this.defeated=s.defeated;this.elapsed=s.elapsed;this.fragments=new Set(s.fragments);this.bossKey=!!s.bossKey;this.deepest=s.deepest|0;this.region=s.region in BIOMES?s.region:'forest';this.checkpoint={...s.checkpoint};this.projectiles=s.projectiles.map((p:Adventure['projectiles'][number])=>({...p}));}
load(json:string){try{this.applyState(json);}catch{this.message('Não foi possível carregar este save.');return false;}this.history=[];this.effects=[];this.texts=[];this.pickups=[];this.ice.clear();this.dialog='';this.shopOpen=false;this.keys.clear();this.screen='playing';this.showBanner();this.message('Jornada carregada.');return true;}
rewindBy(seconds:number){if(!this.history.length)return;const target=Math.max(0,this.history.length-Math.round(seconds/HISTORY_STEP));this.applyState(this.history[target]);this.history.length=target;this.player.hurt=1;this.screen='playing';this.dialog='';this.keys.clear();this.emit();}
private rewindTick(){if(!this.history.length)return;this.rewindFrame++;if(this.rewindFrame%2)return;this.applyState(this.history.pop()!);this.player.hurt=Math.max(this.player.hurt,.5);if(this.screen==='dead')this.screen='playing';}
private pollGamepad(){const gp=typeof navigator!=='undefined'?navigator.getGamepads?.().find(g=>g):null;if(!gp){if(this.padKeys.size){for(const k of this.padKeys)this.keyUp(k);this.padKeys=new Set();}return;}const b=gp.buttons.map(x=>x.pressed),ax=gp.axes[0]||0,ay=gp.axes[1]||0,want=new Set<string>();
const map:[boolean,string][]=[[b[0],'j'],[b[1],'e'],[b[2],'shift'],[b[3],'q'],[b[4],'k'],[b[9],'escape'],[b[6]&&b[7],'r'],[b[5],'f'],[b[10],'t'],[b[11],'l'],[b[12]||ay<-.5,'arrowup'],[b[13]||ay>.5,'arrowdown'],[b[14]||ax<-.5,'arrowleft'],[b[15]||ax>.5,'arrowright']];
for(const[on,k]of map)if(on)want.add(k);for(const k of want)if(!this.padKeys.has(k))this.keyDown(k);for(const k of this.padKeys)if(!want.has(k))this.keyUp(k);this.padKeys=want;}

/* ---------- som ---------- */
setSound(on:boolean){this.sound=on;if(on&&!this.audio){try{this.audio=new AudioContext();}catch{this.sound=false;}}if(on)this.audio?.resume();}
tone(freq:number,duration:number,type:OscillatorType='sine'){if(!this.sound||!this.audio)return;const o=this.audio.createOscillator(),g=this.audio.createGain();o.type=type;o.frequency.value=freq;g.gain.setValueAtTime(.035,this.audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,this.audio.currentTime+duration);o.connect(g);g.connect(this.audio.destination);o.start();o.stop(this.audio.currentTime+duration);}

/* ---------- lógica ---------- */
update(dt:number){if(this.screen!=='playing'||this.dialog||this.shopOpen)return;this.elapsed+=dt;const p=this.player;const wasJumping=p.jump>0;for(const k of['hurt','attack','cooldown','dash','dashCooldown','jump','jumpCooldown','flash','squash','spin','shoot'] as const)p[k]=Math.max(0,p[k]-dt);
if((this.keys.has('j')||this.keys.has(' '))&&p.attack<=0&&p.spin<=0&&!wasJumping&&p.dash<=0){const before=p.charge;p.charge+=dt;if(before<CHARGE_TIME&&p.charge>=CHARGE_TIME){this.tone(880,.12,'triangle');this.ring(p.x,p.y-8,'#fff1b7',36);}}
let dx=0,dy=0;for(const k of this.keys){const d=this.directionForKey(k);if(d){dx+=dirs[d].x;dy+=dirs[d].y;if(!wasJumping)p.dir=d;}}
if(p.dash>0||wasJumping){dx=dirs[p.dir].x;dy=dirs[p.dir].y;}const length=Math.hypot(dx,dy);if(length>0){const speed=wasJumping?JUMP_SPEED:p.dash>0?360:p.attack>0||p.charge>0?72:125;this.move(dx/length*speed*dt,dy/length*speed*dt);p.walk+=dt;if(!wasJumping&&p.dash<=0){this.stepTimer-=dt;if(this.stepTimer<=0){this.stepTimer=.26;this.dust(p.x+(Math.random()-.5)*8,p.y,1);}}if(p.dash>0)this.effects.push({x:p.x,y:p.y,life:.18,max:.18,kind:'ghost',size:1,color:'',frame:1,row:dirs[p.dir].row});}else p.walk=0;
this.pushDir=length>0&&!wasJumping&&p.dash<=0?dirs[p.dir]:null;
if(wasJumping&&p.jump<=0)this.land();
this.collectPickups(dt);
if(p.vx||p.vy){this.move(p.vx*dt,p.vy*dt);const f=Math.exp(-12*dt);p.vx*=f;p.vy*=f;if(Math.abs(p.vx)<4&&Math.abs(p.vy)<4){p.vx=0;p.vy=0;}}
for(const e of this.map.enemies){if(e.dying>0){e.dying=Math.max(0,e.dying-dt);continue;}if(e.hp<=0){if(e.respawn&&this.elapsed>e.respawn&&Math.hypot(p.x-e.homeX,p.y-e.homeY)>420){e.hp=e.maxHp;e.x=e.homeX;e.y=e.homeY;e.vx=0;e.vy=0;e.frozen=0;e.timer=0;e.respawn=undefined;}continue;}const ex=p.x-e.x,ey=p.y-e.y;if(Math.abs(ex)>700||Math.abs(ey)>500)continue;e.hit=Math.max(0,e.hit-dt);e.flash=Math.max(0,e.flash-dt);if(e.frozen>0){this.updateFrozen(e,dt);continue;}e.timer+=dt;const heavy=e.kind==='boss'||e.kind==='golem',air=e.kind==='bat',r=heavy?16:7;
if(e.vx||e.vy){const mx=e.vx*dt,my=e.vy*dt;if(!this.collides(e.x+mx,e.y,r,air))e.x+=mx;if(!this.collides(e.x,e.y+my,r,air))e.y+=my;const f=Math.exp(-10*dt);e.vx*=f;e.vy*=f;if(Math.abs(e.vx)<4&&Math.abs(e.vy)<4){e.vx=0;e.vy=0;}}
const d=Math.hypot(ex,ey),awake=e.kind==='boss'?this.levers.size===2&&p.y<9*T:e.kind==='golem'?d<230:d<190;if(awake&&e.hit===0){const cyc=e.kind==='boss'?bossCycle(e):3,charge=e.kind==='boss'?e.timer%cyc>cyc-1:e.kind==='golem'&&e.timer%3>2.1;const speed=e.kind==='boss'?charge?(cyc<3?135:112):22:e.kind==='golem'?charge?125:30:e.kind==='bat'?67:42;if(d>20){const mx=ex/(d||1)*speed*dt,my=ey/(d||1)*speed*dt;if(!this.collides(e.x+mx,e.y,r,air))e.x+=mx;if(!this.collides(e.x,e.y+my,r,air))e.y+=my;}if(d<(e.kind==='boss'?30:e.kind==='golem'?26:21))this.damage(e.x,e.y);if(e.kind==='boss'&&e.timer>cyc){e.timer=0;const rage=cyc<3;for(const angle of rage?[-.44,-.22,0,.22,.44]:[-.22,0,.22]){const a=Math.atan2(ey,ex)+angle;this.projectiles.push({x:e.x,y:e.y,vx:Math.cos(a)*(rage?130:105),vy:Math.sin(a)*(rage?130:105),life:3});}}}}
for(const s of this.projectiles){s.x+=s.vx*dt;s.y+=s.vy*dt;s.life-=dt;if(Math.hypot(s.x-p.x,s.y-p.y)<14&&p.jump<=0&&p.hurt<=0){this.damage(s.x,s.y);s.life=0;}if(this.collides(s.x,s.y,2,true))s.life=0;}this.projectiles=this.projectiles.filter(s=>s.life>0);
this.updateIce(dt);this.updateShots(dt);if(this.zone==='temple'&&this.levers.size<2)this.respawnPuzzleSlimes();
if(this.zone==='world'){const b=this.map.biome?.[Math.floor(p.y/T)]?.[Math.floor(p.x/T)];if(b&&b!==this.region){this.region=b;this.checkpoint={x:p.x,y:p.y};this.showBanner();this.emit();}}
this.noticeTime-=dt;if(this.noticeTime<=0)this.notice='';this.bannerTime=Math.max(0,this.bannerTime-dt);this.musicTimer-=dt;if(this.musicTimer<=0){this.musicTimer=.42;const notes=this.zone==='world'?BIOMES[this.region].music:this.zone==='temple'?TEMPLE_NOTES:CAVE_NOTES;this.tone(notes[this.musicStep++%notes.length],.3);}
this.historyTimer+=dt;if(this.historyTimer>=HISTORY_STEP){this.historyTimer=0;this.history.push(this.serialize());if(this.history.length>HISTORY_MAX)this.history.shift();}
}
tick=(now:number)=>{if(this.disposed)return;const dt=Math.min(.035,(now-this.lastTime)/1000||.016);this.lastTime=now;this.pollGamepad();
if(this.rewinding&&(this.screen==='playing'||this.screen==='dead'))this.rewindTick();else if(this.freeze>0)this.freeze=Math.max(0,this.freeze-dt);else{const steps=this.fast?this.fastSpeed:1;for(let i=0;i<steps;i++)this.update(dt);}
this.shake=Math.max(0,this.shake-dt);if(this.shake<=0)this.shakePower=0;for(const p of this.particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;}this.particles=this.particles.filter(p=>p.life>0);for(const e of this.effects){e.life-=dt;if(e.kind==='dust')e.y-=10*dt;}this.effects=this.effects.filter(e=>e.life>0);for(const t of this.texts){t.life-=dt;t.y-=38*dt;}this.texts=this.texts.filter(t=>t.life>0);
this.draw();if(now-this.lastEmit>120){this.emit();this.lastEmit=now;}this.raf=requestAnimationFrame(this.tick);};
run(){this.raf=requestAnimationFrame(this.tick);}
destroy(){this.disposed=true;cancelAnimationFrame(this.raf);this.audio?.close();}

/* ---------- desenho ---------- */
// Cópia do atlas com filtro de cor, gerada uma vez. Sem suporte a ctx.filter, usa o atlas original.
variant(filter:string):CanvasImageSource{if(filter==='none')return this.assets.atlas;const cached=this.variants.get(filter);if(cached)return cached;const img=this.assets.atlas,c=document.createElement('canvas');c.width=img.width;c.height=img.height;const x=c.getContext('2d')!;if(typeof x.filter!=='string'){this.variants.set(filter,img);return img;}x.filter=filter;x.drawImage(img,0,0);this.variants.set(filter,c);return c;}
whiteHero(){if(this.heroWhite)return this.heroWhite;const img=this.assets.hero,c=document.createElement('canvas');c.width=img.width;c.height=img.height;const x=c.getContext('2d')!;x.drawImage(img,0,0);x.globalCompositeOperation='source-atop';x.fillStyle='#ffffff';x.fillRect(0,0,c.width,c.height);this.heroWhite=c;return c;}
drawTile(index:number,x:number,y:number,w=T,h=T,src:CanvasImageSource=this.assets.atlas,ctx=this.ctx){const img=this.assets.atlas,cw=img.width/4,ch=img.height/4;ctx.drawImage(src,(index%4)*cw,Math.floor(index/4)*ch,cw,ch,Math.round(x),Math.round(y),w,h);}
// sx/sy: deformação (squash & stretch) a partir dos pés do sprite.
drawSprite(index:number,x:number,y:number,size=48,filter='none',sx=1,sy=1){if(sx===1&&sy===1){this.drawTile(index,x-size/2,y-size*.8,size,size,this.variant(filter));return;}const c=this.ctx;c.save();c.translate(Math.round(x),Math.round(y+size*.2));c.scale(sx,sy);this.drawTile(index,-size/2,-size,size,size,this.variant(filter));c.restore();}
groundLayer(zone:Zone){const cached=this.ground.get(zone);if(cached)return cached;const m=this.maps[zone],c=document.createElement('canvas');c.width=m.width*T;c.height=m.height*T;const g=c.getContext('2d')!;g.imageSmoothingEnabled=false;
for(let y=0;y<m.height;y++)for(let x=0;x<m.width;x++){const t=m.tiles[y][x],px=x*T,py=y*T;
if(zone!=='world'){const f=this.variant(CAVE_FILTER[zone]);if(t===6){g.fillStyle='#04060b';g.fillRect(px,py,T,T);if(m.tiles[y-1]?.[x]!==6){g.fillStyle='#2a3247';g.fillRect(px,py,T,6);g.fillStyle='#151b29';g.fillRect(px,py+6,T,5);}}else if(t===2)this.drawTile(2,px,py,T,T,this.variant('brightness(.7) saturate(.9)'),g);else this.drawTile(t===4?7:t,px,py,T,T,t===3?this.variant(CAVE_FLOOR[zone]):f,g);continue;}
const b=BIOMES[m.biome![y][x]];
if(t===0)this.drawTile(b.ground,px,py,T,T,this.variant(b.filter),g);else if(t===1)this.drawTile(1,px,py,T,T,this.variant(b.pathFilter),g);else if(t===4)this.drawTile(7,px,py,T,T,this.variant(b.wallFilter),g);else{this.drawTile(2,px,py,T,T,this.variant(b.waterFilter),g);if(t===5){const horizontal=[1,5].includes(m.tiles[y][x-1])||[1,5].includes(m.tiles[y][x+1]);g.fillStyle='#bd995c';g.fillRect(px,py,T,T);g.fillStyle='#947449';if(horizontal){g.fillRect(px,py+1,T,2);g.fillRect(px,py+29,T,2);for(let i=6;i<T;i+=8)g.fillRect(px+i,py+3,1,26);}else{g.fillRect(px+1,py,2,T);g.fillRect(px+29,py,2,T);for(let i=6;i<T;i+=8)g.fillRect(px+3,py+i,26,1);}}}}
this.ground.set(zone,c);return c;}
minimapLayer(){if(this.minimap)return this.minimap;const m=this.maps.world,c=document.createElement('canvas');c.width=m.width*2;c.height=m.height*2;const g=c.getContext('2d')!;
for(let y=0;y<m.height;y++)for(let x=0;x<m.width;x++){const t=m.tiles[y][x],b=m.biome![y][x];g.fillStyle=t===1?'#c8a86a':t===5?'#9a7748':t===4?(b==='canyon'?'#6e3b22':b==='snow'?'#9aa7b4':'#3a3f4a'):t===2?(b==='swamp'?'#3f5f45':'#3f8fc4'):BIOMES[b].mini;g.fillRect(x*2,y*2,2,2);}
g.fillStyle='#0003';for(const p of this.base.world)if(p.kind==='tree')g.fillRect(Math.floor(p.x/T)*2,Math.floor(p.y/T)*2,2,2);this.minimap=c;return c;}
drawWeather(c:CanvasRenderingContext2D,W:number,H:number){const t=this.elapsed;if(this.region==='snow'){c.fillStyle='#ffffffcc';for(let i=0;i<70;i++){const x=(i*137.5+Math.sin(t+i)*20+t*14)%W,y=(i*91.3+t*(38+i%5*8))%H;c.fillRect(x,y,2+i%2,2+i%2);}}
else if(this.region==='autumn'){for(let i=0;i<26;i++){c.fillStyle=i%3?'#d9822b':'#b8452a';const x=(i*173.1+Math.sin(t*1.3+i)*30+t*22)%W,y=(i*67.7+t*(30+i%4*6))%H;c.fillRect(x,y,4,3);}}
else if(this.region==='swamp'){const g=c.createRadialGradient(W/2,H/2,120,W/2,H/2,620);g.addColorStop(0,'rgba(20,35,20,0)');g.addColorStop(1,'rgba(10,22,12,.55)');c.fillStyle=g;c.fillRect(0,0,W,H);}
else if(this.region==='desert'){c.fillStyle='rgba(255,210,140,.07)';c.fillRect(0,0,W,H);}}
drawMinimap(c:CanvasRenderingContext2D,W:number){const mm=this.minimapLayer(),x0=W-mm.width-14,y0=14,p=this.player;c.globalAlpha=.88;c.fillStyle='#101a20';c.fillRect(x0-4,y0-4,mm.width+8,mm.height+8);c.drawImage(mm,x0,y0);c.globalAlpha=1;c.strokeStyle='#d4bd84';c.lineWidth=1;c.strokeRect(x0-4.5,y0-4.5,mm.width+9,mm.height+9);
const dot=(px:number,py:number,color:string,s=4)=>{c.fillStyle=color;c.fillRect(x0+Math.floor(px/T)*2-s/2,y0+Math.floor(py/T)*2-s/2,s,s);};
for(const q of this.maps.world.props){if(q.kind==='chest'&&!q.open&&(q.item==='fragment'||q.item==='heart'||q.item==='key'||q.item==='bow'))dot(q.x,q.y,q.item==='heart'?'#ff8f8f':q.item==='bow'?'#9fe6ff':'#ffe28a');if(q.kind==='door')dot(q.x,q.y,'#c9a6ff',5);if(q.id==='iris')dot(q.x,q.y,'#e8d2ff');}
if(Math.floor(this.elapsed*4)%2===0)dot(p.x,p.y,'#ffffff',5);}
drawBossBar(c:CanvasRenderingContext2D,W:number,H:number){if(this.zone!=='temple'||this.levers.size<2||this.bossDead)return;const b=this.map.enemies.find(e=>e.kind==='boss');if(!b||b.hp<=0)return;const w=Math.min(420,W-80),x=(W-w)/2,y=H-46,k=Math.max(0,b.hp/b.maxHp);c.fillStyle='#15242be6';c.fillRect(x-8,y-22,w+16,40);c.strokeStyle='#c8ba84';c.lineWidth=1;c.strokeRect(x-7.5,y-21.5,w+15,39);c.font='14px Georgia, serif';c.textAlign='center';c.fillStyle='#f3dbac';c.fillText(k<=.5?'Guardião de Pedra · enfurecido':'Guardião de Pedra',W/2,y-6);c.textAlign='start';c.fillStyle='#2b1f1f';c.fillRect(x,y,w,9);c.fillStyle=k<=.5?'#e8645e':'#e6aa80';c.fillRect(x,y,w*k,9);c.fillStyle='#ffffff33';c.fillRect(x,y,w*k,3);}
drawBanner(c:CanvasRenderingContext2D,W:number){if(this.bannerTime<=0)return;const a=Math.min(1,this.bannerTime,(2.6-this.bannerTime)*3);c.globalAlpha=a;c.font='28px Georgia, serif';const w=c.measureText(this.banner).width+90;c.fillStyle='#15242be6';c.fillRect(W/2-w/2,64,w,50);c.strokeStyle='#c8ba84';c.strokeRect(W/2-w/2+.5,64.5,w-1,49);c.fillStyle='#f3dbac';c.textAlign='center';c.textBaseline='middle';c.fillText(`✦  ${this.banner}  ✦`,W/2,90);c.textAlign='start';c.textBaseline='alphabetic';c.globalAlpha=1;}
drawEffects(c:CanvasRenderingContext2D,below:boolean){for(const e of this.effects){const t=1-e.life/e.max;if(below!==(e.kind==='dust'||e.kind==='ghost'))continue;
if(e.kind==='dust'){c.globalAlpha=.55*(1-t);c.fillStyle=e.color;const s=e.size*(1+t);c.beginPath();c.arc(e.x,e.y,s,0,Math.PI*2);c.fill();}
else if(e.kind==='ghost'){const img=this.assets.hero,cw=img.width/4,ch=img.height/4;c.globalAlpha=.35*(1-t);c.drawImage(this.whiteHero(),(e.frame??1)*cw,(e.row??0)*ch,cw,ch,Math.round(e.x-25),Math.round(e.y-42),50,50);}
else if(e.kind==='ring'){c.globalAlpha=1-t;c.strokeStyle=e.color;c.lineWidth=3*(1-t)+1;c.beginPath();c.ellipse(e.x,e.y,e.size*t,e.size*t*.55,0,0,Math.PI*2);c.stroke();}
else{// estrela de impacto: 3 quadros (flash, estrela, faíscas)
const s=e.size,r=(10+26*t)*s;c.globalAlpha=1-t*.6;if(t<.3){c.fillStyle='#ffffff';c.beginPath();c.arc(e.x,e.y,(9+20*t)*s,0,Math.PI*2);c.fill();}c.fillStyle=e.color;c.beginPath();for(let i=0;i<16;i++){const a=i*Math.PI/8+e.x,rr=i%2?r*.38:r;c.lineTo(e.x+Math.cos(a)*rr,e.y+Math.sin(a)*rr*.85);}c.closePath();c.fill();if(t>.35){c.strokeStyle='#fff1b7';c.lineWidth=2;for(let i=0;i<6;i++){const a=i*Math.PI/3+e.y;c.beginPath();c.moveTo(e.x+Math.cos(a)*r*.9,e.y+Math.sin(a)*r*.9);c.lineTo(e.x+Math.cos(a)*r*1.35,e.y+Math.sin(a)*r*1.35);c.stroke();}}}}c.globalAlpha=1;}
drawIce(c:CanvasRenderingContext2D){for(const[k,life]of this.ice){if(life<2&&Math.floor(life*6)%2===0)continue;const x=(k%1000)*T,y=Math.floor(k/1000)*T;c.globalAlpha=.88;c.fillStyle='#cdeefc';c.fillRect(x,y,T,T);c.globalAlpha=1;c.fillStyle='#f4fdff';c.fillRect(x+3,y+3,10,2);c.fillRect(x+18,y+20,8,2);c.strokeStyle='#8fc9e3';c.lineWidth=1;c.beginPath();c.moveTo(x+6,y+26);c.lineTo(x+14,y+16);c.lineTo(x+24,y+12);c.stroke();}}
drawShots(c:CanvasRenderingContext2D){for(const s of this.shots){const a=Math.atan2(s.vy,s.vx),col=ARROW_COLOR[s.kind];c.save();c.translate(s.x,s.y-12);c.rotate(a);if(s.kind!=='normal'){c.globalAlpha=.35;c.fillStyle=col;c.beginPath();c.ellipse(4,0,12,4,0,0,Math.PI*2);c.fill();c.globalAlpha=1;}c.fillStyle='#7a5a36';c.fillRect(-12,-1,18,2);c.fillStyle='#e8e2d0';c.fillRect(-14,-3,4,2);c.fillRect(-14,1,4,2);c.fillStyle=col;c.beginPath();c.moveTo(11,0);c.lineTo(5,-4);c.lineTo(5,4);c.fill();c.restore();}}
drawPuzzle(c:CanvasRenderingContext2D,o:Prop){const t=this.elapsed;
if(o.kind==='barrier'){const fire=this.map.props.find(q=>q.id===o.by?.[0])?.kind==='torch',col=fire?'255,150,70':'255,240,150';this.drawTile(7,o.x-T/2,o.y-T/2-8,T,T+8,this.variant('hue-rotate(230deg) saturate(1.6) brightness(.8)'));c.fillStyle=`rgba(${col},${.25+.15*Math.sin(t*4)})`;c.fillRect(o.x-T/2,o.y-T/2-8,T,T+8);c.strokeStyle=`rgba(${col},.8)`;c.lineWidth=1;for(let i=0;i<3;i++){const yy=o.y-T/2-4+((t*14+i*13)%(T+4));c.beginPath();c.moveTo(o.x-T/2+2,yy);c.lineTo(o.x+T/2-2,yy);c.stroke();}return;}
if(o.kind==='torch'){c.globalAlpha=.3;c.fillStyle='#000';c.beginPath();c.ellipse(o.x,o.y+4,10,3,0,0,Math.PI*2);c.fill();c.globalAlpha=1;c.fillStyle='#2d3038';c.fillRect(o.x-5,o.y-20,10,24);c.fillStyle='#4a4e5a';c.fillRect(o.x-4,o.y-20,3,24);c.fillStyle='#565b68';c.fillRect(o.x-10,o.y-26,20,7);c.fillStyle='#2d3038';c.fillRect(o.x-10,o.y-20,20,2);
if(o.open){const g=c.createRadialGradient(o.x,o.y-34,2,o.x,o.y-34,46);g.addColorStop(0,'rgba(255,190,90,.45)');g.addColorStop(1,'rgba(255,150,60,0)');c.fillStyle=g;c.fillRect(o.x-46,o.y-80,92,92);const f=Math.sin(t*18+o.x)*1.5;c.fillStyle='#ff7a2a';c.beginPath();c.ellipse(o.x,o.y-33+f*.3,7,11+f,0,0,Math.PI*2);c.fill();c.fillStyle='#ffd36b';c.beginPath();c.ellipse(o.x,o.y-30,4,7+f*.6,0,0,Math.PI*2);c.fill();}else{c.fillStyle='#1a1b20';c.fillRect(o.x-8,o.y-27,16,3);}return;}
this.drawSprite(5,o.x,o.y,46,o.open?'hue-rotate(15deg) saturate(1.4) brightness(1.25)':'hue-rotate(200deg) saturate(.45) brightness(.7)');const ry=o.y-24;c.fillStyle=o.open?'#fff3a0':'#5d6280';if(o.open){c.globalAlpha=.4+.25*Math.sin(t*5);c.beginPath();c.arc(o.x,ry,14,0,Math.PI*2);c.fill();c.globalAlpha=1;}c.beginPath();c.moveTo(o.x,ry-7);c.lineTo(o.x+5,ry);c.lineTo(o.x,ry+7);c.lineTo(o.x-5,ry);c.fill();}
drawHero(c:CanvasRenderingContext2D){const p=this.player,img=this.assets.hero,cw=img.width/4,ch=img.height/4,d=dirs[p.dir];
const at=p.attack>0?1-p.attack/ATTACK_TIME:-1;// 0..1 durante o golpe: antecipação, corte, recuperação
const windup=at>=0&&at<.22,swing=at>=.22&&at<.78;
const st=p.spin>0?1-p.spin/SPIN_TIME:-1;// giro: passa pelas quatro direções do sprite
const frame=st>=0||p.shoot>0?3:at>=0?(windup?0:3):p.walk>0?[1,0,2,0][Math.floor(p.walk*9)%4]:0;
const bob=p.walk>0&&at<0?-Math.abs(Math.sin(p.walk*Math.PI*4.5))*2:0,lift=p.jump>0?Math.sin((1-p.jump/JUMP_TIME)*Math.PI)*JUMP_HEIGHT:0;
const lunge=at<0?0:windup?-3*(at/.22):swing?5:5*(1-(at-.78)/.22);
let sx=1,sy=1;if(p.squash>0){const k=p.squash/.14;sx=1+.16*k;sy=1-.14*k;}else if(p.jump>0){sx=.92;sy=1.1;}else if(windup){sx=1.05;sy=.96;}
const row=st>=0?(d.row+Math.floor(st*8))%4:d.row;
const x=p.x+d.x*lunge,y=p.y+d.y*lunge+bob-lift;
c.globalAlpha=.28;c.fillStyle='#000';c.beginPath();c.ellipse(p.x,p.y+5,(14-lift*.18),(5-lift*.06),0,0,Math.PI*2);c.fill();c.globalAlpha=1;
if(p.hurt>0&&p.flash<=0&&Math.floor(this.elapsed*14)%2===0)c.globalAlpha=.45;
const blit=(src:CanvasImageSource)=>{c.save();c.translate(Math.round(x),Math.round(y+8));c.scale(sx,sy);c.drawImage(src,frame*cw,row*ch,cw,ch,-25,-50,50,50);c.restore();};
blit(img);if(p.flash>0){c.globalAlpha=Math.min(1,p.flash/.14);blit(this.whiteHero());}c.globalAlpha=1;
if(st>=0){const from=d.angle,to=from-Math.PI*2*Math.min(1,st*1.25);for(let i=0;i<4;i++){c.globalAlpha=(1-st*.6)*(1-i*.22);c.strokeStyle=i?'#f5cb69':'#fff8d8';c.lineWidth=(6-i)*1.1;c.beginPath();c.arc(p.x,p.y-9,36+i*4,to+i*.25,Math.min(from,to+2.4),false);c.stroke();}c.globalAlpha=1;}
if(p.charge>.15&&st<0){const full=p.charge>=CHARGE_TIME,tx=p.x+d.x*24,ty=p.y-12+d.y*18,r=full?3+Math.sin(this.elapsed*30)*1.5:2+p.charge/CHARGE_TIME*2;c.globalAlpha=full?.9:.6;c.fillStyle=full?'#ffffff':'#fff1b7';c.beginPath();c.arc(tx,ty,r+2,0,Math.PI*2);c.fill();if(full){c.strokeStyle='#ffe9a8';c.lineWidth=1.5;for(let i=0;i<4;i++){const a=i*Math.PI/2+this.elapsed*6;c.beginPath();c.moveTo(tx+Math.cos(a)*5,ty+Math.sin(a)*5);c.lineTo(tx+Math.cos(a)*10,ty+Math.sin(a)*10);c.stroke();}}c.globalAlpha=1;}
if(swing||(at>=.78)){const k=swing?(at-.22)/.56:1,fade=at>=.78?1-(at-.78)/.22:1,from=d.angle-1.15,to=from+2.3*Math.min(1,k*1.15);for(let i=0;i<4;i++){c.globalAlpha=fade*(1-i*.22);c.strokeStyle=i?'#f5cb69':'#fff8d8';c.lineWidth=(5-i)*1.1;c.beginPath();c.arc(p.x,p.y-9-lift,33+i*4,Math.max(from,to-1.2+i*.12),to-i*.18);c.stroke();}c.globalAlpha=fade;c.fillStyle='#ffffff';c.beginPath();c.arc(p.x+Math.cos(to)*37,p.y-9-lift+Math.sin(to)*37,3,0,Math.PI*2);c.fill();c.globalAlpha=1;}}
drawEnemy(c:CanvasRenderingContext2D,e:Entity){const index=e.kind==='slime'?12:e.kind==='bat'?13:14,size=e.kind==='boss'?87:e.kind==='golem'?66:42;let sx=1,sy=1,yo=0,alpha=1;
if(e.kind==='slime'){const s=Math.sin(e.timer*7);sx=1+s*.08;sy=1-s*.08;}else if(e.kind==='bat'){sx=1-Math.abs(Math.sin(e.timer*12))*.28;yo=Math.sin(e.timer*6)*4;}else{yo=Math.sin(e.timer*6);if(e.kind==='golem'&&e.timer%3>2.1){sx=1.06;sy=.95;}}
if(e.frozen>0){sx=1;sy=1;yo=0;}if(e.flash>0){const k=e.flash/.12;sx*=1+.22*k;sy*=1-.2*k;}
if(e.dying>0){const t=1-e.dying/.4;sx*=1+t*.5;sy*=Math.max(.05,1-t);alpha=1-t;}
c.globalAlpha=.25*alpha;c.fillStyle='#000';c.beginPath();c.ellipse(e.x,e.y+5,size*.28,size*.09,0,0,Math.PI*2);c.fill();
c.globalAlpha=alpha*(e.hit>0&&e.flash<=0&&Math.floor(this.elapsed*30)%2===0?.7:1);const rage=e.kind==='boss'&&e.hp<=e.maxHp/2;this.drawSprite(index,e.x,e.y+yo,size,e.frozen>0?ICE:rage?RAGE:e.tint??'none',sx,sy);
if(e.dying<=0&&e.frozen<=0&&(e.kind==='golem'||e.kind==='boss')&&Math.hypot(this.player.x-e.x,this.player.y-e.y)<260&&(e.kind==='boss'?this.levers.size===2:true)){const cyc=e.kind==='boss'?bossCycle(e):3,ph=e.timer%cyc;if(ph>cyc-1.5&&ph<=cyc-1){c.globalAlpha=.3+.3*Math.abs(Math.sin(this.elapsed*16));this.drawSprite(index,e.x,e.y+yo,size,WARN,sx*1.04,sy*1.04);c.globalAlpha=alpha;}}if(e.frozen>0&&!(e.frozen<1.5&&Math.floor(e.frozen*8)%2===0)){c.globalAlpha=.35;c.fillStyle='#d8f6ff';c.fillRect(e.x-size*.32,e.y-size*.62,size*.64,size*.66);c.globalAlpha=.9;c.strokeStyle='#e9fbff';c.lineWidth=1.5;c.strokeRect(e.x-size*.32+.5,e.y-size*.62+.5,size*.64,size*.66);c.globalAlpha=alpha;}
if(e.flash>0||e.dying>.25){c.globalAlpha=e.dying>0?Math.min(1,(e.dying-.25)/.15):Math.min(1,e.flash/.12);this.drawSprite(index,e.x,e.y+yo,size,WHITE,sx,sy);}c.globalAlpha=1;
if(e.dying<=0&&(e.hp<e.maxHp||e.kind==='boss'&&this.levers.size===2||e.kind==='golem')){const by=e.y-(e.kind==='golem'?58:e.kind==='boss'?62:38);c.fillStyle='#1e2429';c.fillRect(e.x-17,by,34,4);c.fillStyle='#e6aa80';c.fillRect(e.x-17,by,34*e.hp/e.maxHp,4);}}
draw(){const c=this.ctx,p=this.player,m=this.map,W=this.canvas.width/this.zoom,H=this.canvas.height/this.zoom;c.imageSmoothingEnabled=false;this.camera.x=m.width*T<W?(m.width*T-W)/2:Math.max(0,Math.min(m.width*T-W,p.x-W/2));this.camera.y=m.height*T<H?(m.height*T-H)/2:Math.max(0,Math.min(m.height*T-H,p.y-H/2));c.fillStyle=this.zone==='world'?'#285336':'#0d1420';c.fillRect(0,0,this.canvas.width,this.canvas.height);c.save();c.scale(this.zoom,this.zoom);
const sk=this.shake>0?this.shakePower*(this.shake/.22):0;c.translate(-Math.round(this.camera.x*this.zoom)/this.zoom+Math.round((Math.random()-.5)*sk),-Math.round(this.camera.y*this.zoom)/this.zoom+Math.round((Math.random()-.5)*sk));
c.drawImage(this.groundLayer(this.zone),0,0);this.drawIce(c);
const x0=Math.max(0,Math.floor(this.camera.x/T)),x1=Math.min(m.width,Math.ceil((this.camera.x+W)/T)+1),y0=Math.max(0,Math.floor(this.camera.y/T)),y1=Math.min(m.height,Math.ceil((this.camera.y+H)/T)+1);
if(this.zone!=='temple'){c.fillStyle='rgba(159,228,216,.13)';for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++)if(m.tiles[y][x]===2){const wave=(Math.sin(this.elapsed*2+y+x)*3)|0;c.fillRect(x*T+4,y*T+14+wave,13,1);}}
if(this.zone==='temple'){if(this.levers.size<2){c.fillStyle='#b58b52';c.fillRect(12*T,8*T,2*T,T);c.fillStyle='#684c3f';for(let x=12*T+4;x<14*T;x+=8)c.fillRect(x,8*T,3,T);}for(const prop of m.props.filter(a=>a.kind==='lever')){c.fillStyle=this.levers.has(prop.id)?'#7fdcc3':'#9e7cb0';c.fillRect(prop.x-12,prop.y-7,24,14);c.strokeStyle=this.levers.has(prop.id)?'#b6ffe8':'#dbc1e8';c.lineWidth=2;c.strokeRect(prop.x-13,prop.y-8,26,16);}}
this.drawEffects(c,true);this.drawPickups(c);
const visible=(x:number,y:number)=>x>this.camera.x-90&&x<this.camera.x+W+90&&y>this.camera.y-60&&y<this.camera.y+H+110;
const tintAt=(x:number,y:number)=>this.zone==='world'?BIOMES[m.biome![Math.floor(y/T)]?.[Math.floor(x/T)]??'forest'].propFilter:this.zone==='temple'?'none':CAVE_FILTER[this.zone];
const drawable:{y:number;render:()=>void}[]=m.props.filter(a=>a.kind!=='lever'&&visible(a.x,a.y)).map(o=>({y:o.y,render:()=>{if(o.kind==='torch'||o.kind==='totem'||o.kind==='barrier'){this.drawPuzzle(c,o);return;}const index={tree:4,rock:5,bush:6,npc:10,chest:o.open?9:8,door:15,exit:15,stairs:15,relic:11}[o.kind as Exclude<Prop['kind'],'lever'|'torch'|'totem'|'barrier'>];const filter=o.kind==='npc'?NPCS[o.id]?.tint??'none':o.kind==='door'?'none':o.kind==='stairs'&&o.needs==='bosskey'&&!this.bossKey?'brightness(.6) sepia(.4)':tintAt(o.x,o.y);if(o.kind==='relic'&&!this.bossDead){c.globalAlpha=.35;this.drawSprite(index,o.x,o.y,44);c.globalAlpha=1;}else this.drawSprite(index,o.x,o.y,o.kind==='tree'?68:o.kind==='door'||o.kind==='exit'||o.kind==='stairs'?66:o.kind==='npc'?47:42,filter,o.kind==='npc'?1:1,o.kind==='npc'?1+Math.sin(this.elapsed*2.4+o.x)*.02:1);if(o.kind==='chest'&&!o.open&&(o.item==='fragment'||o.item==='bosskey'||o.item==='heart')){c.globalAlpha=.5+.3*Math.sin(this.elapsed*4);c.fillStyle='#fff3b0';c.fillRect(o.x-2,o.y-44,4,4);c.globalAlpha=1;}}}));
for(const e of m.enemies){if((e.hp<=0&&e.dying<=0)||!visible(e.x,e.y))continue;drawable.push({y:e.y,render:()=>this.drawEnemy(c,e)});}
drawable.push({y:p.y,render:()=>this.drawHero(c)});drawable.sort((a,b)=>a.y-b.y).forEach(d=>d.render());
this.drawShots(c);for(const s of this.projectiles){c.fillStyle='#e4ad59';c.fillRect(s.x-4,s.y-4,8,8);c.fillStyle='#fff0b1';c.fillRect(s.x-2,s.y-2,4,4);}for(const f of this.particles){c.globalAlpha=Math.min(1,f.life*3);c.fillStyle=f.color;c.fillRect(f.x,f.y,3,3);}c.globalAlpha=1;
this.drawEffects(c,false);
c.font='bold 16px Georgia, serif';c.textAlign='center';for(const t of this.texts){c.globalAlpha=Math.min(1,t.life*2.5);c.fillStyle='#1a1410';c.fillText(t.text,t.x+1,t.y+1);c.fillStyle=t.color;c.fillText(t.text,t.x,t.y);}c.textAlign='start';c.globalAlpha=1;
c.restore();
{const W=this.canvas.width,H=this.canvas.height;
if(this.zone!=='world'){const gradient=c.createRadialGradient(W/2,H/2,80,W/2,H/2,600);gradient.addColorStop(0,'rgba(5,10,26,0)');gradient.addColorStop(1,`rgba(5,10,26,${this.zone==='temple'?.5:.62})`);c.fillStyle=gradient;c.fillRect(0,0,W,H);}
if(this.zone==='world'){this.drawWeather(c,W,H);if(this.screen!=='ready')this.drawMinimap(c,W);}
if(p.flash>0){c.fillStyle=`rgba(200,40,40,${p.flash})`;c.fillRect(0,0,W,H);}
this.drawBanner(c,W);
if(this.rewinding&&this.history.length){c.fillStyle='rgba(60,40,110,.18)';c.fillRect(0,0,W,H);}
this.drawBossBar(c,W,H);
}}
}
