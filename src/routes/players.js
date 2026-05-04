const express = require('express');
const router = express.Router();
const { getDb } = require('../db');
const logic = require('../logic');

/**
 * @swagger
 * components:
 *   schemas:
 *     Player:
 *       type: object
 *       required: [name, team, position]
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: Mohamed Salah
 *         team:
 *           type: string
 *           example: Liverpool FC
 *         position:
 *           type: string
 *           enum: [CB, FB, 6ER, 8ER, WIDE, CF]
 *           example: WIDE
 *     Report:
 *       type: object
 *       required: [rating, minutes_played, goals_scored, received_cards]
 *       properties:
 *         id:
 *           type: integer
 *         player_id:
 *           type: integer
 *         rating:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *           example: 4
 *         minutes_played:
 *           type: integer
 *           example: 90
 *         goals_scored:
 *           type: integer
 *           example: 1
 *         received_cards:
 *           type: string
 *           enum: [None, Yellow, Red]
 *           example: None
 *         comments:
 *           type: string
 *           example: Great pressing and link-up play
 *         created_at:
 *           type: string
 *           example: 2026-05-01 14:00:00
 */

/**
 * @swagger
 * /api/players:
 *   get:
 *     summary: Get all players
 *     tags: [Players]
 *     parameters:
 *       - in: query
 *         name: position
 *         schema:
 *           type: string
 *           enum: [CB, FB, 6ER, 8ER, WIDE, CF]
 *         description: Filter players by position
 *     responses:
 *       200:
 *         description: List of players
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Player'
 */
router.get('/', (req, res) => {
  const db = getDb();
  let players = db.prepare('SELECT * FROM players ORDER BY name ASC').all();
  if (req.query.position) {
    players = logic.filterPlayersByPosition(players, req.query.position);
  }
  res.json(players);
});

/**
 * @swagger
 * /api/players/{id}:
 *   get:
 *     summary: Get a player by ID (includes reports and average rating)
 *     tags: [Players]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Player with reports
 *       404:
 *         description: Player not found
 */
router.get('/:id', (req, res) => {
  const db = getDb();
  const player = db.prepare('SELECT * FROM players WHERE id = ?').get(req.params.id);
  if (!player) return res.status(404).json({ error: 'Player not found' });

  const reports = db
    .prepare('SELECT * FROM reports WHERE player_id = ? ORDER BY created_at DESC')
    .all(player.id);

  res.json({ ...player, reports, averageRating: logic.computeAverageRating(reports) });
});

/**
 * @swagger
 * /api/players:
 *   post:
 *     summary: Create a new player
 *     tags: [Players]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Player'
 *     responses:
 *       201:
 *         description: Player created
 *       400:
 *         description: Validation errors
 */
router.post('/', (req, res) => {
  const { name, team, position } = req.body;

  const errors = {};
  const nameErr = logic.validatePlayerName(name);
  const teamErr = logic.validateTeam(team);
  const posErr = logic.validatePosition(position);
  if (nameErr) errors.name = nameErr;
  if (teamErr) errors.team = teamErr;
  if (posErr) errors.position = posErr;
  if (Object.keys(errors).length > 0) return res.status(400).json({ errors });

  const db = getDb();
  const result = db
    .prepare('INSERT INTO players (name, team, position) VALUES (?, ?, ?)')
    .run(name.trim(), team.trim(), position);

  const player = db.prepare('SELECT * FROM players WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(player);
});

/**
 * @swagger
 * /api/players/{id}:
 *   put:
 *     summary: Update a player
 *     tags: [Players]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Player'
 *     responses:
 *       200:
 *         description: Player updated
 *       400:
 *         description: Validation errors
 *       404:
 *         description: Player not found
 */
router.put('/:id', (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM players WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Player not found' });

  const { name, team, position } = req.body;

  const errors = {};
  const nameErr = logic.validatePlayerName(name);
  const teamErr = logic.validateTeam(team);
  const posErr = logic.validatePosition(position);
  if (nameErr) errors.name = nameErr;
  if (teamErr) errors.team = teamErr;
  if (posErr) errors.position = posErr;
  if (Object.keys(errors).length > 0) return res.status(400).json({ errors });

  db.prepare('UPDATE players SET name = ?, team = ?, position = ? WHERE id = ?').run(
    name.trim(), team.trim(), position, req.params.id
  );

  const updated = db.prepare('SELECT * FROM players WHERE id = ?').get(req.params.id);
  res.json(updated);
});

/**
 * @swagger
 * /api/players/{id}:
 *   delete:
 *     summary: Delete a player (cascades to reports)
 *     tags: [Players]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Player deleted
 *       404:
 *         description: Player not found
 */
router.delete('/:id', (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM players WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Player not found' });

  db.prepare('DELETE FROM players WHERE id = ?').run(req.params.id);
  res.status(204).send();
});

/**
 * @swagger
 * /api/players/{playerId}/reports:
 *   get:
 *     summary: Get all reports for a player
 *     tags: [Reports]
 *     parameters:
 *       - in: path
 *         name: playerId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of reports
 *       404:
 *         description: Player not found
 */
router.get('/:playerId/reports', (req, res) => {
  const db = getDb();
  const player = db.prepare('SELECT * FROM players WHERE id = ?').get(req.params.playerId);
  if (!player) return res.status(404).json({ error: 'Player not found' });

  const reports = db
    .prepare('SELECT * FROM reports WHERE player_id = ? ORDER BY created_at DESC')
    .all(req.params.playerId);
  res.json(reports);
});

/**
 * @swagger
 * /api/players/{playerId}/reports:
 *   post:
 *     summary: Create a match report for a player
 *     tags: [Reports]
 *     parameters:
 *       - in: path
 *         name: playerId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Report'
 *     responses:
 *       201:
 *         description: Report created
 *       400:
 *         description: Validation errors
 *       404:
 *         description: Player not found
 */
router.post('/:playerId/reports', (req, res) => {
  const db = getDb();
  const player = db.prepare('SELECT * FROM players WHERE id = ?').get(req.params.playerId);
  if (!player) return res.status(404).json({ error: 'Player not found' });

  const { rating, minutes_played, goals_scored, received_cards, comments } = req.body;

  const errors = {};
  const ratingErr = logic.validateRating(rating);
  const minutesErr = logic.validateNonNegativeInt(minutes_played, 'Minutes played');
  const goalsErr = logic.validateNonNegativeInt(goals_scored, 'Goals scored');
  const cardsErr = logic.validateCards(received_cards);
  if (ratingErr) errors.rating = ratingErr;
  if (minutesErr) errors.minutes_played = minutesErr;
  if (goalsErr) errors.goals_scored = goalsErr;
  if (cardsErr) errors.received_cards = cardsErr;
  if (Object.keys(errors).length > 0) return res.status(400).json({ errors });

  const result = db
    .prepare(
      'INSERT INTO reports (player_id, rating, minutes_played, goals_scored, received_cards, comments) VALUES (?, ?, ?, ?, ?, ?)'
    )
    .run(
      req.params.playerId,
      Number(rating),
      Number(minutes_played),
      Number(goals_scored),
      received_cards,
      comments || ''
    );

  const report = db.prepare('SELECT * FROM reports WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(report);
});

module.exports = router;
