import * as T from '../../vendor/three.module.js?v=0.7.0';
export function portalVisual(){
 const root=new T.Group();
 for(let i=0;i<2;i++){
  const hole=new T.Group(),color=i?0x65f4ff:0xbe83ff;
  const core=new T.Mesh(new T.CircleGeometry(.62,64),new T.MeshBasicMaterial({color:0x03020b,side:T.DoubleSide}));core.rotation.x=-Math.PI/2;hole.add(core);
  for(let j=0;j<4;j++){const ring=new T.Mesh(new T.RingGeometry(.64+j*.105,.70+j*.105,72,1,j*.8,Math.PI*(j===0?2:1.55)),new T.MeshBasicMaterial({color,transparent:true,opacity:1-j*.2,side:T.DoubleSide,depthWrite:false}));ring.rotation.x=-Math.PI/2;ring.position.y=.012+j*.004;hole.add(ring);}
  root.add(hole);
 }
 return root;
}
export function drawPortals(root,state,time){const pair=state.portals?.pair;root.visible=!!pair;if(!pair)return;root.children.forEach((hole,i)=>{const h=pair.holes[i];hole.position.set(h.x,.46,h.z);hole.scale.setScalar(Math.min(1,pair.age/.65,Math.max(.08,(8-pair.age)/.5)));hole.children.slice(1).forEach((ring,j)=>ring.rotation.z=time*(j%2?1:-1)*(1+j*.3)+i);});}
