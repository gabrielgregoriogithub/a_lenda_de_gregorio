// Mundo aberto de A Lenda de Gregório: regiões, gerador determinístico e diálogos.
// Toda a arte vem do atlas original; cada região só aplica um filtro de cor por cima.
import type {Entity,GameMap,Prop} from './adventure';

export type Biome='village'|'forest'|'lake'|'desert'|'snow'|'autumn'|'swamp'|'ruins'|'canyon';
export type BiomeStyle={name:string;ground:number;filter:string;pathFilter:string;propFilter:string;enemyFilter:string;waterFilter:string;wallFilter:string;mini:string;music:number[]};
export const WORLD_W=96,WORLD_H=72;
const CELL_W=32,CELL_H=24;
const NONE='none';

export const BIOMES:Record<Biome,BiomeStyle>={
  village:{name:'Vila de Elara',ground:0,filter:'saturate(1.05) brightness(1.04)',pathFilter:NONE,propFilter:NONE,enemyFilter:NONE,waterFilter:NONE,wallFilter:NONE,mini:'#5f9b4f',music:[261.63,329.63,392,523.25,440,392,329.63,293.66]},
  forest:{name:'Bosque de Elara',ground:0,filter:'saturate(.9) brightness(.86)',pathFilter:'brightness(.92)',propFilter:'brightness(.94)',enemyFilter:NONE,waterFilter:NONE,wallFilter:NONE,mini:'#3b7239',music:[261.63,329.63,392,523.25,440,392,329.63,293.66]},
  lake:{name:'Lago da Lua',ground:0,filter:'hue-rotate(12deg) saturate(1.1) brightness(1.05)',pathFilter:NONE,propFilter:'hue-rotate(10deg)',enemyFilter:'hue-rotate(70deg) saturate(1.1)',waterFilter:'brightness(1.08)',wallFilter:NONE,mini:'#58a072',music:[293.66,369.99,440,587.33,493.88,440,369.99,329.63]},
  desert:{name:'Deserto do Sol',ground:1,filter:'saturate(1.35) brightness(1.2) hue-rotate(-8deg)',pathFilter:'saturate(1.1) brightness(1.08)',propFilter:'sepia(.6) saturate(1.2) brightness(1.05)',enemyFilter:'hue-rotate(-65deg) saturate(1.4)',waterFilter:'hue-rotate(-12deg) brightness(1.1)',wallFilter:'sepia(.8) saturate(1.3) brightness(1.1)',mini:'#d8b56b',music:[220,261.63,311.13,329.63,392,329.63,311.13,261.63]},
  snow:{name:'Montanhas Geladas',ground:0,filter:'grayscale(1) brightness(1.95) contrast(.78)',pathFilter:'grayscale(1) brightness(1.55) contrast(.8)',propFilter:'saturate(.25) brightness(1.5) contrast(.9)',enemyFilter:'hue-rotate(80deg) saturate(.7) brightness(1.25)',waterFilter:'saturate(.35) brightness(1.55)',wallFilter:'grayscale(1) brightness(1.75)',mini:'#e5edf2',music:[329.63,392,493.88,659.25,587.33,493.88,392,369.99]},
  autumn:{name:'Floresta de Outono',ground:0,filter:'sepia(.5) saturate(1.5) hue-rotate(-14deg) brightness(.95)',pathFilter:'saturate(.9)',propFilter:'sepia(.75) saturate(2.4) hue-rotate(-22deg)',enemyFilter:'hue-rotate(-90deg) saturate(1.3)',waterFilter:NONE,wallFilter:'sepia(.4)',mini:'#c47b39',music:[246.94,293.66,369.99,440,392,369.99,293.66,277.18]},
  swamp:{name:'Pântano Sombrio',ground:0,filter:'saturate(.55) brightness(.62) hue-rotate(28deg)',pathFilter:'brightness(.7) saturate(.7)',propFilter:'saturate(.55) brightness(.74)',enemyFilter:'hue-rotate(170deg) brightness(.9)',waterFilter:'hue-rotate(-85deg) saturate(.55) brightness(.62)',wallFilter:'brightness(.6)',mini:'#4c5b3b',music:[196,233.08,293.66,277.18,233.08,196,174.61,185]},
  ruins:{name:'Ruínas da Lua',ground:3,filter:'brightness(1.45) saturate(.65) sepia(.18)',pathFilter:NONE,propFilter:'saturate(.8)',enemyFilter:'grayscale(.5)',waterFilter:NONE,wallFilter:'brightness(.9)',mini:'#7d8396',music:[220,261.63,329.63,293.66,246.94,220,196,246.94]},
  canyon:{name:'Desfiladeiro Rubro',ground:1,filter:'sepia(.6) saturate(1.55) hue-rotate(-22deg) brightness(.9)',pathFilter:'sepia(.3) brightness(.95)',propFilter:'sepia(.6) saturate(1.3) hue-rotate(-20deg)',enemyFilter:'hue-rotate(-115deg) saturate(1.3)',waterFilter:NONE,wallFilter:'sepia(1) saturate(1.4) hue-rotate(-18deg) brightness(.82)',mini:'#a9643b',music:[207.65,246.94,311.13,277.18,246.94,207.65,185,207.65]},
};
export const SPITTER_TINT='hue-rotate(250deg) saturate(1.7) brightness(.9)';
const LAYOUT:Biome[][]=[['snow','ruins','autumn'],['desert','forest','lake'],['canyon','village','swamp']];

