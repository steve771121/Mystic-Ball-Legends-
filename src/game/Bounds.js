import {W,H,CORNER_RADIUS} from '../config/game.js?v=0.7.1';
// Shared with arena geometry: circles tangent to the straight rails.
export function roundCorner(body, reflect=false){
 const sx=Math.sign(body.x)||1,sz=Math.sign(body.z)||1;
 const cx=W/2-CORNER_RADIUS,cz=H/2-CORNER_RADIUS;
 const dx=Math.abs(body.x)-cx,dz=Math.abs(body.z)-cz;
 if(dx<=0||dz<=0)return false;
 const d=Math.hypot(dx,dz),limit=CORNER_RADIUS-body.r;
 if(d<=limit)return false;
 const nx=sx*dx/d,nz=sz*dz/d;
 body.x=sx*cx+nx*(limit-.0001);body.z=sz*cz+nz*(limit-.0001);
 if(reflect){
  const outward=body.vx*nx+body.vz*nz;
  if(outward>0){body.vx-=2*outward*nx;body.vz-=2*outward*nz;}
  // A nearly motionless puck must leave the curved rail, not rest against it.
  const inward=-(body.vx*nx+body.vz*nz);
  if(Math.hypot(body.vx,body.vz)<1.2&&inward<.6){body.vx-=(.6-inward)*nx;body.vz-=(.6-inward)*nz;}
 }
 return true;
}
