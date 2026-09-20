export const MUSIC_TRACKS={
 classic:new URL('../../assets/music/neon-court-loop.mp3',import.meta.url).href,
 space:new URL('../../assets/music/pocket-groove-loop.mp3',import.meta.url).href
};
// One looping source; async loads are fenced so old arenas never restart playback.
export class Music {
 constructor({contextFactory=()=>new AudioContext(),fetcher=(...args)=>globalThis.fetch(...args),onChange=()=>{},onError=()=>{}}={}){Object.assign(this,{contextFactory,fetcher,onChange,onError});this.enabled=false;this.hidden=false;this.arena='classic';this.cache=new Map();this.serial=0;this.source=null;}
 context(){if(!this.ctx){this.ctx=this.contextFactory();this.gain=this.ctx.createGain();this.gain.gain.value=.36;this.gain.connect(this.ctx.destination);}return this.ctx;}
 stop(){this.serial++;if(this.source){this.source.stop();this.source.disconnect();this.source=null;}}
 setEnabled(value){this.enabled=value;this.stop();this.onChange();if(value&&!this.hidden)return this.play();}
 setArena(arena){if(this.arena===arena)return;this.arena=arena;this.stop();this.onChange();if(this.enabled&&!this.hidden)return this.play();}
 setHidden(hidden){if(this.hidden===hidden)return;this.hidden=hidden;this.stop();if(!hidden&&this.enabled)return this.play();}
 async play(){const url=MUSIC_TRACKS[this.arena];if(!this.enabled||this.hidden)return;const token=++this.serial;
 try{const ctx=this.context();await ctx.resume();if(ctx.state==='suspended')throw new Error('Audio gesture required');
 if(token!==this.serial||!this.enabled||this.hidden||!url)return;
 if(!this.cache.has(url)){const promise=this.fetcher(url).then(r=>{if(!r.ok)throw new Error('Music unavailable');return r.arrayBuffer();}).then(bytes=>ctx.decodeAudioData(bytes));this.cache.set(url,promise);promise.catch(()=>this.cache.delete(url));}
 const buffer=await this.cache.get(url);if(token!==this.serial||!this.enabled||this.hidden)return;
 const source=ctx.createBufferSource();source.buffer=buffer;source.loop=true;source.connect(this.gain);source.start();this.source=source;this.onChange();
 }catch(error){if(token!==this.serial)return;this.enabled=false;this.stop();this.onChange();this.onError(error);}
 }
}
