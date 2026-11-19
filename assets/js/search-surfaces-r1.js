/* Weplace search surfaces / accessible four-tab comparison. Fictional examples only. */
(()=>{'use strict';
for(const root of document.querySelectorAll('.wp-surface-section')){
 const tabs=[...root.querySelectorAll('[role="tab"][data-surface]')];
 const panels=[...root.querySelectorAll('[role="tabpanel"][data-surface-view]')];
 if(tabs.length!==4||panels.length!==4)return;
 function activate(index,focus){
   tabs.forEach((tab,i)=>{
      const chosen=i===index;
      tab.setAttribute('aria-selected',chosen?'true':'false');
      tab.tabIndex=chosen?0:-1;
      if(chosen&&focus)tab.focus();
   });
   panels.forEach((panel,i)=>{panel.hidden=i!==index;});
 }
 tabs.forEach((tab,i)=>{
   tab.addEventListener('click',()=>activate(i,false));
   tab.addEventListener('keydown',event=>{
     const keys=['ArrowRight','ArrowDown','ArrowLeft','ArrowUp','Home','End'];
     if(!keys.includes(event.key))return;
     event.preventDefault();
     let index=i;
     if(event.key==='Home')index=0;
     else if(event.key==='End')index=tabs.length-1;
     else index=(i+(event.key==='ArrowLeft'||event.key==='ArrowUp'?-1:1)+tabs.length)%tabs.length;
     activate(index,true);
   });
 });
 activate(0,false);
}
})();