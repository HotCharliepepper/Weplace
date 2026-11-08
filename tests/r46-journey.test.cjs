'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const page = fs.readFileSync('index.html', 'utf8');
const css = fs.readFileSync('assets/css/main-landing-r46.css', 'utf8');

test('R4.5 hero script is still loaded exactly once; no R4.4 hero owner', () => {
  assert.equal((page.match(/\/assets\/js\/main-landing-r45\.js/g) || []).length, 1);
  assert.equal((page.match(/\/assets\/js\/main-landing-r44\.js/g) || []).length, 0);
  assert.match(page, /id="cinema"/);
  assert.match(page, /id="scene-play"/);
});

test('R4.6 CSS is present without a new animation owner', () => {
  assert.equal((page.match(/main-landing-r46\.css/g) || []).length, 1);
  assert.doesNotMatch(page, /main-landing-r46\.js/);
  assert.match(css, /#change-panel\.before \+ \.r46-clarity/);
});

test('Luwei before/after remains manually switchable and has two question journeys', () => {
  assert.match(page, /data-change="before"/);
  assert.match(page, /data-change="after"/);
  assert.match(page, /r46-clarity-mode--before/);
  assert.match(page, /r46-clarity-mode--after/);
  assert.match(page, /실제 예약 완료나 사진 교체의 매출 효과를 뜻하지 않습니다/);
});

test('Every existing hotel tab has question, information, next action', () => {
  assert.equal((page.match(/class="r46-stay-steps"/g) || []).length, 5);
  assert.equal((page.match(/<dt>손님의 질문<\/dt>/g) || []).length, 5);
  assert.equal((page.match(/<dt>확인할 정보<\/dt>/g) || []).length, 5);
  assert.equal((page.match(/<dt>다음 행동<\/dt>/g) || []).length, 5);
  assert.match(css, /\.stay-panel\[hidden\]\{display:none!important\}/);
});

test('Explore distinguishes the separate brand responsibilities, preserving Weplace CTA', () => {
  assert.match(page, /MASHCORE LAB \/ 해석·설계/);
  assert.match(page, /WEPLACE \/ 현장 실행·운영/);
  assert.match(page, /https:\/\/mashcore\.co\.kr\/work\/weplace\//);
  assert.match(page, /class="r46-role-actions"/);
  assert.match(page, /href="#request">우리 매장 첫 화면 확인하기/);
  assert.match(page, /상담·계정·계약 정보가 자동으로 연결되지는 않습니다/);
});

test('Known metrics, flows, and offer boundaries remain present', () => {
  assert.match(page, /id="cases"/);
  assert.match(page, /id="flow"/);
  assert.match(page, /id="request"/);
  assert.match(page, /0원/);
  assert.match(page, /1곳/);
  assert.match(page, /1개/);
  assert.match(page, /#open-work|id="open-work"/);
});
