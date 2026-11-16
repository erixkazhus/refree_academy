# FIBA Referee Academy

Video-assisted FIBA Basketball Rulebook learning platform built with **Java 21 + Spring Boot 3**, **React + TypeScript + Vite**, and **PostgreSQL**, styled using the `nike` design system in [`DESIGN.md`](./DESIGN.md).

## Features
- **Side-by-Side Video & Rulebook Evaluation**: Every question displays its associated match foul/violation video right next to the prompt (`0.5x` Slow-Mo, `1.0x` Normal, Replay), visible to all users.
- **Per-Answer Rulebook Explanations**: Selecting any option reveals the Official FIBA Basketball Rules & OBRI explanation directly beneath that answer explaining why it is correct or why it is incorrect.
- **Dedicated Login & Registration Pages**: Separate **Login** (`/login`) and **Register** (`/register`) buttons in the header.
- **Two Roles (`USER` & `ADMIN`)**:
  - `USER`: Studies cases, answers questions, and tracks accuracy.
  - `ADMIN`: Accesses `/admin` (Admin Studio) to create/edit/delete questions, edit per-option explanations, and upload `.mp4` / `.webm` foul videos.
- **Brief Platform Overview & Legal Footer**: Home page explains what the platform is, what it does, and why it is useful; footer links to `/privacy`, `/terms`, and `/security`.

## Security Protections
- **SQL Injection Defense**: Parameterized JPQL queries (`@Query` with `@Param`) and Jakarta Bean Validation (`@Valid`) across all endpoints; `spring.jackson.deserialization.fail-on-unknown-properties=true`.
- **DDoS & Brute-Force Mitigation**: Memory-bounded per-IP `RateLimitingFilter` (`12 req/min` on `/api/auth/login` & `/api/auth/register`, `120 req/min` on `/api/**`, returning HTTP `429` with `Retry-After`), Tomcat `max-connections` & thread limits, `8KB` max header size, and `50MB` max video upload bounds.
- **Authentication & RBAC**: BCrypt password hashing (cost `12`), JWT signed with HMAC-SHA stored in `HttpOnly`, `SameSite=Lax` cookies, strict server-side `Role.USER` assignment on registration, and `@PreAuthorize("hasRole('ADMIN')")` on `/api/admin/**`.
- **Safe Video Uploads**: Validates both MIME type (`video/mp4`, `video/webm`) and binary file magic bytes (`ftyp` / EBML), generates UUID filenames, and enforces canonical path containment to block path traversal.

---

## Prerequisites & Installation Instructions

Currently detected on this machine: **Node.js v26+**, **npm 11+**, and **Docker 29+**.

### Option A — Run PostgreSQL + Backend with Docker (Fastest, no Java/Maven install needed)
Make sure Docker Desktop is running, then from `fiba-referee-academy`:
```powershell
docker compose up -d --build
```
This starts:
- **PostgreSQL 16** on `localhost:5432` (`fiba_referee_db`)
- **Spring Boot Backend** on `http://localhost:8080` (with seeded demo users and 5 official FIBA video cases)

### Option B — Install Java 21 & Maven Locally (if running backend outside Docker)
1. Install **Eclipse Temurin JDK 21** and **Apache Maven**:
   ```powershell
   winget install EclipseAdoptium.Temurin.21.JDK
   winget install Apache.Maven
   ```
2. Open a new terminal so `java` and `mvn` are on your `PATH`, start PostgreSQL via Docker:
   ```powershell
   docker compose up -d postgres
   ```
3. Run the Spring Boot backend:
   ```powershell
   cd backend
   mvn spring-boot:run
   ```

### Run the React + TypeScript Frontend
```powershell
cd frontend
npm install
npm run dev
```
Open **http://localhost:5173** in your browser. Vite proxies `/api/*` requests to `http://localhost:8080`.

---

## Seeded Local Accounts
- **User (`ROLE_USER`)**: `referee@fibaref.org` / `RefereeFiba#2026!`
- **Admin (`ROLE_ADMIN`)**: `admin@fibaref.org` / `AdminFiba#2026!`
