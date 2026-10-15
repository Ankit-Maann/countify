import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
const root = new URL('..', import.meta.url).pathname;
const files = [];
function walk(dir){ for(const name of readdirSync(dir)){ if(['node_modules','.git','dist'].includes(name)) continue; const p=join(dir,name); const st=statSync(p); if(st.isDirectory()) walk(p); else files.push(p); } }
walk(root);
const css = files.filter(f=>f.endsWith('.css'));
for(const f of css){ const s=readFileSync(f,'utf8'); let depth=0; for(const c of s){ if(c==='{') depth++; if(c==='}') depth--; if(depth<0) throw new Error(`Extra } in ${relative(root,f)}`); } if(depth!==0) throw new Error(`Unbalanced CSS in ${relative(root,f)}: ${depth}`); }
const required=['src/App.jsx','src/index.css','src/pages/CommunityPage.jsx','src/pages/CreatorProfilePage.jsx','src/pages/SavedPage.jsx','src/pages/StatusPage.jsx','src/services/communityService.js','src/services/productionService.js'];
for(const f of required) readFileSync(join(root,f));
console.log(`Verified ${css.length} CSS files and ${required.length} phase files.`);
