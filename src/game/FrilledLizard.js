import * as T from '../../vendor/three.module.js?v=0.7.0';
// Face points upward so the expression reads clearly from the playing camera.
export function frilledLizard(){
 const root=new T.Group(),frill=new T.Group();root.add(frill);
 const mat=color=>new T.MeshStandardMaterial({color,roughness:.72});
 const green=mat(0x94c66c),muzzle=mat(0xd7e7a2),orange=mat(0xe8a05f),cream=mat(0xffd998),white=mat(0xfffff2),dark=mat(0x273b35),pink=mat(0xedaa95);
 const sphere=new T.SphereGeometry(1,16,10);
 function ball(x,y,z,sx,sy,sz,m){const o=new T.Mesh(sphere,m);o.position.set(x,y,z);o.scale.set(sx,sy,sz);root.add(o);return o;}
 const shape=new T.Shape();for(let i=0;i<=96;i++){const a=i/96*Math.PI*2,r=.76+.055*Math.cos(a*12),x=Math.cos(a)*r,z=Math.sin(a)*r;if(i===0)shape.moveTo(x,z);else shape.lineTo(x,z);}shape.closePath();
 const fan=new T.Mesh(new T.ExtrudeGeometry(shape,{depth:.065,bevelEnabled:true,bevelSize:.02,bevelThickness:.02,bevelSegments:1,steps:1}),orange);fan.rotation.x=-Math.PI/2;fan.position.y=.23;frill.add(fan);
 for(let i=0;i<12;i++){const a=i/12*Math.PI*2;const rib=new T.Mesh(new T.CapsuleGeometry(.018,.36,2,5),cream);rib.rotation.set(Math.PI/2,0,-a);rib.position.set(Math.sin(a)*.55,.31,Math.cos(a)*.55);frill.add(rib);}
 ball(0,.38,0,.41,.25,.42,green);ball(0,.48,.27,.29,.14,.22,muzzle);
 for(const side of [-1,1]){ball(side*.23,.56,.02,.15,.13,.17,green);ball(side*.23,.65,.08,.115,.075,.13,white);ball(side*.23,.715,.11,.061,.032,.074,dark);ball(side*.23-.019,.745,.085,.022,.013,.023,white);ball(side*.30,.535,.24,.073,.025,.045,pink);ball(side*.10,.603,.32,.025,.012,.02,dark);}
 const smile=new T.CatmullRomCurve3([new T.Vector3(-.13,.58,.38),new T.Vector3(0,.59,.42),new T.Vector3(.13,.58,.38)]);root.add(new T.Mesh(new T.TubeGeometry(smile,12,.012,5,false),dark));
 root.userData.frill=frill;return root;
}
