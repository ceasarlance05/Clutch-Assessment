# Northstar Events — Live Registration Report

A real-time executive dashboard built for the Northstar Events team to track registration pacing, status breakdowns, and event health at a glance.

🌐 **Live Website:** [https://clutch-assessment.vercel.app/](https://clutch-assessment.vercel.app/)

---

## What This Dashboard Shows

* **At-a-Glance Metrics:** Summary cards at the top track total scheduled events, target capacities, yield rates, pending approvals, and events needing attention.
* **Status Breakdown:** Every event card breaks down registrations into **Accepted**, **Pending**, and **Cancelled** with visual progress bars.
* **Attendee Drill-Down:** Click on any event card to open a side panel showing the full roster of registered attendees, their companies, and email addresses.
* **Needs Attention Alerts:** Automatically flags events that are falling behind their registration targets so the team can step in.
* **Dark & Light Mode:** Toggle the sun/moon icon at the top right to switch viewing themes.

---

## How It Stays Up to Date Automatically

* **Google Drive Integration:** The dashboard connects directly to live tracking files (`registrations.csv` and `events.json`) stored in Google Drive.
* **Real-Time Syncing:** Whenever new registrations are added to Google Drive, the dashboard automatically pulls the fresh data (it checks every minute, or you can click the refresh button at the top).

---

## Automated Morning Team Alerts

* **Morning Pacing Reports:** An automated background script checks event pacing every weekday morning and sends a summary alert report to our team chat webhook if any events are falling behind.
* **Manual Trigger:** You can click the **"Notify Slack"** button at the top of the dashboard anytime to manually trigger a test notification.

---

## Tech Stack

* **Frontend:** React (Vite) + Tailwind CSS (via CDN styling) for fast loading and responsive UI components.
* **Icons:** Lucide React icons for clean operational visual indicators.
* **Backend Integration:** Google Apps Script Web App (JSON Endpoint).
* **Hosting:** Vercel / Netlify (Continuous deployment tied to `main`).

---

## How to Run Locally

If you need to view or run the project locally on your computer:

1. Open your terminal in the project folder.
2. Install dependencies:
   
   npm install
  
3. Start the development server:
   
   npm run dev
   
4. Open your browser and go to `http://localhost:5173`.