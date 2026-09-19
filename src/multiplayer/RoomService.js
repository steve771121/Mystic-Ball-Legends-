import {ARENAS} from '../config/game.js?v=0.3.3';
// PeerJS provides signaling only. The host owns physics; guests send bounded input.
// Public signaling + WebRTC is experimental: restrictive NAT may require TURN.
const PREFIX='mbl-04-';
const validChar=c=>['bear','duck','cat'].includes(c);
export class RoomService extends EventTarget {
 constructor(options={}){super();this.options=options;this.closed=false;this.host=false;this.ready=[false,false];this.phase='lobby';this.revision=0;this.selectionId=0;this.ackSelection=0;this.pendingSelection=false;this.round=0;this.character='bear';this.remoteCharacter='cat';this.accepted=false;this.timer=null;this.lastHeard=Date.now();}
 emit(type,detail){this.dispatchEvent(new CustomEvent(type,{detail}));}
 async hash(text){let b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text));return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('');}
 open(id){return new Promise((resolve,reject)=>{const p=new window.Peer(id,{debug:0,...this.options});let done=false;const timer=setTimeout(()=>{if(!done){done=true;p.destroy();reject(new Error('連線服務逾時，請稍後重試。'));}},12000);p.on('open',()=>{if(done)return;done=true;clearTimeout(timer);this.peer=p;if(this.closed){p.destroy();reject(new Error('已取消連線'));return;}p.on('connection',c=>this.accept(c));p.on('disconnected',()=>{if(!this.accepted&&!this.closed)this.emit('error','連線服務中斷，請重新建立房間。');});resolve(p);});p.on('error',e=>{if(!done){done=true;clearTimeout(timer);p.destroy();reject(e);}else if(!this.closed)this.emit('error',e.type==='peer-unavailable'?'找不到房間，請確認房號與房主是否在線。':'無法連線，請改用其他網路或重新加入。');});});}
 async create(config,character,password='',match=false){this.host=true;this.config={...config,ai:false};this.character=character;this.password=await this.hash(password);this.match=match;for(let i=0;i<8;i++){this.code=String(1000+crypto.getRandomValues(new Uint32Array(1))[0]%9000);try{await this.open(match?PREFIX+'match-v1':PREFIX+this.code);this.emit('lobby',this.info());return;}catch(e){if(e.type!=='unavailable-id'||match)throw e;}}throw new Error('房間忙碌，請重新建立。');}
 async join(code,character,password='',match=false){this.host=false;this.character=character;this.code=code;this.password=await this.hash(password);await this.open();const c=this.peer.connect(match?PREFIX+'match-v1':PREFIX+code,{reliable:true});this.bind(c);this.timer=setTimeout(()=>{if(!this.accepted)this.emit('error','連線逾時。請確認房號，或嘗試其他網路。');},15000);c.on('open',()=>c.send({type:'hello',character,password:this.password,version:4}));}
 async random(config,character){try{await this.create({...config,arena:'classic',target:5,skills:true},character,'',true);}catch(e){if(e.type!=='unavailable-id')throw e;await this.join('配對',character,'',true);}}
 accept(c){if(!this.host||this.connection){c.on('open',()=>{c.send({type:'error',message:'房間已滿。'});setTimeout(()=>c.close(),250);});return;}this.bind(c);this.authTimer=setTimeout(()=>{if(!this.accepted){c.close();this.connection=null;}},8000);}
 bind(c){this.connection=c;c.on('data',data=>{if(!data||typeof data!=='object'||this.closed)return;this.lastHeard=Date.now();this.receive(data);});c.on('close',()=>{if(!this.closed){if(this.host&&!this.accepted){this.connection=null;this.emit('lobby',this.info());}else{this.accepted=false;this.emit('disconnect');}}});c.on('error',()=>this.emit('error','對戰連線中斷。'));}
 send(m){if(this.connection?.open){if(m.type==='state'&&this.connection.bufferSize>2)return;this.connection.send(m);}}
 info(){return {code:this.match?'隨機配對':this.code,host:this.host,connected:this.accepted,ready:this.ready,phase:this.phase,revision:this.revision,round:this.round,pendingSelection:this.pendingSelection,characters:this.host?[this.character,this.remoteCharacter]:[this.remoteCharacter,this.character],config:this.config};}
 receive(m){if(m.type==='error'){this.emit('error',m.message);return;}
 if(m.type==='hello'&&this.host&&!this.accepted){if(m.version!==4||!validChar(m.character)||m.password!==this.password){this.send({type:'error',message:'密碼錯誤或遊戲版本不同。'});setTimeout(()=>{if(!this.accepted){this.connection?.close();this.connection=null;}},250);return;}clearTimeout(this.authTimer);this.remoteCharacter=m.character;this.accepted=true;this.config.characters=[this.character,this.remoteCharacter];this.send({type:'welcome',config:this.config,code:this.code,revision:this.revision,round:this.round});this.emit('lobby',this.info());this.heartbeat();if(this.match)this.peer.disconnect();return;}
 if(m.type==='welcome'&&!this.host&&!this.accepted){if(!m.config||!Array.isArray(m.config.characters)||!m.config.characters.every(validChar))return;clearTimeout(this.timer);this.config=m.config;this.revision=m.revision;this.round=m.round;this.code=m.code;this.remoteCharacter=m.config.characters[0];this.accepted=true;this.emit('lobby',this.info());this.heartbeat();return;}
 if(!this.accepted)return;
 if(m.type==='ping'){this.send({type:'pong',at:m.at});return;}if(m.type==='pong'){this.emit('latency',Date.now()-m.at);return;}
 if(m.type==='ready'&&this.host&&this.phase==='lobby'&&m.revision===this.revision){this.ready[1]=true;this.broadcastLobby();this.tryStart();}
 if(m.type==='lobby'&&!this.host&&Number.isInteger(m.revision)&&m.revision>=this.revision){
  if(!m.config||!Object.hasOwn(ARENAS,m.config.arena)||!m.config.characters?.every(validChar)||m.config.characters.length!==2)return;
  this.phase='lobby';this.revision=m.revision;this.round=m.round;this.config=m.config;this.character=m.config.characters[1];this.remoteCharacter=m.config.characters[0];this.ready=m.ready;
  if(m.ackSelection>=this.selectionId)this.pendingSelection=false;
  this.emit('lobby',this.info());
 }
 if(m.type==='start'&&!this.host&&this.phase==='lobby'&&m.revision===this.revision&&!this.pendingSelection){this.phase='match';this.round=m.round;this.ready=[false,false];this.emit('start',structuredClone(this.config));}
 if(m.type==='input'&&this.host){if(Number.isFinite(m.x)&&Number.isFinite(m.z))this.emit('input',{x:m.x,z:m.z});}
 if(m.type==='skill'&&this.host){if(Number.isFinite(m.x)&&Number.isFinite(m.z))this.emit('skill',{x:m.x,z:m.z});}
 if(m.type==='state'&&!this.host)this.emit('state',m.state);
 if(m.type==='select-character'&&this.host&&this.phase==='lobby'&&validChar(m.character)&&Number.isInteger(m.id)&&m.id>this.ackSelection){this.ackSelection=m.id;this.remoteCharacter=m.character;this.changed();}
 if(m.type==='rematch'&&this.host&&this.phase==='results')this.returnToLobby();
 }
 heartbeat(){clearInterval(this.pulse);this.pulse=setInterval(()=>{if(Date.now()-this.lastHeard>10000){this.emit('disconnect');this.close();return;}this.send({type:'ping',at:Date.now()});},2000);}
 broadcastLobby(){this.config.characters=[this.character,this.remoteCharacter];this.send({type:'lobby',ready:this.ready,config:this.config,revision:this.revision,round:this.round,ackSelection:this.ackSelection});this.emit('lobby',this.info());}
 changed(){this.revision++;this.ready=[false,false];this.broadcastLobby();}
 setCharacter(character){if(this.phase!=='lobby'||!validChar(character))return false;if(this.host){if(this.character===character)return false;this.character=character;this.changed();}else{if(!this.accepted||this.pendingSelection||this.character===character)return false;this.pendingSelection=true;this.ready=[false,false];this.send({type:'select-character',character,id:++this.selectionId});this.emit('lobby',this.info());}return true;}
 setArena(arena){if(!this.host||this.phase!=='lobby'||!Object.hasOwn(ARENAS,arena)||this.config.arena===arena)return false;this.config.arena=arena;this.changed();return true;}
 setReady(){if(!this.accepted||this.phase!=='lobby'||this.pendingSelection)return;if(this.host){this.ready[0]=true;this.broadcastLobby();this.tryStart();}else{this.ready[1]=true;this.send({type:'ready',revision:this.revision});this.emit('lobby',this.info());}}
 tryStart(){if(this.phase==='lobby'&&this.ready.every(Boolean)){this.phase='match';this.round++;this.ready=[false,false];this.send({type:'start',revision:this.revision,round:this.round});this.emit('start',structuredClone(this.config));}}
 markFinished(){if(this.phase==='match')this.phase='results';}
 returnToLobby(){if(!this.host||this.phase!=='results')return;this.phase='lobby';this.changed();}
 rematch(){if(this.phase!=='results')return;if(this.host)this.returnToLobby();else this.send({type:'rematch'});}
 close(){this.closed=true;clearTimeout(this.timer);clearTimeout(this.authTimer);clearInterval(this.pulse);this.connection?.close();this.peer?.destroy();}
}
