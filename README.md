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

### Expected console messages and a common 500

- A `401` from `/api/auth/me` on first load is **normal**. It is the app asking
  “is anyone signed in?” before showing the login page.
- If `/api/auth/login` starts returning `500` right after you recompile the
  backend, the running JVM is mixing old and new classes. Stop the backend and
  start it again (in IntelliJ: stop the run configuration, then Run). Do not
  rebuild into `target/classes` while the old process is still serving traffic.

## Render deployment (split frontend + backend)

The production deployment uses two Render services:

| Service  | URL |
| -------- | --- |
| Frontend | <https://nabha-digital-learning-q5z8.onrender.com/> |
| Backend  | <https://nabha-digital-learning-backend.onrender.com> |

### Backend environment variables

| Variable        | Value / notes |
| --------------- | ------------- |
| `MONGODB_URI`   | MongoDB connection string. Falls back to the Atlas demo cluster if unset. |
| `JWT_SECRET`    | Long random string. If unset, a random key is generated at boot and sessions end on restart. |
| `CORS_ORIGINS`  | Comma-separated extra origins. The Render frontend and localhost origins are always allowed by `SecurityConfig`, even if this value is stale. |
| `SECURE_COOKIE` | `true` on Render. The app also detects HTTPS automatically via `X-Forwarded-Proto`. |
| `PORT`          | Set by Render automatically. |

The backend allows credentials and the `X-NabhaLearn-Client` header from the
frontend origin. It returns `SameSite=None; Secure` cookies on HTTPS and also
returns a signed token on login/register, which the client sends as a Bearer
token when a browser blocks third-party cookies (Safari/Chrome).

### Frontend routing (SPA)

The frontend is a history-API single-page app. Direct visits to `/login`,
`/app/dashboard`, etc. must serve `index.html`. Apply the rewrite rule below in
the Render dashboard (**Static Site → Redirects/Rewrites**) or use the bundled
`render.yaml` Blueprint:

| Action  | Source | Destination  |
| ------- | ------ | ------------ |
| Rewrite | `/*`   | `/index.html` |

`frontend/404.html` is also provided as a fallback for static hosts that serve a
custom 404 page.

### Quick production checks

```bash
# Backend health and CORS preflight
curl -s https://nabha-digital-learning-backend.onrender.com/api/health
curl -s -o /dev/null -w "%{http_code}\n" -X OPTIONS \
  https://nabha-digital-learning-backend.onrender.com/api/auth/login \
  -H 'Origin: https://nabha-digital-learning-q5z8.onrender.com' \
  -H 'Access-Control-Request-Method: POST' \
  -H 'Access-Control-Request-Headers: content-type,x-nabhaleam-client,authorization'

# The preflight must return 200 with Access-Control-Allow-Origin and
# Access-Control-Allow-Credentials: true. The SPA deep link must return 200.
curl -s -o /dev/null -w "%{http_code}\n" https://nabha-digital-learning-q5z8.onrender.com/login
```
