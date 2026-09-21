(function(root,factory){
  'use strict';
  const api=factory(root);
  root.SignalSession=api;
  if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis,function(root){
  'use strict';

  const VERSION='1.0.0';
  const BUILD='SIGNAL-FOUNDATION-1.0';
  const KEY_PREFIX='408farmers.signal.session.v1:';
  const DEFAULT_TTL_MS=7*24*60*60*1000;
  const memory=new Map();

  const clone=value=>JSON.parse(JSON.stringify(value));
  const nowIso=()=>new Date().toISOString();
  const clean=(value,max=240)=>String(value??'').trim().replace(/[<>\u0000-\u001f\u007f]/g,'').slice(0,max);
  const validId=value=>/^[a-z0-9][a-z0-9._:-]{0,119}$/i.test(clean(value,120));

  function uuid(){
    if(root.crypto&&typeof root.crypto.randomUUID==='function')return root.crypto.randomUUID();
    if(root.crypto&&typeof root.crypto.getRandomValues==='function'){
      const bytes=new Uint8Array(16);root.crypto.getRandomValues(bytes);
      bytes[6]=(bytes[6]&0x0f)|0x40;bytes[8]=(bytes[8]&0x3f)|0x80;
      const hex=[...bytes].map(v=>v.toString(16).padStart(2,'0')).join('');
      return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;
    }
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2,14)}`;
  }

  function key(flowId){if(!validId(flowId))throw new TypeError('Signal flow id is invalid.');return KEY_PREFIX+flowId;}
  function storageCandidates(){
    const found=[];
    for(const name of ['localStorage','sessionStorage']){
      try{
        const storage=root[name],probe='__signal_session_probe__';
        storage.setItem(probe,'1');storage.removeItem(probe);found.push(storage);
      }catch(_){}
    }
    return found;
  }
  function writeRaw(flowId,value){
    const raw=JSON.stringify(value),k=key(flowId);
    let wrote=false;
    for(const storage of storageCandidates()){
      try{storage.setItem(k,raw);wrote=true;break;}catch(_){}
    }
    memory.set(k,raw);
    return wrote;
  }
  function readRaw(flowId){
    const k=key(flowId);
    for(const storage of storageCandidates()){
      try{const raw=storage.getItem(k);if(raw)return raw;}catch(_){}
    }
    return memory.get(k)||'';
  }
  function removeRaw(flowId){
    const k=key(flowId);
    for(const storage of storageCandidates()){try{storage.removeItem(k);}catch(_){}}
    memory.delete(k);
  }
  function isExpired(session,at=new Date()){
    const expires=Date.parse(session?.expiresAt||'');
    return !Number.isFinite(expires)||expires<=at.getTime();
  }
  function normalizeAttribution(value={}){
    return value&&typeof value==='object'&&!Array.isArray(value)?clone(value):{};
  }
  function create({flow,attribution={},ttlMs=DEFAULT_TTL_MS}={}){
    if(!flow?.id||!flow?.version||!flow?.openingQuestionId)throw new TypeError('Signal session requires a normalized flow.');
    const createdAt=nowIso();
    const session={
      schemaVersion:'1.0',
      build:BUILD,
      sessionId:`sig_${uuid()}`,
      flowId:clean(flow.id,120),
      flowVersion:clean(flow.version,40),
      state:'active',
      currentQuestionId:clean(flow.openingQuestionId,120),
      history:[],
      canonicalSignals:{},
      attribution:normalizeAttribution(attribution),
      decision:null,
      revision:1,
      createdAt,
      updatedAt:createdAt,
      expiresAt:new Date(Date.now()+Math.max(60_000,Number(ttlMs)||DEFAULT_TTL_MS)).toISOString()
    };
    save(session);
    return clone(session);
  }
  function validate(session){
    return Boolean(
      session&&typeof session==='object'&&
      session.schemaVersion==='1.0'&&
      typeof session.sessionId==='string'&&session.sessionId.startsWith('sig_')&&
      validId(session.flowId)&&
      typeof session.flowVersion==='string'&&
      ['active','complete'].includes(session.state)&&
      Array.isArray(session.history)&&
      session.canonicalSignals&&typeof session.canonicalSignals==='object'&&!Array.isArray(session.canonicalSignals)
    );
  }
  function save(session){
    if(!validate(session))throw new TypeError('Signal session is invalid.');
    const next=clone(session);
    next.updatedAt=nowIso();
    next.revision=Math.max(1,Number(next.revision)||1);
    writeRaw(next.flowId,next);
    return clone(next);
  }
  function load(flowId,{flowVersion='',allowVersionMismatch=false,now=new Date()}={}){
    const raw=readRaw(flowId);if(!raw)return null;
    let session;
    try{session=JSON.parse(raw);}catch(_){removeRaw(flowId);return null;}
    if(!validate(session)||isExpired(session,now)){removeRaw(flowId);return null;}
    if(flowVersion&&session.flowVersion!==flowVersion&&!allowVersionMismatch)return null;
    return clone(session);
  }
  function rebuildSignals(history){
    const signals={};
    for(const item of history||[]){
      if(item?.canonicalField)signals[item.canonicalField]=item.canonicalValue;
    }
    return signals;
  }
  function answer(session,question,option,{answeredAt=nowIso()}={}){
    if(!validate(session)||session.state!=='active')throw new TypeError('Signal session is not active.');
    if(!question?.id||!question?.canonicalField)throw new TypeError('Signal question is invalid.');
    const selected=(question.options||[]).find(item=>item.code===option?.code||item.code===option);
    if(!selected)throw new TypeError('Signal answer option is invalid.');
    const existingIndex=session.history.findIndex(item=>item.questionId===question.id);
    const preserved=existingIndex>=0?session.history.slice(0,existingIndex):[...session.history];
    const item={
      questionId:question.id,
      questionVersion:question.version||'1.0',
      answerCode:selected.code,
      answerLabel:selected.label,
      canonicalField:question.canonicalField,
      canonicalValue:selected.canonicalValue,
      answeredAt
    };
    const history=[...preserved,item];
    const next={...clone(session),history,canonicalSignals:rebuildSignals(history),revision:Number(session.revision||1)+1,decision:null,state:'active'};
    return save(next);
  }
  function setCurrent(session,questionId){
    if(!validate(session)||!validId(questionId))throw new TypeError('Signal current question is invalid.');
    return save({...clone(session),currentQuestionId:questionId,revision:Number(session.revision||1)+1});
  }
  function back(session,flow){
    if(!validate(session)||!flow?.questionMap)throw new TypeError('Signal back navigation is unavailable.');
    const history=[...session.history];
    if(!history.length)return clone(session);
    const last=history.pop();
    const target=last.questionId;
    const next={...clone(session),history,canonicalSignals:rebuildSignals(history),currentQuestionId:target,state:'active',decision:null,revision:Number(session.revision||1)+1};
    return save(next);
  }
  function complete(session,completion={}){
    if(!validate(session))throw new TypeError('Signal session is invalid.');
    const next={...clone(session),state:'complete',currentQuestionId:'',decision:completion&&typeof completion==='object'?clone(completion):{},revision:Number(session.revision||1)+1};
    return save(next);
  }
  function restart(flow,attribution,options={}){
    if(flow?.id)removeRaw(flow.id);
    return create({flow,attribution,ttlMs:options.ttlMs});
  }
  function clear(flowId){removeRaw(flowId);return true;}

  return Object.freeze({
    VERSION,BUILD,KEY_PREFIX,DEFAULT_TTL_MS,
    create,validate,save,load,answer,setCurrent,back,complete,restart,clear,isExpired,rebuildSignals
  });
});
