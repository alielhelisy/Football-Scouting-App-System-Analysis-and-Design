const express = require('express');
const router = express.Router();
const { getDb } = require('../db');

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
router.delete('/:id', (req, res) => {
  const db = getDb();
  const report = db.prepare('SELECT * FROM reports WHERE id = ?').get(req.params.id);
  if (!report) return res.status(404).json({ error: 'Report not found' });

  db.prepare('DELETE FROM reports WHERE id = ?').run(req.params.id);
  res.status(204).send();
});

module.exports = router;
