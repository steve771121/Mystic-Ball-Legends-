import * as T from '../../vendor/three.module.js?v=0.6.0';
// Fit the physical table and both goals, not the decorative sideline characters.
export function playCamera(width,height,side=1){
 const aspect=width/height,portrait=aspect<1;
 const camera=new T.OrthographicCamera(-1,1,1,-1,.1,100);
 camera.position.set(0,30,side*(portrait?7:17));camera.lookAt(0,.45,0);camera.updateMatrixWorld();
 const points=[];for(const x of [-5.55,5.55])for(const z of [-9.15,9.15])for(const y of [-.5,1.1])points.push(new T.Vector3(x,y,z).applyMatrix4(camera.matrixWorldInverse));
 const minY=Math.min(...points.map(p=>p.y)),maxY=Math.max(...points.map(p=>p.y));
 const halfHeight=Math.max((maxY-minY)/2,5.55/aspect)*1.025;
 const centerY=(maxY+minY)/2;
 camera.left=-halfHeight*aspect;camera.right=halfHeight*aspect;camera.top=centerY+halfHeight;camera.bottom=centerY-halfHeight;camera.updateProjectionMatrix();
 return camera;
}
