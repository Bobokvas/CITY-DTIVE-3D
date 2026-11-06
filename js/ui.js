import{CARS}from'./car.js';
const $=s=>document.querySelector(s),ids=['main','vehicles','settings','pause'];
let prev='main',sel=0;
export const show=id=>ids.forEach(i=>$('#'+i).classList.toggle('hide',i!==id));
export function showHud(on,touch){$('#hud').classList.toggle('hide',!on);$('#touch').classList.toggle('hide',!(on&&touch));}
export function hud(sp,gear,name,dmg,cam){const set=(id,v)=>{const e=$(id);if(e.textContent!==v)e.textContent=v;};set('#spd',sp+'');set('#gear',gear);set('#vname',`${name} - Damage ${dmg}%`);set('#cam','Camera: '+cam);$('#dmg i').style.width=dmg+'%';}
export function initUI(h,q,r){
 const mx=f=>Math.max(...CARS.map(f)),bar=(l,v)=>`${l}<div class="bar"><i style="width:${v*100}%"></i></div>`,hv=c=>c.steer*c.grip;
 CARS.forEach((c,i)=>{const d=document.createElement('div');d.className='card'+(i===sel?' sel':'');
  d.innerHTML=`<div class="sw" style="background:#${c.color.toString(16).padStart(6,'0')}"></div><b>${c.name}</b>${bar('Top speed',c.max/mx(x=>x.max))}${bar('Acceleration',c.acc/mx(x=>x.acc))}${bar('Handling',hv(c)/mx(hv))}${bar('Weight',c.mass/mx(x=>x.mass))}`;
  d.onclick=()=>{sel=i;document.querySelectorAll('.card').forEach((e,k)=>e.classList.toggle('sel',k===i));h.select(i);};$('#vlist').appendChild(d);});
 const go=(id,f)=>$('#'+id).onclick=f;
 go('bPlay',()=>h.play());go('bVeh',()=>{prev='main';show('vehicles');});go('bSet',()=>{prev='main';show('settings');});
 go('bVBack',()=>show(prev));go('bSBack',()=>show(prev));
 go('bRes',()=>h.resume());go('bPVeh',()=>{prev='pause';show('vehicles');});go('bPSet',()=>{prev='pause';show('settings');});go('bQuit',()=>h.quit());
 $('#qual').value=q;$('#chunks').value=r;$('#chunks').onchange=e=>h.chunks(+e.target.value);$('#qual').onchange=e=>h.quality(e.target.value);$('#vol').oninput=e=>h.volume(+e.target.value);
}
