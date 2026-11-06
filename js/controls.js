export const input={thr:0,brk:0,left:0,right:0,hand:0};
export const ev={cam(){},reset(){},pause(){}};
export const look={yaw:0,drag:false};
const keys={KeyW:'thr',ArrowUp:'thr',KeyS:'brk',ArrowDown:'brk',KeyA:'left',ArrowLeft:'left',KeyD:'right',ArrowRight:'right',Space:'hand'};
export function initControls(canvas){
 addEventListener('keydown',e=>{if(keys[e.code]){input[keys[e.code]]=1;e.preventDefault();}if(e.repeat)return;if(e.code==='KeyC')ev.cam();if(e.code==='KeyR')ev.reset();if(e.code==='Escape')ev.pause();});
 addEventListener('keyup',e=>{if(keys[e.code])input[keys[e.code]]=0;});
 addEventListener('blur',()=>{for(const k in input)input[k]=0;});
 document.querySelectorAll('#touch [data-k]').forEach(b=>{const k=b.dataset.k;
  b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture?.(e.pointerId);b.classList.add('on');if(k==='cam')ev.cam();else if(k==='reset')ev.reset();else if(k==='pause')ev.pause();else input[k]=1;});
  ['pointerup','pointercancel','lostpointercapture'].forEach(n=>b.addEventListener(n,()=>{b.classList.remove('on');if(k in input)input[k]=0;}));});
 let lx=0;canvas.addEventListener('pointerdown',e=>{look.drag=true;lx=e.clientX;});
 addEventListener('pointermove',e=>{if(look.drag){look.yaw=Math.max(-2.5,Math.min(2.5,look.yaw-(e.clientX-lx)*.006));lx=e.clientX;}});
 addEventListener('pointerup',()=>{look.drag=false;});
}
