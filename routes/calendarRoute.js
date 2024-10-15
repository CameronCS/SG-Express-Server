const express = require('express')

const pool = require('../services/DB')
const router = express.Router()

//#region POST

router.post('/add', (req, res) => {
    const { title, description, event_date } = req.body;
    
    console.log('Title ', title, ' description ', description, ' evnet_data ', event_date)

    // Check if all required fields are provided
    if (!title || !event_date) {
        return res.status(400).json({ message: 'Title and event date are required' });
    }
    
    const query = 'INSERT INTO calendar (title, description, event_date) VALUES (?, ?, ?)';
    const values = [title, description || '', event_date];

    // Assuming you have a MySQL connection pool
    pool.query(query, values, (err, result) => {
        if (err) {
            console.error('Error inserting event:', err);
            return res.status(500).json({ message: 'Database error' });
        }
        
        res.status(201).json({ message: 'Event added successfully', eventId: result.insertId });
    });
});

//#endregion POST

//#region GET 

router.get('/get', (req, res) => {
    const query = 'SELECT * FROM calendar ORDER BY event_date ASC';

    pool.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching events:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        res.status(200).json({results: results});
    });
});


//#endregion

module.exports = router;