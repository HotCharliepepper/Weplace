/* Weplace LuWei inline preview. Motion only after visible; reduced-motion defaults to food. */
(()=>{'use strict';
const motion=matchMedia('(prefers-reduced-motion: reduce)'),saveData=navigator.connection?.saveData;
for(const wrap of document.querySelectorAll('.wp-luwei-inline')){
 const screen=wrap.querySelector('.wp-lw-screen'),replay=wrap.querySelector('[data-lw-action="replay"]'),skip=wrap.querySelector('[data-lw-action="skip"]'),caption=wrap.querySelector('.wp-lw-caption');
 if(!screen||!replay||!skip)return;
 let started=false,a=0,b=0;
 const noMotion=()=>motion.matches||saveData;
 const clear=()=>{clearTimeout(a);clearTimeout(b)};
 const stage=value=>{screen.dataset.phase=value;caption.textContent=value==='after'?'베이징덕 사진이 먼저 보이면 음식의 종류가 바로 전달됩니다.':value==='bridge'?'사진을 보여주는 순서에 대해 생각해 봅니다.':'외관 사진에서 매장에 도착하는 모습을 먼저 떠올립니다.'};
 const finish=()=>{clear();stage('after')};
 const play=()=>{clear();if(noMotion()){finish();return}stage('before');a=setTimeout(()=>{stage('bridge');b=setTimeout(finish,700)},700)};
 replay.addEventListener('click',play);skip.addEventListener('click',finish);
 if(noMotion()){finish();continue}
 stage('before');
 if('IntersectionObserver' in window){
  const observer=new IntersectionObserver(entries=>{if(!started&&entries.some(e=>e.isIntersecting&&e.intersectionRatio>=.4)){started=true;observer.disconnect();play()}},{threshold:[0,.4,.6]});
  observer.observe(screen);
 }
 motion.addEventListener?.('change',()=>{if(noMotion())finish()});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)finish()});
}
})();