// Ruído determinístico (sem Math.random) para o mundo ser sempre o mesmo e caber num save.
const hash=(x:number,y:number,s:number)=>{let h=Math.imul(x,374761393)^Math.imul(y,668265263)^Math.imul(s,1442695041);h=Math.imul(h^(h>>>13),1274126177);return((h^(h>>>16))>>>0)/4294967296;};
const smooth=(x:number,y:number,s:number)=>{const xi=Math.floor(x),yi=Math.floor(y),u=(x-xi)*(x-xi)*(3-2*(x-xi)),v=(y-yi)*(y-yi)*(3-2*(y-yi));const a=hash(xi,yi,s),b=hash(xi+1,yi,s),c=hash(xi,yi+1,s),d=hash(xi+1,yi+1,s);return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v;};
const clamp=(n:number,lo:number,hi:number)=>Math.max(lo,Math.min(hi,n));

export function biomeAt(x:number,y:number):Biome{
  const jx=(smooth(x/5,y/5,1)-.5)*7,jy=(smooth(x/5,y/5,2)-.5)*7;
  return LAYOUT[clamp(Math.floor((y+jy)/CELL_H),0,2)][clamp(Math.floor((x+jx)/CELL_W),0,2)];
}

export type NpcInfo={name:string;tint:string;talk:(s:{hasKey:boolean;fragments:number})=>string};
export const NPCS:Record<string,NpcInfo>={
  iris:{name:'Iris, guardiã do vale',tint:NONE,talk:({hasKey,fragments})=>!hasKey?'Gregório, o brilho da lua sumiu do vale. A Chave Lunar está num baú aqui no Bosque de Elara, a leste da estrada. Use K para dar um salto longo sobre a água. Depois, recupere os três Fragmentos Lunares espalhados pelo mundo: no Deserto do Sol, nas Montanhas Geladas e no Pântano Sombrio.':fragments<3?`Você tem a chave! Agora faltam ${3-fragments} Fragmento(s) Lunar(es). Golems de pedra guardam cada um deles. Use a esquiva (Shift) quando eles avançarem.`:'Os três fragmentos brilham com você. Siga a estrada para o norte até as Ruínas da Lua e desça pelos três andares do Templo.'},
  ferreiro:{name:'Ferreiro da Vila',tint:'hue-rotate(-150deg) saturate(.7)',talk:()=>'Seu pai forjou essa espada, Gregório! Ao sul do mundo fica o Pântano a leste e o Desfiladeiro a oeste. Há baús escondidos em cada canto do vale.'},
  sabio:{name:'Sábio do Oásis',tint:'hue-rotate(150deg) saturate(.8)',talk:({fragments})=>fragments<3?'O Fragmento do Sol está nas ruínas a sudoeste do oásis. Um golem de areia não dorme nunca.':'O sol do deserto agradece, jovem.'},
  pescadora:{name:'Pescadora do Lago',tint:'hue-rotate(-120deg)',talk:()=>'Há um baú na ilha no meio do lago. Atravesse a ponte e pegue o Coração Lunar: sua vida vai aumentar. E se achar Conchas Lunares brilhando pelo vale, traga para mim!'},
  eremita:{name:'Eremita da Neve',tint:'hue-rotate(60deg) brightness(1.1)',talk:()=>'Brrr... o Fragmento do Gelo fica no topo das montanhas, a noroeste. Leve poções, o frio não perdoa.'},
  guarda:{name:'Guardião das Ruínas',tint:'hue-rotate(-40deg) saturate(.6)',talk:({hasKey,fragments})=>hasKey&&fragments===3?'A porta reconhece a Chave Lunar e os três fragmentos. Entre, herói.':'O Templo só se abre para quem traz a Chave Lunar e os três Fragmentos Lunares.'},
  lenhadora:{name:'Lenhadora do Outono',tint:'hue-rotate(95deg)',talk:()=>'Deixei o arco do meu pai num baú perto da estrada, a noroeste daqui. Fica com ele, Gregório: lá no templo vai fazer falta. E há outro baú com poções no fundo da floresta, a nordeste.'},
  bruxa:{name:'Bruxa do Pântano',tint:'hue-rotate(200deg) brightness(.85)',talk:({fragments})=>fragments<3?'Hihihi... o Fragmento da Névoa está a leste, além dos charcos. Cuidado com os morcegos.':'Hihihi... vá logo, a lua não espera.'},
};

