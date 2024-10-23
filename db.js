const sqlite3 = require('sqlite3').verbose();

// Open a database connection
const db = new sqlite3.Database('./highscores.db', (err) => {
    if (err) {
        console.error('Error opening database', err);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

// Create a table for high scores (if it doesn't already exist)
// Ensuring that the 'name' is unique, so only one entry per player
db.run(`CREATE TABLE IF NOT EXISTS highscores (
    name TEXT NOT NULL UNIQUE,
    score INTEGER NOT NULL
)`);
    
//db.run(`DROP TABLE IF EXISTS highscores`);
module.exports = db;

