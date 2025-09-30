require('dotenv').config();
require('./jobs/cronJobs');

const express = require('express');
const { pool } = require('./utils/db');
const redisClient = require('./utils/redis-client');
const createUrlRoutes = require('./routes/urls');
const createShortCodeRoute = require('./routes/shortCode');
const { generalLimiter } = require('./middleware/rate-limiter');
const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

app.set('trust proxy', 1);
app.use(generalLimiter);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const port = process.env.PORT || 3000;

// Routes
// Root
app.get('/', (req, res) => {
  const { shortUrl, error } = req.query;
  let shortUrlError;
  if (error === 'not_found') {
    shortUrlError = 'Short URL not found or expired.';
  }
  res.render('index', { shortUrl, shortUrlError });
});
// Health check
app.get('/up', (_, res) => {
  res.status(200).send('OK');
});
// Encode / decode and the shortened url route
app.use('/urls', createUrlRoutes(pool, redisClient));
app.get('/:shortCode', createShortCodeRoute(pool, redisClient))


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

module.exports = { app, pool, redisClient };
