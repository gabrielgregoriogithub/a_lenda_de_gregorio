// Side quests de relíquias: cada equipamento opcional tem um cenário próprio, um puzzle em sequência e guardiões.
// Nenhuma delas é exigida pela história principal; todas ficam fora das masmorras de capítulo.
import type {Entity,GameMap,Prop,Zone} from './adventure';

type MakeEntity=(id:string,x:number,y:number,kind:Entity['kind'],tint?:string,bossAsset?:number)=>Entity;
const center=(n:number)=>n*32+16;
const floor=(w:number,h:number)=>Array.from({length:h},(_,y)=>Array.from({length:w},(_,x)=>x===0||y===0||x===w-1||y===h-1?4:3));
const fill=(t:number[][],x0:number,y0:number,x1:number,y1:number,v:number)=>{for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)t[y][x]=v;};

export type QuestZone='mailcave'|'theater'|'bellcrypt'|'runetower'|'windgorge'|'wandvault';
export const QUEST_ZONES:QuestZone[]=['mailcave','theater','bellcrypt','runetower','windgorge','wandvault'];
// Como cada marco da sequência é ativado: tocando (E), com um tipo de flecha ou com uma varinha.
export type SeqVia='touch'|'normal'|'fire'|'ice'|'light'|'lightning'|'missile'|'repulse';
export const VIA_TEXT:Record<SeqVia,string>={touch:'toque (E)',normal:'uma flecha comum',fire:'uma Flecha de Fogo',ice:'uma Flecha de Gelo',light:'uma Flecha de Luz',lightning:'o relâmpago da Varinha do Relâmpago',missile:'a Varinha Míssil',repulse:'o raio da Varinha da Repulsão'};
export const VIA_COLOR:Record<SeqVia,string>={touch:'#f0c878',normal:'#e9dcc0',fire:'#ff9a3c',ice:'#9fe6ff',light:'#fff3a0',lightning:'#ffe56b',missile:'#ff9d66',repulse:'#b27cff'};

export type QuestDef={
  zone:QuestZone;name:string;title:string;item:NonNullable<Prop['item']>;itemName:string;
  // entrada no mundo aberto e chegada dentro do cenário
  from:'world'|'north'|'south';door:{id:string;x:number;y:number;label:string;minChapter?:number;needs?:string[]};arrive:{x:number;y:number};
  where:string;filter:string;floor:string;intro:string;
  seq:{ids:string[];labels:string[];via:SeqVia[]};seal:string;chest:string;guards:string[];guardText:string;
  mural:{id:string;title:string;text:string};doneText:string;resetText:string;
};

