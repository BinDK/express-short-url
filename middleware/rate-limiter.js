
const rateLimit = require('express-rate-limit');
const windowMs = 15 * 60 * 1000;
const maximumReqPerIP = 100;

const generalLimiter = rateLimit({
  windowMs,
  max: maximumReqPerIP,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests.',
});

module.exports = { generalLimiter };
