const express = require('express');
const router = express.Router();
const { getPool, sql } = require('../db');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

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
