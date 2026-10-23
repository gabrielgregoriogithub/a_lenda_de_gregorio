// Mundo vivo: vento, clima dinâmico, fauna ambiente, partículas, reações ao herói, água/lava animadas, sons e eventos espontâneos.
// Tudo é decorativo: nada aqui entra no save, na colisão, no combate ou nos puzzles. Os animais nunca bloqueiam o herói
// (não são sólidos), não atravessam paredes nem obstáculos, e ficam longe de baús, portas, alavancas e peças de puzzle.
// O que cada bioma tem vem de ambient-data.ts; um cenário novo herda tudo pela configuração.
import {hash,type Biome} from './world';
import type {GameMap,Prop} from './adventure';
import {SPECIES,WEATHER,profileOf,type Profile,type Species,type WeatherKind,type EventKind} from './ambient-data';
import {drawCritter} from './ambient-sprites';
import {AmbientAudio} from './ambient-audio';
import {decorAt,decorOffset,drawMotif,LIVE_MOTIFS,GLOW_MOTIFS} from './decor';

const T=32,TAU=Math.PI*2;
export interface AmbientHost{
  zone:string;map:GameMap;player:{x:number;y:number};camera:{x:number;y:number};zoom:number;canvas:{width:number;height:number};
  outdoors:boolean;sound:boolean;audio:AudioContext|null;bossActiveId:string|null;
  collides(x:number,y:number,r?:number,air?:boolean):boolean;nightLevel():number;kick?(power:number,time:number):void;damage?(sx:number,sy:number):void;
}
type State='idle'|'wander'|'feed'|'rest'|'flee'|'hide'|'climb'|'perch'|'fly'|'hover'|'swim'|'jump'|'drink'|'cross'|'circle'|'dive'|'run';
export type Critter={id:number;sp:Species;x:number;y:number;z:number;vx:number;vy:number;vz:number;f:number;state:State;t:number;ph:number;tx:number;ty:number;
  alpha:number;think:number;ax:number;ay:number;size:number;event?:string;carry?:boolean;cx?:number;cy?:number;r?:number;ang?:number;home?:Prop;rage?:boolean;attackCd?:number;hitFlash?:number};
type PK='leaf'|'drop'|'splash'|'ember'|'smoke'|'ash'|'bubble'|'ring'|'mote'|'dust'|'grass'|'spark'|'snow';
type Part={k:PK;x:number;y:number;z:number;vx:number;vy:number;vz:number;life:number;max:number;col:string;s:number;rot:number;seed:number;on:boolean};
type Print={x:number;y:number;life:number;side:number;k:'sand'|'snow'};
type Whirl={x:number;y:number;vx:number;vy:number;life:number;col:string[]};
type Star={x:number;y:number;vx:number;vy:number;life:number};
const KEEP=new Set<Prop['kind']>(['barrier','totem','torch','target','lever','stairs','door','exit','chest','npc','relic','iceSeal','lavaVent','bridge','mirror','shell']);
const AIR_STATES=new Set<State>(['perch','fly','hover','cross','circle','dive','jump','climb']);
const BIRD_PERCH=new Set<Species>(['songbird','mountainbird','toucan','macaw','crow','owl']);
const TUFT_BIOMES=new Set<Biome>(['village','forest','autumn','swamp','lake','rainforest','plains','mangrove','darkwood','ruins']);
const TUFT_COL:Partial<Record<Biome,[string,string]>>={autumn:['#a8a040','#c8b050'],darkwood:['#3a4a2a','#4a5a32'],swamp:['#4f6a32','#5f7a3a'],ruins:['#6a8a4a','#7a9a5a'],plains:['#7ab04a','#9acb62'],rainforest:['#3f8a3a','#5fae4a']};

export class Ambient{
  rng:()=>number;time=0;zone='';quality:'full'|'low'='full';reducedMotion=false;frameMs=10;slowFor=0;fastFor=0;
  profile:Profile=profileOf('cave1');biome:Biome|null=null;
  // vento: força atual (0..~2), direção suave e rajada em andamento
  wind=0;windX=0;gust=0;gustRise=0;
  weather:{kind:WeatherKind;i:number;target:number;timer:number;pending:WeatherKind|null}={kind:'clear',i:0,target:0,timer:5,pending:null};
  flash=0;bolt:{x:number;life:number;seed:number}|null=null;wet=0;snowCover=0;
  critters:Critter[]=[];nextId=1;spawnTimer=0;eventTimer=30;lastEvent:string|null=null;events:string[]=[];eventCount=0;
  chickenHits=0;chickenHitWindow=0;chickenRage=0;
  parts:Part[]=[];partIdx=0;prints:Print[]=[];whirls:Whirl[]=[];stars:Star[]=[];shadow:{x:number;y:number;life:number;dir:number}|null=null;
  lastPx=0;lastPy=0;stepAcc=0;printSide=1;moving=false;kickTimer=0;splashTimer=0;
  trees:Prop[]=[];treeTimer=0;torches:Prop[]=[];keep:[number,number][]=[];keepKey='';
  waterFlow=new Map<string,Int8Array>();live=new Map<string,{x:number;motif:string;v:number;dx:number;dy:number;biome:Biome;glow?:string;tuft?:boolean}[][]>();
  audio:AmbientAudio;fog:HTMLCanvasElement|null=null;
  constructor(rng:()=>number=Math.random){this.rng=rng;this.audio=new AmbientAudio(rng);
    for(let i=0;i<260;i++)this.parts.push({k:'mote',x:0,y:0,z:0,vx:0,vy:0,vz:0,life:0,max:1,col:'#fff',s:1,rot:0,seed:0,on:false});
    try{this.reducedMotion=typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches;}catch{/* sem matchMedia */}
    if(this.reducedMotion)this.quality='low';}

  /* ---------- consulta ---------- */
  tileAt(m:GameMap,x:number,y:number){return m.tiles[Math.floor(y/T)]?.[Math.floor(x/T)]??4;}
  biomeAt(m:GameMap,x:number,y:number):Biome|null{return m.biome?.[Math.floor(y/T)]?.[Math.floor(x/T)]??null;}
  profileAt(h:AmbientHost,x:number,y:number){return profileOf(h.zone,this.biomeAt(h.map,x,y));}
  outdoors=false;
  get cap(){return Math.round((this.outdoors?18:7)*(this.quality==='low'?.5:1));}
  /** efeito de um canal do clima atual (0..1), já com a intensidade da transição */
  fx(ch:'rain'|'snow'|'dust'|'ash'|'fog'|'dark'|'wind'){return (WEATHER[this.weather.kind][ch]??0)*this.weather.i;}
  calm(h:AmbientHost){if(h.bossActiveId)return false;const p=h.player;return !h.map.enemies.some(e=>e.hp>0&&Math.abs(e.x-p.x)<240&&Math.abs(e.y-p.y)<200);}
  /** inclinação de uma árvore ou arbusto: cada um com fase e velocidade próprias, mais forte com vento e rajadas */
  sway(x:number,y:number,kind:'tree'|'bush'){const ph=hash(x|0,y|0,91)*TAU,sp=.9+hash(x|0,y|0,92)*.9,w=this.wind,t=this.time;
    const osc=Math.sin(t*sp*(1+w*.6)+ph)*.6+Math.sin(t*sp*2.7+ph*1.7)*.25*w;const lean=this.windX*.5;return (kind==='tree'?.022:.04)*((.35+w)*osc+lean)*(this.reducedMotion?.4:1);}
  /** inclinação (px) de plantas pequenas, com a passagem do herói empurrando para o lado */
  plantShear(x:number,y:number,p:{x:number;y:number}){const ph=hash(x|0,y|0,93)*TAU,sp=1.4+hash(x|0,y|0,94),w=this.wind;
    let s=(1.2+w*3.2)*(Math.sin(this.time*sp*(1+w*.5)+ph)*.6+.4*Math.sign(this.windX||1))+this.gust*3*Math.sin(this.time*5+ph);
    const dx=x-p.x,dy=y-p.y;if(Math.abs(dx)<30&&Math.abs(dy)<22){const k=1-Math.hypot(dx,dy*1.3)/30;if(k>0)s+=Math.sign(dx||1)*k*7;}
    return this.reducedMotion?s*.4:s;}

