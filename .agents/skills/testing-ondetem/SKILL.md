# Testing Skill: Onde Tem? PWA

## Project Structure

- `server.js` — Express server (repo root)
- `public/` — All frontend files (HTML, CSS, JS, images, manifest)
- `package.json` — Dependencies: express, helmet, cors, express-rate-limit, dotenv
- `.env` — Environment variables (not committed; copy from `.env.example`)

## Devin Secrets Needed

None required for local testing. The server uses environment variables for admin credentials which can be set inline:
```
ADMIN_EMAIL=test@test.com ADMIN_PASSWORD=testpass
```

## Local Development Setup

```bash
cd /home/ubuntu/repos/ondetem
npm install
ADMIN_EMAIL=test@test.com ADMIN_PASSWORD=testpass node server.js
# Server runs on http://localhost:3000
```

## Testing Security Controls (curl)

These are the key server-side security tests. Run them against `http://localhost:3000`.

### Blocked file access
```bash
curl -s -w "\nHTTP:%{http_code}" http://localhost:3000/server.js
# Expected: 403 {"erro":"Acesso negado."}
curl -s -w "\nHTTP:%{http_code}" http://localhost:3000/.env
# Expected: 403
curl -s -w "\nHTTP:%{http_code}" http://localhost:3000/package.json
# Expected: 403
```

### Auth token randomness
```bash
# Two logins should produce different 64-char hex tokens
curl -s -X POST http://localhost:3000/api/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"test@test.com","senha":"testpass"}'
```

### Protected API routes
```bash
# Without token → 401
curl -s http://localhost:3000/api/agendamentos
# With token → 200
curl -s -H "Authorization: Bearer <token>" http://localhost:3000/api/agendamentos
```

### Rate limiting
```bash
# After 10 requests to /api/login, subsequent requests return 429
for i in $(seq 1 11); do
  curl -s -w "|%{http_code}" -X POST http://localhost:3000/api/login \
    -H 'Content-Type: application/json' \
    -d '{"email":"wrong@test.com","senha":"wrong"}'
  echo
done
```

### Security headers
```bash
curl -s -I http://localhost:3000/ | grep -iE "(x-content-type|x-frame|content-security-policy|strict-transport)"
# Expected: CSP, X-Content-Type-Options: nosniff, X-Frame-Options: SAMEORIGIN, HSTS
```

## Testing Frontend (Browser)

### XSS prevention
1. Open `http://localhost:3000/` in browser
2. Type `<img src=x onerror=alert(1)>` into the search bar
3. Verify the payload appears as escaped literal text in the "no results" message
4. No alert dialog should appear

### Regression after structural changes
- Homepage (`/`): Should show header, hero text, 6 category icons, 3 salon cards, map
- Agendamentos (`/agendamentos`): Should show header, stats cards, filter buttons, empty state
- Login (`/login`): Should render the login form

## Notes

- The rate limiter is per-window (15 min), so if running multiple test suites, earlier requests count toward the limit. Restart the server to reset.
- No database — all data is in-memory (server) or localStorage (client).
- The auth token system is a placeholder (not JWT). Token validation only checks length ≥ 16.
