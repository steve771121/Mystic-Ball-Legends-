import * as T from '../../vendor/three.module.js?v=0.4.0';
import {ARENAS,GOAL,CORNER_RADIUS} from '../config/game.js?v=0.4.0';
export function arena(type){const group=new T.Group(),cfg=ARENAS[type];
 const material=(color,metalness=.4,roughness=.3)=>new T.MeshStandardMaterial({color,metalness,roughness});
 const glow=color=>new T.MeshStandardMaterial({color,emissive:color,emissiveIntensity:1.7,roughness:.3});
 function box(w,h,d,x,y,z,mat){let m=new T.Mesh(new T.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;group.add(m);return m;}
 function slab(w,d,r,height,y,mat){const shape=new T.Shape(),x=w/2,z=d/2;shape.moveTo(-x+r,-z);shape.lineTo(x-r,-z);shape.absarc(x-r,-z+r,r,-Math.PI/2,0);shape.lineTo(x,z-r);shape.absarc(x-r,z-r,r,0,Math.PI/2);shape.lineTo(-x+r,z);shape.absarc(-x+r,z-r,r,Math.PI/2,Math.PI);shape.lineTo(-x,-z+r);shape.absarc(-x+r,-z+r,r,Math.PI,Math.PI*1.5);const mesh=new T.Mesh(new T.ExtrudeGeometry(shape,{depth:height,bevelEnabled:false,curveSegments:24}),mat);mesh.rotation.x=Math.PI/2;mesh.position.y=y;mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh);}
 const R=CORNER_RADIUS,straight=5-R-GOAL/2;
 let shell=material(0x1b2a35,.7),trim=material(0x809b9b,.8,.22);slab(11,17,R+.5,.7,.23,shell);slab(10,16,R,.2,.42,new T.MeshPhysicalMaterial({color:cfg.surface,metalness:.4,roughness:.23,clearcoat:1}));
 function arc(cx,cz,a,inner,outer,depth,y,mat){let shape=new T.Shape();shape.moveTo(outer*Math.cos(a),outer*Math.sin(a));shape.absarc(0,0,outer,a,a+Math.PI/2,false);shape.lineTo(inner*Math.cos(a+Math.PI/2),inner*Math.sin(a+Math.PI/2));shape.absarc(0,0,inner,a+Math.PI/2,a,true);shape.closePath();let mesh=new T.Mesh(new T.ExtrudeGeometry(shape,{depth,bevelEnabled:false,curveSegments:24}),mat);mesh.rotation.x=Math.PI/2;mesh.position.set(cx,y,cz);mesh.castShadow=true;group.add(mesh);}
 for(const [sx,sz,a] of [[1,1,0],[-1,1,Math.PI/2],[-1,-1,Math.PI],[1,-1,Math.PI*1.5]]){arc(sx*(5-R),sz*(8-R),a,R,R+.25,.5,.82,trim);arc(sx*(5-R),sz*(8-R),a,R-.022,R+.022,.045,.85,glow(cfg.color));}
 for(let side of [-1,1]){box(.25,.5,16-2*R,side*5.125,.57,0,trim);box(.045,.045,16-2*R,side*5,.83,0,glow(cfg.color));for(let x of [-1,1])box(straight,.5,.25,x*(GOAL/2+straight/2),.57,side*8.125,trim);
 box(GOAL,.07,1.1,0,.3,side*8.45,shell);box(GOAL,.5,.15,0,.57,side*8.98,glow(side===1?0x8befdc:0xfca9ba));for(let x of [-1,1])box(.15,.5,1,x*GOAL/2,.57,side*8.5,trim);
 for(let x of [-4.1,4.1]){let foot=box(.7,1.3,.7,x,-1,side*6.4,shell);foot.rotation.z=x>0?-.12:.12;}}
 let line=new T.MeshBasicMaterial({color:0xd1fff1,transparent:true,opacity:.35});box(9.7,.012,.028,0,.432,0,line);
 function ring(r,width,x,z,color=0xd1fff1,opacity=.4){let m=new T.Mesh(new T.RingGeometry(r-width,r,80),new T.MeshBasicMaterial({color,transparent:true,opacity,side:T.DoubleSide}));m.rotation.x=-Math.PI/2;m.position.set(x,.441,z);group.add(m);return m;}
 ring(1.35,.025,0,0);ring(.15,.15,0,0);for(let side of [-1,1])ring(2.1,.025,0,side*8);
 const dots=new T.InstancedMesh(new T.CircleGeometry(.012,4),line,640);let index=0;let dummy=new T.Object3D();dummy.rotation.x=-Math.PI/2;for(let x=-4.5;x<5;x+=.5)for(let z=-7.5;z<8;z+=.5){if(Math.abs(x)>5-R&&Math.abs(z)>8-R&&Math.hypot(Math.abs(x)-(5-R),Math.abs(z)-(8-R))>R-.04)continue;dummy.position.set(x,.433,z);dummy.updateMatrix();dots.setMatrixAt(index++,dummy.matrix);}dots.count=index;group.add(dots);
 if(type==='desert'){for(let [x,z] of [[-2.4,2],[2.4,-2]]){ring(1.25,1.25,x,z,0xb79257,.7);for(let j=0;j<4;j++)ring(.3+j*.27,.02,x,z,0xe4c282,.7);}}
 if(type==='ice'){for(let i=0;i<14;i++){let m=box(.018,.014,1.2+Math.random()*1.5,(Math.random()-.5)*9,.442,(Math.random()-.5)*14,line);m.rotation.y=Math.random()*6;}}
 const wind=new T.Group();group.add(wind);if(type==='wind')for(let i=0;i<28;i++){let m=box(.025,.02,.42,(Math.random()-.5)*9,.5,Math.random()*16-8,new T.MeshBasicMaterial({color:0xd9ffc6,transparent:true,opacity:.55}));group.remove(m);wind.add(m);}
 return {group,wind};}
export function mallet(color){let g=new T.Group();for(let [rt,rb,h,y,c] of [[.62,.68,.19,0,color],[.43,.5,.27,.2,color],[.24,.3,.19,.42,0xeaf5ed]]){let m=new T.Mesh(new T.CylinderGeometry(rt,rb,h,40),new T.MeshPhysicalMaterial({color:c,metalness:.55,roughness:.22,clearcoat:1}));m.position.y=y;m.castShadow=true;g.add(m);}let halo=new T.Mesh(new T.TorusGeometry(.6,.035,8,48),new T.MeshBasicMaterial({color}));halo.rotation.x=Math.PI/2;halo.position.y=-.06;g.add(halo);return g;}
