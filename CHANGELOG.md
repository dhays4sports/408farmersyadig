## SIGNAL-FOUNDATION-1.0 — Signal UX Browser Foundation

- Added an isolated anonymous `SignalSession` primitive with seven-day local resume, versioning, canonical answer history, expiry, and memory fallback.
- Added declarative signal-flow registration so future Life/Home/Auto/Commercial pages can share one interaction engine rather than bespoke forms.
- Added first-touch / latest-touch campaign and UTM attribution persistence.
- Added a truthful signal analytics taxonomy that never equates a click or answer with a lead, conversation, quote, or sale.
- Added accessible Back, Resume, Start Over, completion, and failure/retry behavior.
- Changing an earlier answer now removes dependent downstream answers and rebuilds canonical signals.
- Added the noindex `/signal-lab/` foundation demo; it creates no Formspree lead and calls no CoverageFit API.
- Added permanent Node regression QA and a branch/PR GitHub Actions gate.
- Existing production Home, Tech, Engineers, Healthcare, Teachers, Auto Bundle, and CoverageFit handoff behavior remains unchanged.

## 408-BRAND-1A — 408FARMERS Logo Integration

- Replaced the previous logo with the supplied 408FARMERS Insurance Text Line identity.
- Converted the white-matte source into a tightly cropped transparent two-color production asset.
- Added a white footer lockup, shield-only icon, favicon, and Apple touch icon.
- Updated responsive header sizing and standardized logo alternative text across the site.
- Removed the duplicate 408FARMERS wordmark from the Home hero image.
- Standardized all personalized landing-page sender fingerprints on the current 408-HO-1G contract.

## 408-HO-1F — Non-Blocking CoverageFit Transition

- Restored reliable 408FARMERS → CoverageFit continuation when Formspree is slow, unavailable, or returns an error.
- Added keepalive lead delivery and a bounded submission grace period.
- Preserved the prospect profile, address data, campaign attribution, consent, and CoverageFit transition experience.
- Added explicit confirmed, pending, and unconfirmed lead-capture metadata without exposing personal information.
- Updated the sender fingerprint and receiver manifest for CoverageFit v3.20.7.

## 408-ADDR-1G — Places API (New) Input Stability

- Fixed the Property Address field stopping or erroring after two characters.
- Migrated from the legacy Google Places Autocomplete widget to the current Autocomplete Data API.
- Preserved unrestricted manual typing, structured address capture, Google attribution, keyboard navigation, and CoverageFit handoff.
- Added explicit two-character non-blocking and three-character request-threshold regression tests.

## 408-ADDR-1F — Google Places Activation

- Installed the configured Google Maps Platform browser key for the Home address field.
- Added explicit Google callback initialization and authentication-failure handling.
- Preserved manual address entry whenever Google is unavailable or rejects the key.
- Expanded runtime and static certification for live-loader readiness.

## 408-HO-1E — CoverageFit Handoff Contract Alignment

- Mapped legacy `referral` attribution into CoverageFit's canonical `ref` parameter without emitting duplicate referral keys.
- Added Non-renewal or cancellation and Premium increased to the Home review-reason choices.
- Replaced the TX-1.1-specific diagnostic label with the stable `coveragefit-handoff-v1` schema contract.
- Updated sender fingerprints to 408-HO-1E and cross-repository smoke verification to use exact CoverageFit TX-1.9 receiver assets.
- Preserved all five personalized routes, Formspree-first submission, shared session handling, and local fallback behavior.

## 408-HO-1C — Production-Domain Handoff Smoke Certification

- Added a public handoff deployment manifest and per-form build/contract fingerprints.
- Added non-personal sender-build and handoff-contract metadata to CoverageFit launches.
- Added a dependency-free production smoke runner for Home, Tech, Engineers, Healthcare, Teachers, Formspree, and CoverageFit TX-1.1.
- Added a full local production simulation with five accepted Formspree submissions and verified CoverageFit URL cleanup/transition routing.
- Recorded a production NO-GO because the currently deployed Teachers route remains blank and the corrected sender/receiver builds are not yet confirmed live.

## 408-HO-1B — Teachers Campaign Landing-Page Restoration

- Replaced the blank `/teachers/` route with a complete educator campaign landing page.
- Added a working educator eligibility form using the existing Formspree, prospect-profile, and CoverageFit handoff pipeline.
- Added a complete local thank-you fallback with direct call and text actions.
- Added production-page, static, and cross-page regression coverage for the Teachers handoff.

## 408-HO-1A — Personalized Handoff Coverage Alignment

