/* One owner for R4.4's decorative layers. Headlines, links and photos need no JS. */
(function(){
 'use strict';
 const hero=document.getElementById('cinema');if(!hero)return;
 const stage=hero.querySelector('.hero-stage'),depth=hero.querySelector('.hero-depth');
 const layers=[...hero.querySelectorAll('.hero-layer')],tabs=[...hero.querySelectorAll('[data-scene-tab]')];
 const play=hero.querySelector('#scene-play'),panel=hero.querySelector('#scene-panel');
 const image=hero.querySelector('#hero-photo'),fallback=hero.querySelector('.hero-image-fallback');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),compact=matchMedia('(max-width: 1000px)'),fine=matchMedia('(hover: hover) and (pointer: fine)');
 const gs=window.gsap,hasMotion=!!(gs&&gs.timeline&&gs.set);
 const scenes=[
  {title:'먼저, 먹고 싶은 장면.',text:'첫 사진은 매장에서 만날 경험을 보여줍니다. 루위의 기존 제공 사진으로 첫인상을 살펴봅니다.',pose:[{xPercent:2,yPercent:1,rotation:-5,rotationY:0,scale:1.02},{xPercent:3,yPercent:-5,rotation:5,rotationY:0,scale:1},{xPercent:-2,yPercent:6,rotation:2,rotationY:0,scale:1}]},
  {title:'사진 다음에, 필요한 안내.',text:'메뉴와 구성, 자리와 이용 조건. 손님이 궁금해할 정보를 사진 가까이 정리합니다.',pose:[{xPercent:0,yPercent:0,rotation:-3,rotationY:0,scale:1},{xPercent:-2,yPercent:0,rotation:1,rotationY:0,scale:1},{xPercent:0,yPercent:2,rotation:0,rotationY:0,scale:1}]},
  {title:'다음 행동까지, 한눈에.',text:'사진에서 안내로, 안내에서 예약 방법으로. 손님이 확인할 순서를 연결합니다.',pose:[{xPercent:0,yPercent:0,rotation:-3,rotationY:0,scale:1},{xPercent:0,yPercent:0,rotation:3,rotationY:0,scale:1},{xPercent:0,yPercent:0,rotation:-1,rotationY:0,scale:1}]}
 ];
 let sequence=null,transition=null,playing=false,current=2,hoverEnabled=false;
 function canMove(){return hasMotion&&!reduced.matches&&!compact.matches&&!imageFailed;}
 let imageFailed=false;
 function resetPointer(){if(hasMotion){gs.killTweensOf(depth);gs.set(depth,{rotationX:0,rotationY:0});}}
 function label(index){current=index;hero.dataset.scene=String(index);tabs.forEach((tab,i)=>{tab.setAttribute('aria-selected',String(i===index));tab.tabIndex=i===index?0:-1;});panel.setAttribute('aria-labelledby',tabs[index].id);panel.textContent=scenes[index].text;hero.querySelector('#scene-caption').textContent=scenes[index].title;hero.querySelector('#scene-count').textContent=`0${index+1} / 03`;}
 function controls(){hero.dataset.playing=String(playing);play.setAttribute('aria-pressed',String(playing));play.textContent=playing?'장면 멈춤 Ⅱ':'8초 재생 ▷';play.hidden=!canMove();}
 function halt(){if(sequence){sequence.kill();sequence=null;}if(transition){transition.kill();transition=null;}playing=false;hoverEnabled=false;resetPointer();controls();}
 function pose(index,animated){
  if(!hasMotion)return;
  gs.killTweensOf(layers);
  if(!canMove()){layers.forEach(el=>gs.set(el,{clearProps:'transform'}));return;}
  if(animated){transition=gs.timeline({onComplete:()=>{transition=null;}});layers.forEach((el,i)=>transition.to(el,{...scenes[index].pose[i],duration:.7,ease:'power3.inOut',overwrite:true,force3D:false},i*.045));}
  else layers.forEach((el,i)=>gs.set(el,{...scenes[index].pose[i],force3D:false}));
 }
 function choose(index,focus){halt();label(index);pose(index,canMove());if(focus)tabs[index].focus();}
 function run(){
  halt();if(!canMove())return;
  label(0);pose(0,false);playing=true;controls();
  sequence=gs.timeline({id:'weplace-r44-hero',onComplete:()=>{sequence=null;playing=false;hoverEnabled=true;controls();}});
  sequence.call(()=>label(1),null,2.8);
  layers.forEach((el,i)=>sequence.to(el,{...scenes[1].pose[i],duration:.9,ease:'power3.inOut',force3D:false},2.8+i*.06));
  sequence.call(()=>label(2),null,5.6);
  layers.forEach((el,i)=>sequence.to(el,{...scenes[2].pose[i],duration:.9,ease:'power3.inOut',force3D:false},5.6+i*.06));
  sequence.call(()=>{},null,8); // explicit finite eight-second hold; no repeat
 }
 tabs.forEach((tab,i)=>{tab.addEventListener('click',()=>choose(i,false));tab.addEventListener('keydown',e=>{let n;if(e.key==='ArrowRight')n=(i+1)%3;if(e.key==='ArrowLeft')n=(i+2)%3;if(e.key==='Home')n=0;if(e.key==='End')n=2;if(n!==undefined){e.preventDefault();choose(n,true);}});});
 play.addEventListener('click',()=>{if(playing){halt();pose(current,false);}else run();});
 stage.addEventListener('pointermove',e=>{if(!hoverEnabled||!canMove()||!fine.matches||e.pointerType!=='mouse')return;const r=stage.getBoundingClientRect();const x=Math.max(-.5,Math.min(.5,(e.clientX-r.left)/r.width-.5)),y=Math.max(-.5,Math.min(.5,(e.clientY-r.top)/r.height-.5));gs.to(depth,{rotationY:x*4,rotationX:-y*3,duration:.45,ease:'power2.out',overwrite:true,force3D:false});});
 stage.addEventListener('pointerleave',resetPointer);
 // Focusing a control settles the current scene; nothing moves under a keyboard user.
 hero.addEventListener('focusin',e=>{if(e.target!==play){halt();pose(current,false);}});
 function refresh(){halt();label(2);pose(2,false);hero.dataset.motion=imageFailed?'photo-fallback':reduced.matches?'reduced':compact.matches?'poster':hasMotion?'ready':'static';controls();}
 reduced.addEventListener('change',refresh);compact.addEventListener('change',refresh);
 fine.addEventListener('change',()=>{hoverEnabled=false;resetPointer();});
 document.addEventListener('visibilitychange',()=>{if(document.hidden){halt();pose(current,false);}});
 window.addEventListener('pagehide',()=>{halt();if(hasMotion)gs.killTweensOf(layers);});
 if('IntersectionObserver'in window){const observer=new IntersectionObserver(entries=>{if(!entries[0].isIntersecting){halt();pose(current,false);}},{threshold:0});observer.observe(stage);}
 function photoFailed(){imageFailed=true;halt();hero.dataset.motion='photo-fallback';fallback.hidden=false;depth.hidden=true;controls();}
 image.addEventListener('error',photoFailed);if(image.complete&&!image.naturalWidth)photoFailed();
 hero.querySelector('.hero-scene-controls').hidden=false;
 refresh();
 const initial=new URLSearchParams(location.search).get('scene');
 if(/^[012]$/.test(initial||'')){label(Number(initial));pose(Number(initial),false);}else if(initial===null&&canMove())run();
})();
