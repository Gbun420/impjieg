# PermitFit TCN research brief

> Date: 2026-06-11
> Product: Impjieg PermitFit™
> Purpose: Research grounding before coding the standalone PermitFit pilot.

## Executive conclusion

Build PermitFit as a readiness and risk-signal tool, not as a visa eligibility checker.

The strongest product angle is:

> Reduce wasted screening time by showing whether a Malta role and a TCN candidate have a clear work-status, permit-route, and start-date match based on employer-declared and candidate-declared information.

The standalone pilot should help recruiters ask the right questions before investing time in screening.

## Primary official sources checked

- Identità Single Permit page: https://identita.gov.mt/expatriates-unit-main-page/noneu-nationals/employment-related-permits/single-permit/
- Jobsplus Non-EU Nationals / TCNs page: https://jobsplus.gov.mt/find-candidates/non-eu-nationals-tcns
- Identità application processing period page: https://identita.gov.mt/expatriates-unit-main-page/noneu-nationals/employment-related-permits/single-permit/application-processing-period/
- Identità working and residing guide: https://identita.gov.mt/working-residing-in-malta/
- Identità Key Employee Initiative page: https://identita.gov.mt/expatriates-unit-main-page/noneu-nationals/employment-related-permits/highly-qualified-individuals/key-employee-initiative/who-is-eligible/
- Identità Specialist Employee Initiative page: https://identita.gov.mt/expatriates-unit-main-page/noneu-nationals/employment-related-permits/highly-qualified-individuals/specialist-employee-initiative/who-is-eligible/
- Identità Pre-Departure Course page: https://identita.gov.mt/expatriates-unit-main-page/noneu-nationals/employment-related-permits/single-permit/expatriates-unit-single-permit-pre-departure-course/
- Skills Pass site: https://skillspass.org.mt/

## Research findings

### 1. Single Permit is the main employment route for many TCN workers

Identità describes the Single Permit as a temporary permit authorising third-country nationals to reside and work in Malta for a defined period over six months. The application procedure combines an employment licence and residence permit.

Implication for PermitFit:

- Add route option: `Single Permit`.
- Ask whether the candidate is outside Schengen, already legally in Malta, or already legally in another Schengen state.
- Ask whether the employer supports first-time Single Permit applicants.

### 2. Employer and applicant status matters

Identità states that a Single Permit application may be submitted when the TCN is still abroad/outside Schengen, or legally staying in Malta or another Schengen state.

Implication for PermitFit:

- Candidate location/status is not optional fluff; it is central.
- Ask:
  - already in Malta?
  - currently outside Malta?
  - has Maltese residence card?
  - needs change of employer?

### 3. Candidate cannot simply start working before the proper document is issued

Jobsplus states that it is illegal to employ a TCN before permit approval/issuance and that employment can be registered only after the person receives the Single Permit. Identità’s Working & Residing guide states the applicant can only start employment after receiving official documentation in the form of an Interim Receipt or actual eResidence document.

Implication for PermitFit:

- The standalone tool should include start-date risk.
- Avoid suggesting a candidate can start immediately unless the employer confirms lawful status separately.
- Add next question: `What document allows this candidate to start, and from what date?`

### 4. Processing time is a major hiring-risk factor

Identità says Single Permit processing can take up to four months, while average processing is closer to two months from submission of a complete application.

Implication for PermitFit:

- Add start-date risk signals.
- If candidate is outside Malta and needs first-time permit, result should usually be `Possible permit fit`, not `Strong`, unless the role has full support and the employer accepts timeline risk.

### 5. Labour-market evidence matters

Jobsplus says employers must first search within the Maltese/EU/EEA labour market and advertise the vacancy to comply with requirements. KEI and SEI pages also mention proof of one job advert for a minimum of two weeks within the two months before application.

Implication for PermitFit:

- Future product opportunity: `Labour Market Evidence Pack`.
- Standalone pilot should include a recruiter next question:
  - `Has the vacancy been advertised for the required period?`
- Do not build PDF evidence pack in the standalone pilot.

### 6. KEI and SEI are distinct high-skill routes

