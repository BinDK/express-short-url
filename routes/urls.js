const express = require('express');
const { nanoid } = require('nanoid');
const { pool } = require('../utils/db');

const router = express.Router();
const redisClient = require('../utils/redis-client');
const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
const EXPIRE_TIME = 3600;

router.post('/encode', async (req, res) => {
  const { longUrl } = req.body;
  if (!longUrl) {
    return res.status(400).json({ error: 'longUrl is required' });
  }

  try {
    const shortCode = nanoid(8);
    const shortUrl = `${baseUrl}/${shortCode}`;

    const result = await pool.query(
      'INSERT INTO urls (short_code, long_url) VALUES ($1, $2) RETURNING *',
      [shortCode, longUrl]
    );

    res.json({ shortUrl });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/decode', async (req, res) => {
  const { shortUrl } = req.query;
  if (!shortUrl) {
    return res.status(400).json({ error: 'shortUrl is required' });
  }

  try {
    const shortCode = shortUrl.split('/').pop();
    const cachedUrl = await redisClient.get(shortCode);
    if (cachedUrl) {
      return res.json({ longUrl: cachedUrl });
    }

    const result = await pool.query('SELECT long_url FROM urls WHERE short_code = $1 LIMIT 1', [shortCode]);

    if (result.rows.length > 0) {
      const longUrl = result.rows[0].long_url;
      await redisClient.set(shortCode, longUrl, { EX: EXPIRE_TIME });
      return res.json({ longUrl });
    }

    res.status(404).json({ error: 'Short URL not found' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