  /* ---------- atualização ---------- */
  update(h:AmbientHost,dt:number){
    if(h.zone!==this.zone)this.enterZone(h);
    this.time+=dt;this.outdoors=h.outdoors;const p=h.player;
    const b=this.biomeAt(h.map,p.x,p.y);if(b||!h.outdoors){this.biome=b;this.profile=profileOf(h.zone,b);}
    const calm=this.calm(h),night=h.nightLevel();
    // movimento do herói (para pegadas, grama, folhas e respingos)
    const mv=Math.hypot(p.x-this.lastPx,p.y-this.lastPy);this.moving=mv>.3&&mv<40;if(this.moving)this.stepAcc+=mv;this.lastPx=p.x;this.lastPy=p.y;
    this.updateWind(dt);this.updateWeather(h,dt,calm);
    this.treeTimer-=dt;if(this.treeTimer<=0){this.treeTimer=.3;this.scanProps(h);}
    this.emit(h,dt,night);this.updateParts(h,dt);this.updateCritters(h,dt,night);
    this.spawnTimer-=dt;if(this.spawnTimer<=0){this.spawnTimer=.35;if(this.critters.length<this.cap)this.spawn(h,night);}
    this.eventTimer-=dt;if(this.eventTimer<=0){this.eventTimer=22+this.rng()*38;if(calm)this.fireEvent(h,night);}
    for(const w of this.whirls){w.x+=w.vx*dt;w.y+=w.vy*dt;w.life-=dt;}this.whirls=this.whirls.filter(w=>w.life>0);
    for(const s of this.stars){s.x+=s.vx*dt;s.y+=s.vy*dt;s.life-=dt;}this.stars=this.stars.filter(s=>s.life>0);
    if(this.shadow){this.shadow.x+=this.shadow.dir*60*dt;this.shadow.life-=dt;if(this.shadow.life<=0)this.shadow=null;}
    for(const f of this.prints)f.life-=dt;this.prints=this.prints.filter(f=>f.life>0);
    this.updateSound(h,dt,night);
    // qualidade automática: se o desenho ficar pesado por alguns segundos, reduz partículas e animais
    if(this.frameMs>16){this.slowFor+=dt;if(this.slowFor>2.5&&this.quality==='full'){this.quality='low';this.critters.length=Math.min(this.critters.length,this.cap);}}else this.slowFor=Math.max(0,this.slowFor-dt);
    // volta ao completo se o desenho ficar leve de novo por um bom tempo (picos de carregamento não rebaixam para sempre)
    if(this.quality==='low'&&!this.reducedMotion&&this.frameMs<8){this.fastFor+=dt;if(this.fastFor>8){this.quality='full';this.fastFor=0;}}else this.fastFor=0;
  }
  reportFrame(ms:number){this.frameMs+=(ms-this.frameMs)*.05;}
  enterZone(h:AmbientHost){this.zone=h.zone;this.critters=[];this.whirls=[];this.prints=[];this.shadow=null;this.chickenHits=0;this.chickenHitWindow=0;this.chickenRage=0;for(const q of this.parts)q.on=false;this.biome=this.biomeAt(h.map,h.player.x,h.player.y);this.profile=profileOf(h.zone,this.biome);
    this.lastPx=h.player.x;this.lastPy=h.player.y;this.keepKey='';this.treeTimer=0;this.spawnTimer=0;
    // interiores têm clima fixo; ao ar livre o clima atual continua se o novo bioma o permitir
    const allowed=this.profile.weather.some(w=>w[0]===this.weather.kind);if(!allowed||!h.outdoors){this.weather.kind=this.pick(this.profile.weather);this.weather.i=h.outdoors?0:1;this.weather.target=this.intensityFor(this.weather.kind,h.outdoors);this.weather.pending=null;}}
  pick<K>(list:[K,number][]){const sum=list.reduce((s,w)=>s+w[1],0);let r=this.rng()*sum;for(const [k,w] of list){r-=w;if(r<=0)return k;}return list[0][0];}
  intensityFor(k:WeatherKind,outdoors:boolean){if(!outdoors||WEATHER[k].indoor)return 1;return k==='clear'?0:.55+this.rng()*.45;}
  updateWind(dt:number){const P=this.profile,t=this.time;
    if(this.gustRise>0){this.gustRise-=dt;this.gust=Math.min(1,this.gust+dt*1.4);}else this.gust=Math.max(0,this.gust-dt*.35);
    if(this.rng()<dt*.04*(.4+P.gust))this.startGust(.7+this.rng()*.6);
    const base=P.wind+this.fx('wind');this.wind=Math.max(0,base*(.75+.2*Math.sin(t*.37)+.12*Math.sin(t*1.13+1))+this.gust*P.gust*1.3);
    const dir=Math.sin(t*.011)>-.6?1:-1;this.windX+=(dir*this.wind-this.windX)*Math.min(1,dt*.5);}
  startGust(len=1){this.gustRise=len;}
  updateWeather(h:AmbientHost,dt:number,calm:boolean){const w=this.weather,P=this.profile;
    if(!h.outdoors){if(!P.weather.some(x=>x[0]===w.kind)){w.kind=P.weather[0][0];}w.target=1;w.i+=(1-w.i)*Math.min(1,dt*2);return;}
    const allowed=P.weather.some(x=>x[0]===w.kind);
    if(!allowed&&!w.pending)w.pending=this.pick(P.weather);
    w.timer-=dt;if(w.timer<=0&&!w.pending){w.timer=70+this.rng()*110;const n=this.pick(P.weather);if(n!==w.kind)w.pending=n;else w.target=this.intensityFor(n,true);}
    if(w.pending){w.target=0;if(w.i<.02){w.kind=w.pending;w.pending=null;w.target=this.intensityFor(w.kind,true);w.timer=70+this.rng()*110;}}
    const tgt=calm?w.target:Math.min(w.target,.5),rate=dt/7;w.i+=Math.max(-rate,Math.min(rate,tgt-w.i));w.i=Math.max(0,Math.min(1,w.i));
    if(this.fx('rain')>.3)this.wet=Math.min(1,this.wet+dt/20);else this.wet=Math.max(0,this.wet-dt/45);
    if(this.fx('snow')>.25)this.snowCover=Math.min(1,this.snowCover+dt/50);else this.snowCover=Math.max(0,this.snowCover-dt/80);
    this.flash=Math.max(0,this.flash-dt*2.6);if(this.bolt){this.bolt.life-=dt;if(this.bolt.life<=0)this.bolt=null;}
    if(WEATHER[w.kind].lightning&&w.i>.45&&this.rng()<dt*.07){this.flash=.8+this.rng()*.2;this.bolt={x:this.rng(),life:.18,seed:this.rng()*1000};this.audio.thunder(this.rng());this.events.push('lightning');}}
  scanProps(h:AmbientHost){const c=h.camera,W=h.canvas.width/h.zoom,H=h.canvas.height/h.zoom,m=h.map;
    this.trees=[];this.torches=[];for(const q of m.props){if(q.x<c.x-120||q.x>c.x+W+120||q.y<c.y-80||q.y>c.y+H+140)continue;if(q.kind==='tree')this.trees.push(q);else if(q.kind==='torch'&&q.open)this.torches.push(q);}
    const key=h.zone+':'+m.props.length;if(key!==this.keepKey){this.keepKey=key;this.keep=m.props.filter(q=>KEEP.has(q.kind)).map(q=>[q.x,q.y]);}}
  inKeep(x:number,y:number){for(const [a,b] of this.keep)if(Math.abs(a-x)<46&&Math.abs(b-y)<46)return true;return false;}
  /** chão onde um animal terrestre pode pisar: piso, sem colisão, longe de peças de puzzle e passagens */
  landOk(h:AmbientHost,x:number,y:number){const t=this.tileAt(h.map,x,y);if(h.outdoors?t!==0&&t!==1:t!==3)return false;return !h.collides(x,y,6)&&!this.inKeep(x,y);}
  waterOk(h:AmbientHost,x:number,y:number){return this.tileAt(h.map,x,y)===2&&this.tileAt(h.map,x+8,y)===2&&this.tileAt(h.map,x-8,y)===2;}

