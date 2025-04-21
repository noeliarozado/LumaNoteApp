const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const multer = require("multer");
const path = require("path");

const app = express();
const port = 3000;

// Serve static files from the frontend folder
app.use(express.static(path.join(__dirname, 'frontend')));

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Set up image storage
const storage = multer.diskStorage({
    destination: "uploads/",
    filename: (req, file, cb) => {
        const cleanName = file.originalname
            .toLowerCase()
            .replace(/\s+/g, "_")
            .replace(/[^a-z0-9_.-]/g, "");

        cb(null, cleanName);
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

// Create 'notes' table
db.run(`
    CREATE TABLE IF NOT EXISTS notes (
        id INTEGER PRIMARY KEY, 
        content TEXT, 
        image_url TEXT, 
        date TEXT,
        favorite INTEGER DEFAULT 0
    )
`, (err) => {
    if (err) console.log("Error creating table", err);
});

// Fetch all notes
app.get("/notes", (req, res) => {
    db.all("SELECT * FROM notes ORDER BY favorite DESC, date DESC", [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }

        // Format the date before sending it to the frontend
        const formattedNotes = rows.map(note => ({
            ...note,
            date: new Date(note.date).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric"
            })
        }));

        res.json(formattedNotes);
    });
});

// Add a new note
app.post("/notes", upload.single("image"), (req, res) => {
    const { content } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
    const options = { day: "numeric", month: "long", year: "numeric" };
    const date = new Date().toLocaleDateString("en-GB", options);


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

// Toggle favorite status
app.put("/notes/:id/favorite", (req, res) => {
    const { id } = req.params;
    db.run("UPDATE notes SET favorite = NOT favorite WHERE id = ?", [id], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ message: "Favorite status updated" });
        }
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});


//node server.js