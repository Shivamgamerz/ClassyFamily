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

// ✅ Use __dirname correctly for Render
const publicPath = path.resolve(__dirname, "../public");  
console.log(`✅ Serving static files from: ${publicPath}`);

// ✅ Log project structure
const logProjectStructure = (dir, level = 0) => {
    const items = fs.readdirSync(dir);

    for (const item of items) {
        const itemPath = path.join(dir, item);
        const isFolder = fs.statSync(itemPath).isDirectory();

        console.log(`${"  ".repeat(level)}📁 ${item} (${isFolder ? "Folder" : "File"})`);

        if (isFolder) {
            logProjectStructure(itemPath, level + 1);
        }
    }
};

// ✅ Log the structure at startup
console.log("\n🔍 Project Structure:");
logProjectStructure(publicPath);

app.use(express.static(publicPath));

// ✅ Serve the index.html on the root route
app.get("/", (req, res) => {
    const indexPath = path.join(publicPath, "index.html");
    console.log(`📄 Serving index.html: ${indexPath}`);
    
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        console.error("❌ Index file not found");
        res.status(404).send("Index not found");
    }
});

// ✅ Serve the library folders
app.get("/library", (req, res) => {
    const libraryPath = path.join(publicPath, "library");
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

                console.log(`📦 ${item} (${stats.isDirectory() ? "Folder" : "File"})`);

                return {
                    name: item,
                    path: `/media/library/${item}`,
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
    console.log(`📂 Serving nested folder: ${folderPath}`);

    if (!fs.existsSync(folderPath)) {
        console.log(`❌ Folder not found: ${folderPath}`);
        return res.status(404).json({ message: "Folder not found" });
    }

    const items = fs.readdirSync(folderPath).map(item => {
        const itemPath = path.join(folderPath, item);
        const stats = fs.statSync(itemPath);

        console.log(`📦 ${item} (${stats.isDirectory() ? "Folder" : "File"})`);

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

// ✅ Google Drive video links
app.get('/drive-videos', (req, res) => {
    const driveVideosPath = path.join(__dirname, "google-drive-videos.json");
    console.log(`🎥 Serving Google Drive videos`);

    const videos = fs.existsSync(driveVideosPath)
        ? JSON.parse(fs.readFileSync(driveVideosPath, "utf8"))
        : [];

    res.json(videos);
});

// ✅ Start the server
app.listen(PORT, () => {
    console.log(`🔥 Server running at http://localhost:${PORT}`);
});
