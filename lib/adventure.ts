export const T=32;
export type Direction='up'|'down'|'left'|'right';
export type Zone='forest'|'temple';
export type Entity={id:string;x:number;y:number;hp:number;maxHp:number;kind:'slime'|'bat'|'boss';timer:number;hit:number;homeX:number;homeY:number};
export type Prop={id:string;x:number;y:number;kind:'tree'|'rock'|'bush'|'npc'|'chest'|'door'|'exit'|'lever'|'relic';solid?:boolean;open?:boolean};
export type GameMap={width:number;height:number;tiles:number[][];props:Prop[];enemies:Entity[]};
export type Snapshot={screen:'ready'|'playing'|'paused'|'dead'|'won';zone:Zone;hp:number;maxHp:number;coins:number;potions:number;key:boolean;met:boolean;entered:boolean;levers:number;bossDead:boolean;objective:string;location:string;hint:string;notice:string;x:number;y:number;defeated:number;elapsed:number};
const dirs:Record<Direction,{x:number;y:number;angle:number;row:number}>={down:{x:0,y:1,angle:Math.PI/2,row:0},right:{x:1,y:0,angle:0,row:1},up:{x:0,y:-1,angle:-Math.PI/2,row:2},left:{x:-1,y:0,angle:Math.PI,row:3}};
const center=(n:number)=>n*T+T/2;
const entity=(id:string,x:number,y:number,kind:Entity['kind']):Entity=>({id,x:center(x),y:center(y),homeX:center(x),homeY:center(y),hp:kind==='boss'?12:kind==='bat'?2:3,maxHp:kind==='boss'?12:kind==='bat'?2:3,kind,timer:0,hit:0});
export function makeMap(zone:Zone):GameMap{
const width=zone==='forest'?34:26,height=zone==='forest'?28:20;
const tiles:number[][]=Array.from({length:height},(_,y)=>Array.from({length:width},(_,x)=>x===0||y===0||x===width-1||y===height-1?4:zone==='forest'?0:3));
const props:Prop[]=[];
const add=(kind:Prop['kind'],x:number,y:number,id:string,solid=false)=>props.push({kind,x:center(x),y:center(y),id,solid});
if(zone==='forest'){
for(let y=1;y<27;y++)for(let x=16;x<=18;x++)tiles[y][x]=2;
for(let x=3;x<15;x++)for(let y=21;y<=22;y++)tiles[y][x]=1;
for(let y=14;y<26;y++)for(let x=8;x<=9;x++)tiles[y][x]=1;
for(let x=8;x<31;x++)for(let y=14;y<=15;y++)tiles[y][x]=1;
for(let y=5;y<23;y++)for(let x=26;x<=27;x++)tiles[y][x]=1;
for(let x=23;x<=30;x++)for(let y=4;y<=6;y++)tiles[y][x]=1;
for(let x=19;x<31;x++)for(let y=20;y<=21;y++)tiles[y][x]=1;
for(let x=1;x<33;x++){if(x!==26&&x!==27){add('tree',x,1,`border-n-${x}`,true);add('tree',x,26,`border-s-${x}`,true);}}
for(let y=3;y<26;y+=2){add('tree',1,y,`border-w-${y}`,true);add('tree',32,y,`border-e-${y}`,true);}
const trees=[[4,4],[5,4],[6,5],[3,8],[5,8],[7,7],[10,4],[11,5],[13,4],[12,8],[3,12],[4,12],[5,14],[11,11],[12,11],[14,10],[21,3],[22,4],[21,8],[23,8],[29,9],[30,11],[21,11],[22,12],[5,18],[4,18],[12,18],[14,24],[21,24],[23,24],[28,24],[30,23]];
trees.forEach(([x,y],i)=>add('tree',x,y,`tree-${i}`,true));
[[6,11],[14,7],[10,18],[22,18],[29,18],[30,7],[3,24]].forEach(([x,y],i)=>add('rock',x,y,`rock-${i}`,true));
[[5,21],[12,22],[24,20],[25,20],[24,21],[13,15],[20,15],[28,13]].forEach(([x,y],i)=>add('bush',x,y,`bush-${i}`,true));
add('npc',7,21,'iris',true);add('chest',26,20,'key-chest',true);add('chest',4,10,'coin-chest',true);add('door',26,5,'temple-door',true);
return{width,height,tiles,props,enemies:[entity('slime-a',13,21,'slime'),entity('slime-b',22,16,'slime'),entity('slime-c',26,18,'slime'),entity('slime-d',11,13,'slime'),entity('bat-a',23,9,'bat')]};
}
for(let x=2;x<24;x++)if(x!==12&&x!==13)tiles[8][x]=4;
for(let y=2;y<7;y++){tiles[y][3]=4;tiles[y][22]=4;}
for(let y=11;y<17;y++){tiles[y][4]=4;tiles[y][21]=4;}
for(let x=5;x<21;x++)if(x!==12&&x!==13)tiles[17][x]=4;
add('exit',12,18,'temple-exit');add('lever',7,13,'lever-west');add('lever',18,13,'lever-east');add('relic',12,3,'moon-relic');
add('rock',7,5,'altar-west',true);add('rock',18,5,'altar-east',true);
return{width,height,tiles,props,enemies:[entity('temple-bat-a',8,15,'bat'),entity('temple-bat-b',18,15,'bat'),entity('guardian',12,5,'boss')]};
}

