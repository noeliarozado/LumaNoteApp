/*

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

*/


/*
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Notes App</title>
    <style>
        body {
            font-family: Arial, sans-serif;
        }
        #notesList {
            list-style-type: none;
            padding: 0;
        }
        #notesList li {
            padding: 10px;
            margin-bottom: 5px;
            background-color: #f4f4f4;
            border-radius: 5px;
        }
    </style>
</head>
<body>
    <h1>Notes App</h1>

    <!-- Note input -->
    <textarea id="noteInput" placeholder="Write your note here..." rows="4" cols="50"></textarea><br>
    <button onclick="addNote()">Save Note</button>

    <h2>Saved Notes</h2>
    <ul id="notesList"></ul>

    <script>
        // Function to load and display notes
        function loadNotes() {
            fetch("http://localhost:3000/notes")
                .then(response => response.json()) // Parse the JSON response
                .then(data => {
                    if (Array.isArray(data)) { // Ensure data is an array
                        const notesList = document.getElementById("notesList");
                        notesList.innerHTML = ""; // Clear current notes

                        // Iterate over the notes array and display each note
                        data.map(note => {
                            const listItem = document.createElement("li");
                            listItem.textContent = note.content;
                            notesList.appendChild(listItem);
                        });
                    } else {
                        console.error('Error: Expected an array of notes');
                    }
                })
                .catch(error => console.log('Error loading notes:', error));
        }

        // Function to add a new note
        function addNote() {
            const noteContent = document.getElementById("noteInput").value;

            // Ensure there is content before sending a request
            if (noteContent.trim() === "") {
                alert("Please enter some text for the note!");
                return;
            }

            fetch("http://localhost:3000/notes", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ content: noteContent }) // Send the note content as JSON
            })
            .then(response => response.json())
            .then(() => {
                loadNotes(); // Reload the list of notes after saving
                document.getElementById("noteInput").value = ""; // Clear the input field
            })
            .catch(error => console.log('Error saving note:', error));
        }

        // Load notes when the page is loaded
        window.onload = loadNotes;
    </script>
</body>
</html>
*/

const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const app = express();

app.use(cors());
app.use(express.json());

// Connect to SQLite database
const db = new sqlite3.Database('./notes.db', (err) => {
    if (err) {
        console.error("Error connecting to the database", err);
    } else {
        console.log("Connected to SQLite database");
    }
});

// Create 'notes' table with date column
db.run(`
    CREATE TABLE IF NOT EXISTS notes (
        id INTEGER PRIMARY KEY,
        content TEXT,
        date TEXT
    )
`);

// Fetch all notes, ordered by date
app.get('/notes', (req, res) => {
    db.all('SELECT * FROM notes ORDER BY date DESC, id ASC', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(rows);
        }
    });
});

// Save a new note with the current date
app.post('/notes', (req, res) => {
    const { content } = req.body;
    const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

    db.run('INSERT INTO notes (content, date) VALUES (?, ?)', [content, date], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.status(201).json({ id: this.lastID, content, date });
        }
    });
});

// Update a note
app.put('/notes/:id', (req, res) => {
    const { content } = req.body;
    const id = req.params.id;

    db.run('UPDATE notes SET content = ? WHERE id = ?', [content, id], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ message: "Note updated successfully" });
        }
    });
});

// Delete a note
app.delete('/notes/:id', (req, res) => {
    const id = req.params.id;

    db.run('DELETE FROM notes WHERE id = ?', [id], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ message: "Note deleted successfully" });
        }
    });
});

// Start server
app.listen(3000, () => {
    console.log("Server running at http://localhost:3000");
});
