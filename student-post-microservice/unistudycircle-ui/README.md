# UniStudyCircle UI

Small React/Vite frontend for the UniStudyCircle IAM authentication flow.

## Included
- React + TypeScript + Vite
- OAuth2/OIDC Authorization Code + PKCE
- IAM authority: http://localhost:8085
- Browser origin: http://localhost:3000
- API Gateway: http://localhost:8080
- Login/logout and authenticated dashboard
- Initial Admin/Student navigation
- Placeholder pages for Users, Topics, Profile and Create Topic

Student/Topic API endpoint names are deliberately not invented.

## Required IAM client
Create a separate public OAuth client:
- client_id: iam-test-ui
- authentication: none / public client
- grant: authorization_code
- redirect URI: http://localhost:3000/auth/callback
- post logout redirect URI: http://localhost:3000/
- scope: openid profile
- PKCE: S256

Do not put a client secret in this React app.

## Run
Node.js 20+
npm install
npm run dev

Open http://localhost:3000