export const QUESTS:QuestDef[]=[
  {zone:'mailcave',name:'Gruta do Correio',title:'Correio das Moedas',item:'magnet',itemName:'Anel do Ímã',
    from:'world',door:{id:'coast-mailcave',x:114,y:91,label:'Entrar na Gruta do Correio',minChapter:2},arrive:{x:4,y:14.6},
    where:'na Costa das Conchas, ao sul do farol de Nilo, no canto sudeste do Vale',
    filter:'sepia(.35) hue-rotate(150deg) saturate(1.35) brightness(1.1)',floor:'sepia(.4) hue-rotate(150deg) saturate(1.2) brightness(.6)',
    intro:'Gruta do Correio: o Caranguejo-Correio escondeu as cargas de cristais. Leia o mural junto da entrada.',
    seq:{ids:['mail-bell-shell','mail-bell-anchor','mail-bell-lighthouse'],labels:['Concha','Âncora','Farol'],via:['touch','touch','touch']},
    seal:'mail-seal',chest:'mail-magnet',guards:['mail-crab','mail-bat-a','mail-bat-b'],
    guardText:'O Caranguejo-Correio e seus morcegos ainda vigiam o cofre. Derrote os três para abrir o Anel do Ímã.',
    mural:{id:'mail-mural',title:'Quadro do Correio das Moedas',text:'“Toda carta começa na praia, ancora no cais e termina no farol.” Toque os três sinos na ordem Concha → Âncora → Farol. Os sinos estão espalhados e fora de ordem pela gruta: leia o símbolo de cada um. Se errar, eles se calam e você recomeça. Depois, vença o Caranguejo-Correio e os dois morcegos do salão norte.'},
    doneText:'Os três sinos ressoaram! O portão de cobre do salão norte se abriu.',resetText:'Os sinos se calaram. Recomece pela Concha: Concha → Âncora → Farol.'},
  {zone:'theater',name:'Teatro das Três Sombras',title:'O Ensaio das Sombras',item:'cloak',itemName:'Manto do Eco',
    from:'world',door:{id:'autumn-theater',x:93,y:13,label:'Entrar no Teatro das Três Sombras',minChapter:3},arrive:{x:4,y:14.6},
    where:'no extremo leste da Floresta de Outono, a nordeste do Vale',
    filter:'sepia(.5) saturate(1.6) hue-rotate(-30deg) brightness(.95)',floor:'sepia(.6) saturate(1.3) hue-rotate(-30deg) brightness(.48)',
    intro:'Teatro das Três Sombras: “a sombra atua antes do ator”. Leia o cartaz do palco.',
    seq:{ids:['theater-mark-pulse','theater-mark-pause','theater-mark-return'],labels:['Pulso','Pausa','Retorno'],via:['touch','touch','touch']},
    seal:'theater-curtain',chest:'theater-cloak',guards:['theater-master','theater-spitter-a','theater-spitter-b'],
    guardText:'O Mestre de Cena e os dois atiradores ainda ocupam o palco. Derrote os três; desvie dos projéteis que eles disparam.',
    mural:{id:'theater-mural',title:'Cartaz do Teatro',text:'“O eco não nasce do primeiro golpe, mas da resposta.” As marcas do palco contam a peça: Pulso → Pausa → Retorno. Toque as três nessa ordem para erguer a cortina. Errar apaga as marcas, mas não fecha o teatro. No palco, o Mestre de Cena e dois atiradores lançam projéteis: esquive, aproxime-se nas pausas e só então abra o baú do Manto do Eco.'},
    doneText:'Pulso, Pausa e Retorno! A cortina subiu e o palco está aberto.',resetText:'A peça recomeçou do início. Siga: Pulso → Pausa → Retorno.'},
  {zone:'bellcrypt',name:'Cripta do Sino',title:'O Julgamento do Sino',item:'armor',itemName:'Armadura de Granito',
    from:'world',door:{id:'snow-bellcrypt',x:24,y:19,label:'Descer à Cripta do Sino',minChapter:4},arrive:{x:4,y:14.6},
    where:'na encosta sul das Montanhas Geladas, logo a sudeste do Eremita da Neve',
    filter:'grayscale(.4) hue-rotate(190deg) saturate(.8) brightness(1.15)',floor:'grayscale(.5) hue-rotate(190deg) brightness(.52)',
    intro:'Cripta do Sino: a armadura só reconhece quem faz a montanha responder sem quebrar o silêncio.',
    seq:{ids:['crypt-bell-low','crypt-bell-high','crypt-bell-mid'],labels:['Grave','Agudo','Médio'],via:['touch','touch','touch']},
    seal:'crypt-gate',chest:'crypt-armor',guards:['crypt-warden','crypt-sentinel-a','crypt-sentinel-b'],
    guardText:'O Julgamento do Sino continua: derrote o Guardião do Sino e as duas Sentinelas de Granito.',
    mural:{id:'crypt-mural',title:'Inscrição da Cripta',text:'“A montanha fala de baixo para cima e responde no meio.” Toque os sinos na ordem Grave → Agudo → Médio. Cada sino mostra o próprio tom; eles não estão em fila. Se errar, a cripta silencia e você recomeça. Atrás do portão, o Guardião do Sino avança depois de um toque grave: esquive da investida e golpeie quando ele parar. Duas Sentinelas de Granito também guardam a Armadura.'},
    doneText:'Grave, Agudo e Médio ecoaram juntos! O portão da cripta se abriu.',resetText:'A cripta silenciou. Recomece pelo sino Grave: Grave → Agudo → Médio.'},
  {zone:'runetower',name:'Torre Rúnica',title:'A Prova dos Quatro Elementos',item:'rune-bow',itemName:'Arco Rúnico',
    from:'south',door:{id:'south-runetower',x:6,y:45,label:'Subir à Torre Rúnica',minChapter:4,needs:['fire','ice','light']},arrive:{x:4,y:14.6},
    where:'no extremo oeste dos Campos Abertos, no sudoeste das Terras do Sul (exige Flechas de Fogo, Gelo e Luz)',
    filter:'hue-rotate(250deg) saturate(1.4) brightness(.95)',floor:'hue-rotate(250deg) saturate(1.2) brightness(.45)',
    intro:'Torre Rúnica: quatro runas só respondem à flecha certa, na ordem certa. Leia o pergaminho da entrada.',
    seq:{ids:['tower-rune-ember','tower-rune-frost','tower-rune-dawn','tower-rune-echo'],labels:['Brasa','Geada','Aurora','Eco'],via:['fire','ice','light','normal']},
    seal:'tower-seal',chest:'tower-rune-bow',guards:['tower-knight','tower-salamander','tower-wisp-a','tower-wisp-b'],
    guardText:'O cavaleiro de escudo, a salamandra e os dois fogos-fátuos ainda guardam o Arco Rúnico. Fogo-fátuo transparente só sente a luz.',
    mural:{id:'tower-mural',title:'Pergaminho da Torre',text:'“O arco desperta quando a brasa derrete a geada, a aurora ilumina o gelo e o eco responde por último.” Acerte as runas na ordem Brasa → Geada → Aurora → Eco: a Brasa com Flecha de Fogo, a Geada com Flecha de Gelo, a Aurora com Flecha de Luz e o Eco com uma flecha comum (T troca a flecha). Atire de baixo para cima, de frente para cada nicho. Cada runa só aceita a sua flecha; a ordem errada apaga todas. No alto da torre, um cavaleiro de escudo, uma salamandra e dois fogos-fátuos protegem o Arco Rúnico.'},
    doneText:'Brasa, Geada, Aurora e Eco! O selo da torre se partiu.',resetText:'As runas se apagaram. Recomece pela Brasa: Fogo → Gelo → Luz → flecha comum.'},
  {zone:'windgorge',name:'Desfiladeiro dos Ventos',title:'As Pedras do Vento',item:'wind-blade',itemName:'Lâmina do Vento',
    from:'north',door:{id:'north-windgorge',x:29,y:43,label:'Entrar no Desfiladeiro dos Ventos',minChapter:3},arrive:{x:4,y:14.6},
    where:'no sul do Bosque de Cristal, nas Terras do Norte, a leste da saída para o Vale',
    filter:'hue-rotate(170deg) saturate(.7) brightness(1.2)',floor:'hue-rotate(170deg) saturate(.6) brightness(.55)',
    intro:'Desfiladeiro dos Ventos: as pedras do vento ficam em ilhas sobre o abismo. Use K para saltar.',
    seq:{ids:['gorge-stone-east','gorge-stone-west','gorge-stone-center'],labels:['Leste','Oeste','Centro'],via:['touch','touch','touch']},
    seal:'gorge-seal',chest:'gorge-wind-blade',guards:['gorge-knight','gorge-wolf-a','gorge-wolf-b'],
    guardText:'O cavaleiro e os dois lobos da neve ainda guardam a Lâmina do Vento.',
    mural:{id:'gorge-mural',title:'Marco do Desfiladeiro',text:'“O vento nasce no leste, volta pelo oeste e descansa no centro.” Salte (K) entre as ilhas e toque as pedras na ordem Leste → Oeste → Centro. Nenhum vão é maior que um salto comum; se errar a ordem, as pedras se apagam. Atrás do selo, um cavaleiro e dois lobos da neve guardam a Lâmina do Vento.'},
    doneText:'Leste, Oeste e Centro! O vento abriu o selo do desfiladeiro.',resetText:'O vento dispersou as pedras. Recomece no Leste: Leste → Oeste → Centro.'},
  {zone:'wandvault',name:'Cofre das Varinhas',title:'O Teste das Três Varinhas',item:'wand-master',itemName:'Varinha das Varinhas',
    from:'south',door:{id:'south-wandvault',x:70,y:42,label:'Entrar no Cofre das Varinhas',minChapter:6,needs:['wand-lightning','wand-repulse','wand-missile']},arrive:{x:4,y:14.6},
    where:'no Deserto das Tempestades, no sudeste das Terras do Sul (exige as três varinhas)',
    filter:'sepia(.6) saturate(1.8) hue-rotate(5deg) brightness(1.05)',floor:'sepia(.7) saturate(1.5) hue-rotate(5deg) brightness(.5)',
    intro:'Cofre das Varinhas: três selos, cada um desperta com uma varinha diferente.',
    seq:{ids:['vault-seal-lightning','vault-seal-missile','vault-seal-repulse'],labels:['Relâmpago','Míssil','Repulsão'],via:['lightning','missile','repulse']},
    seal:'vault-gate',chest:'vault-wand-master',guards:['vault-worm','vault-shade-a','vault-shade-b'],
    guardText:'O Verme das Areias e as duas sombras ainda guardam a Varinha das Varinhas.',
    mural:{id:'vault-mural',title:'Placa do Cofre',text:'“Primeiro o trovão, depois a caçada, por fim o empurrão.” Desperte os selos na ordem Relâmpago → Míssil → Repulsão: o primeiro com a Varinha do Relâmpago, o segundo com a Varinha Míssil e o terceiro com o raio da Repulsão. Troque de varinha com Y e dispare com V. A ordem errada apaga os selos. No cofre, o Verme das Areias e duas sombras guardam a Varinha das Varinhas.'},
    doneText:'Relâmpago, Míssil e Repulsão! O portão do cofre se abriu.',resetText:'Os selos rejeitaram a ordem. Recomece: Relâmpago → Míssil → Repulsão.'},
];
export const QUEST_BY_ZONE=Object.fromEntries(QUESTS.map(q=>[q.zone,q])) as Record<QuestZone,QuestDef>;
export const QUEST_BY_CHEST:Record<string,QuestDef>=Object.fromEntries(QUESTS.map(q=>[q.chest,q]));
export const QUEST_SEQ_IDS=new Set(QUESTS.flatMap(q=>q.seq.ids));
export const QUEST_MURALS=new Set(QUESTS.map(q=>q.mural.id));
export function questOfProp(id:string){return QUESTS.find(q=>q.seq.ids.includes(id));}
export const isQuestZone=(z:string):z is QuestZone=>(QUEST_ZONES as string[]).includes(z);

