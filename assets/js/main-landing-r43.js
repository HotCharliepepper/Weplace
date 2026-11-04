/* Three optional scenes; tabs, content and CTAs are independent of GSAP. */
(function(){
  'use strict';
  const cinema=document.getElementById('cinema');if(!cinema)return;
  const tabs=[...cinema.querySelectorAll('[data-scene-tab]')],panel=document.getElementById('scene-panel'),play=document.getElementById('scene-play');
  const planes=[...cinema.querySelectorAll('.cinema-plane')];
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const scenes=[
    {title:'흩어져 있던 첫인상.',text:'사진, 안내, 예약 방법이 흩어지면 손님은 다시 찾고 확인하게 됩니다.',pose:[[-14,20,-20,-11],[8,-28,12,5],[16,28,-16,-4]]},
    {title:'볼 순서를 맞춥니다.',text:'무엇을 만나고, 무엇을 확인하고, 어디로 갈지. 사진과 안내의 순서를 정리합니다.',pose:[[-36,10,-26,-4],[0,-8,-26,-4],[36,-26,-26,-4]]},
    {title:'하나의 매장으로 이어집니다.',text:'사진에서 안내로, 안내에서 예약 방법으로. 손님이 확인할 순서를 연결합니다.',pose:[[-6,14,-12,-3],[0,0,-12,-3],[6,-14,-12,-3]]}
  ];
  let current=2,tween=null,timer=null,playing=false;
  function stop(){clearTimeout(timer);timer=null;playing=false;play.setAttribute('aria-pressed','false');play.textContent='장면 재생 ▷';}
  function setScene(index,animate=false){
    current=index;cinema.dataset.scene=String(index);
    tabs.forEach((tab,i)=>{tab.setAttribute('aria-selected',String(i===index));tab.tabIndex=i===index?0:-1;});
    panel.setAttribute('aria-labelledby',tabs[index].id);panel.textContent=scenes[index].text;
    document.getElementById('scene-caption').textContent=scenes[index].title;document.getElementById('scene-count').textContent=`0${index+1} / 03`;
    if(tween){tween.kill();tween=null;}
    const canAnimate=animate&&!reduced.matches&&window.gsap?.timeline;
    cinema.dataset.motion=reduced.matches?'reduced':window.gsap?.timeline?'ready':'static';
    play.hidden=reduced.matches||!window.gsap?.timeline;
    if(canAnimate){
      try{tween=gsap.timeline({defaults:{duration:.85,ease:'power3.inOut',overwrite:true}});planes.forEach((el,i)=>{const [x,y,rotationY,rotation]=scenes[index].pose[i];tween.to(el,{x,y,rotationY,rotation,force3D:false},i*.055);});return;}catch(_){tween?.kill();tween=null;}
    }
    planes.forEach((el,i)=>{const [x,y,ry,r]=scenes[index].pose[i];if(window.gsap?.set){gsap.set(el,{x,y,rotationY:ry,rotation:r,force3D:false});}else{el.style.transform=`translate(${x}px,${y}px) rotateY(${ry}deg) rotateZ(${r}deg)`;}});
  }
  function choose(index,focus){stop();setScene(index,true);if(focus)tabs[index].focus();}
  tabs.forEach((tab,i)=>{tab.addEventListener('click',()=>choose(i,false));tab.addEventListener('keydown',e=>{let n;if(e.key==='ArrowRight')n=(i+1)%3;if(e.key==='ArrowLeft')n=(i+2)%3;if(e.key==='Home')n=0;if(e.key==='End')n=2;if(n!==undefined){e.preventDefault();choose(n,true);}});});
  function schedule(){timer=setTimeout(()=>{if(document.hidden||reduced.matches){stop();return;}setScene(current+1,true);if(current<2)schedule();else stop();},2200);}
  play.addEventListener('click',()=>{if(playing){stop();tween?.progress(1).pause();return;}setScene(0,true);if(reduced.matches)return;playing=true;play.setAttribute('aria-pressed','true');play.textContent='장면 멈춤 Ⅱ';schedule();});
  reduced.addEventListener('change',()=>{stop();setScene(2,false);});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){stop();setScene(current,false);}});
  window.addEventListener('pagehide',()=>{stop();tween?.kill();});
  if('IntersectionObserver'in window){new IntersectionObserver(entries=>{if(!entries[0].isIntersecting&&playing){stop();setScene(current,false);}},{threshold:0}).observe(cinema);}
  cinema.querySelector('.cinema-controls').hidden=false;
  const initial=new URLSearchParams(location.search).get('scene');
  setScene(/^[012]$/.test(initial||'')?Number(initial):2,false);
  // A short, finite entrance: no scroll hijacking, looping, delayed text or CTA.
  if(initial===null&&!reduced.matches&&window.gsap?.timeline){setScene(0,false);playing=true;play.setAttribute('aria-pressed','true');play.textContent='장면 멈춤 Ⅱ';schedule();}
})();
