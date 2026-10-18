// Capítulo 2 de A Lenda de Gregório: as Terras do Norte (segundo mundo aberto) e a Cidadela da Aurora.
// Mesma arte do atlas original; as regiões novas só mudam o filtro de cor.
import type {Entity,GameMap,Prop} from './adventure';
import {hash,smooth,type Biome} from './world';

type MakeEntity=(id:string,x:number,y:number,kind:Entity['kind'],tint?:string)=>Entity;
export const NORTH_W=64,NORTH_H=48;
export const FIRE_SPITTER_TINT='hue-rotate(-60deg) saturate(2.2) brightness(1.05)';
export const KNIGHT_TINT='grayscale(.85) brightness(1.35) contrast(1.1)';
export const WISP_TINT='hue-rotate(160deg) saturate(1.5) brightness(1.7)';
export const COLOSSUS_TINT='sepia(.7) saturate(2.6) hue-rotate(-28deg) brightness(.92)';
// Ponto de chegada vindo do Portão do Norte e posição do portão no primeiro mundo.
export const NORTH_ARRIVAL={x:16,y:43.5},NORTH_GATE={x:53,y:3};
const center=(n:number)=>n*32+16;

// Quatro regiões: Picos do Céu (noroeste), Terras de Cinza (nordeste), Bosque de Cristal (sudoeste) e Planície das Estrelas (sudeste).
function regionAt(x:number,y:number):Biome{const jy=(smooth(x/5,y/5,21)-.5)*4;return y+(x<32?0:jy)<24?(x<32?'sky':'ash'):(x<32?'crystal':'starfall');}

