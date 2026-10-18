import { cp, mkdir, readdir, rm, stat, readFile, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import {companyReleaseIssues, replaceCompanyFooter, footerStart, reconcileCompanyStructuredData} from './company-info.mjs';
const root = resolve(import.meta.dirname, '..');
const out = join(root, 'dist');
const folders = ['assets','check','field-notes','img','industries','meeting','my-store','privacy','problems','prototype','review','start','webtoon'];
const production = process.env.CONTEXT === 'production' || process.argv.includes('--production');
const issues = companyReleaseIssues();
const privacySource = await readFile(join(root,'privacy/index.html'),'utf8');
const policyMainTag = privacySource.match(/<main\b[^>]*>/i)?.[0] || '';
const approvedPolicyMarkup = /\bdata-policy-state\s*=\s*(?:"approved"|'approved'|approved)(?=\s|>)/i.test(policyMainTag);
const draftPolicyMarkup = /\bdata-policy-draft\s*=\s*(?:"true"|'true'|true)(?=\s|>)/i.test(privacySource);
if (production && (!approvedPolicyMarkup || draftPolicyMarkup)) issues.push('Privacy HTML must explicitly declare an approved policy and contain no draft marker.');
if (production && issues.length) throw new Error('Production release blocked. Review company/privacy evidence and approval records:\n- '+issues.join('\n- '));
if (!production && issues.length) console.warn('Review build only: '+issues.length+' company/privacy approval checks remain open. No production approval is implied.');
// A dedicated artifact avoids publishing test fixtures, source audits, dependencies or repository metadata.
await rm(out, {recursive:true, force:true});
await mkdir(out, {recursive:true});
for (const name of await readdir(root)) {
  const path = join(root, name);
  const info = await stat(path);
  if ((info.isDirectory() && folders.includes(name)) ||
      (info.isFile() && (/\.(html|png|jpg|jpeg|webp|ico|mp4|svg)$/.test(name) || ['_headers','_redirects','robots.txt','sitemap.xml'].includes(name)))) {
    await cp(path, join(out,name), {recursive:true});
  }
}
// Shared footer is rendered at build time: no client fetch, identity access or
// legal-state config is shipped. Marked source pages remain readable without JS.
async function finalize(folder) {
  for (const entry of await readdir(folder,{withFileTypes:true})) {
    const path=join(folder,entry.name);
    if(entry.isDirectory()) await finalize(path);
    else if(entry.name.endsWith('.html')) {
      let html=await readFile(path,'utf8');
      if(html.includes(footerStart)) html=replaceCompanyFooter(html);
      html=reconcileCompanyStructuredData(html);
      if(!production) {
        html=html.replace(/<meta\s+name=["']robots["'][^>]*>/gi,'');
        html=html.replace('</head>','<meta name="robots" content="noindex, nofollow"></head>');
      }
      await writeFile(path,html);
    }
  }
}
await finalize(out);
const headerPath=join(out,'_headers');
if(!production) {
  const existing=await readFile(headerPath,'utf8').catch(()=> '');
  await writeFile(headerPath,existing+'\n# Build-context rule: review artifacts only; never committed as production global rule.\n/*\n  X-Robots-Tag: noindex, nofollow\n');
}
console.log('Static artifact created: dist/ (no server credentials, CRM writes, or migrations).');
