// Alcance do jogador em um mapa: busca em grade de 8px usando a colisão real do motor, incluindo saltos.
export const T=32,STEP=8;
export function reach(g,start){
  const m=g.map,W=m.width*T,H=m.height*T,seen=new Uint8Array((W/STEP)*(H/STEP)),key=(x,y)=>(y/STEP|0)*(W/STEP)+(x/STEP|0);
  const pts=[];const q=[];
  const snap=v=>Math.round(v/STEP)*STEP;
  const push=(x,y)=>{x=snap(x);y=snap(y);if(x<0||y<0||x>=W||y>=H)return;const k=key(x,y);if(seen[k])return;if(g.collides(x,y,9))return;seen[k]=1;q.push([x,y]);};
  // a chegada pode estar sobre um objeto sólido; o motor deixa sair, então semeia os vizinhos
  push(start.x,start.y);if(!q.length)for(let r=STEP;r<=40&&!q.length;r+=STEP)for(const[dx,dy]of[[r,0],[-r,0],[0,r],[0,-r]])push(start.x+dx,start.y+dy);
  const jump=(g.boots?.78:.5)*230;
  while(q.length){const [x,y]=q.pop();pts.push([x,y]);
    for(const[dx,dy]of[[STEP,0],[-STEP,0],[0,STEP],[0,-STEP]]){const nx=x+dx,ny=y+dy;
      // o motor move por eixo: precisa que o ponto intermediário também esteja livre
      if(!g.collides(nx,ny,9))push(nx,ny);}
    for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){let jx=x,jy=y,d=0;while(d<jump){const sx=jx+dx*4,sy=jy+dy*4;if(g.collides(sx,sy,9,true))break;jx=sx;jy=sy;d+=4;}
      if(d>=STEP*2&&!g.collides(jx,jy,9)&&!seen[key(snap(jx),snap(jy))]){if(!g.collides(snap(jx),snap(jy),9))push(jx,jy);}}
  }
  return {pts,has:(x,y,r)=>pts.some(([px,py])=>Math.abs(px-x)<r&&Math.abs(py-y)<r&&Math.hypot(px-x,py-y)<r)};
}
// Linha de tiro reta (como o arco): de algum ponto alcançável, a flecha chega ao alvo?
export function canShoot(g,r,target){
  for(const[px,py]of r.pts){for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){
    const sx=px+dx*16,sy=py+dy*12-7;if(dx&&Math.abs(sy-target.y)>18)continue;if(dy&&Math.abs(sx-target.x)>14)continue;
    if((target.x-sx)*dx+(target.y-sy)*dy<0)continue;
    let x=sx,y=sy,ok=false;for(let t=0;t<.85;t+=1/120){x+=dx*430/120;y+=dy*430/120;
      if(Math.abs(target.x-x)<=14&&Math.abs(target.y-y)<=18){ok=true;break;}
      // outro alvo de flecha no caminho bloqueia
      if(g.map.props.some(q=>q!==target&&['torch','totem','iceSeal','lavaVent'].includes(q.kind)&&Math.abs(q.x-x)<=14&&Math.abs(q.y-y)<=18))break;
      if(g.collides(x,y,2,true))break;}
    if(ok)return [px,py,dx,dy];}}
  return null;
}
