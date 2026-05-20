const express = require('express');
const router = express.Router();
const { getPool, sql } = require('../db');
const { authMiddleware } = require('../middleware/auth');
const logic = require('../logic');

router.use(authMiddleware);

/**
 * @swagger
 * /api/reports/{id}:
 *   put:
 *     summary: Update a report by ID
 *     tags: [Reports]
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
 *             $ref: '#/components/schemas/Report'
 *     responses:
 *       200:
 *         description: Report updated
 *       400:
 *         description: Validation errors
 *       404:
 *         description: Report not found
 */
router.put('/:id', async (req, res) => {
  try {
    const pool = await getPool();

    const existing = await pool.request()
      .input('id',      sql.Int, parseInt(req.params.id))
      .input('user_id', sql.Int, req.user.id)
      .query(`
        SELECT r.id FROM reports r
        JOIN players p ON r.player_id = p.id
        WHERE r.id = @id AND p.user_id = @user_id
      `);

    if (existing.recordset.length === 0) {
      return res.status(404).json({ error: 'Report not found' });
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
      .input('id',             sql.Int,               parseInt(req.params.id))
      .input('rating',         sql.Int,               Number(rating))
      .input('minutes_played', sql.Int,               Number(minutes_played))
      .input('goals_scored',   sql.Int,               Number(goals_scored))
      .input('received_cards', sql.NVarChar(10),      received_cards)
      .input('comments',       sql.NVarChar(sql.MAX), comments || '')
      .query(`
        UPDATE reports
        SET rating = @rating,
            minutes_played = @minutes_played,
            goals_scored = @goals_scored,
            received_cards = @received_cards,
            comments = @comments
        OUTPUT INSERTED.*
        WHERE id = @id
      `);

    res.json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/reports/{id}:
 *   delete:
 *     summary: Delete a report by ID
 *     tags: [Reports]
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
 *         description: Report deleted
 *       404:
 *         description: Report not found
 */
router.delete('/:id', async (req, res) => {
  try {
    const pool = await getPool();

    // Only delete if the report belongs to the logged-in user (via player ownership)
    const existing = await pool.request()
      .input('id',      sql.Int, parseInt(req.params.id))
      .input('user_id', sql.Int, req.user.id)
      .query(`
        SELECT r.id FROM reports r
        JOIN players p ON r.player_id = p.id
        WHERE r.id = @id AND p.user_id = @user_id
      `);

    if (existing.recordset.length === 0) {
      return res.status(404).json({ error: 'Report not found' });
    }

    await pool.request()
      .input('id', sql.Int, parseInt(req.params.id))
      .query('DELETE FROM reports WHERE id = @id');

    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
