import {cards,stages,finalQuiz} from './content.js?v=tiangong-2';
export const STORAGE_KEY='science-lab-ch4-time-alchemy-v1';
export const fresh=()=>({version:1,cards:Object.fromEntries(cards.map(c=>[c.id,{prediction:null,evidence:[],answer:null,quizOpen:false,config:{},records:[]}])),assessments:{},notes:''});
export function restore(raw){const s=fresh();if(!raw||raw.version!==1)return s;
 for(const c of cards){const r=raw.cards?.[c.id],t=s.cards[c.id];if(!r||typeof r!=='object')continue;
 t.prediction=Number.isInteger(r.prediction)&&r.prediction>=0&&r.prediction<c.choices.length?r.prediction:null;
 t.evidence=t.prediction!==null&&Array.isArray(r.evidence)?[...new Set(r.evidence.filter(x=>c.required.includes(x)))]:[];
 t.quizOpen=r.quizOpen===true&&c.required.every(x=>t.evidence.includes(x));
 t.answer=t.quizOpen&&Number.isInteger(r.answer)&&r.answer>=0&&r.answer<c.quiz.options.length?r.answer:null;
 t.records=Array.isArray(r.records)?r.records.slice(-12).filter(x=>x&&typeof x.label==='string'&&Array.isArray(x.curve)&&x.curve.length<=300&&x.curve.every(p=>p&&Object.values(p).every(v=>typeof v==='number'?Number.isFinite(v):typeof v==='boolean'||typeof v==='object'))):[];
 t.config=r.config&&typeof r.config==='object'&&!Array.isArray(r.config)?r.config:{};
 }
 for(const [id,qs] of [...Object.entries(stages).map(([k,v])=>['stage-'+k,v.questions]),['final',finalQuiz]]){const a=raw.assessments?.[id];if(a&&typeof a==='object')s.assessments[id]=Object.fromEntries(qs.map(q=>[q.id,Number.isInteger(a[q.id])&&a[q.id]>=0&&a[q.id]<q.options.length?a[q.id]:null]));}
 s.notes=typeof raw.notes==='string'?raw.notes.slice(0,6000):'';return s;
}
export function mastered(card,s){const t=s.cards[card.id];return t.prediction!==null&&card.required.every(x=>t.evidence.includes(x))&&t.answer===card.quiz.answer;}
export function certificateReady(s){return cards.every(c=>mastered(c,s))&&Object.entries(stages).every(([id,v])=>v.questions.every(q=>s.assessments['stage-'+id]?.[q.id]===q.answer));}
export const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
