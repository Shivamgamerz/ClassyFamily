const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// ✅ Custom middleware to parse the folder field before handling file upload
router.use(express.urlencoded({ extended: true }));

// ✅ Configure Multer with Dynamic Folder
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const selectedFolder = req.body.folder || 'library';  // Get the selected folder
        const uploadPath = path.join(__dirname, '../public/library', selectedFolder);

        // Ensure the folder exists
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }

        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage: storage });

// ✅ Handle single file upload
router.post('/', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    res.json({ 
        message: `File uploaded to ${req.body.folder} successfully`, 
        file: req.file 
    });
});

module.exports = router;