export function makeNorth(entity:MakeEntity):GameMap{
  const W=NORTH_W,H=NORTH_H;
  const biome:Biome[][]=Array.from({length:H},(_,y)=>Array.from({length:W},(_,x)=>regionAt(x,y)));
  const tiles:number[][]=Array.from({length:H},(_,y)=>Array.from({length:W},(_,x)=>x===0||y===0||x===W-1||y===H-1?4:0));
  const inside=(x:number,y:number)=>x>0&&y>0&&x<W-1&&y<H-1;
  const set=(x:number,y:number,t:number)=>{if(inside(x,y))tiles[y][x]=t;};
  // 1. lagos de cristal, rochedos do céu, poças de lava e o anel de lava em volta da Cidadela
  for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++){const b=biome[y][x];
    if(b==='crystal'&&smooth(x/4,y/4,22)>.74)set(x,y,2);
    if(b==='sky'&&smooth(x/3,y/3,23)>.74)set(x,y,4);
    if(b==='starfall'&&smooth(x/4,y/4,24)>.78)set(x,y,2);
    if(b==='ash'&&smooth(x/3.5,y/3.5,25)>.72)set(x,y,7);}
  for(let y=1;y<H-1;y++)for(let x=33;x<W-1;x++){const d=Math.hypot((x-48)/1.1,y-10);if(d<=9)set(x,y,d<3.2?0:7);}
  // 2. o abismo entre o Bosque de Cristal e os Picos do Céu, e o paredão que fecha os Picos a leste
  for(let y=22;y<=25;y++)for(let x=1;x<=30;x++)set(x,y,6);
  for(let y=1;y<=25;y++){set(31,y,4);set(32,y,4);}
  // 3. estradas (2 tiles); sobre a água viram ponte; terminam na beira do abismo e do anel de lava
  const road=(pts:number[][])=>{for(let i=1;i<pts.length;i++){let[x,y]=pts[i-1];const[tx,ty]=pts[i];while(true){for(const[dx,dy]of[[0,0],[1,0],[0,1],[1,1]]){const px=x+dx,py=y+dy;if(inside(px,py)&&tiles[py][px]!==6)tiles[py][px]=tiles[py][px]===2?5:1;}if(x===tx&&y===ty)break;x+=Math.sign(tx-x);if(x===tx)y+=Math.sign(ty-y);}}};
  road([[15,45],[15,26]]);road([[15,34],[52,34]]);road([[52,34],[52,24]]);road([[52,24],[48,24],[48,20]]);road([[15,20],[8,20],[8,6],[20,6]]);road([[52,40],[58,40]]);
  // 4. pontos de interesse
  const props:Prop[]=[];const pois:{x:number;y:number;r:number}[]=[];
  const add=(kind:Prop['kind'],x:number,y:number,id:string,extra:Partial<Prop>={})=>{props.push({kind,x:center(x),y:center(y),id,solid:kind!=='relic',...extra});pois.push({x:Math.round(x),y:Math.round(y),r:kind==='npc'?2:3});};
  add('stairs',15,46,'north-exit',{to:'world',ax:NORTH_GATE.x,ay:NORTH_GATE.y+1.6,label:'Voltar ao Vale de Elara'});
  add('stairs',48,9,'citadel-door',{to:'citadel1',ax:15,ay:21,label:'Entrar na Cidadela da Aurora'});
  add('stairs',8,20,'grotto-door',{to:'grotto',ax:4,ay:20,label:'Descer à Gruta da Maré'});
  add('npc',18,42,'guardia');add('npc',44,37,'astronomo');
  add('chest',6,31,'boots-chest',{item:'boots',guard:'k-boots'});
  add('chest',14,4,'amulet-chest',{item:'amulet',guard:'sentinel'});
  add('chest',58,44,'north-heart',{item:'heart'});
  add('chest',40,27,'north-crystals',{item:'crystals'});
  add('chest',25,41,'north-potion',{item:'potion'});
  add('chest',24,10,'sky-crystals',{item:'crystals'});
  for(const p of pois)for(let y=p.y-1;y<=p.y+1;y++)for(let x=p.x-1;x<=p.x+1;x++)if(inside(x,y)&&(tiles[y][x]===4||tiles[y][x]===2)&&!(x>=31&&x<=32&&y<=25))tiles[y][x]=1;
  // 5. borda de árvores e vegetação por região
  for(let x=1;x<W-1;x++){props.push({kind:'tree',x:center(x),y:center(1),id:`nb-n-${x}`,solid:true});if(Math.abs(x-15.5)>2)props.push({kind:'tree',x:center(x),y:center(H-2),id:`nb-s-${x}`,solid:true});}
  for(let y=3;y<H-2;y+=2){props.push({kind:'tree',x:center(1),y:center(y),id:`nb-w-${y}`,solid:true});props.push({kind:'tree',x:center(W-2),y:center(y),id:`nb-e-${y}`,solid:true});}
  const density:Partial<Record<Biome,[number,number,number]>>={crystal:[.12,.01,.03],sky:[.03,.05,.01],starfall:[.04,.02,.04],ash:[.01,.05,0]};
  const nearRoad=(x:number,y:number)=>{for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const t=tiles[y+dy]?.[x+dx];if(t===1||t===5)return true;}return false;};
  for(let y=3;y<H-3;y++)for(let x=3;x<W-3;x++){
    if(tiles[y][x]!==0||nearRoad(x,y)||pois.some(p=>Math.abs(p.x-x)<=p.r&&Math.abs(p.y-y)<=p.r))continue;
    if(Math.hypot((x-48)/1.1,y-10)<=10)continue;
    const[tree,rock,bush]=density[biome[y][x]]??[0,0,0],r=hash(x,y,27);
    if(r<tree)props.push({kind:'tree',x:center(x),y:center(y),id:`ntree-${x}-${y}`,solid:true});
    else if(r<tree+rock)props.push({kind:'rock',x:center(x),y:center(y),id:`nrock-${x}-${y}`,solid:true});
    else if(r<tree+rock+bush)props.push({kind:'bush',x:center(x),y:center(y),id:`nbush-${x}-${y}`,solid:true});
  }
  // 6. inimigos por região (longe da chegada); guardiões fixos dos baús
  const enemies:Entity[]=[];
  const plan:[Biome,Entity['kind'],number,string?][]=[['crystal','slime',3],['crystal','knight',2,KNIGHT_TINT],['sky','bat',3],['sky','wisp',2,WISP_TINT],['starfall','wisp',2,WISP_TINT],['starfall','spitter',3,'hue-rotate(250deg) saturate(1.7) brightness(.9)'],['starfall','slime',2,'hue-rotate(230deg)'],['ash','spitter',3,FIRE_SPITTER_TINT],['ash','knight',2,KNIGHT_TINT],['ash','bat',2,'hue-rotate(-40deg) saturate(1.8)']];
  plan.forEach(([b,kind,count,tint],pi)=>{let placed=0;for(let i=0;placed<count&&i<600;i++){const x=2+Math.floor(hash(i,pi,28)*(W-4)),y=2+Math.floor(hash(i,pi,29)*(H-4));if(biome[y][x]!==b||(tiles[y][x]!==0&&tiles[y][x]!==1))continue;if(Math.abs(x-16)<9&&y>36)continue;if(props.some(p=>p.solid&&Math.abs(p.x-center(x))<40&&Math.abs(p.y-center(y))<40))continue;enemies.push(entity(`n-${b}-${kind}-${placed}`,x,y,kind,tint));placed++;}});
  enemies.push(entity('k-boots',8,31,'knight',KNIGHT_TINT),entity('sentinel',16,5,'golem','hue-rotate(170deg) saturate(.6) brightness(1.3)'));
  return{width:W,height:H,tiles,props,enemies,biome};
}

