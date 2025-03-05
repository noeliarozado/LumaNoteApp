const express = require('express');
const cors = require('cors'); // Import CORS
const sqlite3 = require('sqlite3').verbose();
const app = express();

// Enable CORS for all origins
app.use(cors());

// Parse JSON data in POST requests
app.use(express.json());

// Create and connect to the SQLite database
const db = new sqlite3.Database('./notes.db', (err) => {
    if (err) {
        console.error("Error connecting to the database", err);
    } else {
        console.log("Connected to SQLite database");
    }
});

// Create the 'notes' table if it doesn't exist
db.run("CREATE TABLE IF NOT EXISTS notes (id INTEGER PRIMARY KEY, content TEXT)", (err) => {
    if (err) {
        console.log("Error creating table", err);
    }
});

// GET /notes: Fetch all notes from the database
app.get('/notes', (req, res) => {
    db.all('SELECT * FROM notes', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(rows); // Ensure that rows is an array and is sent correctly
        }
    });
});

// POST /notes: Save a new note to the database
app.post('/notes', (req, res) => {
    const { content } = req.body;
    db.run('INSERT INTO notes (content) VALUES (?)', [content], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.status(201).json({ id: this.lastID, content });
        }
    });
});

// Start the server
app.listen(3000, () => {
    console.log("Server running at http://localhost:3000");
});


// node server.js