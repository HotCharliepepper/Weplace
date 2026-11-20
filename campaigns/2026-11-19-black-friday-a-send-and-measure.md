# WEPLACE / BLACK FRIDAY A — 2026-11-19 17:00 KST

Status: **DRAFT / NOT SENT**. Applies only to opt-in advertising recipients after review.
Source: main November FAST R7, merged via PR #53. This branch is not production.

## 1. Core message

Thumbnail: **광고, 하지 마세요.** / **돈만 들잖아요?**

### Kakao campaign message (single variant for first send)

(광고) [위플레이스]
“광고, 하지 마세요. 돈만 들잖아요?”

광고를 멈추라는 뜻은 아닙니다.
손님이 광고를 보고 들어온 뒤
**사진·찾아오는 길·예약 안내**에서 무엇을 확인하는지 먼저 보자는 이야기입니다.

가상 매장의 화면을 바꾸며 직접 비교해 보세요.
우리 매장에서 먼저 손보고 싶은 한 가지도 골라볼 수 있습니다.

▶ 사진·길·예약 화면 비교하기
https://withweplace.kr/november-fast/?utm_source=kakao&utm_medium=message&utm_campaign=bf_20261119&utm_content=a_contrarian

* 가상 예시 체험입니다. 실제 맞춤 진단의 범위·비용·일정은 담당자가 별도로 안내합니다.
발신: (주)위플레이스마케팅
수신거부: [**실제로 작동하는 수신거부 방법을 발송 툴에 설정하고 문구 확정**]

**Do not send** while unsubscribe, recipient consent, and legal disclosure are incomplete.

## 2. Unique tracked landing URL

`https://withweplace.kr/november-fast/?utm_source=kakao&utm_medium=message&utm_campaign=bf_20261119&utm_content=a_contrarian`

UTM values contain no store names, phone numbers, names, contact IDs, or other recipient data.
Use `utm_content` variants only when intentionally testing creatives or audience segments.
No claim of a Black Friday price discount unless a real authorized offer exists.

## 3. GA4 event taxonomy (proposed and drafted in November R7 HTML)

Measurement ID candidate: `G-FVCYL26FTL` — recorded as new Weplace stream; **property owner must verify before merge**.

| Event | Trigger | Meaning |
|---|---|---|
| `page_view` | GA4 config auto event | Campaign page loaded (GA4 tag required) |
| `campaign_view` | R7 page init | Client JS ran |
| `firstlook_select` | photo / route / booking selected | Topic interest |
| `firstlook_compare` | before / after switched | Comparison action |
| `intake_start` | Wizard first interaction/advance | Inquiry exploration |
| `intake_complete` | All required choices filled (once) | Inquiry text prepared, **not submitted** |
| `message_copy_click` | Copy-only button | Attempted copy, not confirmed delivery |
| `kakao_open_click` | Opens Kakao channel | Outbound click, **not confirmed receipt** |

Event parameters are category choices, not names/numbers/free-text. Do not send PII to analytics.
Do not classify `kakao_open_click` as a contract or confirmed consultation.

## 4. 17:00 launch gates

- [ ] Company approval and actual recipient list with records of marketing-message consent
- [ ] Suppression list for opt-outs, duplicates, and unauthorized contacts
- [ ] Sender name, `(광고)` marking, and working opt-out route in Kakao message tool
- [ ] Marketing-message send mode, not informational AlimTalk
- [ ] Live landing `/november-fast/`, OG thumbnail, mobile 390px, Android and iOS Kakao in-app QA
- [ ] Kakao channel `https://pf.kakao.com/_mxbexhX`: receive test message, copy + paste + actual send confirmed
- [ ] Privacy notice and GA4 `G-FVCYL26FTL` property access/collection validated
- [ ] GA4 DebugView/Realtime `page_view` and events confirmed from test, no PII in URLs/events
- [ ] Staff available for inquiries and actual diagnosis scope / price / turnaround confirmed

**Until all gates pass: internal test only.** Campaign send, merging and production deployment are separate actions.

## 5. Measure actual sales progression

Kakao send/delivery (platform) → GA4 sessions → `firstlook_select` → `firstlook_compare` → `intake_start` → `intake_complete` → `kakao_open_click` → **manually verified received inquiry** → qualified inquiry → meeting held → proposal sent → contract signed → payment received.

After launch, compare the funnel with appropriate denominators and message send dates.
Do not claim sales performance based on GA4 clicks alone.

## 6. Sales follow-up, only to real inbound inquiry

1. Acknowledge the user-selected screen (photo/route/booking).
2. Ask for only the store name + area needed to locate public information, and consent/appropriate privacy notice for collecting anything else.
3. Return one observed issue + one highest priority recommendation, clearly distinguishing observation from assumptions.
4. Offer exact next step with scope, price, turnaround and meeting availability; do not force a purchase.
5. Save lead/meeting/proposal/contract/payment stages in approved CRM, not GA4.

## Review constraints

Do not merge this branch or send a mass Kakao campaign without the gates above. Existing customer photos/revenue evidence must have publication permission. Images in the R7 demonstration remain hypothetical, not guaranteed performance.
