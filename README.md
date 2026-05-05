# Football Scouting Web Application

### System Analysis and Design - Spring 2026

**Student:** Ali El-Helisy  
**ID:** 220303928

---

## Project Overview

Football Scouting Web Application is a full-stack web app for managing football players and recording scouting match reports. Scouts can add, update, delete, filter, and view players, then attach detailed match reports with ratings, minutes played, goals, cards, comments, and calculated average ratings.

The project is built as a vanilla JavaScript single-page application with a RESTful Node.js/Express backend, Microsoft SQL Server database, Swagger API documentation, and Jest unit tests.

---

## Features

- Player CRUD: create, view, update, and delete football players
- Match report management for each player
- One-to-many relationship between players and reports
- Position-based filtering
- Average rating calculation
- Frontend and backend validation
- RESTful JSON API
- Swagger UI API documentation
- SQL Server database schema auto-initialization
- Jest unit tests for business logic

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| Backend | Node.js, Express |
| Database | Microsoft SQL Server Express |
| Frontend | HTML, CSS, Vanilla JavaScript SPA |
| API Docs | Swagger UI, OpenAPI 3.0 |
| Testing | Jest |

---

## Project Structure

```text
scouting_app/
|-- public/
|   |-- index.html
|   |-- app.js
|   `-- style.css
|-- src/
|   |-- app.js
|   |-- db.js
|   |-- logic.js
|   |-- server.js
|   |-- swagger.js
|   `-- routes/
|       |-- players.js
|       `-- reports.js
|-- tests/
|   `-- logic.test.js
|-- package.json
|-- package-lock.json
`-- README.md
```

---

## Database Schema

```sql
players
  id       INT IDENTITY(1,1) PRIMARY KEY
  name     NVARCHAR(100) NOT NULL
  team     NVARCHAR(100) NOT NULL
  position NVARCHAR(20)  NOT NULL

reports
  id             INT IDENTITY(1,1) PRIMARY KEY
  player_id      INT NOT NULL REFERENCES players(id) ON DELETE CASCADE
  rating         INT NOT NULL
  minutes_played INT NOT NULL
  goals_scored   INT NOT NULL
  received_cards NVARCHAR(10) NOT NULL DEFAULT 'None'
  comments       NVARCHAR(MAX) DEFAULT ''
  created_at     DATETIME DEFAULT GETDATE()
```

---

## Prerequisites

- Node.js v22 or newer
- Microsoft SQL Server Express
- SQL Server Management Studio
- SQL Server Browser service enabled

---

## SQL Server Setup

Run this once in SQL Server Management Studio:

```sql
CREATE DATABASE ScoutingAppSAD;

CREATE LOGIN scout_user WITH PASSWORD = 'Scout@123', CHECK_POLICY = OFF;

USE ScoutingAppSAD;
CREATE USER scout_user FOR LOGIN scout_user;
ALTER ROLE db_owner ADD MEMBER scout_user;
```

The app connects to:

```text
localhost\SQLEXPRESS
Database: ScoutingAppSAD
User: scout_user
```

---

## Installation

```bash
npm install
```

---

## Running the App

```bash
npm start
```

The server creates the required tables automatically if they do not already exist.

Open the app:

```text
http://localhost:3000
```

Open Swagger API docs:

```text
http://localhost:3000/api-docs
```

---

## Development Mode

```bash
npm run dev
```

---

## Running Tests

```bash
npm test
```

The test suite currently includes 58 unit tests covering the business logic functions in `src/logic.js`.

---

## API Reference

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/players` | Get all players, optionally filtered by position |
| POST | `/api/players` | Create a new player |
| GET | `/api/players/:id` | Get one player with reports and average rating |
| PUT | `/api/players/:id` | Update a player |
| DELETE | `/api/players/:id` | Delete a player and cascade-delete reports |
| GET | `/api/players/:id/reports` | Get reports for a player |
| POST | `/api/players/:id/reports` | Create a report for a player |
| DELETE | `/api/reports/:id` | Delete a report |

### Player Request Body

```json
{
  "name": "Mohamed Salah",
  "team": "Liverpool FC",
  "position": "WIDE"
}
```

### Report Request Body

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

## Valid Positions

| Key | Description |
| --- | --- |
| CB | Center Back |
| FB | Full Back |
| 6ER | Defensive Midfielder |
| 8ER | Box-to-Box Midfielder |
| WIDE | Wide Player |
| CF | Center Forward |

---

## Business Logic

The `src/logic.js` module contains pure functions that are separated from Express routes and covered by Jest tests.

| Function | Purpose |
| --- | --- |
| `validatePlayerName` | Validates required player name and max length |
| `validateTeam` | Validates required team name and max length |
| `validatePosition` | Validates position key |
| `validateRating` | Validates rating from 1 to 5 |
| `validateNonNegativeInt` | Validates minutes and goals |
| `validateCards` | Validates card value |
| `computeAverageRating` | Calculates average report rating |
| `filterPlayersByPosition` | Filters players by position |
| `starsDisplay` | Converts ratings to star display text |

---

## Course Checklist

- [x] Full CRUD for players
- [x] Related reports entity
- [x] One-to-many database relationship
- [x] Position filter/search
- [x] RESTful API design
- [x] JSON request and response format
- [x] Frontend validation
- [x] Backend validation
- [x] Separated business logic
- [x] Jest unit tests
- [x] Swagger API documentation
- [x] Vanilla JavaScript SPA
- [x] SQL Server database integration
