# StudyMate — Codebase Architecture

High-level and detailed views of the StudyMate application (React frontend + Express backend), aligned with the **current** repository layout.

---

## 1. System overview

```mermaid
flowchart TB
    subgraph Client["Frontend (React + Vite + Tailwind)"]
        Browser[Browser]
        ThemeCtx[ThemeContext]
        Pages[Pages + Layouts]
        AuthCtx[AuthContext]
        API[apiFetch / useApi]
    end

    subgraph Backend["Backend (Express)"]
        API_GW[API Routes]
        AuthMW[auth middleware]
        Ctrl[Controllers]
        AI_Module[AI module]
    end

    subgraph Data["Data & external"]
        MongoDB[(MongoDB)]
        Gemini[Gemini API]
    end

    Browser --> ThemeCtx
    ThemeCtx --> Pages
    Pages --> AuthCtx
    Pages --> API
    API -->|"HTTP + JWT"| API_GW
    API_GW --> AuthMW
    AuthMW --> Ctrl
    Ctrl --> MongoDB
    Ctrl --> AI_Module
    AI_Module --> Gemini
```

**Session & theme (client):**

- **Auth:** Access token and minimal user payload are stored in `localStorage` (`studymate-access-token`, `studymate-user`). Refresh token stays in an **httpOnly** cookie. On app init, if a stored access token exists, the client skips an immediate refresh round-trip (faster load); otherwise it calls `POST /api/auth/refresh`.
- **Theme:** `ThemeProvider` toggles the `dark` class on `<html>` and persists preference in `localStorage` (`studymate-theme`). `index.html` includes a small inline script to apply `dark` before React hydrates (reduces light flash).

---

## 2. Backend structure

```mermaid
flowchart LR
    subgraph Routes["Routes (app.js)"]
        R_auth["/api/auth"]
        R_notes["/api/notes"]
        R_quiz["/api/quiz"]
        R_ai["/api/ai"]
    end

    subgraph Auth["auth.js"]
        register[POST /register]
        login[POST /login]
        refresh[POST /refresh]
        logout[POST /logout]
    end

    subgraph Notes["notes.js"]
        N_get[GET /]
        N_getId[GET /:id]
        N_post[POST /]
        N_put[PUT /:id]
        N_del[DELETE /:id]
    end

    subgraph Quiz["quiz.js"]
        Q_submit[POST /:noteId/submit]
        Q_results[GET /results]
        Q_id[GET /:id]
    end

    subgraph AI_r["ai.js"]
        AI_gen[POST /generate]
        AI_quiz[POST /quiz]
        AI_limit["rate limit (per IP)"]
    end

    subgraph Controllers["Controllers"]
        authCtrl[authController]
        notesCtrl[notesController]
        quizCtrl[quizController]
        aiCtrl[aiController]
    end

    subgraph Models["Models"]
        User[(User)]
        Note[(Note)]
        QuizResult[(QuizResult)]
    end

    subgraph AI["AI layer"]
        gemini[geminiClient]
        retry[aiRetry]
        parser[aiResponseParser]
        config[quizConfig]
    end

    R_auth --> Auth
    R_notes --> Notes
    R_quiz --> Quiz
    R_ai --> AI_r

    Auth --> authCtrl
    Notes --> auth
    Notes --> notesCtrl
    Quiz --> auth
    Quiz --> quizCtrl
    AI_r --> auth
    AI_r --> aiCtrl
    AI_r --> AI_limit

    authCtrl --> User
    notesCtrl --> Note
    quizCtrl --> QuizResult
    quizCtrl --> Note
    aiCtrl --> Note
    aiCtrl --> AI
    AI --> gemini
    AI --> retry
    AI --> parser
    AI --> config
```

**Quiz submit (`POST /api/quiz/:noteId/submit`):** Accepts `answers` and `isFirstSubmission`. The backend evaluates against `note.quizQuestions`, returns `evaluatedAnswers` (including `correctAnswer` for feedback). Statistics are **cumulative per “attempt session”**: `attemptCorrectCount` / `attemptAnsweredCount` grow across batch submits until the next `isFirstSubmission: true`. `bestScore` and `bestAttemptCorrectCount` / `bestAttemptAnsweredCount` use a tie-break when percentages are equal (prefers more questions answered).

---

## 3. Frontend structure

