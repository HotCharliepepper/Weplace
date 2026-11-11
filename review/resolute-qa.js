/* Browser QA harness, isolated from the proposed customer page. GETs own static HTML only. */
(() => {
  const frame = document.querySelector('#frame'), result = document.querySelector('#result');
  const wait = ms => new Promise(resolve => setTimeout(resolve,ms));
  let source;
  async function load(width, mode) {
    frame.style.width = `${width}px`;
    if (!source) source = await fetch('/resolute.html').then(r => {if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.text();});
    let html = source;
    if (mode === 'reduce') html = html.replace('<head>', `<head><script>const realMatch=window.matchMedia.bind(window);window.matchMedia=q=>{if(!q.includes('prefers-reduced-motion'))return realMatch(q);return {matches:q.includes('no-preference')?false:true,media:q,onchange:null,addListener(){},removeListener(){},addEventListener(){},removeEventListener(){},dispatchEvent(){return true}}};<\/script>`);
    if (mode === 'no-gsap') html = html.replace(/<script defer src="\/assets\/vendor\/gsap\/[^"<>]+"><\/script>/g,'');
    await new Promise(resolve => {frame.onload = resolve; frame.srcdoc = html;});
    await frame.contentDocument.fonts.ready; await wait(120);
  }
  document.querySelector('#load').addEventListener('click',()=>load(Number(document.querySelector('#width').value),document.querySelector('#mode').value));
  document.querySelector('#run').addEventListener('click',async event=>{
    event.target.disabled = true;
    const checks=[], errors=[];
    const check=(name,value)=>{checks.push({name,pass:!!value});if(!value)errors.push(name);};
    const report=()=>{result.textContent=`${checks.filter(x=>x.pass).length} passed / ${errors.length} failed\n`+(errors.length?errors.join('\n'):'');};
    try {
      for(const width of [360,390,430,768,1280,1440]) {
        await load(width,'normal');const d=frame.contentDocument,w=frame.contentWindow;
        check(`${width} GSAP loaded`,!!w.gsap && !!w.ScrollTrigger);
        check(`${width} no overflow`,d.documentElement.scrollWidth<=width+1);
        check(`${width} one H1`,d.querySelectorAll('h1').length===1);
        for(const topic of ['photo','route','booking']) {
          d.querySelector(`[data-focus="${topic}"]`).click();
          for(const mode of ['before','after']) {
            d.querySelector(`[data-mode="${mode}"]`).click();await wait(380);
            check(`${width} ${topic}/${mode} visible`,!d.querySelector(`[data-view="${topic}-${mode}"]`).hidden && d.querySelectorAll('[data-view]:not([hidden])').length===1);
            check(`${width} ${topic}/${mode} overflow`,d.documentElement.scrollWidth<=width+1);
            check(`${width} ${topic}/${mode} selection`,d.querySelector(`[data-focus="${topic}"]`).getAttribute('aria-pressed')==='true' && d.querySelector(`[data-mode="${mode}"]`).getAttribute('aria-pressed')==='true');
          }
        }
        d.querySelector('[data-guests="6"]').click();d.querySelector('[data-time="19:30"]').click();
        check(`${width} booking selection`,d.querySelector('#booking-summary').textContent==='6명 · 19:30 선택 예시');
        check(`${width} images`,[...d.images].filter(i=>i.getBoundingClientRect().width>0).every(i=>i.complete&&i.naturalWidth>0));
        const targets=[...d.querySelectorAll('.rf-choices button,.rf-modes button,.rf-booking-options button,.rf-nav-cta,.rf-button')].filter(b=>b.getBoundingClientRect().width>0);
        check(`${width} 44px targets`,targets.every(b=>b.getBoundingClientRect().height>=43.5));
        d.querySelector('[data-open-request]').click();
        check(`${width} dialog open and focused`,d.querySelector('dialog').open && d.activeElement.id==='store');
        check(`${width} interest carried`,d.querySelector('#interest').value==='booking');
        d.querySelector('#close-dialog').click();
        check(`${width} dialog closed / focus restored`,!d.querySelector('dialog').open && d.activeElement.matches('[data-open-request]'));
        report();
      }
      for(const mode of ['reduce','no-gsap']) {
        for(const width of [390,1440]) {
          await load(width,mode);const d=frame.contentDocument,w=frame.contentWindow;
          check(`${mode} ${width} no motion`,d.documentElement.dataset.rfMotion==='off' && (!w.ScrollTrigger || w.ScrollTrigger.getAll().length===0));
          check(`${mode} ${width} words readable`,[...d.querySelectorAll('.rf-word')].every(e=>Number(w.getComputedStyle(e).opacity)===1));
          d.querySelector('[data-mode="after"]').click();
          check(`${mode} ${width} compare usable`,!d.querySelector('[data-view="route-after"]').hidden);
          check(`${mode} ${width} no overflow`,d.documentElement.scrollWidth<=width+1);
        }
      }
      await load(1440,'normal');const d=frame.contentDocument,w=frame.contentWindow;
      d.querySelector('#motion-toggle').click();
      check('manual motion toggle disables / reverts',d.documentElement.dataset.rfMotion==='off'&&w.ScrollTrigger.getAll().length===0);
      d.querySelector('#motion-toggle').click();check('manual motion toggle resumes',w.ScrollTrigger.getAll().length===5);
      const links=['/#changes','/#cases','/#flow','/#process','/#request','/industries/','/field-notes/','/enterprise/','/'];
      for(const href of links)check(`preserved route ${href}`,!!d.querySelector(`a[href="${href}"]`));
      check('no payment resources',![...d.scripts].some(s=>/toss|payment/i.test(s.src)));
      check('no automatic form endpoint',!d.querySelector('form[action],form[data-netlify]'));
      report();window.resoluteQA={checks,passed:checks.filter(x=>x.pass).length,failed:errors.length,completedAt:new Date().toISOString()};
      result.textContent+='\n'+JSON.stringify(window.resoluteQA,null,2);
    } catch(e) {result.textContent+='\nQA ERROR: '+e.message;} finally {event.target.disabled=false;}
  });
})();
