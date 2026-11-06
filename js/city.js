import * as THREE from 'three';
export const S=74,C=S*3; // S: block pitch (road + block). C: chunk = 3x3 blocks
function h2(i,j,s,k){let h=Math.imul(i,374761393)^Math.imul(j,668265263)^Math.imul(s,1274126177)^Math.imul(k,2246822519);h=Math.imul(h^(h>>>15),2246822519);h=Math.imul(h^(h>>>13),3266489917);h^=h>>>16;return(h>>>0)/4294967296;}
const lp=(a,b,t)=>a+(b-a)*t;
function vn(x,z,s,k){const i=Math.floor(x),j=Math.floor(z),u=x-i,v=z-j,a=u*u*(3-2*u),b=v*v*(3-2*v);return lp(lp(h2(i,j,s,k),h2(i+1,j,s,k),a),lp(h2(i,j+1,s,k),h2(i+1,j+1,s,k),a),b);}
function district(i,j,s){const den=vn(i/6,j/6,s,1),kd=vn(i/5,j/5,s,2),r=h2(i,j,s,3);
 if(r<.1&&den<.65)return'park';if(r>.9&&den<.7)return'parking';
 if(den>.62)return'downtown';if(kd>.62)return'industrial';if(kd<.45)return'residential';return'commercial';}
