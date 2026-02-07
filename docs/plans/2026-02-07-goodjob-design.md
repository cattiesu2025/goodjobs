# GoodJob — Job Search Journey Tracker

Personal web app to track the entire job search process: applications, status changes, interview prep, and mock interviews. Deployable and accessible from phone.

## Tech Stack

- **Frontend:** React + Vite + Tailwind CSS + shadcn/ui
- **Backend:** Node.js + Hono + SQLite (better-sqlite3) + Drizzle ORM
- **Charts:** Recharts
- **Calendar:** react-big-calendar
- **TTS:** Web Speech API (browser built-in)
- **Deployment:** Frontend + backend together on Railway or Fly.io

## Project Structure

```
goodjob/
├── client/
│   ├── src/
│   │   ├── pages/         # Dashboard, JobJournal, MockInterview
│   │   ├── components/    # Shared UI components
│   │   └── lib/           # API client, helpers
│   └── ...
├── server/
│   ├── routes/            # API endpoints
│   ├── db/                # Schema, migrations
│   └── index.ts
└── package.json
```

## Data Model

### Statuses

| Column    | Type    | Notes                          |
|-----------|---------|--------------------------------|
| id        | integer | PK                             |
| name      | text    | e.g. "Applied", "First Interview" |
| color     | text    | hex color for UI               |
| sortOrder | integer | display ordering               |

Default statuses: Saved, Applied, Resume Screened, Phone Screen, First Interview, Technical Interview, Final Interview, Offer Received, Accepted, Rejected, Withdrawn.

User can add new statuses at any time.

### Jobs

| Column         | Type    | Notes                        |
|----------------|---------|------------------------------|
| id             | integer | PK                           |
| company        | text    | company name                 |
| jobTitle       | text    | role title                   |
| website        | text    | job listing URL              |
| jobDescription | text    | saved JD text                |
| contactPerson  | text    | recruiter/HR/referral name   |
| contactLink    | text    | LinkedIn URL or email        |
| currentStatus  | text    | latest status for quick filter |
| deadline       | text    | application deadline date    |
| notes          | text    | freeform notes               |
| createdAt      | text    | ISO timestamp                |

### Job Status History

| Column        | Type    | Notes                          |
|---------------|---------|--------------------------------|
| id            | integer | PK                             |
| jobId         | integer | FK → Jobs                      |
| status        | text    | status at this point           |
| changedAt     | text    | ISO timestamp                  |
| contactPerson | text    | who you interacted with        |
| contactLink   | text    | their LinkedIn/email           |
| note          | text    | optional note for this change  |

### Job Prep Todos

| Column    | Type    | Notes                |
|-----------|---------|----------------------|
| id        | integer | PK                   |
| jobId     | integer | FK → Jobs            |
| content   | text    | todo description     |
| completed | boolean | done or not          |
| createdAt | text    | ISO timestamp        |

### Interview Questions

| Column    | Type    | Notes                     |
|-----------|---------|---------------------------|
| id        | integer | PK                        |
| question  | text    | the interview question    |
| answer    | text    | your prepared answer      |
| label     | text    | category tag              |
| createdAt | text    | ISO timestamp             |

## Pages

### 1. Dashboard

Home screen — quick overview of the entire job search.

**Layout (desktop):**

```
┌─────────────────┬──────────────────────┐
│  Summary Cards  │     Pie Chart        │
│  (vertical      │                      │
│   stack)        │                      │
│                 │                      │
│  Total: 26      │      [chart]         │
│  Active: 8      │                      │
│  Interviews: 3  │                      │
│  Offers: 1      │                      │
├─────────────────┴──────────────────────┤
│            Calendar (full width)        │
│                                         │
│  Shows:                                 │
│  - Past status changes (colored dots)   │
│  - Upcoming interviews (highlighted)    │
│  - Application deadlines (distinct)     │
└─────────────────────────────────────────┘
```

**Layout (mobile):** Stacks vertically — cards, pie chart, calendar (agenda view on small screens).

**Interactions:**
- Click pie chart slice to filter/jump to those jobs in journal
- Click calendar day to see all events for that date

### 2. Job Journal

Manage all jobs and dig into details.

**List view:**
- Table/list of all jobs, sortable by date, status, company
- Each row: company, job title, status badge, deadline, contact person
- Filter by status, search by company/title
- "+ Add Job" button

**Detail view:**

```
┌──────────────────────────────────────────┐
│  Google — Senior Frontend Engineer       │
│  Status: [First Interview]               │
│  Contact: Sarah Lin · Deadline: Mar 20   │
│  Website: jobs.google.com/...            │
│                                          │
│  [Timeline] [Prep] [JD] [Notes]          │
├──────────────────────────────────────────┤
│  (selected tab content)                  │
└──────────────────────────────────────────┘
```

**Tabs:**
- **Timeline** (default) — status history with contacts per change
- **Prep** — todo checklist for pre-application preparation
- **JD** — saved job description text
- **Notes** — freeform text area

Header always visible: company, title, status, contact, deadline, website.

### 3. Mock Interview

Practice interview questions with TTS.

**List view:**
- All questions, filterable by label (Behavioral, Technical, System Design, custom)
- Each card: question text, label badge, answer preview
- Search by keyword
- "+ Add Question" button

**Question view:**
- Label badge
- Question text
- Editable answer text area
- "Play Answer" button — browser TTS reads the answer
- TTS speed control (slow for pronunciation, normal for flow)

Labels are customizable — add your own anytime.

## Key Behaviors

- **Configurable statuses:** Add/rename/reorder statuses anytime
- **Saved jobs flow:** Find JD → save as "Saved" → add prep todos → set deadline → deadline shows on calendar → complete todos → apply → move to "Applied"
- **Calendar events:** Three types — status changes (past), upcoming interviews, application deadlines (each visually distinct)
- **Mobile responsive:** All pages stack vertically on small screens, calendar switches to agenda view
- **No authentication:** Personal tool, single user
- **Data persistence:** SQLite on server, syncs across devices

## Future Considerations (not in v1)

- Practice mode for mock interviews (random question, hidden answer)
- Export to CSV
- Reminder/follow-up nudges
- Weekly stats insights
