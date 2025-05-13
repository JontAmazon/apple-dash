const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const PORT = 3000;

// Database
const db = new sqlite3.Database('/data/highscores.db');
db.run(`CREATE TABLE IF NOT EXISTS highscores (
    name TEXT NOT NULL UNIQUE,
    score INTEGER NOT NULL
)`);

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Routes

// Route to submit a new high score
app.post('/data/highscores', (req, res) => {
    console.log("Received POST request with body:", req.body);
    const { name, score } = req.body; // Make sure this matches your JSON structure
    db.run('INSERT OR REPLACE INTO highscores (name, score) VALUES (?, ?)', [name, score], function(err) {
        if (err) {
            return res.status(500).send(err.message);
        }
        res.status(201).send({ id: this.lastID });
    });
});

// Route to get the top high scores
app.get('/data/highscores', (req, res) => {
    db.all('SELECT name, score FROM highscores ORDER BY score DESC LIMIT 10', [], (err, rows) => {
        if (err) {
            console.error('Error retrieving scores:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json({ highScores: rows });
    });
});

// Route to get the high score of a specific player
app.get('/data/highscore/:name', (req, res) => {
    console.log(`get (specific player)`);
    const playerName = req.params.name;
    db.get('SELECT score FROM highscores WHERE name = ?', [playerName], (err, row) => {
        if (err) {
            console.error('Error retrieving score:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json({ name: playerName, highScore: row ? row.score : 0 });
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
