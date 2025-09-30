
require('dotenv').config();

import { beforeAll, afterEach, afterAll } from 'vitest';
import { Pool } from 'pg';
import { createClient } from 'redis';

function buildTestDbUrl(databaseUrl) {
  const url = new URL(databaseUrl);
  const dbName = url.pathname.slice(1);

  const testDbName = `${dbName}_test`;
  const testDbUrl = `${databaseUrl}_test`;

  url.pathname = '/postgres';
  const postgresDbUrl = url.toString();

  return { testDbUrl, testDbName, postgresDbUrl };
}

async function ensureTestDatabase(adminPool, testDbName) {
  const res = await adminPool.query(
    `SELECT 1 FROM pg_database WHERE datname = $1`,
    [testDbName]
  );

  if (res.rowCount === 0) {
    await adminPool.query(`CREATE DATABASE "${testDbName}"`);
    console.log(`Test database '${testDbName}' created.`);
  }
}

async function ensureSchema(pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS urls (
      id SERIAL PRIMARY KEY,
      short_code VARCHAR(10) UNIQUE NOT NULL,
      long_url TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

const databaseUrl = process.env.DATABASE_URL;
const redisUrl = process.env.REDIS_URL;

const { testDbUrl, testDbName, postgresDbUrl } = buildTestDbUrl(databaseUrl);

export const pool = new Pool({ connectionString: testDbUrl });
export const redisClient = createClient({ url: redisUrl });

beforeAll(async () => {
  const adminPool = new Pool({ connectionString: postgresDbUrl });
  try {
    await ensureTestDatabase(adminPool, testDbName);
  } finally {
    await adminPool.end();
  }

  await redisClient.connect();
  await ensureSchema(pool);
});

afterEach(async () => {
  await pool.query('TRUNCATE TABLE urls RESTART IDENTITY');
  await redisClient.flushDb();
});

afterAll(async () => {
  await pool.end();
  await redisClient.quit();
});
