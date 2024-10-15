const express = require('express');
const router = express.Router();
const pool = require('../services/DB'); // Assuming you have a pool setup for database
const upload = require('../middleware/MulterResources');


//#region POST

router.post('/add', upload.single('file'), (req, res) => {
    const { type, title, uploaded_by, tip_text } = req.body;

    if (!type || !title || !uploaded_by) {
        return res.status(400).json({ error: 'Resource type, title, and uploaded_by are required' });
    }

    // Prepare insertion based on type
    let insertQuery;
    let params;
    let filePath; // Variable to store the file path

    switch (type) {
        case 'media':
            if (!req.file) {
                return res.status(400).json({ error: 'File is required for media resource' });
            }
            filePath = `/uploads/resources/media/${req.file.filename}`;
            insertQuery = 'INSERT INTO media_resources (title, file_path, uploaded_by) VALUES (?, ?, ?)';
            params = [title, filePath, uploaded_by];
            break;
        case 'arts_and_crafts':
            if (!req.file) {
                return res.status(400).json({ error: 'File is required for arts and crafts resource' });
            }
            filePath = `/uploads/resources/arts_and_crafts/${req.file.filename}`;
            insertQuery = 'INSERT INTO arts_and_crafts_resources (title, file_path, uploaded_by) VALUES (?, ?, ?)';
            params = [title, filePath, uploaded_by];
            break;
        case 'additional':
            if (!req.file) {
                return res.status(400).json({ error: 'File is required for additional resource' });
            }
            filePath = `/uploads/resources/additional/${req.file.filename}`;
            insertQuery = 'INSERT INTO additional_resources (title, file_path, uploaded_by) VALUES (?, ?, ?)';
            params = [title, filePath, uploaded_by];
            break;
        case 'tips':
            if (!tip_text) {
                return res.status(400).json({ error: 'Tip text is required for tips resources' });
            }
            insertQuery = 'INSERT INTO tips_resources (title, tip_text, uploaded_by) VALUES (?, ?, ?)';
            params = [title, tip_text, uploaded_by];
            break;
        default:
            return res.status(400).json({ error: 'Invalid resource type' });
    }

    // Insert into the database
    pool.query(insertQuery, params, (err, result) => {
        if (err) {
            console.error('Database error while inserting resource:', err);
            return res.status(500).json({ error: 'Database error while inserting resource' });
        }

        res.status(201).json({ message: 'Resource added successfully', resourceId: result.insertId });
    });
});
//#endregion POST


//#region GET
router.get('/get', (req, res) => {
    const { type } = req.query;

    console.log(type);

    let selectQuery;

    // Prepare the SQL query based on resource type
    switch (type) {
        case 'media':
            selectQuery = 'SELECT id, title, file_path, uploaded_by, upload_date FROM media_resources';
            break;
        case 'arts_and_crafts':
            selectQuery = 'SELECT id, title, file_path, uploaded_by, upload_date FROM arts_and_crafts_resources';
            break;
        case 'additional':
            selectQuery = 'SELECT id, title, file_path, uploaded_by, upload_date FROM additional_resources';
            break;
        case 'tips':
            selectQuery = 'SELECT id, title, tip_text, uploaded_by, upload_date FROM tips_resources';
            break;
        default:
            return res.status(400).json({ error: 'Invalid resource type' });
    }

    // Execute the query
    pool.query(selectQuery, (err, results) => {
        if (err) {
            console.error('Database error while fetching resources:', err);
            return res.status(500).json({ error: 'Database error while fetching resources' });
        }

        
        let response = { message: "Resources Loaded", resources: results }
        // console.log(response);
        
        // Return the results
        res.status(200).json(response);
    });
});
//#endregion

module.exports = router;
