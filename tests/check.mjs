import {readdir,readFile,access} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import path from 'node:path';
const root=new URL('../dist/',import.meta.url);const files=await readdir(root);for(const f of files.filter(f=>f.endsWith('.js')))execFileSync(process.execPath,['--check',new URL(f,root).pathname.replace(/^\/(\w:)/,'$1')]);
for(const f of files.filter(f=>/\.(css|html|js)$/.test(f))){const source=await readFile(new URL(f,root),'utf8');for(const match of source.matchAll(/(?:src|href)="([^"#]+)"|url\(['"]?(\.\/assets\/[^)'" ]+)/g)){const p=match[1]||match[2];if(/^(https?:|data:|#)/.test(p))continue;if(p.includes('${'))continue;await access(new URL(p,root));}}
console.log('PASS: JS syntax and static asset references');
