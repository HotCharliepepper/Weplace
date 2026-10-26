// Run with an authorized FLOW checkout at the reviewed source tree.
// The production website serves only the generated static files.
import { readFileSync, writeFileSync, rmSync, readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const flow = path.resolve(process.argv[2] || '');
const expectedTree = '4754c7fe649fd1e57ebd139888ccacf658a4f2d3';
if (!process.argv[2]) throw new Error('Pass the FLOW checkout path.');
if (execFileSync('git', ['rev-parse', 'HEAD^{tree}'], { cwd: flow, encoding: 'utf8' }).trim() !== expectedTree)
  throw new Error('FLOW source tree differs from the reviewed version.');
if (execFileSync('git', ['status', '--porcelain', '--untracked-files=no'], { cwd: flow, encoding: 'utf8' }).trim())
  throw new Error('FLOW tracked source must be clean.');
const require = createRequire(path.join(flow, 'package.json'));
const { build } = await import(pathToFileURL(require.resolve('vite')));
const outDir = path.join(root, 'flow-preview');
const policy = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob:; connect-src 'none'; form-action 'none'; object-src 'none'; base-uri 'none'; frame-src 'none'";
function replaceOnce(source, from, to) {
  if (source.split(from).length !== 2) throw new Error('Expected source fragment missing or repeated: ' + from);
  return source.replace(from, to);
}
rmSync(outDir, { recursive: true, force: true });
await build({
  root: flow,
  base: '/flow-preview/',
  publicDir: false,
  plugins: [{ name: 'public-flow-preview-adapter', enforce: 'pre', transform(source, id) {
    if (id === path.join(flow, 'review/p0/screen.tsx')) {
      source = replaceOnce(source, 'FLOW · 검토용 홈페이지', 'FLOW · 화면 미리보기');
      source = replaceOnce(source, '실제 FLOW 로그인 없이 가상 팀과 매장으로 체험합니다. 기록은 새로고침하면 초기화됩니다.', '가상 데이터로 팀 일정과 빠른 기록을 체험합니다. 새로고침하면 초기화되니 실제 업무·개인정보는 입력하지 마세요.');
      source = replaceOnce(source, '<nav aria-label="검토 화면">', '<nav aria-label="검토 화면"><a href="/">위플레이스</a>');
      return source;
    }
    // Eliminate the unused legacy local demo's module-level construction.
    if (id === path.join(flow, 'src/app/App.tsx'))
      return replaceOnce(source, "const demoRepository = new LocalStorageFlowRepository(undefined, { actorMemberId: 'park-gyumin' });", 'const demoRepository = undefined;').replaceAll('박규민', '운영 A');
    if (id === path.join(flow, 'src/app/components/types.ts'))
      return source.replaceAll('최규현', '제작 B').replaceAll('박규민', '운영 A').replaceAll('차새미', '운영 C').replaceAll('민호', '예시 구성원').replaceAll('설마중·루위', '예시 매장 A').replaceAll('Beauty Maxx', '예시 프로젝트 B').replaceAll('병원 CRM', '예시 프로젝트 C');
    // Public export never contains legacy team, customer, project, or record fixtures.
    if (id === path.join(flow, 'src/app/fixtures/seed.ts'))
      return 'export function createSeedData(){return {schemaVersion:1,members:[],projects:[],dailyPlans:[],attendance:[],tasks:[],records:[]}}';
    if (id === path.join(flow, 'src/app/components/data.ts')) {
      const marker = 'export const teamMembers:';
      if (!source.includes(marker)) throw new Error('Legacy data boundary changed.');
      return source.slice(0, source.indexOf(marker)) + 'export const teamMembers=[];export const projects=[];export const records=[];export const monthlyGoals=[];export const monthlyDirectionText="미리보기용 예시입니다.";';
    }
    if (id === path.join(flow, 'src/app/domain/mappings.ts')) {
      for (const name of ['PROJECT_NAME_TO_ID', 'DEFAULT_PROJECT_NAMES', 'MEMBER_NAME_TO_ID', 'MEMBER_ID_TO_NAME']) {
        const pattern = new RegExp('export const ' + name + ': [^=]+ = \\{[\\s\\S]*?\\n\\};');
        if (!pattern.test(source)) throw new Error('Legacy mapping boundary changed: ' + name);
        source = source.replace(pattern, 'export const ' + name + ' = {};');
      }
      return source;
    }
    if (id === path.join(flow, 'src/app/components/FinanceWorkspace.tsx')) {
      source = source.replaceAll('href="/"', 'href="/flow-preview/"');
      return replaceOnce(source, '규민·규현의 계정 확인과 서버 권한 설정이 필요합니다. 팀 관리자 역할만으로는 열리지 않습니다.', '미리보기에서는 재무 정보를 열 수 없습니다. 실제 서비스는 지정된 두 계정의 서버 권한을 확인한 뒤 접근할 수 있습니다.');
    }
    if (id === path.join(flow, 'review/p0/review.css'))
      return source + '\n@media(max-width:600px){.flow-review-banner nav{flex-wrap:wrap}.flow-review-banner a{padding-inline:8px}}\n';
  }}],
  build: { outDir, emptyOutDir: true, sourcemap: false, rollupOptions: { input: path.join(flow, 'review/p0/screen.html') } },
});
let html = readFileSync(path.join(outDir, 'review/p0/screen.html'), 'utf8');
html = html.replace('<head>', '<head><meta http-equiv="Content-Security-Policy" content="' + policy + '"><meta name="robots" content="noindex,nofollow"><meta name="referrer" content="no-referrer"><link rel="icon" href="/favicon.ico">');
html = html.replace(/<title>.*?<\/title>/, '<title>FLOW 미리보기 · 팀 일정과 빠른 기록 | 위플레이스</title>');
html = html.replace('<div id="root"></div>', '<div id="root"></div><noscript>FLOW 미리보기는 JavaScript가 필요합니다. <a href="/">위플레이스 홈페이지로 돌아가기</a></noscript>');
writeFileSync(path.join(outDir, 'index.html'), html);
rmSync(path.join(outDir, 'review'), { recursive: true });
const files = ['index.html', ...readdirSync(path.join(outDir, 'assets')).map(file => 'assets/' + file)].sort();
writeFileSync(path.join(root, 'docs/flow-preview-source.json'), JSON.stringify({
  sourceCommit: 'e9e49fb788acb93c1aee10b404bb6df73c301875', sourceTree: expectedTree,
  basePath: '/flow-preview/', data: 'synthetic-memory-only', liveConnections: false,
  files: Object.fromEntries(files.map(file => [file, createHash('sha256').update(readFileSync(path.join(outDir, file))).digest('hex')]))
}, null, 2) + '\n');
writeFileSync(path.join(root, '_headers'), '/flow-preview/*\n  X-Robots-Tag: noindex, nofollow\n  Referrer-Policy: no-referrer\n  X-Content-Type-Options: nosniff\n  Content-Security-Policy: ' + policy + "; frame-ancestors 'self'\n");
console.log('Built /flow-preview/ with synthetic data and no live API connections.');
