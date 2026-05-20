# Football Scouting Web Application

### System Analysis and Design

**Student:** Ali Elhelisy  
**ID:** 220303928

---

## Overview

Football Scouting Web Application is a full-stack web application for managing football players and scouting match reports. Users can register, log in, manage their own players, filter players by position, add match reports, and review player performance through ratings and comments.

The application uses a vanilla JavaScript frontend with a RESTful Node.js and Express backend. Data is stored in Microsoft SQL Server, authentication is handled with JWT, and the API is documented with Swagger UI.

---

## Main Features

- User registration and login
- JWT-based authentication
- User-specific data isolation
- Player create, read, update, and delete operations
- Position-based player filtering
- Match reports for individual players
- Rating, minutes played, goals, cards, and comments in each report
- Average rating calculation for each player
- Frontend and backend validation
- RESTful JSON API
- Swagger UI API documentation

---

## Authentication and Data Isolation

The project uses JWT (JSON Web Token) authentication.

After registration or login, the backend returns a JWT token. The frontend stores this token in `localStorage` and sends it with protected API requests using the `Authorization: Bearer <token>` header.

All player and report routes are protected by authentication middleware. Each player record is linked to the logged-in user through `user_id`, so users can only view, create, update, and delete their own data. Report access is also checked through the owner of the related player, which prevents one user from accessing or deleting another user's reports.

Example:

- `user1` only sees players and reports created by `user1`
- `user2` only sees players and reports created by `user2`
- If `user2` tries to access `user1`'s player or report by ID, the API returns `404 Not Found`

---

## Technologies Used

| Layer | Technology |
| --- | --- |
| Frontend | HTML, CSS, Vanilla JavaScript |
| Backend | Node.js, Express |
| Authentication | JWT, bcryptjs |
| Database | Microsoft SQL Server Express |
| API Documentation | Swagger UI, OpenAPI 3.0 |
| Testing | Jest |

---

## Project Structure

```text
scouting_app/
|-- public/
|   |-- index.html
|   |-- login.html
|   |-- register.html
|   |-- app.js
|   `-- style.css
|-- src/
|   |-- app.js
|   |-- db.js
|   |-- logic.js
|   |-- server.js
|   |-- swagger.js
|   |-- middleware/
|   |   `-- auth.js
|   `-- routes/
|       |-- auth.js
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

The database contains three main tables:

- `users`: stores registered users and password hashes
- `players`: stores player information and links each player to a user
- `reports`: stores match report details linked to a player

Each user can have multiple players, and each player can have multiple reports. When a user is deleted, that user's players are deleted. When a player is deleted, the related reports are deleted automatically through cascade delete.

```sql
users
  id            INT IDENTITY(1,1) PRIMARY KEY
  username      NVARCHAR(100) NOT NULL UNIQUE
  password_hash NVARCHAR(255) NOT NULL
  created_at    DATETIME DEFAULT GETDATE()

players
  id       INT IDENTITY(1,1) PRIMARY KEY
  user_id  INT NOT NULL REFERENCES users(id) ON DELETE CASCADE
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

## Demo Account

For a quick local demo, use:

```text
Username: admin
Password: admin123
```

You can also create a new account from the Register page. Each account only sees and manages its own players and reports.

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
| POST | `/api/auth/register` | Register a new user and receive a JWT |
| POST | `/api/auth/login` | Log in and receive a JWT |
| GET | `/api/players` | Get the logged-in user's players, optionally filtered by position |
| POST | `/api/players` | Create a player for the logged-in user |
| GET | `/api/players/:id` | Get one owned player with reports and average rating |
| PUT | `/api/players/:id` | Update an owned player |
| DELETE | `/api/players/:id` | Delete an owned player and its reports |
| GET | `/api/players/:id/reports` | Get reports for an owned player |
| POST | `/api/players/:id/reports` | Create a report for an owned player |
| DELETE | `/api/reports/:id` | Delete an owned report |

Protected endpoints require:

```text
Authorization: Bearer <token>
```

### Register/Login Request Example

```json
{
  "username": "user1",
  "password": "password123"
}
```

### Player Request Example

```json
{
  "name": "Player Name",
  "team": "Team Name",
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
| --- | --- |
| CB | CB |
| FB | FB |
| 6ER | 6er |
| 8ER | 8er |
| WIDE | Wide |
| CF | CF |

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
