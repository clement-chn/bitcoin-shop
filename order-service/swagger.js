const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Order Service API',
      version: '1.0.0',
      description: 'Gestion des ordres d\'achat de BTC'
    },
    servers: [{ url: 'http://localhost:3003' }]
  },
  apis: ['./routes/*.js']
};

module.exports = swaggerJsdoc(options);