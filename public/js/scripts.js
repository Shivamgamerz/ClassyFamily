// Smooth Scroll Functionality
const links = document.querySelectorAll('nav ul li a');
links.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// Login Button Mockup
const loginBtn = document.getElementById('loginBtn');
if (loginBtn) {
  loginBtn.addEventListener('click', () => {
    console.log("Login button clicked");  // For debugging
  });
}

// Video Pop-up Functionality
const videoPopup = document.getElementById('videoPopup');
const popupVideo = document.getElementById('popupVideo');

function openPopup(videoSrc) {
  if (popupVideo && videoPopup) {
    popupVideo.src = videoSrc;
    videoPopup.style.display = 'flex';
  }
}

function closePopup() {
  if (videoPopup && popupVideo) {
    videoPopup.style.display = 'none';
    popupVideo.pause();
    popupVideo.currentTime = 0;
  }
}

// Form Validation and AJAX Submission
const contactForm = document.getElementById('contactForm');
const formMsg = document.getElementById('formMsg');

if (contactForm && formMsg) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const message = document.getElementById('message').value.trim();

    if (name === '' || email === '' || message === '') {
      formMsg.textContent = 'All fields are required!';
      formMsg.style.color = 'red';
      return;
    }

    // Simulate AJAX request
    formMsg.textContent = 'Sending...';
    formMsg.style.color = 'orange';

    setTimeout(() => {
      formMsg.textContent = 'Message Sent Successfully!';
      formMsg.style.color = 'green';
      contactForm.reset();
    }, 1000);
  });
}

// Close Popup on Escape Key Press
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && videoPopup && videoPopup.style.display === 'flex') {
    closePopup();
  }
});

// Combined DOMContentLoaded for Efficiency
document.addEventListener("DOMContentLoaded", () => {
  const animatedText = document.querySelector('.animated-text');

  if (animatedText) {
    // Function to update the text based on screen size
    const updateText = () => {
      if (window.innerWidth <= 768) {
        animatedText.textContent = "ClassyShivy";  // On smaller screens
      } else {
        animatedText.textContent = "Welcome to ClassyShivy";  // On larger screens
      }
    };

    // Initial text setting with animation delay
    setTimeout(updateText, 500);

    // Update text on window resize
    window.addEventListener('resize', updateText);
  }
});


// Handle login and logout
const savedUsername = localStorage.getItem('username');
const usernameDisplay = document.getElementById('usernameDisplay');
const logoutBtn = document.getElementById('logoutBtn');

if (savedUsername && usernameDisplay && logoutBtn) {
  usernameDisplay.textContent = `👤${savedUsername}`;   // ✅ Fixed backtick syntax
  usernameDisplay.style.display = 'inline-block';

  if (loginBtn) loginBtn.style.display = 'none';
  logoutBtn.style.display = 'inline-block';

  // Logout logic with redirect to index.html
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('username');
    window.location.href = 'index.html';  // ✅ Redirect to index.html
  });
}

