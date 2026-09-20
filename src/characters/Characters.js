import * as T from '../../vendor/three.module.js?v=0.4.0';
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
export function animateCharacter(g,t,mood=0,ballX=0){let p=g.userData.parts;g.position.y=g.userData.baseY+(mood>0?Math.abs(Math.sin(t*9))*.3:Math.sin(t*2.5)*.035);p.head.rotation.y=Math.max(-.3,Math.min(.3,ballX*.045));p.head.rotation.z=Math.sin(t*2)*.04;p['arm1'].rotation.z=.35+(mood>0?Math.sin(t*12)*.8:0);p['arm-1'].rotation.z=-.35-(mood>0?Math.sin(t*12)*.8:0);}
