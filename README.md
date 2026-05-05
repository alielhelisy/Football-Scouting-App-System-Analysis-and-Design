# Football Scouting Web Application

### System Analysis and Design

**Student:** Ali Elhelisy  
**ID:** 220303928

---

## Overview

Football Scouting Web Application is a full-stack web application designed to help football scouts organize player information and record match reports in one place. The system allows users to manage players, filter them by position, add scouting reports, review player performance, and calculate average ratings based on submitted reports.

The application uses a vanilla JavaScript single-page frontend with a RESTful Node.js and Express backend. Data is stored in Microsoft SQL Server, and the API is documented with Swagger UI.

---

## Main Features

- Manage football players with create, read, update, and delete operations
- Filter players by football position
- Add match reports for individual players
- Store report details such as rating, minutes played, goals, cards, and comments
- View each player's reports and calculated average rating
- Validate user input on both frontend and backend
- Use a RESTful JSON API
- Provide interactive API documentation with Swagger UI

---

## Technologies Used

| Layer | Technology |
| --- | --- |
| Frontend | HTML, CSS, Vanilla JavaScript |
| Backend | Node.js, Express |
| Database | Microsoft SQL Server Express |
| API Documentation | Swagger UI, OpenAPI 3.0 |
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

## Database Design

The database contains two main tables:

- `players`: stores player name, team, and position
- `reports`: stores match report details linked to a player

Each player can have multiple reports. When a player is deleted, the related reports are deleted automatically through cascade delete.

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

Run the following SQL commands once in SQL Server Management Studio:

```sql
CREATE DATABASE ScoutingAppSAD;

CREATE LOGIN scout_user WITH PASSWORD = 'Scout@123', CHECK_POLICY = OFF;

USE ScoutingAppSAD;
CREATE USER scout_user FOR LOGIN scout_user;
ALTER ROLE db_owner ADD MEMBER scout_user;
```

The application connects to:

```text
Server: localhost\SQLEXPRESS
Database: ScoutingAppSAD
User: scout_user
```

---

## Installation

Install the project dependencies:

```bash
npm install
```

---

## Running the Application

Start the server:

```bash
npm start
```

The database tables are created automatically when the server starts if they do not already exist.

Open the web application:

```text
http://localhost:3000
```

Open the Swagger API documentation:

```text
http://localhost:3000/api-docs
```

---

## Development Mode

Run the server with automatic restart:

```bash
npm run dev
```

---

## Testing

Run the Jest test suite:

```bash
npm test
```

The tests cover the business logic functions in `src/logic.js`, including validation, filtering, rating calculation, and star display formatting.

---

## API Endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/players` | Get all players, optionally filtered by position |
| POST | `/api/players` | Create a new player |
| GET | `/api/players/:id` | Get one player with reports and average rating |
| PUT | `/api/players/:id` | Update a player |
| DELETE | `/api/players/:id` | Delete a player and its reports |
| GET | `/api/players/:id/reports` | Get reports for a player |
| POST | `/api/players/:id/reports` | Create a report for a player |
| DELETE | `/api/reports/:id` | Delete a report |

### Player Request Example

```json
{
  "name": "Mohamed Salah",
  "team": "Liverpool FC",
  "position": "WIDE"
}
```

### Report Request Example

```json
{
  "rating": 4,
  "minutes_played": 90,
  "goals_scored": 1,
  "received_cards": "None",
  "comments": "Strong pressing and good movement off the ball"
}
```

---

## Valid Player Positions

| Key | Display |
|---|---|
| GK | Goal Keeper |
| CB | Center Back |
| FB | Full Back (Walker) |
| FB | Full Back (Cancelo) |
| FB | Full Back (Delph) |
| 6ER | Defensive Midfield |
| 8ER |  Midfield |
| Wide Plyaer | Winger |
| CF | Center Forward |
---

## Business Logic

The `src/logic.js` file contains reusable business logic that is separated from the route handlers. This keeps validation and calculation functions easier to test and maintain.

| Function | Purpose |
| --- | --- |
| `validatePlayerName` | Validates player name input |
| `validateTeam` | Validates team name input |
| `validatePosition` | Validates player position |
| `validateRating` | Validates report rating |
| `validateNonNegativeInt` | Validates numeric report fields |
| `validateCards` | Validates card selection |
| `computeAverageRating` | Calculates a player's average rating |
| `filterPlayersByPosition` | Filters players by position |
| `starsDisplay` | Formats ratings as stars |
