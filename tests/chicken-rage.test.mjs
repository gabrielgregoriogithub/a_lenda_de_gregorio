import './env.mjs';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Adventure} from '../lib/adventure.ts';
import {makeGame} from './env.mjs';

const fresh=()=>{const g=makeGame(Adventure);g.cheats.life=true;g.start();g.dismissDialog();return g;};

test('galinhas são invencíveis e reagem a dez golpes em três minutos',()=>{
  const g=fresh(),A=g.ambient;
  A.zone=g.zone;
  const chicken={id:1,sp:'chicken',x:g.player.x+18,y:g.player.y,z:0,vx:0,vy:0,vz:0,f:1,state:'idle',t:1,ph:0,tx:g.player.x+18,ty:g.player.y,alpha:1,think:0,ax:g.player.x,ay:g.player.y,size:1};
  A.critters=[chicken];
  for(let i=0;i<9;i++)assert.equal(A.strikeChickens(g.player.x,g.player.y,1,0,62).triggered,false);
  assert.equal(A.chickenHits,9);
  const result=A.strikeChickens(g.player.x,g.player.y,1,0,62);
  assert.equal(result.triggered,true);
  assert.equal(A.chickenRage,30);
  assert.equal(chicken.rage,true);
  assert.equal(A.strikeChickens(g.player.x,g.player.y,1,0,62).hits,0,'golpes não acumulam durante a retaliação');
  A.updateCritters(g,30.1,0);
  assert.equal(A.chickenRage,0);
  assert.equal(chicken.rage,false);
});

test('o golpe real do jogador alcança a galinha e mostra o progresso',()=>{
  const g=fresh();
  g.map.enemies.forEach(e=>{e.hp=0;});
  g.player.dir='right';
  const chicken={id:2,sp:'chicken',x:g.player.x+24,y:g.player.y,z:0,vx:0,vy:0,vz:0,f:1,state:'idle',t:1,ph:0,tx:g.player.x+24,ty:g.player.y,alpha:0,think:0,ax:g.player.x,ay:g.player.y,size:1};
  g.ambient.critters=[chicken];
  g.attack();
  assert.equal(g.ambient.chickenHits,1);
  assert.match(g.notice,/Galinha atingida/);
});
