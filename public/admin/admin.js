// ✅ Upload Media
const uploadForm = document.getElementById('upload-form');
const uploadStatus = document.getElementById('upload-status');
const folderSelect = document.getElementById('folder');  // Use the correct folder ID

uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(uploadForm);

    // ✅ Append selected folder name to FormData
    const selectedFolder = folderSelect.value;
    formData.append('folder', selectedFolder);

    try {
        const response = await fetch('http://localhost:3000/upload', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();
        uploadStatus.textContent = result.message;

        // Refresh the file list after upload
        loadFileList();

    } catch (error) {
        console.error('Error uploading file:', error);
    }
});

// ✅ Load Folders into the Dropdown Dynamically
async function loadFolders() {
    try {
        const response = await fetch('http://localhost:3000/library');
        const folders = await response.json();

        folderSelect.innerHTML = '';  // Clear existing options

        // ✅ Add folder options dynamically
        folders.forEach(folder => {
            if (folder.isFolder) {
                const option = document.createElement('option');
                option.value = folder.name;
                option.textContent = folder.name;
                folderSelect.appendChild(option);
            }
        });

        if (folders.length === 0) {
            const option = document.createElement('option');
            option.value = "";
            option.textContent = "No folders found";
            folderSelect.appendChild(option);
        }

    } catch (error) {
        console.error('Error loading folders:', error);
        folderSelect.innerHTML = '<option value="">Failed to load folders</option>';
    }
}

// ✅ Load Files
async function loadFileList() {
    const fileList = document.getElementById('file-list');
    fileList.innerHTML = '';

    try {
        const response = await fetch('http://localhost:3000/files');
        const files = await response.json();

        files.forEach((file) => {
            const item = document.createElement('div');
            item.classList.add('file-item');

            item.innerHTML = `
                <span>${file}</span>
                <button onclick="deleteFile('${file}')">Delete</button>
            `;

            fileList.appendChild(item);
        });

    } catch (error) {
        console.error('Error loading files:', error);
    }
}

// ✅ Delete Files
async function deleteFile(filename) {
    const response = await fetch(`http://localhost:3000/delete/${filename}`, {
        method: 'DELETE'
    });

    const result = await response.json();
    alert(result.message);

    // Refresh file list
    loadFileList();
}

// ✅ Load folders and files on page load
window.onload = () => {
    loadFolders();
    loadFileList();
};
