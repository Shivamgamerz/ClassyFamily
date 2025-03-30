document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        if (!username || !password) {
            alert("Please enter both username and password.");
            return;
        }

        try {
            // ✅ Use relative path (works locally & on Render)
            const response = await fetch('/login', {   
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const result = await response.json();

            if (response.ok) {
                localStorage.setItem('username', username);

                // ✅ Add a short delay to prevent login lag
                setTimeout(() => {
                    window.location.href = 'index2.html';
                }, 300);  // 300ms delay
            } else {
                alert(result.message || "Invalid login credentials");
            }
        } catch (error) {
            console.error("Login failed:", error);
            alert("Failed to connect to the server. Please try again.");
        }
    });
});
