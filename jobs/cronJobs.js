
const cron = require('node-cron');
const { deleteOldUrls } = require('./urlCleanupJob');
const everyHour = '0 * * * *';

cron.schedule(everyHour, deleteOldUrls);
