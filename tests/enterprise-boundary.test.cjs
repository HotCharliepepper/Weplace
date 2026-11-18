const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),{JSDOM}=require('jsdom');
for(const path of ['enterprise/index.html','process/index.html'])test(path+' stays a readable static public surface without internal procurement data',()=>{
 const html=fs.readFileSync(path,'utf8'),d=new JSDOM(html).window.document;
 assert.equal(d.querySelectorAll('h1').length,1);assert.ok(d.querySelector('main'));assert.ok(d.querySelector('a[href="#main"]'));
 assert.match(d.querySelector('meta[name="robots"]').content,/noindex/);
 assert.equal(d.querySelectorAll('form,script[src*="procurement"],iframe').length,0);
 assert.doesNotMatch(html,/EBSi|R26BK01779535|176,000,000|demo-author|flow_tender_|FLOW_PROCUREMENT_|\.netlify\/functions\/procurement/);
 assert.ok(d.querySelector('a[href="/enterprise/#contact"]'));assert.ok(d.querySelector('a[href="/field-notes/"]'));
 for(const a of d.querySelectorAll('a'))assert.ok(a.textContent.trim()||a.getAttribute('aria-label'));
});
test('review build retains both new routes and the existing main flow preview',()=>{
 const build=fs.readFileSync('scripts/build-site.mjs','utf8');for(const folder of ['enterprise','process','flow-preview'])assert.ok(build.includes("'"+folder+"'"));
 assert.ok(fs.existsSync('flow-preview/index.html'));assert.doesNotMatch(build,/review-dist|procurement/);
});
