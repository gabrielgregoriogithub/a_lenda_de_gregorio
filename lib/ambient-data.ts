// Configuração do mundo vivo: cada bioma (e cada interior) tem vento, clima, fauna, partículas, sons e eventos próprios.
// Um cenário novo recebe tudo isso só ganhando uma entrada aqui (ou usando um bioma existente).
import type {Biome} from './world';

export type WeatherKind='clear'|'drizzle'|'rain'|'storm'|'snow'|'blizzard'|'dust'|'sandstorm'|'ash'|'fog'|'spores'|'embers'|'drips'|'bubbles'|'gale';
export type Species='rabbit'|'squirrel'|'deer'|'fox'|'butterfly'|'songbird'|'chicken'|'sheep'|'cow'|'horse'|'hare'|'bee'|'toucan'|'macaw'|'monkey'|'frog'|'firefly'|'lizard'|'scorpion'|'beetle'|'vulture'|'whitehare'|'arcticfox'|'owl'|'mountainbird'|'dragonfly'|'fish'|'heron'|'firelizard'|'embermoth'|'bat'|'crow'|'moth'|'duck'|'turtle'|'seagull'|'crystalmoth';
export type Move='hop'|'walk'|'climb'|'perch'|'flutter'|'swim'|'fly'|'wade';
export type Call='bird'|'cricket'|'frog'|'crow'|'owl'|'gull'|'drip'|'bat'|'bubble'|'creak'|'insect'|'cluck'|'macaw'|'howl';
export type EventKind='flock'|'chase'|'butterflies'|'whirlwind'|'gust'|'shootingstar'|'fireflies'|'drink'|'dive'|'shadow'|'bats'|'smoke'|'tremor';

export type SpeciesDef={move:Move;speed:number;flee:number;size:number;night?:'only'|'never';water?:boolean;flock?:number};
export const SPECIES:Record<Species,SpeciesDef>={
  rabbit:{move:'hop',speed:46,flee:90,size:1},hare:{move:'hop',speed:58,flee:110,size:1.1},whitehare:{move:'hop',speed:56,flee:100,size:1.1},
  squirrel:{move:'climb',speed:52,flee:80,size:.9},deer:{move:'walk',speed:30,flee:140,size:1.8},fox:{move:'walk',speed:44,flee:120,size:1.3},arcticfox:{move:'walk',speed:44,flee:120,size:1.3},
  sheep:{move:'walk',speed:16,flee:60,size:1.5},cow:{move:'walk',speed:12,flee:45,size:2},horse:{move:'walk',speed:34,flee:100,size:1.7},chicken:{move:'walk',speed:30,flee:70,size:1},
  monkey:{move:'climb',speed:50,flee:90,size:1.2},frog:{move:'hop',speed:34,flee:60,size:.8},lizard:{move:'walk',speed:58,flee:80,size:.9},firelizard:{move:'walk',speed:54,flee:80,size:1},
  scorpion:{move:'walk',speed:26,flee:55,size:.9},beetle:{move:'walk',speed:14,flee:30,size:.7},turtle:{move:'swim',speed:12,flee:50,size:1.2,water:true},
  fish:{move:'swim',speed:24,flee:70,size:1,water:true},duck:{move:'swim',speed:20,flee:90,size:1.1,water:true},heron:{move:'wade',speed:16,flee:120,size:1.15},
  songbird:{move:'perch',speed:120,flee:80,size:1},mountainbird:{move:'perch',speed:130,flee:90,size:1},toucan:{move:'perch',speed:100,flee:90,size:1.3},macaw:{move:'perch',speed:110,flee:90,size:1.4},
  crow:{move:'perch',speed:110,flee:100,size:1.2},owl:{move:'perch',speed:90,flee:110,size:1.3,night:'only'},seagull:{move:'fly',speed:80,flee:0,size:1.3},vulture:{move:'fly',speed:46,flee:0,size:1.8},
  bat:{move:'fly',speed:110,flee:0,size:1,night:'only'},
  butterfly:{move:'flutter',speed:40,flee:60,size:1,night:'never'},bee:{move:'flutter',speed:50,flee:40,size:.7,night:'never'},dragonfly:{move:'flutter',speed:90,flee:60,size:1,night:'never'},
  moth:{move:'flutter',speed:34,flee:50,size:.9},firefly:{move:'flutter',speed:22,flee:40,size:.6,night:'only'},embermoth:{move:'flutter',speed:36,flee:50,size:.9},crystalmoth:{move:'flutter',speed:34,flee:50,size:.9},
};

