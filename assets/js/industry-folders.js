(function(){
'use strict';
if(!window.customElements || customElements.get('weplace-industries'))return;
const origin='https://withweplace.kr';
const guides=[{industry:'요식업',theme:'dining',image:'ind-dining.jpg',text:'맛이 전해지는 사진부터, 찾아오고 예약하는 순간까지.',link:'/industries/dining.html'},{industry:'카페',theme:'cafe',image:'ind-dining.jpg',text:'머물고 싶은 분위기와 방문할 이유를 함께 정리합니다.',link:'/industries/cafe/'},{industry:'숙박',theme:'stay',image:'ind-stay.jpg',text:'낯선 곳에서도 안심할 수 있는 객실·도착·예약 안내.',link:'/industries/stay.html'},{industry:'뷰티',theme:'beauty',image:'ind-beauty.jpg',text:'원하는 결과를 그려볼 수 있는 사례와 상담의 흐름.',link:'/industries/beauty/'}];
const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=String(text);return n;};
const date=v=>new Date(v).toLocaleDateString('ko-KR',{timeZone:'Asia/Seoul'});
class IndustryFolders extends HTMLElement{
 connectedCallback(){this.stopped=false;this.classList.add('wp-industry-widget');this.render(null);this.load();this.timer=setInterval(()=>{if(!document.hidden)this.load();},60000);this.visible=()=>{if(!document.hidden)this.load();};document.addEventListener('visibilitychange',this.visible);}
 disconnectedCallback(){this.stopped=true;clearInterval(this.timer);this.controller?.abort();document.removeEventListener('visibilitychange',this.visible);}
 async load(){this.controller?.abort();this.controller=new AbortController();const controller=this.controller;const timeout=setTimeout(()=>controller.abort(),12000);try{
 const r=await fetch(this.dataset.endpoint||'/api/weplace-industries',{credentials:'omit',cache:'no-store',signal:controller.signal});if(!r.ok)throw new Error('unavailable');const d=await r.json();if(!Array.isArray(d.industries))throw new Error('invalid');if(!this.stopped&&this.controller===controller)this.render(d);
 }catch(e){if(!this.stopped&&this.controller===controller)this.render(null,true);}finally{clearTimeout(timeout);}}
 render(data,error=false){
 const opened=new Set([...this.querySelectorAll('details[open]')].map(n=>n.dataset.industry));
 const focused=document.activeElement;const focusKey=this.contains(focused)?focused?.dataset?.focus:null;
 const shell=el('div','wp-folders-shell');const status=el('p','wp-folders-status');status.setAttribute('role','status');
 status.textContent=error?'관리 현황에 연결하지 못했습니다. 숫자는 확인 후 다시 안내합니다.':!data?'현재 관리 현황을 확인하고 있습니다.':data.industries.length?'공개 확인된 업종 현황 · 1분마다 갱신':'아래는 상담 분야 안내입니다. 실제 관리 현황은 공개 검토 후 표시됩니다.';
 shell.append(status);
 if(error){const retry=el('button','wp-folder-retry','현황 다시 확인');retry.type='button';retry.dataset.focus='retry';retry.addEventListener('click',()=>this.load());shell.append(retry);}
 const grid=el('div','wp-folders');
 const list=data?.industries.length?data.industries:guides.map(g=>({...g,guide:true}));
 list.forEach((g,index)=>{
  const guide=guides.find(v=>v.industry===g.industry)||{theme:'local',image:'weplace-hero-surface.jpg',text:'현장의 상황에 맞춰 필요한 정보와 실행을 함께 정리합니다.',link:'/field-notes/'};
  const known=Number.isInteger(g.managedCount)&&g.managedCount>=0;
  const limited=known&&Number.isInteger(g.capacity)&&g.capacity>=0&&Number.isInteger(g.remaining)&&g.remaining>=0;
  const folder=el('details','wp-folder wp-folder-'+guide.theme);folder.dataset.industry=g.industry;folder.open=opened.has(g.industry);
  const summary=el('summary');summary.dataset.focus='folder-'+g.industry;
  summary.append(el('span','wp-folder-tab',String(index+1).padStart(2,'0')+' / '+(g.guide?'EXPLORE':'WITH WEPLACE')));
  const top=el('div','wp-folder-top');top.append(el('span','wp-folder-tag',g.guide?'상담 분야 안내':known?'CRM 연동 현황':'공개 작업 기록'),el('span','wp-folder-arrow','↗'));summary.append(top,el('h3','',g.industry));
  const figure=el('figure','wp-folder-image');const img=el('img');img.src=origin+'/img/'+guide.image;img.alt='';img.loading='lazy';img.width=500;img.height=300;figure.append(img,el('figcaption','','업종 이해를 위한 이미지'));summary.append(figure);
  const stat=el('div','wp-folder-number');stat.append(el('strong','',limited?g.remaining+'석':known?g.managedCount+'곳':'—'),el('span','',limited?(g.remaining===0?'대기 상담':'현재 잔여'):known?'현재 관리 중':'관리 현황 확인 중'));summary.append(stat);
  summary.append(el('p','wp-folder-count',limited?'총 '+g.capacity+'곳 관리 가능 · 현재 '+g.managedCount+'곳':known?'수용 한도 확인 중 · 상담으로 안내합니다.':g.guide?'관리 수와 수용 한도는 확인 후 공개합니다.':'공개 승인된 작업 '+g.count+'곳 · 수용 한도 확인 중'));
  if(limited&&g.capacity>0){const bar=el('div','wp-folder-meter');bar.setAttribute('aria-hidden','true');const fill=el('span');fill.style.width=Math.min(100,g.managedCount/g.capacity*100)+'%';bar.append(fill);summary.append(bar);}
  const expand=el('span','wp-folder-expand');expand.append(el('span','wp-folder-closed','폴더 열기 +'),el('span','wp-folder-opened','폴더 닫기 −'));summary.append(expand);folder.append(summary);
  const body=el('div','wp-folder-body');body.append(el('p','',guide.text));
  if(g.updates?.length){body.append(el('h4','','공개된 현장 기록'));g.updates.forEach(u=>{const item=el('div','wp-folder-update');item.append(el('p','',u.summary),el('small','','확인일 '+date(u.updatedAt)));body.append(item);});}else body.append(el('p','wp-folder-muted','공개 가능한 작업 기록을 차례로 소개합니다.'));
  if(g.capacityReviewedAt)body.append(el('p','wp-folder-muted','수용 한도 확인 '+date(g.capacityReviewedAt)+' · 공개 확인 기한 '+g.activeUntil));
  const links=el('div','wp-folder-links');const more=el('a','',g.guide?'업종별 관점 보기 →':'작업·변화 기록 보기 →');more.href=origin+(g.guide?guide.link:'/field-notes/');const contact=el('a','',limited&&g.remaining===0?'다음 일정 상담 →':'이 업종 상담하기 →');contact.href='https://pf.kakao.com/_mxbexhX';contact.target='_blank';contact.rel='noopener noreferrer';links.append(more,contact);body.append(links);folder.append(body);grid.append(folder);
 });shell.append(grid);
 const note=el('p','wp-folders-note',data?.industries.length?'현재 관리 수는 진행 중 계약 중 시작 전·종료 후를 제외한 CRM 거래처 수입니다. 잔여석은 공개 승인된 수용 한도에서 계산하며, 실제 착수 일정은 상담 후 확정합니다.':'거래처 정보와 수용 한도가 확인되면 이곳에 실제 집계가 연결됩니다.');shell.append(note);
 if(data){const time=el('p','wp-folders-time','마지막 조회 '+new Date().toLocaleTimeString('ko-KR',{timeZone:'Asia/Seoul',hour:'2-digit',minute:'2-digit'})+' KST · 연락처·계약조건 비공개');shell.append(time);}
 this.replaceChildren(shell);if(focusKey){[...this.querySelectorAll('[data-focus]')].find(n=>n.dataset.focus===focusKey)?.focus({preventScroll:true});}
 }
}
customElements.define('weplace-industries',IndustryFolders);
})();
