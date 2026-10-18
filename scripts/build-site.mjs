import { cp, mkdir, readdir, rm, stat } from 'node:fs/promises';
import { resolve, join } from 'node:path';
const root = resolve(import.meta.dirname, '..');
const out = join(root, 'dist');
const folders = ['assets','check','field-notes','img','industries','meeting','my-store','problems','prototype','review','start','webtoon'];
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
console.log('Static artifact created: dist/ (no server credentials, CRM writes, or migrations).');
