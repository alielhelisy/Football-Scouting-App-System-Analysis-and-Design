const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'scouting.db');

let db;

function getDb() {
  if (!db) {
    db = new DatabaseSync(DB_PATH);
    db.exec('PRAGMA journal_mode = WAL');
    db.exec('PRAGMA foreign_keys = ON');
    initSchema(db);
  }
  return db;
}

function initSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS players (
      id       INTEGER PRIMARY KEY AUTOINCREMENT,
      name     TEXT NOT NULL,
      team     TEXT NOT NULL,
      position TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS reports (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      player_id      INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
      rating         INTEGER NOT NULL,
      minutes_played INTEGER NOT NULL,
      goals_scored   INTEGER NOT NULL,
      received_cards TEXT NOT NULL DEFAULT 'None',
      comments       TEXT DEFAULT '',
      created_at     TEXT DEFAULT (datetime('now'))
    );
  `);
}

module.exports = { getDb };
