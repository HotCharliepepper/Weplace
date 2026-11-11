(function(){'use strict';
const steps=[...document.querySelectorAll('[data-step]')];if(!steps.length)return;
const progress=[...document.querySelectorAll('[data-progress]')];let current=0;
const checked=name=>document.querySelector(`input[name="${name}"]:checked`).value;
function updateSummary(){const free=checked('service')==='first';document.getElementById('summary-channel').textContent=checked('channel');document.getElementById('summary-service').textContent=free?'첫 화면 진단':'여러 채널 상세설계';document.getElementById('summary-scope').textContent=free?'매장 1곳 · 공개 채널 1개 · 직접 써볼 개선안 1개':'공개 채널과 필요한 작업 확인 후 협의';document.getElementById('summary-price').textContent=free?'0원':'범위와 비용 안내 후 결정';document.getElementById('complete-demo').textContent=free?'모의 주문 완료 ↗':'모의 상담 요청 완료 ↗';}
function show(index,focus=true,record=true){if(record)history.pushState({weplaceJourney:index},'', '#step-'+index);current=index;steps.forEach((step,i)=>step.hidden=i!==index);progress.forEach((li,i)=>{if(i===index)li.setAttribute('aria-current','step');else li.removeAttribute('aria-current');});document.body.dataset.journeyStep=String(index);if(index===2)updateSummary();if(focus){const title=document.getElementById('step-title-'+index);title.focus({preventScroll:true});title.scrollIntoView({block:'start',behavior:'instant'});}}
document.querySelectorAll('[data-next]').forEach(button=>button.addEventListener('click',()=>show(Math.min(current+1,4))));document.querySelectorAll('[data-back]').forEach(button=>button.addEventListener('click',()=>show(Math.max(current-1,0))));
const ack=document.getElementById('demo-ack'),error=document.getElementById('order-error');
document.getElementById('complete-demo').addEventListener('click',()=>{if(!ack.checked){error.textContent='실제 신청·결제가 없는 체험임을 확인해 주세요.';ack.focus();return;}error.textContent='';show(3);});
ack.addEventListener('change',()=>{error.textContent='';});
document.querySelectorAll('input[name]').forEach(input=>input.addEventListener('change',()=>{ack.checked=false;error.textContent='';}));
document.querySelector('[data-restart]').addEventListener('click',()=>{document.querySelector('input[name=channel]').checked=true;document.querySelector('input[name=service]').checked=true;ack.checked=false;error.textContent='';show(0);});
window.addEventListener('popstate',()=>{const step=history.state?.weplaceJourney;if(Number.isInteger(step)&&step>=0&&step<=4)show(step>2&&!ack.checked?2:step,true,false);});
history.replaceState({weplaceJourney:0},'',location.pathname+location.search+'#step-0');
document.querySelectorAll('.journey-actions').forEach(el=>el.hidden=false);show(0,false,false);
})();
