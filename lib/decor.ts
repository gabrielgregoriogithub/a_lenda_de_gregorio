// Detalhes de cenário por bioma: pequenos objetos em pixel art desenhados uma vez no cache do chão.
// Não têm colisão (não bloqueiam caminhos) e são determinísticos (o mesmo mundo em todo save).
import {hash,type Biome} from './world';

type Px=(x:number,y:number,w:number,h:number,c:string)=>void;
type Motif=(p:Px,v:number)=>void;
const BIOME_ART:Partial<Record<Biome,number>>={crystal:0,mangrove:1,stormdesert:2,ash:3};
let biomeArt:HTMLImageElement|undefined;
if(typeof Image!=='undefined'){biomeArt=new Image();biomeArt.decoding='async';biomeArt.src=`${import.meta.env?.BASE_URL??'/'}art/biome-props.png?v=biomes-20261023`;}
// cada motivo desenha numa grade de 2 px, dentro de um tile de 32 px
const M:Record<string,Motif>={
  mushroom:(p,v)=>{const cap=v<.5?'#c8423a':'#b06a2a';p(6,10,8,2,cap);p(4,12,12,3,cap);p(7,11,2,2,'#f3e6cf');p(12,13,2,1,'#f3e6cf');p(8,15,4,5,'#efe3c7');p(8,19,4,1,'#b8ab8c');},
  stones:(p)=>{p(4,14,6,4,'#8d8f86');p(5,13,4,1,'#b5b7ad');p(12,16,5,3,'#7c7e76');p(13,15,3,1,'#a9aba1');},
  clover:(p)=>{p(8,12,3,3,'#4f9a45');p(11,12,3,3,'#5aab4e');p(9.5,15,3,3,'#468a3d');p(10,18,1,3,'#3a6e33');},
  leaves:(p,v)=>{const a=v<.5?'#d9752e':'#c4442c',b='#e8a23a';p(3,14,4,2,a);p(9,12,3,2,b);p(13,16,4,2,a);p(6,18,3,2,'#a8562a');p(15,11,3,2,b);},
  acorn:(p)=>{p(8,12,6,3,'#6e4a2a');p(9,15,4,4,'#b07a3c');p(10,18,2,1,'#8a5a2c');},
  drift:(p)=>{p(2,16,16,3,'#f4f8ff');p(4,14,10,2,'#ffffff');p(3,19,14,1,'#c9d6e6');},
  icecrystal:(p)=>{p(9,8,2,10,'#bfefff');p(6,12,8,2,'#bfefff');p(7,10,1,1,'#ffffff');p(12,15,1,1,'#ffffff');p(9,8,1,3,'#ffffff');},
  pinelet:(p)=>{p(9,8,2,2,'#2f5e44');p(7,10,6,3,'#3a6e50');p(5,13,10,3,'#2f5e44');p(9,16,2,3,'#5a3c26');p(6,11,2,1,'#e9f3ff');p(11,14,3,1,'#e9f3ff');},
  cactus:(p)=>{p(9,6,3,14,'#4f8f3a');p(5,10,3,2,'#4f8f3a');p(5,8,2,4,'#4f8f3a');p(12,9,3,2,'#4f8f3a');p(14,6,2,5,'#4f8f3a');p(10,7,1,12,'#6fb052');p(8,20,5,1,'#b89a5a');},
  skull:(p)=>{p(7,12,7,5,'#efe6cf');p(8,17,5,2,'#efe6cf');p(8,14,2,2,'#3a2f22');p(11,14,2,2,'#3a2f22');p(9,18,1,1,'#3a2f22');p(11,18,1,1,'#3a2f22');},
  ripple:(p)=>{p(2,12,10,1,'#d8b46e');p(6,15,12,1,'#c79f5a');p(3,18,9,1,'#d8b46e');},
  bones:(p)=>{p(4,14,10,2,'#e6dcc4');p(3,13,2,4,'#e6dcc4');p(13,13,2,4,'#e6dcc4');p(10,17,6,1,'#cdbf9f');},
  puddle:(p)=>{p(4,13,12,5,'#2f4a3a');p(6,12,8,1,'#2f4a3a');p(6,14,4,1,'#5f8a6a');},
  reeds:(p)=>{p(6,8,1,12,'#5e7a3a');p(9,6,1,14,'#6e8a42');p(12,9,1,11,'#5e7a3a');p(8,6,3,3,'#7a5a32');p(11,9,3,2,'#7a5a32');},
  toadstool:(p)=>{p(6,11,9,3,'#7a4ab0');p(8,10,5,1,'#9a6ad0');p(9,14,3,5,'#d8ccb4');p(7,12,1,1,'#e9dcff');p(12,12,1,1,'#e9dcff');},
  cracked:(p)=>{p(2,10,16,10,'#9a9284');p(3,11,14,8,'#aaa294');p(6,11,1,4,'#6e685c');p(6,15,5,1,'#6e685c');p(11,15,1,4,'#6e685c');},
  column:(p)=>{p(6,8,8,3,'#c9c0ad');p(7,11,6,8,'#b4ab98');p(8,11,1,8,'#d9d0bd');p(5,19,10,2,'#9a9284');p(12,7,2,2,'#c9c0ad');},
  pebbles:(p)=>{p(4,15,3,2,'#b45a3a');p(9,12,2,2,'#c96a44');p(13,16,3,2,'#9a4a30');p(7,18,2,1,'#c96a44');},
  lavacrack:(p,v)=>{const g=v<.5?'#ff7a2a':'#ffb347';p(3,12,6,1,g);p(8,13,1,4,g);p(8,16,7,1,g);p(14,14,1,3,g);p(4,12,2,1,'#ffe08a');},
  obsidian:(p)=>{p(7,10,5,8,'#2a2236');p(9,8,3,4,'#3a3050');p(10,9,1,6,'#6a5a90');},
  fern:(p)=>{for(let i=0;i<4;i++){p(9-i*2,8+i*3,6,1,'#3f8a3a');p(10,9+i*3,6,1,'#4fa046');}p(10,8,1,13,'#2f6a2c');},
  flowers:(p,v)=>{const a=v<.33?'#ff6a8a':v<.66?'#ffd25a':'#9a7aff';p(4,12,3,3,a);p(5,13,1,1,'#ffffff');p(12,15,3,3,a);p(13,16,1,1,'#ffffff');p(5,15,1,4,'#4f8a3a');p(13,18,1,3,'#4f8a3a');},
  wildflowers:(p,v)=>{const a=v<.5?'#ffffff':'#ffe066';for(const [x,y] of [[3,13],[8,10],[12,15],[15,11],[6,17]]){p(x,y,2,2,a);p(x+.5,y+2,1,3,'#5f9a44');}},
  tallgrass:(p)=>{for(const x of [4,6,8,10,12,14])p(x,10+(x%4),1,9-(x%4),'#7ab04a');p(5,9,1,2,'#9acb62');p(11,10,1,2,'#9acb62');},
  shell:(p,v)=>{const a=v<.5?'#f2c9b0':'#f5e2c8';p(7,13,7,4,a);p(8,12,5,1,a);for(const x of [8,10,12])p(x,13,1,4,'#c9967a');},
  starfish:(p)=>{const c='#ff8a5c';p(9,8,2,4,c);p(9,14,2,5,c);p(4,12,5,2,c);p(11,12,5,2,c);p(8,12,4,2,c);p(9.5,12.5,1,1,'#ffd2b0');},
  roots:(p)=>{p(3,14,14,2,'#5a3c26');p(5,11,2,5,'#6a4a2e');p(12,10,2,6,'#6a4a2e');p(8,16,2,3,'#4a301c');p(15,15,2,3,'#4a301c');},
  cloud:(p)=>{p(4,13,12,3,'#f2f6ff');p(6,11,6,2,'#ffffff');p(5,16,10,1,'#c9d6ea');},
  crystal:(p,v)=>{const a=v<.5?'#9ad8ff':'#c49aff';p(8,8,3,11,a);p(5,12,3,7,a);p(12,11,3,8,a);p(9,9,1,8,'#ffffff');p(6,13,1,4,'#e9f6ff');},
  starshard:(p)=>{p(9,9,2,2,'#fff3a0');p(8,10,4,1,'#fff3a0');p(9.5,8,1,4,'#fff3a0');p(13,15,1,1,'#ffffff');p(5,16,1,1,'#ffffff');},
  darkroot:(p)=>{p(3,15,14,2,'#2a2030');p(6,11,2,5,'#3a2a40');p(13,12,2,4,'#3a2a40');p(10,16,3,1,'#5a3a6a');},
  bloom:(p)=>{p(7,12,6,6,'#ff7aa8');p(9,14,2,2,'#ffe08a');p(9,18,1,3,'#4f8a3a');},
};
// motivos e densidade por bioma (fração dos tiles de chão)
const BY_BIOME:Partial<Record<Biome,{d:number;m:string[]}>>={
  village:{d:.05,m:['flowers','clover','stones']},
  forest:{d:.08,m:['mushroom','clover','stones','flowers']},
  autumn:{d:.11,m:['leaves','leaves','acorn','mushroom']},
  snow:{d:.08,m:['drift','icecrystal','pinelet']},
  desert:{d:.06,m:['cactus','ripple','skull','ripple']},
  stormdesert:{d:.07,m:['ripple','bones','skull']},
  swamp:{d:.09,m:['puddle','reeds','toadstool']},
  ruins:{d:.08,m:['cracked','column','stones']},
  canyon:{d:.07,m:['pebbles','stones','cactus']},
  ash:{d:.08,m:['lavacrack','obsidian','lavacrack']},
  lake:{d:.06,m:['reeds','stones','clover']},
  rainforest:{d:.11,m:['fern','bloom','fern','flowers']},
  plains:{d:.09,m:['wildflowers','tallgrass','wildflowers']},
  coast:{d:.07,m:['shell','starfish','shell']},
  mangrove:{d:.08,m:['roots','reeds','shell']},
  sky:{d:.06,m:['cloud','crystal']},
  crystal:{d:.08,m:['crystal','obsidian','lavacrack']},
  starfall:{d:.07,m:['starshard','crystal','stones']},
  darkwood:{d:.09,m:['darkroot','toadstool','mushroom']},
};
// motivos que se movem (vento, brilho, água): desenhados a cada quadro pelo sistema de ambiente, não no cache do chão
export const LIVE_MOTIFS=new Set(['mushroom','clover','leaves','icecrystal','pinelet','reeds','toadstool','lavacrack','fern','flowers','wildflowers','tallgrass','crystal','starshard','bloom']);
// motivos que brilham e pulsam
export const GLOW_MOTIFS:Record<string,string>={icecrystal:'#e9fbff',toadstool:'#c9a8ff',lavacrack:'#ffb347',crystal:'#d9f0ff',starshard:'#fff6b0'};
export function decorAt(biome:Biome,x:number,y:number){const def=BY_BIOME[biome];if(!def||hash(x,y,77)>def.d)return null;return {motif:def.m[Math.floor(hash(x,y,78)*def.m.length)],v:hash(x,y,79)};}
export const decorOffset=(x:number,y:number)=>[Math.floor(hash(x,y,80)*6)-3,Math.floor(hash(x,y,81)*6)-3] as const;
/** Desenha um motivo. `shear` inclina o topo (em px) e mantém a base presa ao chão, como uma planta ao vento. */
export function drawMotif(g:CanvasRenderingContext2D,motif:string,v:number,ox:number,oy:number,shear=0){
  const p:Px=(a,b,w,h,c)=>{g.fillStyle=c;g.fillRect(Math.round(ox+a*1.6+shear*Math.max(0,20-b)/14),Math.round(oy+b*1.6),Math.max(1,Math.round(w*1.6)),Math.max(1,Math.round(h*1.6)));};
  M[motif]?.(p,v);}
export function drawDecor(g:CanvasRenderingContext2D,biome:Biome,x:number,y:number,px:number,py:number,live:'all'|'static'='all'){const d=decorAt(biome,x,y);if(!d||(live==='static'&&LIVE_MOTIFS.has(d.motif)))return;
  const art=BIOME_ART[biome];if(art!==undefined&&biomeArt?.complete&&biomeArt.naturalWidth){g.save();g.globalAlpha=.94;g.imageSmoothingEnabled=false;const sw=biomeArt.naturalWidth/4;g.drawImage(biomeArt,art*sw,0,sw,biomeArt.naturalHeight,px,py-8,32,40);g.restore();return;}
  const [dx,dy]=decorOffset(x,y);g.save();g.globalAlpha=.95;drawMotif(g,d.motif,d.v,px+dx,py+dy);g.restore();}
export const DECOR_BIOMES=Object.keys(BY_BIOME) as Biome[];
