# IAM Service

Standalone Identity and Access Management service for the `student-post-microservice` project.

This first version is intentionally standalone. It is **not connected to Eureka, Config Server, API Gateway, Student Service, or Topic Service yet**.

## What it provides

- User registration
- BCrypt password hashing
- Database-backed users
- Roles: `STUDENT`, `ADMIN`, `MODERATOR`
- Spring Security authentication
- OAuth 2.0 Authorization Server
- OpenID Connect
- JWT access tokens
- RSA signing key
- JWKS endpoint
- Authorization Code + Refresh Token grants
- MySQL persistence for users

## Project assumptions

The existing project uses:

- Java 21
- Spring Boot 3.4.0
- Spring Cloud 2024.0.x

This service runs independently on:

`http://localhost:8085`

It deliberately does not use the Config Server yet.

## 1. Create the database

MySQL can create the database automatically because of `createDatabaseIfNotExist=true`, but create it explicitly if preferred:

```sql
CREATE DATABASE iam_db;
```

Then edit:

```text
src/main/resources/application.yml
```

Set your MySQL username/password.

## 2. Start the service

```bash
mvn spring-boot:run
```

Or run `IamServiceApplication` from IntelliJ.

Check:

```bash
curl http://localhost:8085/actuator/health
```

Expected:

```json
{"status":"UP"}
```

## 3. Register a student

```bash
curl -X POST http://localhost:8085/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john",
    "email": "john@example.com",
    "password": "password123"
  }'
```

New users are deliberately created as `STUDENT`.

The seeded development admin is:

```text
username: admin
password: admin123
role: ADMIN
```

**Change/remove this development credential before any real deployment.**

## 4. OAuth endpoints

The authorization server exposes standard endpoints including:

```text
GET  /oauth2/authorize
POST /oauth2/token
GET  /oauth2/jwks
GET  /.well-known/openid-configuration
GET  /userinfo
```

The exact endpoint metadata is available from:

```text
http://localhost:8085/.well-known/openid-configuration
```

## 5. Development OAuth client

A development client is registered in memory:

```text
client_id: student-web
client_secret: student-web-secret
redirect_uri: http://127.0.0.1:8080/login/oauth2/code/student-web
```

Scopes:

```text
openid
profile
student:read
student:write
topic:read
topic:create
```

This client is only here to make the standalone IAM service testable. We can move client registrations into MySQL when we integrate the real frontend.

## 6. Important development limitation

The RSA signing key is generated when the application starts.

That is convenient for development, but it means all issued JWTs become invalid after an IAM restart.

For the production design, replace this with a persistent key strategy and key rotation.

## 7. Architecture

```text
                   ┌───────────────────┐
                   │    Frontend       │
                   └─────────┬─────────┘
                             │
                             │ OAuth2 / OIDC
                             ▼
                   ┌───────────────────┐
                   │    IAM Service    │
                   │                   │
                   │ Authentication    │
                   │ User management   │
                   │ Roles             │
                   │ Token issuance     │
                   │ JWT signing       │
                   │ JWKS              │
                   └─────────┬─────────┘
                             │
                             ▼
                        ┌──────────┐
                        │  MySQL   │
                        │  iam_db  │
                        └──────────┘
```

## Next integration step

After verifying this service independently, integrate it with the existing system in this order:

1. Make API Gateway an OAuth2 Resource Server.
2. Make Student Service an OAuth2 Resource Server.
3. Make Topic Service an OAuth2 Resource Server.
4. Configure all three to validate IAM-issued JWTs.
5. Add method-level authorization using roles/authorities.
6. Move the IAM service configuration into Config Server.
7. Register IAM with Eureka if desired.
8. Restrict Config Server and Discovery Server to internal traffic.
9. Replace the development RSA key and default admin credential.

The goal is:

```text
Browser
   |
   | Bearer JWT
   v
API Gateway
   |
   +----> Student Service
   |
   +----> Topic Service

IAM Service
   |
   +----> issues JWTs
   +----> owns users/roles
   +----> publishes JWKS
```

The Gateway and downstream services will validate JWTs locally; they do not need to call IAM for every request.
