const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getPool, sql } = require('../db');
const { SECRET } = require('../middleware/auth');

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     AuthInput:
 *       type: object
 *       required: [username, password]
 *       properties:
 *         username:
 *           type: string
 *           example: scout1
 *         password:
 *           type: string
 *           example: mypassword
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AuthInput'
 *     responses:
 *       201:
 *         description: Registered successfully, returns JWT token
 *       400:
 *         description: Validation error
 *       409:
 *         description: Username already taken
 */
router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  if (!username || typeof username !== 'string' || username.trim().length < 3) {
    return res.status(400).json({ error: 'Username must be at least 3 characters.' });
  }
  if (!password || password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  }

  try {
    const pool = await getPool();

    const existing = await pool.request()
      .input('username', sql.NVarChar(100), username.trim())
      .query('SELECT id FROM users WHERE username = @username');

    if (existing.recordset.length > 0) {
      return res.status(409).json({ error: 'Username already taken.' });
    }

    const hash = await bcrypt.hash(password, 10);

    const result = await pool.request()
      .input('username', sql.NVarChar(100), username.trim())
      .input('password_hash', sql.NVarChar(255), hash)
      .query('INSERT INTO users (username, password_hash) OUTPUT INSERTED.id, INSERTED.username VALUES (@username, @password_hash)');

    const user = result.recordset[0];
    const token = jwt.sign({ id: user.id, username: user.username }, SECRET, { expiresIn: '7d' });

    res.status(201).json({ token, username: user.username });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login and get a JWT token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AuthInput'
 *     responses:
 *       200:
 *         description: Login successful, returns JWT token
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  try {
    const pool = await getPool();

    const result = await pool.request()
      .input('username', sql.NVarChar(100), username.trim())
      .query('SELECT * FROM users WHERE username = @username');

    if (result.recordset.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    const user = result.recordset[0];
    const valid = await bcrypt.compare(password, user.password_hash);

    if (!valid) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    const token = jwt.sign({ id: user.id, username: user.username }, SECRET, { expiresIn: '7d' });
    res.json({ token, username: user.username });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
