# OFFICIAL SAMVIDHA INTEGRATION GUIDE
## Future Integration Architecture, Institutional Approvals, and Cybersecurity Guidelines

This document serves as the formal integration blueprint for transitioning the **Smart Academic Intelligence Portal (SAIP)** from synthetic demonstration data to a live, verified integration with the Institute of Aeronautical Engineering's official academic portal (**Samvidha**, `samvidha.iare.ac.in`).

---

## 1. Mandatory Cybersecurity & Ethical Restrictions

In accordance with institutional IT security regulations and university honor codes, the following practices are **strictly prohibited**:

1. **No Authenticated Scraping**: Never attempt to scrape protected HTML pages from `samvidha.iare.ac.in`.
2. **No Automated Credential Stuffing or Headless Browsers**: Never use tools such as Selenium, Puppeteer, or Playwright to bypass student logins or solve CAPTCHAs.
3. **No Password Interception or Storage**: Never store or collect real student or faculty university passwords.
4. **No Identity Impersonation**: Never execute requests impersonating students or faculty without explicit OAuth2 authorization tokens.
5. **No Falsified Connectivity Claims**: Never advertise that live synchronization exists unless official college credentials have been issued, tested, and actively verified.
6. **No Fabricated Endpoints**: The application uses the `OfficialApiProvider` adapter, which strictly enforces a handshake check before advertising live status.

---

## 2. Institutional Approvals & Governance Checklist

To enable live data access, formal written authorization must be requested and obtained through the following administrative bodies:

* [ ] **Office of the Principal / Dean of Academic Affairs**: Approval for third-party analytics processing under autonomous curriculum governance.
* [ ] **Controller of Examinations (CoE)**: Formal clearance ensuring that unofficial performance projections or analytics do not conflict with official result publication statutes.
* [ ] **Campus IT & Systems Administration**: Technical provisioning of dedicated REST API endpoints or read-only database replicas.
* [ ] **Institutional Data Privacy & Governance Board**: Consent protocols ensuring FERPA / Digital Personal Data Protection (DPDP) compliance.

---

## 3. Required Technical Credentials & Environment Variables

Once approved, the college IT administration must provision the following credentials for backend environment configuration:

```env
# Active Data Provider Switch
ACTIVE_DATA_PROVIDER="Official API"

# Official College Gateway Base URL
OFFICIAL_API_BASE_URL="https://samvidha.iare.ac.in/api/v1"

# Mutual TLS or OAuth2 Client Credentials
OFFICIAL_API_CLIENT_ID="iare_saip_client_autonomous_2026"
OFFICIAL_API_SECRET="sec_live_samvidha_jwt_bearer_token_xyz"
```

---

## 4. REST API Endpoint Specification for College IT Systems

The `OfficialApiProvider` expects the following REST endpoints from the institutional gateway:

| Endpoint | Method | Expected Payload / Response |
| :--- | :--- | :--- |
| `/health` | GET | `{"status": "ok", "service": "Samvidha Gateway"}` |
| `/v1/students/{roll_no}` | GET | Student profile, branch, regulation, admission year |
| `/v1/students/{roll_no}/attendance` | GET | Aggregate and course-wise attended vs conducted counts |
| `/v1/students/{roll_no}/assessments/theory` | GET | CIE-I (10), AAT-I (10), CIE-II (10), AAT-II (10), total |
| `/v1/students/{roll_no}/assessments/lab` | GET | 14-week continuous marks, day-to-day (30), exam (10) |
| `/v1/students/{roll_no}/results` | GET | Semester-wise published SGPA, CGPA, and earned credits |
| `/v1/timetable` | GET | Section-wise lecture schedules and classroom allocations |
| `/v1/calendar` | GET | Academic calendar milestones and examination windows |

---

## 5. Fallback & Graceful Degradation Strategy

If the official institutional gateway is temporarily unreachable, experiencing maintenance downtime, or if credentials expire:
1. `OfficialApiProvider.verify_connection()` detects the connection failure.
2. The UI data-source badge immediately switches to `Authorized Import` or `Demo Data`.
3. Cached or locally imported records continue serving students without service interruption.
4. An alert is logged to the administrative security audit trail (`AuditLog`).
