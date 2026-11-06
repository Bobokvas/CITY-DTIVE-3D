export class Sound{
 constructor(){this.ctx=null;this.vol=.7;}
 start(){try{
  if(this.ctx){this.ctx.resume();return;}
  const c=this.ctx=new(window.AudioContext||window.webkitAudioContext)();
  this.master=c.createGain();this.master.gain.value=this.vol;this.master.connect(c.destination);
  const lp=c.createBiquadFilter();lp.type='lowpass';lp.frequency.value=700;lp.connect(this.master);
  this.eg=c.createGain();this.eg.gain.value=0;this.eg.connect(lp);
  this.o1=c.createOscillator();this.o1.type='sawtooth';this.o2=c.createOscillator();this.o2.type='square';
  [this.o1,this.o2].forEach(o=>{o.connect(this.eg);o.start();});
  const len=c.sampleRate*2,buf=this.buf=c.createBuffer(1,len,c.sampleRate),d=buf.getChannelData(0);for(let i=0;i<len;i++)d[i]=Math.random()*2-1;
  const mk=(type,f,g)=>{const s=c.createBufferSource();s.buffer=buf;s.loop=true;const b=c.createBiquadFilter();b.type=type;b.frequency.value=f;const gn=c.createGain();gn.gain.value=g;s.connect(b);b.connect(gn);gn.connect(this.master);s.start();return gn;};
  this.amb=mk('lowpass',400,.05);this.skid=mk('bandpass',2200,0);
 }catch(e){this.ctx=null;}}
 setVol(v){this.vol=v;if(this.master)this.master.gain.value=v;}
 hush(on){if(this.master)this.master.gain.value=on?0:this.vol;}
 update(sp,thr,brk){if(!this.ctx)return;try{
  const t=this.ctx.currentTime,g=Math.min(4,sp*5|0),f=45+((sp*5-g)*.8+.2)*120+thr*15;
  this.o1.frequency.setTargetAtTime(f,t,.05);this.o2.frequency.setTargetAtTime(f*.5,t,.05);
  this.eg.gain.setTargetAtTime(.05+thr*.06,t,.1);this.skid.gain.setTargetAtTime(brk&&sp>.15?.04:0,t,.05);
 }catch(e){}}
 crash(sev){if(!this.ctx)return;try{
  const c=this.ctx,t=c.currentTime,s=c.createBufferSource(),g=c.createGain(),f=c.createBiquadFilter();
  s.buffer=this.buf;f.type='lowpass';f.frequency.value=900;g.gain.setValueAtTime(Math.min(.8,sev/25),t);g.gain.exponentialRampToValueAtTime(.001,t+.35);
  s.connect(f);f.connect(g);g.connect(this.master);s.start(t);s.stop(t+.4);
 }catch(e){}}
}
