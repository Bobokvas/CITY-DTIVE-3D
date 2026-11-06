import * as THREE from 'three';
export const CARS=[
{name:'Sports Coupe',color:0xd11f1f,acc:15,max:58,brk:30,steer:.5,grip:6.5,mass:1300,body:[1.9,.5,4.2],cab:[1.55,.45,1.8,-.25]},
{name:'Sports Sedan',color:0x1f4fd1,acc:13,max:54,brk:27,steer:.5,grip:6,mass:1600,body:[1.9,.55,4.8],cab:[1.6,.5,2.4,-.2]},
{name:'City Sedan',color:0xd8d8d8,acc:8,max:42,brk:20,steer:.55,grip:5.5,mass:1400,body:[1.8,.6,4.5],cab:[1.55,.55,2.3,-.15]},
{name:'SUV',color:0x2c5a3a,acc:9,max:44,brk:21,steer:.45,grip:5,mass:2200,body:[2,.8,4.7],cab:[1.8,.65,2.8,-.3]},
{name:'Pickup Truck',color:0xc79a1a,acc:8.5,max:42,brk:20,steer:.42,grip:4.8,mass:2400,body:[2,.8,5.4],cab:[1.8,.65,1.8,.8],bed:1}];
const WG=new THREE.CylinderGeometry(.36,.36,.26,14),WM=new THREE.MeshStandardMaterial({color:0x151515,roughness:.8});
const clamp=THREE.MathUtils.clamp;
export class Car{
 constructor(spec,color=spec.color,shadow=false){
  this.spec=spec;this.v=new THREE.Vector3();this.ang=0;this.steer=0;this.dmg=0;this.vf=0;this.braking=false;this.hitCd=0;this.pitch=0;this.roll=0;this.onHit=null;
  const g=this.group=new THREE.Group(),[bw,bh,bl]=spec.body,[cw,ch,cl,cz]=spec.cab,by=.3+bh/2;
  this.base=new THREE.Color(color);this.bodyMat=new THREE.MeshStandardMaterial({color,metalness:.55,roughness:.35});
  const tilt=this.tilt=new THREE.Group();g.add(tilt);
  const body=new THREE.Mesh(new THREE.BoxGeometry(bw,bh,bl,6,2,10),this.bodyMat);body.position.y=by;
  const cab=new THREE.Mesh(new THREE.BoxGeometry(cw,ch,cl,4,2,5),new THREE.MeshStandardMaterial({color:0x1a2633,metalness:.8,roughness:.15}));cab.position.set(0,.3+bh+ch/2,cz);
  tilt.add(body,cab);this.def=[body,cab];
  if(spec.bed){const b=new THREE.Mesh(new THREE.BoxGeometry(bw-.2,.3,2.3),new THREE.MeshStandardMaterial({color:0x2a2a2a}));b.position.set(0,.3+bh+.15,-bl/2+1.3);tilt.add(b);}
  this.tail=new THREE.MeshStandardMaterial({color:0x550000,emissive:0xff0000,emissiveIntensity:.3});
  const hd=new THREE.MeshStandardMaterial({color:0xffffff,emissive:0xfff2c0,emissiveIntensity:1.5}),lg=new THREE.BoxGeometry(.4,.14,.06);
  for(const s of[-1,1]){const h=new THREE.Mesh(lg,hd);h.position.set(s*bw*.34,by+.05,bl/2);const t=new THREE.Mesh(lg,this.tail);t.position.set(s*bw*.34,by+.1,-bl/2);tilt.add(h,t);}
  this.wheels=[];
  for(const sx of[-1,1])for(const sz of[-1,1]){const piv=new THREE.Group(),sp=new THREE.Group(),w=new THREE.Mesh(WG,WM);w.rotation.z=Math.PI/2;sp.add(w);piv.add(sp);piv.position.set(sx*(bw/2-.02),.36,sz*bl*.32);g.add(piv);this.wheels.push({piv,sp,front:sz>0});}
  g.traverse(o=>{if(o.isMesh)o.castShadow=shadow;});
 }
 step(dt,inp,cols){
  const s=this.spec,sn=Math.sin(this.ang),cs=Math.cos(this.ang),v=this.v;
  let vf=v.x*sn+v.z*cs,vl=-v.x*cs+v.z*sn,a=0;const pv=vf;this.braking=false;
  this.steer+=((inp.left-inp.right)*s.steer/(1+Math.abs(vf)*.045)-this.steer)*Math.min(1,dt*7);
  if(inp.thr)a=vf<-1?s.brk:s.acc*Math.max(0,1-vf/s.max);
  else if(inp.brk){if(vf>1){a=-s.brk;this.braking=true;}else a=vf>-10?-s.acc*.5:0;}
  else if(Math.abs(vf)>.2)a=-Math.sign(vf)*(1.2+Math.abs(vf)*.05);
  if(inp.hand){a-=Math.sign(vf)*Math.min(Math.abs(vf)/dt,14);this.braking=true;}
  vf+=a*dt;if(!inp.thr&&!inp.brk&&pv*vf<0)vf=0;
  vl*=Math.exp(-s.grip*(inp.hand?.2:1)*dt);
  const yaw=vf*this.steer/(s.body[2]*.62)*(inp.hand?1.35:1);
  this.ang+=yaw*dt;v.x=sn*vf-cs*vl;v.z=cs*vf+sn*vl;this.vf=vf;
  const p=this.group.position;p.x+=v.x*dt;p.z+=v.z*dt;
  const k=Math.min(1,dt*6);this.pitch+=(-a*.004-this.pitch)*k;this.roll+=(yaw*vf*.0012-this.roll)*k;
  this.hitCd-=dt;this.collide(cols);
 }
 collide(cols){
  const p=this.group.position,L=this.spec.body[2],rad=this.spec.body[0]*.5+.1,fx=Math.sin(this.ang),fz=Math.cos(this.ang),v=this.v;
  for(const o of[-.3,0,.3]){let cx=p.x+fx*L*o,cz=p.z+fz*L*o;
   for(const c of cols){if(c.dead||Math.abs(c.x-cx)>c.hw+rad||Math.abs(c.z-cz)>c.hd+rad)continue;
    const qx=clamp(cx,c.x-c.hw,c.x+c.hw),qz=clamp(cz,c.z-c.hd,c.z+c.hd);let dx=cx-qx,dz=cz-qz,d2=dx*dx+dz*dz;if(d2>=rad*rad)continue;
    let d=Math.sqrt(d2),nx,nz;if(d<1e-3){nx=Math.sign(cx-c.x)||1;nz=0;d=0;}else{nx=dx/d;nz=dz/d;}
    const pen=rad-d;p.x+=nx*pen;p.z+=nz*pen;cx+=nx*pen;cz+=nz*pen;
    const vn=v.x*nx+v.z*nz;if(vn<0){v.x-=1.15*vn*nx;v.z-=1.15*vn*nz;v.multiplyScalar(.98);this.impact(-vn,new THREE.Vector3(qx,.8,qz));if(c.tree&&-vn>5&&this.onTree)this.onTree(c);}
   }}
 }
 impact(sev,wp){
  if(sev<2||this.hitCd>0)return;this.hitCd=.2;
  this.dmg=Math.min(100,this.dmg+Math.pow(sev,1.6)*.45);
  const lp=this.group.worldToLocal(wp.clone()),R=1.3+sev*.05,amt=Math.min(.6,sev*.03),dir=new THREE.Vector2(-lp.x,-lp.z).normalize(),v=new THREE.Vector3();
  for(const m of this.def){const pos=m.geometry.attributes.position;
   for(let i=0;i<pos.count;i++){v.fromBufferAttribute(pos,i).add(m.position);const d=v.distanceTo(lp);if(d<R){const k=(1-d/R)*amt;pos.setXYZ(i,pos.getX(i)+dir.x*k+(Math.random()-.5)*k*.5,pos.getY(i)+(Math.random()-.5)*k*.5,pos.getZ(i)+dir.y*k+(Math.random()-.5)*k*.5);}}
   pos.needsUpdate=true;m.geometry.computeVertexNormals();}
  this.bodyMat.color.copy(this.base).lerp(new THREE.Color(0x222222),this.dmg/140);this.bodyMat.roughness=.35+this.dmg/200;
  if(this.onHit)this.onHit(sev);
 }
 sync(dt){
  this.group.rotation.y=this.ang;this.tilt.rotation.set(this.pitch,0,this.roll);
  for(const w of this.wheels){w.sp.rotation.x+=this.vf*dt/.36;if(w.front)w.piv.rotation.y=this.steer;}
  this.tail.emissiveIntensity=this.braking?3:.3;
 }
}
