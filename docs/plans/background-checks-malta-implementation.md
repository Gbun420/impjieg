# Background checks implementation plan

- Status: Draft
- Purpose: Define a consent-based background screening workflow for Impjieg.
- Audience: Maintainers, product, legal, engineering, employers, and implementation agents.
- Last reviewed: 2026-06-04
- Owner: Impjieg maintainers

## Product principle

Impjieg does not search criminal-record databases and does not make automated hiring decisions.

Background checks are:
- role-specific
- employer-requested
- candidate-consented
- manually reviewed or provider-verified
- private by default
- retained only as long as necessary

## Legal guardrails

- GDPR Article 10 applies to criminal conviction/offence data.
- Conduct Certificate handling must be restricted.
- Candidate consent alone may not be enough for criminal conviction processing if local law does not authorise the processing.
- Legal review is required before storing Conduct Certificates in production.
- Conduct Certificate details must not be parsed into structured offence fields.
- No public criminal-record badge is allowed.

## MVP scope

Implement:
- employer background-check request flow
- candidate consent/decline flow
- secure document upload for non-criminal documents
- conduct_certificate status workflow with storage disabled by default unless enabled by env flag
- employer manual verification status
- audit log
- retention/delete metadata
- admin oversight page showing metadata only, not document contents by default

Do not implement:
- automatic rejection
- public badges
- police database integration
- criminal detail extraction
- automated criminal-record decisioning
- broad screening before application/shortlist

## Check types

Define:
- identity
- right_to_work
- employment_reference
- education
- licence_certification
- conduct_certificate
- regulated_role

For each check type include:
- allowed use cases
- candidate-visible explanation
- employer justification required: yes/no
- document upload allowed: yes/no
- sensitive: yes/no
- default retention period
- whether provider/manual verification is required

## Status model

Use:
- not_requested
- requested
- candidate_consented
- candidate_declined
- document_uploaded
- provided_externally
- in_review
- verified
- needs_attention
- rejected
- expired
- cancelled
- deleted

## Access rules

- Candidate can view their own requests/documents.
- Employer can view requests for their own applications only.
- Employer cannot request checks for candidates who did not apply.
- Admin can view metadata and audit trail.
- Admin document access must be restricted and audited.
- Public users see nothing.
- Other employers cannot reuse a candidate’s document without a new consent flow.

## Data minimisation

Store:
- check type
- status
- justification
- consent timestamps
- verification timestamps
- reviewer id
- expiry date
- retention delete date
- document storage path if applicable
- file hash

Do not store:
- conviction/offence details
- full extracted document contents
- unnecessary ID numbers
- raw OCR text for Conduct Certificates
- public URLs to sensitive documents

## Security requirements

- private Supabase storage bucket only
- signed short-lived download URLs
- server-side authorization before every upload/download/status update
- audit log on every view/download/status change
- no raw PII/secrets in logs
- retention deletion job
- no indexing sensitive documents in search

## UX surfaces

Candidate:
- Screening center
- Request detail page
- Consent/decline action
- Upload document
- Mark as provided externally
- Delete request/document request
- Explanation of who can see documents

Employer:
- Request check from application page
- Select check type
- Provide role-specific reason
- View request status
- Mark verified/needs attention/rejected
- Download document only if authorized
- Cannot request prohibited checks without justification

Admin:
- Metadata dashboard
- Suspicious/abusive request monitoring
- Retention queue
- Audit logs
- Feature flag status
- No default full document access

## Acceptance criteria

- No one can request checks without authentication.
- Employers only request checks for their own applications.
- Candidates must consent before upload.
- Conduct Certificate upload is disabled unless explicitly enabled.
- All sensitive actions are audited.
- No public route exposes background-check data.
- No automated rejection exists.
- Tests pass.
