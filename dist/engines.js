// Educational phenomenological models. Units and assumptions are documented in README.
export const MOLAR_GAS_ML_PER_MMOL=24; // Unified reference: 24 L/mol, NOT live gas temperature.
export function finite(value,min,max,name){if(!Number.isFinite(value)||value<min||value>max)throw new RangeError(name);return value;}
export class ReactionRateEngine {
 constructor(options={}){
  this.kind=options.kind||'carbonate';
  if(!['carbonate','peroxide'].includes(this.kind))throw new RangeError('kind');
  this.p={mass:1,concentration:1,acidVolume:50,size:'chunk',temperature:20,catalyst:0,peroxide:10,...options};
  const p=this.p;finite(p.temperature,20,40,'temperature');finite(p.catalyst,0,2,'catalyst');
  finite(p.mass,.5,2,'mass');finite(p.concentration,.1,1,'concentration');finite(p.acidVolume,50,50,'acidVolume');finite(p.peroxide,10,10,'peroxide');
  const area={chunk:1,grain:2,powder:4}[p.size];if(!area)throw new RangeError('size');
  this.initial=this.kind==='carbonate'?{carbonate:p.mass*10,acid:p.concentration*p.acidVolume}:{peroxide:p.peroxide,catalyst:p.catalyst};
  this.capacity=this.kind==='carbonate'?Math.min(this.initial.carbonate,this.initial.acid/2):p.peroxide/2;
  this.k=(this.kind==='carbonate'?.045*area*p.concentration:.008*(1+6*p.catalyst))*2**((p.temperature-20)/10);
  this.endTime=1/(.35*this.k);this.time=0;
 }
 sample(t=this.time){
  finite(t,0,1e8,'time');const remaining=Math.max(0,1-.35*this.k*t);const fraction=1-remaining**(1/.35);const extent=this.capacity*fraction;
  const rate=remaining>0?this.capacity*this.k*remaining**(1/.35-1):0;
  const species=this.kind==='carbonate'?{CaCO3:this.initial.carbonate-extent,HCl:this.initial.acid-2*extent,CaCl2:extent,H2O:extent,CO2:extent}:{H2O2:this.initial.peroxide-2*extent,H2O:2*extent,O2:extent,MnO2:this.p.catalyst};
  return {time:t,extent,fraction,volume:extent*MOLAR_GAS_ML_PER_MMOL,rate:rate*MOLAR_GAS_ML_PER_MMOL,capacity:this.capacity*MOLAR_GAS_ML_PER_MMOL,done:t>=this.endTime,species};
 }
 advance(dt){finite(dt,0,1e6,'dt');this.time=Math.min(this.endTime,this.time+dt);return this.sample();}
 timeFor(fraction){finite(fraction,0,1,'fraction');return (1-(1-fraction)**.35)/(.35*this.k);}
 curve(points=61){return Array.from({length:points},(_,i)=>this.sample(this.endTime*i/(points-1)));}
}

// Closed, fixed-volume 2 NO2 <=> N2O4. Forward/reverse rates count reaction events.
// This numerical model is illustrative, not fitted real NO2 kinetics.
export class EquilibriumEngine {
 constructor({no2=1.6,n2o4=.2,temperature=25,catalyst=1}={}){
  finite(no2,0,10,'no2');finite(n2o4,0,10,'n2o4');this.a=no2;this.b=n2o4;this.time=0;this.forwardEvents=0;this.reverseEvents=0;this.setConditions({temperature,catalyst});
 }
 setConditions({temperature=this.temperature,catalyst=this.catalyst}={}){finite(temperature,5,60,'temperature');finite(catalyst,1,4,'catalyst');this.temperature=temperature;this.catalyst=catalyst;}
 constants(){const d=(this.temperature-25)/10;return {kf:.12*1.35**d*this.catalyst,kr:.06*2.1**d*this.catalyst};}
 get units(){return this.a+2*this.b;}
 equilibrium(){const {kf,kr}=this.constants();const K=kf/kr;const a=2*this.units/(1+Math.sqrt(1+8*K*this.units));return {no2:a,n2o4:(this.units-a)/2};}
 sample(){const {kf,kr}=this.constants();const forward=kf*this.a*this.a,reverse=kr*this.b;return {time:this.time,no2:this.a,n2o4:this.b,forward,reverse,units:this.units,temperature:this.temperature,catalyst:this.catalyst,forwardEvents:this.forwardEvents,reverseEvents:this.reverseEvents,equilibrated:Math.abs(forward-reverse)<.001*Math.max(forward,reverse,1e-6)};}
 advance(dt){
  finite(dt,0,1e4,'dt');const {kf,kr}=this.constants();let remaining=dt;
  while(remaining>1e-10){const h=Math.min(remaining,.025,.04/(kf*Math.max(this.a,1)+kr));const f=kf*this.a*this.a*h,r=kr*this.b*h;const net=f-r;this.a-=2*net;this.b+=net;this.forwardEvents+=f;this.reverseEvents+=r;this.time+=h;remaining-=h;}
  return this.sample();
 }
 addNO2(amount=.4){finite(amount,0,2,'addition');if(this.units+amount>10)throw new RangeError('本模型的濃度範圍已達上限，請重設。');this.a+=amount;return this.sample();}
 static balanced(options={}){const e=new EquilibriumEngine(options),q=e.equilibrium();e.a=q.no2;e.b=q.n2o4;return e;}
}
export function averageRate(v0,v1,t0,t1){if(t1<=t0)throw new RangeError('time interval');return (v1-v0)/(t1-t0);}
