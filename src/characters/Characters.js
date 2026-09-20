import * as T from '../../vendor/three.module.js?v=0.7.0';
export function character(type='bear'){
 const g=new T.Group(),parts={};const colors={bear:[0xefadbf,0xffe0db],duck:[0xffda70,0xffefb4],cat:[0xa798e4,0xe2daff]},[base,light]=colors[type]||colors.bear;
 function ball(name,x,y,z,sx,sy,sz,color){let m=new T.Mesh(new T.SphereGeometry(1,24,16),new T.MeshStandardMaterial({color,roughness:.7}));m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.castShadow=true;g.add(m);parts[name]=m;return m;}
 ball('body',0,.62,0,.5,.57,.43,base);ball('belly',0,.57,.37,.33,.36,.09,light);
 const head=new T.Group();head.position.y=1.35;g.add(head);parts.head=head;
 function hb(name,x,y,z,sx,sy,sz,c){let m=ball(name,x,y,z,sx,sy,sz,c);g.remove(m);head.add(m);return m;}
 hb('headBall',0,0,0,.62,.56,.53,base);
 if(type==='bear'){for(let side of [-1,1]){hb('ear'+side,side*.45,.43,0,.23,.24,.16,base);hb('inner'+side,side*.45,.44,.12,.13,.14,.07,light);}hb('muzzle',0,-.15,.46,.28,.19,.1,light);hb('nose',0,-.1,.57,.08,.06,.055,0x503740);}
 if(type==='duck'){hb('bill',0,-.15,.55,.34,.12,.25,0xf2a044);hb('tuft',-.08,.55,0,.1,.21,.1,base);hb('tuft2',.08,.53,0,.08,.15,.08,base);}
 if(type==='cat'){for(let side of [-1,1]){let ear=new T.Mesh(new T.ConeGeometry(.25,.48,3),new T.MeshStandardMaterial({color:base}));ear.position.set(side*.4,.48,0);ear.rotation.y=Math.PI/6;head.add(ear);hb('cheek'+side,side*.15,-.18,.49,.18,.13,.06,light);}hb('nose',0,-.13,.57,.065,.045,.035,0x72547e);let tail=ball('tail',.58,.47,-.3,.16,.47,.15,base);tail.rotation.z=-.6;}
 for(let side of [-1,1]){hb('eye'+side,side*.23,.065,.49,.06,.085,.038,0x282638);hb('glint'+side,side*.215,.09,.523,.02,.025,.011,0xffffff);hb('blush'+side,side*.38,-.12,.43,.1,.05,.025,0xf3a4b0);let a=ball('arm'+side,side*.51,.66,.03,.17,.32,.2,base);a.rotation.z=side*.35;ball('foot'+side,side*.27,.09,.17,.23,.18,.3,type==='duck'?0xf2a044:base);if(type==='bear'){ball('pad'+side,side*.27,.105,.435,.11,.095,.025,0xe8789f);for(let j=-1;j<=1;j++)ball('toe'+side+j,side*.27+j*.075,.22,.43,.035,.035,.025,0xe8789f);ball('handpad'+side,side*.59,.5,.18,.07,.09,.025,0xe8789f);}}
 g.userData={parts,type};return g;
}
// Only sideline characters get shoulder pivots; skill meshes retain their own rig.
export function animateCharacter(g,t,mood=0,puck={x:0,z:0}){
 const p=g.userData.parts;
 if(!g.userData.cheerRig){
  for(const side of [-1,1]){const pivot=new T.Group();pivot.position.set(side*.43,.87,.03);g.add(pivot);g.updateMatrixWorld(true);pivot.attach(p['arm'+side]);if(p['handpad'+side])pivot.attach(p['handpad'+side]);p['shoulder'+side]=pivot;}
  g.userData.cheerRig=true;
 }
 // All models face local +Z. Face the court, then track the puck within a small arc.
 g.rotation.y=Math.atan2(-g.position.x,-g.position.z);
 const target=Math.atan2(puck.x-g.position.x,puck.z-g.position.z),delta=Math.atan2(Math.sin(target-g.rotation.y),Math.cos(target-g.rotation.y));
 const beat=t*(mood>0?10:4.4),bounce=mood>0?.26:.085;
 g.position.y=g.userData.baseY+Math.abs(Math.sin(beat*.5))*bounce;
 g.rotation.z=Math.sin(beat*.5)*.035;
 p.head.rotation.y=Math.max(-.42,Math.min(.42,delta));p.head.rotation.z=Math.sin(beat*.5)*.055;p.head.rotation.x=-.08+Math.sin(beat)*.025;
 for(const side of [-1,1]){p['shoulder'+side].rotation.z=side*(1.55+Math.sin(beat+(side===1?0:.8))*(mood>0?.65:.38));p['shoulder'+side].rotation.x=Math.sin(beat*.7+side)*.16;}
 if(p.tail)p.tail.rotation.z=-.6+Math.sin(beat)*.15;
}