type Poi={x:number;y:number;r:number};
const center=(n:number)=>n*32+16;
export function makeWorld(entity:(id:string,x:number,y:number,kind:Entity['kind'],tint?:string)=>Entity):GameMap{
  const W=WORLD_W,H=WORLD_H;
  const biome:Biome[][]=Array.from({length:H},(_,y)=>Array.from({length:W},(_,x)=>biomeAt(x,y)));
  const tiles:number[][]=Array.from({length:H},(_,y)=>Array.from({length:W},(_,x)=>x===0||y===0||x===W-1||y===H-1?4:0));
  const inside=(x:number,y:number)=>x>0&&y>0&&x<W-1&&y<H-1;
  const set=(x:number,y:number,t:number)=>{if(inside(x,y))tiles[y][x]=t;};
  const ellipse=(cx:number,cy:number,rx:number,ry:number,t:number)=>{for(let y=Math.floor(cy-ry);y<=cy+ry;y++)for(let x=Math.floor(cx-rx);x<=cx+rx;x++)if(((x-cx)/rx)**2+((y-cy)/ry)**2<=1)set(x,y,t);};
  // 1. água: lago, rio, poças do pântano, oásis, lago congelado e poço da vila
  ellipse(80,36,10.5,7.5,2);
  for(let y=14;y<=33;y++){const cx=58+Math.round(Math.sin(y/3.2)*1.4);for(let x=cx-1;x<=cx+1;x++)set(x,y,2);}
  for(let x=58;x<=70;x++)for(let y=33;y<=35;y++)set(x,y,2);
  for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++)if(biome[y][x]==='swamp'&&smooth(x/4,y/4,3)>.63)set(x,y,2);
  ellipse(12,38,3.2,2.2,2);ellipse(24,15,4,2.6,2);ellipse(53,63,1,1,2);
  // 2. paredões: falésias do desfiladeiro, rochedos das montanhas e muralhas das ruínas
  for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++){const b=biome[y][x];if(b==='canyon'&&smooth(x/3.5,y/3.5,4)>.6)set(x,y,4);if(b==='snow'&&smooth(x/3,y/3,5)>.75)set(x,y,4);if(b==='ruins'&&hash(x,y,6)>.975)set(x,y,4);}
  for(let x=39;x<=57;x++){set(x,2,4);if(x<46||x>50)set(x,13,4);}
  for(let y=2;y<=13;y++){set(39,y,4);set(57,y,4);}
  for(let y=3;y<=12;y++)for(let x=40;x<=56;x++)set(x,y,0);
  // 3. estradas (2 tiles de largura); sobre a água viram ponte (5)
  const road=(pts:number[][])=>{for(let i=1;i<pts.length;i++){let[x,y]=pts[i-1];const[tx,ty]=pts[i];while(true){for(const[dx,dy]of[[0,0],[1,0],[0,1],[1,1]]){const px=x+dx,py=y+dy;if(inside(px,py))tiles[py][px]=tiles[py][px]===2?5:1;}if(x===tx&&y===ty)break;x+=Math.sign(tx-x);if(x===tx)y+=Math.sign(ty-y);}}};
  for(let y=56;y<=63;y++)for(let x=42;x<=54;x++)if(tiles[y][x]!==2)set(x,y,1);
  road([[47,62],[47,13],[47,6]]);
  road([[5,36],[78,36]]);
  road([[6,60],[89,60]]);
  road([[16,36],[16,12],[11,12],[11,8]]);
  road([[62,36],[62,22],[83,22],[83,9]]);
  road([[10,36],[10,43]]);
  road([[86,60],[86,65]]);
  road([[7,60],[7,64]]);
  road([[24,60],[24,52]]);
  ellipse(80,36,2.4,2.2,0);
  for(let y=3;y<=12;y++)for(let x=40;x<=56;x++)if(tiles[y][x]===0&&(x===47||x===48))tiles[y][x]=1;
  // 4. pontos de interesse
  const props:Prop[]=[];const pois:Poi[]=[];
  const add=(kind:Prop['kind'],x:number,y:number,id:string,extra:Partial<Prop>={})=>{props.push({kind,x:center(x),y:center(y),id,solid:kind!=='exit'&&kind!=='lever'&&kind!=='relic',...extra});pois.push({x,y,r:kind==='door'?4:kind==='npc'?2:3});};
  add('npc',44,40,'iris');add('npc',45,58,'ferreiro');add('npc',18,40,'sabio');add('npc',68,40,'pescadora');add('npc',20,14,'eremita');add('npc',50,14,'guarda');add('npc',78,25,'lenhadora');add('npc',72,58,'bruxa');
  add('chest',54,30,'key-chest',{item:'key'});add('chest',38,30,'coin-chest',{item:'coins'});
  add('chest',10,45,'frag-desert',{item:'fragment',guard:'golem-desert'});
  add('chest',11,6,'frag-snow',{item:'fragment',guard:'golem-snow'});
  add('chest',88,66,'frag-swamp',{item:'fragment',guard:'golem-swamp'});
  add('chest',80,36,'heart-chest',{item:'heart'});
  add('chest',84,7,'potion-chest',{item:'potion'});
  add('chest',72,19,'bow-chest',{item:'bow'});
  add('chest',7,66,'crystal-chest',{item:'crystals'});
  add('chest',24,50,'canyon-chest',{item:'potion'});
  add('door',47,4,'temple-door',{solid:true});
  pois.push({x:48,y:60,r:5},{x:46,y:42,r:4});
  for(const p of pois)for(let y=p.y-1;y<=p.y+1;y++)for(let x=p.x-1;x<=p.x+1;x++)if(inside(x,y)&&(tiles[y][x]===4||tiles[y][x]===2)&&!(p.x===80&&p.y===36))tiles[y][x]=biome[y][x]==='ruins'?0:1;
  // 4b. Conchas Lunares: a da ilha do lago e uma em chão livre de cada região (mais duas extras), longe das estradas
  const shellSpots:number[][]=[[81,37]];
  const roadless=(x:number,y:number)=>[-2,-1,0,1,2].every(dy=>[-2,-1,0,1,2].every(dx=>{const t=tiles[y+dy]?.[x+dx];return t!==1&&t!==5;}));
  const free=(x:number,y:number)=>tiles[y]?.[x]===0&&!(x>=38&&x<=58&&y<=14)&&roadless(x,y)&&pois.every(p=>Math.abs(p.x-x)>4||Math.abs(p.y-y)>4)&&shellSpots.every(([sx,sy])=>Math.abs(sx-x)+Math.abs(sy-y)>10);
  ([...LAYOUT.flat(),'canyon','snow'] as Biome[]).forEach((b,i)=>{const ry=LAYOUT.findIndex(r=>r.includes(b)),rx=LAYOUT[ry].indexOf(b);for(let k=0;k<600;k++){const x=rx*CELL_W+3+Math.floor(hash(k,i,11)*(CELL_W-6)),y=ry*CELL_H+3+Math.floor(hash(k,i,12)*(CELL_H-6));if(biome[y][x]===b&&free(x,y)){shellSpots.push([x,y]);break;}}});
  shellSpots.forEach(([x,y],i)=>{props.push({kind:'shell',x:center(x),y:center(y),id:`shell-${i}`,solid:false});pois.push({x,y,r:1});});
  // 5. borda de árvores e vegetação por região
  for(let x=1;x<W-1;x++){if(Math.abs(x-48)>2){props.push({kind:'tree',x:center(x),y:center(1),id:`border-n-${x}`,solid:true});}props.push({kind:'tree',x:center(x),y:center(H-2),id:`border-s-${x}`,solid:true});}
  for(let y=3;y<H-2;y+=2){props.push({kind:'tree',x:center(1),y:center(y),id:`border-w-${y}`,solid:true});props.push({kind:'tree',x:center(W-2),y:center(y),id:`border-e-${y}`,solid:true});}
  const density:Record<Biome,[number,number,number]>={village:[.02,.006,.02],forest:[.13,.008,.025],lake:[.04,.01,.025],desert:[0,.035,.012],snow:[.05,.04,0],autumn:[.14,.01,.02],swamp:[.06,.01,.04],ruins:[0,.03,.01],canyon:[0,.045,.006]};
  const nearRoad=(x:number,y:number)=>{for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const t=tiles[y+dy]?.[x+dx];if(t===1||t===5)return true;}return false;};
  for(let y=3;y<H-3;y++)for(let x=3;x<W-3;x++){
    if(tiles[y][x]!==0||nearRoad(x,y)||pois.some(p=>Math.abs(p.x-x)<=p.r&&Math.abs(p.y-y)<=p.r))continue;
    if(x>=40&&x<=56&&y>=3&&y<=12)continue;
    const[tree,rock,bush]=density[biome[y][x]],r=hash(x,y,7);
    if(r<tree)props.push({kind:'tree',x:center(x),y:center(y),id:`tree-${x}-${y}`,solid:true});
    else if(r<tree+rock)props.push({kind:'rock',x:center(x),y:center(y),id:`rock-${x}-${y}`,solid:true});
    else if(r<tree+rock+bush)props.push({kind:'bush',x:center(x),y:center(y),id:`bush-${x}-${y}`,solid:true});
  }
  for(const[x,y]of[[47,20],[48,20],[47,44],[48,44],[24,36],[25,36],[62,28],[63,28]])props.push({kind:'bush',x:center(x),y:center(y),id:`gate-bush-${x}-${y}`,solid:true});
  // 6. inimigos: slimes e morcegos tingidos pela região, golems guardando os fragmentos
  const enemies:Entity[]=[];
  const counts:Record<Biome,[number,number,number]>={village:[0,0,0],forest:[5,1,0],lake:[3,1,1],desert:[4,0,2],snow:[3,2,1],autumn:[4,1,1],swamp:[3,3,2],ruins:[2,2,2],canyon:[2,3,2]};
  LAYOUT.forEach((row,ry)=>row.forEach((b,rx)=>{const[slimes,bats,spitters]=counts[b];let placed=0;for(let i=0;placed<slimes+bats+spitters&&i<400;i++){const x=rx*CELL_W+3+Math.floor(hash(i,ry*3+rx,8)*(CELL_W-6)),y=ry*CELL_H+3+Math.floor(hash(i,ry*3+rx,9)*(CELL_H-6));if(tiles[y][x]!==0&&tiles[y][x]!==1&&tiles[y][x]!==3)continue;if(Math.abs(x-46)<10&&Math.abs(y-42)<8)continue;if(biome[y][x]!==b||props.some(p=>p.solid&&Math.abs(p.x-center(x))<40&&Math.abs(p.y-center(y))<40))continue;const kind=placed<slimes?'slime':placed<slimes+bats?'bat':'spitter';enemies.push(entity(`${b}-${kind}-${placed}`,x,y,kind,kind==='spitter'?SPITTER_TINT:BIOMES[b].enemyFilter));placed++;}}));
  enemies.push(entity('golem-desert',12,44,'golem',BIOMES.desert.wallFilter),entity('golem-snow',13,7,'golem',BIOMES.snow.wallFilter),entity('golem-swamp',86,66,'golem',BIOMES.swamp.wallFilter));
  return{width:W,height:H,tiles,props,enemies,biome};
}
