// Terras do Sul: terceiro mundo aberto de A Lenda de Gregório.
// Quatro cenários, cada um com a entrada de uma masmorra independente: entra-se, vence-se o chefe e sai-se
// pela mesma porta para procurar a próxima pelo mapa. Mesma arte do atlas; cada região só muda o filtro de cor.
import type {Entity,GameMap,Prop} from './adventure';
import {hash,smooth,type Biome} from './world';
import {KNIGHT_TINT} from './north';

type MakeEntity=(id:string,x:number,y:number,kind:Entity['kind'],tint?:string,bossAsset?:number)=>Entity;
export const SOUTH_W=80,SOUTH_H=60;
// Chegadas: vindo da Passagem Inundada (Terras do Norte) e da Estrada do Sul (Vale de Elara).
export const SOUTH_FROM_NORTH={x:40,y:4.6},SOUTH_FROM_WORLD={x:40,y:54.4};
// Entradas das masmorras (o herói volta para a frente de cada uma ao sair).
export const SOUTH_DOORS={eclipse:{x:12,y:8},bastion:{x:67,y:8},sanctum:{x:12,y:47},aerie:{x:67,y:47},fortress:{x:27,y:37}};
export const SOUTH_CLIMATE:Partial<Record<Biome,string>>={darkwood:'dark',rainforest:'rain',plains:'grass',stormdesert:'desert'};
export const SOUTH_TRACK:Partial<Record<Biome,string>>={darkwood:'3. Terceiro cenário — Floresta das Trevas.mp3',rainforest:'4. Quarto cenário — Floresta da Chuva.mp3',plains:'5. Quinto cenário — Campos Abertos.mp3',stormdesert:'6. Sexto cenário — Deserto das Tempestades.mp3'};
const center=(n:number)=>n*32+16;

// Floresta das Trevas (noroeste), Floresta da Chuva (nordeste), Campos Abertos (sudoeste), Deserto das Tempestades (sudeste).
function regionAt(x:number,y:number):Biome{const jx=(smooth(x/6,y/6,41)-.5)*6,jy=(smooth(x/6,y/6,42)-.5)*6,east=x+jx>=40,south=y+jy>=30;return south?(east?'stormdesert':'plains'):(east?'rainforest':'darkwood');}

