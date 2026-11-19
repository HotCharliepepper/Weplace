/* GA4: opt-in, no tags before user's choice, whitelisted category events only. */
(()=>{'use strict';
const NEW='G-FVCYL26FTL',OLD='G-H9B5F4HRDS',KEY='weplace_analytics_consent_v1';
const home=location.pathname==='/'||location.pathname.endsWith('/index.html');
const isNetlifyPreview=/(^|\\.)netlify\\.app$/.test(location.hostname);
let choice=null,loaded=false;
function get(){try{return localStorage.getItem(KEY)}catch(_){return null}}
function save(v){try{localStorage.setItem(KEY,v)}catch(_){}}
const events=new Set(['campaign_view','firstlook_select','firstlook_compare','intake_start','intake_complete','message_copy_click','kakao_open_click','evidence_year_select','luwei_step','home_to_campaign','campaign_to_home']);
const keys=new Set(['campaign_variant','campaign_topic','page_type','focus_type','compare_mode','industry_type','request_type','first_step','mode','industry','entry_point','year_selected','source_type','phase','step_number']);
function cleanParams(data){
 const safe={};
 Object.entries(data||{}).forEach(([key,value])=>{
   if(!keys.has(key))return;
   if(typeof value==='number'&&Number.isFinite(value)&&Math.abs(value)<1000){safe[key]=value;return;}
   if(typeof value==='string'&&value.length<=40&&/^[a-zA-Z0-9_-]+$/.test(value))safe[key]=value;
 });
 return safe;
}
function cleanUrl(){
 const u=new URLSearchParams(location.search),q=new URLSearchParams();
 const allowed={utm_source:['kakao','naver','google'],utm_medium:['message','cpc','social'],utm_campaign:['bf_20261119','bf_20261125'],utm_content:['a_contrarian','a_r8','a_r8_reversal']};
 Object.entries(allowed).forEach(([k,values])=>{const v=u.get(k);if(v&&values.includes(v))q.set(k,v)});
 return location.origin+location.pathname+(q.size?'?'+q.toString():'');
}
function track(name,params){
 if(choice!=='accepted'||!loaded||!events.has(name))return false;
 try{window.gtag('event',name,{...cleanParams(params),send_to:NEW});return true}catch(_){return false}
}
function load(){
 if(loaded||choice!=='accepted'||isNetlifyPreview)return;
 loaded=true;
 window.dataLayer=window.dataLayer||[];
 window.gtag=window.gtag||function(){window.dataLayer.push(arguments)};
 window.gtag('consent','default',{analytics_storage:'granted',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
 window.gtag('js',new Date());
 const config={page_location:cleanUrl(),page_referrer:'',allow_google_signals:false,allow_ad_personalization_signals:false,send_page_view:true};
 (home?[OLD,NEW]:[NEW]).forEach(id=>window.gtag('config',id,{...config}));
 const tag=document.createElement('script');tag.async=true;tag.src='https://www.googletagmanager.com/gtag/js?id='+NEW;
 tag.onerror=()=>{const s=document.getElementById('wp-consent-status');if(s)s.textContent='분석 서버에 연결하지 못했습니다. 사이트 이용에는 영향이 없습니다.'};
 document.head.appendChild(tag);
}
function banner(){return document.getElementById('wp-consent-panel')}
function show(){const p=banner();if(p)p.hidden=false}
function hide(){const p=banner();if(p)p.hidden=true}
function choose(value){
 const wasLoaded=loaded;choice=value;save(value);hide();
 if(choice==='accepted'){load();return;}
 if(wasLoaded)location.reload();
}
function init(){
 choice=get();if(choice!=='accepted'&&choice!=='rejected')choice=null;
 const panel=banner();if(!panel)return;
 panel.querySelector('[data-wp-choose="accepted"]')?.addEventListener('click',()=>choose('accepted'));
 panel.querySelector('[data-wp-choose="rejected"]')?.addEventListener('click',()=>choose('rejected'));
 document.querySelectorAll('[data-wp-consent-manage]').forEach(btn=>btn.addEventListener('click',show));
 if(choice==='accepted')load();else if(choice===null)show();
 if(isNetlifyPreview){const msg=document.getElementById('wp-consent-status');if(msg)msg.textContent='검토용 Netlify Preview에서는 실제 GA4 데이터가 전송되지 않습니다.';}
 document.addEventListener('click',e=>{
  const a=e.target.closest?.('a[href]');if(!a)return;
  const href=a.getAttribute('href')||'';
  if(home&&href.includes('/november-fast/'))track('home_to_campaign',{source_type:'home'});
  if(!home&&href==='/')track('campaign_to_home',{source_type:'campaign'});
 },true);
}
window.wpAnalytics={track,getState:()=>choice,streamId:NEW};
window.wpCampaignTrack=track;
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();