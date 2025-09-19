const express = require('express');
const { pool } = require('../utils/db');

const router = express.Router();
const redisClient = require('../utils/redis-client');
const EXPIRE_TIME = 3600;

router.get('/:shortCode', async (req, res) => {
  const { shortCode } = req.params;
  try {
    const cachedUrl = await redisClient.get(shortCode);
    if (cachedUrl) {
      return res.redirect(cachedUrl);
    }

    const result = await pool.query('SELECT long_url FROM urls WHERE short_code = $1', [shortCode]);
    if (result.rows.length > 0) {
      const longUrl = result.rows[0].long_url;
      await redisClient.set(shortCode, longUrl, { EX: EXPIRE_TIME });
      return res.redirect(longUrl);
    }

    res.status(404).json({ error: 'Short URL not found' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
