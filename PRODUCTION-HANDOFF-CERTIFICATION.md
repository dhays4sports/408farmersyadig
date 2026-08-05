# 408FARMERS Handoff Certification

**Current sender sprint:** 408-HO-1F  
**Receiver contract:** `coveragefit-handoff-v1`  
**Verified receiver:** CoverageFit v3.20.7  
**Source-package status:** **CERTIFIED IN SIMULATION**  
**Live-production status:** **NOT RECHECKED**

## Scope
- 408FARMERS Home
- 408FARMERS Tech
- 408FARMERS Engineers
- 408FARMERS Healthcare
- 408FARMERS Teachers
- Keepalive Formspree delivery with non-blocking CoverageFit continuation
- CoverageFit prefill intake and URL cleanup
- CoverageFit attribution and canonical personalization context
- CoverageFit v3.20.7 transition route and Home return

## Source-package certification
The 408-HO-1F package is tested against exact receiver assets copied from `CoverageFit_v3.20.7_CONS2.1_Privacy_Safe_New_Review_Notification_Deployable.zip`. The simulation verifies all five sender routes, five accepted mock Formspree submissions, canonical prospect transfer, `referral` to `ref` mapping, URL cleanup, transition state, v3.20.7 personalization context, completion receipt, and return to CoverageFit Home.

Result: **132/132 checks passed and 5/5 mock Formspree submissions accepted.**

## Live-production note
408-HO-1D was intentionally skipped, so this sprint does not claim a new live-production certification. To create five clearly labeled synthetic leads after deployment, run:

```bash
node qa/production-handoff-smoke.js --submit --acknowledge-leads --output qa/production-smoke-latest.json
```

The read-only command remains available without creating leads:

```bash
node qa/production-handoff-smoke.js
```
