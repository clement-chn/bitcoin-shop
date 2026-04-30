const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Wallet Service API',
      version: '1.0.0',
      description: 'Gestion des soldes EUR des utilisateurs'
    },
    servers: [{ url: 'http://localhost:3001' }]
  },
  apis: ['./routes/*.js']
};

module.exports = swaggerJsdoc(options);