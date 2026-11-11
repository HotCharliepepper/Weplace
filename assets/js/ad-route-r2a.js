/* Thin static campaign route. replace avoids an extra Back-button redirect step. */
(function () {
  'use strict';
  const campaign=(location.pathname.match(/\/go\/(dining|stay|wellness|local)(?:\/|$)/)||[])[1];
  if(!campaign) return;
  const target=new URL('/ad-funnel.html',location.origin),incoming=new URLSearchParams(location.search);
  target.searchParams.set('ad',campaign);
  ['utm_source','utm_medium','utm_campaign','utm_content','utm_term'].forEach(key=>{
    const v=incoming.get(key);if(v && /^[a-zA-Z0-9_-]{1,80}$/.test(v))target.searchParams.set(key,v);
  });
  if(incoming.get('team')==='1')target.searchParams.set('team','1');
  if(['#experience','#contrast','#diagnosis','#offer','#meeting'].includes(location.hash))target.hash=location.hash;
  location.replace(target.href);
})();
