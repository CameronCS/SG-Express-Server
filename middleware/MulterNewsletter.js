const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Middleware to check if folder exists and create it if it doesn't
const createFolderIfNotExists = (folderPath) => {
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
    }
};

// Configure multer storage dynamically based on is_admin field from req.body
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const folderPath = path.join(__dirname, '..', 'uploads', 'newsletters');
        createFolderIfNotExists(folderPath); // Ensure the folder exists

        cb(null, folderPath);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
    }
});

// File upload settings
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png/;
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
