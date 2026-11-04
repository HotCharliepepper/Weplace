(function(){'use strict';
const field=document.getElementById('share-fallback');if(!field)return;
// Share only a fixed public thought plus this preview's origin. Never query, hash, selections or inputs.
const url=new URL('/',location.href);const message='손님이 선택할 이유를 선명하게. 사진과 안내, 다음 행동을 하나의 매장으로. — Weplace\n'+url.href;
field.value=message;const button=document.querySelector('[data-share-copy]'),status=document.querySelector('.share-status');
if(!button)return;button.hidden=false;
button.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(message);status.textContent='공유할 문장과 링크를 복사했습니다. 원하는 곳에 붙여넣으세요.';}catch(_){field.focus();field.select();status.textContent='아래 문장을 선택했습니다. 길게 눌러 복사하거나 Ctrl/Cmd+C를 눌러주세요.';}});
})();
