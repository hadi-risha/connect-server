import fs from 'fs';
import path from 'path';
import cron from 'node-cron';

const logDirectory = path.join(__dirname, ''); 

cron.schedule('0 0 * * 0', () => {
    fs.truncate(path.join(logDirectory, 'error.log'), 0, (err) => {
        if (err) console.error('Error clearing error.log:', err);
    });

    fs.truncate(path.join(logDirectory, 'combined.log'), 0, (err) => {
        if (err) console.error('Error clearing combined.log:', err);
    });

    console.log('Logs cleared');
});