// Cidadela da Aurora: salão com dois braseiros e um totem que abrem a arena do Colosso de Cinzas.
export function makeCitadel(entity:MakeEntity,blankFloor:(w:number,h:number)=>number[][]):GameMap{
  const W=30,H=26,tiles=blankFloor(W,H),props:Prop[]=[];
  const fill=(x0:number,y0:number,x1:number,y1:number,t:number)=>{for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)tiles[y][x]=t;};
  for(let x=1;x<W-1;x++)if(x!==14&&x!==15)tiles[10][x]=4;
  fill(9,14,20,16,6);fill(23,11,24,24,2);fill(1,17,5,18,7);fill(4,3,6,5,7);fill(23,3,25,5,7);
  props.push({kind:'stairs',id:'citadel-exit',x:center(14.5),y:center(24),solid:true,to:'north',ax:48,ay:12.5,label:'Sair da Cidadela'});
  props.push({kind:'torch',id:'cit-brazier-a',x:center(3),y:center(12),solid:true},{kind:'torch',id:'cit-brazier-b',x:center(27),y:center(12),solid:true},{kind:'totem',id:'cit-totem',x:center(14.5),y:center(12.5),solid:true});
  props.push({kind:'barrier',id:'cit-barrier',x:center(14),y:center(10),solid:true,by:['cit-brazier-a','cit-brazier-b','cit-totem']},{kind:'barrier',id:'cit-barrier-b',x:center(15),y:center(10),solid:true,by:['cit-brazier-a','cit-brazier-b','cit-totem']});
  props.push({kind:'chest',id:'cit-heart',x:center(2),y:center(23),solid:true,item:'heart'},{kind:'chest',id:'cit-potion',x:center(27),y:center(23),solid:true,item:'potion'});
  props.push({kind:'relic',id:'aurora-crown',x:center(14.5),y:center(2),solid:false});
  props.push({kind:'rock',id:'cit-pillar-a',x:center(9),y:center(6),solid:true},{kind:'rock',id:'cit-pillar-b',x:center(20),y:center(6),solid:true});
  return{width:W,height:H,tiles,props,enemies:[entity('cit-knight-a',6,20,'knight',KNIGHT_TINT),entity('cit-knight-b',20,20,'knight',KNIGHT_TINT),entity('cit-wisp-a',8,12,'wisp',WISP_TINT),entity('cit-wisp-b',21,12,'wisp',WISP_TINT),entity('cit-spitter',4,21,'spitter',FIRE_SPITTER_TINT),entity('colossus',14.5,4.5,'colossus',COLOSSUS_TINT)]};
}
