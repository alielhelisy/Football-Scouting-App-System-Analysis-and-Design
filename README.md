# Football Scouting Web Application
### System Analysis and Design — Spring 2026
**Student:** Ali El-Helisy | **ID:** 220303928

---

## Project Overview

A full-stack web application for football scouts to manage players and record match reports.
Built as a Single-Page Application (SPA) with a RESTful Node.js/Express backend and a SQL Server database.

---

## Tech Stack

| Layer       | Technology                        |
|-------------|-----------------------------------|
| Backend     | Node.js + Express                 |
| Database    | Microsoft SQL Server (SQLEXPRESS) |
| Frontend    | Vanilla JavaScript SPA            |
| API Docs    | Swagger UI (OpenAPI 3.0)          |
| Testing     | Jest                              |

---

## Project Structure

```
scouting_app/
├── src/
│   ├── server.js          ← Entry point, starts the HTTP server
│   ├── app.js             ← Express app, middleware, route mounting
│   ├── db.js              ← SQL Server connection + schema init
│   ├── logic.js           ← Pure business logic functions (testable)
│   ├── swagger.js         ← Swagger/OpenAPI spec config
│   └── routes/
│       ├── players.js     ← Player CRUD + nested report endpoints
│       └── reports.js     ← Standalone report DELETE endpoint
├── public/
│   ├── index.html         ← SPA shell
│   ├── app.js             ← Vanilla JS SPA logic
│   └── style.css          ← All styles
├── tests/
│   └── logic.test.js      ← 37 Jest unit tests
└── package.json
```

---

## Database Schema

```sql
players
  id       INT IDENTITY(1,1) PK
  name     NVARCHAR(100) NOT NULL
  team     NVARCHAR(100) NOT NULL
  position NVARCHAR(20)  NOT NULL  -- CB | FB | 6ER | 8ER | WIDE | CF

reports
  id             INT IDENTITY(1,1) PK
  player_id      INT FK -> players(id) ON DELETE CASCADE
  rating         INT            -- 1–5
  minutes_played INT
  goals_scored   INT
  received_cards NVARCHAR(10)   -- None | Yellow | Red
  comments       NVARCHAR(MAX)
  created_at     DATETIME DEFAULT GETDATE()
```

---

## Prerequisites

- Node.js (v22+)
- Microsoft SQL Server Express (SQLEXPRESS instance)
- SQL Server Browser service running

### One-time SQL Server setup

Run in SSMS:
```sql
CREATE DATABASE ScoutingAppSAD;

CREATE LOGIN scout_user WITH PASSWORD = 'Scout@123', CHECK_POLICY = OFF;

USE ScoutingAppSAD;
CREATE USER scout_user FOR LOGIN scout_user;
ALTER ROLE db_owner ADD MEMBER scout_user;
```

---

## Setup and Running

### 1. Install dependencies

```bash
cd scouting_app
npm install
```

### 2. Start the server

```bash
npm start
```

Tables are created automatically on first start.

Open the app at: **http://localhost:3000**

### 3. Swagger UI (interactive API docs)

Navigate to: **http://localhost:3000/api-docs**

### 4. Development mode (auto-restart)

```bash
npm run dev
```

---

## Running Tests

```bash
npm test
```

Tests cover all business logic functions in `src/logic.js`. Routes are not tested.

---

## API Reference

| Method | Endpoint                   | Description                             |
|--------|----------------------------|-----------------------------------------|
| GET    | `/api/players`             | Get all players (optional `?position=`) |
| POST   | `/api/players`             | Create a player                         |
| GET    | `/api/players/:id`         | Get player + reports + average rating   |
| PUT    | `/api/players/:id`         | Update a player                         |
| DELETE | `/api/players/:id`         | Delete player (cascades to reports)     |
| GET    | `/api/players/:id/reports` | Get all reports for a player            |
| POST   | `/api/players/:id/reports` | Create a match report                   |
| DELETE | `/api/reports/:id`         | Delete a report                         |

### Player — POST/PUT body

```json
{
  "name": "Mohamed Salah",
  "team": "Liverpool FC",
  "position": "WIDE"
}
```

### Report — POST body

```json
{
  "rating": 4,
  "minutes_played": 90,
  "goals_scored": 1,
  "received_cards": "None",
  "comments": "Strong pressing, two key assists"
}
```

---

## Positions

| Key  | Description      |
|------|------------------|
| CB   | Center Back      |
| FB   | Full Back        |
| 6ER  | Defensive Mid    |
| 8ER  | Box-to-Box Mid   |
| WIDE | Wide Player      |
| CF   | Center Forward   |

---

## Business Logic (src/logic.js)

| Function                  | Description                                   |
|---------------------------|-----------------------------------------------|
| `validatePlayerName`      | Not empty, max 100 chars                      |
| `validateTeam`            | Not empty, max 100 chars                      |
| `validatePosition`        | Must be one of the 6 valid positions          |
| `validateRating`          | Integer between 1 and 5                       |
| `validateNonNegativeInt`  | Integer >= 0 (used for minutes and goals)     |
| `validateCards`           | Must be None, Yellow, or Red                  |
| `computeAverageRating`    | Average of report ratings, rounded to 1 d.p.  |
| `filterPlayersByPosition` | Filter player array by position key           |
| `starsDisplay`            | Convert numeric average to star string        |

---

## Grading Checklist

- [x] Full CRUD on Players entity
- [x] Reports as a related entity (one-to-many)
- [x] Position-based search/filter
- [x] RESTful API with correct HTTP methods and status codes
- [x] JSON request/response format
- [x] Input validation on both frontend and backend
- [x] Business logic separated from routes (`src/logic.js`)
- [x] 37 Jest unit tests covering all logic functions
- [x] Swagger UI at `/api-docs`
- [x] Vanilla JS SPA — no frameworks, no page reloads
- [x] SQL Server database via SSMS
- [x] README with setup, API docs, and structure
