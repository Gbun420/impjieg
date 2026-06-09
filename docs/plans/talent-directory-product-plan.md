# Impjieg Talent Directory — Product Plan

> **Status:** Draft
> **Date:** 2026-06-08
> **Feature flag:** `CV_DIRECTORY_ENABLED=false`

---

## 1. Product Positioning

**Name:** Impjieg Talent Directory

**Not:** CV database, candidate marketplace, resume board.

**What it is:** An opt-in, candidate-controlled talent discovery platform where verified employers search for candidates who have explicitly chosen to be discoverable.

**Core differentiator:** Candidates own their data. Employers pay for access. Contact happens through Impjieg with candidate approval.

## 2. Candidate Value Proposition

**Headline:** Be discovered by verified employers

**Body:** Join the Impjieg Talent Directory so verified employers can request to contact you. You control what is visible, and your email, phone, and CV are never shared unless you allow it.

**Key promises:**

- Be discovered by verified employers
- Stay private until you opt in
- Control what employers see (display mode, skills, sectors)
- Approve or reject contact requests
- Pause or leave anytime
- Your email, phone, and CV are hidden by default

## 3. Employer Value Proposition

**Headline:** Unlock Malta's opt-in talent pool

**Body:** Search candidates who have chosen to be discoverable, then send contact requests through Impjieg using monthly credits.

**Key promises:**

- Search opt-in talent
- Contact candidates through Impjieg
- Use paid credits (consumed only on accepted contact)
- No scraping, no spam, no bulk export

## 4. Admin Value Proposition

- Monitor opt-ins and search activity
- Monitor employer access and credit usage
- Monitor contact requests and acceptance rates
- Suspend abusive employers
- Export audit logs for compliance

## 5. MVP Scope

### Candidate

| Feature | Description |
|---------|-------------|
| Opt in | Explicit consent to be discoverable |
| Pause | Temporarily hide from search |
| Leave directory | Remove profile from directory |
| Display mode | Anonymous, first name, full name |
| CV/contact permissions | Control what employers can request |
| Preview | See exactly what employers see |

### Employer

| Feature | Description |
|---------|-------------|
| Search | Filter by skills, sector, location, experience, salary, remote |
| Profile view | View candidate's safe profile |
| Contact request | Send request with message (consumes credit on acceptance) |
| Request tracking | View pending/accepted/rejected/expired requests |
| Upsell | Locked directory for free employers |

### Admin

| Feature | Description |
|---------|-------------|
| Overview | Opted-in candidates, active employers, contact requests |
| Candidate profiles | Search, view status, suspend |
| Employer access | View plans, credits, suspend |
| Contact requests | View all requests |
| Audit logs | Filter by actor/action |

## 6. Out of Scope for MVP

- AI matching
- AI screening
- Raw CV parsing automation
- Public candidate pages
- Bulk export
- Recruiter team seats
- CRM integrations
- WhatsApp automation

## 7. Monetization

### Free Employer

- Sees locked directory upsell
- Sees anonymised sample cards
- Cannot contact candidates

### Talent Starter — €49/month

- Searchable directory
- 10 accepted-contact credits/month
- Basic filters

### Talent Recruiter — €99/month

- 30 accepted-contact credits/month
- Advanced filters
- Saved candidates

### Credit Packs

| Pack | Credits | Price |
|------|---------|-------|
| Small | 5 | €19 |
| Medium | 20 | €49 |
| Large | 50 | €99 |

### Credit Rule

A credit is consumed **only when the candidate accepts** the contact request. Pending and rejected requests do not consume credits.

## 8. Candidate-visible Copy

**Headline:** Be discovered by verified employers

**Body:** Join the Impjieg Talent Directory so verified employers can request to contact you. You control what is visible, and your email, phone, and CV are never shared unless you allow it.

## 9. Employer-visible Copy

**Headline:** Unlock Malta's opt-in talent pool

**Body:** Search candidates who have chosen to be discoverable, then send contact requests through Impjieg using monthly credits.
