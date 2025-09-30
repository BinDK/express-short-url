import { describe, it, expect, afterAll } from 'vitest';
const request = require('supertest');
const { app, pool, redisClient } = require('../index');

afterAll(async () => {
  await pool.end();
  await redisClient.quit();
});

describe('App Health Checks and index page', () => {
  it('should return 200 OK for /up', async () => {
    const res = await request(app).get('/up');

    expect(res.statusCode).toBe(200);
    expect(res.text).toBe('OK');
  });

  it('should render the index page for /', async () => {
    const res = await request(app).get('/');

    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('URL Shortener');
  });
});
