import { describe, it, expect, afterAll, afterEach, beforeEach } from 'vitest';
const request = require('supertest');
const { app, pool, redisClient } = require('../index');
const { nanoid } = require('nanoid');

afterAll(async () => {
  await pool.end();
  await redisClient.quit();
});

describe('Redirect via shortened url', () => {
  const longUrl = 'https://www.github.com';
  let shortCode = nanoid(8);

  beforeEach(async () => {
    shortCode = nanoid(8);
  });

  afterEach(async () => {
    await redisClient.del(shortCode);
  });

  it('should redirect to the long URL from a short code', async () => {
    await pool.query('INSERT INTO urls (short_code, long_url) VALUES ($1, $2)', [shortCode, longUrl]);

    const res = await request(app).get(`/${shortCode}`);

    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toBe(longUrl);
  });

  it('should redirect to home with an error for a non-existent short code', async () => {
    const res = await request(app).get('/non_existent_code');

    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toBe('/?error=not_found');
  });
});
