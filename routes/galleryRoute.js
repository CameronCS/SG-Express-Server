const express = require('express');
const router = express.Router();
const pool = require('../services/DB');
const upload = require('../middleware/MulterGallery');

//#region POST

router.post('/add', upload.single('image'), (req, res) => {
    const { event_name, year } = req.body;

    if (!event_name || !year || !req.file) {
        return res.status(400).json({ error: 'Event name, year, and image are required' });
    }

    // Get the filename to build the correct image path
    const filename = req.file.filename;

    // Check if the collection exists, if not, insert the new collection
    const checkCollectionQuery = 'SELECT id FROM gallery_collection WHERE event_name = ? AND year = ?';
    pool.query(checkCollectionQuery, [event_name, year], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database error while checking collection' });
        }

        let collection_id;  

        // If the collection exists, get its id
        if (results.length > 0) {
            collection_id = results[0].id;
        } else {
            // If the collection does not exist, create it and get the id
            const insertCollectionQuery = 'INSERT INTO gallery_collection (event_name, year) VALUES (?, ?)';
            pool.query(insertCollectionQuery, [event_name, year], (err, result) => {
                if (err) {
                    return res.status(500).json({ error: 'Database error while inserting collection' });
                }
                collection_id = result.insertId; // Get the new collection id
                insertImage(collection_id, `uploads/Gallery/${event_name}_${year}/${filename}`, res); // Move insertImage here
            });
            return; // Prevent further processing
        }

        // Construct the correct image path
        const imagePath = `/uploads/Gallery/${event_name}_${year}/${filename}`; // Updated image path

        // Insert the image into gallery_images table
        insertImage(collection_id, imagePath, res);
    });
});

// Helper function to insert image into gallery_images table
const insertImage = (collection_id, imagePath, res) => {
    console.log(`Inserting image with collection_id: ${collection_id}, imagePath: ${imagePath}`); // Debugging info
    const insertImageQuery = 'INSERT INTO gallery_images (collection_id, image_path) VALUES (?, ?)';
    pool.query(insertImageQuery, [collection_id, imagePath], (err, result) => {
        if (err) {
            console.error('Error inserting image into gallery_images:', err); // Log the error
            return res.status(500).json({ error: 'Database error while inserting image' });
        }
        res.status(201).json({ message: 'Image uploaded successfully', imageId: result.insertId });
    });
};
//#endregion POST

//#region GET

router.post('/get', (req, res) => {
    const { year } = req.query;
    const { event_name } = req.body; // Get event_name from request body

    if (!event_name) {
        return res.status(400).json({ error: 'Event name is required' });
    }

    // SQL query to join gallery_collection and gallery_images tables
    const getImagesQuery = `
        SELECT gi.id, gi.image_path 
        FROM gallery_images gi 
        JOIN gallery_collection gc ON gi.collection_id = gc.id 
        WHERE gc.event_name = ? AND gc.year = ?`;

    pool.query(getImagesQuery, [event_name, year], (err, results) => {
        if (err) {
            console.error('Database error while fetching images:', err);
            return res.status(500).json({ error: 'Database error while fetching images' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'No images found for this event and year' });
        }

        // Return the images
        res.status(200).json({"Message": "Images Pulled Successfully", "images": results});
    });
});

router.get('/get-names', (req, res) => {
    const { year } = req.query;  // Extract year from query params

    const query = `
        SELECT 
            gc.event_name, 
            MIN(gi.image_path) AS first_image_path
        FROM 
            gallery_collection gc
        LEFT JOIN 
            gallery_images gi ON gc.id = gi.collection_id
        WHERE 
            gc.year = ?
        GROUP BY 
            gc.id, gc.event_name
    `;

    pool.query(query, [year], (err, results) => {  // Pass year as a parameter
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database query error' });
        }

        const names = results.map(row => row.event_name);
        const imagePaths = results.map(row => row.first_image_path);

        res.status(200).json({ 
            message: "All events selected", 
            events: names, 
            image_paths: imagePaths 
        });
    });
});

router.get('/get-years', (req, res) => {
    pool.query('SELECT DISTINCT year FROM gallery_collection', (error, results) => {
        if (error) {
            return res.status(500).json({ message: 'Database query failed' });
        }

        // Map over results to extract years as strings
        const years = results.map(row => row.year.toString());

        // Send response with years as strings
        res.json({
            results: years,
            message: 'Success'
        });
    });
});




//#endregion

module.exports = router;
