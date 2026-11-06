import * as THREE from 'three';
import{Car,CARS}from'./car.js';
import{S}from'./city.js';
const DIRS=[[1,0],[-1,0],[0,1],[0,-1]],COLS=[0xcccccc,0x222222,0x8a1c1c,0x1c3f8a,0xe0e0e0,0x6b6b6b,0xd4b23a,0x2d6a4f];
export class Traffic{
 constructor(scene,city,count){this.city=city;this.active=count;this.list=[];
  for(let k=0;k<30;k++){const car=new Car(CARS[(Math.random()*CARS.length)|0],COLS[(Math.random()*COLS.length)|0]);scene.add(car.group);car.group.visible=false;this.list.push({car,v:0,max:12,ni:0,nj:0,dx:1,dz:0,stun:0,st:0});}}
 spawn(a,pl,min,max){
  for(let t=0;t<30;t++){
   const i=Math.round(pl.x/S)+((Math.random()*13)|0)-6,j=Math.round(pl.z/S)+((Math.random()*13)|0)-6,[dx,dz]=DIRS[(Math.random()*4)|0],ni=i+dx,nj=j+dz;
   const x=i*S+dx*S*.5-dz*3.5,z=j*S+dz*S*.5+dx*3.5,d=Math.hypot(x-pl.x,z-pl.z);if(d<min||d>max)continue;
   if(this.list.some(o=>o!==a&&Math.hypot(o.car.group.position.x-x,o.car.group.position.z-z)<10))continue;
   Object.assign(a,{ni,nj,dx,dz,v:8,max:9+Math.random()*6,stun:0,st:0});a.car.group.position.set(x,0,z);a.car.ang=Math.atan2(dx,dz);a.car.group.visible=true;return;}
 }
 spawnAll(pl){this.list.forEach(a=>this.spawn(a,pl,45,220));}
 update(dt,t,pl){
  const ph=this.city.phase(t);
  this.list.forEach((a,idx)=>{
   const car=a.car,p=car.group.position;
   if(idx>=this.active){car.group.visible=false;return;}
   if(!car.group.visible||Math.hypot(p.x-pl.x,p.z-pl.z)>230||a.st>25){a.st=0;this.spawn(a,pl,90,210);if(!car.group.visible)return;}
   const d=(a.ni*S-p.x)*a.dx+(a.nj*S-p.z)*a.dz;let tv=a.max;
   if(d>6&&d<26&&(a.dx?ph!==0:ph!==1))tv=Math.min(tv,Math.max(0,d-8)*.9);
   const chk=(ox,oz)=>{const rx=ox-p.x,rz=oz-p.z,ah=rx*a.dx+rz*a.dz,lat=-rx*a.dz+rz*a.dx;if(ah>1&&ah<18&&Math.abs(lat)<2.4)tv=Math.min(tv,Math.max(0,(ah-6.5)*1.1));};
   const far=Math.hypot(p.x-pl.x,p.z-pl.z)>130;if(!far)for(const o of this.list)if(o!==a&&o.car.group.visible)chk(o.car.group.position.x,o.car.group.position.z);chk(pl.x,pl.z);
   a.v+=Math.max(-12*dt,Math.min(4*dt,tv-a.v));if(a.stun>0){a.stun-=dt;a.v=0;}
   a.st=a.v<.3?a.st+dt:0;
   p.x+=a.dx*a.v*dt;p.z+=a.dz*a.v*dt;
   if((a.ni*S-p.x)*a.dx+(a.nj*S-p.z)*a.dz<=0){
    const opts=DIRS.filter(([x,z])=>!(x===-a.dx&&z===-a.dz)),st=opts.find(([x,z])=>x===a.dx&&z===a.dz);
    const o=opts.length?(st&&Math.random()<.6?st:opts[(Math.random()*opts.length)|0]):[-a.dx,-a.dz];a.dx=o[0];a.dz=o[1];a.ni+=a.dx;a.nj+=a.dz;}
   const k=Math.min(1,dt*3);if(a.dx)p.z+=((a.nj*S+a.dx*3.5)-p.z)*k;else p.x+=((a.ni*S-a.dz*3.5)-p.x)*k;
   let da=Math.atan2(a.dx,a.dz)-car.ang;da=Math.atan2(Math.sin(da),Math.cos(da));car.ang+=da*Math.min(1,dt*4);
   car.braking=tv<a.v-1;car.vf=a.v;if(far)car.group.rotation.y=car.ang;else car.sync(dt);
  });
 }
 collide(pl){
  const P=pl.group.position;
  for(const a of this.list){if(!a.car.group.visible)continue;const p=a.car.group.position,dx=P.x-p.x,dz=P.z-p.z,d=Math.hypot(dx,dz);if(d>=2.7||d<.01)continue;
   const nx=dx/d,nz=dz/d,vn=pl.v.x*nx+pl.v.z*nz;P.x+=nx*(2.7-d);P.z+=nz*(2.7-d);
   if(vn<0){pl.v.x-=1.3*vn*nx;pl.v.z-=1.3*vn*nz;pl.impact(-vn,new THREE.Vector3(p.x+nx*1.3,.8,p.z+nz*1.3));a.stun=.8;a.v=0;}}
 }
}
