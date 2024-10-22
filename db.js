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
db.run(`CREATE TABLE IF NOT EXISTS highscores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    score INTEGER NOT NULL
)`);

module.exports = db;