```mermaid
flowchart TB
    subgraph Entry["main.jsx"]
        ThemeProvider[ThemeProvider]
        AuthProvider[AuthProvider]
        BrowserRouter[BrowserRouter]
        Routes[Routes]
    end

    subgraph Layouts["Layouts"]
        AuthLayout[AuthLayout — login/register + ThemeToggle]
        AppLayout[AppLayout — Header + main]
    end

    subgraph PagesGroup["Pages"]
        Pages[LoginPage, RegistrationPage, MainPage, NotesPage, NoteDetailPage]
    end

    subgraph Public["Public routes"]
        Login["/ → LoginPage"]
        Register["/register → RegistrationPage"]
    end

    subgraph Private["Private routes (PrivateRoute)"]
        Home["/home → MainPage"]
        NotesList["/notes → NotesPage"]
        NoteDetail["/notes/:id → NoteDetailPage"]
    end

    subgraph Context["Context"]
        AuthContext[AuthContext]
        ThemeContext[ThemeContext]
    end

    subgraph Shared["Shared components"]
        Header[Header — nav, ThemeToggle, logout]
        Quiz[Quiz — batches, evaluate, stats]
        ThemeToggle[ThemeToggle]
        PrivateRoute[PrivateRoute]
    end

    subgraph Utils["Utils & hooks"]
        apiFetch[apiFetch]
        useApi[useApi]
        useAuth[useAuth]
    end

    Entry --> Layouts
    Layouts --> Public
    Layouts --> Private
    ThemeProvider --> ThemeContext
    AuthProvider --> AuthContext
    Private --> Shared
    Pages --> apiFetch
    Pages --> useApi
    Pages --> useAuth
```

**UI:** Tailwind `dark:` variants drive light/dark styling. Accent colors are aligned (e.g. orange in light mode, green in dark mode for primary emphasis).

---

## 4. Data model relationships

```mermaid
erDiagram
    User ||--o{ Note : "has"
    User ||--o{ QuizResult : "has"
    Note ||--o{ QuizResult : "used in"

    User {
        ObjectId _id
        string name
        string email
        string passwordHash
        date createdAt
    }

    Note {
        ObjectId _id
        ObjectId userId
        string title
        string content
        string summary
        array quizQuestions
        date createdAt
    }

    QuizResult {
        ObjectId _id
        ObjectId userId
        ObjectId noteId
        number attemptsCount
        number bestScore
        number lastScore
        number attemptCorrectCount
        number attemptAnsweredCount
        number bestAttemptCorrectCount
        number bestAttemptAnsweredCount
        date updatedAt
    }
```

Per-note quiz answers are **not** stored as a long-lived array on `QuizResult`; the document holds aggregate stats and timestamps only. Individual evaluations are returned in the submit response for the client UI.

---

## 5. Request flow (authenticated)

```mermaid
sequenceDiagram
    participant P as Page
    participant API as apiFetch
    participant Auth as AuthContext
    participant BE as Express
    participant MW as auth middleware
    participant Ctrl as Controller
    participant DB as MongoDB

    P->>API: request (with refresh/logout)
    API->>BE: HTTP + Authorization: `Bearer <token>`
    BE->>MW: next()
    MW->>MW: verify JWT
    alt valid
        MW->>Ctrl: req.user set
        Ctrl->>DB: Model operations
        DB-->>Ctrl: data
        Ctrl-->>P: JSON response
    else 401
        API->>Auth: refreshAccessToken()
        Auth->>BE: POST /api/auth/refresh
        BE-->>Auth: new accessToken
        API->>BE: retry with new token
    end
```

---

## 6. File layout (project roots)

```
StudyMate/
├── ARCHITECTURE.md
├── README.md
├── package.json              # root devDependencies (e.g. Tailwind / PostCSS)
├── package-lock.json
├── study-mate-frontend/
│   ├── index.html              # + inline theme bootstrap (dark class)
│   └── src/
│       ├── main.jsx            # ThemeProvider, AuthProvider, routes, layouts
│       ├── App.jsx             # Minimal shell (not used as router root)
│       ├── index.css           # Tailwind entry
│       ├── contexts/
│       │   ├── AuthContext.jsx # localStorage tokens/user, refresh, init
│       │   └── ThemeContext.jsx
│       ├── layouts/
│       │   ├── AuthLayout.jsx
│       │   └── AppLayout.jsx
│       ├── components/
│       │   ├── Header.jsx
│       │   ├── PrivateRoute.jsx
│       │   ├── Quiz.jsx
│       │   └── ThemeToggle.jsx
│       ├── pages/
│       │   ├── LoginPage.jsx
│       │   ├── RegistrationPage.jsx
│       │   ├── MainPage.jsx
│       │   ├── NotesPage.jsx
│       │   └── NoteDetailPage.jsx
│       ├── hooks/
│       │   └── useApi.js
│       └── utils/
│           └── apiFetch.js
│
└── study-mate-backend/
    ├── app.js                  # Express app, CORS, route mounting
    ├── bin/www
    ├── config/
    │   ├── db.js               # MongoDB connection
    │   └── quizConfig.js       # AI quiz defaults
    ├── middleware/
    │   └── auth.js             # JWT verification
    ├── routes/
    │   ├── auth.js
    │   ├── notes.js
    │   ├── quiz.js
    │   └── ai.js
    ├── controllers/
    │   ├── authController.js
    │   ├── notesController.js
    │   ├── quizController.js
    │   └── aiController.js
    ├── models/
    │   ├── User.js
    │   ├── Note.js
    │   └── QuizResult.js
    ├── ai/
    │   ├── geminiClient.js
    │   ├── aiRetry.js
    │   └── aiResponseParser.js
    └── utils/
        └── responseHandler.js
```
