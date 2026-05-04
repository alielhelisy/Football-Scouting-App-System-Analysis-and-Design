const app = require('./app');
const { initSchema } = require('./db');

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await initSchema();
    console.log('Connected to SQL Server — tables ready.');
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
      console.log(`Swagger UI at  http://localhost:${PORT}/api-docs`);
    });
  } catch (err) {
    console.error('Failed to start:', err.message);
    process.exit(1);
  }
}

start();
