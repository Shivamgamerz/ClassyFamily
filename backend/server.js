const express = require("express");
const fs = require("fs");
const cors = require("cors");
const path = require("path");
const mime = require("mime-types");
const nodemailer = require("nodemailer");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Use proper path resolution for Render
const publicPath = path.join(__dirname, "public"); 
console.log(`Serving static files from: ${publicPath}`);

app.use(express.static(publicPath));

// ✅ Serve index.html for the root route
app.get("/", (req, res) => {
    res.sendFile(path.join(publicPath, "index.html"));
});

// ✅ Serve the main library folders
app.get("/library", (req, res) => {
    const libraryPath = path.join(publicPath, "library");

    if (!fs.existsSync(libraryPath)) {
        console.log(`Library not found: ${libraryPath}`);
        return res.status(404).json({ message: "Library not found" });
    }

    const getFolderContent = (folderPath) => {
        try {
            const items = fs.readdirSync(folderPath).map(item => {
                const itemPath = path.join(folderPath, item);
                const stats = fs.statSync(itemPath);

                return {
                    name: item,
                    path: `/media/library/${item}`,
                    isFolder: stats.isDirectory()
                };
            });

            return items;

        } catch (error) {
            console.error(`Failed to read folder: ${error.message}`);
            return [];
        }
    };

    const folders = getFolderContent(libraryPath);

    const driveVideosPath = path.join(__dirname, "google-drive-videos.json");
    const driveVideos = fs.existsSync(driveVideosPath)
        ? JSON.parse(fs.readFileSync(driveVideosPath, "utf8"))
        : [];

    const combinedContent = [...folders, ...driveVideos.map(video => ({
        name: video.name,
        path: video.path,
        isFolder: false,
        type: "google-drive"
    }))];

    res.json(combinedContent);
});

// ✅ Serve content inside nested folders
app.get("/library/*", (req, res) => {
    const folderPath = path.join(publicPath, "library", req.params[0]);

    if (!fs.existsSync(folderPath)) {
        console.log(`Folder not found: ${folderPath}`);
        return res.status(404).json({ message: "Folder not found" });
    }

    const items = fs.readdirSync(folderPath).map(item => {
        const itemPath = path.join(folderPath, item);
        const stats = fs.statSync(itemPath);

        return {
            name: item,
            path: `/media/library/${req.params[0]}/${item}`,
            isFolder: stats.isDirectory(),
            type: stats.isDirectory() ? "folder" : mime.lookup(itemPath) || "application/octet-stream"
        };
    });

    res.json(items);
});

// ✅ Serve media files (images and videos)
app.get("/media/*", (req, res) => {
    const mediaPath = path.join(publicPath, req.params[0]);

    if (fs.existsSync(mediaPath)) {
        const mimeType = mime.lookup(mediaPath) || "application/octet-stream";
        res.setHeader("Content-Type", mimeType);
        fs.createReadStream(mediaPath).pipe(res);
    } else {
        console.log(`Media not found: ${mediaPath}`);
        res.status(404).send("Media not found");
    }
});

// ✅ Login route
app.post("/login", (req, res) => {
    const { username, password } = req.body;
    const usersFilePath = path.join(__dirname, "users.json");

    if (!fs.existsSync(usersFilePath)) {
        return res.status(500).json({ message: "Users file not found" });
    }

    const users = JSON.parse(fs.readFileSync(usersFilePath, "utf8"));
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        res.status(200).json({ message: "Login successful" });
    } else {
        res.status(401).json({ message: "Invalid credentials" });
    }
});

// ✅ Google Drive video links
app.get('/drive-videos', (req, res) => {
    const driveVideosPath = path.join(__dirname, "google-drive-videos.json");
    
    const videos = fs.existsSync(driveVideosPath)
        ? JSON.parse(fs.readFileSync(driveVideosPath, "utf8"))
        : [];

    res.json(videos);
});

// ✅ List all files recursively
const listFiles = async (dir) => {
    let files = [];
    const items = await fs.promises.readdir(dir, { withFileTypes: true });

    for (const item of items) {
        const fullPath = path.join(dir, item.name);

        if (item.isDirectory()) {
            const subFiles = await listFiles(fullPath);
            files = files.concat(subFiles);
        } else {
            files.push(fullPath.replace(/\\/g, '/'));
        }
    }
    return files;
};

// ✅ List files for admin panel
app.get('/files', async (req, res) => {
    try {
        const files = await listFiles(path.join(publicPath, "library"));
        res.json(files);
    } catch (error) {
        console.error("Error listing files:", error);
        res.status(500).json({ message: "Failed to list files" });
    }
});

// ✅ Handle uploads
app.use('/upload', require('./upload'));

// ✅ Handle deletes
app.use('/delete', require('./delete'));

// ✅ Route to add Google Drive videos
app.post('/add-drive-video', (req, res) => {
    const { name, url } = req.body;

    if (!name || !url) {
        return res.status(400).json({ message: "Name and URL are required" });
    }

    const driveVideosPath = path.join(__dirname, "google-drive-videos.json");
    
    const videos = fs.existsSync(driveVideosPath)
        ? JSON.parse(fs.readFileSync(driveVideosPath, "utf8"))
        : [];

    videos.push({ name, path: url });

    fs.writeFileSync(driveVideosPath, JSON.stringify(videos, null, 2));

    res.status(201).json({ message: "Video added successfully", video: { name, url } });
});

// ✅ Start the server
app.listen(PORT, () => console.log(`🔥 Server running at http://localhost:${PORT}`));
