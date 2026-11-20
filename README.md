# Nabha Digital Learning (NabhaLearn)

A learning platform for rural school students. The backend is a Spring Boot app
that also serves the static frontend (`frontend/`) from the same origin, so the
frontend can be opened either through the backend or through VS Code Live
Server ("Go Live").

## What you need

- Java 21
- Maven
- MongoDB running on `localhost:27017`
- VS Code with the [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) extension (only for the Go Live workflow)

## Run it normally (recommended)

```bash
# 1. Make sure MongoDB is running (macOS Homebrew example)
brew services start mongodb-community

# 2. Start the app
cd backend
mvn spring-boot:run
```

Open <http://localhost:8080>. The frontend and API are both served there and the
demo data is seeded automatically on first start.

## Run it with the Go Live button

1. Start MongoDB and the backend (`cd backend && mvn spring-boot:run`) and wait
   until you see `Started NabhaLearnApplication`.
2. Open the **repository root** in VS Code (not the `frontend` folder).
3. Click **Go Live** in the status bar (or right-click `frontend/index.html` →
   **Open with Live Server**).

Live Server serves the app at <http://127.0.0.1:5500> and proxies every `/api`
request to the backend on port 8080, so sign-in, lessons, quizzes and assignments
all work with live reload.

The settings that make this work live in `.vscode/settings.json`:

- `liveServer.settings.root` → `/frontend` so the Go Live button from the repo root finds `index.html`
- `liveServer.settings.proxy` → forwards `/api` to `http://127.0.0.1:8080/api`
- `liveServer.settings.file` → `index.html` so SPA routes such as `/app/dashboard` still load on refresh

If you change the backend port, update `proxyUri` in `.vscode/settings.json`
(and in `frontend/.vscode/settings.json` if you open the `frontend` folder
directly). Stop and restart Live Server after changing its settings.

## Demo accounts

| Role    | Email                     | Password       |
| ------- | ------------------------- | -------------- |
| Student | `student@nabhaleam.local` | `Student@12345` |
| Teacher | `teacher@nabhaleam.local` | `Teacher@12345` |
| Admin   | `admin@nabhaleam.local`   | `Admin@12345`   |

These can be overridden with the `DEMO_*` environment variables listed in
`backend/src/main/resources/application.yml`.

## Manual test of the Go Live setup

With the backend running, check these from a terminal:

```bash
curl -s http://127.0.0.1:5500/api/health
curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:5500/app/dashboard   # should be 200 (SPA fallback)
```

A healthy API response means the Live Server proxy is wired correctly.
