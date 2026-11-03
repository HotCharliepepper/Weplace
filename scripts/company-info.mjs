import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
const root=resolve(import.meta.dirname,'..');
export const company=JSON.parse(await readFile(resolve(root,'config/company-info.json'),'utf8'));
export const privacyRelease=JSON.parse(await readFile(resolve(root,'config/privacy-release.json'),'utf8'));
export const footerStart='<!-- WEPLACE_COMPANY_FOOTER -->';
export const footerEnd='<!-- /WEPLACE_COMPANY_FOOTER -->';
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const requiredCompanyFields=['brand','legalName','representative','businessNumber','businessAddress','email','telephone','privacyContactDepartment'];
export const requiredPrivacyChecks=['controllerAndContact','purposesAndLegalBases','fieldsAndRequiredOptional','retentionAndLegalPreservation','deletionAndBackups','processorsAndSubprocessors','thirdPartyProvision','internationalTransfers','cookiesAnalyticsAndSecurityLogs','rightsRequestWorkflow','securityMeasuresAndIncidentProcess','flowCollectionTimeNotice','termsAndPolicySeparation'];
const nonempty=value=>typeof value==='string'&&value.trim().length>0;
const validDate=value=>typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&Number.isFinite(Date.parse(value))&&new Date(value).toISOString().slice(0,10)===value;
const validApprovalDate=value=>validDate(value)||(typeof value==='string'&&/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value)&&Number.isFinite(Date.parse(value))&&new Date(value).toISOString()===value.replace(/(?<!\.\d{3})Z$/,'.000Z'));
export function companyReleaseIssues(data=company,policy=privacyRelease){
 const issues=[];
 if(data?.publicationState!=='approved'||data?.releaseApproved!==true||!nonempty(data?.approvedBy)||!validApprovalDate(data?.approvedAt))issues.push('Company information release approval is incomplete.');
 for(const key of requiredCompanyFields){const field=data?.fields?.[key];if(field?.status!=='confirmed'||!nonempty(field?.value)||!nonempty(field?.evidence))issues.push(`Company field requires current evidence: ${key}`);}
 if(policy?.publicationState!=='approved'||policy?.releaseApproved!==true||!validDate(policy?.effectiveDate)||!nonempty(policy?.approvedBy)||!validApprovalDate(policy?.approvedAt))issues.push('Privacy policy is a draft without approved effective date.');
 for(const key of requiredPrivacyChecks)if(policy?.verified?.[key]!==true)issues.push(`Privacy operations require confirmation: ${key}`);
 return issues;
}
export function renderCompanyFooter(data=company,policy=privacyRelease){
 const f=data.fields,links=data.links;
 const review=data.publicationState!=='approved';
 const line=(label,key)=>f[key]?.value?`<div><dt>${escape(label)}</dt><dd>${escape(f[key].value)}</dd></div>`:'';
 const email=f.email.value?`<a href="mailto:${escape(f.email.value)}">${escape(f.email.value)}</a>`:'';
 const phone=f.telephone.value?`<a href="tel:${escape(f.telephone.value.replace(/[^+0-9]/g,''))}">${escape(f.telephone.value)}</a>`:'';
 return `${footerStart}\n<footer id="site-footer" class="company-footer" data-company-version="${escape(data.version)}" aria-label="회사 정보와 개인정보 안내">\n<div class="company-inner"><div class="company-heading"><a class="w-brand" href="/"><img src="/apple-touch-icon.png" alt="" width="36" height="36"><span class="w-wordmark">We,place.</span></a><p>현장을 이해하고, 필요한 것을 만듭니다.</p></div>\n${review?'<p class="company-review-note">회사 정보 검토안 · 기존 공개 표기를 모았으며 최신 서류와 운영 담당자의 확인 후 확정합니다.</p>':''}\n<dl class="company-facts">${line('서비스 제공·운영','legalName')}${line('대표자','representative')}${line('사업자등록번호','businessNumber')}${line('사업장 주소','businessAddress')}</dl>\n<div class="company-contact"><span>기존 공개 문의 경로</span>${email}${phone}<a href="${escape(links.kakao)}" target="_blank" rel="noopener noreferrer">카카오 문의 ↗</a></div>\n<nav class="company-links" aria-label="법률 및 이용 안내"><a href="${escape(links.privacy)}">개인정보처리방침${policy.publicationState==='draft'?' (검토 초안)':''}</a><a href="/start/#geo-pricing">서비스·계약 조건 안내</a><a href="${escape(links.client)}">내 매장 관리</a><a href="/field-notes/">공개 현장 기록</a><a href="/client">고객 로그인</a><a href="/team">직원 로그인</a><a href="${escape(links.mashcore)}" target="_blank" rel="noopener noreferrer">브랜드 관점과 연구 · Mashcore Lab ↗</a></nav>\n<p class="company-note">Mashcore 링크는 콘텐츠 탐색 경로입니다. 고객 계정이나 상담 기록을 연결하지 않습니다.</p><p class="company-note">© 2026 Weplace</p></div>\n</footer>\n${footerEnd}`;
}
export function replaceCompanyFooter(html,data=company,policy=privacyRelease){
 const block=renderCompanyFooter(data,policy);
 const start=html.indexOf(footerStart),end=html.indexOf(footerEnd);
 if(start!==-1&&end>start)return html.slice(0,start)+block+html.slice(end+footerEnd.length);
 throw new Error('Missing explicit company-footer markers. Add the shared footer at the intended location.');
}
export function reconcileCompanyStructuredData(html,data=company){
 const approved=data.publicationState==='approved'&&data.releaseApproved===true;
 const confirmed=key=>{const field=data.fields?.[key];return approved&&field?.status==='confirmed'&&nonempty(field.value)&&nonempty(field.evidence)?field.value:null;};
 function visit(node){
  if(!node||typeof node!=='object')return;
  if(Array.isArray(node)){node.forEach(visit);return;}
  const types=Array.isArray(node['@type'])?node['@type']:[node['@type']];
  if(types.includes('Organization')){
   node.name=data.fields.brand.value;
   // These claims require the same reviewed legal record as the shared footer.
   for(const key of ['legalName','email','telephone','address','taxID','vatID','identifier','founder','foundingDate','contactPoint'])delete node[key];
   for(const key of ['legalName','email','telephone'])if(confirmed(key))node[key]=confirmed(key);
   if(confirmed('businessNumber'))node.taxID=confirmed('businessNumber');
   if(confirmed('businessAddress'))node.address={'@type':'PostalAddress',streetAddress:confirmed('businessAddress')};
  }
  Object.values(node).forEach(visit);
 }
 return html.replace(/(<script\b[^>]*type=["']application\/ld\+json["'][^>]*>)([\s\S]*?)(<\/script>)/gi,(_,open,json,close)=>{const graph=JSON.parse(json);visit(graph);return open+JSON.stringify(graph)+close;});
}
