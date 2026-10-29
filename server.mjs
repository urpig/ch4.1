import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=fileURLToPath(new URL('./dist/',import.meta.url));
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.json':'application/json'};
const port=Number(process.env.PORT||4174);
http.createServer(async(req,res)=>{try{const url=new URL(req.url,'http://localhost');const rel=decodeURIComponent(url.pathname);const full=path.resolve(root,'.'+(rel==='/'?'/index.html':rel));if(!full.startsWith(root+path.sep)&&full!==path.join(root,'index.html')){res.writeHead(403).end();return;}const data=await readFile(full);res.writeHead(200,{'Content-Type':mime[path.extname(full)]||'application/octet-stream','Cache-Control':'no-cache'}).end(data);}catch{res.writeHead(404).end('Not found');}}).listen(port,'127.0.0.1',()=>console.log(`Local: http://127.0.0.1:${port}`));
