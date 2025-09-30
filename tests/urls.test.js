import { describe, it, expect, afterAll } from 'vitest';
const request = require('supertest');
const { app, pool, redisClient } = require('../index');

afterAll(async () => {
  await pool.end();
  await redisClient.quit();
});

describe('URL endpoints', () => {
  it('should encode a long URL and render the index page', async () => {
    const longUrl = 'https://www.google.com';
    const res = await request(app).post('/urls/encode').send({ longUrl });

    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('URL Shortener');
    expect(res.text).toContain('Short URL:');
  });

  it('should return 400 if longUrl is missing on encode', async () => {
    const res = await request(app).post('/urls/encode').send({});
    expect(res.statusCode).toBe(400);
  });

  it('should return 404 for a non-existent short URL on decode', async () => {
    const res = await request(app).get('/urls/decode?shortUrl=http://localhost:3000/nonexistent');
    expect(res.statusCode).toBe(404);
  });
});
