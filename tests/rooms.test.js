import test from 'node:test';import assert from 'node:assert/strict';import {EventEmitter} from 'node:events';import {RoomService} from '../src/multiplayer/RoomService.js';
// Protocol-only transport: deliberately does not claim to exercise Internet/WebRTC.
class Channel extends EventEmitter{constructor(){super();this.open=false;this.bufferSize=0;}send(data){queueMicrotask(()=>this.other.emit('data',structuredClone(data)));}close(){if(!this.open)return;this.open=false;this.other.open=false;queueMicrotask(()=>{this.emit('close');this.other.emit('close');});}}
class MemoryPeer extends EventEmitter{static peers=new Map();constructor(id){super();this.id=id||crypto.randomUUID();this.links=[];queueMicrotask(()=>{if(MemoryPeer.peers.has(this.id)){this.emit('error',{type:'unavailable-id'});return;}MemoryPeer.peers.set(this.id,this);this.emit('open');});}connect(id){let a=new Channel(),b=new Channel();a.other=b;b.other=a;this.links.push(a);queueMicrotask(()=>{let remote=MemoryPeer.peers.get(id);if(!remote){this.emit('error',{type:'peer-unavailable'});return;}remote.links.push(b);remote.emit('connection',b);a.open=b.open=true;a.emit('open');b.emit('open');});return a;}disconnect(){if(MemoryPeer.peers.get(this.id)===this)MemoryPeer.peers.delete(this.id);this.emit('disconnected');}destroy(){for(let c of this.links)c.close();if(MemoryPeer.peers.get(this.id)===this)MemoryPeer.peers.delete(this.id);}}
globalThis.window={Peer:MemoryPeer};
const wait=(room,type,predicate=()=>true)=>new Promise((resolve,reject)=>{const f=e=>{if(predicate(e.detail)){clearTimeout(timer);room.removeEventListener(type,f);resolve(e.detail);}};const timer=setTimeout(()=>{room.removeEventListener(type,f);reject(new Error('Timed out: '+type));},1000);room.addEventListener(type,f);});
const cfg={arena:'classic',target:5,skills:true};
test('password room, both ready, authoritative input/state, rematch and disconnect',async()=>{let a=new RoomService(),b=new RoomService();try{await a.create(cfg,'bear','secret');const ready=wait(b,'lobby',x=>x.connected);await b.join(a.code,'duck','secret');await ready;assert.deepEqual(a.config.characters,['bear','duck']);let startedA=wait(a,'start'),startedB=wait(b,'start');a.setReady();assert.equal(a.ready[1],false);b.setReady();await Promise.all([startedA,startedB]);let input=wait(a,'input');b.send({type:'input',x:2,z:-3});assert.deepEqual(await input,{x:2,z:-3});let state=wait(b,'state');a.send({type:'state',state:{scores:[2,1]}});assert.deepEqual(await state,{scores:[2,1]});a.markFinished();b.markFinished();let lobby=wait(a,'lobby');b.rematch();await lobby;assert.deepEqual(a.ready,[false,false]);let disconnect=wait(a,'disconnect');b.close();await disconnect;}finally{a.close();b.close();}});
test('wrong password rejected without admitting guest',async()=>{let a=new RoomService(),b=new RoomService();try{await a.create(cfg,'bear','secret');let error=wait(b,'error');await b.join(a.code,'cat','wrong');assert.match(await error,/密碼/);assert.equal(a.accepted,false);assert.equal(b.accepted,false);}finally{a.close();b.close();}});
test('random pairing releases discovery slot for another pair',async()=>{let rooms=Array.from({length:4},()=>new RoomService());try{for(let i=0;i<4;i+=2){await rooms[i].random(cfg,'cat');let paired=wait(rooms[i+1],'lobby',x=>x.connected);await rooms[i+1].random(cfg,'duck');await paired;assert.equal(rooms[i].accepted,true);assert.equal(rooms[i+1].accepted,true);}assert.equal(rooms[0].connection.open,true);assert.equal(rooms[2].connection.open,true);}finally{rooms.forEach(r=>r.close());}});

test('replay keeps room, syncs new arena and both characters, resets Ready, starts fresh config',async()=>{
 const a=new RoomService(),b=new RoomService();try{
  await a.create(cfg,'bear');const joined=wait(b,'lobby',x=>x.connected);await b.join(a.code,'duck');await joined;
  const code=a.code;let startA=wait(a,'start'),startB=wait(b,'start');a.setReady();b.setReady();await Promise.all([startA,startB]);
  assert.equal(a.setArena('ice'),false);assert.equal(b.setCharacter('cat'),false);
  a.markFinished();b.markFinished();const replay=wait(b,'lobby');a.rematch();await replay;assert.equal(a.code,code);assert.equal(b.code,code);assert.equal(a.connection.open,true);
  a.setReady();const synced=wait(b,'lobby',i=>i.config.arena==='ice');assert.equal(a.setArena('ice'),true);await synced;assert.deepEqual(a.ready,[false,false]);assert.deepEqual(b.ready,[false,false]);
  const hostPick=wait(b,'lobby',i=>i.characters[0]==='cat');a.setCharacter('cat');await hostPick;
  const guestPick=wait(b,'lobby',i=>i.characters[1]==='bear'&&!i.pendingSelection);b.setCharacter('bear');assert.equal(b.pendingSelection,true);b.setReady();assert.equal(b.ready[1],false);await guestPick;
  assert.equal(b.setArena('space'),false);b.send({type:'select-arena',arena:'space'});assert.equal(a.config.arena,'ice');
  startA=wait(a,'start');startB=wait(b,'start');a.setReady();b.setReady();const [ca,cb]=await Promise.all([startA,startB]);assert.deepEqual(ca,cb);assert.equal(ca.arena,'ice');assert.deepEqual(ca.characters,['cat','bear']);assert.equal(a.round,2);assert.equal(b.round,2);
 }finally{a.close();b.close();}
});
test('stale Ready cannot approve changed settings; invalid picks and match-time changes are ignored',async()=>{
 const a=new RoomService(),b=new RoomService();try{await a.create(cfg,'bear');const joined=wait(b,'lobby',x=>x.connected);await b.join(a.code,'duck');await joined;
  const old=a.revision;a.setReady();a.setArena('desert');a.receive({type:'ready',revision:old});assert.deepEqual(a.ready,[false,false]);
  assert.equal(a.setArena('__proto__'),false);assert.equal(a.setCharacter('dragon'),false);
  const synced=wait(b,'lobby',i=>i.config.arena==='desert');await synced;const sa=wait(a,'start'),sb=wait(b,'start');a.setReady();b.setReady();await Promise.all([sa,sb]);
  a.receive({type:'select-character',character:'cat',id:999});a.receive({type:'rematch'});assert.equal(a.phase,'match');assert.equal(a.remoteCharacter,'duck');
 }finally{a.close();b.close();}
});
test('joining a room edited before connection uses the current settings revision',async()=>{
 const a=new RoomService(),b=new RoomService();try{await a.create(cfg,'bear');a.setArena('wind');a.setCharacter('cat');const joined=wait(b,'lobby',x=>x.connected);await b.join(a.code,'duck');await joined;assert.equal(b.revision,a.revision);assert.equal(b.config.arena,'wind');const sa=wait(a,'start'),sb=wait(b,'start');b.setReady();await new Promise(r=>setImmediate(r));a.setReady();await Promise.all([sa,sb]);}finally{a.close();b.close();}
});
