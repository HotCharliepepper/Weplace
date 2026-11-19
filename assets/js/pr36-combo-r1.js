/* WEPLACE PR36 BAR + LINE / OBSERVED EVIDENCE SELECTOR.
   Different businesses always remain separate. All values are provided records, not proven causal effects. */
(()=>{'use strict';
 const data={
  "2023":{values:[1.70,1.79,1.60],delta:"−1,900",rate:"−10.6%"},
  "2024":{values:[1.66,1.96,1.94],delta:"−200",rate:"−1.0%"},
  "2025":{values:[1.91,2.02,1.70],delta:"−3,200",rate:"−15.8%"},
  "2026":{values:[1.74,1.72,1.93],delta:"+2,100",rate:"+12.2%"}
 };
 const svg=document.getElementById("wp-combo-sales");
 if(!svg)return;
 const months=["4월","5월","6월"],xs=[136,276,416],base=232,drawH=175,max=2.1,left=62,right=496;
 const esc=s=>String(s).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll('"',"&quot;");
 const y=n=>base-n/max*drawH;
 const grid=()=>[0,1,2].map(v=>{const yy=y(v);return '<line x1="'+left+'" x2="'+right+'" y1="'+yy+'" y2="'+yy+'" class="wp-combo-grid"/><text x="'+(left-12)+'" y="'+(yy+4)+'" text-anchor="end" class="wp-combo-axis">'+(v===0?"0":v+"억")+'</text>';}).join("");
 function draw(year){
  const item=data[year];
  if(!item)return;
  const values=item.values;
  const texts=values.map(n=>n.toFixed(2)+"억");
  const title=year+"년 음식점 A 4월·5월·6월 매출 막대와 연결선";
  const desc=year+"년 4월 "+texts[0]+", 5월 "+texts[1]+", 6월 "+texts[2]+". 0원에서 2.1억 원까지 공통 축을 사용했습니다.";
  const bars=values.map((v,i)=>{const yy=y(v);return '<rect x="'+(xs[i]-28.5)+'" y="'+yy+'" width="57" height="'+(base-yy)+'" rx="4" class="wp-combo-bar '+(i===2?'wp-combo-bar--end':'')+'"/>';}).join("");
  const path='<path d="'+values.map((v,i)=>(i?'L':'M')+xs[i]+','+y(v)).join(' ')+'" class="wp-combo-line"/>';
  const dots=values.map((v,i)=>'<circle class="wp-combo-dot" cx="'+xs[i]+'" cy="'+y(v)+'" r="5.5"/>').join("");
  const figures=values.map((v,i)=>'<g><text x="'+xs[i]+'" y="'+(y(v)-16)+'" text-anchor="middle" class="wp-combo-value">'+esc(texts[i])+'</text><text x="'+xs[i]+'" y="'+(base+29)+'" text-anchor="middle" class="wp-combo-axis wp-combo-month">'+months[i]+'</text></g>').join("");
  svg.innerHTML='<title id="wp-combo-sales-title">'+esc(title)+'</title><desc id="wp-combo-sales-desc">'+esc(desc)+'</desc><g>'+grid()+'</g><g>'+bars+'</g><g>'+path+dots+'</g>'+figures;
  const impact=document.getElementById("wp-combo-delta");
  const rate=document.getElementById("wp-combo-rate");
  const heading=document.getElementById("wp-sales-title");
  if(impact)impact.textContent=item.delta;
  if(rate)rate.textContent=item.rate;
  if(heading)heading.textContent=year+"년 4·5·6월, 마지막 두 달의 변화";
  document.querySelectorAll('[data-combo-year]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.comboYear===year)));
 }
 document.querySelectorAll('[data-combo-year]').forEach(button=>{
   button.addEventListener('click',()=>{draw(button.dataset.comboYear);window.wpAnalytics?.track?.("evidence_year_select",{year_selected:button.dataset.comboYear});});
 });
 draw("2026");
})();