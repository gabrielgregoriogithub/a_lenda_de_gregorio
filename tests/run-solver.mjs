import './env.mjs';
import {Adventure} from '../lib/adventure.ts';
import {makeGame} from './env.mjs';
import {solve} from './solver.mjs';
const g=makeGame(Adventure);
const r=solve(g,{log:s=>console.log(s)});
console.log('\nFIM: capítulo',g.chapter,'finished',g.finished,'screen',g.screen,'done',r.done);
console.log('zonas alcançadas:',[...r.entries.keys()].join(', '));
for(const z of r.entries.keys()){const m=g.maps[z];const left=m.props.filter(p=>p.kind==='chest'&&!p.open).map(p=>p.id);const alive=m.enemies.filter(e=>e.hp>0&&['boss','golem','colossus','tidewarden','stonebeast'].includes(e.kind)).map(e=>e.id);if(left.length||alive.length)console.log(z,'baús fechados:',left.join(',')||'-','| chefes vivos:',alive.join(',')||'-');}
