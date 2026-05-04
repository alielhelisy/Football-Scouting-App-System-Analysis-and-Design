const express = require('express');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const { swaggerSpec } = require('./swagger');

const playersRouter = require('./routes/players');
const reportsRouter = require('./routes/reports');

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/players', playersRouter);
app.use('/api/reports', reportsRouter);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;
