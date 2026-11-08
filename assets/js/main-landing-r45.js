/* R4.5 is the only hero motion owner. Semantic content is rendered before JS. */
(function(){
 'use strict';
 const hero=document.getElementById('cinema');if(!hero)return;
 const stage=hero.querySelector('.path-stage'),depth=hero.querySelector('.path-depth'),image=hero.querySelector('#hero-photo');
 const tabs=[...hero.querySelectorAll('[data-scene-tab]')],play=hero.querySelector('#scene-play'),panel=hero.querySelector('#scene-panel');
 const paths=[...hero.querySelectorAll('.sight-main')],scattered=hero.querySelector('.sight-scattered'),light=hero.querySelector('.path-light'),mark=hero.querySelector('.path-mark'),labels=[...hero.querySelectorAll('.path-labels li')];
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),compact=matchMedia('(max-width: 1000px)'),connection=navigator.connection;
 const gs=window.gsap,hasMotion=!!(gs&&gs.timeline&&gs.set);let sequence=null,playing=false,imageFailed=false;
 const scenes=[{title:'흩어진 시선에서,',text:'사진은 처음부터 보입니다. 여러 방향으로 향한 시선을, 먼저 볼 장면으로 모읍니다.'},{title:'하나의 순서를 따라,',text:'사진에서 궁금한 정보로. 손님이 다음에 확인할 질문을 가까이 놓습니다.'},{title:'선택까지 이어지는 길.',text:'사진을 보고 → 궁금증을 풀고 → 예약 방법을 확인합니다.'}];
 function constrained(){return !!(connection&&(connection.saveData||['slow-2g','2g','3g'].includes(connection.effectiveType)));}
 function canMove(){return hasMotion&&!reduced.matches&&!compact.matches&&!constrained()&&!imageFailed;}
 function controls(){hero.dataset.playing=String(playing);play.setAttribute('aria-pressed',String(playing));play.textContent=playing?'장면 멈춤 Ⅱ':'8초 재생 ▷';play.hidden=!canMove();}
 function label(i){hero.dataset.scene=String(i);tabs.forEach((t,n)=>{t.setAttribute('aria-selected',String(n===i));t.tabIndex=n===i?0:-1;});panel.setAttribute('aria-labelledby',tabs[i].id);panel.textContent=scenes[i].text;hero.querySelector('#scene-caption').textContent=scenes[i].title;hero.querySelector('#scene-count').textContent=['T0 / 8s','T3 / 8s','T8 / 8s'][i];}
 function halt(){if(sequence){sequence.kill();sequence=null;}playing=false;controls();}
 function pose(i){if(!hasMotion)return;paths.forEach(path=>{const m=path.getScreenCTM(),length=path.getTotalLength()*Math.max(m?.a||1,m?.d||1);gs.set(path,{strokeDasharray:i===2?'none':length,strokeDashoffset:i===0?length:i===1?length*.35:0,opacity:i===0?.15:1});});gs.set(scattered,{opacity:i===0?.55:0});gs.set(light,{xPercent:0,opacity:i===0?.3:.6});gs.set(mark,{opacity:i===0?.3:1});gs.set(labels,{opacity:i===2?1:.6,y:0});}
 function settle(){halt();label(2);pose(2);}
 function choose(i,focus){halt();label(i);pose(i);if(focus)tabs[i].focus();}
 function run(){
  halt();if(!canMove())return;label(0);pose(0);playing=true;controls();
  sequence=gs.timeline({id:'weplace-r45-hero',onComplete:()=>{sequence=null;playing=false;label(2);pose(2);controls();}});
  sequence.to(scattered,{opacity:0,duration:2,ease:'power2.inOut'},1.3)
   .to(paths[0],{strokeDashoffset:0,opacity:1,duration:2,ease:'power2.inOut'},1.3)
   .to(light,{xPercent:8,opacity:.6,duration:2,ease:'power2.inOut'},1.3)
   .call(()=>label(1),null,3);
  labels.forEach((el,i)=>sequence.fromTo(el,{opacity:.6,y:5},{opacity:1,y:0,duration:.6,ease:'power2.out'},3.3+i*.7));
  sequence.to(paths[1],{strokeDashoffset:0,opacity:1,duration:1.7,ease:'power2.inOut'},5.6)
   .to(mark,{opacity:1,duration:1.2,ease:'power2.out'},5.6)
   .call(()=>{label(2);gs.set(paths,{strokeDasharray:'none',strokeDashoffset:0});},null,7.3).call(()=>{},null,8);
 }
 tabs.forEach((tab,i)=>{tab.addEventListener('click',()=>choose(i,false));tab.addEventListener('keydown',e=>{const n=e.key==='ArrowRight'?(i+1)%3:e.key==='ArrowLeft'?(i+2)%3:e.key==='Home'?0:e.key==='End'?2:null;if(n!==null){e.preventDefault();choose(n,true);}});});
 play.addEventListener('click',()=>{if(playing)settle();else run();});
 hero.addEventListener('focusin',e=>{if(e.target!==play)halt();});
 function refresh(){settle();hero.dataset.motion=imageFailed?'photo-fallback':reduced.matches?'reduced':constrained()?'data-saving':compact.matches?'poster':hasMotion?'ready':'static';controls();}
 reduced.addEventListener('change',refresh);compact.addEventListener('change',refresh);connection?.addEventListener?.('change',refresh);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)settle();});
 window.addEventListener('pagehide',settle);window.addEventListener('pageshow',e=>{if(e.persisted)refresh();});
 if('IntersectionObserver'in window){const observer=new IntersectionObserver(entries=>{if(!entries[0].isIntersecting)settle();},{threshold:0});observer.observe(stage);}
 function photoFailed(){imageFailed=true;settle();hero.dataset.motion='photo-fallback';hero.querySelector('.hero-image-fallback').hidden=false;depth.hidden=true;controls();}
 image.addEventListener('error',photoFailed);if(image.complete&&!image.naturalWidth)photoFailed();
 hero.querySelector('.hero-scene-controls').hidden=false;refresh();
 const initial=new URLSearchParams(location.search).get('scene');
 if(/^[012]$/.test(initial||''))choose(Number(initial),false);else if(initial===null&&canMove())run();
})();

/* All five explanations remain in HTML when JavaScript is unavailable. */
(function(){
 const host=document.getElementById('open-work');if(!host)return;
 const tabs=[...host.querySelectorAll('[data-stay-tab]')],panels=[...host.querySelectorAll('.stay-panel')];
 function choose(i,focus){host.dataset.stayState=String(i);tabs.forEach((t,n)=>{t.setAttribute('aria-selected',String(n===i));t.tabIndex=n===i?0:-1;panels[n].hidden=n!==i;});if(focus)tabs[i].focus();}
 tabs.forEach((t,i)=>{t.addEventListener('click',()=>choose(i,false));t.addEventListener('keydown',e=>{const n=e.key==='ArrowRight'?(i+1)%5:e.key==='ArrowLeft'?(i+4)%5:e.key==='Home'?0:e.key==='End'?4:null;if(n!==null){e.preventDefault();choose(n,true);}});});
 host.querySelector('.stay-tabs').hidden=false;choose(0,false);
})();
