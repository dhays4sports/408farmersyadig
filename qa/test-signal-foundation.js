const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

class StorageMock{
  constructor(){this.map=new Map();}
  getItem(key){return this.map.has(key)?this.map.get(key):null;}
  setItem(key,value){this.map.set(String(key),String(value));}
  removeItem(key){this.map.delete(String(key));}
  clear(){this.map.clear();}
}

global.localStorage=new StorageMock();
global.sessionStorage=new StorageMock();
global.location={search:'?campaign=life_pilot&utm_source=instagram&utm_medium=paid_social&creative=story_a',pathname:'/signal-lab/',origin:'https://408farmers.com'};
global.document={referrer:'https://instagram.com/example',dispatchEvent(){}};
global.CustomEvent=function(name,options){this.type=name;this.detail=options?.detail;};

const Contract=require('../shared/signal/signal-contract.js');
const Attribution=require('../shared/signal/signal-attribution.js');
const Events=require('../shared/signal/signal-events.js');
const Session=require('../shared/signal/signal-session.js');
const Registry=require('../shared/signal/signal-flow-registry.js');
require('../shared/signal/signal-demo-flow.js');

const flow=Registry.get('foundation_demo');
assert(flow,'demo flow should register');
assert.equal(flow.openingQuestionId,'demo_trigger');
assert.equal(flow.questions.length,3);

assert.throws(()=>Contract.normalizeFlow({
  id:'bad',version:'1',openingQuestionId:'q',
  questions:[
    {id:'q',canonicalField:'x',prompt:'x',options:[{code:'a',label:'A'},{code:'b',label:'B'}]},
    {id:'q',canonicalField:'y',prompt:'y',options:[{code:'a',label:'A'},{code:'b',label:'B'}]}
  ]
}),/unique/i);

const attr=Attribution.capture();
assert.equal(attr.campaign,'life_pilot');
assert.equal(attr.utm.source,'instagram');
assert.equal(attr.firstTouch.landingPage,'/signal-lab/');
assert.equal(attr.latestTouch.creative,'story_a');

global.location={search:'?campaign=life_pilot_2&utm_source=google',pathname:'/life/',origin:'https://408farmers.com'};
const attr2=Attribution.capture();
assert.equal(attr2.firstTouch.campaign,'life_pilot');
assert.equal(attr2.latestTouch.campaign,'life_pilot_2');
assert.equal(attr2.latestTouch.landingPage,'/life/');

let s=Session.create({flow,attribution:attr});
assert.equal(s.state,'active');
assert.equal(s.currentQuestionId,'demo_trigger');
assert.equal(s.history.length,0);
assert.equal(s.attribution.firstTouch.campaign,'life_pilot');

const q1=flow.questionMap.demo_trigger;
s=Session.answer(s,q1,'life');
assert.equal(s.canonicalSignals.statedTrigger,'life');
assert.equal(s.history.length,1);
s=Session.setCurrent(s,Registry.nextQuestion(flow,q1.id,'life'));
assert.equal(s.currentQuestionId,'demo_intent');

const q2=flow.questionMap.demo_intent;
s=Session.answer(s,q2,'ready_now');
assert.equal(s.canonicalSignals.shoppingIntent,'ready_now');
s=Session.setCurrent(s,Registry.nextQuestion(flow,q2.id,'ready_now'));
assert.equal(s.currentQuestionId,'demo_timing');

s=Session.back(s,flow);
assert.equal(s.currentQuestionId,'demo_intent');
assert.equal(s.history.length,1);
assert.equal(s.canonicalSignals.shoppingIntent,undefined);
assert.equal(s.canonicalSignals.statedTrigger,'life');

s=Session.answer(s,q2,'researching');
assert.equal(s.canonicalSignals.shoppingIntent,'researching');
s=Session.setCurrent(s,Registry.nextQuestion(flow,q2.id,'researching'));

const q3=flow.questionMap.demo_timing;
s=Session.answer(s,q3,'within_30');
assert.equal(s.canonicalSignals.decisionTiming,'within_30');
s=Session.complete(s,{kind:'test'});
assert.equal(s.state,'complete');

const loaded=Session.load(flow.id,{flowVersion:flow.version});
assert(loaded);
assert.equal(loaded.sessionId,s.sessionId);
assert.equal(loaded.canonicalSignals.shoppingIntent,'researching');
assert.equal(loaded.canonicalSignals.decisionTiming,'within_30');

assert.equal(Session.load(flow.id,{flowVersion:'999.0'}),null);
const expired=Session.load(flow.id,{flowVersion:flow.version,now:new Date(Date.now()+8*24*60*60*1000)});
assert.equal(expired,null);

const fresh=Session.restart(flow,attr);
assert.notEqual(fresh.sessionId,s.sessionId);
assert.equal(fresh.history.length,0);

global.dataLayer=[];
const e=Events.emit('signal_session_started',{flow_id:flow.id,session_id:fresh.sessionId});
assert.equal(e.event,'signal_session_started');
assert.equal(global.dataLayer.length,1);
assert.throws(()=>Events.emit('lead_created',{}),/unsupported/i);

const lab=fs.readFileSync(path.join(__dirname,'../signal-lab/index.html'),'utf8');
assert.match(lab,/noindex,nofollow,noarchive/);
assert.doesNotMatch(lab,/formspree/i);
assert.doesNotMatch(lab,/coveragefit\.com/i);
for(const file of [
  'signal-contract.js','signal-attribution.js','signal-events.js','signal-session.js',
  'signal-flow-registry.js','signal-demo-flow.js','signal-shell.js'
]){
  assert.ok(lab.includes(file),`lab should load ${file}`);
}

console.log('SIGNAL-FOUNDATION-1.0 QA passed');
