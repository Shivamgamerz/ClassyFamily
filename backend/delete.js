const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

router.delete('/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '../public/library', filename);

    fs.unlink(filePath, (err) => {
        if (err) {
            return res.status(500).send('Failed to delete the file.');
        }
        res.json({ message: 'File deleted successfully' });
    });
});

module.exports = router;
