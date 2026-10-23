import './env.mjs';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Adventure} from '../lib/adventure.ts';
import {makeGame} from './env.mjs';

const fresh=()=>{const g=makeGame(Adventure);g.cheats.life=true;g.start();g.dismissDialog();return g;};
const prop=(g,z,id)=>g.maps[z].props.find(p=>p.id===id);

test('Pátio Partido: recompensa especial fora da masmorra e migração sem duplicação',()=>{
  const g=fresh();g.zone='world';
  for(const id of ['ruins-court-torch-a','ruins-court-torch-b','ruins-court-torch-c']){const p=prop(g,'world',id);p.open=true;p.solid=false;}
  g.checkBarriers();assert.equal(prop(g,'world','ruins-court-seal'),undefined);
  const guard=g.maps.world.enemies.find(e=>e.id==='ruins-warden');assert.ok(guard);guard.hp=0;
  const heart=prop(g,'world','heart-mountain'),phoenix=prop(g,'world','ruins-phoenix-vault');g.openChest(heart);g.openChest(phoenix);
  assert.equal(heart.open,true);assert.equal(phoenix.open,true);assert.equal(g.phoenix,true);
  const legacy=JSON.parse(g.serialize());legacy.v=10;legacy.maps.fortress.removed=[];legacy.maps.fortress.opened=['fortress-vault'];legacy.maps.world.opened=[];
  const h=fresh();assert.equal(h.load(JSON.stringify(legacy)),true);assert.equal(prop(h,'world','ruins-phoenix-vault').open,true);assert.equal(prop(h,'fortress','fortress-vault'),undefined);
});
