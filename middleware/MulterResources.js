const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Middleware to check if folder exists and create it if it doesn't
const createFolderIfNotExists = (folderPath) => {
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
    }
};

// Configure multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const { type } = req.body; // Get the resource type from the body
        let folderPath;

        // Set folder path based on resource type
        switch (type) {
            case 'media':
                folderPath = path.join(__dirname, '..', 'uploads', 'resources', 'media');
                break;
            case 'arts_and_crafts':
                folderPath = path.join(__dirname, '..', 'uploads', 'resources', 'arts_and_crafts');
                break;
            case 'additional':
                folderPath = path.join(__dirname, '..', 'uploads', 'resources', 'additional');
                break;
            case 'tips':
                // Tips do not have a file upload, so just set a dummy path
                folderPath = path.join(__dirname, '..', 'uploads', 'resources', 'tips');
                break;
            default:
                return cb(new Error('Invalid resource type'));
        }

        createFolderIfNotExists(folderPath); // Ensure the folder exists
        cb(null, folderPath);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
    }
});

const upload = multer({ storage: storage });

module.exports = upload;
