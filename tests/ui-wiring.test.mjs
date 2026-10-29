// DOM-level verification, not a substitute for real browser rendering or input tests.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {parseHTML,HTMLElement,HTMLCanvasElement,HTMLSelectElement} from './vendor/linkedom.mjs';
import {runInThisContext} from 'node:vm';
import {cards,stages,finalQuiz} from '../dist/content.js';
import {STORAGE_KEY,restore,certificateReady} from '../dist/state.js';
test('DOM wiring: all five labs, predictions, evidence, 30 answers, persistence and certificate',async()=>{
 const {document,window}=parseHTML(await readFile(new URL('../dist/index.html',import.meta.url),'utf8'));const memory=new Map();
 const oldInterval=globalThis.setInterval,oldClearInterval=globalThis.clearInterval;
 Object.assign(globalThis,{document,window,location:{hash:''},innerHeight:900,Event:window.Event,localStorage:{getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,v)},requestAnimationFrame:()=>0,matchMedia:()=>({matches:true}),IntersectionObserver:class{observe(){}disconnect(){}},addEventListener:()=>{},setInterval:()=>0,clearInterval:()=>{}});
 HTMLElement.prototype.scrollIntoView=function(){};HTMLElement.prototype.focus=function(){};HTMLCanvasElement.prototype.getContext=()=>null;
 Object.defineProperty(HTMLSelectElement.prototype,'selectedOptions',{configurable:true,get(){const all=[...this.querySelectorAll('option')];return all.filter(o=>o.hasAttribute('selected')).length?all.filter(o=>o.hasAttribute('selected')):[all[0]];}});
 Object.defineProperty(HTMLSelectElement.prototype,'value',{configurable:true,get(){return this.selectedOptions[0]?.value;},set(value){for(const o of this.querySelectorAll('option'))o.toggleAttribute('selected',o.value===String(value));}});
 const $=s=>{const el=document.querySelector(s);assert.ok(el,'missing '+s);return el;};const click=s=>$(s).click();const event=(el,name)=>el.dispatchEvent(new window.Event(name,{bubbles:true,cancelable:true}));
 const set=(s,v)=>{const el=$(s);el.value=String(v);event(el,el.tagName==='SELECT'?'change':'input');if(el.tagName==='SELECT'&&s.includes('[name='))event(el,'input');};
 const predict=id=>{const input=$(`#card-${id} .prediction-choice input`);input.setAttribute('checked','');event(input,'change');event($(`#card-${id} .prediction-form`),'submit');assert.equal($(`#card-${id} [data-activity]`).inert,false);};
 const answer=id=>{assert.equal($(`#card-${id} .discovery`).hidden,false,'discovery '+id);click(`#card-${id} [data-understood]`);const q=cards[id-1].quiz;click(`#card-${id} [data-answer="${(q.answer+1)%q.options.length}"]`);assert.match($(`#card-${id} .feedback`).textContent,/正確答案/);click(`#card-${id} .quiz-retry`);click(`#card-${id} [data-answer="${q.answer}"]`);};
 const lab=(id,s)=>`#card-${id} [data-activity] ${s}`;
 const finishRate=id=>{click(lab(id,'[data-start]'));click(lab(id,'[data-pause]'));for(let i=0;i<40&&!$(lab(id,'[data-step]')).disabled;i++)click(lab(id,'[data-step]'));assert.match($(lab(id,'[data-status]')).textContent,/反應完成/);};
 const load=()=>{click(lab(2,'[data-material=solid]'));click(lab(2,'[data-load]'));click(lab(2,'[data-material=acid]'));click(lab(2,'[data-load]'));};
 const settle=(id,n=10)=>{for(let i=0;i<n;i++)click(lab(id,'[data-step]'));assert.match($(lab(id,'[data-metrics]')).textContent,/接近平衡/);};
 try{
 if(process.env.DOM_STANDALONE){const html=await readFile(new URL('../chapter4-preview.html',import.meta.url),'utf8');const code=html.match(/<script>([\s\S]*)<\/script>/)[1];runInThisContext(code);}else await import('../dist/app.js?dom-test');assert.equal(document.querySelectorAll('article.exploration-card').length,10);assert.equal(document.querySelectorAll('.assessment .quiz-item').length,20);
 predict(1);for(let i=0;i<4;i++)click(lab(1,`[data-case="${i}"]`));answer(1);
 predict(2);click(lab(2,'[data-start]'));assert.match($(lab(2,'[data-status]')).textContent,/先完成/);load();finishRate(2);click(lab(2,'[data-reset]'));set(lab(2,'[name=size]'),'powder');load();finishRate(2);click(lab(2,'[data-reset]'));set(lab(2,'[name=concentration]'),.5);load();finishRate(2);answer(2);
 predict(3);for(const key of ['dense','surface'])click(lab(3,`[data-condition=${key}]`));for(const key of ['Mg','Zn','Cu'])click(lab(3,`[data-metal=${key}]`));answer(3);
 predict(4);set(lab(4,'[name=temperature]'),40);click(lab(4,'[data-prepare]'));finishRate(4);answer(4);
 predict(5);set(lab(5,'[name=catalyst]'),2);click(lab(5,'[data-prepare]'));finishRate(5);answer(5);
 predict(6);assert.match($(lab(6,'.record-analysis')).textContent,/你已完成的實驗紀錄/);click(lab(6,'[data-reading=slope]'));click(lab(6,'[data-reading=plateau]'));answer(6);
 predict(7);click(lab(7,'[data-reverse=water]'));click(lab(7,'[data-reverse=chemical]'));answer(7);
 predict(8);set(lab(8,'[data-initial]'),'mixed');settle(8);click(lab(8,'[data-view=micro]'));const f=$(lab(8,'[data-flows]')).textContent;click(lab(8,'[data-step]'));assert.notEqual($(lab(8,'[data-flows]')).textContent,f);answer(8);
 predict(9);click(lab(9,'[data-add]'));settle(9);set(lab(9,'[data-temperature]'),40);settle(9);set(lab(9,'[data-temperature]'),10);settle(9);click(lab(9,'[data-catalyst]'));settle(9,12);answer(9);
 predict(10);for(let i=0;i<3;i++){const d=$(lab(10,`[data-truth="${i}"]`));d.open=true;event(d,'toggle');}answer(10);
 for(const [id,stage] of Object.entries(stages))for(const q of stage.questions)click(`#stage-${id} [data-quiz=${q.id}] [data-answer="${q.answer}"]`);for(const q of finalQuiz)click(`#final [data-quiz=${q.id}] [data-answer="${q.answer}"]`);
 assert.equal($('#mastery-label').textContent,'10 / 10');assert.equal($('#certificate').classList.contains('unlocked'),true);const saved=restore(JSON.parse(memory.get(STORAGE_KEY)));assert.ok(certificateReady(saved));assert.equal(saved.cards[2].records.length,3);assert.equal(saved.cards[4].records.length,2);assert.equal(saved.cards[5].records.length,2);assert.equal(saved.cards[9].records.length,4);
 click('#card-2 .chapter-header [data-reset]');assert.equal($('#mastery-label').textContent,'9 / 10');assert.equal($('#certificate').classList.contains('unlocked'),false);assert.equal($('#card-2 [data-activity]').inert,true);
 }finally{globalThis.setInterval=oldInterval;globalThis.clearInterval=oldClearInterval;}
});
