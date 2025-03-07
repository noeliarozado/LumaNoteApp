const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const app = express();

app.use(cors());
app.use(express.json());

// Create and connect to the SQLite database
const db = new sqlite3.Database('./notes.db', (err) => {
    if (err) {
        console.error("Error connecting to the database", err);
    } else {
        console.log("Connected to SQLite database");
    }
});

// Create the 'notes' table with a 'date' column
db.run(`CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY,
    content TEXT,
    date TEXT
)`, (err) => {
    if (err) {
        console.log("Error creating table", err);
    }
});

// GET /notes: Fetch all notes sorted by date
app.get('/notes', (req, res) => {
    db.all('SELECT * FROM notes ORDER BY date DESC, id ASC', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(rows);
        }
    });
});

// POST /notes: Save a new note with the current date
app.post('/notes', (req, res) => {
    const { content } = req.body;
    const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD

    db.run('INSERT INTO notes (content, date) VALUES (?, ?)', [content, today], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.status(201).json({ id: this.lastID, content, date: today });
        }
    });
});

// PUT /notes/:id: Modify a note
app.put('/notes/:id', (req, res) => {
    const { content } = req.body;
    const { id } = req.params;
    db.run('UPDATE notes SET content = ? WHERE id = ?', [content, id], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ id, content });
        }
    });
});

// DELETE /notes/:id: Delete a note
app.delete('/notes/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM notes WHERE id = ?', [id], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ id });
        }
    });
});

// Start the server
app.listen(3000, () => {
    console.log("Server running at http://localhost:3000");
});
