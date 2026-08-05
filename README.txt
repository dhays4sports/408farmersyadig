408-FARMERS CAMPAIGN LANDING PAGES

UPLOAD STRUCTURE
Place the contents of this folder in your website root/public_html. Keep the folder structure intact.

URLs
/home
/auto-bundle
/healthcare
/teachers
/tech
/engineers

TEACHERS CAMPAIGN
The /teachers route is a complete educator eligibility campaign and uses the same personalized CoverageFit handoff as Home, Tech, Engineers, and Healthcare.

FORM SETUP
1. Open shared/config.js
2. Confirm the Formspree endpoint and Google Places browser key.
3. Upload the full package.

SMART ADDRESS AUTOCOMPLETE
The Home property-address field is activated with Google Places. The browser key must remain restricted in Google Cloud to the production 408FARMERS domains and any approved preview domain, with billing and the required Maps/Places APIs enabled. Manual address entry remains available if Google cannot load.

TRACKING
Each form automatically captures campaign, landing-page URL, timestamp, and UTM parameters.

META PIXEL
Add your base Pixel code to the <head> of each index.html. Add your Lead event to each thank-you.html.

IMPORTANT
Discounts and eligibility are not guaranteed. All pages include appropriate qualifier language and consent text.

SPRINT 1.2 — SHARED VISUAL SYSTEM
- Added shared/design-system.css
- Standardized colors, spacing, radius, shadows, typography, buttons, cards, chips, panels, grids, links, and reveal motion
- Applied reusable components to /score without changing its campaign layout
- Imported the shared system into root.css, styles.css, and score.css for future page adoption
- Added DESIGN-SYSTEM.md implementation guidance

COVERAGEFIT HANDOFF
The Home, Tech, Engineers, Healthcare, and Teachers forms start a keepalive Formspree submission, then continue the canonical prospect profile into CoverageFit after a short bounded grace period. A slow or failed lead-delivery response no longer blocks the CoverageFit transition. Auto Bundle remains on its local thank-you journey. Every personalized handoff includes a 408-HO-1F sender fingerprint and the stable `coveragefit-handoff-v1` schema contract. Legacy `referral` attribution is emitted as CoverageFit's canonical `ref` parameter.

HANDOFF QA
Run: node qa/test-408-ho-1a.js
Run: node qa/test-408-ho-1e.js
Run: node qa/test-408-ho-1f.js
Run: python qa/test-static.py
Run: python qa/check-links.py

PRODUCTION HANDOFF CERTIFICATION
Read-only live verification:
node qa/production-handoff-smoke.js

Full live verification (creates five clearly labeled test leads):
node qa/production-handoff-smoke.js --submit --acknowledge-leads --output qa/production-smoke-latest.json

The deployment is certified only when the command returns CERTIFIED. See PRODUCTION-HANDOFF-CERTIFICATION.md.
