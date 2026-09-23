# CodeHelp

A minimal, practical 2020-era developer-to-developer web platform where engineers share broken coding projects from hackathons or personal work, and peer developers download the reproducible project, fix the bug, and submit a working solution. When the problem author accepts the fix, the solver earns +1 point on the global leaderboard.

---

## 1. Project Description

CodeHelp strips away modern landing-page fluff, complex animations, and glowing cards in favor of a clean, high-utility developer tool:
- **Post a problem**: Provide a title, clear issue description, and upload a reproducible project `.zip` archive.
- **Download & Inspect**: Peer solvers download the raw project files.
- **Submit Solution**: Solvers submit their fixed project as a `.zip` archive.
- **Acceptance & Scoring**: Original authors review submitted fixes and click **Accept This Fix** (only 1 accepted solution allowed per problem). Accepting awards the solver **+1 point** and marks the problem **Solved**.
- **Deterministic Leaderboard**: Ranks developers by score, followed by accepted solution count, and account registration date.

---

## 2. Features

- **Full-Stack Architecture**: Single unified service running an Express API backend with Vite React frontend middleware.
- **Secure File Uploads & Downloads**: Controlled `.zip` handling with MIME validation, server-side filename hashing, and streamed attachment downloads.
- **Role & Ownership Authorization**:
  - Only problem authors can accept solutions for their own problems.
  - Solvers cannot accept their own solutions.
  - Prevent multiple solutions from being accepted for the same problem.
- **Deterministic Leaderboard**: Instant score calculations and tie-breaking.
- **Authentication**: JWT/Bearer session support with registration, login, logout, and test developer profile switching (Alex, Sam, Bibek, Sarah, David).
- **2020-Era Minimal UI**: Crisp 1px borders, white background, monospace terminal illustration, standard system typography, fully responsive across mobile, tablet, and desktop.

---

## 3. Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide React icons
- **Backend**: Node.js, Express 4, TypeScript (via `tsx`)
- **File Handling**: Multer for ZIP validation and storage, streaming responses for downloads
- **Database & Storage**: Atomic persistent JSON document store with seed data and auto-generated valid ZIP archives
- **Bundler**: Vite 8

---

## 4. Installation Steps

Clone the repository and install dependencies:

```bash
npm install
```

---

## 5. Environment Variables

Create a `.env` file based on `.env.example`:

```env
PORT=3000
NODE_ENV=development
```

---

## 6. Database Setup

The database is powered by an atomic persistent JSON repository located at `data/database.json`. 
On first run, the database automatically initializes folders and seeds sample developers and problems:
- `data/` - Database JSON storage
- `uploads/projects/` - Uploaded original project ZIPs
- `uploads/solutions/` - Uploaded solution ZIPs

To reset the database to initial seed data at any time, simply delete `data/database.json` and restart the server.

---

## 7. How to Run Frontend & Backend

Because the application is configured as a full-stack integrated service:

```bash
# Starts Express backend and Vite frontend together on port 3000
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build & Run

```bash
npm run build
npm start
```
