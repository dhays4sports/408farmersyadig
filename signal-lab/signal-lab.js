(function(root){
  'use strict';

  function renderDiagnostics(controller){
    const session=document.getElementById('signalSessionDebug');
    if(session)session.textContent=JSON.stringify(controller.getSession(),null,2);
  }

  document.addEventListener('DOMContentLoaded',function(){
    const rootNode=document.getElementById('signalRoot');
    const controller=root.SignalShell.mount({
      root:rootNode,
      flowId:'foundation_demo',
      autoResume:false
    });

    renderDiagnostics(controller);

    document.addEventListener('408farmers:signal-event',function(event){
      const log=document.getElementById('signalEventDebug');
      if(log){
        const prior=log.textContent==='No events yet.'?'':log.textContent+'\n';
        log.textContent=prior+JSON.stringify(event.detail);
      }
      root.setTimeout(function(){renderDiagnostics(controller);},0);
    });

    root.setInterval(function(){renderDiagnostics(controller);},1200);
  });
})(window);
