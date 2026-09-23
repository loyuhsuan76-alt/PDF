const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const deps=process.env.STUDIO_BUILD_DEPENDENCIES||path.join(__dirname,'node_modules');
global.JSZip=require(path.join(deps,'jszip'));global.pptxgen=require(path.join(deps,'pptxgenjs'));require('./core.js');const C=StudioCore;
(async()=>{
 assert.equal(C.VERSION,require('./package.json').version);
 assert.deepEqual(C.pages('3,1-2',3),[2,0,1]);assert.throws(()=>C.pages('0',3));
 const m=C.initial();m.blocks[1].text='繁體中文 & < >\n格式測試';
 assert.equal(C.evaluateCell(m.sheet.rows,3,3),500);
 assert.equal(C.evaluateCell([['=1/0']],0,0),'#DIV/0!');assert.equal(C.evaluateCell([['=A1']],0,0),'#CYCLE!');
 assert.equal(C.evaluateCell([['=COUNT(A2)'],['文字']],0,0),0);
 assert.equal(C.evaluateCell([['=AVERAGE(A2)'],['文字']],0,0),'#DIV/0!');
 for(const type of ['docx','xlsx','pptx'])await C.verifyOffice(await C[type](m),type,m);
 const {PDFDocument,degrees}=require(path.join(deps,'pdf-lib'));const d=await PDFDocument.create();d.addPage([595,842]);d.getPage(0).setRotation(degrees(90));const reread=await PDFDocument.load(await d.save());assert.equal(reread.getPageCount(),1);assert.equal(reread.getPage(0).getRotation().angle,90);
 const html=fs.readFileSync(path.join(__dirname,'index.html'),'utf8'),app=fs.readFileSync(path.join(__dirname,'app.js'),'utf8');new Function(app);const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(ids.length,new Set(ids).size);for(const m of app.matchAll(/\$\('([^']+)'\)/g))assert(ids.includes(m[1]),'Missing element '+m[1]);
 console.log('PASS: export containers, formulas, PDF operations, syntax and DOM references. Visual fidelity and browser integration need separate acceptance.');
})().catch(e=>{console.error(e);process.exit(1)});
