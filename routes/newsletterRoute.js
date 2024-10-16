const express = require('express');
const upload = require('../middleware/MulterNewsletter'); // Assuming this is your multer config file
const pool = require('../services/DB')

const router = express.Router();

//#region POST
router.post('/add', upload.single('image'), (req, res) => {
    const { title, description, event_date } = req.body; // Assuming event_date is provided
    const image = req.file ? `/uploads/newsletters/${req.file.filename}` : null; // Relative path

    if (!title || !image || !event_date) {
        return res.status(400).json({ error: 'Title, image, and event date are required' });
    }

    // Add one day to the selected event date
    let selectedDate = new Date(event_date);
    selectedDate.setDate(selectedDate.getDate() + 1);

    const query = 'INSERT INTO newsletters (title, description, image_path, event_date) VALUES (?, ?, ?, ?)';
    const values = [title, description || '', image, selectedDate];

    pool.query(query, values, (err, result) => {
        if (err) {
            console.error('Error inserting newsletter:', err);
            return res.status(500).json({ message: 'Database error' });
        }
        res.status(201).json({ message: 'Newsletter added successfully with updated date'});
    });
});

//#endregion POST

//#region GET
router.get('/get', (req, res) => {
    const query = 'SELECT * FROM newsletters ORDER BY id DESC'; // Fetch all newsletters, most recent first

    pool.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching newsletters:', err);
            return res.status(500).json({ message: 'Database error' });
        }

        res.status(200).json({results: results});
    });
});

//#endregion GET

module.exports = router;

//#endregion
