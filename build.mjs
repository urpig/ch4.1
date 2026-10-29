import {readFile,writeFile} from 'node:fs/promises';
const html=await readFile(new URL('./dist/index.html',import.meta.url),'utf8');
const root=html.replace(/(<link rel="stylesheet" href=")/g,'$1dist/').replace('src="app.js"','src="dist/app.js"');
await writeFile(new URL('./index.html',import.meta.url),root);
await writeFile(new URL('./.nojekyll',import.meta.url),'');
console.log('Built GitHub Pages root entry: index.html → dist/ assets');