export type Profile={
  id:string;mood:string;
  wind:number;gust:number;                 // vento médio e força das rajadas (0..1)
  weather:[WeatherKind,number][];          // estados possíveis com peso
  fauna:[Species,number][];                // animais com peso
  leaves:string[]|null;leafRate:number;    // cor e frequência das folhas que caem das árvores
  motes:{color:string;glow?:boolean;rise?:boolean;rate:number}|null; // partículas suspensas (pólen, pó, cinzas)
  footprints?:'sand'|'snow';fog?:number;haze?:boolean;snowCaps?:boolean;dripAfterRain?:boolean;tremor?:boolean;
  tint?:string;vignette?:string;
  sound:{wind:number;water:number;lava:number;calls:Call[];night:Call[]};
  events:EventKind[];
};
const P=(id:string,mood:string,o:Partial<Profile>):Profile=>({id,mood,wind:.35,gust:.4,weather:[['clear',1]],fauna:[],leaves:null,leafRate:0,motes:null,sound:{wind:.5,water:0,lava:0,calls:[],night:[]},events:['gust'],...o});

export const BIOME_PROFILE:Record<Biome,Profile>={
  village:P('village','acolhedor',{weather:[['clear',6],['drizzle',2],['rain',1]],fauna:[['chicken',4],['songbird',3],['butterfly',3],['bee',2],['sheep',1],['horse',.6]],leaves:['#5f9a44','#7ab04a'],leafRate:.15,motes:{color:'#fff3c4',rate:.3},
    sound:{wind:.35,water:0,lava:0,calls:['bird','cluck'],night:['cricket','owl']},events:['gust','butterflies','flock','shootingstar','fireflies']}),
  forest:P('forest','vivo e acolhedor',{weather:[['clear',6],['drizzle',2],['rain',2],['storm',.6],['fog',1]],fauna:[['rabbit',4],['squirrel',3],['songbird',4],['butterfly',3],['deer',1.5],['fox',1]],leaves:['#4f8a3a','#6fae4a','#3f7a32'],leafRate:.35,
    motes:{color:'#f4f0b0',rate:.25},sound:{wind:.5,water:0,lava:0,calls:['bird','bird','insect'],night:['owl','cricket']},events:['gust','flock','chase','butterflies','whirlwind','drink','dive','shootingstar','fireflies']}),
  autumn:P('autumn','melancólico',{wind:.5,weather:[['clear',5],['drizzle',2],['rain',1.5],['fog',1.5]],fauna:[['squirrel',4],['deer',2],['fox',2],['crow',2],['rabbit',2],['songbird',1]],leaves:['#d9752e','#c4442c','#e8a23a','#a8562a'],leafRate:1,
    sound:{wind:.6,water:0,lava:0,calls:['bird','crow'],night:['owl','cricket']},events:['gust','whirlwind','chase','flock','shootingstar']}),
  snow:P('snow','frio e silencioso',{wind:.45,gust:.6,weather:[['snow',5],['blizzard',1.6],['clear',2],['fog',1]],fauna:[['whitehare',4],['arcticfox',2],['owl',1.5],['mountainbird',3]],leaves:['#f4f8ff','#dfe9f5'],leafRate:.25,footprints:'snow',snowCaps:true,
    sound:{wind:.9,water:0,lava:0,calls:['bird'],night:['owl','howl']},events:['gust','chase','flock','shootingstar']}),
  desert:P('desert','seco e exposto',{tint:'rgba(255,210,140,.07)',wind:.5,gust:.6,weather:[['clear',4],['dust',4],['sandstorm',1.2]],fauna:[['lizard',4],['scorpion',2],['beetle',3],['vulture',1.5]],footprints:'sand',haze:true,
    motes:{color:'#e8cf96',rate:.4},sound:{wind:.8,water:0,lava:0,calls:['insect'],night:['cricket']},events:['gust','whirlwind','whirlwind','shootingstar']}),
  stormdesert:P('stormdesert','tempestuoso',{vignette:'rgba(10,12,24,.45)',wind:.7,gust:.8,weather:[['dust',4],['sandstorm',3],['storm',.8],['clear',1]],fauna:[['lizard',3],['scorpion',3],['beetle',3],['vulture',2],['bat',1.5]],footprints:'sand',haze:true,
    motes:{color:'#d8c08a',rate:.6},sound:{wind:1,water:0,lava:0,calls:['insect'],night:['cricket']},events:['gust','whirlwind','whirlwind']}),
  canyon:P('canyon','árido',{wind:.5,weather:[['clear',4],['dust',3],['sandstorm',.6]],fauna:[['lizard',4],['vulture',2],['beetle',2],['crow',1.5],['hare',1]],footprints:'sand',haze:true,motes:{color:'#d89a6a',rate:.35},
    sound:{wind:.8,water:0,lava:0,calls:['gull'],night:['cricket','howl']},events:['gust','whirlwind','shootingstar']}),
  swamp:P('swamp','úmido e misterioso',{vignette:'rgba(10,22,12,.5)',wind:.2,gust:.25,weather:[['fog',5],['drizzle',3],['rain',2],['clear',1]],fauna:[['frog',5],['dragonfly',4],['heron',1.5],['fish',2],['moth',1]],fog:.5,leaves:['#5e7a3a','#4a5e2c'],leafRate:.2,
    motes:{color:'#d8f0a0',glow:true,rate:.25},sound:{wind:.3,water:.7,lava:0,calls:['frog','frog','insect'],night:['frog','cricket']},events:['gust','fireflies','dive','fireflies']}),
  ruins:P('ruins','antigo',{weather:[['clear',4],['fog',2],['drizzle',1.5]],fauna:[['crow',4],['lizard',3],['moth',2],['songbird',1]],motes:{color:'#d9d2c0',rate:.45},
    sound:{wind:.6,water:0,lava:0,calls:['crow'],night:['owl']},events:['gust','whirlwind','flock','shootingstar','bats']}),
  ash:P('ash','instável e perigoso',{tint:'rgba(255,90,30,.07)',wind:.4,gust:.5,weather:[['ash',5],['embers',3],['clear',1]],fauna:[['firelizard',4],['embermoth',3],['beetle',2]],tremor:true,haze:true,
    motes:{color:'#ff9a3c',glow:true,rise:true,rate:.6},leaves:['#3a3438','#55494a'],leafRate:.4,sound:{wind:.5,water:0,lava:.9,calls:['bubble','creak'],night:['bubble']},events:['gust','smoke','tremor','smoke']}),
  lake:P('lake','sereno',{weather:[['clear',5],['drizzle',2],['rain',2],['fog',1.5]],fauna:[['duck',3],['fish',4],['dragonfly',3],['turtle',1.5],['heron',1],['songbird',2]],leaves:['#4f8a3a','#6fae4a'],leafRate:.3,
    sound:{wind:.4,water:.8,lava:0,calls:['bird','frog'],night:['frog','cricket']},events:['gust','dive','drink','flock','shootingstar','fireflies']}),
  rainforest:P('rainforest','denso e úmido',{tint:'rgba(40,90,40,.08)',wind:.3,weather:[['rain',4],['storm',1.4],['fog',2],['clear',2]],fauna:[['toucan',3],['macaw',3],['monkey',2],['frog',3],['butterfly',2],['firefly',2]],fog:.4,dripAfterRain:true,
    leaves:['#3f8a3a','#4fa046','#2f6a2c'],leafRate:.6,motes:{color:'#e8ff8a',glow:true,rate:.4},sound:{wind:.4,water:.3,lava:0,calls:['macaw','bird','insect','frog'],night:['frog','insect']},events:['gust','flock','butterflies','fireflies','dive']}),
  plains:P('plains','aberto e ensolarado',{tint:'rgba(120,210,110,.05)',wind:.55,weather:[['clear',6],['drizzle',1.5],['rain',1],['storm',.5]],fauna:[['sheep',3],['cow',2],['horse',1.5],['hare',3],['bee',3],['songbird',3],['chicken',1]],leaves:['#7ab04a','#9acb62'],leafRate:.2,
    motes:{color:'#fff7c0',rate:.45},sound:{wind:.6,water:0,lava:0,calls:['bird','insect'],night:['cricket','cricket']},events:['gust','flock','butterflies','chase','shootingstar']}),
  coast:P('coast','salgado',{wind:.6,weather:[['clear',5],['drizzle',2],['fog',1.5],['storm',.5]],fauna:[['seagull',4],['turtle',2],['fish',3]],footprints:'sand',
    sound:{wind:.7,water:1,lava:0,calls:['gull'],night:['cricket']},events:['gust','dive','flock','shootingstar']}),
  mangrove:P('mangrove','úmido',{wind:.25,weather:[['fog',3],['rain',2],['drizzle',2],['clear',2]],fauna:[['heron',2],['fish',3],['frog',3],['dragonfly',3],['crow',1]],fog:.35,dripAfterRain:true,leaves:['#3f6a2c','#55803a'],leafRate:.3,
    sound:{wind:.3,water:.8,lava:0,calls:['frog','bird'],night:['frog','insect']},events:['gust','dive','fireflies']}),
  sky:P('sky','alto e ventoso',{tint:'rgba(185,220,245,.08)',wind:.85,gust:.9,weather:[['gale',4],['clear',3],['snow',1],['fog',1]],fauna:[['mountainbird',4],['vulture',2],['butterfly',1]],snowCaps:true,
    sound:{wind:1,water:0,lava:0,calls:['bird','gull'],night:['howl']},events:['gust','gust','flock','shootingstar']}),
  crystal:P('crystal','cintilante',{tint:'rgba(255,70,24,.1)',wind:.3,weather:[['clear',4],['embers',2],['fog',1]],fauna:[['crystalmoth',4],['firelizard',2],['beetle',2]],motes:{color:'#c49aff',glow:true,rate:.4},
    sound:{wind:.4,water:0,lava:.4,calls:['insect'],night:['insect']},events:['gust','fireflies','shootingstar']}),
  starfall:P('starfall','mágico',{wind:.3,weather:[['clear',5],['fog',1.5],['snow',1]],fauna:[['crystalmoth',3],['owl',1.5],['firefly',3],['mountainbird',2]],motes:{color:'#fff3a0',glow:true,rate:.5},
    sound:{wind:.5,water:0,lava:0,calls:['bird'],night:['owl','insect']},events:['gust','shootingstar','shootingstar','fireflies']}),
  darkwood:P('darkwood','sombrio',{vignette:'rgba(3,10,8,.55)',wind:.35,gust:.5,weather:[['fog',5],['drizzle',2],['storm',.8],['clear',1]],fauna:[['crow',4],['bat',3],['moth',3],['owl',2]],fog:.55,leaves:['#5a4632','#3a2a20','#6a5a3a'],leafRate:.7,
    motes:{color:'#b98aff',glow:true,rate:.35},sound:{wind:.6,water:0,lava:0,calls:['crow','creak'],night:['owl','crow','howl']},events:['gust','shadow','bats','whirlwind','fireflies']}),
};

