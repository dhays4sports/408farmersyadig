(function(root,factory){
  'use strict';
  const api=factory();
  root.SignalContract=api;
  if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';

  const BUILD='SIGNAL-FOUNDATION-1.0';
  const SCHEMA_VERSION='1.0';
  const SESSION_STATES=Object.freeze(['active','complete']);
  const EVENT_NAMES=Object.freeze([
    'signal_session_started',
    'signal_session_resumed',
    'signal_question_viewed',
    'signal_answered',
    'signal_back',
    'signal_session_restarted',
    'signal_flow_completed',
    'signal_session_paused',
    'signal_error'
  ]);

  const clean=(value,max=240)=>String(value??'').trim().replace(/[<>\u0000-\u001f\u007f]/g,'').slice(0,max);
  const plainObject=value=>Boolean(value&&typeof value==='object'&&!Array.isArray(value));
  const validId=value=>/^[a-z0-9][a-z0-9._:-]{0,119}$/i.test(clean(value,120));
  const iso=value=>Number.isFinite(Date.parse(value))?new Date(value).toISOString():'';

  function normalizeAnswerOption(value={}){
    if(!plainObject(value))throw new TypeError('Signal answer option must be an object.');
    const code=clean(value.code,80),label=clean(value.label,160);
    if(!validId(code)||!label)throw new TypeError('Signal answer option requires a valid code and label.');
    return Object.freeze({
      code,
      label,
      canonicalValue:clean(value.canonicalValue??code,120),
      hint:clean(value.hint,180)
    });
  }

  function normalizeQuestion(value={}){
    if(!plainObject(value))throw new TypeError('Signal question must be an object.');
    const id=clean(value.id,120),version=clean(value.version||'1.0',40),prompt=clean(value.prompt,260),canonicalField=clean(value.canonicalField,120);
    if(!validId(id)||!prompt||!validId(canonicalField))throw new TypeError('Signal question requires id, prompt, and canonicalField.');
    const options=(value.options||[]).map(normalizeAnswerOption);
    if(options.length<2||options.length>8)throw new TypeError('Signal question must have between 2 and 8 answer options.');
    return Object.freeze({
      id,
      version,
      prompt,
      supportingText:clean(value.supportingText,260),
      canonicalField,
      dimension:clean(value.dimension,40),
      options:Object.freeze(options),
      next:plainObject(value.next)?Object.freeze({...value.next}):null
    });
  }

  function normalizeFlow(value={}){
    if(!plainObject(value))throw new TypeError('Signal flow must be an object.');
    const id=clean(value.id,120),version=clean(value.version,40),openingQuestionId=clean(value.openingQuestionId,120);
    if(!validId(id)||!version||!validId(openingQuestionId))throw new TypeError('Signal flow requires id, version, and openingQuestionId.');
    const questions=(value.questions||[]).map(normalizeQuestion);
    const ids=new Set(questions.map(question=>question.id));
    if(ids.size!==questions.length)throw new TypeError('Signal question IDs must be unique inside a flow.');
    if(!ids.has(openingQuestionId))throw new TypeError('Signal opening question is missing from the flow.');
    questions.forEach(question=>{
      if(!question.next)return;
      Object.values(question.next).forEach(nextId=>{
        if(nextId!==null&&nextId!==''&&!ids.has(nextId))throw new TypeError('Signal next-question reference is invalid.');
      });
    });
    return Object.freeze({
      id,
      version,
      label:clean(value.label||id,160),
      openingQuestionId,
      questions:Object.freeze(questions),
      questionMap:Object.freeze(Object.fromEntries(questions.map(question=>[question.id,question]))),
      completion:plainObject(value.completion)?Object.freeze({...value.completion}):Object.freeze({})
    });
  }

  function publicError(error){
    return {
      name:clean(error?.name||'SignalError',80),
      message:clean(error?.message||'Signal experience could not continue.',300)
    };
  }

  return Object.freeze({
    BUILD,SCHEMA_VERSION,SESSION_STATES,EVENT_NAMES,
    clean,plainObject,validId,iso,normalizeAnswerOption,normalizeQuestion,normalizeFlow,publicError
  });
});
