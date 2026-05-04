const express = require('express');
const router = express.Router();
const { getPool, sql } = require('../db');

/**
 * @swagger
 * /api/reports/{id}:
 *   delete:
 *     summary: Delete a report by ID
 *     tags: [Reports]
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

    const existing = await pool.request()
      .input('id', sql.Int, parseInt(req.params.id))
      .query('SELECT id FROM reports WHERE id = @id');

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
