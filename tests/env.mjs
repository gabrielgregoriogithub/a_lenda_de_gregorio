// Ambiente mínimo de navegador para instanciar o motor sem DOM: canvas e contexto 2D aceitam qualquer chamada.
const stub=()=>new Proxy(function(){},{get:(t,k)=>k==='filter'?'none':k===Symbol.toPrimitive?()=>0:k==='width'||k==='height'?64:k==='measureText'?()=>({width:10}):stub(),set:()=>true,apply:()=>stub()});
const canvas=()=>{const c={width:64,height:64,style:{},getContext:()=>stub()};return c;};
globalThis.document={createElement:()=>canvas()};
globalThis.requestAnimationFrame=()=>0;globalThis.cancelAnimationFrame=()=>{};
export function makeGame(Adventure){
  const img={width:256,height:256,complete:true};
  const assets={hero:img,atlas:img,spinCharge:img,run:img,bow:img,wand:img,bosses:img};
  const snaps=[];const g=new Adventure(canvas(),assets,s=>snaps.push(s));g.draw=()=>{};
  return g;
}
