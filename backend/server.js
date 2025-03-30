const express = require("express");
const fs = require("fs");
const cors = require("cors");
const path = require("path");
const mime = require("mime-types");
const nodemailer = require("nodemailer");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Render uses `/opt/render/project/src` as the root directory
const basePath = path.resolve(__dirname, "../public");
console.log(`✅ Serving static files from: ${basePath}`);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Serve static files properly
app.use("/media", express.static(path.join(basePath, "library")));
app.use(express.static(basePath));

// ✅ Serve index.html correctly
app.get("/", (req, res) => {
    const indexPath = path.join(basePath, "index.html");

    if (fs.existsSync(indexPath)) {
        console.log(`📄 Serving index.html: ${indexPath}`);
        res.sendFile(indexPath);
    } else {
        console.error("❌ Index file not found");
        res.status(404).send("Index not found");
    }
});

// ✅ Serve the library folders
app.get("/library", (req, res) => {
    const libraryPath = path.join(basePath, "library");
    console.log(`📁 Serving library from: ${libraryPath}`);

    if (!fs.existsSync(libraryPath)) {
        console.log(`❌ Library not found: ${libraryPath}`);
        return res.status(404).json({ message: "Library not found" });
    }

    const getFolderContent = (folderPath) => {
        try {
            const items = fs.readdirSync(folderPath).map(item => {
                const itemPath = path.join(folderPath, item);
                const stats = fs.statSync(itemPath);

                return {
                    name: item,
                    path: `/media/${path.relative(basePath, itemPath).replace(/\\/g, "/")}`,
                    isFolder: stats.isDirectory()
                };
            });

            return items;

        } catch (error) {
            console.error(`❌ Failed to read folder: ${error.message}`);
            return [];
        }
    };

    const folders = getFolderContent(libraryPath);

    const driveVideosPath = path.join(__dirname, "google-drive-videos.json");
    console.log(`🎥 Fetching Google Drive videos from: ${driveVideosPath}`);

    const driveVideos = fs.existsSync(driveVideosPath)
        ? JSON.parse(fs.readFileSync(driveVideosPath, "utf8"))
        : [];

    const combinedContent = [...folders, ...driveVideos.map(video => ({
        name: video.name,
        path: video.path,
        isFolder: false,
        type: "google-drive"
    }))];

    console.log(`✅ Folders + Drive Videos: ${JSON.stringify(combinedContent, null, 2)}`);
    res.json(combinedContent);
});

// ✅ Serve nested folder content
app.get("/library/*", (req, res) => {
    const folderPath = path.join(basePath, "library", req.params[0]);
    console.log(`📂 Serving nested folder: ${folderPath}`);

    if (!fs.existsSync(folderPath)) {
        console.log(`❌ Folder not found: ${folderPath}`);
        return res.status(404).json({ message: "Folder not found" });
    }

    const items = fs.readdirSync(folderPath).map(item => {
        const itemPath = path.join(folderPath, item);
        const stats = fs.statSync(itemPath);

        return {
            name: item,
            path: `/media/${path.relative(basePath, itemPath).replace(/\\/g, "/")}`,
            isFolder: stats.isDirectory(),
            type: stats.isDirectory() ? "folder" : mime.lookup(itemPath) || "application/octet-stream"
        };
    });

    res.json(items);
});

// ✅ Serve media files
app.get("/media/*", (req, res) => {
    const mediaPath = path.join(basePath, req.params[0]);
    console.log(`🖼️ Serving media: ${mediaPath}`);

    if (fs.existsSync(mediaPath)) {
        const mimeType = mime.lookup(mediaPath) || "application/octet-stream";
        res.setHeader("Content-Type", mimeType);
        fs.createReadStream(mediaPath).pipe(res);
    } else {
        console.log(`❌ Media not found: ${mediaPath}`);
        res.status(404).send("Media not found");
    }
});

// ✅ Google Drive video links
app.get('/drive-videos', (req, res) => {
    const driveVideosPath = path.join(__dirname, "google-drive-videos.json");
    console.log(`🎥 Serving Google Drive videos`);

    const videos = fs.existsSync(driveVideosPath)
        ? JSON.parse(fs.readFileSync(driveVideosPath, "utf8"))
        : [];

    console.log(`✅ Google Drive videos: ${JSON.stringify(videos, null, 2)}`);
    res.json(videos);
});

// ✅ Login route
app.post("/login", (req, res) => {
    const { username, password } = req.body;
    const usersFilePath = path.join(__dirname, "users.json");

    console.log(`🔑 Login attempt: ${username}`);

    if (!fs.existsSync(usersFilePath)) {
        return res.status(500).json({ message: "Users file not found" });
    }

    const users = JSON.parse(fs.readFileSync(usersFilePath, "utf8"));
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        console.log(`✅ Login successful: ${username}`);
        res.status(200).json({ message: "Login successful" });
    } else {
        console.log(`❌ Invalid credentials for: ${username}`);
        res.status(401).json({ message: "Invalid credentials" });
    }
});

// ✅ Start the server
app.listen(PORT, () => {
    console.log(`🔥 Server running at http://localhost:${PORT}`);
});