// interiores: cavernas, masmorras e salas especiais
const CAVE=P('cave','eco e gotejamento',{wind:.1,gust:.1,weather:[['drips',1]],fauna:[['bat',3],['moth',1]],motes:{color:'#cfd6e6',rate:.25},sound:{wind:.15,water:0,lava:0,calls:['drip','drip','bat'],night:[]},events:['bats']});
const LAVA_CAVE=P('lavacave','calor',{tint:'rgba(255,80,25,.1)',wind:.15,weather:[['embers',1]],fauna:[['firelizard',3],['embermoth',2]],tremor:true,motes:{color:'#ff9a3c',glow:true,rise:true,rate:.6},sound:{wind:.2,water:0,lava:1,calls:['bubble'],night:[]},events:['tremor','smoke']});
const WATER_CAVE=P('watercave','correntes',{tint:'rgba(40,130,170,.14)',wind:.1,weather:[['bubbles',1]],fauna:[['fish',4],['bat',1]],sound:{wind:.1,water:.9,lava:0,calls:['drip','drip'],night:[]},events:['bats']});
const DARK_HALL=P('darkhall','sombrio',{vignette:'rgba(3,10,8,.7)',wind:.1,weather:[['spores',1]],fauna:[['bat',3],['moth',2]],motes:{color:'#b8e38b',glow:true,rate:.3},sound:{wind:.2,water:0,lava:0,calls:['drip','bat'],night:[]},events:['bats','shadow']});
export const ZONE_PROFILE:Record<string,Profile>={
  cave1:{...CAVE,weather:[['snow',1]],motes:{color:'#e9f3ff',rate:.3}},dojo:{...CAVE,weather:[['snow',1]]},cave2:LAVA_CAVE,citadel1:LAVA_CAVE,citadel2:LAVA_CAVE,citadel:LAVA_CAVE,temple:DARK_HALL,
  eclipse:{...DARK_HALL,weather:[['rain',1]]},bastion:P('bastion','chuvoso',{weather:[['rain',1]],fauna:[['frog',3],['bat',1]],sound:{wind:.3,water:.4,lava:0,calls:['frog','drip'],night:[]},events:['bats']}),
  sanctum:P('sanctum','sereno',{weather:[['clear',1]],fauna:[['butterfly',2],['moth',2]],motes:{color:'#fff3c4',rate:.3},sound:{wind:.2,water:.3,lava:0,calls:['drip'],night:[]},events:[]}),
  aerie:P('aerie','areia',{tint:'rgba(244,195,125,.12)',wind:.4,weather:[['dust',2]],fauna:[['lizard',2],['beetle',2]],motes:{color:'#e8cf96',rate:.4},sound:{wind:.6,water:0,lava:0,calls:['insect'],night:[]},events:['whirlwind']}),
  grotto:WATER_CAVE,sunken:WATER_CAVE,tidecave:WATER_CAVE,mailcave:WATER_CAVE,fortress:P('fortress','poeira',{vignette:'rgba(10,12,24,.5)',weather:[['dust',1]],fauna:[['bat',2],['beetle',2]],motes:{color:'#d9d2c0',rate:.4},sound:{wind:.4,water:0,lava:0,calls:['bat'],night:[]},events:['bats']}),
  grove:P('grove','selva',{tint:'rgba(40,90,40,.1)',weather:[['spores',1]],leaves:['#4f9a48','#7cbf5a'],leafRate:.8,fauna:[['firefly',3],['frog',3],['butterfly',2],['dragonfly',1]],motes:{color:'#e8ff8a',glow:true,rate:.5},sound:{wind:.2,water:.3,lava:0,calls:['frog','insect','bird'],night:[]},events:['fireflies']}),
  lightcave:{...CAVE,motes:{color:'#fff3a0',glow:true,rate:.4}},theater:DARK_HALL,bellcrypt:CAVE,runetower:CAVE,wandvault:{...CAVE,motes:{color:'#c49aff',glow:true,rate:.4}},
  windgorge:P('windgorge','vento',{wind:.8,gust:.9,weather:[['gale',1]],fauna:[['bat',2]],sound:{wind:1,water:0,lava:0,calls:['bat'],night:[]},events:['gust']}),
  wingcave:P('wingcave','abismo',{wind:.5,gust:.6,weather:[['gale',1]],fauna:[['bat',3]],motes:{color:'#cfd6e6',rate:.4},sound:{wind:.8,water:0,lava:0,calls:['drip','bat'],night:[]},events:['bats','gust']}),
};
export const FALLBACK_PROFILE=CAVE;
export const profileOf=(zone:string,biome?:Biome|null):Profile=>biome?BIOME_PROFILE[biome]:ZONE_PROFILE[zone]??FALLBACK_PROFILE;

// o que cada clima faz: chuva/neve/poeira caindo, céu escurecendo, vento extra
export const WEATHER:Record<WeatherKind,{rain?:number;snow?:number;dust?:number;ash?:number;fog?:number;dark?:number;wind?:number;lightning?:boolean;indoor?:boolean}>={
  clear:{},drizzle:{rain:.35,dark:.08},rain:{rain:.7,dark:.16,wind:.15},storm:{rain:1,dark:.3,wind:.5,lightning:true},
  snow:{snow:.6,dark:.06},blizzard:{snow:1,dark:.18,wind:.7,fog:.45},dust:{dust:.45,wind:.2},sandstorm:{dust:1,dark:.12,wind:.7,fog:.3},
  ash:{ash:.8,dark:.12},embers:{ash:.5},fog:{fog:.6,dark:.05},gale:{wind:.6},spores:{indoor:true},drips:{indoor:true},bubbles:{indoor:true},
};
