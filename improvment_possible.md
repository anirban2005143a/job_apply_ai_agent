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