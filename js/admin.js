// Admin Authentication and Session Management

// Key for storing authentication data in localStorage
const AUTH_KEY = 'blobe_cars_admin_auth';

// Check if user is logged in
function isLoggedIn() {
  const auth = localStorage.getItem(AUTH_KEY);
  if (!auth) return false;
  
  try {
    const authData = JSON.parse(auth);
    // Check if token exists
    return !!authData.token;
  } catch (error) {
    return false;
  }
}

// Redirect to login if not authenticated
function requireAuth() {
  if (!isLoggedIn()) {
    // If current page is not the login page, redirect to login
    if (!window.location.pathname.includes('login.html')) {
      window.location.href = 'login.html';
    }
    return false;
  }
  return true;
}

// Redirect to dashboard if already authenticated
function redirectIfAuthenticated() {
  if (isLoggedIn() && window.location.pathname.includes('login.html')) {
    window.location.href = 'dashboard.html';
  }
}

// Log out the user
function logout() {
  localStorage.removeItem(AUTH_KEY);
  window.location.href = 'login.html';
}

// Initialize login page
function initLoginPage() {
  redirectIfAuthenticated();
  
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
      const errorMessage = document.getElementById('error-message');
      const buttonText = document.getElementById('button-text');
      const spinner = document.getElementById('spinner');
      
      // Show loading state
      buttonText.textContent = 'Signing in...';
      spinner.classList.remove('hidden');
      errorMessage.classList.add('hidden');
      
      try {
        const response = await fetch('/.netlify/functions/admin-auth', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, password }),
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
          // Store auth data in localStorage
          localStorage.setItem(AUTH_KEY, JSON.stringify({
            token: data.token,
            username: data.username
          }));
          
          // Redirect to dashboard
          window.location.href = 'dashboard.html';
        } else {
          // Show error message
          errorMessage.textContent = data.message || 'Invalid username or password';
          errorMessage.classList.remove('hidden');
        }
      } catch (error) {
        // Show error message
        errorMessage.textContent = 'An error occurred. Please try again.';
        errorMessage.classList.remove('hidden');
      } finally {
        // Reset button state
        buttonText.textContent = 'Sign In';
        spinner.classList.add('hidden');
      }
    });
  }
}

// Initialize admin dashboard and other protected pages
function initAdminPages() {
  // Only proceed if user is authenticated
  if (!requireAuth()) return;
  
  // Add logout button functionality
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
  }
  
  // Display username if available
  const usernameElement = document.getElementById('username-display');
  if (usernameElement) {
    try {
      const auth = JSON.parse(localStorage.getItem(AUTH_KEY));
      if (auth && auth.username) {
        usernameElement.textContent = auth.username;
      }
    } catch (error) {
      console.error('Error parsing auth data:', error);
    }
  }
}

// Initialize based on current page
document.addEventListener('DOMContentLoaded', () => {
  // Check if we're on the login page
  if (window.location.pathname.includes('login.html')) {
    initLoginPage();
  } else if (window.location.pathname.includes('/admin/')) {
    // For all other admin pages
    initAdminPages();
  }
});