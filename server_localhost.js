// server.js before moving from localhost to fly.io.
//
// todo later: use env variables to be able to switch
// between the two? For now, I'll just keep this as notes.
const express = require('express');
const bodyParser = require('body-parser');
const db = require('./db'); // Import the database
const app = express();
const PORT = 3000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());
app.use(express.json());

// Route to submit a new high score
app.post('/highscores', (req, res) => {
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
app.get('/highscores', (req, res) => {
    db.all('SELECT name, score FROM highscores ORDER BY score DESC LIMIT 10', [], (err, rows) => {
        if (err) {
            console.error('Error retrieving scores:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        res.json({ highScores: rows });
    });
});

// Route to get the high score of a specific player
app.get('/highscore/:name', (req, res) => {
    console.log(`get (specific player)`);
    const playerName = req.params.name; // Get the player's name from the URL parameter
    db.get('SELECT score FROM highscores WHERE name = ?', [playerName], (err, row) => {
        if (err) {
            console.error('Error retrieving score:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        if (row) {
            res.json({ name: playerName, highScore: row.score });
        } else {
            res.json({ name: playerName, highScore: 0 }); // Return 0 if the player is not found, i.e. first time playing
        }
    });
});

// Serve static files
app.use(express.static('public'));

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
