const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();
const port = 3000;

// Create directories if they don't exist
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}
if (!fs.existsSync('downloads')) {
    fs.mkdirSync('downloads');
}

// Set up multer for file handling
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Serve static files (public directory for HTML, CSS, JS)
app.use(express.static('public'));

// Serve converted files
app.use('/downloads', express.static(path.join(__dirname, 'downloads')));

// Handle file conversion
app.post('/convert', upload.single('files'), (req, res) => {
    const file = req.file;
    const format = req.body.format;
    const fileType = path.extname(file.originalname).slice(1).toLowerCase();

    if (!file) {
        return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    if (!format) {
        return res.status(400).json({ success: false, message: 'No format selected.' });
    }

    // Define incompatible conversions
    const incompatibleConversions = {
        'mp4': ['pptx', 'jpg', 'png'],
        'avi': ['pptx', 'jpg', 'png'],
        'mkv': ['pptx', 'jpg', 'png'],
        'mp3': ['pptx'],
        // Add more rules as needed
    };

    // Validate conversion
    if (incompatibleConversions[fileType] && incompatibleConversions[fileType].includes(format)) {
        return res.status(400).json({ success: false, message: `The selected file type (${fileType}) cannot be converted to ${format}.` });
    }

    // Perform conversion based on format
    convertFile(file.path, format, (err, convertedFilePath) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Conversion failed.' });
        }

        // Log the file path for debugging
        console.log(`File converted: ${convertedFilePath}`);

        // Provide the URL for the converted file
        res.json({ success: true, fileUrl: convertedFilePath });
    });
});

// Mock conversion function
function convertFile(filePath, format, callback) {
    const convertedFilePath = path.join('downloads', `${Date.now()}.${format}`);
    
    fs.copyFile(filePath, convertedFilePath, (err) => {
        if (err) return callback(err);
        callback(null, `/downloads/${path.basename(convertedFilePath)}`);
    });
}

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
