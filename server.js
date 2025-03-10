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


//node server.js