- Connected the Tech, Engineers, and Healthcare forms to the existing prospect-profile pipeline.
- Preserved each form's contact, property, campaign, entry-point, launch-surface, and session context during CoverageFit handoff.
- Added production-page handoff QA and strengthened static checks so future forms cannot opt into CoverageFit without loading the profile builder.
- Kept Auto Bundle intentionally local until a CoverageFit Auto destination exists.

## 408-ADDR-1E — Validation and Deployment Readiness

- Added address-autocomplete runtime regression tests.
- Added live deployment and Google API restriction checklist.
- Certified manual, autocomplete, timeout, structured capture, and stale-data clearing paths.


## 408-ADDR-1D — Manual Address Fallback

- Added submit-time canonicalization for manually typed addresses.
- Added paste handling, stale-component clearing, and Google loader timeout fallback.
- Added an `address:ready` integration event without changing the current form pipeline.

## 408-ADDR-1C — Structured Address Capture

- Added structured Google Places address component capture.
- Added hidden street, city, county, state, ZIP, country and place ID fields.
- Added explicit autocomplete/manual selection tracking.
- Clears stale structured values when a selected address is edited.

# Changelog

## 408-ADDR-1B — Smart Suggestion Interface

- Added a styled, touch-friendly Google Places suggestion dropdown.
- Added a three-character suggestion threshold and live address guidance.
- Added selected/loading/manual/unavailable UI states while preserving manual entry.
- Added keyboard and click-away dismissal support.

## Sprint 1.4C
- Production optimization and accessibility pass for the homepage.
- Added vendor-neutral analytics event hooks.
- Improved metadata, image loading, mobile behavior and navigation.

## Sprint 1.4B
- Added homepage storytelling, CoverageFit explanation, trust content and professional pathways.

## Sprint 1.4A
- Rebuilt the homepage as an intent-based routing hub.

- Sprint 1.5: Added campaign routing architecture documentation.

## B.1.2A — Shared CoverageFit Launcher
- Added the reusable sending-side CoverageFit launcher.
- Added attribution and UTM pass-through URL construction.
- Added shared integration session IDs.
- Added launch/fallback analytics events.
- Added configurable production and fallback destinations.
- No live CTA behavior changed in this sprint.

## B.1.2B — `/score` CoverageFit Handoff

- Connected all `/score` review CTAs to the shared CoverageFit launcher.
- Preserved campaign, UTM, referral, creative, and session attribution.
- Preserved the existing transition and mobile sticky CTA.
- Retained `/home#form` as the local fallback.

## B.1.2C — Additional Home Entry Points
- Connected the homepage primary Home review CTA and featured Home intent card to CoverageFit.
- Preserved Formspree lead capture on Home, Tech, Engineer, and Healthcare landers, then continued successful submissions into CoverageFit.
- Added distinct entry and launch-surface attribution for every connected path.
- Left Auto Bundle, Business, Landlord, Life, and non-Home routes unchanged.


## B.1.2D — End-to-End Integration QA

- Added repeatable launcher, static integration, route, and local-link QA tests.
- Verified all 408-FARMERS Home entry points preserve their intended funnel behavior.
- Confirmed campaign, UTM, session, entry, assessment, and launch-surface attribution.
- Confirmed safe local fallback behavior.
- Added `B1_2D_QA.json` and `SPRINT-B.1.2D.md`.

## B1.2F — Home Flyer-to-Web Journey Alignment
- Rebuilt `/home` hero to visually continue the printed 408FARMERS homeowner flyer.
- Added a full-width California home image, flyer-scale headline, increased whitespace, and one dominant above-the-fold CTA.
- Moved the full Coverage Review form below the hero to reduce first-screen friction.
- Added a concise review-benefits section and streamlined the Meet Dylan presentation.
- Updated campaign attribution copy to match the homeowner campaign message.
- Preserved CoverageFit launch, Formspree submission, UTM attribution, consent, and thank-you behavior.

## 408-ADDR-1A — Address Autocomplete Foundation

- Added optional Google Places loading for the `/home` property-address field.
- Restricted provider suggestions to US addresses and biased results toward California.
- Added resilient manual-entry fallback and duplicate-loader protection.
- Added `googlePlacesApiKey` configuration placeholder and sprint documentation.

## CF-INT-1A — Prospect Profile Builder
- Added `shared/prospect-profile.js` with canonical profile construction, normalization, storage, and retrieval.
- Home form now builds and stores the prospect profile after validation.
- CoverageFit launcher now accepts a profile object without serializing or transferring personal data.
- Added `coveragefit:profile-ready` integration event for future handoff sprints.


## CF-INT-1B — Intelligent Profile Handoff
- Added allowlisted prospect profile serialization to the CoverageFit launch URL.
- Transfers contact, review-context, and structured property-address data after successful lead capture.
- Added prefill and handoff-version markers while preserving existing attribution and fallback behavior.