  /* ---------- partículas ---------- */
  part(k:PK,x:number,y:number,z:number,vx:number,vy:number,vz:number,life:number,col:string,s=1){const cap=this.quality==='low'?120:this.parts.length;
    for(let n=0;n<cap;n++){const q=this.parts[this.partIdx=(this.partIdx+1)%cap];if(!q.on){Object.assign(q,{k,x,y,z,vx,vy,vz,life,max:life,col,s,rot:this.rng()*TAU,seed:this.rng()*100,on:true});return q;}}return null;}
  get liveParts(){let n=0;for(const q of this.parts)if(q.on)n++;return n;}
  emit(h:AmbientHost,dt:number,night:number){const P=this.profile,r=this.rng,c=h.camera,W=h.canvas.width/h.zoom,H=h.canvas.height/h.zoom,q=this.quality==='low'?.5:1,p=h.player;
    // folhas caindo das árvores visíveis, carregadas pelo vento
    if(this.trees.length){const rate=q*(.25+this.wind*1.4+this.gust*3)*Math.min(1,this.trees.length/12);if(r()<dt*rate*3){const tr=this.trees[Math.floor(r()*this.trees.length)];const tp=this.profileAt(h,tr.x,tr.y);
      if(tp.leaves&&r()<tp.leafRate+this.gust*.5)this.part(tp.id==='snow'?'snow':'leaf',tr.x+(r()-.5)*34,tr.y+2,44+r()*18,0,0,0,9,tp.leaves[Math.floor(r()*tp.leaves.length)]);}
      // depois da chuva, gotas pingando das copas
      if((P.dripAfterRain||this.wet>.3)&&this.wet>.05&&this.fx('rain')<.2&&r()<dt*this.wet*6*q){const tr=this.trees[Math.floor(r()*this.trees.length)];this.part('drop',tr.x+(r()-.5)*30,tr.y+4,44,0,0,-40,3,'#bfe6ff');}}
    // partículas suspensas do bioma (pólen, pó, cinzas, brilhos)
    if(P.motes&&r()<dt*P.motes.rate*8*q){const x=c.x+r()*W,y=c.y+r()*H;this.part('mote',x,y,P.motes.rise?2:6+r()*30,(r()-.5)*8,(r()-.5)*4,P.motes.rise?14+r()*14:(r()-.5)*4,4+r()*4,P.motes.color,P.motes.glow?2:1);}
    // brasas e fumaça das tochas acesas
    for(const t of this.torches)if(r()<dt*4*q){this.part('ember',t.x+(r()-.5)*6,t.y,36,(r()-.5)*10,0,30+r()*20,1+r(),r()<.5?'#ffb347':'#ff7a2a');if(r()<.35)this.part('smoke',t.x,t.y,44,0,0,16,2.4,'#5a5a62',2);}
    // chuva tocando o chão: respingos na terra e anéis na água
    const rain=this.fx('rain');if(rain>0&&h.outdoors){const n=dt*rain*60*q;for(let i=0;i<n||r()<n-i;i++){const x=c.x+r()*W,y=c.y+r()*H,t=this.tileAt(h.map,x,y);if(t===2)this.part('ring',x,y,0,0,0,0,.7,'#d8f4ff');else if(t!==4&&t!==6)this.part('splash',x,y,0,0,0,0,.25,'#cfe8ff');if(i>40)break;}
      if(this.moving&&(this.splashTimer-=dt)<=0){this.splashTimer=.18;for(let i=0;i<3;i++)this.part('drop',p.x+(r()-.5)*10,p.y,2,(r()-.5)*40,(r()-.5)*10,40+r()*30,.4,'#cfe8ff');}}
    // poeira rasteira no deserto / vento forte
    const dust=this.fx('dust');if(dust>0&&r()<dt*dust*14*q)this.part('dust',c.x-20+r()*(W*.3),c.y+r()*H,2+r()*6,60+this.wind*90,(r()-.5)*10,0,3,P.motes?.color??'#e0c896',2);
    // borbulhar de lava e de pântano
    if(r()<dt*6*q){const x=c.x+r()*W,y=c.y+r()*H,t=this.tileAt(h.map,x,y);if(t===7)this.part('bubble',x,y,0,0,0,0,1.2,'#ffb347',1+r()*2);else if(t===2&&(this.biome==='swamp'||this.biome==='mangrove'||h.zone==='grotto'||h.zone==='sunken'))this.part('bubble',x,y,0,0,0,0,1.4,'#cfe8d0',1+r());}
    if(P.tremor&&r()<dt*.3*q){const x=c.x+r()*W,y=c.y+r()*H;if(this.tileAt(h.map,x,y)===7)this.part('smoke',x,y,4,0,0,14,3.5,'#4a4048',3);}
    // reações ao herói: pegadas, grama, folhas e areia levantadas
    if(this.moving&&h.outdoors){const bp=this.biomeAt(h.map,p.x,p.y),pp=bp?profileOf(h.zone,bp):null,t=this.tileAt(h.map,p.x,p.y);
      if(pp?.footprints&&t===0&&this.stepAcc>13){this.stepAcc=0;this.printSide=-this.printSide;this.prints.push({x:p.x+this.printSide*3,y:p.y+1,life:7,side:this.printSide,k:pp.footprints});if(this.prints.length>48)this.prints.shift();
        if(pp.footprints==='sand'&&r()<.4)this.part('dust',p.x,p.y,1,(r()-.5)*20,(r()-.5)*10,8,.6,'#e0c896',1);}
      if((this.kickTimer-=dt)<=0){this.kickTimer=.12;if(bp==='autumn'&&pp?.leaves&&r()<.6)this.part('leaf',p.x+(r()-.5)*12,p.y+2,1,(r()-.5)*30,(r()-.5)*15,40+r()*30,4,pp.leaves[Math.floor(r()*pp.leaves.length)]);
        else if(bp&&TUFT_BIOMES.has(bp)&&t===0&&r()<.35)this.part('grass',p.x+(r()-.5)*12,p.y+1,1,(r()-.5)*24,(r()-.5)*10,24+r()*16,.5,'#8acb62');
        else if(bp==='snow'&&t===0&&r()<.4)this.part('snow',p.x,p.y,1,(r()-.5)*20,(r()-.5)*10,20,.5,'#ffffff');
        const tx=Math.floor(p.x/T),ty=Math.floor(p.y/T),dd=bp?decorAt(bp,tx,ty):null;if(dd?.motif==='puddle'||(this.wet>.3&&t!==1)){if(dd?.motif==='puddle'||r()<this.wet*.5){for(let i=0;i<3;i++)this.part('drop',p.x+(r()-.5)*8,p.y,1,(r()-.5)*40,(r()-.5)*12,40+r()*30,.4,'#cfe8ff');if(dd?.motif==='puddle')this.part('ring',p.x,p.y+1,0,0,0,0,.6,'#d8f4ff');}}}}
    if(night>.4&&(P.fauna.some(f=>f[0]==='firefly')||['forest','lake','swamp','village','rainforest','mangrove','starfall'].includes(this.biome??''))&&r()<dt*night*1.5*q)
      this.part('mote',c.x+r()*W,c.y+r()*H,8+r()*20,(r()-.5)*10,(r()-.5)*6,(r()-.5)*5,5,'#f6ff8a',2);
  }
  updateParts(h:AmbientHost,dt:number){const wx=this.windX;
    for(const q of this.parts){if(!q.on)continue;q.life-=dt;if(q.life<=0){q.on=false;continue;}
      switch(q.k){
        case 'leaf':case 'snow':if(q.z>0){q.vz=-(16+(q.seed%7)*2);q.vx=wx*38+Math.sin(this.time*3+q.seed)*16;q.z+=q.vz*dt;q.x+=q.vx*dt;q.rot+=dt*(2+q.seed%3)*Math.sign(wx||1);if(q.z<=0){q.z=0;q.life=Math.min(q.life,q.k==='snow'?1.5:4);}}
          else if(Math.abs(wx)>1.1||this.gust>.6){q.x+=wx*14*dt;q.rot+=dt;}break;
        case 'drop':q.vz-=320*dt;q.z+=q.vz*dt;q.x+=q.vx*dt;q.y+=q.vy*dt;if(q.z<=0){q.on=false;this.part('splash',q.x,q.y,0,0,0,0,.2,'#cfe8ff');}break;
        case 'grass':q.vz-=200*dt;q.z+=q.vz*dt;q.x+=q.vx*dt;q.y+=q.vy*dt;if(q.z<=0)q.on=false;break;
        case 'ember':q.z+=q.vz*dt;q.x+=(q.vx+wx*20)*dt;q.vx+=(this.rng()-.5)*40*dt;break;
        case 'smoke':q.z+=q.vz*dt;q.x+=wx*22*dt;q.s+=dt*1.6;break;
        case 'mote':q.x+=(q.vx+wx*6)*dt+Math.sin(this.time*1.3+q.seed)*.2;q.y+=q.vy*dt;q.z=Math.max(0,q.z+q.vz*dt);break;
        case 'dust':q.x+=q.vx*dt;q.y+=q.vy*dt;q.z=Math.max(0,q.z+q.vz*dt);break;
        case 'ash':q.z-=8*dt;q.x+=wx*16*dt;break;
        case 'bubble':if(q.life<.15&&q.s>0){q.s=0;this.part('spark',q.x,q.y,2,0,0,30,.3,q.col);}break;
      }}}

