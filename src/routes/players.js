const express = require('express');
const router = express.Router();
const { getPool, sql } = require('../db');
const logic = require('../logic');
const { authMiddleware } = require('../middleware/auth');

// All player routes require a valid JWT
router.use(authMiddleware);

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
 *         name:
 *           type: string
 *           example: Mohamed Salah
 *         team:
 *           type: string
 *           example: Liverpool FC
 *         position:
 *           type: string
 *           enum: [CB, FB, 6ER, 8ER, WIDE, CF]
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
 *         minutes_played:
 *           type: integer
 *         goals_scored:
 *           type: integer
 *         received_cards:
 *           type: string
 *           enum: [None, Yellow, Red]
 *         comments:
 *           type: string
 */

/**
 * @swagger
 * /api/players:
 *   get:
 *     summary: Get all players for the logged-in user
 *     tags: [Players]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: position
 *         schema:
 *           type: string
 *           enum: [CB, FB, 6ER, 8ER, WIDE, CF]
 *     responses:
 *       200:
 *         description: List of players
 *       401:
 *         description: Unauthorized
 */
router.get('/', async (req, res) => {
  try {
    const pool = await getPool();
    const request = pool.request();
    request.input('user_id', sql.Int, req.user.id);
    let query = 'SELECT * FROM players WHERE user_id = @user_id';

    if (req.query.position) {
      request.input('position', sql.NVarChar(20), req.query.position);
      query += ' AND position = @position';
    }

    query += ' ORDER BY name';
    const result = await request.query(query);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/players/{id}:
 *   get:
 *     summary: Get a player by ID with reports
 *     tags: [Players]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Player with reports and average rating
 *       404:
 *         description: Player not found
 */
router.get('/:id', async (req, res) => {
  try {
    const pool = await getPool();

    const playerResult = await pool.request()
      .input('id',      sql.Int, parseInt(req.params.id))
      .input('user_id', sql.Int, req.user.id)
      .query('SELECT * FROM players WHERE id = @id AND user_id = @user_id');

    if (playerResult.recordset.length === 0) {
      return res.status(404).json({ error: 'Player not found' });
    }

    const player = playerResult.recordset[0];

    const reportsResult = await pool.request()
      .input('player_id', sql.Int, player.id)
      .query('SELECT * FROM reports WHERE player_id = @player_id ORDER BY created_at DESC');

    const reports = reportsResult.recordset;
    res.json({ ...player, reports, averageRating: logic.computeAverageRating(reports) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/players:
 *   post:
 *     summary: Create a new player
 *     tags: [Players]
 *     security:
 *       - BearerAuth: []
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
router.post('/', async (req, res) => {
  const { name, team, position } = req.body;

  const errors = {};
  const nameErr = logic.validatePlayerName(name);
  const teamErr = logic.validateTeam(team);
  const posErr  = logic.validatePosition(position);
  if (nameErr) errors.name     = nameErr;
  if (teamErr) errors.team     = teamErr;
  if (posErr)  errors.position = posErr;
  if (Object.keys(errors).length > 0) return res.status(400).json({ errors });

  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('user_id',  sql.Int,           req.user.id)
      .input('name',     sql.NVarChar(100), name.trim())
      .input('team',     sql.NVarChar(100), team.trim())
      .input('position', sql.NVarChar(20),  position)
      .query('INSERT INTO players (user_id, name, team, position) OUTPUT INSERTED.* VALUES (@user_id, @name, @team, @position)');

    res.status(201).json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/players/{id}:
 *   put:
 *     summary: Update a player
 *     tags: [Players]
 *     security:
 *       - BearerAuth: []
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
 *       404:
 *         description: Player not found
 */
router.put('/:id', async (req, res) => {
  try {
    const pool = await getPool();

    const existing = await pool.request()
      .input('id',      sql.Int, parseInt(req.params.id))
      .input('user_id', sql.Int, req.user.id)
      .query('SELECT id FROM players WHERE id = @id AND user_id = @user_id');

    if (existing.recordset.length === 0) {
      return res.status(404).json({ error: 'Player not found' });
    }

    const { name, team, position } = req.body;

    const errors = {};
    const nameErr = logic.validatePlayerName(name);
    const teamErr = logic.validateTeam(team);
    const posErr  = logic.validatePosition(position);
    if (nameErr) errors.name     = nameErr;
    if (teamErr) errors.team     = teamErr;
    if (posErr)  errors.position = posErr;
    if (Object.keys(errors).length > 0) return res.status(400).json({ errors });

    const result = await pool.request()
      .input('id',       sql.Int,           parseInt(req.params.id))
      .input('user_id',  sql.Int,           req.user.id)
      .input('name',     sql.NVarChar(100), name.trim())
      .input('team',     sql.NVarChar(100), team.trim())
      .input('position', sql.NVarChar(20),  position)
      .query('UPDATE players SET name = @name, team = @team, position = @position OUTPUT INSERTED.* WHERE id = @id AND user_id = @user_id');

    res.json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/players/{id}:
 *   delete:
 *     summary: Delete a player
 *     tags: [Players]
 *     security:
 *       - BearerAuth: []
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
router.delete('/:id', async (req, res) => {
  try {
    const pool = await getPool();

    const existing = await pool.request()
      .input('id',      sql.Int, parseInt(req.params.id))
      .input('user_id', sql.Int, req.user.id)
      .query('SELECT id FROM players WHERE id = @id AND user_id = @user_id');

    if (existing.recordset.length === 0) {
      return res.status(404).json({ error: 'Player not found' });
    }

    await pool.request()
      .input('id', sql.Int, parseInt(req.params.id))
      .query('DELETE FROM players WHERE id = @id');

    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/players/{playerId}/reports:
 *   get:
 *     summary: Get all reports for a player
 *     tags: [Reports]
 *     security:
 *       - BearerAuth: []
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
router.get('/:playerId/reports', async (req, res) => {
  try {
    const pool = await getPool();

    const player = await pool.request()
      .input('id',      sql.Int, parseInt(req.params.playerId))
      .input('user_id', sql.Int, req.user.id)
      .query('SELECT id FROM players WHERE id = @id AND user_id = @user_id');

    if (player.recordset.length === 0) {
      return res.status(404).json({ error: 'Player not found' });
    }

    const result = await pool.request()
      .input('player_id', sql.Int, parseInt(req.params.playerId))
      .query('SELECT * FROM reports WHERE player_id = @player_id ORDER BY created_at DESC');

    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/players/{playerId}/reports:
 *   post:
 *     summary: Create a report for a player
 *     tags: [Reports]
 *     security:
 *       - BearerAuth: []
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
router.post('/:playerId/reports', async (req, res) => {
  try {
    const pool = await getPool();

    const player = await pool.request()
      .input('id',      sql.Int, parseInt(req.params.playerId))
      .input('user_id', sql.Int, req.user.id)
      .query('SELECT id FROM players WHERE id = @id AND user_id = @user_id');

    if (player.recordset.length === 0) {
      return res.status(404).json({ error: 'Player not found' });
    }

    const { rating, minutes_played, goals_scored, received_cards, comments } = req.body;

    const errors = {};
    const ratingErr  = logic.validateRating(rating);
    const minutesErr = logic.validateNonNegativeInt(minutes_played, 'Minutes played');
    const goalsErr   = logic.validateNonNegativeInt(goals_scored, 'Goals scored');
    const cardsErr   = logic.validateCards(received_cards);
    if (ratingErr)  errors.rating         = ratingErr;
    if (minutesErr) errors.minutes_played = minutesErr;
    if (goalsErr)   errors.goals_scored   = goalsErr;
    if (cardsErr)   errors.received_cards = cardsErr;
    if (Object.keys(errors).length > 0) return res.status(400).json({ errors });

    const result = await pool.request()
      .input('player_id',      sql.Int,               parseInt(req.params.playerId))
      .input('rating',         sql.Int,               Number(rating))
      .input('minutes_played', sql.Int,               Number(minutes_played))
      .input('goals_scored',   sql.Int,               Number(goals_scored))
      .input('received_cards', sql.NVarChar(10),      received_cards)
      .input('comments',       sql.NVarChar(sql.MAX), comments || '')
      .query(`
        INSERT INTO reports (player_id, rating, minutes_played, goals_scored, received_cards, comments)
        OUTPUT INSERTED.*
        VALUES (@player_id, @rating, @minutes_played, @goals_scored, @received_cards, @comments)
      `);

    res.status(201).json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
