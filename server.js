/*

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

*/

//node server.js

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
        .date-header {
            font-weight: bold;
            font-size: 1.2em;
            margin-top: 15px;
        }
        button {
            margin-left: 10px;
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
                .then(response => response.json())
                .then(data => {
                    if (Array.isArray(data)) {
                        const notesList = document.getElementById("notesList");
                        notesList.innerHTML = "";

                        let lastDate = "";

                        data.forEach(note => {
                            // Add a date header if it's a new day
                            if (note.date !== lastDate) {
                                lastDate = note.date;
                                const dateHeader = document.createElement("h3");
                                dateHeader.textContent = new Date(note.date).toDateString();
                                dateHeader.classList.add("date-header");
                                notesList.appendChild(dateHeader);
                            }

                            // Create the note item
                            const listItem = document.createElement("li");
                            listItem.textContent = note.content;

                            // Edit Button
                            const editButton = document.createElement("button");
                            editButton.textContent = "Edit";
                            editButton.onclick = () => editNote(note.id, note.content);

                            // Delete Button
                            const deleteButton = document.createElement("button");
                            deleteButton.textContent = "Delete";
                            deleteButton.onclick = () => deleteNote(note.id);

                            listItem.appendChild(editButton);
                            listItem.appendChild(deleteButton);
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

            if (noteContent.trim() === "") {
                alert("Please enter some text for the note!");
                return;
            }

            fetch("http://localhost:3000/notes", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ content: noteContent })
            })
            .then(() => {
                loadNotes();
                document.getElementById("noteInput").value = "";
            })
            .catch(error => console.log('Error saving note:', error));
        }

        // Function to edit a note
        function editNote(id, oldContent) {
            const newContent = prompt("Edit your note:", oldContent);
            if (newContent !== null) {
                fetch(`http://localhost:3000/notes/${id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ content: newContent })
                })
                .then(() => loadNotes())
                .catch(error => console.log('Error editing note:', error));
            }
        }

        // Function to delete a note
        function deleteNote(id) {
            if (confirm("Are you sure you want to delete this note?")) {
                fetch(`http://localhost:3000/notes/${id}`, {
                    method: "DELETE"
                })
                .then(() => loadNotes())
                .catch(error => console.log('Error deleting note:', error));
            }
        }

        // Load notes when the page is loaded
        window.onload = loadNotes;
    </script>
</body>
</html>
*/

const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const multer = require("multer");
const path = require("path");

const app = express();
const port = 3000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Set up image storage
const storage = multer.diskStorage({
    destination: "uploads/",
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// Serve uploaded images
app.use("/uploads", express.static("uploads"));

// Connect to SQLite database
const db = new sqlite3.Database("./notes.db", (err) => {
    if (err) {
        console.error("Error connecting to database", err);
    } else {
        console.log("Connected to SQLite database");
    }
});

// Create 'notes' table with image support and date
db.run(`
    CREATE TABLE IF NOT EXISTS notes (
        id INTEGER PRIMARY KEY, 
        content TEXT, 
        image_url TEXT, 
        date TEXT
    )
`, (err) => {
    if (err) console.log("Error creating table", err);
});

// Fetch all notes
app.get("/notes", (req, res) => {
    db.all("SELECT * FROM notes ORDER BY date DESC, id DESC", [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(rows);
        }
    });
});

// Add a new note
app.post("/notes", upload.single("image"), (req, res) => {
    const { content } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
    const date = new Date().toLocaleDateString("en-US", {
        weekday: "long", month: "long", day: "numeric", year: "numeric"
    });

    db.run("INSERT INTO notes (content, image_url, date) VALUES (?, ?, ?)",
        [content, imageUrl, date], function (err) {
            if (err) {
                res.status(500).json({ error: err.message });
            } else {
                res.status(201).json({ id: this.lastID, content, image_url: imageUrl, date });
            }
        });
});

// Edit a note
app.put("/notes/:id", (req, res) => {
    const { content } = req.body;
    const id = req.params.id;

    db.run("UPDATE notes SET content = ? WHERE id = ?", [content, id], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ message: "Note updated successfully" });
        }
    });
});

// Delete a note
app.delete("/notes/:id", (req, res) => {
    const id = req.params.id;

    db.run("DELETE FROM notes WHERE id = ?", [id], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ message: "Note deleted successfully" });
        }
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