  /* ---------- fauna ---------- */
  nightOk(sp:Species,night:number){if(!this.outdoors)return true;const n=SPECIES[sp].night;return n==='only'?night>.45:n==='never'?night<.55:true;}
  spawn(h:AmbientHost,night:number,force?:{sp:Species;x:number;y:number;state?:State}):Critter|null{
    const r=this.rng,c=h.camera,W=h.canvas.width/h.zoom,H=h.canvas.height/h.zoom;
    let sp:Species,x:number,y:number;
    if(force){({sp,x,y}=force);}else{
      // ponto candidato: um pouco fora da tela na maior parte das vezes, para os animais chegarem em vez de surgirem
      if(r()<.7){const side=Math.floor(r()*4),m=40+r()*50;x=side===0?c.x-m:side===1?c.x+W+m:c.x+r()*W;y=side===2?c.y-m:side===3?c.y+H+m:c.y+r()*H;}else{x=c.x+r()*W;y=c.y+r()*H;}
      const prof=this.profileAt(h,x,y),list=prof.fauna.filter(([s])=>this.nightOk(s,night)&&this.critters.filter(k=>k.sp===s).length<(SPECIES[s].move==='flutter'?4:3));if(!list.length)return null;sp=this.pick(list);}
    if(force&&this.critters.length>=this.cap+12)return null;
    const d=SPECIES[sp],k:Critter={id:this.nextId++,sp,x,y,z:0,vx:0,vy:0,vz:0,f:r()<.5?1:-1,state:'idle',t:1+r()*2,ph:r()*10,tx:x,ty:y,alpha:0,think:0,ax:x,ay:y,size:d.size*(.9+r()*.2)};
    if(sp==='chicken'&&this.chickenRage>0){k.rage=true;k.state='fly';k.alpha=1;k.z=10;k.attackCd=0;}
    const vis=x>c.x&&x<c.x+W&&y>c.y&&y<c.y+H;
    if(force?.state){const land=d.move==='hop'||d.move==='walk'||d.move==='climb'||d.move==='wade';if(land&&!this.landOk(h,x,y))return null;if(d.move==='swim'&&!this.waterOk(h,x,y))return null;
      k.state=force.state;k.x=x;k.y=y;k.tx=x;k.ty=y;k.ax=x;k.ay=y;k.alpha=vis?0:1;this.critters.push(k);return k;}
    switch(d.move){
      case 'hop':case 'walk':case 'climb':case 'wade':{if(!force){const tx=Math.floor(x/T)*T+16,ty=Math.floor(y/T)*T+16;x=tx+(r()-.5)*16;y=ty+(r()-.5)*12;}if(!this.landOk(h,x,y))return null;
        if(d.move==='wade'&&![[-T,0],[T,0],[0,-T],[0,T]].some(([a,b])=>this.tileAt(h.map,x+a,y+b)===2))return null;
        // terrestres só nascem fora da vista ou entram em cena discretamente
        if(vis&&!force&&r()<.6)return null;k.state=force?.state??(r()<.4?'feed':'idle');break;}
      case 'swim':if(!this.waterOk(h,x,y))return null;k.state='swim';break;
      case 'perch':{const trees=this.trees.filter(q=>Math.abs(q.x-x)<260&&Math.abs(q.y-y)<220);if(trees.length&&r()<.75){const tr=trees[Math.floor(r()*trees.length)];k.home=tr;x=tr.x+(r()-.5)*22;y=tr.y-50-r()*10;k.state='perch';k.alpha=vis?0:1;}
        else if(this.landOk(h,x,y)){if(vis&&!force)return null;k.state='feed';}else return null;break;}
      case 'flutter':{if(!force){const fl=this.findFlower(h,x,y,sp);if(fl){x=fl[0];y=fl[1];}}if(this.tileAt(h.map,x,y)===4&&!force)return null;k.state='hover';k.z=8+r()*16;k.ax=x;k.ay=y;break;}
      case 'fly':{if(sp==='vulture'||(sp==='seagull'&&r()<.5)){k.state='circle';k.cx=c.x+W*(.2+r()*.6);k.cy=c.y+H*(.2+r()*.6);k.r=70+r()*80;k.ang=r()*TAU;k.z=0;}
        else{k.state='cross';const fromL=r()<.5;x=fromL?c.x-30:c.x+W+30;y=c.y+H*(.1+r()*.7);k.vx=(fromL?1:-1)*d.speed*(.8+r()*.4);k.vy=(r()-.5)*20;k.f=fromL?1:-1;}break;}
    }
    k.x=x;k.y=y;k.tx=x;k.ty=y;if(k.state!=='perch')k.alpha=vis&&d.move!=='fly'?0:1;this.critters.push(k);return k;
  }
  findFlower(h:AmbientHost,x:number,y:number,sp:Species):[number,number]|null{const want=sp==='dragonfly'?'water':sp==='butterfly'||sp==='bee'?'flower':null;if(!want)return null;
    for(let i=0;i<14;i++){const tx=Math.floor(x/T)+Math.floor((this.rng()-.5)*10),ty=Math.floor(y/T)+Math.floor((this.rng()-.5)*8);const t=h.map.tiles[ty]?.[tx];
      if(want==='water'&&t===2)return [tx*T+16,ty*T+10];
      if(want==='flower'&&t===0){const b=h.map.biome?.[ty]?.[tx];const d=b?decorAt(b,tx,ty):null;if(d&&/flower|bloom/.test(d.motif))return [tx*T+16,ty*T+16];}}return null;}
  threat(h:AmbientHost,k:Critter){const p=h.player,d=SPECIES[k.sp];let best:[number,number,number]|null=null;
    const dp=Math.hypot(p.x-k.x,p.y-k.y),reach=d.flee*(this.moving?1:.55);if(dp<reach)best=[p.x,p.y,dp];
    for(const e of h.map.enemies){if(e.hp<=0)continue;const de=Math.hypot(e.x-k.x,e.y-k.y);if(de<70&&(!best||de<best[2]))best=[e.x,e.y,de];}return best;}
  /** Golpes de espada atingem as galinhas, mas nunca reduzem sua vida. Dez acertos
   * dentro de três minutos convocam o bando por trinta segundos. */
  strikeChickens(x:number,y:number,dx:number,dy:number,reach=62){
    if(this.chickenRage>0)return {hits:0,triggered:false,positions:[] as {x:number;y:number}[]};
    if(this.chickenHitWindow<=0)this.chickenHits=0;
    let hits=0;const positions:{x:number;y:number}[]=[];
    for(const k of this.critters){if(k.sp!=='chicken'||k.rage)continue;const ox=k.x-x,oy=k.y-y,d=Math.hypot(ox,oy);if(d>reach||ox*dx+oy*dy<=-10)continue;k.hitFlash=.2;k.z=Math.max(k.z,3);k.f=dx>=0?1:-1;hits++;positions.push({x:k.x,y:k.y});}
    if(!hits)return {hits:0,triggered:false,positions};
    this.chickenHits+=hits;this.chickenHitWindow=180;
    if(this.chickenHits<10)return {hits,triggered:false,positions};
    this.chickenHits=0;this.chickenHitWindow=0;this.chickenRage=30;
    for(const k of this.critters)if(k.sp==='chicken'){k.rage=true;k.state='fly';k.alpha=1;k.z=10;k.vx=0;k.vy=0;k.attackCd=0;}
    return {hits,triggered:true,positions};
  }
  stepRageChicken(h:AmbientHost,k:Critter,dt:number){
    const p=h.player,dx=p.x-k.x,dy=p.y-k.y,d=Math.hypot(dx,dy)||1,chaos=Math.sin(this.time*7.5+k.id*1.7)*.72;
    const ca=Math.cos(chaos),sa=Math.sin(chaos),tx=(dx/d)*ca-(dy/d)*sa,ty=(dx/d)*sa+(dy/d)*ca,speed=145+Math.sin(this.time*3+k.id)*25;
    k.vx+=(tx*speed-k.vx)*Math.min(1,dt*5);k.vy+=(ty*speed-k.vy)*Math.min(1,dt*5);
    const nx=k.x+k.vx*dt,ny=k.y+k.vy*dt;if(!h.collides(nx,ny,5,true)){k.x=nx;k.y=ny;}else{k.vx*=-.8;k.vy*=-.8;}
    k.f=k.vx>=0?1:-1;k.z=10+Math.abs(Math.sin(this.time*11+k.id))*8;k.attackCd=Math.max(0,(k.attackCd??0)-dt);
    if(d<25&&k.attackCd<=0){h.damage?.(k.x,k.y);k.attackCd=.42;if(h.sound)this.audio.play('cluck');h.kick?.(2.5,.12);}
  }
  updateCritters(h:AmbientHost,dt:number,night:number){const c=h.camera,W=h.canvas.width/h.zoom,H=h.canvas.height/h.zoom,cx=c.x+W/2,cy=c.y+H/2,far=(W+H)*.75;
    if(this.chickenHitWindow>0)this.chickenHitWindow=Math.max(0,this.chickenHitWindow-dt);
    if(this.chickenRage>0){this.chickenRage=Math.max(0,this.chickenRage-dt);if(this.chickenRage===0)for(const k of this.critters)if(k.rage){k.rage=false;k.state='idle';k.z=0;k.vx=0;k.vy=0;k.t=1+this.rng()*2;}}
    for(const k of this.critters){const d=SPECIES[k.sp];k.t-=dt;k.ph+=dt;k.think-=dt;
      const target=k.state==='hide'?0:1;k.alpha+=(target-k.alpha)*Math.min(1,dt*(k.state==='hide'?3:2));
      if(Math.abs(k.x-cx)>far+60||Math.abs(k.y-cy)>far){k.alpha=-1;continue;}
      if(k.rage&&k.sp==='chicken'){this.stepRageChicken(h,k,dt);continue;}
      if(k.hitFlash)k.hitFlash=Math.max(0,k.hitFlash-dt);
      // ameaça (herói ou monstro perto) a cada 0,2 s
      if(k.think<=0){k.think=.2;const th=d.flee?this.threat(h,k):null;if(th)this.react(h,k,th);}
      if(k.state==='cross'||k.state==='dive'||k.state==='circle')this.stepFly(h,k,dt);else switch(d.move){case 'hop':case 'walk':case 'climb':case 'wade':this.stepLand(h,k,dt);break;case 'perch':this.stepBird(h,k,dt);break;case 'flutter':this.stepFlutter(h,k,dt,night);break;case 'swim':this.stepSwim(h,k,dt);break;case 'fly':this.stepFly(h,k,dt);break;}
      if(k.state==='hide'&&k.alpha<.03)k.alpha=-1;}
    this.critters=this.critters.filter(k=>k.alpha>=0);}
  react(h:AmbientHost,k:Critter,[tx,ty]:[number,number,number]){const d=SPECIES[k.sp],r=this.rng;
    if(d.move==='perch'){if(k.state==='perch'||k.state==='feed'){this.takeOff(h,k,tx);}return;}
    if(d.move==='flutter'){const a=Math.atan2(k.y-ty,k.x-tx);k.ax=k.x+Math.cos(a)*90;k.ay=k.y+Math.sin(a)*70;return;}
    if(d.move==='swim'){if(k.sp==='fish'){k.tx=k.x+(k.x-tx)*.8;k.ty=k.y+(k.y-ty)*.8;}else{k.tx=k.x+Math.sign(k.x-tx)*90;k.ty=k.y+Math.sign(k.y-ty)*60;}k.t=3;return;}
    if(k.state==='flee'||k.state==='hide'||k.state==='climb'||k.state==='run')return;
    if(d.move==='wade'){k.state='cross';k.vx=Math.sign(k.x-tx||1)*90;k.vy=-30;k.f=Math.sign(k.vx);k.z=0;return;}
    k.state='flee';k.t=2.4+r();const a=Math.atan2(k.y-ty,k.x-tx);k.tx=k.x+Math.cos(a)*160;k.ty=k.y+Math.sin(a)*120;
    // coelhos procuram um arbusto; esquilos e macacos, uma árvore
    const cover=k.sp==='squirrel'||k.sp==='monkey'?'tree':['rabbit','hare','whitehare','frog'].includes(k.sp)?'bush':null;
    if(cover){const list=h.map.props.filter(q=>q.kind===cover&&Math.abs(q.x-k.x)<130&&Math.abs(q.y-k.y)<110&&Math.hypot(q.x-tx,q.y-ty)>Math.hypot(k.x-tx,k.y-ty)*.8);
      const best=list.sort((a1,b1)=>Math.hypot(a1.x-k.x,a1.y-k.y)-Math.hypot(b1.x-k.x,b1.y-k.y))[0];if(best){k.home=best;k.tx=best.x;k.ty=best.y+16;}}
    if(k.sp==='chicken'&&h.sound)this.audio.play('cluck');}
  moveTo(h:AmbientHost,k:Critter,dt:number,speed:number){const dx=k.tx-k.x,dy=k.ty-k.y,l=Math.hypot(dx,dy);if(l<3)return true;const s=Math.min(l,speed*dt);
    const nx=k.x+dx/l*s,ny=k.y+dy/l*s;if(Math.abs(dx)>1)k.f=dx>0?1:-1;
    if(this.landOk(h,nx,ny)){k.x=nx;k.y=ny;return false;}
    if(this.landOk(h,nx,k.y)){k.x=nx;return false;}if(this.landOk(h,k.x,ny)){k.y=ny;return false;}
    // bloqueado: escolhe outro caminho
    const a=this.rng()*TAU;k.tx=k.x+Math.cos(a)*60;k.ty=k.y+Math.sin(a)*45;return false;}
  stepLand(h:AmbientHost,k:Critter,dt:number){const d=SPECIES[k.sp],r=this.rng;
    if(d.move==='hop'&&(k.state==='wander'||k.state==='flee'||k.state==='run')){k.z=Math.abs(Math.sin(k.ph*(k.state==='wander'?7:11)))*(k.sp==='frog'?5:4);}else k.z=Math.max(0,k.z-dt*30);
    if(k.sp==='chicken'&&k.state==='flee')k.z=Math.abs(Math.sin(k.ph*14))*3;
    switch(k.state){
      case 'idle':if(k.t<=0&&d.move==='climb'&&r()<.3){const tr=this.trees.find(q=>Math.abs(q.x-k.x)<90&&Math.abs(q.y-k.y)<70);if(tr){k.home=tr;k.tx=tr.x;k.ty=tr.y+16;k.state='flee';k.t=4;break;}}
        if(k.t<=0){const n=r();if(n<.45&&d.move!=='wade'){k.state='wander';const a=r()*TAU,dist=30+r()*80;k.tx=k.x+Math.cos(a)*dist;k.ty=k.y+Math.sin(a)*dist*.7;k.t=6;}else if(n<.75){k.state='feed';k.t=2+r()*3;}else{k.state='rest';k.t=4+r()*5;}}break;
      case 'feed':case 'rest':case 'drink':if(k.t<=0){k.state='idle';k.t=.6+r()*1.5;}break;
      case 'wander':if(this.moveTo(h,k,dt,d.speed*.55)||k.t<=0){k.state='idle';k.t=1+r()*2.5;}break;
      case 'run':if(this.moveTo(h,k,dt,d.speed*2.2)||k.t<=0){k.state='hide';}break;
      case 'flee':{const done=this.moveTo(h,k,dt,d.speed*(k.sp==='cow'||k.sp==='sheep'?1.2:2.4));
        if(k.home&&Math.hypot(k.home.x-k.x,k.home.y+16-k.y)<12){if(k.home.kind==='tree'){k.state='climb';k.vz=0;k.x=k.home.x+(k.f>0?-4:4);}else{k.state='hide';}}
        else if(done||k.t<=0){k.state=k.sp==='deer'&&r()<.5?'hide':'idle';k.t=1.5+r()*2;k.home=undefined;}break;}
      case 'climb':if(k.vz>=0){k.z+=dt*42;if(k.z>44){k.vz=-1;k.t=4+r()*6;k.alpha=Math.min(k.alpha,.99);}}else{if(k.t>0){k.z=44;}else{k.z-=dt*36;if(k.z<=0){k.z=0;k.vz=0;k.state='idle';k.t=1+r()*2;k.home=undefined;}}}break;
    }}
  takeOff(h:AmbientHost,k:Critter,fx:number){const r=this.rng;k.state='fly';const away=Math.sign(k.x-fx||1);k.f=away;
    // pousa em outra árvore próxima ou vai embora
    const trees=this.trees.filter(q=>q!==k.home&&Math.abs(q.x-k.x)>100&&Math.abs(q.x-k.x)<380&&Math.sign(q.x-k.x)===away);
    if(trees.length&&r()<.6){const tr=trees[Math.floor(r()*trees.length)];k.home=tr;k.tx=tr.x+(r()-.5)*20;k.ty=tr.y-50-r()*10;}else{k.home=undefined;k.tx=k.x+away*700;k.ty=k.y-260-r()*120;}
    k.vy=-80;k.t=8;if(h.sound&&r()<.4)this.audio.play(k.sp==='crow'?'crow':'bird');}
  stepBird(h:AmbientHost,k:Critter,dt:number){const d=SPECIES[k.sp],r=this.rng;
    switch(k.state){
      case 'perch':case 'feed':if(k.t<=0){if(r()<.35){this.takeOff(h,k,k.x-k.f*10);}else{k.t=3+r()*6;if(r()<.4)k.f=-k.f;}}
        if(k.state==='feed'&&r()<dt*.6){const nx=k.x+(r()-.5)*24;if(this.landOk(h,nx,k.y)){k.f=nx>k.x?1:-1;k.x=nx;}}break;
      case 'fly':{const dx=k.tx-k.x,dy=k.ty-k.y,l=Math.hypot(dx,dy);const s=d.speed*(l<40?.6:1);if(l<4){if(k.home){k.state='perch';k.t=6+r()*12;}else k.alpha=-1;break;}
        k.x+=dx/l*s*dt;k.y+=dy/l*s*dt+Math.sin(k.ph*6)*.4;k.f=dx>0?1:-1;if(k.t<=0&&!k.home)k.state='hide';break;}
    }}
  stepFlutter(h:AmbientHost,k:Critter,dt:number,night:number){const d=SPECIES[k.sp],r=this.rng;if(!this.nightOk(k.sp,night))k.state='hide';
    const jit=k.sp==='dragonfly'?(r()<dt*1.5?1:0)*220:60;k.vx+=(r()-.5)*jit*dt*(k.sp==='dragonfly'?6:10)+(k.ax-k.x)*dt*.9;k.vy+=(r()-.5)*jit*dt*(k.sp==='dragonfly'?6:10)+(k.ay-k.y)*dt*.9;
    const damp=k.sp==='dragonfly'?.9:.96,v=Math.hypot(k.vx,k.vy),mx=d.speed;k.vx*=damp;k.vy*=damp;if(v>mx){k.vx*=mx/v;k.vy*=mx/v;}
    k.x+=k.vx*dt;k.y+=k.vy*dt;k.z=10+Math.sin(k.ph*1.7+k.id)*6;if(Math.abs(k.vx)>2)k.f=k.vx>0?1:-1;if(k.t<=0){k.t=4+r()*6;if(r()<.25){k.ax+=(r()-.5)*120;k.ay+=(r()-.5)*90;}}}
  stepSwim(h:AmbientHost,k:Critter,dt:number){const d=SPECIES[k.sp],r=this.rng;
    if(k.state==='jump'){k.vz-=300*dt;k.z+=k.vz*dt;k.x+=k.vx*dt;if(k.z<=0){k.z=0;k.state='swim';this.part('ring',k.x,k.y,0,0,0,0,.8,'#d8f4ff');for(let i=0;i<5;i++)this.part('drop',k.x,k.y,2,(r()-.5)*50,(r()-.5)*20,50+r()*40,.5,'#d8f4ff');}return;}
    if(k.t<=0){k.t=2+r()*4;const a=r()*TAU;k.tx=k.x+Math.cos(a)*60;k.ty=k.y+Math.sin(a)*40;
      if(k.sp==='fish'&&r()<.12){k.state='jump';k.vz=110+r()*40;k.vx=(r()-.5)*40;k.f=k.vx>0?1:-1;this.part('ring',k.x,k.y,0,0,0,0,.8,'#d8f4ff');if(h.sound&&r()<.5)this.audio.play('bubble');return;}}
    const dx=k.tx-k.x,dy=k.ty-k.y,l=Math.hypot(dx,dy);if(l>2){const s=Math.min(l,d.speed*dt),nx=k.x+dx/l*s,ny=k.y+dy/l*s;if(this.waterOk(h,nx,ny)){k.x=nx;k.y=ny;k.f=dx>0?1:-1;}else{k.tx=k.x;k.ty=k.y;k.t=Math.min(k.t,.3);}}
    if(k.sp==='duck'&&r()<dt*.5)this.part('ring',k.x,k.y+1,0,0,0,0,.6,'#d8f4ff');}
  stepFly(h:AmbientHost,k:Critter,dt:number){
    if(k.state==='circle'){k.ang=(k.ang??0)+dt*(SPECIES[k.sp].speed/(k.r??100));k.x=(k.cx??0)+Math.cos(k.ang)*(k.r??100);k.y=(k.cy??0)+Math.sin(k.ang)*(k.r??100)*.5;k.f=Math.cos(k.ang+Math.PI/2)>0?1:-1;if(k.t<-40)k.state='hide';return;}
    if(k.state==='dive'){const dx=k.tx-k.x,dy=k.ty-k.y,l=Math.hypot(dx,dy);if(l<6){if(!k.carry){k.carry=true;this.part('ring',k.x,k.y,0,0,0,0,.9,'#d8f4ff');for(let i=0;i<6;i++)this.part('drop',k.x,k.y,2,(this.rng()-.5)*60,(this.rng()-.5)*20,60+this.rng()*40,.5,'#d8f4ff');k.tx=k.x+k.f*500;k.ty=k.y-320;}else k.alpha=-1;return;}
      const s=k.carry?110:200;k.x+=dx/l*s*dt;k.y+=dy/l*s*dt;return;}
    k.x+=k.vx*dt;k.y+=k.vy*dt+Math.sin(k.ph*(k.sp==='bat'?9:3))*(k.sp==='bat'?1.2:.3);}

