(function(root){
  'use strict';
  if(!root.SignalFlowRegistry)throw new Error('SignalFlowRegistry must load before the demo flow.');

  root.SignalFlowRegistry.register({
    id:'foundation_demo',
    version:'1.0.0',
    label:'Signal Foundation Demo',
    openingQuestionId:'demo_trigger',
    questions:[
      {
        id:'demo_trigger',
        version:'1.0',
        dimension:'need',
        canonicalField:'statedTrigger',
        prompt:'What brought you here today?',
        supportingText:'This is a private foundation demo. Your answer stays on this device.',
        options:[
          {code:'home_renewal',label:'My home renewal is coming up',canonicalValue:'home_renewal'},
          {code:'buying_home',label:'I’m buying a home',canonicalValue:'buying_home'},
          {code:'auto',label:'I need help with auto coverage',canonicalValue:'auto'},
          {code:'life',label:'I want to protect my family',canonicalValue:'life'},
          {code:'business',label:'My business needs coverage',canonicalValue:'business'}
        ],
        next:{default:'demo_intent'}
      },
      {
        id:'demo_intent',
        version:'1.0',
        dimension:'intent',
        canonicalField:'shoppingIntent',
        prompt:'How actively are you looking to handle it?',
        options:[
          {code:'ready_now',label:'I’m ready to handle it now',canonicalValue:'ready_now'},
          {code:'open_to_review',label:'I’m open to reviewing it',canonicalValue:'open_to_review'},
          {code:'researching',label:'I’m mostly researching',canonicalValue:'researching'},
          {code:'not_interested',label:'Not really — I was just looking',canonicalValue:'not_interested'}
        ],
        next:{default:'demo_timing'}
      },
      {
        id:'demo_timing',
        version:'1.0',
        dimension:'timing',
        canonicalField:'decisionTiming',
        prompt:'When would you ideally want to handle it?',
        options:[
          {code:'asap',label:'As soon as possible',canonicalValue:'as_soon_as_possible'},
          {code:'within_30',label:'Within 30 days',canonicalValue:'within_30'},
          {code:'next_few_months',label:'In the next few months',canonicalValue:'next_few_months'},
          {code:'unsure',label:'I’m not sure yet',canonicalValue:'unsure'}
        ],
        next:{default:null}
      }
    ],
    completion:{
      headline:'Foundation flow complete.',
      body:'The demo proved question rendering, anonymous persistence, back/edit behavior, canonical signal rebuilding, and truthful events without creating a lead.'
    }
  });
})(typeof window!=='undefined'?window:globalThis);
