// Always open landing pages at the top instead of restoring a previous scroll position.
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
const resetLandingScroll = () => {
  if (!location.hash) window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
};
window.addEventListener('pageshow', () => {
  resetLandingScroll();
  setTimeout(resetLandingScroll, 50);
});

(() => {
  const HANDOFF_BUILD = '408-HO-1G';
  const HANDOFF_CONTRACT = 'coveragefit-handoff-v1';
  const LEAD_SUBMISSION_GRACE_MS = 900;
  const PENDING_LEAD_KEY = '408farmersLeadPending';
  const form = document.getElementById('leadForm');
  const status = document.getElementById('formStatus');
  const config = window.LANDING_PAGE_CONFIG || {};
  if (!form) return;

  const params = new URLSearchParams(location.search);
  ['utm_source','utm_medium','utm_campaign','utm_content','utm_term'].forEach(k => {
    const input = form.querySelector(`[name="${k}"]`);
    if (input) input.value = params.get(k) || '';
  });

  const pageInput = form.querySelector('[name="landing_page"]');
  if (pageInput) pageInput.value = location.href;
  const timeInput = form.querySelector('[name="submitted_at"]');
  if (timeInput) timeInput.value = new Date().toISOString();

  const normalizePhone = value => value.replace(/\D/g,'');
  const leadSnapshot = () => Object.fromEntries(new FormData(form).entries());
  const storePendingLead = () => {
    try {
      sessionStorage.setItem(PENDING_LEAD_KEY, JSON.stringify(leadSnapshot()));
    } catch (_) {}
  };
  const clearPendingLead = () => {
    try {
      sessionStorage.removeItem(PENDING_LEAD_KEY);
    } catch (_) {}
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    status.textContent='';

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const phone = normalizePhone(form.elements.phone.value);
    if (phone.length < 10) {
      status.textContent='Please enter a valid phone number.';
      form.elements.phone.focus();
      return;
    }

    const button = form.querySelector('button[type="submit"]');
    const label = button.querySelector('span:first-child');
    const original = label.textContent;
    button.disabled=true;
    label.textContent='Submitting…';

    const endpoint=(config.formEndpoint||'').trim();
    const prospectProfile = window.ProspectProfileBuilder
      ? window.ProspectProfileBuilder.fromForm(form)
      : null;

    if (prospectProfile && window.ProspectProfileBuilder) {
      window.ProspectProfileBuilder.save(prospectProfile);
    }

    const handoffCampaign = prospectProfile && prospectProfile.campaign
      ? prospectProfile.campaign
      : (form.elements.campaign ? form.elements.campaign.value : null);

    const continueToCoverageFit = (leadCaptureStatus = 'confirmed') => {
      if (form.dataset.coveragefitAfterSubmit !== 'true') {
        location.href=form.dataset.success||'thank-you.html';
        return;
      }

      if (!window.CoverageFitLauncher) {
        location.href=form.dataset.success||'thank-you.html';
        return;
      }

      label.textContent='Opening CoverageFit…';
      window.CoverageFitLauncher.launch({
        profile: prospectProfile,
        campaign: handoffCampaign,
        entry: form.dataset.cfEntry || 'lead_form',
        assessment: form.dataset.cfAssessment || 'home',
        fallbackUrl: form.dataset.success || 'thank-you.html',
        extra: {
          launch_surface: form.dataset.cfExtraLaunchSurface || 'lead_form',
          lead_captured: leadCaptureStatus === 'confirmed' ? 'true' : 'pending',
          lead_capture_status: leadCaptureStatus,
          sender_build: form.dataset.senderBuild || HANDOFF_BUILD,
          handoff_contract: form.dataset.handoffContract || HANDOFF_CONTRACT
        }
      });
    };

    if(!endpoint){
      try {
        sessionStorage.setItem('408farmersLead',JSON.stringify(leadSnapshot()));
      } catch (_) {}
      continueToCoverageFit('local-fallback');
      return;
    }

    const submitLead = async () => {
      const response = await fetch(endpoint, {
        method:'POST',
        body:new FormData(form),
        headers:{Accept:'application/json'},
        keepalive:true
      });
      if(!response.ok) throw new Error('Submission failed');
      clearPendingLead();
      return 'confirmed';
    };

    if (form.dataset.coveragefitAfterSubmit === 'true') {
      // The CoverageFit journey must not be blocked by a slow or unavailable
      // lead-delivery provider. Keepalive allows the small Formspree request to
      // continue while the browser opens CoverageFit.
      storePendingLead();
      const submission = submitLead().catch(() => 'unconfirmed');
      const leadCaptureStatus = await Promise.race([
        submission,
        new Promise(resolve => setTimeout(() => resolve('pending'), LEAD_SUBMISSION_GRACE_MS))
      ]);
      continueToCoverageFit(leadCaptureStatus);
      return;
    }

    try{
      await submitLead();
      continueToCoverageFit('confirmed');
    }catch(e){
      status.textContent='Something went wrong. Please call or text (408) 327-6377.';
      button.disabled=false;
      label.textContent=original;
    }
  });
})();
