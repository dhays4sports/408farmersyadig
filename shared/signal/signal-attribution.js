(function(root,factory){
  'use strict';
  const api=factory(root);
  root.SignalAttribution=api;
  if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis,function(root){
  'use strict';

  const VERSION='1.0.0';
  const QUERY_KEYS=Object.freeze([
    'campaign','utm_source','utm_medium','utm_campaign','utm_content','utm_term',
    'creative','ref','referral','partner_id','batch_id','source_key','source'
  ]);
  const STORAGE_KEY='408farmers.signal.attribution.v1';
  const MAX_VALUE=180;
  const clean=value=>String(value??'').trim().replace(/[<>\u0000-\u001f\u007f]/g,'').slice(0,MAX_VALUE);

  function safeStorage(){
    try{
      const storage=root.localStorage;
      const test='__signal_attr_test__';
      storage.setItem(test,'1');storage.removeItem(test);
      return storage;
    }catch(_){return null;}
  }
  function readStored(){
    const storage=safeStorage();if(!storage)return {};
    try{const parsed=JSON.parse(storage.getItem(STORAGE_KEY)||'{}');return parsed&&typeof parsed==='object'&&!Array.isArray(parsed)?parsed:{};}catch(_){return {};}
  }
  function writeStored(value){
    const storage=safeStorage();if(!storage)return false;
    try{storage.setItem(STORAGE_KEY,JSON.stringify(value));return true;}catch(_){return false;}
  }
  function queryValues(){
    let params;
    try{params=new URLSearchParams(root.location?.search||'');}catch(_){params=new URLSearchParams('');}
    const out={};
    QUERY_KEYS.forEach(key=>{const value=clean(params.get(key));if(value)out[key]=value;});
    return out;
  }
  function normalize(raw={}){
    const ref=clean(raw.ref||raw.referral);
    return Object.freeze({
      campaign:clean(raw.campaign||'direct')||'direct',
      source:clean(raw.source),
      sourceKey:clean(raw.source_key||raw.sourceKey),
      partnerId:clean(raw.partner_id||raw.partnerId),
      batchId:clean(raw.batch_id||raw.batchId),
      creative:clean(raw.creative),
      ref,
      utm:Object.freeze({
        source:clean(raw.utm_source||raw.utm?.source),
        medium:clean(raw.utm_medium||raw.utm?.medium),
        campaign:clean(raw.utm_campaign||raw.utm?.campaign),
        content:clean(raw.utm_content||raw.utm?.content),
        term:clean(raw.utm_term||raw.utm?.term)
      })
    });
  }
  function capture(){
    const stored=readStored(),query=queryValues(),merged={...stored,...query};
    if(!merged.campaign){
      const campaign=clean(root.CFCampaign?.current);
      if(campaign)merged.campaign=campaign;
    }
    if(Object.keys(query).length)writeStored(merged);
    const canonical=normalize(merged);
    const landingPage=clean(root.location?.pathname||'/');
    let referrer='';
    try{
      const refUrl=root.document?.referrer?new URL(root.document.referrer):null;
      if(refUrl&&refUrl.origin!==root.location?.origin)referrer=clean(refUrl.hostname,180);
    }catch(_){}
    return Object.freeze({
      ...canonical,
      landingPage,
      referrer,
      capturedAt:new Date().toISOString()
    });
  }
  function reset(){const storage=safeStorage();try{storage?.removeItem(STORAGE_KEY);return true;}catch(_){return false;}}

  return Object.freeze({VERSION,STORAGE_KEY,QUERY_KEYS,capture,normalize,readStored,reset});
});
