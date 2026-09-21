(function(root,factory){
  'use strict';
  const api=factory(root);
  root.SignalFlowRegistry=api;
  if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis,function(root){
  'use strict';

  const VERSION='1.0.0';
  const flows=new Map();

  function contract(){
    const api=root.SignalContract;
    if(!api?.normalizeFlow)throw new Error('SignalContract must load before SignalFlowRegistry.');
    return api;
  }
  function register(flow){
    const normalized=contract().normalizeFlow(flow);
    flows.set(normalized.id,normalized);
    return normalized;
  }
  function get(id){return flows.get(String(id||'').trim())||null;}
  function has(id){return flows.has(String(id||'').trim());}
  function remove(id){return flows.delete(String(id||'').trim());}
  function list(){return Object.freeze([...flows.values()]);}
  function nextQuestion(flow,questionId,answerCode){
    const question=flow?.questionMap?.[questionId];if(!question)return null;
    if(!question.next)return null;
    const explicit=Object.prototype.hasOwnProperty.call(question.next,answerCode)?question.next[answerCode]:question.next.default;
    return explicit||null;
  }

  return Object.freeze({VERSION,register,get,has,remove,list,nextQuestion});
});
