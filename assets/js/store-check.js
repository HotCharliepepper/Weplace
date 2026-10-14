/* Self-report guidance only. Answers stay in memory and are never sent to analytics or an API. */
(function(){'use strict';
const questions=[
 {title:'네이버·구글·홈페이지에서 영업시간과 위치가 같은가요?',short:'기본 정보의 일치',group:'발견',action:'네이버·구글·홈페이지를 나란히 열고 영업시간, 휴무, 주소, 연락처를 비교해 다른 정보를 고쳐 주세요.'},
 {title:'지금의 공간과 서비스를 보여주는 최근 사진이 있나요?',short:'현재 모습을 보여주는 사진',group:'발견',action:'손님이 실제로 만나는 입구·공간·대표 상품의 최근 사진을 골라 첫 화면부터 교체해 보세요.'},
 {title:'최근 리뷰에서 반복되는 질문을 확인하고 안내에 반영하나요?',short:'리뷰에서 찾는 고객의 질문',group:'안심',action:'최근 리뷰와 문의에서 반복되는 질문 세 가지를 적고, 매장 소개나 자주 묻는 질문에 답을 넣어 주세요.'},
 {title:'누구에게 잘 맞는 매장인지, 실제 사진과 설명으로 알 수 있나요?',short:'우리 매장을 선택할 이유',group:'안심',action:'어떤 상황의 손님에게 잘 맞는지 한 문장으로 적고, 그 설명을 뒷받침하는 실제 사진이나 서비스 안내를 함께 보여 주세요.'},
 {title:'가격·이용 조건·추가 비용을 문의 전에 확인할 수 있나요?',short:'가격과 이용 기준',group:'행동',action:'대표 상품의 가격과 포함 사항, 추가 비용, 변경·취소 기준을 고객이 예약 전에 보는 위치에 정리해 주세요.'},
 {title:'휴대폰에서 예약·문의 버튼을 눌러 끝까지 진행할 수 있나요?',short:'예약과 문의의 연결',group:'행동',action:'손님의 휴대폰이라고 생각하고 검색부터 예약·문의까지 직접 눌러 보세요. 끊긴 링크와 중복 입력부터 줄여 주세요.'}
];
const labels={yes:'확실히 그렇습니다',part:'일부만 되어 있어요',no:'아직 되어 있지 않아요',unknown:'잘 모르겠어요'};
const industries={dining:{name:'식당 · 카페',tip:'식당·카페라면 메뉴와 가격, 주차, 대기·예약 방법을 한 화면에서 찾을 수 있는지 먼저 살펴보세요.'},stay:{name:'호텔 · 숙소',tip:'숙소라면 객실별 차이와 요금 기준, 도착 동선, 체크인·취소 안내를 예약 전에 확인할 수 있게 정리해 보세요.'},beauty:{name:'뷰티 · 케어',tip:'뷰티·케어라면 서비스별 소요 시간과 가격 범위, 실제 사례, 상담 전 준비사항을 함께 안내해 보세요.'},other:{name:'그 외 매장 · 서비스',tip:'고객이 가장 자주 묻는 이용 대상, 가격 기준, 방문·예약 방법을 한곳에 정리해 보세요.'}};
const $=id=>document.getElementById(id), form=$('storeCheck');
questions.forEach((q,i)=>{const field=document.createElement('fieldset');field.className='check-question';const legend=document.createElement('legend');legend.textContent=String(i+1).padStart(2,'0')+' / '+q.title;field.append(legend);const options=document.createElement('div');options.className='check-options';Object.entries(labels).forEach(([value,label])=>{const el=document.createElement('label'),input=document.createElement('input');input.type='radio';input.name='q'+i;input.value=value;input.required=true;el.append(input,document.createTextNode(label));options.append(el);});field.append(options);$('questions').append(field);});
const answers=()=>questions.map((_,i)=>form.querySelector('input[name="q'+i+'"]:checked')?.value);
form.addEventListener('change',()=>{const n=answers().filter(Boolean).length;$('checkCount').textContent=n+' / 6개 답변';$('checkProgress').value=n;$('checkError').textContent='';});
form.addEventListener('submit',event=>{event.preventDefault();const a=answers(),industry=industries[$('industry').value];if(!industry){$('checkError').textContent='업종을 먼저 선택해 주세요.';$('industry').focus();return;}const missing=a.findIndex(v=>!v);if(missing!==-1){$('checkError').textContent=(missing+1)+'번 질문에 답해 주세요. 확실하지 않다면 ‘잘 모르겠어요’를 선택해도 됩니다.';form.querySelector('input[name="q'+missing+'"]').focus();return;}
 const unknown=a.findIndex(v=>v==='unknown'),no=a.findIndex(v=>v==='no'),partial=a.findIndex(v=>v==='part'),strong=a.findIndex(v=>v==='yes');
 const first=no!==-1?no:unknown!==-1?unknown:partial!==-1?partial:0;
 const allYes=a.every(v=>v==='yes'),q=questions[first];
 const title=allYes?'기본 흐름을 갖춘 매장':no!==-1?({발견:'찾는 순간을 다듬을 매장',안심:'선택할 근거를 쌓을 매장',행동:'예약의 마지막 한 걸음을 이을 매장'}[q.group]):unknown!==-1?'손님의 화면부터 확인할 매장':'잘 갖춘 부분을 연결할 매장';
 const reason=allYes?'여섯 항목 모두 잘 갖춰져 있다고 답하셨어요. 이제 실제 화면과 고객의 행동에서도 같은 흐름이 이어지는지 확인해 볼 차례입니다.':'‘'+q.short+'’에 ‘'+labels[a[first]]+'’라고 답하셨어요. '+(a[first]==='unknown'?'부족하다고 단정하기보다, 실제 화면을 확인하는 일부터 제안합니다.':'이 부분부터 살펴보면 다음 작업의 범위를 정하기 쉽습니다.');
 const strength=strong!==-1?'‘'+questions[strong].short+'’ 항목은 잘 갖춰져 있다고 답하셨어요. 실제 화면에서도 유지되는지 확인하며 이어가세요.':'아직 강점이라고 판단할 만큼 확실한 답변이 없습니다. 현재 화면을 함께 확인하고 잘된 부분부터 찾아보세요.';
 const priority=allYes?'정보를 바꾼 뒤에도 모든 채널에서 같은 내용이 보이는지, 예약 경로가 작동하는지 확인하세요.':q.action;
 const actions=[priority,industry.tip,'바꾼 화면과 날짜를 남기고, 다음 주에 같은 화면을 다시 확인하세요. 문의·예약 변화를 비교할 때는 기간과 집계 기준을 함께 기록해 주세요.'];
 $('resultTitle').textContent=title;$('resultReason').textContent=reason;$('resultStrength').textContent=strength;$('resultPriority').textContent=priority;$('resultActions').replaceChildren();actions.forEach(text=>{const li=document.createElement('li');li.textContent=text;$('resultActions').append(li);});$('resultAnswers').replaceChildren();questions.forEach((question,i)=>{const li=document.createElement('li');li.textContent=question.short+' — '+labels[a[i]];$('resultAnswers').append(li);});
 $('resultText').value=['Weplace · 우리 매장의 선택 신호','업종: '+industry.name,'결과: '+title,'',reason,'','살려 갈 강점: '+strength,'','다음 행동',...actions.map((text,i)=>(i+1)+'. '+text),'','나의 답변',...questions.map((question,i)=>question.short+': '+labels[a[i]]),'','자가 응답을 바탕으로 한 제안이며 실제 매장 조사나 성과 측정 결과는 아닙니다.','https://withweplace.kr/check/','','상담 시 추가할 내용: 매장명 / 지역 / 현재 채널 주소'].join('\n');
 $('checkIntro').hidden=true;$('questionSection').hidden=true;$('result').hidden=false;$('copyStatus').textContent='';$('resultTitle').focus();
 });
 $('editAnswers').addEventListener('click',()=>{$('result').hidden=true;$('checkIntro').hidden=false;$('questionSection').hidden=false;$('industry').focus();});
 $('copyResult').addEventListener('click',async()=>{try{await navigator.clipboard.writeText($('resultText').value);$('copyStatus').textContent='복사했습니다. 카카오톡 상담창에 붙여 넣어 주세요.';}catch{$('resultText').focus();$('resultText').select();$('copyStatus').textContent='자동 복사를 사용할 수 없습니다. 위 요약을 선택해 직접 복사해 주세요.';}});
 $('downloadResult').addEventListener('click',()=>{const blob=new Blob([$ ('resultText').value],{type:'text/plain;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='weplace-store-check.txt';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);$('copyStatus').textContent='결과 파일의 다운로드를 요청했습니다.';});
})();
