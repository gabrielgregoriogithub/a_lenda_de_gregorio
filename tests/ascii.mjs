import './env.mjs';
import {Adventure} from '../lib/adventure.ts';
import {makeGame} from './env.mjs';
import {reach} from './reach.mjs';
const [zone,ax,ay,...flags]=process.argv.slice(2);
const g=makeGame(Adventure);for(const f of flags)g[f]=true;g.zone=zone;
const r=reach(g,{x:+ax*32+16,y:+ay*32+16});const m=g.map;
const ch={0:'.',1:'=',2:'~',3:'.',4:'#',5:'b',6:' ',7:'^'};
const rows=[];for(let y=0;y<m.height;y++){let s='';for(let x=0;x<m.width;x++){const pr=m.props.find(p=>Math.floor(p.x/32)===x&&Math.floor(p.y/32)===y);const hit=r.pts.some(([px,py])=>Math.floor(px/32)===x&&Math.floor(py/32)===y);let c=pr?({chest:'C',stairs:'S',exit:'S',barrier:'B',torch:'t',totem:'o',lever:'L',relic:'R',iceSeal:'i',lavaVent:'v',rock:'r',tree:'T',npc:'N',door:'D'}[pr.kind]??'?'):ch[m.tiles[y][x]];if(hit&&c==='.')c='+';else if(hit&&c==='^')c='%';else if(hit&&c==='~')c='w';s+=c;}rows.push(String(y).padStart(2)+' '+s);}
console.log('   '+[...Array(m.width).keys()].map(i=>i%10).join(''));console.log(rows.join('\n'));
