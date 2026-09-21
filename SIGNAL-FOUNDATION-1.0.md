# SIGNAL-FOUNDATION-1.0

**Product:** 408FARMERS  
**Status:** Phase 1 foundation / isolated feature branch  
**Branch:** `signal-foundation-1.0`  
**Public production routes changed:** none  
**Date:** 2026-09-20

## Purpose

Build the reusable browser-side primitive for the future 408FARMERS Signal UX before converting any production landing page.

The Phase 1 contract is intentionally narrow:

> **Render one question → capture one canonical answer → preserve attribution and anonymous state → continue/back/resume truthfully → never create a lead merely because someone answered.**

No scoring, CoverageFit decision API, CRM promotion, contact capture, or insurance eligibility logic belongs in this phase.

## Canonical browser architecture

```
Traffic
  ↓
SignalAttribution
  ↓
SignalFlowRegistry
  ↓
SignalShell
  ↓
SignalSession
  ↓
SignalEvents
```

Phase 2 will insert the CoverageFit Signal Decision service after each meaningful answer without replacing these primitives.

## Files

### `shared/signal/signal-contract.js`
Versioned flow/question/answer validation.

Guarantees:
- stable flow IDs
- stable question IDs
- stable canonical fields
- bounded answer-option count
- valid next-question references
- copy and semantics remain separable

### `shared/signal/signal-attribution.js`
Canonical signal attribution.

Preserves:
- first touch
- latest touch
- campaign
- UTM source / medium / campaign / content / term
- creative
- ref
- partner ID
- batch ID
- source key
- landing page
- external referrer host

Attribution survives navigation without resetting first touch.

### `shared/signal/signal-events.js`
Truthful browser event layer.

Current events:
- `signal_session_started`
- `signal_session_resumed`
- `signal_question_viewed`
- `signal_answered`
- `signal_back`
- `signal_session_restarted`
- `signal_flow_completed`
- `signal_session_paused`
- `signal_error`

Events are pushed to `dataLayer` and emitted as `408farmers:signal-event`. They do not claim a lead, contact, appointment, conversation, quote, or sale occurred.

### `shared/signal/signal-session.js`
Anonymous persisted SignalSession.

Current fields:
- schemaVersion
- build
- sessionId
- flowId
- flowVersion
- state
- currentQuestionId
- history
- canonicalSignals
- attribution
- decision
- revision
- createdAt
- updatedAt
- expiresAt

Default resume window: 7 days.

Storage preference:
1. localStorage
2. sessionStorage
3. in-memory fallback

No name, phone, email, DOB, address, SSN, VIN, medical information, or other PII is required by the foundation session.

### `shared/signal/signal-flow-registry.js`
Declarative flow registration and next-question resolution.

Product pages should register configuration, not implement bespoke funnel logic.

### `shared/signal/signal-shell.js`
Accessible minimal interaction runtime.

Supports:
- first question
- large tap targets
- keyboard focus
- Back
- Start over
- Continue where you left off
- persisted anonymous state
- completion state
- error/retry state
- reduced-motion-compatible CSS
- explicit human escape hatch supplied by the host page

When a prior answer is changed, all downstream answers are removed and `canonicalSignals` is rebuilt from surviving history. Stale answers cannot remain attached to a new branch.

## Internal lab

`/signal-lab/`

Properties:
- `noindex,nofollow,noarchive`
- does not submit Formspree
- does not call CoverageFit
- does not create an AgencyZoom lead
- does not modify existing Home/Tech/Healthcare/etc. routes
- includes developer diagnostics for current SignalSession and emitted events

The dummy flow intentionally uses future canonical concepts:
- `statedTrigger`
- `shoppingIntent`
- `decisionTiming`

This validates mechanics only. Its questions are not the final Life/Home/Auto production flows.

## Question-governance doctrine

A future production Signal question is allowed only when at least one answer can materially change:
- routing
- priority evidence
- the next question
- requested human action

Questions useful only for quoting, underwriting, recommendation design, or application processing belong downstream.

## Phase 1 non-goals

Not included:
- Opportunity Priority scoring
- CoverageFit Signal Decision API
- anonymous server persistence
- cross-device resume
- CRM / AgencyZoom lead creation
- contact forms
- automated marketing consent
- booking
- Retell
- SMS signal client
- production Life flow
- production Home flow
- conversion experiments

Those remain later phases by design.

## Acceptance criteria

Phase 1 is complete when:

1. A normalized flow can register.
2. A new anonymous SignalSession is created.
3. Attribution is captured with first/latest touch.
4. The opening question renders.
5. Selecting an answer stores a canonical signal.
6. The next question renders.
7. Back removes dependent downstream answers.
8. Start Over creates a fresh session.
9. Leaving and returning can resume the prior session.
10. Expired or incompatible-version sessions do not resume.
11. Events describe only actions that actually occurred.
12. Errors preserve saved state and expose Retry.
13. Existing production landing pages remain behaviorally unchanged.
14. The internal lab creates no lead and calls no CoverageFit API.

## Next phase boundary

`CF-SIGNAL-DECISION-1.0` should consume the current SignalSession evidence and return a bounded instruction such as:

- `ASK_ONE_SIGNAL`
- `OFFER_HUMAN`
- `SHOW_CONTENT`
- `CONTINUE_LATER`

The browser shell should render that instruction. It must not contain a second copy of Opportunity Priority scoring logic.
