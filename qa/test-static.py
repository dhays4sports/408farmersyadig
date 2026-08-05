from pathlib import Path
from urllib.parse import urlparse
import json, re, sys
root=Path(__file__).resolve().parents[1]
checks=[]
def check(name, cond, detail=''):
    checks.append({'name':name,'passed':bool(cond),'detail':detail})

# Required assets and docs
for rel in ['shared/config.js','shared/coveragefit-launch.js','shared/prospect-profile.js','shared/score.js','shared/script.js','score/index.html','home/index.html','index.html','_redirects','handoff-manifest.json','qa/production-handoff-smoke.js','qa/test-408-ho-1c.js','SPRINT-408-HO-1G.md','PRODUCTION-HANDOFF-CERTIFICATION.md','PRODUCTION-HANDOFF-CERTIFICATION.json']:
    check(f'exists:{rel}', (root/rel).is_file())

score=(root/'score/index.html').read_text(encoding='utf-8')
check('score loads config before launcher', score.find('../shared/config.js') < score.find('../shared/coveragefit-launch.js'))
check('score loads launcher before score behavior', score.find('../shared/coveragefit-launch.js') < score.find('../shared/score.js'))
check('score has three CTA hooks', score.count('js-start-review') >= 3, str(score.count('js-start-review')))

home_pages={
 'home/index.html':'home_lander_form',
 'tech/index.html':'tech_eligibility_form',
 'engineers/index.html':'engineers_eligibility_form',
 'healthcare/index.html':'healthcare_eligibility_form',
 'teachers/index.html':'teachers_eligibility_form',
}
for rel, entry in home_pages.items():
    text=(root/rel).read_text(encoding='utf-8')
    check(f'{rel}:form launch enabled', 'data-coveragefit-after-submit="true"' in text)
    check(f'{rel}:entry distinct', f'data-cf-entry="{entry}"' in text)
    check(f'{rel}:config before launcher', text.find('../shared/config.js') < text.find('../shared/coveragefit-launch.js'))
    check(f'{rel}:profile builder loaded', '../shared/prospect-profile.js' in text)
    check(f'{rel}:launcher before profile builder', text.find('../shared/coveragefit-launch.js') < text.find('../shared/prospect-profile.js'))
    check(f'{rel}:profile builder before script', text.find('../shared/prospect-profile.js') < text.find('../shared/script.js'))
    check(f'{rel}:production build fingerprint', '408farmers-handoff-build' in text and '408-HO-1G' in text)
    check(f'{rel}:sender build attribute', 'data-sender-build="408-HO-1G"' in text)
    check(f'{rel}:handoff contract attribute', 'data-handoff-contract="coveragefit-handoff-v1"' in text)

index=(root/'index.html').read_text(encoding='utf-8')
check('homepage has two CoverageFit launch elements', index.count('data-coveragefit-launch="home"') == 2, str(index.count('data-coveragefit-launch="home"')))
check('homepage keeps auto bundle local', 'href="auto-bundle/"' in index)

config=(root/'shared/config.js').read_text(encoding='utf-8')
check('canonical CoverageFit URL configured', 'https://coveragefit.com/home/' in config)
check('local fallback configured', '/home#form' in config)


address_js=(root/'shared/address-autocomplete.js').read_text(encoding='utf-8')
home=(root/'home/index.html').read_text(encoding='utf-8')
check('address autocomplete module exists', (root/'shared/address-autocomplete.js').is_file())
check('home address field is eligible', 'data-address-autocomplete="property"' in home)
check('home loads address module before form script', home.find('../shared/address-autocomplete.js') < home.find('../shared/script.js'))
check('address module restricts to US', "includedRegionCodes: ['us']" in address_js)
check('address module requests address predictions', 'fetchAutocompleteSuggestions' in address_js)
check('address module has California bounds', 'CALIFORNIA_BOUNDS' in address_js and 'locationRestriction: CALIFORNIA_BOUNDS' in address_js)
check('address module preserves blank-key manual fallback', "setState('manual')" in address_js)
check('Google Places key is configurable', 'googlePlacesApiKey' in config)
check('Google Places key is configured', bool(re.search(r'googlePlacesApiKey:\s*[\"\']AIza[0-9A-Za-z_-]+[\"\']', config)))
check('address module has three-character threshold', 'MIN_QUERY_LENGTH = 3' in address_js)
check('address module adds accessible helper', 'address-autocomplete-helper' in address_js and 'aria-live' in address_js)
check('address module tracks query readiness', 'addressQueryReady' in address_js)
check('address module handles selected address', 'selectPrediction' in address_js and 'fetchFields' in address_js)
check('address module uses Places API New', 'AutocompleteSuggestion' in address_js and re.search(r"importLibrary\(\s*['\"]places['\"]\s*\)", address_js))
check('address module avoids legacy Autocomplete widget', 'new window.google.maps.places.Autocomplete' not in address_js)
check('address input is never constrained to two characters', 'maxlength="150"' in home and 'maxlength="2"' not in home)
styles=(root/'shared/styles.css').read_text(encoding='utf-8')
check('Places dropdown styled', '.address-suggestion-list' in styles and '.address-suggestion' in styles)
check('Places rows are touch friendly', 'min-height:58px' in styles)
check('short queries suppress predictions', 'query.length < MIN_QUERY_LENGTH' in address_js)
check('1B sprint documentation exists', (root/'SPRINT-408-ADDR-1B.md').is_file())
check('1C sprint documentation exists', (root/'SPRINT-408-ADDR-1C.md').is_file())
check('1D sprint documentation exists', (root/'SPRINT-408-ADDR-1D.md').is_file())
check('1E sprint documentation exists', (root/'SPRINT-408-ADDR-1E.md').is_file())
check('1F sprint documentation exists', (root/'SPRINT-408-ADDR-1F.md').is_file())
check('1G sprint documentation exists', (root/'SPRINT-408-ADDR-1G.md').is_file())
check('address deployment checklist exists', (root/'ADDRESS-AUTOCOMPLETE-QA.md').is_file())
check('address runtime QA exists', (root/'qa/test-address-autocomplete.js').is_file())
for field in ['property_formatted_address','property_street','property_city','property_county','property_state','property_zip','property_country','property_place_id','address_selection_method']:
    check(f'home has structured address field: {field}', f'name=\"{field}\"' in home)
