import {frilledLizard} from './FrilledLizard.js?v=0.7.2';
import * as T from '../../vendor/three.module.js?v=0.7.2';
// Fixed-size GPU particle pools; no textures, lights, or per-frame mesh creation.
function particles(count,color,soft=false){
 const geo=new T.BufferGeometry();geo.setAttribute('position',new T.BufferAttribute(new Float32Array(count*3),3));geo.setAttribute('strength',new T.BufferAttribute(new Float32Array(count),1));geo.setAttribute('radius',new T.BufferAttribute(new Float32Array(count),1));
 const mat=new T.ShaderMaterial({uniforms:{tint:{value:new T.Color(color)},scale:{value:1}},transparent:true,depthWrite:false,blending:soft?T.NormalBlending:T.AdditiveBlending,
 vertexShader:'attribute float strength;attribute float radius;uniform float scale;varying float a;void main(){a=strength;vec4 p=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*p;gl_PointSize=clamp(radius*scale,1.,96.);}',
 fragmentShader:`uniform vec3 tint;varying float a;void main(){vec2 p=gl_PointCoord*2.-1.;float r=length(p);float glow=${soft?'exp(-r*r*2.5)*(1.-smoothstep(.65,1.,r))':'max(pow(max(0.,1.-r),3.),.55*exp(-min(abs(p.x),abs(p.y))*28.)*pow(max(0.,1.-r),2.))'};gl_FragColor=vec4(tint,a*glow);}`});
 const points=new T.Points(geo,mat);points.frustumCulled=false;return points;
}
export class ArenaEffects {
 constructor(type){this.type=type;this.group=new T.Group();this.group.name='arena-effects';this.lizards=[];
 if(type==='space'||type==='ice'){this.pool=particles(type==='space'?76:88,type==='space'?0xa9cdff:0xd8f8ff,type==='ice');this.group.add(this.pool);}
 if(type==='space'){
 this.glow=new T.Mesh(new T.PlaneGeometry(1.8,1.8),new T.ShaderMaterial({uniforms:{alpha:{value:0}},transparent:true,depthWrite:false,side:T.DoubleSide,blending:T.AdditiveBlending,vertexShader:'varying vec2 uvp;void main(){uvp=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'uniform float alpha;varying vec2 uvp;void main(){float r=length(uvp*2.-1.);gl_FragColor=vec4(.6,.8,1.,alpha*exp(-r*r*4.)*(1.-smoothstep(.65,1.,r)));}'}));this.glow.rotation.x=-Math.PI/2;this.group.add(this.glow);
 }
 if(type==='desert')for(const [i,x,z] of [[0,-2.4,2],[1,2.4,-2]]){
 const lizard=frilledLizard();lizard.position.set(x,.44,z);lizard.rotation.y=i?Math.PI:0;
 const ripple=new T.Mesh(new T.RingGeometry(.76,.81,48),new T.MeshBasicMaterial({color:0xf4d69b,transparent:true,opacity:.4,side:T.DoubleSide,depthWrite:false}));ripple.rotation.x=-Math.PI/2;ripple.position.set(x,.455,z);this.group.add(ripple,lizard);this.lizards.push({lizard,ripple,i});
 }
 if(type==='wind'){
 const markers=new T.BufferGeometry();markers.setAttribute('position',new T.BufferAttribute(new Float32Array(28*2*3),3));this.windMarks=new T.LineSegments(markers,new T.LineBasicMaterial({color:0xd9ffc6,transparent:true,opacity:.55,depthWrite:false}));this.windMarks.frustumCulled=false;this.group.add(this.windMarks);
 const geo=new T.BufferGeometry();geo.setAttribute('position',new T.BufferAttribute(new Float32Array(6*8*3),3));const colors=new Float32Array(6*8*3);for(let i=0;i<6;i++)for(let j=0;j<8;j++){const a=.12+.88*j/7;colors.set([a*.72,a,a*.82],i*24+j*3);}geo.setAttribute('color',new T.BufferAttribute(colors,3));this.streams=new T.LineSegments(geo,new T.LineBasicMaterial({vertexColors:true,transparent:true,opacity:.48,depthWrite:false,blending:T.AdditiveBlending}));this.streams.frustumCulled=false;this.group.add(this.streams);
 }
 }
 update(state,time,renderer,camera,puck){const t=time,type=this.type;
 if(this.pool){const g=this.pool.geometry,p=g.attributes.position.array,a=g.attributes.strength.array,r=g.attributes.radius.array,n=a.length;
 this.pool.material.uniforms.scale.value=camera.isOrthographicCamera?renderer.domElement.height/(camera.top-camera.bottom):renderer.domElement.height/27;
 for(let i=0;i<n;i++){
 const seed=(i*.61803398875)%1;
 if(type==='space'){p[i*3]=((i*.754877666)%1-.5)*8.7;p[i*3+1]=.455;p[i*3+2]=(seed-.5)*14;a[i]=.15+.8*Math.pow(.5+.5*Math.sin(t*(1.2+seed*2)+i*3),5);r[i]=.10+seed*.18;}
 else {const f=(t*.28+seed)%1,side=i%4,u=((i*.41421356)%1)*2-1;p[i*3]=side<2?(side===0?-4.65:4.65)+Math.sin(t+i)*.08:u*4.2;p[i*3+2]=side<2?u*6.25:(side===2?-7.6:7.6);if(side>=2&&Math.abs(p[i*3])<2)p[i*3]=Math.sign(p[i*3]||1)*2.1;p[i*3+1]=.52+f*.85;a[i]=Math.sin(f*Math.PI)*.23;r[i]=1.0+f*1.5;p[i*3]+=(side===0?1:side===1?-1:0)*f*.22;}
 }
 for(const name of ['position','strength','radius'])g.attributes[name].needsUpdate=true;
 }
 if(type==='space'){const elapsed=state.t-(state.impact?.t??-99),flash=state.phase==='playing'&&elapsed>=0?Math.max(0,1-elapsed/.42):0;puck.material.emissiveIntensity=1.5+flash*5;this.glow.visible=!state.puck.hidden&&flash>0;this.glow.position.copy(puck.position);this.glow.position.y=.455;this.glow.scale.setScalar(1+(1-flash)*.75);this.glow.material.uniforms.alpha.value=flash*.85;}
 for(const {lizard,ripple,i} of this.lizards){
 const celebrate=state.phase==='goal'||state.phase==='over',phase=(t+i*3.7)%7.4,rise=celebrate?1:phase<3.1?Math.pow(Math.sin(phase/3.1*Math.PI),1.3):0;
 lizard.visible=rise>.04;lizard.position.y=.44-(1-rise)*.8+(celebrate?Math.abs(Math.sin(t*9))*.1:0);
 const dx=state.puck.x-lizard.position.x,dz=state.puck.z-lizard.position.z,near=!state.puck.hidden&&Math.hypot(dx,dz)<3.2,target=near?Math.atan2(dx,dz):(i?Math.PI:0);
 const elapsed=Math.min(.05,Math.max(0,t-(lizard.userData.lastTime??t)));lizard.userData.lastTime=t;
 const delta=Math.atan2(Math.sin(target-lizard.rotation.y),Math.cos(target-lizard.rotation.y));lizard.rotation.y+=delta*(1-Math.exp(-elapsed*7));
 lizard.userData.frill.scale.setScalar(celebrate?1.25+.09*Math.sin(t*9):.86+.035*Math.sin(t*3+i));lizard.rotation.z=Math.sin(t*(celebrate?9:2)+i)*(celebrate?.12:.07)*rise;
 ripple.scale.setScalar(.8+((t*1.2+i)%1)*.55);ripple.material.opacity=rise*(celebrate?.55:.35);
 }
 if(this.streams){const k=Math.floor(state.t/6)%3,dx=k===2?Math.sin(state.t*1.4):0,dz=k===0?-1:k===1?1:0;const speed=Math.hypot(dx,dz),nx=speed>.001?dx/speed:1,nz=speed>.001?dz/speed:0;const p=this.streams.geometry.attributes.position.array;
 // Integral of the lateral sine matches the actual left/right force, including reversals.
 const travel=k===2?-Math.cos(state.t*1.4)*2:state.t*3;
 for(let i=0;i<6;i++){let x=(((i*.754877666)%1)*7+(k===2?travel:0)+84)%7-3.5,z=(((i*.61803398875)%1)*11.6+(k===2?0:travel*dz)+139.2)%11.6-5.8;const length=.65+speed*.35,bend=Math.sin(t*1.3+i)*.12,y=.49;
 for(let j=0;j<4;j++)for(let e=0;e<2;e++){const f=(j+e)/4,curve=Math.sin(f*Math.PI)*bend,offset=i*24+(j*2+e)*3;p[offset]=x-nx*length*(1-f)+nz*curve;p[offset+1]=y;p[offset+2]=z-nz*length*(1-f)-nx*curve;}}
 const marks=this.windMarks.geometry.attributes.position.array;for(let i=0;i<28;i++){const x=(((i*.754877666)%1)*8.4+(k===2?travel:0)+84)%8.4-4.2,z=(((i*.61803398875)%1)*13.8+(k===2?0:travel*dz)+138)%13.8-6.9;marks.set([x-nx*.38,.49,z-nz*.38,x,.49,z],i*6);}this.windMarks.geometry.attributes.position.needsUpdate=true;this.windMarks.material.opacity=.2+speed*.35;this.streams.material.opacity=.06+speed*.15;this.streams.geometry.attributes.position.needsUpdate=true;
 }
 }
 dispose(){const geometries=new Set(),materials=new Set();this.group.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material)materials.add(o.material);});geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());}
}
