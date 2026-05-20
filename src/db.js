const sql = require('mssql');

const config = {
  server: 'localhost',
  port: 1433,
  authentication: {
    type: 'default',
    options: {
      userName: 'scout_user',
      password: 'Scout@123',
    },
  },
  options: {
    database: 'ScoutingAppSAD',
    trustServerCertificate: true,
    encrypt: false,
    enableArithAbort: true,
  },
};

let pool;

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function connectWithRetry(retries = 12, delayMs = 5000) {
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      return await sql.connect(config);
    } catch (err) {
      if (attempt === retries) {
        throw err;
      }

      console.log(`SQL Server is not ready yet. Retrying in ${delayMs / 1000}s...`);
      await wait(delayMs);
    }
  }
}

async function getPool() {
  if (!pool) {
    pool = await connectWithRetry();
  }
  return pool;
}

async function initSchema() {
  const p = await getPool();

  // Users table
  await p.request().query(`
    IF OBJECT_ID('users', 'U') IS NULL
    CREATE TABLE users (
      id            INT IDENTITY(1,1) PRIMARY KEY,
      username      NVARCHAR(100) NOT NULL UNIQUE,
      password_hash NVARCHAR(255) NOT NULL,
      created_at    DATETIME DEFAULT GETDATE()
    );
  `);

  // If players table exists without user_id, drop and recreate
  const hasUserIdCol = await p.request().query(`
    SELECT COUNT(*) AS cnt FROM sys.columns
    WHERE object_id = OBJECT_ID('players') AND name = 'user_id'
  `);

  if (hasUserIdCol.recordset[0].cnt === 0) {
    await p.request().query('IF OBJECT_ID(\'reports\', \'U\') IS NOT NULL DROP TABLE reports');
    await p.request().query('IF OBJECT_ID(\'players\', \'U\') IS NOT NULL DROP TABLE players');
  }

  // Players table (with user_id)
  await p.request().query(`
    IF OBJECT_ID('players', 'U') IS NULL
    CREATE TABLE players (
      id       INT IDENTITY(1,1) PRIMARY KEY,
      user_id  INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name     NVARCHAR(100) NOT NULL,
      team     NVARCHAR(100) NOT NULL,
      position NVARCHAR(20)  NOT NULL
    );
  `);

  // Reports table
  await p.request().query(`
    IF OBJECT_ID('reports', 'U') IS NULL
    CREATE TABLE reports (
      id             INT IDENTITY(1,1) PRIMARY KEY,
      player_id      INT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
      rating         INT NOT NULL,
      minutes_played INT NOT NULL,
      goals_scored   INT NOT NULL,
      received_cards NVARCHAR(10)  NOT NULL DEFAULT 'None',
      comments       NVARCHAR(MAX) DEFAULT '',
      created_at     DATETIME      DEFAULT GETDATE()
    );
  `);
}

module.exports = { getPool, initSchema, sql };
