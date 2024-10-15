const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Middleware to check if folder exists and create it if it doesn't
const createFolderIfNotExists = (folderPath) => {
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
    }
};

// Configure multer storage dynamically based on event_name and year from req.body
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const { event_name, year } = req.body; // Get event name and year from request body
        const folderPath = path.join(__dirname, '..', 'uploads', 'Gallery', `${event_name}_${year}`); // Updated path
        createFolderIfNotExists(folderPath); // Ensure the folder exists
        cb(null, folderPath);
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname); // Use the original filename
    }
});

// File upload settings
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png|gif/; // Added gif to file types
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);

        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error('Only images are allowed!'));
        }
    }
});

module.exports = upload;
