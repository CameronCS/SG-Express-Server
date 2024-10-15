const express = require('express');
const upload = require('../middleware/MulterNewsletter'); // Assuming this is your multer config file
const pool = require('../services/DB')

const router = express.Router();

//#region POST
router.post('/add', upload.single('image'), (req, res) => {
    const { title, description } = req.body;
    const image = req.file ? `/uploads/newsletters/${req.file.filename}` : null; // Relative path

    if (!title || !image) {
        return res.status(400).json({ error: 'Title and image are required' });
    }

    const query = 'INSERT INTO newsletters (title, description, image_path) VALUES (?, ?, ?)';
    const values = [title, description || '', image];

    pool.query(query, values, (err, result) => {
        if (err) {
            console.error('Error inserting newsletter:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.status(201).json({ message: 'Newsletter added successfully', newsletterId: result.insertId });
    });
});
//#endregion POST

//#region GET
router.get('/get', (req, res) => {
    const query = 'SELECT * FROM newsletters ORDER BY id DESC'; // Fetch all newsletters, most recent first

    pool.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching newsletters:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        res.status(200).json(results);
    });
});

//#endregion GET

module.exports = router;

//#endregion
