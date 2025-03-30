const form = document.getElementById('drive-video-form');
const statusDiv = document.getElementById('status');
const videoList = document.getElementById('video-list');

// ✅ Load existing videos on page load
async function loadVideos() {
    try {
        const response = await fetch('http://localhost:3000/drive-videos');
        const videos = await response.json();

        videoList.innerHTML = '';  // Clear existing list

        if (videos.length === 0) {
            videoList.innerHTML = '<li>No videos added yet.</li>';
            return;
        }

        videos.forEach(video => {
            const li = document.createElement('li');
            li.innerHTML = `
                <strong>${video.name}</strong> - 
                <a href="${video.path}" target="_blank">Watch</a>
            `;
            videoList.appendChild(li);
        });

    } catch (error) {
        console.error('Error loading videos:', error);
        statusDiv.textContent = 'Failed to load videos.';
    }
}

// ✅ Handle form submission
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = form.name.value;
    const url = form.url.value;

    if (!name || !url) {
        statusDiv.textContent = 'Please fill in both fields.';
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/add-drive-video', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, url })
        });

        if (response.ok) {
            const result = await response.json();
            statusDiv.textContent = result.message;

            // ✅ Reload the videos list
            loadVideos();
        } else {
            statusDiv.textContent = 'Failed to add video.';
        }

    } catch (error) {
        console.error('Error adding video:', error);
        statusDiv.textContent = 'Error adding video.';
    }

    // ✅ Clear the form fields
    form.reset();
});

// ✅ Load videos when the page loads
window.onload = loadVideos;