function tex(draw,w,h,rep){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;if(rep)t.repeat.set(rep,rep);t.anisotropy=4;return t;}
const BOX=new THREE.BoxGeometry(1,1,1),DASH=new THREE.BoxGeometry(3,.02,.25),CYL=new THREE.CylinderGeometry(.2,.28,3,6),ICO=new THREE.IcosahedronGeometry(2,1),POLE=new THREE.CylinderGeometry(.12,.12,5.5,6),HEAD=new THREE.BoxGeometry(.5,.5,.5);
const D=new THREE.Object3D(),CL=new THREE.Color(),ZERO=new THREE.Matrix4().makeScale(0,0,0);
const put=(m,k,x,y,z,sx,sy,sz,ry)=>{D.position.set(x,y,z);D.rotation.set(0,ry||0,0);D.scale.set(sx,sy,sz);D.updateMatrix();m.setMatrixAt(k,D.matrix);};
class Chunk{ // pooled: all meshes are preallocated InstancedMeshes that get refilled
 constructor(w){const M=w.m,g=this.g=new THREE.Group(),mk=(geo,mat,n)=>{const m=new THREE.InstancedMesh(geo,mat,n);m.receiveShadow=true;g.add(m);return m;};
  this.road=mk(BOX,M.asph,6);this.dash=mk(DASH,M.dash,180);this.pad=mk(BOX,M.pad,9);this.bld=mk(BOX,M.bTex,36);this.trk=mk(CYL,M.trunk,260);this.cnp=mk(ICO,M.leaf,260);this.pole=mk(POLE,M.pole,36);this.hA=mk(HEAD,M.A,36);this.hB=mk(HEAD,M.B,36);w.scene.add(g);this.l=-1;}
 build(cx,cz,w){
  const s=w.seed,cols=[],bc=[];let nb=0,nt=0,nd=0,np=0,npd=0,k=0;this.cx=cx;this.cz=cz;this.l=-1;
  for(let a=0;a<3;a++){const i=cx*3+a,j=cz*3+a;
   put(this.road,k++,i*S,.06,cz*C+C/2,14,.1,C+14);put(this.road,k++,cx*C+C/2,.05,j*S,C+14,.1,14);
   for(let o=0;o<C;o+=8){const mz=(((cz*C+o)%S)+S)%S,mx=(((cx*C+o)%S)+S)%S;
    if(mz>=9&&mz<=S-9)put(this.dash,nd++,i*S,.12,cz*C+o,1,1,1,Math.PI/2);
    if(mx>=9&&mx<=S-9)put(this.dash,nd++,cx*C+o,.12,j*S,1,1,1,0);}}
  for(let a=0;a<3;a++)for(let b=0;b<3;b++){
   const i=cx*3+a,j=cz*3+b,x=i*S+S/2,z=j*S+S/2,ty=district(i,j,s),r=n=>h2(i,j,s,n),ind=ty==='industrial',res=ty==='residential';
   put(this.pad,npd,x,.15,z,60,.3,60);this.pad.setColorAt(npd++,CL.set(ty==='park'?0x5a9a44:ty==='parking'?0x333537:0x9d9d98));
   const lots=ind?[[0,-15],[0,15]]:(ty==='park'||ty==='parking')?[]:[[-15,-15],[15,-15],[-15,15],[15,15]];
   lots.forEach((l,n)=>{const w2=ind?44:res?14+r(10+n)*5:17+r(10+n)*7,l2=ind?22:res?14+r(20+n)*5:17+r(20+n)*7,
    h=ty==='downtown'?32+r(30+n)*58:ty==='commercial'?14+r(30+n)*22:res?6+r(30+n)*6:8+r(30+n)*6,bx=x+l[0],bz=z+l[1];
    put(this.bld,nb,bx,.3+h/2,bz,w2,h,l2);
    this.bld.setColorAt(nb++,CL.setHSL(ty==='downtown'?.58:ind?.6:res?.02+r(40+n)*.08:.1,res?.35:ind?.04:.18,ty==='downtown'?.7:ind?.5:.7));
    const c={x:bx,z:bz,hw:w2/2,hd:l2/2,h};cols.push(c);bc.push(c);});
   if(!ind){const pts=[];for(let t=-25;t<=25;t+=12.5)pts.push([t,-28],[t,28],[-28,t],[28,t]);
    if(ty==='park')for(let p=0;p<8;p++)pts.push([(r(50+p)-.5)*44,(r(60+p)-.5)*44]);
    pts.forEach(([tx,tz],n)=>{const key=i+','+j+','+n;if(w.mods.has(key))return;const sc=.8+r(70+n)*.5;
     put(this.trk,nt,x+tx,1.5,z+tz,1,1,1);put(this.cnp,nt,x+tx,3.6+sc,z+tz,sc,sc,sc);this.cnp.setColorAt(nt,CL.setHSL(.25+r(80+n)*.1,.5,.2+r(90+n)*.14));
     cols.push({x:x+tx,z:z+tz,hw:.3,hd:.3,tree:1,ch:this,k:nt,key});nt++;});}
  }
  for(let a=0;a<3;a++)for(let b=0;b<3;b++)for(const sx of[-1,1])for(const sz of[-1,1]){const x=(cx*3+a)*S+sx*8.5,z=(cz*3+b)*S+sz*8.5;
   put(this.pole,np,x,2.75,z,1,1,1);put(this.hA,np,x,5.8,z,1,1,1);put(this.hB,np,x,5.1,z,1,1,1);np++;cols.push({x,z,hw:.25,hd:.25});}
  for(const[m,n]of[[this.road,6],[this.dash,nd],[this.pad,npd],[this.bld,nb],[this.trk,nt],[this.cnp,nt],[this.pole,np],[this.hA,np],[this.hB,np]]){m.count=n;m.instanceMatrix.needsUpdate=true;if(m.instanceColor)m.instanceColor.needsUpdate=true;m.boundingSphere=null;}
  this.cols=cols;this.bcols=bc;this.g.visible=true;
 }
 setLod(l,M){this.l=l;const f=l===0;this.dash.visible=this.trk.visible=this.cnp.visible=this.pole.visible=this.hA.visible=this.hB.visible=f;this.pad.visible=l<2;this.bld.material=l<2?M.bTex:M.bFlat;this.bld.castShadow=this.trk.castShadow=this.cnp.castShadow=f;}
}
export class World{
 constructor(scene,seed,mods){
  this.scene=scene;this.seed=seed|0;this.mods=new Set(mods||[]);this.map=new Map();this.pool=[];this.R=3;this.cols=[];this.bcols=[];this.dirty=true;this.sig='';this.need=new Set();this.queue=[];this.pc=[0,0];
  const R=(c,o={})=>new THREE.MeshStandardMaterial({color:c,roughness:.9,...o});
  const wt=tex((g,w,h)=>{g.fillStyle='#dcdcdc';g.fillRect(0,0,w,h);for(let y=8;y<h-8;y+=24)for(let x=8;x<w-8;x+=20){g.fillStyle=Math.random()<.2?'#f5e6a8':'#2b3d52';g.fillRect(x,y,12,14);}},128,256);
  this.m={asph:R(0x34373b,{roughness:.95}),dash:new THREE.MeshBasicMaterial({color:0xe8c020}),pad:R(0xffffff),bTex:R(0xffffff,{map:wt,roughness:.7}),bFlat:new THREE.MeshLambertMaterial({color:0xffffff}),trunk:R(0x5a4030),leaf:R(0xffffff),pole:R(0x333333),A:new THREE.MeshBasicMaterial({color:0x22dd44}),B:new THREE.MeshBasicMaterial({color:0xdd2222})};
  const grass=tex((g,w,h)=>{g.fillStyle='#4f7d3a';g.fillRect(0,0,w,h);for(let i=0;i<500;i++){g.fillStyle=`rgba(${Math.random()*60|0},${90+Math.random()*60|0},40,.35)`;g.fillRect(Math.random()*w,Math.random()*h,3,3);}},64,64,120);
  this.gr=new THREE.Mesh(new THREE.PlaneGeometry(1400,1400),new THREE.MeshStandardMaterial({map:grass,roughness:1}));this.gr.rotation.x=-Math.PI/2;this.gr.receiveShadow=true;scene.add(this.gr);
 }
 phase(t){const c=t%20;return c<9?0:c<10?2:c<19?1:2;}
 update(t){const p=this.phase(t);this.m.A.color.set(p===0?0x22dd44:0xdd2222);this.m.B.color.set(p===1?0x22dd44:0xdd2222);}
 load(cx,cz){const k=cx+','+cz;if(this.map.has(k))return this.map.get(k);const ch=this.pool.pop()||new Chunk(this);ch.build(cx,cz,this);this.map.set(k,ch);this.dirty=true;return ch;}
 release(k){const ch=this.map.get(k);ch.g.visible=false;this.pool.push(ch);this.map.delete(k);this.dirty=true;}
 setRadius(r){this.R=r;this.sig='';}
 lodOf(ch){const d=Math.max(Math.abs(ch.cx-this.pc[0]),Math.abs(ch.cz-this.pc[1])),l=d<=1?0:d===2?1:2;if(ch.l!==l){ch.setLod(l,this.m);this.dirty=true;}}
 preload(px,pz){const cx=Math.floor(px/C),cz=Math.floor(pz/C);for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++)this.load(cx+a,cz+b);this.stream(px,pz,0,0,true);}
 stream(px,pz,vx,vz,noBuild){
  const cx=Math.floor(px/C),cz=Math.floor(pz/C),ax=Math.floor((px+vx*2)/C),az=Math.floor((pz+vz*2)/C),R=this.R,sig=[cx,cz,ax,az,R].join(),cd=(a,b,c,d)=>Math.max(Math.abs(a-c),Math.abs(b-d));
  if(sig!==this.sig){this.sig=sig;this.pc=[cx,cz];const need=this.need=new Set(),q=[];
   for(let a=-R;a<=R;a++)for(let b=-R;b<=R;b++)need.add((cx+a)+','+(cz+b));
   for(let a=1-R;a<R;a++)for(let b=1-R;b<R;b++)need.add((ax+a)+','+(az+b));
   for(const k of need)if(!this.map.has(k)){const[x,z]=k.split(',').map(Number);q.push([k,x,z,Math.hypot((x+.5)*C-px-vx*1.2,(z+.5)*C-pz-vz*1.2)]);}
   q.sort((a,b)=>a[3]-b[3]);this.queue=q;
   for(const[k,ch]of[...this.map])if(cd(ch.cx,ch.cz,cx,cz)>R+1&&cd(ch.cx,ch.cz,ax,az)>R)this.release(k);
   for(const ch of this.map.values())this.lodOf(ch);}
  if(!noBuild){let n=0;const t0=performance.now();while(this.queue.length&&n<2){const[k,x,z]=this.queue.shift();if(!this.need.has(k)||this.map.has(k))continue;this.lodOf(this.load(x,z));n++;if(performance.now()-t0>3)break;}}
  if(this.dirty){this.dirty=false;const c=[],b=[];for(const ch of this.map.values())if(ch.l===0){c.push(...ch.cols);b.push(...ch.bcols);}this.cols=c;this.bcols=b;}
  const st=1400/120;this.gr.position.set(Math.round(px/st)*st,0,Math.round(pz/st)*st);
 }
 knock(c){if(c.dead)return;c.dead=true;this.mods.add(c.key);c.ch.trk.setMatrixAt(c.k,ZERO);c.ch.cnp.setMatrixAt(c.k,ZERO);c.ch.trk.instanceMatrix.needsUpdate=c.ch.cnp.instanceMatrix.needsUpdate=true;}
}