check('address module parses address components', 'parsePlace' in address_js and 'address_components' in address_js)
check('address module stores structured address', 'storeStructuredAddress' in address_js)
check('address module tracks autocomplete method', re.search(r"setHiddenValue\(\s*['\"]address_selection_method['\"]\s*,\s*['\"]autocomplete['\"]\s*\)", address_js))
check('address module preserves manual method', "setHiddenValue('address_selection_method', 'manual')" in address_js)
check('address module clears stale components', 'clearStructuredAddress' in address_js and 'currentValue !== selectedFormattedAddress' in address_js)
check('manual address syncs before submit', 'syncManualAddressForSubmit' in address_js and re.search(r"form\?\.addEventListener\(\s*['\"]submit['\"]", address_js))
check('manual address populates canonical formatted field', re.search(r"setHiddenValue\(\s*['\"]property_formatted_address['\"]\s*,\s*typedAddress\s*\)", address_js))
check('pasted addresses retain manual support', "addEventListener('paste'" in address_js)
check('Google loader has timeout fallback', 'SCRIPT_LOAD_TIMEOUT_MS' in address_js and 'loadTimeout' in address_js)
check('Google loader uses explicit ready callback', 'GOOGLE_READY_CALLBACK' in address_js and 'callback=' in address_js)
check('Google authentication failure preserves fallback', 'gm_authFailure' in address_js and 'settleUnavailable' in address_js)
check('Google key uses strict referrer policy', re.search(r"referrerPolicy\s*=\s*['\"]strict-origin-when-cross-origin['\"]", address_js))
check('address ready integration event exists', "CustomEvent('address:ready'" in address_js)

launcher=(root/'shared/coveragefit-launch.js').read_text(encoding='utf-8')
for field in ['campaign','source','entry','assessment','session_id']:
    check(f'launcher sends {field}', f"searchParams.set('{field}'" in launcher)
for field in ['utm_source','utm_medium','utm_campaign','utm_term','utm_content','creative','ref','referral']:
    check(f'launcher supports {field}', f"'{field}'" in launcher)

shared_script=(root/'shared/script.js').read_text(encoding='utf-8')
check('form handoff uses form campaign', 'campaign: handoffCampaign' in shared_script)
check('form handoff sends sender build fingerprint', 'sender_build:' in shared_script and '408-HO-1G' in shared_script)
check('form handoff sends receiver contract fingerprint', 'handoff_contract:' in shared_script and 'coveragefit-handoff-v1' in shared_script)
check('launcher maps legacy referral to canonical ref', "url.searchParams.set('ref', attribution[key])" in launcher and "!url.searchParams.has('ref')" in launcher)
check('home offers non-renewal reason', 'Non-renewal or cancellation' in home)
check('home offers premium-increase reason', 'Premium increased' in home)
for rel in ['qa/fixtures/coveragefit-v3.20.7/home.html','qa/fixtures/coveragefit-v3.20.7/transition.html','qa/fixtures/coveragefit-v3.20.7/prefill-intake.js','qa/fixtures/coveragefit-v3.20.7/attribution.js','qa/fixtures/coveragefit-v3.20.7/personalization-context.js','qa/fixtures/coveragefit-v3.20.7/transition-route.js']:
    check(f'exists:{rel}', (root/rel).is_file())
check('obsolete TX-1.1 fixture removed', not (root/'qa/fixtures/coveragefit-tx1.1').exists())
manifest=json.loads((root/'handoff-manifest.json').read_text(encoding='utf-8'))
check('handoff manifest identifies current build', manifest.get('build') == '408-HO-1G', manifest.get('build',''))
check('handoff manifest identifies receiver contract', manifest.get('handoffContract') == 'coveragefit-handoff-v1', manifest.get('handoffContract',''))
check('handoff manifest lists five personalized routes', len(manifest.get('routes',[])) == 5, str(len(manifest.get('routes',[]))))
check('auto bundle remains local', 'data-coveragefit-after-submit="true"' not in (root/'auto-bundle/index.html').read_text(encoding='utf-8'))
check('teachers route restored', (root/'teachers/index.html').stat().st_size > 1000)
check('teachers fallback restored', (root/'teachers/thank-you.html').stat().st_size > 500)
check('teachers campaign asset exists', (root/'shared/assets/teachers.png').is_file())

failed=[c for c in checks if not c['passed']]
result={'total':len(checks),'passed':len(checks)-len(failed),'failed':len(failed),'checks':checks}
(root/'B1_2D_QA.json').write_text(json.dumps(result,indent=2),encoding='utf-8')
print(json.dumps({'total':result['total'],'passed':result['passed'],'failed':result['failed']},indent=2))
if failed:
    for c in failed: print('FAIL',c['name'],c['detail'])
    sys.exit(1)
