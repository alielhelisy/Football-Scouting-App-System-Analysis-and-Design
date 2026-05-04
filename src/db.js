const sql = require('mssql');

const config = {
  server: 'localhost\\SQLEXPRESS',
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
    encrypt: true,
    enableArithAbort: true,
  },
};

let pool;

async function getPool() {
  if (!pool) {
    pool = await sql.connect(config);
  }
  return pool;
}

async function initSchema() {
  const p = await getPool();

  await p.request().query(`
    IF OBJECT_ID('players', 'U') IS NULL
    CREATE TABLE players (
      id       INT IDENTITY(1,1) PRIMARY KEY,
      name     NVARCHAR(100) NOT NULL,
      team     NVARCHAR(100) NOT NULL,
      position NVARCHAR(20)  NOT NULL
    );
  `);

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
