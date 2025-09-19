
const { pool } = require('../utils/db');

const deleteOldUrls = async () => {
  console.log('deleteOldUrls running');
  try {
    const result = await pool.query(
      "DELETE FROM urls WHERE created_at < NOW() - INTERVAL '3 days'"
    );
    if (result.rowCount > 0) {
      console.log(`Successfully deleted ${result.rowCount} old URLs.`);
    }
  } catch (error) {
    console.error('Error running deleteOldUrls job:', error);
  }
};

module.exports = { deleteOldUrls };
