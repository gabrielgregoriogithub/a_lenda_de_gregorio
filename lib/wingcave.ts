// Gruta das Botas Aladas: um abismo profundo atravessado por oito plataformas (ímpares fixas, pares móveis).
// As distâncias foram calculadas para o salto comum (0,5 s a 230 px/s ≈ 115 px), sem as Botas Aladas.
import type {GameMap,Prop} from './adventure';

const T=32,center=(n:number)=>n*T+T/2;

export type WingPlatform={n:number;x:number;y:number;w:number;h:number;axis:'fixed'|'x'|'y';amp:number;period:number;phase:number};
export const WING_W=42,WING_H=15;
// linha da travessia: o centro das plataformas fica na junção das linhas 7 e 8
export const WING_ROW=8*T;
// margem inicial termina em x=160 (tile 5); a margem final começa em x=1184 (tile 37)
export const WING_START_EDGE=5*T,WING_END_EDGE=37*T;
export const WING_START={x:center(3),y:WING_ROW};
const SPACING=120,FIRST=WING_START_EDGE+56+32;
// fixas: 1, 3, 5 e 7 · móveis: 2 (vertical), 4 (horizontal), 6 (vertical) e 8 (horizontal)
const MOTION:Record<number,Pick<WingPlatform,'axis'|'amp'|'period'|'phase'>>={
  1:{axis:'fixed',amp:0,period:1,phase:0},
  2:{axis:'y',amp:56,period:3.2,phase:0},
  3:{axis:'fixed',amp:0,period:1,phase:0},
  4:{axis:'x',amp:30,period:2.8,phase:Math.PI/2},
  5:{axis:'fixed',amp:0,period:1,phase:0},
  6:{axis:'y',amp:64,period:3.6,phase:Math.PI},
  7:{axis:'fixed',amp:0,period:1,phase:0},
  8:{axis:'x',amp:28,period:2.4,phase:Math.PI*1.5},
};
export const WING_PLATFORMS:WingPlatform[]=[1,2,3,4,5,6,7,8].map(n=>({n,x:FIRST+(n-1)*SPACING,y:WING_ROW,w:64,h:64,...MOTION[n]}));
// Movimento senoidal contínuo: previsível, sem teleporte e sem invadir as vizinhas.
export function wingPlatformPos(p:WingPlatform,t:number){const o=p.axis==='fixed'?0:p.amp*Math.sin(2*Math.PI*t/p.period+p.phase);return {x:p.x+(p.axis==='x'?o:0),y:p.y+(p.axis==='y'?o:0)};}

export const WING_MURAL='Aviso dos antigos alpinistas: “As Botas Aladas esperam do outro lado do abismo. Oito plataformas formam a ponte: as de número ímpar (1, 3, 5 e 7) nunca se movem; as pares (2, 4, 6 e 8) sobem e descem ou vão e voltam sem parar. Salte (K) de uma em uma, na ordem de 1 a 8, e espere a plataforma móvel chegar à sua linha antes de pular. Quem cai no abismo perde um coração e volta para a entrada.”';

export function makeWingCave():GameMap{
  const W=WING_W,H=WING_H,tiles:number[][]=Array.from({length:H},(_,y)=>Array.from({length:W},(_,x)=>x===0||y===0||x===W-1||y===H-1?4:3));
  for(let y=1;y<H-1;y++)for(let x=5;x<37;x++)tiles[y][x]=6;
  // estalactites e paredes irregulares nas margens deixam a gruta com cara de passagem secreta
  for(const [x,y] of [[1,1],[2,1],[1,2],[1,12],[1,13],[2,13],[40,1],[39,1],[40,2],[40,13],[39,13],[40,12]])tiles[y][x]=4;
  const props:Prop[]=[
    {kind:'stairs',id:'wingcave-exit',x:center(2),y:center(11),solid:true,to:'north',ax:6,ay:32.6,label:'Voltar ao Bosque de Cristal'},
    {kind:'totem',id:'wingcave-mural',x:center(2),y:center(4),solid:true,open:true},
    {kind:'chest',id:'wingcave-boots',x:center(39),y:center(4),solid:true,item:'boots',challenge:'dungeon',challengeText:'Atravesse o abismo saltando nas oito plataformas, de 1 a 8. As ímpares são fixas; as pares se movem. Só quem chega pela plataforma 8 alcança as Botas Aladas.'},
    {kind:'stairs',id:'wingcave-exit-far',x:center(39),y:center(11),solid:true,to:'north',ax:6,ay:32.6,label:'Passagem de volta ao Bosque de Cristal'},
  ];
  return {width:W,height:H,tiles,props,enemies:[]};
}
