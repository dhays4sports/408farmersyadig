(function(root,factory){
  'use strict';
  const api=factory(root);
  root.SignalEvents=api;
  if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis,function(root){
  'use strict';

  const VERSION='1.0.0';
  const allowed=new Set([
    'signal_session_started','signal_session_resumed','signal_question_viewed','signal_answered',
    'signal_back','signal_session_restarted','signal_flow_completed','signal_session_paused','signal_error'
  ]);
  const clean=(value,max=240)=>String(value??'').trim().replace(/[<>\u0000-\u001f\u007f]/g,'').slice(0,max);

  function safeDetail(detail={}){
    const out={};
    for(const [key,value] of Object.entries(detail||{})){
      if(value===null||value===undefined)continue;
      if(typeof value==='string')out[key]=clean(value,300);
      else if(typeof value==='number'&&Number.isFinite(value))out[key]=value;
      else if(typeof value==='boolean')out[key]=value;
    }
    return out;
  }
  function emit(name,detail={}){
    if(!allowed.has(name))throw new TypeError('Unsupported signal analytics event.');
    const event={event:name,signal_event_version:'1.0',occurred_at:new Date().toISOString(),...safeDetail(detail)};
    try{root.dataLayer=root.dataLayer||[];root.dataLayer.push(event);}catch(_){}
    try{
      if(root.document&&typeof root.CustomEvent==='function'){
        root.document.dispatchEvent(new root.CustomEvent('408farmers:signal-event',{detail:event}));
      }
    }catch(_){}
    return Object.freeze(event);
  }

  return Object.freeze({VERSION,EVENT_NAMES:Object.freeze([...allowed]),emit});
});
