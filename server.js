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
    db.run('INSERT INTO highscores (name, score) VALUES (?, ?)', [name, score], function(err) {
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

// Serve static files
app.use(express.static('public'));

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
