require('dotenv').config();
require('./jobs/cronJobs');

const express = require('express');
const urlRoutes = require('./routes/urls');
const shortCodeRoute = require('./routes/shortCode')
const { generalLimiter } = require('./middleware/rate-limiter');
const app = express();

app.set('trust proxy', 1);
app.use(generalLimiter);
app.use(express.json());
const port = process.env.PORT || 3000;

// Routes
// Health check
app.get('/up', (_, res) => {
  res.status(200).send('OK');
});
// Encode / decode and the shortened url route
app.use('/urls', urlRoutes);
app.get('/:shortCode', shortCodeRoute)


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
