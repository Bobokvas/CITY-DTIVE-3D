import * as THREE from 'three';
export const CAMS=['Chase','Close chase','Cockpit'];
const wrap=a=>Math.atan2(Math.sin(a),Math.cos(a));
export class CamRig{
 constructor(cam,cols){this.cam=cam;this.w=cols;this.mode=0;this.ca=0;this.p=new THREE.Vector3();this.init=true;}
 cycle(){this.mode=(this.mode+1)%3;this.init=true;}
 hit(x,y,z){for(const c of this.w.bcols)if(Math.abs(x-c.x)<c.hw+.8&&Math.abs(z-c.z)<c.hd+.8&&y<c.h+.3)return true;return false;}
 update(car,dt,look){
  const g=car.group,P=g.position,c=this.cam;
  if(!look.drag)look.yaw*=Math.exp(-dt*1.5);
  this.ca=this.init?car.ang:this.ca+wrap(car.ang-this.ca)*Math.min(1,dt*(this.mode?8:4));
  c.fov+=(55+Math.min(Math.abs(car.vf)/60,1)*20-c.fov)*.05;c.updateProjectionMatrix();
  if(this.mode===2){
   g.updateMatrixWorld(true);c.position.copy(g.localToWorld(new THREE.Vector3(.4,1.25,car.spec.cab[3]-.3)));
   const a=car.ang+look.yaw;c.lookAt(c.position.x+Math.sin(a)*10,c.position.y-.1,c.position.z+Math.cos(a)*10);this.init=false;return;}
  const a=this.ca+look.yaw,sn=Math.sin(a),cs=Math.cos(a),dist=this.mode?6.2:9.5,h=this.mode?1.9:3.6;
  let k=1,x,y=P.y+h,z;for(;k>.15;k-=.1){x=P.x-sn*dist*k;z=P.z-cs*dist*k;y=P.y+1+(h-1)*k;if(!this.hit(x,y,z))break;}
  const want=new THREE.Vector3(x,y,z);
  if(this.init){this.p.copy(want);this.init=false;}else this.p.lerp(want,1-Math.exp(-dt*10));
  c.position.copy(this.p);c.lookAt(P.x+sn*4,P.y+1.2,P.z+cs*4);
 }
}
