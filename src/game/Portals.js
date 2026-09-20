// All random decisions run only in the authoritative Physics instance.
export function portalState(){return {pair:null,nextIn:5,transit:null,cooldown:0,serial:0};}
export function updatePortals(g,dt){
 const s=g.portals,p=g.puck;if(g.config.arena!=='space')return false;
 s.cooldown=Math.max(0,s.cooldown-dt);
 if(s.transit){s.transit.left-=dt;if(s.transit.left<=0){const q=s.transit;Object.assign(p,{x:q.x,z:q.z,vx:q.vx,vz:q.vz,hidden:false});s.transit=null;s.cooldown=1;s.serial++;}return true;}
 if(s.pair){s.pair.age+=dt;if(s.pair.age>8){s.pair=null;s.nextIn=7+Math.random()*4;}}
 else if((s.nextIn-=dt)<=0){const x=(1.5+Math.random())*(Math.random()<.5?-1:1),z=2+Math.random()*1.3;s.pair={age:0,holes:[{x,z},{x:-x,z:-z}]};}
 return false;
}
export function enterPortal(g){const s=g.portals,p=g.puck;if(!s.pair||s.pair.age<.65||s.cooldown>0||p.held>=0||p.hidden)return false;
 const i=s.pair.holes.findIndex(h=>Math.hypot(p.x-h.x,p.z-h.z)<.6);if(i<0)return false;
 const exit=s.pair.holes[1-i],speed=Math.hypot(p.vx,p.vz),nx=speed>.01?p.vx/speed:0,nz=speed>.01?p.vz/speed:g.serve,v=Math.max(6,Math.min(g.arena.max,speed));
 s.transit={left:.32,x:exit.x+nx*1.1,z:exit.z+nz*1.1,vx:nx*v,vz:nz*v};p.hidden=true;p.vx=p.vz=0;s.serial++;return true;
}
