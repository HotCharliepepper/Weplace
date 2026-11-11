// Explicit local-only photo installer for the Weplace R4.12 homepage.
// No git push, deployment, permission/config, customer data or GA4 changes.
import { existsSync, readFileSync, mkdirSync, copyFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { createHash } from 'node:crypto';

const home=process.env.USERPROFILE||process.env.HOME||'';
const args=process.argv.slice(2);
const positional=args.filter(arg=>!arg.startsWith('--'));
const source=resolve(positional[0]||join(home,'weplace-firstlook-r412-review','public','campaign','choices'));
const destination=resolve(process.cwd(),'assets','first-look','photos');
const names=[
 'recognize-a.webp','recognize-b.webp','recognize-duo.webp',
 'warmth-a.webp','warmth-b.webp','sheen-a.webp','sheen-b.webp',
 'plate-a.webp','plate-b.webp'
];
const digest=(bytes)=>createHash('sha256').update(bytes).digest('hex');
const inspect=(path)=>{
 const bytes=readFileSync(path);
 if(bytes.length<30000 || bytes.toString('ascii',0,4)!=='RIFF' || bytes.toString('ascii',8,12)!=='WEBP'){
   throw new Error('Invalid or undersized WebP: '+path);
 }
 return {sha:digest(bytes),bytes:bytes.length};
};
if(!existsSync(source))throw new Error('Source photo directory not found: '+source);
const missing=names.filter(name=>!existsSync(join(source,name)));
if(missing.length)throw new Error('All nine images must be present before copying: '+missing.join(', '));
const sourceInfo=new Map(names.map(name=>[name,inspect(join(source,name))]));
for(const name of names){
 const path=join(destination,name);
 if(existsSync(path)&&inspect(path).sha!==sourceInfo.get(name).sha){
   throw new Error('Refusing to overwrite different existing asset: '+path);
 }
}
mkdirSync(destination,{recursive:true});
for(const name of names){
 const from=join(source,name),to=join(destination,name);
 if(!existsSync(to))copyFileSync(from,to);
 const current=inspect(to);
 if(current.sha!==sourceInfo.get(name).sha)throw new Error('Failed integrity check after copying '+name);
 console.log('OK '+name+' · '+Math.round(statSync(to).size/1024)+' KiB · sha256 '+current.sha.slice(0,12));
}
console.log('All nine optional AI WebP assets installed at '+destination);
console.log('No git commit, remote push, operating deployment, credentials or analytics settings changed.');
