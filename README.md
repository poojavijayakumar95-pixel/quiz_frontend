# QuizFlow — Frontend

A modern, dark-themed quiz application frontend built with **React + Vite + Tailwind CSS**.  
Connects to the QuizFlow Spring Boot backend via REST APIs with JWT authentication.

**Live URL:** https://quizapplication-frontend.netlify.app/
**Backend Live API:** https://quizbackend-production-b31f.up.railway.app/api
**Swagger UI:** https://quizbackend-production-b31f.up.railway.app/swagger-ui/index.html

---

## Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| React | 19.x | UI framework |
| Vite | 8.x | Build tool & dev server |
| React Router DOM | 7.x | Client-side routing |
| Axios | 1.x | HTTP requests |
| Tailwind CSS | 4.x | Utility-first styling |

---

## Project Structure

```
quiz-frontend/
├── public/
│   └── _redirects          # Netlify SPA routing fix
├── src/
│   ├── api/
│   │   └── axios.js        # Axios instance with JWT interceptor
│   ├── pages/
│   │   ├── Login.jsx        # Login page
│   │   ├── Register.jsx     # Registration with role selection
│   │   ├── AdminDashboard.jsx  # Quiz CRUD for admins
│   │   ├── QuizList.jsx     # Available quizzes for participants
│   │   ├── TakeQuiz.jsx     # Quiz taking with timer
│   │   └── QuizHistory.jsx  # Past attempts and scores
│   ├── App.jsx              # Router, Navbar, Protected routes
│   ├── main.jsx             # React entry point
│   └── index.css            # Global styles + dark theme
├── index.html
├── package.json
└── vite.config.js
```

---

## Prerequisites

- **Node.js** v18 or higher
- **npm** v9 or higher
- QuizFlow **backend running** on `http://localhost:8080`

---

## Getting Started

### 1. Clone / Download the project

```bash
cd quiz-frontend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the development server

```bash
npm run dev
```

The app will be available at **http://localhost:5173**

---

## Available Scripts

| Script | Command | Description |
|---|---|---|
| Dev server | `npm run dev` | Start local development server |
| Build | `npm run build` | Create production build in `dist/` |
| Preview | `npm run preview` | Preview the production build locally |
| Lint | `npm run lint` | Run ESLint checks |

---

## Environment & Configuration

The API base URL is set in `src/api/axios.js`:

```js
const api = axios.create({
  baseURL: 'http://localhost:8080/api',
});
```

Change this URL if your backend runs on a different host or port.

---

## Features

### Authentication
- **Login** — Email + password with JWT token storage
- **Register** — Username, email, password, role selection (Admin / Participant)
- **Auto logout** — 401 responses automatically clear token and redirect to login
- **Protected routes** — Role-based access (ADMIN / PARTICIPANT)

### Admin Dashboard
- Create quizzes with multiple questions and options
- Each question supports up to 6 answer options
- Mark correct answers per question
- Edit and delete existing quizzes
- Reorder questions with up/down controls
- Live validation before submission

### Participant Features
- Browse all available quizzes
- Take a quiz with a countdown timer
- Auto-submit when time runs out
- View score, percentage, and pass/fail result
- Question navigation dots to jump between questions
- View complete quiz attempt history with stats

---

## User Roles

| Role | Access |
|---|---|
| `ADMIN` | Create, edit, delete quizzes |
| `PARTICIPANT` | Browse quizzes, take quizzes, view history |

---

## Deployment (Netlify)

1. Build the project:
   ```bash
   npm run build
   ```

2. Deploy the `dist/` folder to Netlify.

3. The `public/_redirects` file handles React Router SPA routing:
   ```
   /*    /index.html   200
   ```
   This file is **required** — without it, direct URL access and page refresh will return 404.

4. Update the `baseURL` in `src/api/axios.js` to your deployed backend URL before building.

---

## Default Demo Credentials

| Email | Password | Role |
|---|---|---|
| admin@quiz.com | Test@1234 | ADMIN |
| alice@quiz.com | Test@1234 | PARTICIPANT |
| bob@quiz.com | Test@1234 | PARTICIPANT |

---

