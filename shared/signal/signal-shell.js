(function(root,factory){
  'use strict';
  const api=factory(root);
  root.SignalShell=api;
  if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis,function(root){
  'use strict';

  const VERSION='1.0.0';
  const BUILD='SIGNAL-FOUNDATION-1.0';
  const mounts=new WeakMap();

  const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const byId=(rootNode,id)=>rootNode.querySelector(`#${id}`);
  const focusSoon=element=>{if(element)root.setTimeout(()=>element.focus?.({preventScroll:true}),0);};

  function deps(){
    const registry=root.SignalFlowRegistry,session=root.SignalSession,events=root.SignalEvents,attribution=root.SignalAttribution;
    if(!registry||!session||!events||!attribution)throw new Error('Signal Foundation dependencies are not loaded.');
    return {registry,session,events,attribution};
  }
  function teardown(node){
    const existing=mounts.get(node);
    if(existing?.abort)existing.abort.abort();
    mounts.delete(node);
  }
  function progressCopy(session,flow){
    const answered=session.history.length;
    if(answered===0)return 'One quick question';
    if(answered===1)return 'One more thing';
    return 'Almost there';
  }
  function summaryMarkup(session,flow){
    const completion=flow.completion||{};
    const answers=session.history.map(item=>`<li><span>${esc(item.answerLabel)}</span></li>`).join('');
    return `
      <section class="signal-complete" aria-labelledby="signalCompleteTitle">
        <span class="signal-eyebrow">Foundation demo complete</span>
        <h1 id="signalCompleteTitle">${esc(completion.headline||'That’s the signal flow.')}</h1>
        <p>${esc(completion.body||'Your anonymous answers stayed in this browser and can be resumed without creating a lead.')}</p>
        <ul class="signal-summary-list">${answers}</ul>
        <div class="signal-actions">
          <button type="button" class="signal-secondary" data-signal-restart>Start over</button>
        </div>
      </section>`;
  }
  function questionMarkup(question,session){
    const choices=question.options.map(option=>`
      <button type="button" class="signal-choice" data-signal-answer="${esc(option.code)}">
        <span>${esc(option.label)}</span>
        ${option.hint?`<small>${esc(option.hint)}</small>`:''}
      </button>`).join('');
    const canBack=session.history.length>0;
    return `
      <section class="signal-question" aria-labelledby="signalQuestionTitle">
        <div class="signal-question-top">
          <button type="button" class="signal-back" data-signal-back ${canBack?'':'hidden'} aria-label="Go back">← Back</button>
          <span class="signal-progress">${esc(progressCopy(session))}</span>
        </div>
        <span class="signal-eyebrow">408FARMERS Signal</span>
        <h1 id="signalQuestionTitle" tabindex="-1">${esc(question.prompt)}</h1>
        ${question.supportingText?`<p class="signal-support">${esc(question.supportingText)}</p>`:''}
        <div class="signal-choices" role="group" aria-label="${esc(question.prompt)}">${choices}</div>
        <p class="signal-privacy">No name, phone number, or email is required for this signal.</p>
      </section>`;
  }
  function resumeMarkup(flow){
    return `
      <section class="signal-resume" aria-labelledby="signalResumeTitle">
        <span class="signal-eyebrow">Continue where you left off?</span>
        <h1 id="signalResumeTitle">Your last answers are still on this device.</h1>
        <p>You can continue without starting over, or reset this demo.</p>
        <div class="signal-actions">
          <button type="button" class="signal-primary" data-signal-resume>Continue</button>
          <button type="button" class="signal-secondary" data-signal-restart>Start over</button>
        </div>
      </section>`;
  }
  function errorMarkup(message){
    return `
      <section class="signal-error" role="alert">
        <span class="signal-eyebrow">We kept your answers</span>
        <h1>That next step didn’t load.</h1>
        <p>${esc(message||'Please try again. Your saved signal session is still on this device.')}</p>
        <div class="signal-actions">
          <button type="button" class="signal-primary" data-signal-retry>Try again</button>
          <button type="button" class="signal-secondary" data-signal-restart>Start over</button>
        </div>
      </section>`;
  }

  function mount(options={}){
    const node=typeof options.root==='string'?root.document?.querySelector(options.root):options.root;
    if(!node)throw new Error('Signal Shell root was not found.');
    teardown(node);
    const {registry,session:sessionApi,events,attribution}=deps();
    const flow=registry.get(options.flowId);
    if(!flow)throw new Error('Signal flow is not registered.');
    const abort=new AbortController();
    let state={session:null,resumePending:false,lastQuestionViewed:''};
    mounts.set(node,{abort});

    function event(name,detail={}){
      const current=state.session;
      return events.emit(name,{
        flow_id:flow.id,
        flow_version:flow.version,
        session_id:current?.sessionId||'',
        session_revision:current?.revision||0,
        question_id:current?.currentQuestionId||'',
        ...detail
      });
    }
    function renderQuestion(){
      const current=state.session;
      if(current?.state==='complete'){
        node.innerHTML=summaryMarkup(current,flow);
        focusSoon(byId(node,'signalCompleteTitle'));
        return;
      }
      const question=flow.questionMap[current?.currentQuestionId];
      if(!question)throw new Error('Signal flow could not resolve the current question.');
      node.innerHTML=questionMarkup(question,current);
      const heading=byId(node,'signalQuestionTitle');
      focusSoon(heading);
      if(state.lastQuestionViewed!==question.id){
        state.lastQuestionViewed=question.id;
        event('signal_question_viewed',{question_id:question.id,question_version:question.version,answer_count:current.history.length});
      }
    }
    function render(){
      try{
        if(state.resumePending){node.innerHTML=resumeMarkup(flow);focusSoon(byId(node,'signalResumeTitle'));return;}
        renderQuestion();
      }catch(error){
        event('signal_error',{error_message:error?.message||'render_failed'});
        node.innerHTML=errorMarkup(error?.message);
      }
    }
    function startFresh(restarted=false){
      const attr=attribution.capture();
      state.session=sessionApi.restart(flow,attr,{ttlMs:options.ttlMs});
      state.resumePending=false;state.lastQuestionViewed='';
      event(restarted?'signal_session_restarted':'signal_session_started',{landing_page:attr.landingPage,campaign:attr.campaign});
      render();
    }
    function initialize(){
      const existing=sessionApi.load(flow.id,{flowVersion:flow.version});
      if(existing){
        state.session=existing;
        state.resumePending=options.autoResume!==true;
        if(options.autoResume===true)event('signal_session_resumed',{answer_count:existing.history.length});
        render();
      }else startFresh(false);
    }
    function answer(code){
      const current=state.session,question=flow.questionMap[current.currentQuestionId];
      const option=question.options.find(item=>item.code===code);
      if(!option)return;
      state.session=sessionApi.answer(current,question,option);
      event('signal_answered',{
        question_id:question.id,
        question_version:question.version,
        answer_code:option.code,
        canonical_field:question.canonicalField,
        canonical_value:option.canonicalValue,
        answer_count:state.session.history.length
      });
      const nextId=registry.nextQuestion(flow,question.id,option.code);
      if(nextId){
        state.session=sessionApi.setCurrent(state.session,nextId);
        state.lastQuestionViewed='';
      }else{
        state.session=sessionApi.complete(state.session,{kind:'foundation_demo_complete'});
        event('signal_flow_completed',{answer_count:state.session.history.length});
      }
      render();
    }
    function back(){
      if(!state.session?.history?.length)return;
      state.session=sessionApi.back(state.session,flow);
      state.lastQuestionViewed='';
      event('signal_back',{answer_count:state.session.history.length});
      render();
    }
    function resume(){
      state.resumePending=false;
      event('signal_session_resumed',{answer_count:state.session.history.length});
      render();
    }
    function restart(){
      startFresh(true);
    }
    function retry(){render();}
    function safeAction(action){
      try{return action();}
      catch(error){
        event('signal_error',{error_message:error?.message||'interaction_failed'});
        node.innerHTML=errorMarkup(error?.message);
        return null;
      }
    }

    node.addEventListener('click',eventObject=>{
      const answerButton=eventObject.target.closest?.('[data-signal-answer]');
      if(answerButton){safeAction(()=>answer(answerButton.dataset.signalAnswer));return;}
      if(eventObject.target.closest?.('[data-signal-back]')){safeAction(back);return;}
      if(eventObject.target.closest?.('[data-signal-resume]')){safeAction(resume);return;}
      if(eventObject.target.closest?.('[data-signal-restart]')){safeAction(restart);return;}
      if(eventObject.target.closest?.('[data-signal-retry]')){safeAction(retry);}
    },{signal:abort.signal});

    const onPageHide=()=>{if(state.session?.state==='active')event('signal_session_paused',{answer_count:state.session.history.length});};
    root.addEventListener?.('pagehide',onPageHide,{signal:abort.signal});

    initialize();
    return Object.freeze({
      flow,
      getSession:()=>state.session?JSON.parse(JSON.stringify(state.session)):null,
      restart,
      resume,
      destroy:()=>teardown(node)
    });
  }

  return Object.freeze({VERSION,BUILD,mount,teardown});
});
