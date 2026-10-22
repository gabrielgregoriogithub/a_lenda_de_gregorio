// Análise de balanceamento: o jogador automático percorre a campanha e, a cada mapa alcançado pela primeira vez,
// registra o equipamento real do herói. Com isso calcula golpes para derrotar cada inimigo e a economia de moedas.
// Rode com: node --import ./tests/register.mjs tests/balance.mjs [saida.json]
import './env.mjs';
import fs from 'node:fs';
import {Adventure,ZONES,shopItems} from '../lib/adventure.ts';
import {makeGame} from './env.mjs';
import {solve} from './solver.mjs';

export function analyze(){
  const fresh=makeGame(Adventure);fresh.start();
  const base=Object.fromEntries(ZONES.map(z=>[z,fresh.maps[z].enemies.map(e=>({id:e.id,kind:e.kind,hp:e.maxHp??e.hp,elite:String(e.id).startsWith('elite-')}))]));
  const g=makeGame(Adventure);const first=new Map();let coinsTotal=0,lastCoins=0;
  const rec=()=>{if(g.coins>lastCoins)coinsTotal+=g.coins-lastCoins;lastCoins=g.coins;if(!first.has(g.zone))first.set(g.zone,{chapter:g.chapter,power:g.swordPower,maxHp:g.player.maxHp,armor:g.armor,coins:g.coins,earned:coinsTotal});};
  const r=solve(g,{log:rec});rec();
  const zones=ZONES.filter(z=>base[z].length).map(z=>{const at=first.get(z)??{chapter:7,power:g.swordPower,maxHp:g.player.maxHp,armor:g.armor};
    const foes=base[z].map(e=>({...e,hits:Math.ceil(e.hp/at.power)}));
    return {zone:z,reached:!!first.get(z),chapter:at.chapter,power:at.power,maxHp:at.maxHp,armor:at.armor,hitsToDie:at.maxHp/(at.armor?.5:1),foes,
      maxHits:Math.max(...foes.map(f=>f.hits)),commonMaxHits:Math.max(0,...foes.filter(f=>!f.elite&&f.hp<20).map(f=>f.hits))};});
  const shop=[...shopItems('shop'),...shopItems('merchant')].map(i=>({id:i.id,price:i.price}));
  return {zones,shop,end:{power:g.swordPower,maxHp:g.player.maxHp,coins:g.coins,earned:coinsTotal,chapter:g.chapter,finished:r?.finished??g.finished}};
}
if(import.meta.url===`file://${process.argv[1]}`){const a=analyze();const out=process.argv[2];if(out)fs.writeFileSync(out,JSON.stringify(a,null,1));
  for(const z of a.zones)console.log(`${z.zone.padEnd(12)} cap ${z.chapter} poder ${z.power} vida ${z.maxHp}${z.armor?' armadura':''} | inimigos ${z.foes.length} | golpes máx ${z.maxHits} (comuns ${z.commonMaxHits})`);
  console.log('fim',JSON.stringify(a.end),'loja',JSON.stringify(a.shop));}
