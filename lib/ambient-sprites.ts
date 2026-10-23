// Fauna ambiente em pixel art feita de retângulos (sem arquivos novos), no mesmo tamanho de pixel do jogo.
// Cada família (quadrúpede, ave, inseto, peixe...) é parametrizada; o bicho olha para a direita e é espelhado quando vira.
import type {Species} from './ambient-data';

type Ctx=CanvasRenderingContext2D;
export type Pose={moving:boolean;flying:boolean;state:string;ph:number;z:number;alpha:number};
type Quad={w:number;h:number;leg:number;col:string;dark:string;belly?:string;hw:number;hh:number;ear?:[number,number];earCol?:string;tail?:[number,number,string,boolean?];antler?:boolean;neck?:number;hop?:boolean;horn?:boolean;fluff?:string;spot?:string;eye?:string};
type Bird={w:number;h:number;col:string;wing:string;beak:string;bl:number;tail:number;leg?:number;legCol?:string;belly?:string;crest?:string;eye?:string};

// Fauna premium: assets desenhados substituem os blocos procedurais nos animais
// mais visíveis. O fallback continua existindo para testes Node e carregamento inicial.
const AMBIENT_ASSETS:Partial<Record<Species,{file:string;row?:number}>>={
  songbird:{file:'birds',row:0},chicken:{file:'birds',row:0},mountainbird:{file:'birds',row:0},
  owl:{file:'birds',row:1},crow:{file:'birds',row:1},vulture:{file:'birds',row:1},
  toucan:{file:'birds',row:2},macaw:{file:'birds',row:2},
  seagull:{file:'birds',row:3},duck:{file:'birds',row:3},heron:{file:'birds',row:3},
  rabbit:{file:'mammals',row:0},hare:{file:'mammals',row:0},whitehare:{file:'mammals',row:0},
  fox:{file:'mammals',row:1},arcticfox:{file:'mammals',row:1},deer:{file:'mammals',row:2},sheep:{file:'mammals',row:3},
  frog:{file:'small-fauna',row:0},turtle:{file:'small-fauna',row:1},fish:{file:'small-fauna',row:2},butterfly:{file:'small-fauna',row:3},
  squirrel:{file:'reptiles',row:0},monkey:{file:'reptiles',row:1},lizard:{file:'reptiles',row:2},firelizard:{file:'reptiles',row:2},scorpion:{file:'reptiles',row:3},
  bee:{file:'insects',row:0},dragonfly:{file:'insects',row:1},moth:{file:'insects',row:2},embermoth:{file:'insects',row:2},crystalmoth:{file:'insects',row:2},firefly:{file:'insects',row:3},
  beetle:{file:'cave-fauna',row:0},bat:{file:'cave-fauna',row:1},
  cow:{file:'cow'},horse:{file:'horse'},
};
const ambientImages:Partial<Record<string,HTMLImageElement>>={};
if(typeof Image!=='undefined')for(const file of ['birds','mammals','small-fauna','reptiles','insects','cave-fauna','cow','horse']){const im=new Image();im.decoding='async';im.src=`${import.meta.env?.BASE_URL??'/'}art/ambient/${file}.png?v=fauna-20261023`;ambientImages[file]=im;}
export function setAmbientImages(images:Record<string,HTMLImageElement>|undefined){if(images)Object.assign(ambientImages,images);}
function ambientAsset(sp:Species){
  if(typeof Image==='undefined')return undefined;
  const meta=AMBIENT_ASSETS[sp];if(!meta)return undefined;
  const key=meta.file;if(ambientImages[key])return ambientImages[key];
  const im=new Image();im.decoding='async';im.src=`${import.meta.env?.BASE_URL??'/'}art/ambient/${meta.file}.png?v=fauna-20261023`;ambientImages[key]=im;return im;
}
function drawAmbientAsset(c:Ctx,sp:Species,p:Pose){
  const meta=AMBIENT_ASSETS[sp],im=ambientAsset(sp);if(!meta||!im?.complete||!im.naturalWidth)return false;
  const cols=4,rows=meta.file==='cave-fauna'?2:['birds','mammals','small-fauna','reptiles','insects'].includes(meta.file)?4:1,sw=im.naturalWidth/cols,sh=im.naturalHeight/rows;
  const dw=meta.file==='cow'?52:meta.file==='horse'?56:meta.file==='mammals'?42:meta.file==='birds'?36:28;
  const dh=meta.file==='cow'?30:meta.file==='horse'?34:meta.file==='mammals'?28:meta.file==='birds'?24:22;
  const frame=p.moving?Math.floor(p.ph*6)%4:0,row=meta.row??0;
  c.imageSmoothingEnabled=false;c.drawImage(im,frame*sw,row*sh,sw,sh,-dw/2,-dh,dw,dh);return true;
}

