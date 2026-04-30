const { v4: uuidv4 } = require('uuid');

const correlationIdMiddleware = (req, res, next) => {
  req.headers['x-correlation-id'] = req.headers['x-correlation-id'] || uuidv4();
  res.setHeader('x-correlation-id', req.headers['x-correlation-id']);
  next();
};

module.exports = correlationIdMiddleware;