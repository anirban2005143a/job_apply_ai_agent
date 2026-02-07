# Dashboard Design Specifications

## 1. Stats/Metrics Section (Top Cards)
* **Total Applications:** Count from `applied-jobs`
* **Pending Responses:** Count from `pending-jobs`
* **Needs Clarification:** Count from `clarify-jobs`
* **Rejected/Discarded:** Count from `discard-jobs`
* **Success Rate:** (accepted / total applied) %
* **Auto-Apply Status:** Active/Inactive toggle with server start/stop endpoints

---

## 2. Visual Charts
* **Application Distribution Pie Chart:** Applied vs Pending vs Clarify vs Rejected
* **Applications Timeline:** Number of applications per day/week
* **Job Categories Bar Chart:** Most common roles/positions applied to
* **Company Frequency:** Top companies applied to
* **Tech Stack Analysis:** Most requested skills from job postings

---

## 3. Quick Actions Panel
* **Start/Stop Processing:** Uses your `/user/{user_id}/start` and `/user/{user_id}/stop` endpoints
* **View/Edit Preferences:** Your constraint settings from onboarding
* **Upload Resume:** Quick link to onboarding
* **Profile Status:** Is profile complete? Preferences set?

---

## 4. Recent Activity Feed
* Last 5-10 job applications with timestamps
* Last job search performed
* Profile updates
* Daily application count

---

## 5. Key Insights Widget
* **Favorite Companies:** Companies you've applied to most
* **Geographic Focus:** Cities/countries with most job matches
* **Preferred Roles:** Most applied positions
* **Skill Demand:** Top 5 most-requested skills from your applied jobs

---

## 6. System Status
* Job processing active/inactive status
* Last successful job search time
* Processing speed (jobs found per day)
* Queue status (jobs waiting to be processed)

---

## 7. Summary Cards (Compact view of all sections)
* Quick navigation to Applied/Pending/Clarify/Discard pages
* Show count badges on each card
* Show last update timestamp

---

## 8. Preferences Summary Chip List
* **Show current filters:** Min salary, locations, roles, blocked companies
* **Quick edit links** to each preference

---

### Key Data to Pull From:
* **Job counts:** Use your existing `/jobs/{user_id}/applied|pending|rejected|clarify` endpoints
* **User preferences:** From `OnboardingProvider`/stored preferences
* **Processing status:** From your `job_manager.start_user()` / `stop_user()`
* **LLM insights:** Extract data from stored job analyses (clarification, rankings, etc.)

> **Best Place for Dashboard:** A new `/dashboard` route or make it the default landing page after login instead of the current `/`.

---

## Functional Improvements
- **Combined Dashboard API:** Add a single `/dashboard-stats/{user_id}` endpoint that returns counts (applied, pending, clarify, rejected), recent items, and processing status in one call to reduce frontend requests.
- **Move job storage to DB:** Replace file-backed per-user storage with a database (Mongo/Postgres) to enable safe concurrent access, queries, and indexing.
- **Worker Concurrency Controls:** Add configurations for max concurrent LLM and API calls, backoff/retry policies, and queue limits to avoid rate limits.
- **Robust Auth & Validation:** Apply `verify_jwt_token` middleware to private endpoints, and validate/sanitize incoming data and remote API responses.
- **Metrics & Health:** Expose metrics (Prometheus) and a richer `/health` endpoint indicating worker counts and queue sizes.
- **Graceful Shutdown & Persistence:** Persist in-progress job state and make workers checkpoint so they can resume after crashes or restarts.
- **Rate Limiting & Circuit Breakers:** Add rate limits and circuit breaker patterns around external APIs and LLM calls to protect the system.
- **Retry/Dead-letter Queue:** Implement retry logic for failed applications and a dead-letter queue for manual inspection.
- **Batching & Caching:** Batch LLM requests where possible and cache repetitive results to lower costs and latency.

## UI Improvements
- **Notification Settings:** Add a settings UI to toggle notification types, sound on/off, and volume control per user.
- **Processing Toggle UX:** Improve the Start/Stop control with confirmation, descriptive status, and logs/last-run timestamp.
- **Virtualized Notification List:** Use windowing/virtualization for the notification feed to support many items with good performance.
- **Timestamps & Local Time:** Show human-friendly timestamps (e.g., "5m ago") and time zone-aware displays on all feeds.
- **Optimistic UI & SWR:** Use client-side caching (SWR/react-query) and optimistic updates for quick UI responsiveness when toggling processing or applying actions.
- **Accessibility Improvements:** Add ARIA labels, keyboard navigation, and ensure color contrast and focus states are robust.
- **Responsive & Compact Layouts:** Optimize dashboard and cards for mobile screens with collapsible sections and denser list views.
- **Empty States & Skeletons:** Provide clear empty-state messaging and skeleton loaders for slow network operations.
- **Quick Filters & Actions:** Make stat cards clickable to filter lists, and add quick actions (retry, view details) on recent items.
- **User Preferences Panel:** Surface onboarding preferences on the dashboard with edit shortcuts for faster iteration.