// Cenário padrão: chegada no sudoeste, antecâmara do puzzle ao sul, muralha com selo e o salão do guardião ao norte.
function room(q:QuestDef,entity:MakeEntity,extra:(t:number[][],props:Prop[],enemies:Entity[])=>void,marks:[number,number][],gate:number){
  const W=26,H=18,tiles=floor(W,H),props:Prop[]=[],enemies:Entity[]=[];
  for(let x=1;x<W-1;x++)if(x!==gate)tiles[8][x]=4;
  props.push({kind:'stairs',id:`${q.zone}-exit`,x:center(2),y:center(15),solid:true,to:q.from,ax:q.door.x,ay:q.door.y+1.6,label:`Voltar: ${q.from==='world'?'Vale de Elara':q.from==='north'?'Terras do Norte':'Terras do Sul'}`});
  props.push({kind:'totem',id:q.mural.id,x:center(6),y:center(16),solid:true,open:true});
  q.seq.ids.forEach((id,i)=>props.push({kind:'totem',id,x:center(marks[i][0]),y:center(marks[i][1]),solid:true,label:q.seq.labels[i]}));
  props.push({kind:'barrier',id:q.seal,x:center(gate),y:center(8),solid:true,by:[...q.seq.ids]});
  props.push({kind:'chest',id:q.chest,x:center(13),y:center(2),solid:true,item:q.item,guard:q.guards[0],challenge:'dungeon',challengeText:`${q.title}: ${q.mural.text}`});
  extra(tiles,props,enemies);
  return {width:W,height:H,tiles,props,enemies} as GameMap;
}