const QUAD:Partial<Record<Species,Quad>>={
  rabbit:{w:10,h:7,leg:2,col:'#b08a62',dark:'#7a5a3c',belly:'#e8dcc4',hw:6,hh:6,ear:[2,7],earCol:'#c9a27a',tail:[3,3,'#f4efe4'],hop:true},
  hare:{w:12,h:7,leg:3,col:'#a07a52',dark:'#6e5032',belly:'#e0d0b0',hw:6,hh:6,ear:[2,9],earCol:'#b8936a',tail:[3,3,'#f0e8d8'],hop:true},
  whitehare:{w:12,h:7,leg:3,col:'#f4f6fa',dark:'#b8c4d4',belly:'#ffffff',hw:6,hh:6,ear:[2,9],earCol:'#e2e8f0',tail:[3,3,'#ffffff'],hop:true,eye:'#3a2a2a'},
  squirrel:{w:9,h:6,leg:2,col:'#b4582c',dark:'#7a3a1c',belly:'#f0d8b0',hw:5,hh:5,ear:[2,3],tail:[6,10,'#c96a34',true]},
  deer:{w:20,h:10,leg:11,col:'#a8693c',dark:'#6e4224',belly:'#f0dcc0',hw:7,hh:7,ear:[3,4],tail:[3,3,'#f4ece0'],antler:true,neck:6,spot:'#e8c8a0'},
  fox:{w:16,h:7,leg:5,col:'#d8742c',dark:'#8a3e14',belly:'#f6ead8',hw:7,hh:6,ear:[3,4],earCol:'#3a2414',tail:[9,5,'#e0843a']},
  arcticfox:{w:16,h:7,leg:5,col:'#eef2f8',dark:'#aab6c8',belly:'#ffffff',hw:7,hh:6,ear:[3,4],earCol:'#c8d2e2',tail:[9,5,'#ffffff'],eye:'#20202a'},
  sheep:{w:16,h:10,leg:5,col:'#f2efe6',dark:'#c9c2b0',hw:6,hh:7,ear:[3,2],earCol:'#3a3430',fluff:'#ffffff',eye:'#1a1a1a'},
  cow:{w:24,h:12,leg:7,col:'#f4f0e8',dark:'#2a2420',hw:8,hh:8,ear:[3,2],spot:'#2a2420',horn:true,tail:[2,6,'#2a2420']},
  horse:{w:26,h:12,leg:8,col:'#9b542f',dark:'#4a281d',belly:'#d58a55',hw:8,hh:8,ear:[3,4],earCol:'#6b3424',tail:[4,9,'#4a281d',true],neck:5},
  monkey:{w:9,h:9,leg:4,col:'#7a5434',dark:'#4a3020',belly:'#d8b890',hw:6,hh:6,ear:[2,3],earCol:'#d8b890',tail:[9,3,'#7a5434',true]},
  lizard:{w:12,h:3,leg:2,col:'#7aa04a',dark:'#4a6a2a',belly:'#c8d890',hw:4,hh:3,tail:[10,2,'#6a903e']},
  firelizard:{w:12,h:3,leg:2,col:'#d0502a',dark:'#7a2a14',belly:'#ffb04a',hw:4,hh:3,tail:[10,2,'#ff7a2a'],spot:'#ffd060'},
  scorpion:{w:9,h:3,leg:2,col:'#4a3424',dark:'#2a1c12',hw:3,hh:3,tail:[3,9,'#5a4030',true]},
  beetle:{w:6,h:4,leg:1,col:'#2a3a5a',dark:'#141c2c',hw:2,hh:3,spot:'#6a8ac8'},
  frog:{w:8,h:5,leg:2,col:'#4f9a3a',dark:'#2a5a1c',belly:'#c8e090',hw:4,hh:4,hop:true,eye:'#f0e060'},
};
const BIRD:Partial<Record<Species,Bird>>={
  songbird:{w:7,h:5,col:'#8a5a3a',wing:'#5a3a24',beak:'#e8a23a',bl:2,tail:3,belly:'#e8c8a0'},
  mountainbird:{w:8,h:5,col:'#5a6a7a',wing:'#3a4654',beak:'#d8b040',bl:2,tail:4,belly:'#e0e6ee'},
  toucan:{w:8,h:7,col:'#1a1a1a',wing:'#101010',beak:'#ff9a2a',bl:6,tail:4,belly:'#ffe060'},
  macaw:{w:8,h:7,col:'#d8302a',wing:'#2a6ad8',beak:'#e8e0d0',bl:3,tail:9,belly:'#f0c020'},
  crow:{w:9,h:6,col:'#22222c',wing:'#14141c',beak:'#3a3a44',bl:3,tail:4,eye:'#d8d8e8'},
  owl:{w:9,h:10,col:'#8a6a4a',wing:'#5a4430',beak:'#e8c060',bl:2,tail:2,belly:'#d8c4a0',eye:'#ffd040'},
  seagull:{w:10,h:5,col:'#f4f6fa',wing:'#a8b4c4',beak:'#f0b030',bl:3,tail:3},
  vulture:{w:12,h:7,col:'#3a2e2a',wing:'#241c18',beak:'#d8c8b0',bl:3,tail:4,crest:'#d8a8a0'},
  chicken:{w:9,h:8,col:'#f4ece0',wing:'#d8ccb8',beak:'#f0a020',bl:2,tail:4,leg:3,legCol:'#e8a030',crest:'#d8302a'},
  heron:{w:9,h:7,col:'#c8d0dc',wing:'#8894a8',beak:'#e0b040',bl:6,tail:3,leg:12,legCol:'#a89870'},
  duck:{w:10,h:6,col:'#8a6a4a',wing:'#5a4430',beak:'#f0a020',bl:3,tail:3,crest:'#2a8a5a'},
};
function quad(c:Ctx,d:Quad,p:Pose){const {w,h,col,dark}=d;const rest=p.state==='rest',feed=p.state==='feed'||p.state==='drink';
  const leg=rest?0:d.leg,step=p.moving?Math.sin(p.ph*10):0,by=-leg-h;
  // pernas
  if(!rest){c.fillStyle=dark;const lx=[-w/2+1,-w/2+4,w/2-6,w/2-3];for(let i=0;i<4;i++){const s=(i%2?1:-1)*step*1.5;c.fillRect(Math.round(lx[i]+s),-leg,2,leg);}}
  // cauda
  if(d.tail){const [tw,th,tc,up]=d.tail;c.fillStyle=tc;if(up){const wag=Math.sin(p.ph*3)*1.5;c.fillRect(-w/2-tw+2,by-th+3+wag,tw,th);c.fillRect(-w/2-2,by-2,4,3);}else c.fillRect(-w/2-tw+1,by+1+Math.sin(p.ph*4),tw,th);}
  // corpo
  c.fillStyle=col;c.fillRect(-w/2,by,w,h);if(d.fluff){c.fillStyle=d.fluff;for(let i=0;i<w;i+=4)c.fillRect(-w/2+i,by-1,3,2);}
  c.fillStyle=dark;c.fillRect(-w/2,by+h-1,w,1);if(d.belly){c.fillStyle=d.belly;c.fillRect(-w/2+2,by+h-2,w-4,1);}
  if(d.spot){c.fillStyle=d.spot;c.fillRect(-w/4,by+1,3,2);c.fillRect(w/6,by+2,3,2);}
  // cabeça (abaixada ao comer)
  const hx=w/2-2,hy=feed?-d.hh-1:by-d.hh+3-(d.neck??0);c.fillStyle=col;if(d.neck&&!feed)c.fillRect(hx-1,hy+d.hh-1,4,by-hy-d.hh+3);c.fillRect(hx,hy,d.hw,d.hh);if(feed){c.fillRect(hx-2,by+1,4,Math.max(2,-hy-by-1));}
  c.fillStyle=d.eye??'#1a1410';c.fillRect(hx+d.hw-3,hy+1,1,1);c.fillStyle=dark;c.fillRect(hx+d.hw-1,hy+d.hh-2,1,1);
  if(d.ear){c.fillStyle=d.earCol??col;const [ew,eh]=d.ear;c.fillRect(hx+1,hy-eh,ew,eh);if(eh>5)c.fillRect(hx+ew+1,hy-eh+2,ew,eh-2);}
  if(d.antler){c.fillStyle='#d8c8a8';c.fillRect(hx+1,hy-6,1,6);c.fillRect(hx-1,hy-6,2,1);c.fillRect(hx+2,hy-4,2,1);}
  if(d.horn){c.fillStyle='#e8e0c8';c.fillRect(hx,hy-2,1,2);c.fillRect(hx+d.hw-1,hy-2,1,2);}
}
function bird(c:Ctx,d:Bird,p:Pose){const {w,h}=d,leg=d.leg??1,flap=p.flying?Math.sin(p.ph*18):0,by=-leg-h;
  if(d.leg&&!p.flying){c.fillStyle=d.legCol??'#8a6a3a';const s=p.moving?Math.sin(p.ph*12)*1.5:0;c.fillRect(-1+s,-leg,1,leg);c.fillRect(2-s,-leg,1,leg);}
  c.fillStyle=d.wing;c.fillRect(-w/2-d.tail+1,by+1,d.tail,2);
  c.fillStyle=d.col;c.fillRect(-w/2,by,w,h);c.fillRect(w/2-3,by-3,4,4);
  if(d.belly){c.fillStyle=d.belly;c.fillRect(-w/2+2,by+h-2,w-3,2);}
  if(d.crest){c.fillStyle=d.crest;c.fillRect(w/2-2,by-4,2,1);}
  c.fillStyle=d.beak;c.fillRect(w/2+1,by-2,d.bl,p.state==='feed'?1:2);
  c.fillStyle=d.eye??'#141010';c.fillRect(w/2-1,by-2,1,1);
  c.fillStyle=d.wing;if(p.flying){const up=Math.round(flap*5);c.fillRect(-3,by-Math.max(0,up)+1,7,Math.abs(up)+2);c.fillRect(-1,by+1,3,2);}else c.fillRect(-w/2+1,by+1,w-3,h-2);
}
function insect(c:Ctx,sp:Species,p:Pose){const t=p.ph,flap=Math.abs(Math.sin(t*22));
  switch(sp){
    case 'butterfly':{const k=Math.round(1+flap*4),a='#ff8a3c',b='#ffd060';c.fillStyle=a;c.fillRect(-k,-3,k,4);c.fillRect(1,-3,k,4);c.fillStyle=b;c.fillRect(-k,1,Math.max(1,k-1),2);c.fillRect(1,1,Math.max(1,k-1),2);c.fillStyle='#2a1a10';c.fillRect(0,-3,1,6);break;}
    case 'bee':c.fillStyle='#f0c020';c.fillRect(-2,-1,4,3);c.fillStyle='#2a1a10';c.fillRect(-1,-1,1,3);c.fillRect(1,-1,1,3);c.fillStyle=`rgba(230,245,255,${.4+flap*.4})`;c.fillRect(-1,-3,3,2);break;
    case 'dragonfly':c.fillStyle='#2ab0c8';c.fillRect(-5,0,8,1);c.fillRect(2,-1,2,2);c.fillStyle=`rgba(210,245,255,${.35+flap*.4})`;c.fillRect(-2,-3,2,3);c.fillRect(0,-3,2,3);c.fillRect(-2,1,2,2);c.fillRect(0,1,2,2);break;
    case 'moth':{const k=Math.round(1+flap*3);c.fillStyle='#b8a890';c.fillRect(-k,-2,k,3);c.fillRect(1,-2,k,3);c.fillStyle='#6a5a48';c.fillRect(0,-2,1,4);break;}
    case 'embermoth':{const k=Math.round(1+flap*3);c.fillStyle='#ff7a2a';c.fillRect(-k,-2,k,3);c.fillRect(1,-2,k,3);c.fillStyle='#ffe08a';c.fillRect(0,-2,1,4);break;}
    case 'crystalmoth':{const k=Math.round(1+flap*3);c.fillStyle='#b49aff';c.fillRect(-k,-2,k,3);c.fillRect(1,-2,k,3);c.fillStyle='#e9f6ff';c.fillRect(0,-2,1,4);break;}
    case 'firefly':c.fillStyle='#3a3a20';c.fillRect(-1,-1,2,2);c.fillStyle='#f6ff8a';c.fillRect(-1,1,2,1);break;
    case 'bat':{const k=Math.round(2+flap*5);c.fillStyle='#2a2030';c.fillRect(-2,-2,4,4);c.fillRect(-2-k,-2+Math.round(flap*2),k,2);c.fillRect(2,-2+Math.round(flap*2),k,2);c.fillStyle='#ff6a6a';c.fillRect(0,-1,1,1);break;}
  }
}
function fish(c:Ctx,p:Pose,jumping:boolean){const wig=Math.round(Math.sin(p.ph*10)*1.5);
  if(jumping){c.fillStyle='#8ab4c8';c.fillRect(-5,-3,9,4);c.fillStyle='#e0f0f8';c.fillRect(-4,0,7,1);c.fillStyle='#5a849a';c.fillRect(-8,-4+wig,3,5);c.fillStyle='#101418';c.fillRect(2,-2,1,1);return;}
  c.fillStyle='rgba(15,40,55,.45)';c.fillRect(-5,-2,9,3);c.fillRect(-8,-3+wig,3,5);
}
function turtle(c:Ctx,p:Pose){c.fillStyle='#5a7a3a';c.fillRect(-6,-5,12,5);c.fillStyle='#7a9a4a';c.fillRect(-4,-6,8,2);c.fillStyle='#3a5a2a';c.fillRect(-2,-5,1,4);c.fillRect(2,-5,1,4);
  c.fillStyle='#8aa060';const s=p.moving?Math.round(Math.sin(p.ph*6)):0;c.fillRect(6,-4+s,3,3);c.fillRect(-7,-1,2,1);c.fillStyle='#101010';c.fillRect(8,-3+s,1,1);}

/** Desenha um animal com os pés em (0,0) já transladado; `f` é a direção (1 direita, -1 esquerda). */
export function drawCritter(c:Ctx,sp:Species,x:number,y:number,f:number,size:number,p:Pose){
  c.save();c.globalAlpha=p.alpha;
  // sombra no chão (aves voando projetam sombra mais longe)
  if(sp!=='fish'&&!(p.z>60)){c.fillStyle='rgba(0,0,0,.18)';c.fillRect(Math.round(x-5*size),Math.round(y-1),Math.round(10*size),2);}
  const s=size*1.25;c.translate(Math.round(x),Math.round(y-p.z));c.scale(f*s,s);
  if(drawAmbientAsset(c,sp,p)){c.restore();return;}
  const q=QUAD[sp],b=BIRD[sp];
  if(q)quad(c,q,p);else if(b)bird(c,b,p);else if(sp==='fish')fish(c,p,p.z>0);else if(sp==='turtle')turtle(c,p);else insect(c,sp,p);
  c.restore();
}
export const SPRITE_SPECIES=[...Object.keys(QUAD),...Object.keys(BIRD),'fish','turtle','butterfly','bee','dragonfly','moth','embermoth','crystalmoth','firefly','bat'] as Species[];
