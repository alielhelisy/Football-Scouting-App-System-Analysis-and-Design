const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Football Scouting API',
      version: '1.0.0',
      description: 'REST API for the Football Scouting Web Application. Supports JWT authentication, user-specific data isolation, player CRUD, match reports, and position-based filtering.',
    },
    servers: [{ url: 'http://localhost:3000' }],
  },
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = { swaggerSpec };
