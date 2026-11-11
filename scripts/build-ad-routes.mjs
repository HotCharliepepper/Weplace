// Runs only after the original build (and its release guards) succeeds.
// The original protected builder, headers, redirects and release metadata stay unchanged.
import { cp, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
const root=resolve(import.meta.dirname,'..');
await mkdir(resolve(root,'dist/go'),{recursive:true});
for(const campaign of ['dining','stay','wellness','local']) {
  await cp(resolve(root,'go',campaign),resolve(root,'dist/go',campaign),{recursive:true});
}
console.log('R2-A: four static, noindex campaign routes included.');
