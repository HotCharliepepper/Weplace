// Explicit local source update. Build always renders marked footers from config.
import {readFile,writeFile} from 'node:fs/promises';
import {resolve,relative} from 'node:path';
import {renderCompanyFooter,replaceCompanyFooter,footerStart,reconcileCompanyStructuredData} from './company-info.mjs';
const root=resolve(import.meta.dirname,'..');
const paths=process.argv.slice(2);
if(!paths.length)throw new Error('Specify HTML paths to update; no implicit repository-wide mutation.');
for(const path of paths){
 const full=resolve(root,path);
 if(relative(root,full).startsWith('..')||!path.endsWith('.html'))throw new Error('Only repository HTML paths may be updated.');
 let html=await readFile(full,'utf8');
 if(html.includes(footerStart))html=replaceCompanyFooter(html);
 else if(/<footer\b[\s\S]*?<\/footer>/i.test(html))html=html.replace(/<footer\b[\s\S]*?<\/footer>/i,renderCompanyFooter());
 else html=html.replace('</body>',renderCompanyFooter()+'\n</body>');
 if(!html.includes('href="/assets/css/company-info.css"'))html=html.replace('</head>','<link rel="stylesheet" href="/assets/css/company-info.css">\n</head>');
 html=reconcileCompanyStructuredData(html);
 await writeFile(full,html);
}
console.log('Shared company footer source snapshots updated: '+paths.length);