  /* ---------- eventos espontâneos ---------- */
  fireEvent(h:AmbientHost,night:number):void{const P=this.profile,r=this.rng,c=h.camera,W=h.canvas.width/h.zoom,H=h.canvas.height/h.zoom;
    const ok=(e:EventKind)=>e==='shootingstar'?h.outdoors&&night>.6:e==='fireflies'?(night>.4||!h.outdoors||this.biome==='darkwood'||this.biome==='swamp'):e==='flock'?night<.5:e==='butterflies'?night<.5:e==='bats'?(night>.3||!h.outdoors):e==='drink'||e==='dive'?!!this.visibleWater(h):true;
    const list=P.events.filter(ok);if(!list.length)return;let e=list[Math.floor(r()*list.length)];for(let n=0;n<3&&e===this.lastEvent&&list.length>1;n++)e=list[Math.floor(r()*list.length)];
    this.lastEvent=e;this.eventCount++;this.events.push(e);if(this.events.length>60)this.events.shift();
    const birdSp=(P.fauna.find(([s])=>BIRD_PERCH.has(s)||s==='seagull')?.[0])??'songbird';
    switch(e){
      case 'flock':{const fromL=r()<.5,n=5+Math.floor(r()*4),y0=c.y+H*(.12+r()*.3);for(let i=0;i<n;i++){const k=this.spawn(h,night,{sp:birdSp,x:fromL?c.x-40-i*14:c.x+W+40+i*14,y:y0+Math.abs(i-n/2)*9,state:'cross'});if(k){k.state='cross';k.vx=(fromL?1:-1)*(120+r()*20);k.vy=-6;k.f=fromL?1:-1;k.alpha=1;k.event='flock';}}break;}
      case 'chase':{const prey=P.fauna.find(([s])=>['rabbit','hare','whitehare'].includes(s))?.[0],pred=P.fauna.find(([s])=>s==='fox'||s==='arcticfox')?.[0]??(this.biome==='snow'?'arcticfox':'fox');if(!prey)break;
        const fromL=r()<.5,y=h.player.y+(r()<.5?-1:1)*(60+r()*80),x=fromL?c.x-30:c.x+W+30;
        const a=this.spawn(h,night,{sp:prey,x,y,state:'run'}),b=this.spawn(h,night,{sp:pred,x:x-(fromL?50:-50),y:y+(r()-.5)*10,state:'run'});
        for(const k of [a,b])if(k){k.tx=fromL?c.x+W+60:c.x-60;k.ty=y+(r()-.5)*40;k.t=9;k.alpha=1;k.event='chase';}break;}
      case 'butterflies':{const fl=this.findFlower(h,h.player.x,h.player.y,'butterfly')??[h.player.x+(r()-.5)*160,h.player.y+(r()-.5)*120];for(let i=0;i<5;i++){const k=this.spawn(h,night,{sp:'butterfly',x:fl[0]+(r()-.5)*40,y:fl[1]+(r()-.5)*30});if(k){k.alpha=0;k.event='butterflies';}}break;}
      case 'whirlwind':{const leaves=P.leaves??(P.motes?[P.motes.color]:['#d8c08a']);this.whirls.push({x:c.x+W*(.15+r()*.7),y:c.y+H*(.3+r()*.5),vx:(r()<.5?-1:1)*(20+r()*25),vy:(r()-.5)*12,life:6+r()*3,col:leaves});this.startGust(.6);break;}
      case 'gust':this.startGust(1.2+r()*.6);break;
      case 'shootingstar':this.stars.push({x:W*(.1+r()*.6),y:H*(.05+r()*.25),vx:420+r()*200,vy:150+r()*80,life:.9});break;
      case 'fireflies':for(let i=0;i<8;i++){const k=this.spawn(h,1,{sp:night>.45||!h.outdoors?'firefly':'moth',x:h.player.x+(r()-.5)*260,y:h.player.y+(r()-.5)*180});if(k){k.alpha=0;k.event='fireflies';}}break;
      case 'bats':{const fromL=r()<.5;for(let i=0;i<6;i++){const k=this.spawn(h,1,{sp:'bat',x:fromL?c.x-30-i*20:c.x+W+30+i*20,y:c.y+H*(.15+r()*.5),state:'cross'});if(k){k.state='cross';k.vx=(fromL?1:-1)*(130+r()*40);k.vy=(r()-.5)*30;k.f=fromL?1:-1;k.alpha=1;k.event='bats';}}if(h.sound)this.audio.play('bat');break;}
      case 'drink':{const w=this.visibleWater(h);if(!w)break;const sp=P.fauna.find(([s])=>s==='deer'||s==='fox'||s==='sheep'||s==='cow')?.[0]??'deer';
        for(const [a,b] of [[-T,0],[T,0],[0,T],[0,-T]]){const x=w[0]+a,y=w[1]+b;if(this.landOk(h,x,y)){const k=this.spawn(h,night,{sp,x,y,state:'drink'});if(k){k.t=6;k.f=a<0?1:-1;k.event='drink';}break;}}break;}
      case 'dive':{const w=this.visibleWater(h);if(!w)break;const sp=P.fauna.find(([s])=>s==='heron'||s==='seagull'||s==='songbird')?.[0]??'songbird';const k=this.spawn(h,night,{sp:sp==='heron'?'seagull':sp,x:w[0]-200,y:w[1]-260,state:'dive'});
        if(k){k.state='dive';k.tx=w[0];k.ty=w[1];k.f=1;k.alpha=1;k.event='dive';}break;}
      case 'shadow':this.shadow={x:r()<.5?-.1:1.1,y:.25+r()*.5,life:4,dir:0};this.shadow.dir=this.shadow.x<0?1:-1;if(h.sound)this.audio.play('creak');break;
      case 'smoke':{for(let i=0;i<10;i++){const x=c.x+r()*W,y=c.y+r()*H;if(this.tileAt(h.map,x,y)===7||!h.outdoors){for(let j=0;j<6;j++)this.part('smoke',x+(r()-.5)*10,y,4+j*4,0,0,18+r()*8,3.5+r(),'#4a4048',3);break;}}break;}
      case 'tremor':if(!this.reducedMotion)h.kick?.(1.4,.35);this.audio.thunder(1);for(let i=0;i<10;i++)this.part('ash',c.x+r()*W,c.y+r()*H,80+r()*60,0,0,0,3,'#8a8088');break;
    }}
  visibleWater(h:AmbientHost):[number,number]|null{const c=h.camera,W=h.canvas.width/h.zoom,H=h.canvas.height/h.zoom;
    for(let i=0;i<30;i++){const tx=Math.floor((c.x+40+this.rng()*(W-80))/T),ty=Math.floor((c.y+40+this.rng()*(H-80))/T);if(h.map.tiles[ty]?.[tx]===2&&h.map.tiles[ty]?.[tx+1]===2)return [tx*T+16,ty*T+16];}return null;}

