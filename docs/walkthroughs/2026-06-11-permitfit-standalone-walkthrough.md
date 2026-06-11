# PermitFit Standalone Pilot Walkthrough

The PermitFit standalone pilot has been successfully implemented and tested. It provides a way for employers to check the work-status and start-date match of a TCN candidate before screening, without affecting the live job-board flow.

## What was implemented

1. **PermitFit Constants (`src/lib/permitfit/constants.ts`)**: Added comprehensive options for TCN support levels, supported permit routes, candidate work status, and pre-departure course status, along with the strict legal disclaimer.
2. **Deterministic Scoring Engine (`src/lib/permitfit/scoring.ts`)**: Built a robust scoring function (`calculatePermitFit`) that evaluates employer-declared support against candidate-declared status to output a categorized fit label, score, and safe insights (Positive signals, Risk signals, Next questions). The engine explicitly avoids forbidden terms like "approved" or "eligible".
3. **Automated Tests (`src/lib/permitfit/scoring.test.ts`)**: Added a suite of 14 tests verifying score bounds, risk flags (e.g. KEI/SEI salary thresholds, accommodation gaps), and rigorously asserting the absence of forbidden legal/approval terms. All tests pass successfully.
4. **Interactive UI Components (`src/components/permitfit/*`)**: 
   - `PermitFitForm`: A two-column responsive client component that collects employer and candidate inputs and triggers the `calculatePermitFit` logic on demand.
   - `PermitFitResultCard`: A clean, stateless card component that dynamically styles the calculated outcome (e.g., green for Strong Fit, amber for Risk) and presents the signals clearly.
5. **Standalone Pilot Page (`src/app/permitfit/page.tsx`)**: An isolated public route displaying the pilot with explicit disclaimers.

## Verification
- **Linting**: `npm run lint` passed with 0 errors.
- **Tests**: `npm test` passed successfully, with all 14 new PermitFit tests validating logic edges and forbidden phrasing.
- **Build**: `npm run build` completed successfully, ensuring the Next.js App Router static/dynamic generation handles the new route flawlessly.

> [!TIP]
> The pilot is fully standalone. Once validated with users, you can begin the database migrations and integration phases defined in your integration plan document.
