import * as THREE from 'three';
import{RoomEnvironment}from'three/addons/environments/RoomEnvironment.js';
import{World,S,C}from'./city.js';
import{Car,CARS}from'./car.js';
import{Traffic}from'./traffic.js';
import{CamRig,CAMS}from'./camera.js';
import{input,ev,look,initControls}from'./controls.js';
import{initUI,show,showHud,hud}from'./ui.js';
import{Sound}from'./audio.js';
const Q={low:{pr:.75,sh:0,tr:14,r:2},medium:{pr:1,sh:1024,tr:22,r:2},high:{pr:Math.min(devicePixelRatio,2),sh:2048,tr:30,r:3}};
const touch=matchMedia('(pointer:coarse)').matches||'ontouchstart' in window,SAVE='cd3d_save';
let sv={};try{sv=JSON.parse(localStorage.getItem(SAVE))||{};}catch(e){}
const seed=sv.seed??1337;
const canvas=document.getElementById('c'),renderer=new THREE.WebGLRenderer({canvas,antialias:!touch});
renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.85;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
const scene=new THREE.Scene();scene.background=new THREE.Color(0x9cc6ea);scene.fog=new THREE.Fog(0x9cc6ea,60,400);
scene.environment=new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(),.04).texture;
const camera=new THREE.PerspectiveCamera(60,1,.3,900);
scene.add(new THREE.HemisphereLight(0xbcd8ff,0x556644,.6));
const sun=new THREE.DirectionalLight(0xfff1d6,2);sun.shadow.camera.left=sun.shadow.camera.bottom=-70;sun.shadow.camera.right=sun.shadow.camera.top=70;sun.shadow.camera.far=300;sun.shadow.bias=-.0005;scene.add(sun,sun.target);
const city=new World(scene,seed,sv.mods),traffic=new Traffic(scene,city,14),rig=new CamRig(camera,city),snd=new Sound();
let state='menu',idx=sv.car||0,car,t=0,last=0,svT=0,q=Q[sv.q]?sv.q:(touch?'low':'high'),rad=sv.r||Q[q].r;
const save=()=>{try{const p=car.group.position;localStorage.setItem(SAVE,JSON.stringify({seed,x:p.x,z:p.z,ang:car.ang,car:idx,q,r:rad,mods:[...city.mods]}));}catch(e){}};
function chunks(r){rad=r;city.setRadius(r);scene.fog.far=r*C*.85;const e=document.getElementById('chunks');if(e)e.value=r;}
function quality(k){const c=Q[k];q=k;renderer.setPixelRatio(c.pr);renderer.setSize(innerWidth,innerHeight,false);renderer.shadowMap.enabled=!!c.sh;sun.castShadow=!!c.sh;
 if(c.sh){sun.shadow.mapSize.set(c.sh,c.sh);sun.shadow.map?.dispose();sun.shadow.map=null;}traffic.active=c.tr;scene.traverse(o=>{if(o.material)o.material.needsUpdate=true;});}
function makeCar(){const p=car?car.group.position.clone():new THREE.Vector3(sv.x??0,0,sv.z??S/2),a=car?car.ang:(sv.ang||0);if(car)scene.remove(car.group);
 car=new Car(CARS[idx],undefined,true);car.group.position.copy(p);car.ang=a;car.onHit=s=>snd.crash(s);car.onTree=c=>city.knock(c);scene.add(car.group);car.sync(0);rig.init=true;}
function setState(s){state=s;showHud(s==='play',touch);snd.hush(s!=='play');if(s!=='play')save();}
ev.cam=()=>{if(state==='play')rig.cycle();};
ev.reset=()=>{if(state!=='play')return;const p=car.group.position,gx=Math.round(p.x/S)*S,gz=Math.round(p.z/S)*S,h=Math.PI/2;
 if(Math.abs(p.x-gx)<Math.abs(p.z-gz)){p.x=gx;car.ang=Math.cos(car.ang)>=0?0:Math.PI;}else{p.z=gz;car.ang=Math.sin(car.ang)>=0?h:-h;}
 car.v.set(0,0,0);car.vf=0;rig.init=true;};
const resume=()=>{show(null);setState('play');};
ev.pause=()=>{if(state==='play'){setState('pause');show('pause');}else if(state==='pause')resume();};
initUI({play(){snd.start();if(state==='menu')traffic.spawnAll(car.group.position);show(null);setState('play');rig.init=true;},select(i){idx=i;makeCar();},resume,
 quality:k=>{quality(k);chunks(Q[k].r);},chunks,volume:v=>snd.setVol(v),
 quit(){traffic.list.forEach(a=>a.car.group.visible=false);setState('menu');show('main');}},q,rad);
initControls(canvas);makeCar();quality(q);chunks(rad);city.preload(car.group.position.x,car.group.position.z);
addEventListener('resize',()=>{renderer.setSize(innerWidth,innerHeight,false);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();});dispatchEvent(new Event('resize'));
function frame(ms){requestAnimationFrame(frame);const dt=Math.min(.05,(ms-last)/1000||0);last=ms;const P=car.group.position;
 city.stream(P.x,P.z,car.v.x,car.v.z);city.update(t);
 if(state==='play'){
  t+=dt;car.step(dt/2,input,city.cols);car.step(dt/2,input,city.cols);traffic.collide(car);traffic.update(dt,t,P);car.sync(dt);rig.update(car,dt,look);
  const sp=Math.abs(car.vf),g=sp<.5?'N':car.vf<0?'R':String(1+Math.min(4,(sp/car.spec.max*5)|0));
  hud(Math.round(sp*3.6),g,car.spec.name,Math.round(car.dmg),CAMS[rig.mode]);snd.update(Math.min(1,sp/car.spec.max),input.thr,input.brk);
  if((svT+=dt)>5){svT=0;save();}
 }else if(state==='menu'){const a=ms*.0003;camera.position.set(P.x+Math.sin(a)*9,3,P.z+Math.cos(a)*9);camera.lookAt(P.x,1,P.z);}
 sun.position.set(P.x+60,100,P.z+40);sun.target.position.copy(P);
 renderer.render(scene,camera);}
requestAnimationFrame(frame);
addEventListener('pagehide',()=>{if(car)save();});