  /* ---------- som ---------- */
  updateSound(h:AmbientHost,dt:number,night:number){const P=this.profile,on=h.sound&&!!h.audio;this.audio.attach(on?h.audio:null);
    // água perto do herói aumenta o leito de correnteza
    let water=0,lava=0;const p=h.player,tx=Math.floor(p.x/T),ty=Math.floor(p.y/T);for(let y=ty-4;y<=ty+4;y+=2)for(let x=tx-5;x<=tx+5;x+=2){const t=h.map.tiles[y]?.[x];if(t===2)water++;else if(t===7)lava++;}
    this.audio.setBeds({wind:(.25+this.wind*.6+this.gust*.5)*P.sound.wind+this.fx('snow')*.4+this.fx('dust')*.5,rain:this.fx('rain'),water:Math.min(1,water/8)*Math.max(.3,P.sound.water),lava:Math.min(1,lava/6)+P.sound.lava*.3},on);
    const calls=night>.5&&P.sound.night.length?P.sound.night:P.sound.calls;this.audio.update(dt*(this.fx('rain')>.6?.4:1),calls,on,!h.outdoors);}
  stop(){this.audio.stop();}

  /* ---------- desenho ---------- */
  /** camada do chão: água corrente, espuma, vitórias-régias, lava borbulhando, plantas vivas, pegadas e peixes */
  drawGround(c:CanvasRenderingContext2D,h:AmbientHost,x0:number,x1:number,y0:number,y1:number){const m=h.map,t=this.time,p=h.player;
    const flow=this.flowMap(h),live=this.liveDecor(h),rain=this.fx('rain'),lowQ=this.quality==='low';
    for(let y=y0;y<y1;y++){const row=m.tiles[y];if(!row)continue;
      for(let x=x0;x<x1;x++){const tile=row[x];
        if(tile===2&&h.zone!=='temple'){const px=x*T,py=y*T,fl=flow[y*m.width+x],k=hash(x,y,5);
          // correnteza: traços claros andando no sentido do rio; lagos só ondulam
          c.fillStyle='rgba(200,240,250,.22)';
          if(fl===1){const o=(t*24+k*T)%T;c.fillRect(px+6+k*14,py+o,1,7);c.fillRect(px+20-k*8,py+(o+16)%T,1,5);}
          else if(fl===2){const o=(t*24+k*T)%T;c.fillRect(px+o,py+8+k*12,7,1);c.fillRect(px+(o+16)%T,py+22-k*6,5,1);}
          else{const wave=(Math.sin(t*2+y+x)*3)|0;c.fillRect(px+4,py+14+wave,13,1);}
          // espuma onde a água encontra a margem
          c.fillStyle=`rgba(240,252,255,${.35+.25*Math.sin(t*2.4+x*1.3+y)})`;
          const land=(a:number,b:number)=>{const n=m.tiles[b]?.[a];return n!==undefined&&n!==2&&n!==5&&n!==6;};
          if(land(x,y-1))for(let i=0;i<T;i+=6)c.fillRect(px+i+((t*6+i)|0)%3,py+1+((i+((t*3)|0))%2),3,1);
          if(land(x,y+1))for(let i=2;i<T;i+=6)c.fillRect(px+i,py+T-2-((i+((t*3)|0))%2),3,1);
          if(land(x-1,y))for(let i=0;i<T;i+=6)c.fillRect(px+1,py+i,1,3);
          if(land(x+1,y))for(let i=3;i<T;i+=6)c.fillRect(px+T-2,py+i,1,3);
          // vitórias-régias e plantas aquáticas balançando na correnteza
          const b=m.biome?.[y]?.[x];if(b&&(b==='lake'||b==='swamp'||b==='mangrove')&&k<.12&&fl===0){const bob=Math.sin(t*1.5+k*20)*1.2;c.fillStyle='#4f8a3a';c.fillRect(px+10,py+12+bob,9,5);c.fillStyle='#6fae4a';c.fillRect(px+11,py+12+bob,6,2);if(k<.04){c.fillStyle='#ffb0d0';c.fillRect(px+13,py+11+bob,3,2);}}
          // anéis da chuva caindo na água
          if(rain>0&&!lowQ){const slot=Math.floor(t*3+k*7),kk=hash(x,y,slot);if(kk<rain*.5){const ph=(t*3+k*7)%1;c.strokeStyle=`rgba(220,245,255,${.55*(1-ph)})`;c.lineWidth=1;c.beginPath();c.ellipse(px+kk*60%28+2,py+hash(x,slot,y)*28+2,2+ph*7,1+ph*3,0,0,TAU);c.stroke();}}
        }else if(tile===7){const px=x*T,py=y*T,k=Math.sin(t*3+x*1.7+y*2.3);
          c.fillStyle='rgba(255,214,110,.4)';c.fillRect(px+6+k*4,py+10,10,2);c.fillRect(px+16-k*3,py+22,7,2);
          c.fillStyle=`rgba(255,140,40,${.1+.08*Math.sin(t*1.7+x+y*1.3)})`;c.fillRect(px,py,T,T);}
      }
      // plantas vivas (grama alta, flores, juncos, cogumelos, cristais)
      const lr=live[y];if(lr)for(const e of lr){if(e.x<x0||e.x>=x1)continue;const px=e.x*T+e.dx,py=y*T+e.dy;
        if(e.tuft){const s=this.plantShear(e.x*T+16,y*T+16,p);const col=TUFT_COL[e.biome]??['#5f9a44','#7ab04a'];
          for(let i=0;i<4;i++){const bx=px+6+i*5+e.v*4,bh=7+((i*7+e.v*10)|0)%5,lean=s*(.6+i*.15);c.fillStyle=col[i%2];c.fillRect(bx,py+22-bh,1,bh/2);c.fillRect(Math.round(bx+lean*.5),py+22-bh,1,Math.ceil(bh/2));}continue;}
        const s=e.glow?0:this.plantShear(e.x*T+16,y*T+16,p)*(e.motif==='reeds'?1.4:e.motif==='mushroom'||e.motif==='toadstool'?.15:1);
        drawMotif(c,e.motif,e.v,px,py,s);
        if(e.glow){const a=.25+.25*Math.sin(t*(1.5+e.v)+e.x*1.7+y);c.globalAlpha=a;c.fillStyle=e.glow;c.fillRect(px+10,py+12,8,8);c.globalAlpha=1;}}
    }
    // pegadas que somem aos poucos
    for(const f of this.prints){c.fillStyle=f.k==='snow'?`rgba(150,170,200,${.5*Math.min(1,f.life/3)})`:`rgba(150,110,60,${.45*Math.min(1,f.life/3)})`;c.fillRect(Math.round(f.x-1),Math.round(f.y-1),3,2);}
    // peixes nadando sob a superfície
    for(const k of this.critters)if(k.sp==='fish'&&k.state!=='jump')drawCritter(c,k.sp,k.x,k.y,k.f,k.size,{moving:true,flying:false,state:k.state,ph:k.ph,z:0,alpha:k.alpha});
    // sombras de nuvens passando (só ao ar livre e sem tempestade)
    if(h.outdoors&&!lowQ&&this.fx('dark')<.2){const fog=this.fogBlob(),W=h.canvas.width/h.zoom,H=h.canvas.height/h.zoom;c.globalAlpha=.07;
      for(let i=0;i<3;i++){const span=W+500,x=((i*span/3+t*(8+this.wind*14))%span)-250+h.camera.x,y=h.camera.y+H*(.15+i*.3)+Math.sin(t*.05+i)*40;c.drawImage(fog,x-180,y-80,360,160);}c.globalAlpha=1;}
  }
  /** animais no chão entram na ordenação por profundidade junto com árvores, inimigos e herói */
  drawables(h:AmbientHost,c:CanvasRenderingContext2D,visible:(x:number,y:number)=>boolean){const out:{y:number;render:()=>void}[]=[];
    for(const k of this.critters){if(k.sp==='fish'||AIR_STATES.has(k.state)||SPECIES[k.sp].move==='flutter'||SPECIES[k.sp].move==='fly'||!visible(k.x,k.y))continue;
      out.push({y:k.y,render:()=>drawCritter(c,k.sp,k.x,k.y,k.f,k.size,{moving:k.state==='wander'||k.state==='flee'||k.state==='run'||(k.state==='swim'&&Math.hypot(k.tx-k.x,k.ty-k.y)>3),flying:k.sp==='chicken'&&k.state==='flee',state:k.state,ph:k.ph,z:k.z,alpha:Math.max(0,Math.min(1,k.alpha))})});}
    return out;}
  /** acima de tudo no mundo: aves voando e pousadas, insetos, folhas caindo, brasas, fumaça, redemoinhos */
  drawAir(c:CanvasRenderingContext2D){const t=this.time;
    for(const q of this.parts){if(!q.on)continue;const a=Math.min(1,q.life/Math.min(q.max,1)),x=Math.round(q.x),y=Math.round(q.y-q.z);
      switch(q.k){
        case 'leaf':case 'snow':{c.globalAlpha=a;c.fillStyle=q.col;const w=Math.abs(Math.cos(q.rot))*3+1;c.fillRect(x,y,Math.round(w),2);if(q.z>0&&q.k==='leaf'){c.globalAlpha=.15*a;c.fillStyle='#000';c.fillRect(Math.round(q.x),Math.round(q.y),2,1);}break;}
        case 'drop':c.globalAlpha=.8*a;c.fillStyle=q.col;c.fillRect(x,y,1,3);break;
        case 'splash':{const k=1-q.life/q.max;c.globalAlpha=.6*(1-k);c.fillStyle=q.col;c.fillRect(x-1-k*3,y-k*2,1,1);c.fillRect(x+1+k*3,y-k*2,1,1);c.fillRect(x,y-1-k*3,1,1);break;}
        case 'ring':{const k=1-q.life/q.max;c.globalAlpha=.6*(1-k);c.strokeStyle=q.col;c.lineWidth=1;c.beginPath();c.ellipse(x,y,2+k*9,1+k*3.5,0,0,TAU);c.stroke();break;}
        case 'ember':c.globalAlpha=a*(.6+.4*Math.sin(t*20+q.seed));c.fillStyle=q.col;c.fillRect(x,y,2,2);break;
        case 'smoke':c.globalAlpha=.22*a;c.fillStyle=q.col;c.beginPath();c.arc(x,y,3+q.s*3,0,TAU);c.fill();break;
        case 'ash':c.globalAlpha=.7*a;c.fillStyle=q.col;c.fillRect(x,y,2,1);break;
        case 'bubble':{const k=1-q.life/q.max;c.globalAlpha=.7;c.strokeStyle=q.col;c.lineWidth=1;if(q.s>0){c.beginPath();c.arc(x,y,q.s+k*2.5,0,TAU);c.stroke();}break;}
        case 'spark':c.globalAlpha=a;c.fillStyle=q.col;c.fillRect(x,y,1,1);c.fillRect(x+2,y+1,1,1);c.fillRect(x-2,y+1,1,1);break;
        case 'mote':c.globalAlpha=(.25+.35*Math.sin(t*2+q.seed))*Math.min(1,q.life);c.fillStyle=q.col;c.fillRect(x,y,q.s>1?2:1,q.s>1?2:1);break;
        case 'dust':c.globalAlpha=.35*a;c.fillStyle=q.col;c.fillRect(x,y,q.s>1?6:3,1);break;
        case 'grass':c.globalAlpha=a;c.fillStyle=q.col;c.fillRect(x,y,1,2);break;
      }}
    c.globalAlpha=1;
    // redemoinhos levantando folhas ou areia
    for(const w of this.whirls){const a=Math.min(1,w.life/1.5);for(let j=0;j<16;j++){const ang=t*7+j*1.3,hh=j*3.2,rad=3+j*1.1;c.globalAlpha=.75*a;c.fillStyle=w.col[j%w.col.length];c.fillRect(Math.round(w.x+Math.cos(ang)*rad),Math.round(w.y-hh+Math.sin(ang)*rad*.3),j%3?2:3,2);}
      c.globalAlpha=.12*a;c.fillStyle='#000';c.fillRect(Math.round(w.x-8),Math.round(w.y),16,2);}
    c.globalAlpha=1;
    for(const k of this.critters){const mv=SPECIES[k.sp].move;if(!(AIR_STATES.has(k.state)||mv==='flutter'||mv==='fly'))continue;if(k.sp==='fish'&&k.state!=='jump')continue;
      const flying=k.state==='fly'||k.state==='cross'||k.state==='circle'||k.state==='dive'||mv==='flutter';
      if(k.state==='circle'){c.globalAlpha=.12*k.alpha;c.fillStyle='#000';c.fillRect(Math.round(k.x-6*k.size),Math.round(k.y+90),Math.round(12*k.size),3);c.globalAlpha=1;}
      if(k.state==='climb'&&k.z>=44&&k.t>0)continue;drawCritter(c,k.sp,k.x,k.y,k.f,k.size,{moving:true,flying,state:k.state,ph:k.ph,z:mv==='flutter'?k.z:k.state==='climb'||k.state==='jump'?k.z:0,alpha:Math.max(0,Math.min(1,k.alpha))});
      if(k.carry){c.fillStyle='#8ab4c8';c.fillRect(Math.round(k.x-2),Math.round(k.y+2),5,2);}}
  }
  /** depois de desenhar uma árvore/arbusto/pedra: folhas tremulando na copa e neve acumulada */
  afterProp(c:CanvasRenderingContext2D,h:AmbientHost,o:Prop,size:number){
    if(o.kind==='tree'&&this.quality==='full'){const tp=this.profileAt(h,o.x,o.y);if(tp.leaves){const t=this.time;for(let i=0;i<3;i++){const k=hash(o.x|0,o.y|0,i+30);const lx=o.x-18+k*36+Math.sin(t*(3+k*3)+i)*(1+this.wind*1.5),ly=o.y-size*.62+hash(o.x|0,o.y|0,i+40)*size*.35;
      c.globalAlpha=.75;c.fillStyle=tp.leaves[i%tp.leaves.length];c.fillRect(Math.round(lx),Math.round(ly),2+(Math.sin(t*5+i+k*9)>0?1:0),2);}c.globalAlpha=1;}}
    if(this.snowCover>.02&&(o.kind==='tree'||o.kind==='rock'||o.kind==='bush')&&this.profileAt(h,o.x,o.y).snowCaps){const a=this.snowCover*.85;c.globalAlpha=a;c.fillStyle='#f6faff';
      if(o.kind==='tree'){c.fillRect(Math.round(o.x-14),Math.round(o.y-size*.74),28,4);c.fillRect(Math.round(o.x-9),Math.round(o.y-size*.8),18,3);c.fillRect(Math.round(o.x-20),Math.round(o.y-size*.48),12,3);c.fillRect(Math.round(o.x+8),Math.round(o.y-size*.44),12,3);}
      else{c.fillRect(Math.round(o.x-size*.3),Math.round(o.y-size*.62),Math.round(size*.6),4);}c.globalAlpha=1;}}
  /** brilhos que atravessam a noite (vaga-lumes, brasas, motas mágicas), em coordenadas de tela */
  drawGlow(c:CanvasRenderingContext2D,h:AmbientHost){const z=h.zoom,cx=h.camera.x,cy=h.camera.y,night=h.nightLevel(),t=this.time,dark=Math.max(night,h.outdoors?this.fx('dark'):.6);if(dark<.15)return;
    for(const k of this.critters)if(k.sp==='firefly'||k.sp==='embermoth'||k.sp==='crystalmoth'){const b=(.5+.5*Math.sin(t*3+k.id*2.1))*k.alpha*dark,x=(k.x-cx)*z,y=(k.y-k.z-cy)*z;
      c.globalAlpha=.3*b;c.fillStyle=k.sp==='firefly'?'#fff5a0':k.sp==='embermoth'?'#ffb347':'#d9c8ff';c.beginPath();c.arc(x,y,7*z,0,TAU);c.fill();c.globalAlpha=b;c.fillRect(x-1,y-1,3,3);}
    for(const q of this.parts)if(q.on&&(q.k==='ember'||(q.k==='mote'&&q.s>1))){const x=(q.x-cx)*z,y=(q.y-q.z-cy)*z;c.globalAlpha=.22*dark*Math.min(1,q.life);c.fillStyle=q.col;c.beginPath();c.arc(x,y,5*z,0,TAU);c.fill();}
    c.globalAlpha=1;}
  /** céu e clima em tela cheia: chuva, neve, poeira, cinzas, névoa, nevasca, ondas de calor, relâmpagos, estrelas cadentes */
  drawSky(c:CanvasRenderingContext2D,h:AmbientHost,W:number,H:number){const t=this.time,P=this.profile,z=h.zoom,ox=h.camera.x*z,oy=h.camera.y*z,lowQ=this.quality==='low',k=this.weather.kind,i=this.weather.i,q=lowQ?.5:1;
    const mod=(a:number,n:number)=>((a%n)+n)%n;
    if(P.tint){c.fillStyle=P.tint;c.fillRect(0,0,W,H);}
    if(P.vignette){const g=c.createRadialGradient(W/2,H/2,H*.2,W/2,H/2,H*.95);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,P.vignette);c.fillStyle=g;c.fillRect(0,0,W,H);
      if(P.mood==='sombrio'){c.fillStyle=`rgba(4,6,12,${(.06+.06*Math.sin(t*.23)+.03*Math.sin(t*1.7)).toFixed(3)})`;c.fillRect(0,0,W,H);}}
    // ondas de calor (deserto ao meio-dia e regiões vulcânicas): faixas tremulando sobre o chão quente
    if(P.haze&&!lowQ&&h.outdoors&&h.nightLevel()<.3&&!this.reducedMotion){c.fillStyle='rgba(255,236,200,.05)';for(let y=H*.35;y<H;y+=9){const k=Math.sin(t*2.6+y*.045),w=W*(.25+.2*Math.sin(y*.13+t*.4));c.fillRect(mod(y*7.3+k*14+t*12,W+w)-w,y+k*2,w,2);}}
    const dark=this.fx('dark');if(dark>0){c.fillStyle=`rgba(18,26,40,${(dark*.8).toFixed(3)})`;c.fillRect(0,0,W,H);}
    const fog=Math.max(this.fx('fog'),(P.fog??0)*(h.outdoors?.6:0));
    if(fog>0){const b=this.fogBlob();c.globalAlpha=Math.min(.5,fog*.5);const n=lowQ?4:7;for(let j=0;j<n;j++){const span=W+700,x=mod(j*span/n+t*(10+this.wind*18)-ox*.9,span)-350,y=mod(H*(.15+j*.13)-oy*.9,H+200)-100;c.drawImage(b,x,y,520*z,180*z);}c.globalAlpha=1;}
    const rain=this.fx('rain');if(rain>0){const n=Math.round((50+rain*170)*q),slant=-4-this.windX*6;c.strokeStyle=`rgba(185,220,240,${(.32+rain*.33).toFixed(2)})`;c.lineWidth=1;c.beginPath();
      for(let j=0;j<n;j++){const sp=260+(j%5)*45,x=mod(j*83.3+t*(-slant*10)-ox,W),y=mod(j*47.7+t*sp-oy,H);c.moveTo(x,y);c.lineTo(x+slant,y+13+rain*10);}c.stroke();}
    const snow=k==='snow'||k==='blizzard'?Math.max(this.fx('snow'),h.outdoors?0:.5):0;if(snow>0){const n=Math.round((40+snow*220)*q),drift=14+this.windX*45;c.fillStyle='#ffffffd8';
      for(let j=0;j<n;j++){const x=mod(j*137.5+Math.sin(t*.9+j)*18+t*drift*(.6+(j%3)*.3)-ox,W),y=mod(j*91.3+t*(34+(j%5)*9)-oy,H),s=1+(j%3);c.fillRect(x,y,s,s);}
      if(k==='blizzard'){c.fillStyle=`rgba(230,238,248,${(i*.32).toFixed(3)})`;c.fillRect(0,0,W,H);c.strokeStyle='rgba(255,255,255,.5)';c.beginPath();for(let j=0;j<40*q;j++){const x=mod(j*211+t*(260+j%4*40)-ox,W),y=mod(j*67-oy,H);c.moveTo(x,y);c.lineTo(x+26,y+4);}c.stroke();}}
    const dust=this.fx('dust');if(dust>0){c.fillStyle=`rgba(210,170,115,${(.12+dust*.25).toFixed(2)})`;for(let j=0;j<(30+dust*70)*q;j++){const x=mod(j*113+t*(45+(j%4)*12)*(1+this.wind)-ox,W),y=mod(j*59+t*(8+(j%5)*4)-oy,H);c.fillRect(x,y,10+(j%5)*4,1);}
      if(k==='sandstorm'){c.fillStyle=`rgba(214,168,104,${(i*.3).toFixed(3)})`;c.fillRect(0,0,W,H);}}
    const ash=this.fx('ash');if(ash>0){for(let j=0;j<(20+ash*40)*q;j++){const x=mod(j*97.3+Math.sin(t+j)*25+t*this.windX*20-ox,W),y=mod(-(j*61.7+t*(22+(j%5)*6))-oy,H);c.globalAlpha=(.4+.4*Math.sin(t*4+j))*Math.min(1,ash+.2);c.fillStyle=j%3?(k==='ash'?'#9a8e90':'#ff8a3c'):'#ffd36b';c.fillRect(x,y,2,2);}c.globalAlpha=1;}
    if(k==='gale'){c.strokeStyle='rgba(225,240,250,.45)';c.lineWidth=1.5;c.beginPath();for(let j=0;j<22*q*(.5+i);j++){const x=mod(j*139+t*(95+(j%4)*25)*(.6+this.wind*.5)-ox,W),y=mod(j*83+Math.sin(t+j)*18-oy,H);c.moveTo(x,y);c.quadraticCurveTo(x+18,y-5,x+38,y+1);}c.stroke();}
    if(P.id==='sky'){c.fillStyle='rgba(255,255,255,.1)';for(let j=0;j<5;j++){const x=mod(j*211+t*(12+j*3)-ox*.4,W+300)-150,y=mod(j*127-oy*.4,H);c.beginPath();c.ellipse(x,y,140,34,0,0,TAU);c.fill();}}
    // interiores
    if(k==='drips'){c.strokeStyle='rgba(200,225,245,.5)';c.lineWidth=1;c.beginPath();for(let j=0;j<8;j++){const ph=mod(t*.7+j*.37,1);if(ph>.35)continue;const x=mod(j*173-ox*.5,W),y=ph/.35*H;c.moveTo(x,y);c.lineTo(x,y+6);}c.stroke();}
    if(k==='bubbles'){const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'rgba(60,170,200,.1)');g.addColorStop(1,'rgba(10,40,70,.24)');c.fillStyle=g;c.fillRect(0,0,W,H);
      c.globalAlpha=.07;c.fillStyle='#bff6ff';for(let j=0;j<5;j++){const x=mod(j*W/4+t*18,W+200)-100;c.beginPath();c.moveTo(x,0);c.lineTo(x+60,0);c.lineTo(x-40,H);c.lineTo(x-100,H);c.fill();}c.globalAlpha=1;
      c.strokeStyle='rgba(210,250,255,.5)';c.lineWidth=1;for(let j=0;j<26*q;j++){const x=mod(j*113.7+Math.sin(t*1.5+j)*12-ox*.3,W),y=mod(-(j*57.3+t*(24+(j%5)*7)),H);c.beginPath();c.arc(x,y,1.5+(j%3),0,TAU);c.stroke();}}
    if(k==='spores'){for(let j=0;j<18*q;j++){c.globalAlpha=.25+.3*Math.max(0,Math.sin(t*2.2+j*2.1));c.fillStyle=P.motes?.color??'#b8e38b';c.fillRect(mod(j*167.9+Math.sin(t*.7+j)*40-ox*.3,W),mod(j*91.7+Math.cos(t*.6+j*1.3)*30-oy*.3,H),2,2);}c.globalAlpha=1;}
    // relâmpago: clarão e raio
    if(this.flash>0){c.fillStyle=`rgba(235,240,255,${(this.flash*.45).toFixed(3)})`;c.fillRect(0,0,W,H);}
    if(this.bolt){const b=this.bolt;let x=b.x*W,y=0;c.strokeStyle=`rgba(250,250,255,${(b.life/.18).toFixed(2)})`;c.lineWidth=2;c.beginPath();c.moveTo(x,y);for(let j=1;j<10;j++){x+=(hash(j,b.seed|0,7)-.5)*40;y=j*H*.07;c.lineTo(x,y);}c.stroke();}
    for(const s of this.stars){const a=Math.min(1,s.life*2);c.strokeStyle=`rgba(255,250,210,${a.toFixed(2)})`;c.lineWidth=2;c.beginPath();c.moveTo(s.x,s.y);c.lineTo(s.x-s.vx*.08,s.y-s.vy*.08);c.stroke();}
    if(this.shadow){const s=this.shadow,a=Math.min(1,s.life,4-s.life)*.28,x=(s.x+s.dir*(4-s.life)*.1)*W,y=s.y*H;c.globalAlpha=Math.max(0,a);c.fillStyle='#05070a';c.beginPath();c.ellipse(x,y,26,60,0,0,TAU);c.fill();c.beginPath();c.arc(x,y-62,16,0,TAU);c.fill();c.globalAlpha=1;}
  }
  fogBlob(){if(this.fog)return this.fog;const cv=document.createElement('canvas');cv.width=128;cv.height=64;const g=cv.getContext('2d')!;const gr=g.createRadialGradient(64,32,4,64,32,62);
    gr.addColorStop(0,'rgba(220,228,236,.9)');gr.addColorStop(1,'rgba(220,228,236,0)');g.fillStyle=gr;g.save();g.scale(1,.5);g.fillRect(0,0,128,128);g.restore();this.fog=cv;return cv;}
  /** sentido da correnteza de cada tile de água: 1 vertical (rio), 2 horizontal, 0 parada (lago) */
  flowMap(h:AmbientHost){const key=h.zone,cached=this.waterFlow.get(key);if(cached)return cached;const m=h.map,f=new Int8Array(m.width*m.height);
    for(let y=0;y<m.height;y++)for(let x=0;x<m.width;x++){if(m.tiles[y][x]!==2)continue;const w=(a:number,b:number)=>m.tiles[b]?.[a]===2||m.tiles[b]?.[a]===5;
      const v=+w(x,y-1)+ +w(x,y+1),hz=+w(x-1,y)+ +w(x+1,y);f[y*m.width+x]=v===2&&hz<2?1:hz===2&&v<2?2:0;}this.waterFlow.set(key,f);return f;}
  /** plantas vivas por linha (calculadas uma vez por mapa) */
  liveDecor(h:AmbientHost){const cached=this.live.get(h.zone);if(cached)return cached;const m=h.map,rows:{x:number;motif:string;v:number;dx:number;dy:number;biome:Biome;glow?:string;tuft?:boolean}[][]=[];
    if(m.biome)for(let y=0;y<m.height;y++){const row=[];for(let x=0;x<m.width;x++){if(m.tiles[y][x]!==0)continue;const b=m.biome[y][x],d=decorAt(b,x,y);
      if(d&&LIVE_MOTIFS.has(d.motif)){const [dx,dy]=decorOffset(x,y);row.push({x,motif:d.motif,v:d.v,dx,dy,biome:b,glow:GLOW_MOTIFS[d.motif]});}
      else if(!d&&TUFT_BIOMES.has(b)&&hash(x,y,97)<(b==='plains'?.3:.16))row.push({x,motif:'tuft',v:hash(x,y,98),dx:Math.floor(hash(x,y,99)*8)-4,dy:Math.floor(hash(x,y,100)*8)-2,biome:b,tuft:true});}
      rows[y]=row;}
    this.live.set(h.zone,rows);return rows;}
  /** resumo para testes e diagnóstico */
  info(){return {profile:this.profile.id,weather:this.weather.kind,intensity:+this.weather.i.toFixed(2),wind:+this.wind.toFixed(2),critters:this.critters.length,particles:this.liveParts,quality:this.quality,snowCover:+this.snowCover.toFixed(2)};}
}
