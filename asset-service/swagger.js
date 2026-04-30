const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Asset Service API',
      version: '1.0.0',
      description: 'Gestion du stock et des portefeuilles BTC'
    },
    servers: [{ url: 'http://localhost:3002' }]
  },
  apis: ['./routes/*.js']
};

module.exports = swaggerJsdoc(options);