// Som ambiente em camadas, sintetizado com Web Audio (sem arquivos novos):
// leitos contínuos (vento, chuva, água, lava) com volume seguindo o clima, e chamados curtos de animais em intervalos irregulares.
// Fica bem abaixo da trilha (que toca a 0.12) para não competir com ela.
import type {Call} from './ambient-data';

export type Beds={wind:number;rain:number;water:number;lava:number};
const MASTER=.55;
export class AmbientAudio{
  ctx:AudioContext|null=null;out:GainNode|null=null;beds:Partial<Record<keyof Beds,GainNode>>={};noise:AudioBuffer|null=null;delay:DelayNode|null=null;
  callTimer=2;nightTimer=4;rng:()=>number;level:Beds={wind:0,rain:0,water:0,lava:0};played:Call[]=[];
  constructor(rng:()=>number=Math.random){this.rng=rng;}
  attach(ctx:AudioContext|null){if(ctx===this.ctx)return;this.stop();this.ctx=ctx;if(!ctx)return;
    this.out=ctx.createGain();this.out.gain.value=MASTER;this.out.connect(ctx.destination);
    // eco curto para gotas e chamados em cavernas
    this.delay=ctx.createDelay(1);this.delay.delayTime.value=.23;const fb=ctx.createGain();fb.gain.value=.32;this.delay.connect(fb);fb.connect(this.delay);this.delay.connect(this.out);
    const len=ctx.sampleRate*2,b=ctx.createBuffer(1,len,ctx.sampleRate),d=b.getChannelData(0);let last=0;
    for(let i=0;i<len;i++){const w=this.rng()*2-1;last=(last+.02*w)/1.02;d[i]=w*.6+last*3;}this.noise=b;
    const bed=(k:keyof Beds,type:BiquadFilterType,freq:number,q=1)=>{const s=ctx.createBufferSource();s.buffer=b;s.loop=true;s.playbackRate.value=k==='wind'?.6:1;const f=ctx.createBiquadFilter();f.type=type;f.frequency.value=freq;f.Q.value=q;const g=ctx.createGain();g.gain.value=0;s.connect(f);f.connect(g);g.connect(this.out!);s.start(ctx.currentTime+this.rng()*.1);this.beds[k]=g;
      if(k==='wind'){const lfo=ctx.createOscillator(),lg=ctx.createGain();lfo.frequency.value=.13;lg.gain.value=220;lfo.connect(lg);lg.connect(f.frequency);lfo.start();}};
    bed('wind','bandpass',520,.7);bed('rain','highpass',1800,.5);bed('water','lowpass',520,.6);bed('lava','lowpass',170,1.2);}
  stop(){if(this.out){try{this.out.disconnect();}catch{/* já desconectado */}}this.out=null;this.beds={};this.delay=null;this.ctx=null;}
  /** volume de cada leito; transições suaves (setTargetAtTime) evitam cliques */
  setBeds(l:Beds,on:boolean){this.level=l;const ctx=this.ctx;if(!ctx)return;const t=ctx.currentTime;
    const mx={wind:.05,rain:.07,water:.045,lava:.06};for(const k of Object.keys(mx) as (keyof Beds)[])this.beds[k]?.gain.setTargetAtTime(on?Math.min(1,l[k])*mx[k]:0,t,.6);}
  update(dt:number,calls:Call[],on:boolean,echo:boolean){if(!on||!calls.length)return;this.callTimer-=dt;if(this.callTimer>0)return;
    this.callTimer=2.2+this.rng()*6.5;const c=calls[Math.floor(this.rng()*calls.length)];this.play(c,echo);}
  play(call:Call,echo=false){this.played.push(call);if(this.played.length>40)this.played.shift();const ctx=this.ctx;if(!ctx||!this.out)return;
    const t=ctx.currentTime+.02,r=this.rng,dest=echo&&this.delay?this.delay:this.out;
    const tone=(f0:number,f1:number,start:number,dur:number,gain:number,type:OscillatorType='sine',to:AudioNode=dest)=>{const o=ctx.createOscillator(),g=ctx.createGain();o.type=type;o.frequency.setValueAtTime(f0,t+start);o.frequency.exponentialRampToValueAtTime(Math.max(20,f1),t+start+dur);
      g.gain.setValueAtTime(.0001,t+start);g.gain.exponentialRampToValueAtTime(gain,t+start+Math.min(.03,dur/3));g.gain.exponentialRampToValueAtTime(.0001,t+start+dur);o.connect(g);g.connect(to);o.start(t+start);o.stop(t+start+dur+.05);};
    const hiss=(freq:number,start:number,dur:number,gain:number,type:BiquadFilterType='bandpass',q=4)=>{if(!this.noise)return;const s=ctx.createBufferSource(),f=ctx.createBiquadFilter(),g=ctx.createGain();s.buffer=this.noise;f.type=type;f.frequency.value=freq;f.Q.value=q;
      g.gain.setValueAtTime(.0001,t+start);g.gain.exponentialRampToValueAtTime(gain,t+start+.01);g.gain.exponentialRampToValueAtTime(.0001,t+start+dur);s.connect(f);f.connect(g);g.connect(dest);s.start(t+start,r()*1.5);s.stop(t+start+dur+.05);};
    switch(call){
      case 'bird':{const base=2400+r()*1800,n=2+Math.floor(r()*4);for(let i=0;i<n;i++)tone(base*(1+r()*.3),base*(.8+r()*.5),i*.11,.08,.05);break;}
      case 'macaw':tone(900+r()*200,600,0,.22,.05,'sawtooth');tone(800,1100,.25,.18,.04,'sawtooth');break;
      case 'cricket':{const f=4300+r()*500;for(let i=0;i<3;i++)tone(f,f,i*.07,.04,.018,'square');break;}
      case 'insect':tone(5200+r()*800,5000,0,.5,.008,'sawtooth');break;
      case 'frog':{const f=110+r()*60;tone(f*1.5,f,0,.16,.07,'square');if(r()<.5)tone(f*1.4,f,.22,.14,.05,'square');break;}
      case 'crow':hiss(950+r()*200,0,.22,.09,'bandpass',6);if(r()<.6)hiss(900,.32,.2,.07,'bandpass',6);break;
      case 'owl':tone(410,380,0,.3,.06);tone(390,360,.45,.45,.06);break;
      case 'howl':tone(380,620,0,1.4,.03,'triangle');break;
      case 'gull':tone(1500+r()*300,900,0,.25,.04,'triangle');tone(1400,850,.3,.25,.035,'triangle');break;
      case 'drip':tone(1300+r()*900,700,0,.12,.05,'sine',this.delay??this.out);break;
      case 'bat':tone(6200+r()*1200,5200,0,.05,.015,'square');tone(6000,5000,.08,.05,.012,'square');break;
      case 'bubble':tone(90+r()*70,220,0,.12,.07);break;
      case 'creak':tone(70+r()*40,55,0,.9,.04,'sawtooth');break;
      case 'cluck':tone(700,400,0,.07,.05,'square');tone(650,380,.12,.06,.04,'square');break;
    }}
  thunder(dist:number){this.played.push('thunder' as Call);const ctx=this.ctx;if(!ctx||!this.out||!this.noise)return;const t=ctx.currentTime+dist*.6,s=ctx.createBufferSource(),f=ctx.createBiquadFilter(),g=ctx.createGain();
    s.buffer=this.noise;f.type='lowpass';f.frequency.value=180+(1-dist)*260;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.32*(1.2-dist),t+.08);g.gain.exponentialRampToValueAtTime(.0001,t+2.6);s.connect(f);f.connect(g);g.connect(this.out);s.start(t);s.stop(t+2.8);}
}
