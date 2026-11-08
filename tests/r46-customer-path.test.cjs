'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const css=fs.readFileSync(path.join(root,'assets/css/main-landing-r46.css'),'utf8');

test('R4.6 stylesheet present exactly once',()=>{
 assert.equal((html.match(/href="\/assets\/css\/main-landing-r46\.css"/g)||[]).length,1);
});
test('existing R4.5 hero and CTA remain',()=>{
 assert.match(html,/id="cinema"/);
 assert.match(html,/매장은 그대로인데/);
 assert.match(html,/우리 매장 첫 화면 확인하기/);
 assert.match(html,/main-landing-r45\.js/);
});
test('changes: both states have question, information and action in one existing comparison',()=>{
 assert.match(html,/class="r46-path-insight"/);
 assert.match(html,/class="r46-path-version r46-state-before"/);
 assert.match(html,/class="r46-path-version r46-state-after"/);
 assert.match(css,/\.sample-page\.before ~ \.r46-path-insight/);
 assert.match(css,/\.sample-page\.after ~ \.r46-path-insight/);
 assert.match(html,/사진 선택의 매출 효과를 뜻하지 않습니다/);
});
test('stay: five existing tab panels each contain a customer journey',()=>{
 for(let i=0;i<5;i++){
   const start=html.indexOf('id="stay-panel-'+i+'"');
   assert.ok(start>=0,'missing stay panel '+i);
   const end=i<4?html.indexOf('id="stay-panel-'+(i+1)+'"',start):html.indexOf('</div>\n        </div>\n        <div class="open-work-foot">',start);
   assert.ok(end>start,'panel bounds '+i);
   const segment=html.slice(start,end);
   assert.match(segment,/class="r46-stay-journey"/);
   assert.match(segment,/>질문</);
   assert.match(segment,/>필요한 정보</);
   assert.match(segment,/>다음 행동</);
 }
});
test('explore retains Weplace enquiry and separates responsibility',()=>{
 assert.match(html,/class="r46-role-grid"/);
 assert.match(html,/Mashcore Lab/);
 assert.match(html,/class="r46-bridge-actions"><a class="text-link" href="#request"/);
 assert.match(html,/링크만으로 상담·고객 데이터·계약 또는 결제가 연결되지 않습니다/);
});
test('no extra public Mashcore bridge route is generated',()=>{
 assert.doesNotMatch(html,/href="\/review\/mashcore-bridge\//);
});
test('mobile and reduced-motion stylesheet rules exist',()=>{
 assert.match(css,/@media\(max-width:639px\)/);
 assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
});
