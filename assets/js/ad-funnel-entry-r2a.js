/* Read only allowlisted campaign labels. No storage, collection or network calls. */
(function () {
  'use strict';
  const query = new URLSearchParams(location.search);
  const campaign = query.get('ad') || query.get('campaign');
  const valid = ['dining', 'stay', 'wellness', 'local'].includes(campaign);
  document.documentElement.dataset.afEntry = valid ? 'ad' : 'home';
  document.documentElement.dataset.afCampaign = valid ? campaign : 'local';
})();