export function makeSouth(entity:MakeEntity):GameMap{
  const W=SOUTH_W,H=SOUTH_H;
  const biome:Biome[][]=Array.from({length:H},(_,y)=>Array.from({length:W},(_,x)=>regionAt(x,y)));
  const tiles:number[][]=Array.from({length:H},(_,y)=>Array.from({length:W},(_,x)=>x===0||y===0||x===W-1||y===H-1?4:0));
  const inside=(x:number,y:number)=>x>0&&y>0&&x<W-1&&y<H-1;
  const set=(x:number,y:number,t:number)=>{if(inside(x,y))tiles[y][x]=t;};
  // 1. rios e poças na Floresta da Chuva, lagoas nos campos, troncos caídos nas Trevas e rochedos no deserto
  for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++){const b=biome[y][x];
    if(b==='rainforest'&&smooth(x/4,y/4,43)>.68)set(x,y,2);
    if(b==='plains'&&smooth(x/5,y/5,44)>.79)set(x,y,2);
    if(b==='stormdesert'&&smooth(x/3,y/3,45)>.73)set(x,y,4);
    if(b==='darkwood'&&smooth(x/3,y/3,46)>.77)set(x,y,4);}
  // 2. estradas (2 tiles); sobre a água viram ponte
  const road=(pts:number[][])=>{for(let i=1;i<pts.length;i++){let[x,y]=pts[i-1];const[tx,ty]=pts[i];while(true){for(const[dx,dy]of[[0,0],[1,0],[0,1],[1,1]]){const px=x+dx,py=y+dy;if(inside(px,py))tiles[py][px]=tiles[py][px]===2?5:1;}if(x===tx&&y===ty)break;x+=Math.sign(tx-x);if(x===tx)y+=Math.sign(ty-y);}}};
  road([[40,3],[40,56]]);road([[6,29],[74,29]]);
  road([[40,10],[12,10]]);road([[40,10],[67,10]]);road([[40,49],[12,49]]);road([[40,49],[67,49]]);road([[40,39],[27,39]]);
  // 3. pontos de interesse
  const props:Prop[]=[];const pois:{x:number;y:number;r:number}[]=[];
  const add=(kind:Prop['kind'],x:number,y:number,id:string,extra:Partial<Prop>={})=>{props.push({kind,x:center(x),y:center(y),id,solid:kind!=='relic',...extra});pois.push({x:Math.round(x),y:Math.round(y),r:kind==='npc'?2:3});};
  add('stairs',40,2.2,'south-north',{to:'north',ax:58,ay:41.6,label:'Voltar às Terras do Norte'});
  add('stairs',40,57,'south-world',{to:'world',ax:47,ay:66.4,label:'Seguir a Estrada do Sul até o Vale de Elara'});
  const D=SOUTH_DOORS;
  add('stairs',D.eclipse.x,D.eclipse.y,'south-eclipse',{to:'eclipse',ax:3,ay:20,minChapter:3,needs:'tide',label:'Entrar no Caminho do Eclipse'});
  add('stairs',D.bastion.x,D.bastion.y,'south-bastion',{to:'bastion',ax:4,ay:20,minChapter:4,extra:['wand-lightning'],label:'Entrar no Bastião das Pedras'});
  add('stairs',D.sanctum.x,D.sanctum.y,'south-sanctum',{to:'sanctum',ax:4,ay:19,minChapter:5,extra:['gloves'],label:'Entrar no Santuário da Repulsão'});
  add('stairs',D.aerie.x,D.aerie.y,'south-aerie',{to:'aerie',ax:4,ay:19,minChapter:6,extra:['wand-repulse'],label:'Descer ao Abismo dos Alvos Velozes'});
  add('stairs',D.fortress.x,D.fortress.y,'south-fortress',{to:'fortress',ax:7,ay:20,needs:'gloves',label:'Abrir o portão da Fortaleza Esquecida'});
  add('npc',43,6,'viajante');
  add('chest',22,19,'south-potion',{item:'potion'});
  add('chest',58,20,'south-crystals',{item:'crystals'});
  add('chest',20,41,'south-plains-crystals',{item:'crystals'});
  add('chest',58,45,'south-heart',{item:'heart',guard:'south-worm'});add('rock',56,45,'south-worm-den',{solid:false});
  for(const p of pois)for(let y=p.y-1;y<=p.y+1;y++)for(let x=p.x-1;x<=p.x+1;x++)if(inside(x,y)&&(tiles[y][x]===4||tiles[y][x]===2))tiles[y][x]=1;
  // 4. borda de árvores e vegetação por região
  for(let x=1;x<W-1;x++){if(Math.abs(x-40.5)>2)props.push({kind:'tree',x:center(x),y:center(1),id:`sb-n-${x}`,solid:true});if(Math.abs(x-40.5)>2)props.push({kind:'tree',x:center(x),y:center(H-2),id:`sb-s-${x}`,solid:true});}
  for(let y=3;y<H-2;y+=2){props.push({kind:'tree',x:center(1),y:center(y),id:`sb-w-${y}`,solid:true});props.push({kind:'tree',x:center(W-2),y:center(y),id:`sb-e-${y}`,solid:true});}
  const density:Partial<Record<Biome,[number,number,number]>>={darkwood:[.2,.01,.03],rainforest:[.16,.01,.07],plains:[.02,.012,.03],stormdesert:[0,.045,.006]};
  const nearRoad=(x:number,y:number)=>{for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const t=tiles[y+dy]?.[x+dx];if(t===1||t===5)return true;}return false;};
  for(let y=3;y<H-3;y++)for(let x=3;x<W-3;x++){
    if(tiles[y][x]!==0||nearRoad(x,y)||pois.some(p=>Math.abs(p.x-x)<=p.r&&Math.abs(p.y-y)<=p.r))continue;
    const[tree,rock,bush]=density[biome[y][x]]??[0,0,0],r=hash(x,y,47);
    if(r<tree)props.push({kind:'tree',x:center(x),y:center(y),id:`stree-${x}-${y}`,solid:true});
    else if(r<tree+rock)props.push({kind:'rock',x:center(x),y:center(y),id:`srock-${x}-${y}`,solid:true});
    else if(r<tree+rock+bush)props.push({kind:'bush',x:center(x),y:center(y),id:`sbush-${x}-${y}`,solid:true});
  }
  // 5. inimigos por região, longe das chegadas; um verme de areia guarda o coração do deserto
  const enemies:Entity[]=[];
  const plan:[Biome,Entity['kind'],number,string?][]=[['darkwood','shade',3,'#7a8f6a'],['darkwood','bat',3,'hue-rotate(200deg) brightness(.8)'],['rainforest','slime',4,'hue-rotate(60deg) saturate(1.3)'],['rainforest','spitter',2,'hue-rotate(80deg) saturate(1.4)'],['rainforest','salamander',1,'#5fae6a'],['plains','frostwolf',2,'#d8c08a'],['plains','slime',3],['plains','knight',1,KNIGHT_TINT],['stormdesert','sandworm',2,'#d9a55f'],['stormdesert','spitter',3,'hue-rotate(-50deg) saturate(1.5)'],['stormdesert','bat',2,'hue-rotate(-40deg) saturate(1.4)']];
  plan.forEach(([b,kind,count,tint],pi)=>{let placed=0;for(let i=0;placed<count&&i<800;i++){const x=2+Math.floor(hash(i,pi,48)*(W-4)),y=2+Math.floor(hash(i,pi,49)*(H-4));if(biome[y][x]!==b||(tiles[y][x]!==0&&tiles[y][x]!==1))continue;if(Math.abs(x-40)<7&&(y<9||y>50))continue;if(props.some(p=>p.solid&&Math.abs(p.x-center(x))<40&&Math.abs(p.y-center(y))<40))continue;enemies.push(entity(`s-${b}-${kind}-${placed}`,x,y,kind,tint));placed++;}});
  enemies.push(entity('south-worm',56,45,'sandworm','#c98f45'));
  const den=props.findIndex(p=>p.id==='south-worm-den');if(den>=0)props.splice(den,1);
  return{width:W,height:H,tiles,props,enemies,biome};
}
