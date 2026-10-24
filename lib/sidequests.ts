// Side quests de relíquias: cada equipamento opcional tem um cenário próprio, um puzzle em sequência e guardiões.
// Nenhuma delas é exigida pela história principal; todas ficam fora das masmorras de capítulo.
import type {Entity,GameMap,Prop,Zone} from './adventure';

type MakeEntity=(id:string,x:number,y:number,kind:Entity['kind'],tint?:string,bossAsset?:number)=>Entity;
const center=(n:number)=>n*32+16;
const floor=(w:number,h:number)=>Array.from({length:h},(_,y)=>Array.from({length:w},(_,x)=>x===0||y===0||x===w-1||y===h-1?4:3));
const fill=(t:number[][],x0:number,y0:number,x1:number,y1:number,v:number)=>{for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)t[y][x]=v;};

export type QuestZone='mailcave'|'theater'|'bellcrypt'|'runetower'|'windgorge'|'wandvault'|'braseiro'|'archergrove';
export const QUEST_ZONES:QuestZone[]=['mailcave','theater','bellcrypt','runetower','windgorge','wandvault','braseiro','archergrove'];
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
  {zone:'mailcave',name:'Gruta do Correio',title:'A Última Entrega do Correio',item:'magnet',itemName:'Anel do Ímã',
    from:'world',door:{id:'coast-mailcave',x:114,y:91,label:'Entrar na Gruta do Correio',minChapter:2},arrive:{x:4,y:14.6},
    where:'na Costa das Conchas, ao sul do farol de Nilo, no canto sudeste do Vale',
    filter:'sepia(.35) hue-rotate(150deg) saturate(1.35) brightness(1.1)',floor:'sepia(.4) hue-rotate(150deg) saturate(1.2) brightness(.6)',
    intro:'Gruta do Correio: a antiga central de entregas parou após um acidente. Fale com Bento e reabra as rotas.',
    seq:{ids:['mail-bell-shell','mail-bell-anchor','mail-bell-lighthouse'],labels:['Concha','Âncora','Farol'],via:['touch','touch','touch']},
    seal:'mail-seal',chest:'mail-magnet',guards:['mailmaster'],
    guardText:'O Mestre das Entregas está descontrolado na central. Reabra a triagem, o carrinho e o estoque antes de enfrentá-lo.',
    mural:{id:'mail-mural',title:'Quadro da Última Entrega',text:'“Toda carta começa na praia, ancora no cais e termina no farol.” Toque os três sinos na ordem Concha → Âncora → Farol. Depois Bento pedirá três tarefas: separar correspondências, conduzir o carrinho e organizar as encomendas. Símbolos, não apenas cores, indicam os destinos.'},
    doneText:'Os três sinos ressoaram! As esteiras antigas começam a se mover.',resetText:'Os sinos se calaram. Recomece pela Concha: Concha → Âncora → Farol.'},
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
  {zone:'windgorge',name:'Desfiladeiro dos Ventos',title:'As Pedras do Vento',item:'wind-blade',itemName:'Corte Magnífico do Ar',
    from:'north',door:{id:'north-windgorge',x:29,y:43,label:'Entrar no Desfiladeiro dos Ventos',minChapter:3},arrive:{x:4,y:14.6},
    where:'no sul do Bosque de Cristal, nas Terras do Norte, a leste da saída para o Vale',
    filter:'hue-rotate(170deg) saturate(.7) brightness(1.2)',floor:'hue-rotate(170deg) saturate(.6) brightness(.55)',
    intro:'Desfiladeiro dos Ventos: as pedras do vento ficam em ilhas sobre o abismo. Use K para saltar.',
    seq:{ids:['gorge-stone-east','gorge-stone-west','gorge-stone-center'],labels:['Leste','Oeste','Centro'],via:['touch','touch','touch']},
    seal:'gorge-seal',chest:'gorge-wind-blade',guards:['gorge-knight','gorge-wolf-a','gorge-wolf-b'],
    guardText:'O cavaleiro e os dois lobos da neve ainda guardam o Corte Magnífico do Ar.',
    mural:{id:'gorge-mural',title:'Marco do Desfiladeiro',text:'“O vento nasce no leste, volta pelo oeste e descansa no centro.” Salte (K) entre as ilhas e toque as pedras na ordem Leste → Oeste → Centro. Nenhum vão é maior que um salto comum; se errar a ordem, as pedras se apagam. Atrás do selo, um cavaleiro e dois lobos da neve guardam o Corte Magnífico do Ar.'},
    doneText:'Leste, Oeste e Centro! O vento abriu o selo do desfiladeiro.',resetText:'O vento dispersou as pedras. Recomece no Leste: Leste → Oeste → Centro.'},
  {zone:'braseiro',name:'Braseiro Velho',title:'O Último Coração das Brasas',item:'amulet',itemName:'Amuleto da Brasa',
    from:'north',door:{id:'north-braseiro',x:32,y:43,label:'Entrar em Braseiro Velho',minChapter:2},arrive:{x:16,y:38},
    where:'nas encostas montanhosas das Terras do Norte, ao sul das Ruínas da Aurora',
    filter:'sepia(.8) saturate(2.3) hue-rotate(-22deg) brightness(1.05)',floor:'sepia(.9) saturate(2) hue-rotate(-22deg) brightness(.45)',
    intro:'Braseiro Velho: a vila não dorme desde que a fornalha subterrânea despertou. Fale com Mestre Torvan.',
    seq:{ids:['braseiro-water','braseiro-animals','braseiro-workshop'],labels:['Poço Bloqueado','Animais Perdidos','Oficina Incendiada'],via:['touch','touch','touch']},
    seal:'braseiro-village-gate',chest:'braseiro-amulet',guards:['varkun'],
    guardText:'Varkun, o Ferreiro Esquecido, protege a câmara do coração. Estabilize a forja e enfrente o autômato.',
    mural:{id:'braseiro-map',title:'Mapa incompleto de Torvan',text:'“A água abre o caminho, os animais lembram a trilha e o fogo revela o metal.” Ajude os três moradores em qualquer ordem. Depois, siga os trilhos perdidos, reacenda a forja e escolha entre libertar as brasas ou selá-las antes de enfrentar Varkun.'},
    doneText:'A vila respira novamente. A chave antiga revela a entrada da Mina das Cinzas.',resetText:'O mecanismo voltou ao repouso. Retome os três socorros da vila.'},
  {zone:'archergrove',name:'Campo do Arqueiro Esquecido',title:'O Legado do Arqueiro Esquecido',item:'bow',itemName:'Arco da Floresta',
    from:'world',door:{id:'world-archergrove',x:72,y:19,label:'Seguir a trilha do Arqueiro Esquecido',minChapter:1},arrive:{x:16,y:22},
    where:'na borda da Floresta de Outono, atrás da trilha de madeira caída',
    filter:'hue-rotate(35deg) saturate(1.1) brightness(1.05)',floor:'hue-rotate(35deg) saturate(.8) brightness(.48)',
    intro:'Campo do Arqueiro Esquecido: Aldren aguarda alguém que mereça seu arco. Leia o marco de madeira.',
       seq:{ids:['archer-explore','archer-puzzle','archer-reflex','archer-final'],labels:['Exploração','Inteligência','Reflexos','Desafio final'],via:['touch','touch','touch','touch']},
    seal:'archer-training-gate',chest:'archer-bow',guards:['archerguardian'],
    guardText:'O Guardião do Bosque roubou o arco de Aldren. Vença as quatro provas e derrote a criatura na clareira.',
    mural:{id:'archer-mural',title:'Marco do Arqueiro',text:'“Um arco não pertence a quem apenas o segura.” Aldren pede quatro provas: siga as marcas de flecha pela trilha, interprete os símbolos, acerte o alvo móvel e complete o desafio final. A prova final exige uma flecha comum; o arco de treinamento estará disponível no campo.'},
    doneText:'As quatro provas reconheceram sua coragem, inteligência e precisão. A clareira do Guardião se abriu.',resetText:'A prova perdeu o ritmo. Recomece pela Exploração e siga até o Desafio final.'},
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
  if(zone==='mailcave'){
    const W=36,H=28,tiles=floor(W,H),props:Prop[]=[],enemies:Entity[]=[];
    for(let x=1;x<W-1;x++){tiles[18][x]=4;tiles[9][x]=4;}
    for(const x of [7,8,27,28]){tiles[18][x]=3;tiles[9][x]=3;}
    props.push({kind:'stairs',id:'mailcave-exit',x:center(2),y:center(26),solid:true,to:'world',ax:114,ay:92,label:'Voltar à Costa das Conchas'});
    props.push({kind:'npc',id:'bento',x:center(18),y:center(26),solid:true});
    props.push({kind:'totem',id:q.mural.id,x:center(5),y:center(26),solid:true,open:true});
    q.seq.ids.forEach((id,i)=>props.push({kind:'totem',id,x:center(9+i*8),y:center(24),solid:true,label:q.seq.labels[i]}));
    props.push({kind:'barrier',id:q.seal,x:center(18),y:center(18),solid:true,by:[...q.seq.ids]});
    props.push({kind:'totem',id:'mail-sort-1',x:center(8),y:center(14),solid:true,label:'Triagem · árvore'});
    props.push({kind:'totem',id:'mail-sort-2',x:center(18),y:center(13),solid:true,label:'Triagem · montanha'});
    props.push({kind:'totem',id:'mail-sort-3',x:center(28),y:center(14),solid:true,label:'Triagem · chama'});
    props.push({kind:'barrier',id:'mail-triage-gate',x:center(18),y:center(9),solid:true,by:['mail-sort-1','mail-sort-2','mail-sort-3']});
    props.push({kind:'totem',id:'mail-cart-a',x:center(7),y:center(6),solid:true,label:'Desvio da praia'});
    props.push({kind:'totem',id:'mail-cart-b',x:center(18),y:center(4),solid:true,label:'Desvio do cais'});
    props.push({kind:'totem',id:'mail-cart-c',x:center(29),y:center(6),solid:true,label:'Desvio do farol'});
    props.push({kind:'barrier',id:'mail-cart-gate',x:center(18),y:center(2),solid:true,by:['mail-cart-a','mail-cart-b','mail-cart-c']});
    props.push({kind:'totem',id:'mail-box-forest',x:center(11),y:center(1),solid:true,label:'Encomenda · floresta'});
    props.push({kind:'totem',id:'mail-box-mountain',x:center(18),y:center(1),solid:true,label:'Encomenda · montanha'});
    props.push({kind:'totem',id:'mail-box-flame',x:center(25),y:center(1),solid:true,label:'Encomenda · brasas'});
    props.push({kind:'chest',id:q.chest,x:center(18),y:center(.5),solid:true,item:q.item,guard:'mailmaster',challenge:'dungeon',challengeText:'A recompensa só pode ser retirada após triagem, carrinho, estoque e três entregas. O Mestre das Entregas protege a central.'});
    enemies.push(entity('mailmaster',18,1.5,'boss','#b08a58',6),entity('mail-crab',10,12,'golem','sepia(.8) saturate(2.5) hue-rotate(-20deg)'),entity('mail-bat-a',6,11,'bat','#b89464'),entity('mail-bat-b',30,11,'bat','#b89464'));
    return {width:W,height:H,tiles,props,enemies};
  }
  if(zone==='archergrove'){
    const W=32,H=26,tiles=floor(W,H),props:Prop[]=[],enemies:Entity[]=[];
       for(let x=1;x<W-1;x++)tiles[17][x]=3;
    props.push({kind:'stairs',id:'archergrove-exit',x:center(2),y:center(24),solid:true,to:'world',ax:72,ay:20,label:'Voltar à Floresta de Outono'});
    props.push({kind:'npc',id:'aldren',x:center(16),y:center(23),solid:true});
    props.push({kind:'totem',id:q.mural.id,x:center(5),y:center(23),solid:true,open:true});
    props.push({kind:'totem',id:'archer-explore',x:center(7),y:center(15),solid:true,label:'Trilha escondida'});
    props.push({kind:'totem',id:'archer-puzzle',x:center(16),y:center(13),solid:true,label:'Símbolos antigos'});
       props.push({kind:'totem',id:'archer-reflex',x:center(25),y:center(15),solid:true,label:'Alvo móvel'});
       props.push({kind:'totem',id:'archer-final',x:center(16),y:center(7),solid:true,label:'Alvo central'});
    props.push({kind:'barrier',id:q.seal,x:center(16),y:center(17),solid:true,by:[...q.seq.ids]});
    props.push({kind:'chest',id:q.chest,x:center(16),y:center(2),solid:true,item:q.item,guard:'archerguardian',challenge:'dungeon',challengeText:'O Arco da Floresta será entregue apenas após as quatro provas e a derrota do Guardião do Bosque.'});
    const guardian=entity('archerguardian',16,5,'boss','#6e9a52',7);guardian.hp=guardian.maxHp=24;
    enemies.push(guardian,entity('archer-forest-wolf',8,10,'frostwolf','#9acb73'),entity('archer-forest-wisp',24,10,'wisp','#c8f09a'));
    return {width:W,height:H,tiles,props,enemies};
  }
  if(zone==='braseiro'){
    const W=32,H=42,tiles=floor(W,H),props:Prop[]=[],enemies:Entity[]=[];
    for(let x=1;x<W-1;x++){tiles[14][x]=4;tiles[27][x]=4;}
    for(const x of [9,10,21,22]){tiles[14][x]=3;tiles[27][x]=3;}
    // Braseiro Velho agora é uma arena aberta: sem totens ou barreiras visuais, apenas o caminho até Varkun.
    for(let x=1;x<W-1;x++){tiles[14][x]=3;tiles[27][x]=3;}
    props.push({kind:'stairs',id:'braseiro-exit',x:center(2),y:center(39),solid:true,to:'north',ax:32,ay:44,label:'Voltar às Terras do Norte'});
    props.push({kind:'totem',id:'braseiro-map',x:center(5),y:center(39),solid:true,open:true});
    props.push(...q.seq.ids.map((id,i)=>({kind:'totem',id,x:center(8+i*8),y:center(37),solid:true,label:q.seq.labels[i]} as Prop)));
    props.push({kind:'barrier',id:q.seal,x:center(16),y:center(14),solid:true,by:[...q.seq.ids]});
    props.push({kind:'totem',id:'braseiro-rail-a',x:center(7),y:center(23),solid:true,label:'Trilho leste'});
    props.push({kind:'totem',id:'braseiro-rail-b',x:center(16),y:center(19),solid:true,label:'Trilho central'});
    props.push({kind:'totem',id:'braseiro-rail-c',x:center(25),y:center(23),solid:true,label:'Trilho oeste'});
    props.push({kind:'barrier',id:'braseiro-mine-gate',x:center(16),y:center(27),solid:true,by:['braseiro-rail-a','braseiro-rail-b','braseiro-rail-c']});
    props.push({kind:'totem',id:'braseiro-heat',x:center(8),y:center(9),solid:true,label:'Fole'});
    props.push({kind:'totem',id:'braseiro-hammer',x:center(16),y:center(7),solid:true,label:'Martelo'});
    props.push({kind:'totem',id:'braseiro-cool',x:center(24),y:center(9),solid:true,label:'Resfriamento'});
    props.push({kind:'barrier',id:'braseiro-forge-gate',x:center(16),y:center(3),solid:true,by:['braseiro-heat','braseiro-hammer','braseiro-cool']});
    props.push({kind:'totem',id:'braseiro-choice-release',x:center(11),y:center(2),solid:true,label:'Libertar as brasas'});
    props.push({kind:'totem',id:'braseiro-choice-seal',x:center(21),y:center(2),solid:true,label:'Selar a fornalha'});
    props.push({kind:'chest',id:q.chest,x:center(16),y:center(1.8),solid:true,item:q.item,guard:'varkun',challenge:'dungeon',challengeText:'O altar dourado só responde depois dos três socorros, dos trilhos, da forja, da escolha final e da queda de Varkun.'});
    enemies.push(entity('varkun',16,2.5,'boss','#a87345',5));
    return {width:W,height:H,tiles,props:props.filter(p=>p.kind!=='totem'&&p.kind!=='barrier'),enemies};
  }
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
