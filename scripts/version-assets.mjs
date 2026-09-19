import fs from 'node:fs';import path from 'node:path';
const version=JSON.parse(fs.readFileSync('package.json','utf8')).version;
if(!/^\d+\.\d+\.\d+$/.test(version))throw new Error('Release requires numeric semver');
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);}
const stamp=s=>s.replace(/(["'])(\.{1,2}\/[^"'\s?]+\.(?:js|css))(?:\?v=[^"'\s]+)?\1/g,(_,q,p)=>`${q}${p}?v=${version}${q}`);
for(const p of walk('src').filter(p=>/\.(js|css)$/.test(p)))fs.writeFileSync(p,stamp(fs.readFileSync(p,'utf8')));
let html=stamp(fs.readFileSync('index.html','utf8')).replace(/ALPHA \d+\.\d+\.\d+/g,`ALPHA ${version}`).replace(/const RELEASE = '[^']+'/,`const RELEASE = '${version}'`);
fs.writeFileSync('index.html',html);fs.writeFileSync('version.json',JSON.stringify({version})+'\n');
console.log(`Stamped all application assets for ${version}`);
