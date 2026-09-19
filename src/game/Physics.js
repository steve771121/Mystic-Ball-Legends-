import {roundCorner} from './Bounds.js?v=0.3.3';
import {ARENAS,W,H,CORNER_RADIUS,GOAL,clamp,legalSkill,COOLDOWN} from '../config/game.js?v=0.3.3';
const mallet=side=>({x:0,z:side*6.3,tx:0,tz:side*6.3,vx:0,vz:0,r:.62,side});
export class Physics {
 constructor(config={}){this.config={arena:'classic',target:5,skills:true,characters:['bear','cat'],ai:true,difficulty:'normal',...config};this.arena=ARENAS[this.config.arena]||ARENAS.classic;this.t=0;this.scores=[0,0];this.players=[mallet(1),mallet(-1)];this.cooldowns=[0,0];this.skills=[null,null];this.puck={x:0,z:0,vx:0,vz:0,r:.27,held:-1};this.phase='countdown';this.wait=3;this.winner=-1;this.events=[];this.goalId=0;this.lastScorer=-1;this.serve=1;this.resetRound();}
 resetRound(){this.players=[mallet(1),mallet(-1)];Object.assign(this.puck,{x:0,z:0,vx:0,vz:0,held:-1});this.skills=[null,null];this.phase='countdown';this.wait=3;}
 input(i,x,z){if(!Number.isFinite(x)||!Number.isFinite(z)||!this.players[i])return;let m=this.players[i];m.tx=clamp(x,-4.35,4.35);m.tz=clamp(z*m.side,.72,7.22)*m.side;const target={x:m.tx,z:m.tz,r:m.r};roundCorner(target);m.tx=target.x;m.tz=target.z;}
 activate(i,x,z){let m=this.players[i];if(!m||!this.config.skills||this.phase!=='playing'||this.cooldowns[i]>0||!legalSkill(x,z,m.side))return false;let type=this.config.characters[i];this.skills[i]={type,x,z,side:m.side,age:0,caught:false,released:0};this.cooldowns[i]=COOLDOWN;this.events.push({type:'skill',i});return true;}
 collide(m,boost=1){const p=this.puck;let dx=p.x-m.x,dz=p.z-m.z,d=Math.hypot(dx,dz),r=p.r+m.r;if(d>=r)return false;if(d<.00001){dx=0;dz=-m.side||-1;d=1;}const nx=dx/d,nz=dz/d;p.x=m.x+nx*(r+.001);p.z=m.z+nz*(r+.001);let rel=(p.vx-(m.vx||0))*nx+(p.vz-(m.vz||0))*nz;if(rel<0){p.vx-=1.92*rel*nx;p.vz-=1.92*rel*nz;p.vx+=(m.vx||0)*.14*boost;p.vz+=(m.vz||0)*.14*boost;this.events.push({type:'hit',x:p.x,z:p.z});}return true;}
 skillBodies(s){if(s.type==='bear'){let length=.55+1.0*(.5+.5*Math.sin(s.age*8)),a=Math.sin(s.age*2.7)*1.1;return Array.from({length:7},(_,j)=>{let n=(j-3)/3;return {x:s.x+n*length*Math.cos(a),z:s.z+n*length*Math.sin(a),r:.31,side:s.side,vx:Math.cos(a)*Math.cos(s.age*8)*n*2,vz:Math.sin(a)*Math.cos(s.age*8)*n*2};});}if(s.type==='cat'){return [{x:Math.sin(s.age*4)*3.7,z:s.side*4.65,r:.56,side:s.side,vx:Math.cos(s.age*4)*14.8,vz:0}];}return [];}
 step(dt){if(this.phase==='over'||this.phase==='paused')return;this.t+=dt;if(this.phase!=='playing'){this.wait-=dt;if(this.wait<=0){if(this.phase==='goal'){this.resetRound();}else{this.phase='playing';this.puck.vx=2.8;this.puck.vz=this.serve*(this.config.arena==='ice'?9:7);}}return;}
 for(let i=0;i<2;i++)this.cooldowns[i]=Math.max(0,this.cooldowns[i]-dt);
 const p=this.puck;
 if(this.config.ai){let m=this.players[1],skill=this.skills[1],hold=p.held===1;let tx=p.z<.5?p.x:Math.sin(this.t)*.35;let tz=p.z<.5?clamp(p.z-(hold?.85:.7),-7.2,-.75):-6.25;this.input(1,tx,tz);if(this.config.skills&&this.cooldowns[1]===0&&p.z<-1&&this.t>4)this.activate(1,clamp(p.x,-2.6,2.6),-3.8);}
 this.players.forEach((m,i)=>{let ox=m.x,oz=m.z;let dx=m.tx-m.x,dz=m.tz-m.z,d=Math.hypot(dx,dz);let speed=i===1&&this.config.ai?(this.config.difficulty==='easy'?6.2:this.config.difficulty==='hard'?12:8.5):27;if(this.config.arena==='wind')speed*=1+.14*Math.sin(this.t*.7)*m.side;if(this.config.arena==='desert'&&this.inSand(m))speed*=.7;let f=d?Math.min(1,speed*dt/d,18*dt):0;m.x+=dx*f;m.z+=dz*f;roundCorner(m);m.vx=(m.x-ox)/dt;m.vz=(m.z-oz)/dt;});
 for(let i=0;i<2;i++){let s=this.skills[i];if(!s)continue;s.age+=dt;if(s.age>=5){if(p.held===i){p.held=-1;p.vz=-s.side*2;}this.skills[i]=null;continue;}if(s.type==='duck'&&s.age>s.released){let dx=s.x-p.x,dz=s.z-p.z,d=Math.hypot(dx,dz);if(p.held===i){p.x=s.x;p.z=s.z;p.vx=p.vz=0;}else if(p.held<0&&d<2.0){p.vx+=dx*25*dt;p.vz+=dz*25*dt;p.vx*=Math.exp(-2.8*dt);p.vz*=Math.exp(-2.8*dt);if(d<.34){p.held=i;p.x=s.x;p.z=s.z;p.vx=p.vz=0;}}}}
 if(p.held<0){if(this.config.arena==='wind'){let k=Math.floor(this.t/6)%3;p.vz+=(k===0?-2.4:k===1?2.4:0)*dt;p.vx+=(k===2?Math.sin(this.t*1.4)*4:0)*dt;}let drag=this.arena.drag+(this.config.arena==='desert'&&this.inSand(p)?2.6:0);p.vx*=Math.exp(-drag*dt);p.vz*=Math.exp(-drag*dt);p.x+=p.vx*dt;p.z+=p.vz*dt;}
 for(let i=0;i<2;i++){let held=p.held;if(this.collide(this.players[i])){if(held>=0){p.held=-1;let s=this.skills[held];if(s)s.released=s.age+.85;}}}
 this.skills.forEach(s=>{if(s)for(const b of this.skillBodies(s))this.collide(b,1.1);});
 if(Math.abs(p.z)<=H/2-CORNER_RADIUS&&p.x<-5+p.r){p.x=-5+p.r;p.vx=Math.abs(p.vx);this.events.push({type:'wall',x:p.x,z:p.z});}if(Math.abs(p.z)<=H/2-CORNER_RADIUS&&p.x>5-p.r){p.x=5-p.r;p.vx=-Math.abs(p.vx);this.events.push({type:'wall',x:p.x,z:p.z});}
 // Circular posts stop grazing shots; only the entire puck may cross the goal line.
 for(const z of [-8,8])for(const x of [-GOAL/2,GOAL/2])this.collide({x,z,r:.14,vx:0,vz:0,side:z>0?1:-1});
 if(Math.abs(p.x)>GOAL/2-p.r&&Math.abs(p.x)<=W/2-CORNER_RADIUS){if(p.z<-8+p.r){p.z=-8+p.r;p.vz=Math.abs(p.vz);}if(p.z>8-p.r){p.z=8-p.r;p.vz=-Math.abs(p.vz);}}
 if(roundCorner(p,true))this.events.push({type:'wall',x:p.x,z:p.z});
 if(Math.abs(p.x)<=GOAL/2-p.r&&Math.abs(p.z)>8+p.r){let i=p.z<0?0:1;this.scores[i]++;this.lastScorer=i;this.goalId++;this.events.push({type:'goal',i});this.skills=[null,null];p.held=-1;this.serve=i===0?1:-1;if(this.scores[i]>=this.config.target){this.phase='over';this.winner=i;}else{this.phase='goal';this.wait=1.5;}return;}
 let speed=Math.hypot(p.vx,p.vz);if(speed>this.arena.max){p.vx*=this.arena.max/speed;p.vz*=this.arena.max/speed;}if(p.held<0&&speed<1.2){p.vz+=this.serve*dt*.9;}
 }
 inSand(p){return Math.hypot(p.x+2.4,p.z-2)<1.25||Math.hypot(p.x-2.4,p.z+2)<1.25;}
 snapshot(){return {t:this.t,scores:this.scores,players:this.players,puck:this.puck,skills:this.skills,cooldowns:this.cooldowns,phase:this.phase,wait:this.wait,winner:this.winner,goalId:this.goalId,lastScorer:this.lastScorer};}
 apply(s){for(const k of ['t','scores','players','puck','skills','cooldowns','phase','wait','winner','goalId','lastScorer'])this[k]=s[k];}
}