export function makeQuestMap(zone:QuestZone,entity:MakeEntity):GameMap{
  const q=QUEST_BY_ZONE[zone];
  if(zone==='mailcave')return room(q,entity,(t,props,en)=>{
    fill(t,9,10,11,11,2);fill(t,17,13,19,14,2);fill(t,3,2,5,4,2);fill(t,21,2,23,4,2);
    props.push({kind:'chest',id:'mail-crystals',x:center(23),y:center(16),solid:true,item:'crystals'});
    const copper='sepia(.8) saturate(2.5) hue-rotate(-20deg) brightness(1.05)';
    en.push(entity('mail-crab',13,4,'golem',copper),entity('mail-bat-a',7,5,'bat',copper),entity('mail-bat-b',19,5,'bat',copper),entity('mail-slime',15,12,'crab',copper));
  },[[20,15],[5,11],[13,13]],13);
  if(zone==='theater')return room(q,entity,(t,props,en)=>{
    for(let x=4;x<=22;x+=6){t[4][x]=4;t[5][x]=4;}fill(t,10,11,11,12,4);fill(t,16,11,17,12,4);
    props.push({kind:'chest',id:'theater-potion',x:center(23),y:center(10),solid:true,item:'potion'});
    const shadow='grayscale(.6) brightness(.7) contrast(1.3)';
    en.push(entity('theater-master',13,4,'shade',shadow),entity('theater-spitter-a',6,2,'spitter',shadow),entity('theater-spitter-b',20,2,'spitter',shadow),entity('theater-wisp',14,14,'wisp','hue-rotate(20deg) brightness(1.4)'));
  },[[20,13],[8,10],[13,15]],13);
  if(zone==='bellcrypt')return room(q,entity,(t,props,en)=>{
    for(const x of [5,9,17,21]){t[3][x]=4;t[6][x]=4;}fill(t,11,11,11,13,4);fill(t,15,11,15,13,4);
    props.push({kind:'chest',id:'crypt-potion',x:center(23),y:center(10),solid:true,item:'potion'});
    const granite='grayscale(.85) brightness(1.2) contrast(1.15)';
    en.push(entity('crypt-warden',13,4,'knight',granite),entity('crypt-sentinel-a',7,5,'shieldknight',granite),entity('crypt-sentinel-b',19,5,'shieldknight',granite),entity('crypt-wolf',20,12,'frostwolf'));
  },[[17,15],[8,11],[22,12]],13);
  if(zone==='runetower')return room(q,entity,(t,props,en)=>{
    // as runas ficam em nichos ao norte da antecâmara; atire de baixo para cima
    for(const x of [7,8,12,13,17,18])t[10][x]=2;
    props.push({kind:'chest',id:'tower-crystals',x:center(23),y:center(16),solid:true,item:'crystals'});
    en.push(entity('tower-knight',13,4,'shieldknight','hue-rotate(250deg) saturate(1.2) brightness(1.2)'),entity('tower-salamander',7,4,'salamander'),entity('tower-wisp-a',18,3,'wisp','hue-rotate(260deg) saturate(1.5) brightness(1.6)'),entity('tower-wisp-b',9,3,'wisp','hue-rotate(260deg) saturate(1.5) brightness(1.6)'));
  },[[10,10],[15,10],[20,10],[5,10]],23);
  if(zone==='windgorge')return room(q,entity,(t,props,en)=>{
    // abismo com três ilhas: cada vão tem dois tiles, menor que um salto comum
    fill(t,8,9,24,16,6);fill(t,10,10,13,13,3);fill(t,16,10,19,13,3);fill(t,22,10,24,13,3);
    props.push({kind:'chest',id:'gorge-potion',x:center(23),y:center(2),solid:true,item:'potion'});
    en.push(entity('gorge-knight',13,4,'knight','hue-rotate(170deg) brightness(1.3)'),entity('gorge-wolf-a',7,4,'frostwolf'),entity('gorge-wolf-b',19,4,'frostwolf'));
  },[[23,10],[11,10],[17,10]],5);
  return room(q,entity,(t,props,en)=>{
    fill(t,3,10,4,12,4);fill(t,21,10,22,12,4);
    props.push({kind:'chest',id:'vault-crystals',x:center(23),y:center(16),solid:true,item:'crystals'});
    en.push(entity('vault-worm',13,4,'sandworm'),entity('vault-shade-a',7,4,'shade'),entity('vault-shade-b',19,4,'shade'));
  },[[7,10],[13,12],[19,14]],13);
}

// Portas no mundo aberto (Vale, Norte e Sul) para cada side quest.
export function questDoors(from:'world'|'north'|'south'):Prop[]{
  return QUESTS.filter(q=>q.from===from).map(q=>({kind:'stairs',id:q.door.id,x:center(q.door.x),y:center(q.door.y),solid:true,to:q.zone as Zone,ax:q.arrive.x,ay:q.arrive.y,label:q.door.label,minChapter:q.door.minChapter,needs:q.door.needs} as Prop));
}