export class Adventure{
canvas:HTMLCanvasElement;ctx:CanvasRenderingContext2D;assets:{hero:HTMLImageElement;atlas:HTMLImageElement};onChange:(s:Snapshot)=>void;
maps={forest:makeMap('forest'),temple:makeMap('temple')};zone:Zone='forest';screen:Snapshot['screen']='ready';
player={x:center(5),y:center(23),dir:'up' as Direction,hp:6,maxHp:6,hurt:0,attack:0,cooldown:0,dash:0,dashCooldown:0,walk:0};
camera={x:0,y:0};keys=new Set<string>();coins=0;potions=2;hasKey=false;met=false;entered=false;levers=new Set<string>();bossDead=false;defeated=0;elapsed=0;notice='';noticeTime=0;dialog='';dialogTitle='';
particles:{x:number;y:number;vx:number;vy:number;life:number;color:string}[]=[];projectiles:{x:number;y:number;vx:number;vy:number;life:number}[]=[];
raf=0;lastTime=0;lastEmit=0;disposed=false;audio:AudioContext|null=null;sound=false;musicTimer=0;musicStep=0;
constructor(canvas:HTMLCanvasElement,assets:Adventure['assets'],onChange:Adventure['onChange']){this.canvas=canvas;this.ctx=canvas.getContext('2d')!;this.assets=assets;this.onChange=onChange;canvas.width=960;canvas.height=640;this.emit();this.draw();}
get map(){return this.maps[this.zone];}
get hint(){const p=this.nearProp();if(!p)return '';if(p.kind==='npc')return'Conversar com Iris';if(p.kind==='chest')return p.open?'Baú aberto':'Abrir baú';if(p.kind==='door')return this.hasKey?'Entrar no templo':'Porta selada';if(p.kind==='exit')return'Voltar ao bosque';if(p.kind==='lever')return this.levers.has(p.id)?'Selo ativado':'Ativar selo';if(p.kind==='relic')return this.bossDead?'Recolher a Relíquia Lunar':'Derrote o guardião';return '';}
get objective(){if(this.screen==='won')return'A Relíquia Lunar voltou ao vale.';if(!this.met)return'Converse com Iris, a guardiã da vila.';if(!this.hasKey)return'Encontre a chave no baú do bosque leste.';if(!this.entered)return'Abra a entrada do Templo da Lua, ao norte.';if(this.levers.size<2)return'Ative os dois selos na câmara do templo.';if(!this.bossDead)return'Derrote o Guardião de Pedra.';return'Recolha a Relíquia Lunar no altar.';}
snapshot():Snapshot{return{screen:this.screen,zone:this.zone,hp:this.player.hp,maxHp:this.player.maxHp,coins:this.coins,potions:this.potions,key:this.hasKey,met:this.met,entered:this.entered,levers:this.levers.size,bossDead:this.bossDead,objective:this.objective,location:this.zone==='forest'?'Bosque de Elara':'Templo da Lua',hint:this.hint,notice:this.notice,x:Math.round(this.player.x),y:Math.round(this.player.y),defeated:this.defeated,elapsed:Math.floor(this.elapsed)};}
emit(){this.onChange(this.snapshot());}
message(text:string){this.notice=text;this.noticeTime=4;this.emit();}
start(){if(this.screen==='ready'){this.screen='playing';this.message('Iris espera na vila. Use E para conversar.');}this.keys.clear();this.emit();}
togglePause(){if(this.screen==='playing')this.screen='paused';else if(this.screen==='paused')this.screen='playing';this.keys.clear();this.emit();}
pause(){if(this.screen==='playing'){this.screen='paused';this.keys.clear();this.emit();}}
resume(){if(this.screen==='paused'){this.screen='playing';this.emit();}}
keyDown(k:string){const was=this.keys.has(k);this.keys.add(k);if(was)return;if(k==='escape'){if(this.dialog)this.dismissDialog();else this.togglePause();return;}if(this.screen!=='playing')return;if(this.dialog){if(k==='e'||k==='enter'||k===' ')this.dismissDialog();return;}if(k==='j'||k===' '){this.attack();return;}if(k==='e'||k==='enter'){this.interact();return;}if(k==='q'){this.heal();return;}if(k==='shift'){this.dash();return;}const d=this.directionForKey(k);if(d){this.player.dir=d;this.move(dirs[d].x*9,dirs[d].y*9);this.player.walk+=.08;this.draw();this.emit();}}
keyUp(k:string){this.keys.delete(k);}
directionForKey(k:string):Direction|undefined{return({w:'up',arrowup:'up',s:'down',arrowdown:'down',a:'left',arrowleft:'left',d:'right',arrowright:'right'} as Record<string,Direction>)[k];}
collides(x:number,y:number,r=9){const m=this.map;for(const dx of[-r,r])for(const dy of[-r*.55,r*.55]){const tx=Math.floor((x+dx)/T),ty=Math.floor((y+dy)/T);if(tx<0||ty<0||tx>=m.width||ty>=m.height||m.tiles[ty][tx]===4||m.tiles[ty][tx]===2)return true;if(this.zone==='temple'&&this.levers.size<2&&ty===8&&(tx===12||tx===13))return true;}return m.props.some(p=>p.solid&&Math.abs(p.x-x)<(p.kind==='tree'?17:14)+r&&Math.abs(p.y-y)<(p.kind==='tree'?10:12)+r*.55);}
move(dx:number,dy:number){if(!this.collides(this.player.x+dx,this.player.y))this.player.x+=dx;if(!this.collides(this.player.x,this.player.y+dy))this.player.y+=dy;}
nearProp(){return this.map.props.filter(p=>!['tree','bush','rock'].includes(p.kind)).map(p=>({p,d:Math.hypot(p.x-this.player.x,p.y-this.player.y)})).filter(o=>o.d<55).sort((a,b)=>a.d-b.d)[0]?.p;}
interact(){if(this.screen!=='playing')return;if(this.dialog){this.dismissDialog();return;}const p=this.nearProp();if(!p){this.message('Aproxime-se de alguém, de um baú ou de um selo.');return;}
if(p.kind==='npc'){this.met=true;this.openDialog('Iris, guardiã do vale',this.hasKey?'Você encontrou a chave! O templo fica no alto do bosque, além da ponte. Ative os dois selos e evite as investidas do guardião.':'O brilho da lua desapareceu do nosso vale. A chave do templo está em um baú no bosque leste, além da ponte. Corte os arbustos com sua espada e traga a Relíquia Lunar de volta.');}
if(p.kind==='chest'){if(p.open){this.message('Este baú já foi aberto.');return;}p.open=true;if(p.id==='key-chest'){this.hasKey=true;this.met=true;this.coins+=15;this.openDialog('Chave Lunar encontrada','A porta do Templo da Lua agora pode ser aberta. Siga o caminho para o norte. Você também encontrou 15 cristais.');}else{this.coins+=30;this.potions++;this.message('Baú aberto: +30 cristais e +1 poção.');}this.tone(784,.13);}
if(p.kind==='door'){if(!this.hasKey){this.message('A porta está selada. Procure a chave no bosque leste.');return;}this.changeZone('temple');}
if(p.kind==='exit')this.changeZone('forest');
if(p.kind==='lever'){if(this.levers.has(p.id)){this.message('Este selo já está ativado.');return;}this.levers.add(p.id);this.burst(p.x,p.y,'#9de8dc',20);this.message(this.levers.size===2?'Os dois selos brilharam. A passagem do guardião está aberta.':'Selo ativado. Encontre o outro na mesma câmara.');this.tone(660,.15);}
if(p.kind==='relic'){if(!this.bossDead){this.message('O guardião ainda protege a relíquia.');return;}this.screen='won';this.keys.clear();this.burst(p.x,p.y,'#efce79',60);this.emit();}}
openDialog(title:string,text:string){this.dialogTitle=title;this.dialog=text;this.keys.clear();this.emit();}
dismissDialog(){this.dialog='';this.dialogTitle='';this.keys.clear();this.emit();}
changeZone(zone:Zone){this.zone=zone;this.entered=true;this.keys.clear();this.projectiles=[];this.player.x=center(zone==='temple'?12:26);this.player.y=center(zone==='temple'?16:7);this.player.dir=zone==='temple'?'up':'down';this.player.hurt=1.2;this.player.hp=Math.min(this.player.maxHp,this.player.hp+2);this.message(zone==='temple'?'Temple da Lua: ative os dois selos com E.':'Você voltou ao Bosque de Elara.');this.draw();}
attack(){if(this.screen!=='playing'||this.dialog||this.player.cooldown>0)return;this.player.attack=.23;this.player.cooldown=.34;const d=dirs[this.player.dir];this.tone(220,.06,'triangle');for(const enemy of this.map.enemies){if(enemy.hp<=0||enemy.hit>0)continue;const dx=enemy.x-this.player.x,dy=enemy.y-this.player.y,dist=Math.hypot(dx,dy);if(dist<62&&(dx*d.x+dy*d.y)>-10){enemy.hp--;enemy.hit=.27;enemy.x+=d.x*(enemy.kind==='boss'?3:11);enemy.y+=d.y*(enemy.kind==='boss'?3:11);this.burst(enemy.x,enemy.y,enemy.kind==='boss'?'#edc67d':'#c4eeb1',10);if(enemy.hp<=0){this.defeated++;this.coins+=enemy.kind==='boss'?100:8;if(enemy.kind==='boss'){this.bossDead=true;this.projectiles=[];this.message('O guardião caiu! Recolha a relíquia no altar ao norte.');}else{this.player.hp=Math.min(this.player.maxHp,this.player.hp+1);this.message('+8 cristais · um coração recuperado');}}}}
this.map.props=this.map.props.filter(p=>{if(p.kind!=='bush')return true;const dx=p.x-this.player.x,dy=p.y-this.player.y;if(Math.hypot(dx,dy)<57&&dx*d.x+dy*d.y>-5){this.burst(p.x,p.y,'#8dcd69',9);this.coins++;return false;}return true;});this.emit();}
dash(){if(this.screen!=='playing'||this.dialog||this.player.dashCooldown>0)return;this.player.dash=.18;this.player.dashCooldown=.9;this.player.hurt=Math.max(this.player.hurt,.24);this.tone(330,.08);}
heal(){if(this.screen!=='playing'||this.dialog)return;if(this.potions<=0){this.message('Sem poções.');return;}if(this.player.hp===this.player.maxHp){this.message('Sua vida já está completa.');return;}this.potions--;this.player.hp=this.player.maxHp;this.burst(this.player.x,this.player.y,'#e8acb4',18);this.message('Poção usada. Todos os corações foram recuperados.');this.tone(523,.18);}
damage(){if(this.player.hurt>0||this.screen!=='playing'||this.dialog)return;this.player.hp--;this.player.hurt=1.25;this.burst(this.player.x,this.player.y,'#ef8b83',12);this.tone(110,.14,'sawtooth');if(this.player.hp<=0){this.screen='dead';this.keys.clear();}this.emit();}
retry(){this.player.hp=this.player.maxHp;this.player.hurt=2;this.player.x=center(this.zone==='forest'?5:12);this.player.y=center(this.zone==='forest'?23:16);this.player.attack=0;this.player.cooldown=0;this.player.dash=0;this.player.dashCooldown=0;this.projectiles=[];this.map.enemies.forEach(e=>{if(e.hp>0){e.x=e.homeX;e.y=e.homeY;e.timer=0;}});this.potions=Math.max(1,this.potions);this.screen='playing';this.dialog='';this.keys.clear();this.message('Você se levantou. A aventura continua.');}
restart(){this.maps={forest:makeMap('forest'),temple:makeMap('temple')};this.zone='forest';this.player={x:center(5),y:center(23),dir:'up',hp:6,maxHp:6,hurt:0,attack:0,cooldown:0,dash:0,dashCooldown:0,walk:0};this.coins=0;this.potions=2;this.hasKey=false;this.met=false;this.entered=false;this.levers.clear();this.bossDead=false;this.defeated=0;this.elapsed=0;this.particles=[];this.projectiles=[];this.dialog='';this.screen='playing';this.keys.clear();this.message('Uma nova jornada começa. Converse com Iris.');}
burst(x:number,y:number,color:string,n:number){for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,s=20+Math.random()*75;this.particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:.25+Math.random()*.5,color});}}
setSound(on:boolean){this.sound=on;if(on&&!this.audio){try{this.audio=new AudioContext();}catch{this.sound=false;}}if(on)this.audio?.resume();}
tone(freq:number,duration:number,type:OscillatorType='sine'){if(!this.sound||!this.audio)return;const o=this.audio.createOscillator(),g=this.audio.createGain();o.type=type;o.frequency.value=freq;g.gain.setValueAtTime(.035,this.audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,this.audio.currentTime+duration);o.connect(g);g.connect(this.audio.destination);o.start();o.stop(this.audio.currentTime+duration);}
update(dt:number){if(this.screen!=='playing'||this.dialog)return;this.elapsed+=dt;const p=this.player;for(const k of['hurt','attack','cooldown','dash','dashCooldown'] as const)p[k]=Math.max(0,p[k]-dt);
let dx=0,dy=0;for(const k of this.keys){const d=this.directionForKey(k);if(d){dx+=dirs[d].x;dy+=dirs[d].y;p.dir=d;}}
if(p.dash>0){dx=dirs[p.dir].x;dy=dirs[p.dir].y;}const length=Math.hypot(dx,dy);if(length>0){const speed=p.dash>0?360:p.attack>0?72:125;this.move(dx/length*speed*dt,dy/length*speed*dt);p.walk+=dt;}else p.walk=0;
for(const e of this.map.enemies){if(e.hp<=0)continue;e.hit=Math.max(0,e.hit-dt);e.timer+=dt;const ex=p.x-e.x,ey=p.y-e.y,d=Math.hypot(ex,ey),awake=e.kind==='boss'?this.levers.size===2&&p.y<9*T:d<190;if(awake&&e.hit===0){const charge=e.kind==='boss'&&e.timer%3.4>2.4;const speed=e.kind==='boss'?charge?112:22:e.kind==='bat'?67:42;if(d>20){const mx=ex/(d||1)*speed*dt,my=ey/(d||1)*speed*dt;if(!this.collides(e.x+mx,e.y,e.kind==='boss'?16:7))e.x+=mx;if(!this.collides(e.x,e.y+my,e.kind==='boss'?16:7))e.y+=my;}if(d<(e.kind==='boss'?30:21))this.damage();if(e.kind==='boss'&&e.timer>3.4){e.timer=0;for(const angle of[-.22,0,.22]){const a=Math.atan2(ey,ex)+angle;this.projectiles.push({x:e.x,y:e.y,vx:Math.cos(a)*105,vy:Math.sin(a)*105,life:3});}}}}
for(const s of this.projectiles){s.x+=s.vx*dt;s.y+=s.vy*dt;s.life-=dt;if(Math.hypot(s.x-p.x,s.y-p.y)<14){this.damage();s.life=0;}if(this.collides(s.x,s.y,2))s.life=0;}this.projectiles=this.projectiles.filter(s=>s.life>0);
this.noticeTime-=dt;if(this.noticeTime<=0)this.notice='';this.musicTimer-=dt;if(this.musicTimer<=0){this.musicTimer=.42;const notes=this.zone==='forest'?[261.63,329.63,392,523.25,440,392,329.63,293.66]:[220,261.63,329.63,293.66,246.94,220,196,246.94];this.tone(notes[this.musicStep++%notes.length],.3);}
}
tick=(now:number)=>{if(this.disposed)return;const dt=Math.min(.035,(now-this.lastTime)/1000||.016);this.lastTime=now;this.update(dt);for(const p of this.particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;}this.particles=this.particles.filter(p=>p.life>0);this.draw();if(now-this.lastEmit>120){this.emit();this.lastEmit=now;}this.raf=requestAnimationFrame(this.tick);};
run(){this.raf=requestAnimationFrame(this.tick);}
destroy(){this.disposed=true;cancelAnimationFrame(this.raf);this.audio?.close();}
drawTile(index:number,x:number,y:number,w=T,h=T){const img=this.assets.atlas,cw=img.width/4,ch=img.height/4;this.ctx.drawImage(img,(index%4)*cw,Math.floor(index/4)*ch,cw,ch,Math.round(x),Math.round(y),w,h);}
drawSprite(index:number,x:number,y:number,size=48){this.drawTile(index,x-size/2,y-size*.8,size,size);}
draw(){const c=this.ctx,p=this.player,m=this.map,W=this.canvas.width,H=this.canvas.height;c.imageSmoothingEnabled=false;this.camera.x=m.width*T<W?(m.width*T-W)/2:Math.max(0,Math.min(m.width*T-W,p.x-W/2));this.camera.y=m.height*T<H?(m.height*T-H)/2:Math.max(0,Math.min(m.height*T-H,p.y-H/2));c.fillStyle=this.zone==='forest'?'#285336':'#132338';c.fillRect(0,0,W,H);c.save();c.translate(-Math.round(this.camera.x),-Math.round(this.camera.y));
for(let y=0;y<m.height;y++)for(let x=0;x<m.width;x++){const tile=m.tiles[y][x];this.drawTile(tile===4?7:tile,x*T,y*T);if(this.zone==='forest'&&tile===2){c.fillStyle='rgba(159,228,216,.13)';const wave=(Math.sin(this.elapsed*2+y+x)*3)|0;c.fillRect(x*T+4,y*T+14+wave,13,1);}}
if(this.zone==='forest'){c.fillStyle='#bd995c';for(let y=14;y<=15;y++)for(let x=16;x<=18;x++){c.fillRect(x*T,y*T,T,T);c.fillStyle='#947449';c.fillRect(x*T,y*T+1,T,2);c.fillRect(x*T,y*T+30,T,2);c.fillStyle='#bd995c';}}
if(this.zone==='temple'){if(this.levers.size<2){c.fillStyle='#b58b52';c.fillRect(12*T,8*T,2*T,T);c.fillStyle='#684c3f';for(let x=12*T+4;x<14*T;x+=8)c.fillRect(x,8*T,3,T);}for(const prop of m.props.filter(a=>a.kind==='lever')){c.fillStyle=this.levers.has(prop.id)?'#7fdcc3':'#9e7cb0';c.fillRect(prop.x-12,prop.y-7,24,14);c.strokeStyle=this.levers.has(prop.id)?'#b6ffe8':'#dbc1e8';c.lineWidth=2;c.strokeRect(prop.x-13,prop.y-8,26,16);}}
const drawable:{y:number;render:()=>void}[]=m.props.filter(a=>a.kind!=='lever').map(o=>({y:o.y,render:()=>{const index={tree:4,rock:5,bush:6,npc:10,chest:o.open?9:8,door:15,exit:15,relic:11}[o.kind as Exclude<Prop['kind'],'lever'>];if(o.kind==='relic'&&!this.bossDead){c.globalAlpha=.35;this.drawSprite(index,o.x,o.y,44);c.globalAlpha=1;}else this.drawSprite(index,o.x,o.y,o.kind==='tree'?68:o.kind==='door'||o.kind==='exit'?66:o.kind==='npc'?47:42);}}));
for(const e of m.enemies){if(e.hp<=0)continue;drawable.push({y:e.y,render:()=>{if(e.hit>0&&Math.floor(this.elapsed*30)%2===0)c.globalAlpha=.6;const index=e.kind==='slime'?12:e.kind==='bat'?13:14;this.drawSprite(index,e.x,e.y+Math.sin(e.timer*6)*(e.kind==='bat'?4:1),e.kind==='boss'?87:42);c.globalAlpha=1;if(e.hp<e.maxHp||e.kind==='boss'&&this.levers.size===2){c.fillStyle='#1e2429';c.fillRect(e.x-17,e.y-38,34,4);c.fillStyle='#e6aa80';c.fillRect(e.x-17,e.y-38,34*e.hp/e.maxHp,4);}}});}
drawable.push({y:p.y,render:()=>{if(p.hurt>0&&Math.floor(this.elapsed*14)%2===0)c.globalAlpha=.45;const cw=this.assets.hero.width/4,ch=this.assets.hero.height/4,frame=p.attack>0?3:p.walk>0?Math.floor(p.walk*8)%2+1:0;const row=dirs[p.dir].row;c.drawImage(this.assets.hero,frame*cw,row*ch,cw,ch,Math.round(p.x-25),Math.round(p.y-42),50,50);c.globalAlpha=1;if(p.attack>0){const d=dirs[p.dir];c.strokeStyle='#fff1b7';c.lineWidth=4;c.beginPath();c.arc(p.x,p.y-9,35,d.angle-.95,d.angle+.95);c.stroke();c.strokeStyle='#f5cb69';c.lineWidth=2;c.beginPath();c.arc(p.x,p.y-9,43,d.angle-.6,d.angle+.6);c.stroke();}}});drawable.sort((a,b)=>a.y-b.y).forEach(d=>d.render());
for(const s of this.projectiles){c.fillStyle='#e4ad59';c.fillRect(s.x-4,s.y-4,8,8);c.fillStyle='#fff0b1';c.fillRect(s.x-2,s.y-2,4,4);}for(const f of this.particles){c.globalAlpha=Math.min(1,f.life*3);c.fillStyle=f.color;c.fillRect(f.x,f.y,3,3);}c.globalAlpha=1;c.restore();
if(this.zone==='temple'){const gradient=c.createRadialGradient(W/2,H/2,80,W/2,H/2,600);gradient.addColorStop(0,'rgba(5,10,26,0)');gradient.addColorStop(1,'rgba(5,10,26,.5)');c.fillStyle=gradient;c.fillRect(0,0,W,H);}
}
}
