import * as T from '../../vendor/three.module.js?v=0.7.2';
const COLORS={classic:0xffd68a,space:0xc4b5ff,ice:0xb6f3ff,desert:0xffcc88,wind:0xb6ffe2};
// Fixed pools keep frequent collisions from allocating meshes on mobile.
export class HitEffects {
 constructor(scene){this.group=new T.Group();scene.add(this.group);this.cursor=0;this.flashCursor=0;this.boost=0;this.age=1;this.strength=0;
 const shape=new T.Shape();for(let i=0;i<16;i++){const a=i*Math.PI/8,r=i%2?.12:i%4===0?.7:.38,x=Math.cos(a)*r,y=Math.sin(a)*r;if(i===0)shape.moveTo(x,y);else shape.lineTo(x,y);}shape.closePath();
 const star=new T.ShapeGeometry(shape),shard=new T.PlaneGeometry(.065,.22);
 const make=geometry=>{const mesh=new T.Mesh(geometry,new T.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0,depthWrite:false,side:T.DoubleSide,blending:T.AdditiveBlending}));mesh.rotation.x=-Math.PI/2;mesh.visible=false;this.group.add(mesh);return {mesh,life:0,duration:1,vx:0,vz:0};};
 this.flashes=Array.from({length:6},()=>make(star));this.sparks=Array.from({length:48},()=>make(shard));this.reset('classic');}
 reset(type){this.color=COLORS[type]??COLORS.classic;this.boost=0;this.age=1;for(const p of [...this.flashes,...this.sparks]){p.life=0;p.mesh.visible=false;}}
 hit(e){if(e.type==='wall')return;const s=Math.max(0,Math.min(1,e.strength));this.age=0;this.strength=s;this.angle=Math.atan2(e.vx||0,e.vz||1);this.boost=Math.max(this.boost,s);
 if(s<.3)return;const f=this.flashes[this.flashCursor++%6];f.life=f.duration=.09+s*.045;f.mesh.position.set(e.x,.67,e.z);f.mesh.material.color.set(this.color);f.mesh.scale.setScalar(.35+s*.65);f.mesh.visible=true;
 const count=s>.65?10:4;for(let i=0;i<count;i++){const p=this.sparks[this.cursor++%48],a=this.angle+(Math.random()-.5)*2.4,speed=2+Math.random()*3+s*2;p.vx=Math.sin(a)*speed;p.vz=Math.cos(a)*speed;p.life=p.duration=.13+Math.random()*.12;p.mesh.position.set(e.x,.62,e.z);p.mesh.rotation.z=-a;p.mesh.material.color.set(this.color);p.mesh.visible=true;}}
 update(dt,state,puck){const active=state.phase==='playing'&&!state.puck.hidden&&state.puck.held<0;this.age+=dt;this.boost=Math.max(0,this.boost-dt*2.2);puck.scale.set(1,1,1);
 if(active&&this.age<.19){const a=this.age,s=this.strength;let stretch=a<.045?-.22*s*(1-a/.045):.25*s*Math.sin(Math.PI*(a-.045)/.145);puck.rotation.y=this.angle;puck.scale.set(1-stretch*.55,1,1+stretch);}
 for(const p of [...this.flashes,...this.sparks]){p.life=Math.max(0,p.life-dt);p.mesh.visible=active&&p.life>0;if(!p.mesh.visible)continue;const f=p.life/p.duration;p.mesh.material.opacity=f*.85;p.mesh.position.x+=p.vx*dt;p.mesh.position.z+=p.vz*dt;if(p.vx||p.vz)p.mesh.scale.set(.6+f*.4,.4+f,1);}
 return active?this.boost:0;
 }
}
