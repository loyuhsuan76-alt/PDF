// Run `npm install --ignore-scripts`, `npm test`, then `npm run build`.
// No user documents are read or bundled.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=__dirname,deps=process.env.STUDIO_BUILD_DEPENDENCIES||path.join(root,'node_modules');
const out=path.join(root,'dist','pdf-studio-pro'),release=path.join(root,'.release');
const pkg=require(path.join(root,'package.json'));
const version=pkg.version;if(!/^\d+\.\d+\.\d+$/.test(version))throw Error('Invalid version');
const repo=process.env.GITHUB_REPOSITORY||'';
if(repo&&!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repo))throw Error('Invalid repository');
fs.mkdirSync(out+'/vendor',{recursive:true});fs.mkdirSync(release,{recursive:true});
const sources=['index.html','app.css','app.js','core.js','README.md','deploy-config.js'];
if(fs.existsSync(path.join(root,'驗證紀錄.txt')))sources.push('驗證紀錄.txt');
for(const file of sources)fs.copyFileSync(path.join(root,file),path.join(out,file));
if(repo)fs.writeFileSync(out+'/deploy-config.js','globalThis.STUDIO_UPDATE_SOURCE = '+JSON.stringify('https://github.com/'+repo)+';\n');
const bundles={'pdf-lib':'dist/pdf-lib.min.js',jszip:'dist/jszip.min.js',pptxgenjs:'dist/pptxgen.bundle.js','tesseract.js':'dist/tesseract.min.js'};
const versions={};let licenses='Bundled open-source licenses\n\n';
for(const [name,file]of Object.entries(bundles)){fs.copyFileSync(path.join(deps,name,file),out+'/vendor/'+name+'.js');const p=require(path.join(deps,name,'package.json'));versions[name]=p.version;licenses+=`${name} ${p.version} (${p.license})\n`;for(const f of ['LICENSE','LICENSE.md','LICENSE.txt'])if(fs.existsSync(path.join(deps,name,f))){licenses+=fs.readFileSync(path.join(deps,name,f),'utf8')+'\n\n';break;}}
const base=path.join(deps,'pdfjs-dist');versions['pdfjs-dist']=require(base+'/package.json').version;
const assets={module:fs.readFileSync(base+'/legacy/build/pdf.min.mjs','utf8'),worker:fs.readFileSync(base+'/legacy/build/pdf.worker.min.mjs','utf8'),cmaps:{},fonts:{},wasm:{}};
for(const [dir,field,re]of [['cmaps','cmaps',/\.bcmap$/],['standard_fonts','fonts',/\.(pfb|ttf)$/],['wasm','wasm',/\.wasm$/]])for(const f of fs.readdirSync(base+'/'+dir)){if(re.test(f))assets[field][f]=fs.readFileSync(base+'/'+dir+'/'+f).toString('base64');if(f.startsWith('LICENSE'))licenses+=dir+'/'+f+'\n'+fs.readFileSync(base+'/'+dir+'/'+f,'utf8')+'\n';}
licenses+='PDF.js '+versions['pdfjs-dist']+'\n'+fs.readFileSync(base+'/LICENSE','utf8');
fs.writeFileSync(out+'/vendor/pdfjs-assets.js','globalThis.PDF_ASSETS='+JSON.stringify(assets)+';\n');
fs.writeFileSync(out+'/vendor/versions.js','globalThis.BUNDLED_VERSIONS='+JSON.stringify(versions)+';\n');
fs.writeFileSync(out+'/THIRD-PARTY-LICENSES.txt',licenses);
const JSZip=require(path.join(deps,'jszip'));
(async()=>{const z=new JSZip();function add(dir,prefix){for(const name of fs.readdirSync(dir)){const file=path.join(dir,name);if(fs.statSync(file).isDirectory())add(file,prefix+name+'/');else z.file(prefix+name,fs.readFileSync(file));}}add(out,'pdf-studio-pro/');const bytes=await z.generateAsync({type:'nodebuffer',compression:'DEFLATE',compressionOptions:{level:9}}),name='pdf-studio-pro-'+version+'.zip';fs.writeFileSync(path.join(release,name),bytes);const manifest={app:'pdf-studio-pro',version,downloadUrl:repo?'https://raw.githubusercontent.com/'+repo+'/main/updates/'+name:'',sha256:crypto.createHash('sha256').update(bytes).digest('hex'),notes:'PDF 與 Office 工作台；詳見 README 的功能與驗證界線。'};fs.writeFileSync(path.join(release,'studio-update.json'),JSON.stringify(manifest,null,2)+'\n');console.log('Built '+name+' ('+bytes.length+' bytes), SHA-256 '+manifest.sha256);})().catch(e=>{console.error(e);process.exit(1)});
