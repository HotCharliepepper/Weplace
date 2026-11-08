/* Public question only: never include input values, query strings, hash or selections. */
(function(){
  'use strict';
  const field=document.getElementById('share-fallback');if(!field)return;
  const title='우리 매장 첫 사진은, 손님에게 무엇을 알려주나요?';
  const text=title+' — Weplace의 함께 살펴볼 질문. 실제 분석 결과가 아닙니다.';
  const url=new URL('/review/question',location.href).href;
  const message=text+'\n'+url;
  const copy=document.querySelector('[data-share-copy]');
  const share=document.querySelector('[data-share-native]');
  const status=document.querySelector('.share-status');
  const manual=field.closest('details');
  field.value=message;
  function fallback(){if(manual)manual.open=true;field.focus();field.select();status.textContent='아래 문장을 선택했습니다. 길게 눌러 복사하거나 Ctrl/Cmd+C를 눌러주세요.';}
  async function copyLink(){try{await navigator.clipboard.writeText(message);status.textContent='질문과 링크를 복사했습니다. 팀 대화에 붙여넣으세요.';}catch(_){fallback();}}
  if(copy){copy.hidden=false;copy.addEventListener('click',copyLink);}
  // A device share sheet is opened only by a visitor's click. No automatic sending.
  if(share){share.hidden=false;share.addEventListener('click',async()=>{
    if(!navigator.share){await copyLink();return;}
    try{await navigator.share({title,text,url});status.textContent='기기의 공유 창을 닫았습니다.';}
    catch(error){if(error.name==='AbortError'){status.textContent='공유를 취소했습니다. 카드와 링크는 그대로 남아 있습니다.';}else{await copyLink();}}
  });}
})();