Identità states KEI is a fast-track route for managerial or highly technical roles, requiring at least €45,000 annual gross salary plus relevant qualifications, warrants, or work experience. SEI applies to skilled TCNs with a signed contract with a Maltese-registered company, at least €30,000 annual gross salary, and relevant qualifications or experience.

Implication for PermitFit:

- Add route options: `Key Employee Initiative` and `Specialist Employee Initiative`.
- Do not claim eligibility.
- The standalone tool may show a soft signal if salary is below the threshold:
  - `Salary may not support this selected route based on the information entered.`
- Keep wording as risk/readiness, not legal conclusion.

### 7. Pre-Departure Course is now important for first-time applicants

Identità states that as of January 2026, Malta introduced a mandatory Pre-Departure Course for all TCNs applying for a Single Permit for the first time. Identità states a valid certificate is required for first-time Single Permit applications. The Skills Pass site also states non-EU/EEA/EFTA nationals must complete the mandatory Pre-Departure Course before applying for a single work permit with Identità.

Implication for PermitFit:

- Add field: `Pre-departure course status`.
- For first-time Single Permit scenarios, incomplete/unknown pre-departure status should be a missing/risk signal.
- For hospitality/tourism, also surface Skills Pass as a future sector-specific signal.

### 8. Hospitality and tourism have a sector-specific signal

Skills Pass states that the Pre-Departure Course is the first step for everyone and that, for claimed sectors, Skills Pass is also required. It says the currently claimed sector in Malta is Tourism and Hospitality.

Implication for PermitFit:

- If sector is Tourism & Hospitality, include next question:
  - `Does this candidate also require the sector Skills Pass?`
- Do not overbuild sector logic in the first standalone pilot.

### 9. Fees and permit duration are useful employer context, but not core MVP

Identità’s Working & Residing guide lists fees: first-time Single Permit €600, renewal €150 per year, change of employer €600. It also states most permits are issued for one year, with some cases qualifying for two to three years, and renewal applications should be submitted up to 90 days before expiry.

Implication for PermitFit:

- Future employer value: renewal reminders and change-of-employer cost awareness.
- Standalone pilot can mention fees only in contextual helper copy if needed.
- Do not build payment or case-management logic.

## Recommended standalone pilot fields

### Employer / role side

- Role title
- Sector
- Salary min/max
- TCN support level
- Supported routes
- Candidate must already be in Malta
- Accommodation support
- Relocation support
- Pre-departure support
- Employer notes

### Candidate side

- Candidate work status
- Current country
- Already in Malta
- Has Maltese residence card
- Needs change of employer
- Permit expiry date
- Pre-departure course status
- Earliest realistic start date
- Needs accommodation
- Needs relocation

## Recommended scoring model

The result should be deterministic and conservative.

Labels:

- Strong permit fit
- Possible permit fit
- Permit risk
- Not enough information

Use these rules:

- Unknown work status = Not enough information.
- Maltese/EU candidate = strong unless other non-permit risk is entered.
- TCN + employer support level none = Permit risk.
- TCN already in Malta + change-of-employer support = possible/strong depending on details.
- TCN outside Malta + first-time Single Permit support = possible, not automatically strong.
- First-time applicant + pre-departure not completed = risk/missing signal.
- Candidate needs accommodation + employer supports accommodation = positive signal.
- Candidate needs accommodation + employer does not support accommodation = risk signal.
- Tourism/hospitality route = ask about Skills Pass.
- KEI/SEI route selected + salary below known threshold = risk signal, not rejection.

## Safe copy

Use:

> PermitFit uses employer-declared and candidate-declared information. Impjieg does not provide immigration advice, legal advice, or official approval.

Avoid:

- approved
- guaranteed
- eligible
- government-approved
- officially compliant
- visa approved
- permit approved

## Product recommendation

Do not code a database-backed or fully integrated version yet.

Build `/permitfit` as a standalone public tool first:

- no migration;
- no Supabase persistence;
- no changes to live job posting;
- no changes to live application flow;
- deterministic scoring only;
- clear disclaimers;
- recruiter-oriented output.

After testing demand, integrate into jobs/applications later.
