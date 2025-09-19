require('dotenv').config();
const { Pool } = require('pg');

const main = async () => {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('DATABASE_URL environment variable is not set.');
    process.exit(1);
  }

  const url = new URL(databaseUrl);
  const dbName = url.pathname.substring(1);

  url.pathname = '/postgres';
  const postgresDbUrl = url.toString();

  const pool = new Pool({ connectionString: postgresDbUrl });

  try {
    const res = await pool.query(`SELECT 1 FROM pg_database WHERE datname = $1`, [dbName]);
    if (res.rowCount === 0) {
      console.log(`Database '${dbName}' does not exist. Creating...`);
      await pool.query(`CREATE DATABASE "${dbName}"`);
      console.log(`Database '${dbName}' created successfully.`);
    } else {
      console.log(`Database '${dbName}' already exists.`);
    }
  } catch (err) {
    console.error('Error creating database:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }

  const appDbPool = new Pool({ connectionString: databaseUrl });
  try {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS urls (
        id SERIAL PRIMARY KEY,
        short_code VARCHAR(10) UNIQUE NOT NULL,
        long_url TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await appDbPool.query(createTableQuery);
    console.log("Table 'urls' is ready.");
  } catch (err) {
    console.error('Error creating table:', err);
    process.exit(1);
  } finally {
    await appDbPool.end();
  }
};

main();
