// Cadastro visual e narrativo dos NPCs importantes.
// Os acessórios são desenhados proceduralmente sobre o atlas do projeto,
// evitando dependências externas em tempo de execução e mantendo a licença da arte existente.
export type NpcVisual='guardian'|'scholar'|'smith'|'sailor'|'mountaineer'|'witch'|'ranger'|'hermit'|'merchant'|'messenger'|'archer'|'miner'|'cartographer'|'jockey'|'traveler'|'fisher';
export type NpcProfile={
  name:string;gender:string;species:string;region:string;profession:string;personality:string;
  visual:NpcVisual;accent:string;secondary:string;tint:string;
};

export const NPC_PROFILES:Record<string,NpcProfile>={
  iris:{name:'Iris',gender:'mulher',species:'humana',region:'Bosque de Elara',profession:'guardiã do vale',personality:'atenta e protetora',visual:'guardian',accent:'#d6a6f0',secondary:'#5b3b78',tint:'none'},
  jockey:{name:'Lia',gender:'mulher',species:'humana',region:'Campos Abertos',profession:'cavaleira do circuito',personality:'competitiva e justa',visual:'jockey',accent:'#e6c55c',secondary:'#347a58',tint:'hue-rotate(25deg) saturate(1.2)'},
  marinheira:{name:'Marina',gender:'mulher',species:'humana costeira',region:'Costa das Conchas',profession:'marinheira',personality:'prática e aventureira',visual:'sailor',accent:'#71d2de',secondary:'#205477',tint:'hue-rotate(185deg) saturate(1.3)'},
  faroleiro:{name:'Nilo',gender:'homem',species:'humano costeiro',region:'Costa das Conchas',profession:'faroleiro',personality:'observador e paciente',visual:'sailor',accent:'#f4c56c',secondary:'#784b36',tint:'hue-rotate(35deg) brightness(1.1)'},
  alpinista:{name:'Téo',gender:'homem',species:'humano das montanhas',region:'Montanhas Geladas',profession:'alpinista',personality:'prudente e resiliente',visual:'mountaineer',accent:'#b9e6f0',secondary:'#426080',tint:'grayscale(.5) brightness(1.2)'},
  ferreiro:{name:'Mauro',gender:'homem',species:'anão vulcânico',region:'Vila de Elara',profession:'ferreiro',personality:'orgulhoso e generoso',visual:'smith',accent:'#e08a4c',secondary:'#49333a',tint:'hue-rotate(-150deg) saturate(.7)'},
  sabio:{name:'Samir',gender:'homem',species:'humano do deserto',region:'Deserto do Sol',profession:'sábio do oásis',personality:'sereno e enigmático',visual:'scholar',accent:'#e5c06c',secondary:'#7d4d38',tint:'hue-rotate(150deg) saturate(.8)'},
  pescadora:{name:'Maia',gender:'mulher',species:'humana ribeirinha',region:'Lago da Lua',profession:'pescadora',personality:'calorosa e curiosa',visual:'fisher',accent:'#8dd8c6',secondary:'#365d72',tint:'hue-rotate(-120deg)'},
  eremita:{name:'Odran',gender:'homem',species:'humano da neve',region:'Montanhas Geladas',profession:'eremita e mestre espadachim',personality:'ranzinza e sábio',visual:'hermit',accent:'#d9f4ff',secondary:'#53647f',tint:'hue-rotate(60deg) brightness(1.1)'},
  guarda:{name:'Sália',gender:'mulher',species:'humana',region:'Ruínas da Lua',profession:'guardiã do templo',personality:'formal e incorruptível',visual:'guardian',accent:'#e8d38a',secondary:'#4a5274',tint:'hue-rotate(-40deg) saturate(.6)'},
  lenhadora:{name:'Brina',gender:'mulher',species:'humana da floresta',region:'Floresta de Outono',profession:'lenhadora e caçadora',personality:'direta e leal',visual:'ranger',accent:'#c77a45',secondary:'#4d693c',tint:'hue-rotate(95deg)'},
  guardia:{name:'Ayla',gender:'mulher',species:'elfa do cristal',region:'Bosque de Cristal Vulcânico',profession:'guardiã do portão',personality:'solene e esperançosa',visual:'guardian',accent:'#f1d27c',secondary:'#5c4b85',tint:'hue-rotate(30deg) brightness(1.2)'},
  astronomo:{name:'Orfeu',gender:'homem',species:'humano astrólogo',region:'Planície das Estrelas',profession:'astrônomo errante',personality:'distraído e brilhante',visual:'scholar',accent:'#bca2f5',secondary:'#343b72',tint:'hue-rotate(260deg)'},
  cartografo:{name:'Cael',gender:'homem',species:'humano costeiro',region:'Fortaleza Esquecida',profession:'cartógrafo das marés',personality:'metódico e inquieto',visual:'cartographer',accent:'#70d3df',secondary:'#3f526c',tint:'hue-rotate(185deg) saturate(1.25)'},
  mercador:{name:'Zaira',gender:'mulher',species:'goblin pacífica',region:'Terras do Norte',profession:'mercadora errante',personality:'persuasiva e bem-humorada',visual:'merchant',accent:'#dfb252',secondary:'#7a4d68',tint:'hue-rotate(40deg) saturate(1.4) brightness(1.05)'},
  viajante:{name:'Daren',gender:'pessoa não binária',species:'humana viajante',region:'Terras do Sul',profession:'guia das estradas',personality:'prática e curiosa',visual:'traveler',accent:'#d8a06e',secondary:'#4b6874',tint:'hue-rotate(320deg) saturate(1.2)'},
  bruxa:{name:'Morga',gender:'mulher',species:'bruxa anfíbia',region:'Pântano Sombrio',profession:'alquimista do pântano',personality:'travessa e cuidadosa',visual:'witch',accent:'#b77cda',secondary:'#3d6d58',tint:'hue-rotate(200deg) brightness(.85)'},
  bento:{name:'Bento',gender:'homem',species:'humano',region:'Gruta do Correio',profession:'carteiro-chefe',personality:'ansioso e prestativo',visual:'messenger',accent:'#f0c45e',secondary:'#7b4c35',tint:'hue-rotate(25deg) saturate(1.1)'},
  torvan:{name:'Torvan',gender:'homem',species:'anão vulcânico',region:'Braseiro Velho',profession:'mestre ferreiro',personality:'teimoso e protetor',visual:'smith',accent:'#ff8750',secondary:'#553536',tint:'hue-rotate(-18deg) saturate(1.5)'},
  aldren:{name:'Aldren',gender:'homem',species:'elfo da floresta',region:'Floresta de Outono',profession:'velho arqueiro',personality:'exigente e honrado',visual:'archer',accent:'#d9b36b',secondary:'#3c6848',tint:'sepia(.35) saturate(1.35) hue-rotate(-18deg)'},
};

export const npcProfile=(id:string)=>NPC_PROFILES[id];
