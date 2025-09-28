// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyAgVrQTPsIocnQEUioIEKZgcwMXG1t1tHk",
    authDomain: "gobal-vip-numbers.firebaseapp.com",
    projectId: "gobal-vip-numbers",
    storageBucket: "gobal-vip-numbers.firebasestorage.app",
    messagingSenderId: "1059192210451",
    appId: "1:1059192210451:web:04be185c6c9a05ea0fabe6",
    measurementId: "G-9E93WE7VD2"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// DOM Elements
const loadingScreen = document.getElementById('loading-screen');
const loginScreen = document.getElementById('login-screen');
const profileScreen = document.getElementById('profile-screen');
const googleLoginBtn = document.getElementById('google-login-btn');
const emailLoginForm = document.getElementById('email-login-form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const loginBtn = document.getElementById('login-btn');
const btnText = document.querySelector('.btn-text');
const btnLoader = document.querySelector('.btn-loader');
const logoutBtn = document.getElementById('logout-btn');
const profileImage = document.getElementById('profile-image');
const profileInitials = document.getElementById('profile-initials');
const profileName = document.getElementById('profile-name');
const profileEmail = document.getElementById('profile-email');

// Loading Screen Management
let loadingTimeout;

function showLoadingScreen() {
    loadingScreen.classList.remove('hidden');
    loadingScreen.style.opacity = '1';
    loginScreen.classList.add('hidden');
    profileScreen.classList.add('hidden');
}

function hideLoadingScreen() {
    loadingScreen.style.opacity = '0';
    setTimeout(() => {
        loadingScreen.classList.add('hidden');
    }, 600);
}

function showLoginScreen() {
    // For integrated system, just show the login section
    const loginSection = document.getElementById('login-section');
    const profileSection = document.getElementById('profile-section');
    const mainContent = document.getElementById('main-content');
    
    if (loginSection) loginSection.style.display = 'block';
    if (profileSection) profileSection.style.display = 'none';
    if (mainContent) mainContent.style.display = 'none';
}

function showProfileScreen() {
    // For integrated system, show profile and main content
    const loginSection = document.getElementById('login-section');
    const profileSection = document.getElementById('profile-section');
    const mainContent = document.getElementById('main-content');
    
    if (loginSection) loginSection.style.display = 'none';
    if (profileSection) profileSection.style.display = 'block';
    if (mainContent) mainContent.style.display = 'block';
}

// Loading Animation Management
function showButtonLoading(button, textElement, loaderElement) {
    button.disabled = true;
    textElement.style.opacity = '0';
    loaderElement.classList.remove('hidden');
}

function hideButtonLoading(button, textElement, loaderElement) {
    button.disabled = false;
    textElement.style.opacity = '1';
    loaderElement.classList.add('hidden');
}

// Error and Success Message Management
function showMessage(message, type = 'error') {
    // Remove existing messages
    const existingMessage = document.querySelector('.error-message, .success-message');
    if (existingMessage) {
        existingMessage.remove();
    }

    const messageDiv = document.createElement('div');
    messageDiv.className = type === 'error' ? 'error-message' : 'success-message';
    messageDiv.textContent = message;

    // Insert message after the logo section
    const logoSection = document.querySelector('.logo-section');
    logoSection.insertAdjacentElement('afterend', messageDiv);

    // Auto-remove message after 5 seconds
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.remove();
        }
    }, 5000);
}

// Google Sign-In Provider
const googleProvider = new firebase.auth.GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');

// Google Login Handler
googleLoginBtn.addEventListener('click', async () => {
    try {
        showButtonLoading(googleLoginBtn, googleLoginBtn, document.createElement('div'));
        
        const result = await auth.signInWithPopup(googleProvider);
        const user = result.user;
        
        console.log('Google login successful:', user);
        updateProfileDisplay(user);
        showProfileScreen();
        handlePostLoginRedirect(user);
        
    } catch (error) {
        console.error('Google login error:', error);
        showMessage(getErrorMessage(error), 'error');
    } finally {
        hideButtonLoading(googleLoginBtn, googleLoginBtn, document.createElement('div'));
    }
});

// Email/Password Login Handler
emailLoginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    
    if (!email || !password) {
        showMessage('Please fill in all fields', 'error');
        return;
    }
    
    try {
        showButtonLoading(loginBtn, btnText, btnLoader);
        
        const result = await auth.signInWithEmailAndPassword(email, password);
        const user = result.user;
        
        console.log('Email login successful:', user);
        updateProfileDisplay(user);
        showProfileScreen();
        handlePostLoginRedirect(user);
        
    } catch (error) {
        console.error('Email login error:', error);
        showMessage(getErrorMessage(error), 'error');
    } finally {
        hideButtonLoading(loginBtn, btnText, btnLoader);
    }
});

// Logout Handler
logoutBtn.addEventListener('click', async () => {
    try {
        await auth.signOut();
        console.log('Logout successful');
        showLoginScreen();
        clearForm();
    } catch (error) {
        console.error('Logout error:', error);
        showMessage('Error logging out. Please try again.', 'error');
    }
});

// Update Profile Display
function updateProfileDisplay(user) {
    if (user.photoURL) {
        profileImage.src = user.photoURL;
        profileImage.style.display = 'block';
    } else {
        profileImage.style.display = 'none';
        profileInitials.textContent = getInitials(user.displayName || user.email);
    }
    
    profileName.textContent = user.displayName || 'User';
    profileEmail.textContent = user.email || '';
}

// Get User Initials
function getInitials(name) {
    if (!name) return 'U';
    
    const words = name.trim().split(' ');
    if (words.length === 1) {
        return words[0].charAt(0).toUpperCase();
    }
    
    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
}

// Clear Form
function clearForm() {
    emailInput.value = '';
    passwordInput.value = '';
    
    // Remove any error messages
    const existingMessage = document.querySelector('.error-message, .success-message');
    if (existingMessage) {
        existingMessage.remove();
    }
}

// Error Message Helper
function getErrorMessage(error) {
    switch (error.code) {
        case 'auth/user-not-found':
            return 'No account found with this email address.';
        case 'auth/wrong-password':
            return 'Incorrect password. Please try again.';
        case 'auth/invalid-email':
            return 'Please enter a valid email address.';
        case 'auth/user-disabled':
            return 'This account has been disabled.';
        case 'auth/too-many-requests':
            return 'Too many failed attempts. Please try again later.';
        case 'auth/network-request-failed':
            return 'Network error. Please check your connection.';
        case 'auth/popup-closed-by-user':
            return 'Login cancelled. Please try again.';
        case 'auth/cancelled-popup-request':
            return 'Login cancelled. Please try again.';
        default:
            return 'An error occurred. Please try again.';
    }
}

// Auth State Listener
auth.onAuthStateChanged((user) => {
    if (user) {
        console.log('User is signed in:', user);
        updateProfileDisplay(user);
        showProfileScreen();
        handlePostLoginRedirect(user);
    } else {
        console.log('User is signed out');
        showLoginScreen();
    }
});

// Initialize App
function initializeApp() {
    // Check if user is already logged in
    const user = auth.currentUser;
    if (user) {
        updateProfileDisplay(user);
        showProfileScreen();
        handlePostLoginRedirect(user);
    } else {
        showLoginScreen();
    }
}

// Post-login routing to admin panel if email is in admin list
const ADMIN_EMAILS = [
    'admin@gmail.com'
];

function handlePostLoginRedirect(user) {
    try {
        const email = user?.email || '';
        const isAdmin = ADMIN_EMAILS.includes(email.toLowerCase());
        if (isAdmin) {
            window.location.href = 'admin.html';
        }
    } catch (e) {
        console.warn('Post-login redirect skipped:', e?.message || e);
    }
}

// Add smooth transitions for form inputs
document.querySelectorAll('.input-group input').forEach(input => {
    input.addEventListener('focus', function() {
        this.parentElement.style.transform = 'scale(1.02)';
    });
    
    input.addEventListener('blur', function() {
        this.parentElement.style.transform = 'scale(1)';
    });
});

// Add keyboard navigation
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !loginBtn.disabled) {
        if (emailInput === document.activeElement || passwordInput === document.activeElement) {
            emailLoginForm.dispatchEvent(new Event('submit'));
        }
    }
});

// Add form validation
emailInput.addEventListener('input', function() {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (this.value && !emailRegex.test(this.value)) {
        this.style.borderColor = 'rgba(255, 107, 107, 0.6)';
    } else {
        this.style.borderColor = 'rgba(255, 255, 255, 0.2)';
    }
});

passwordInput.addEventListener('input', function() {
    if (this.value && this.value.length < 6) {
        this.style.borderColor = 'rgba(255, 107, 107, 0.6)';
    } else {
        this.style.borderColor = 'rgba(255, 255, 255, 0.2)';
    }
});

// Add click effects to buttons
document.querySelectorAll('button').forEach(button => {
    button.addEventListener('mousedown', function() {
        this.style.transform = 'scale(0.98)';
    });
    
    button.addEventListener('mouseup', function() {
        this.style.transform = '';
    });
    
    button.addEventListener('mouseleave', function() {
        this.style.transform = '';
    });
});

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeApp);

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Page is hidden, pause any animations
        clearTimeout(loadingTimeout);
    } else {
        // Page is visible again, resume if needed
        if (loadingScreen && !loadingScreen.classList.contains('hidden')) {
            loadingTimeout = setTimeout(() => {
                const user = auth.currentUser;
                if (user) {
                    updateProfileDisplay(user);
                    showProfileScreen();
                } else {
                    showLoginScreen();
                }
            }, 1000);
        }
    }
});

// Add touch support for mobile
if ('ontouchstart' in window) {
    document.body.classList.add('touch-device');
    
    // Add touch feedback for buttons
    document.querySelectorAll('button').forEach(button => {
        button.addEventListener('touchstart', function() {
            this.style.transform = 'scale(0.98)';
        });
        
        button.addEventListener('touchend', function() {
            this.style.transform = '';
        });
    });
}

// Export functions for testing (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        showLoadingScreen,
        hideLoadingScreen,
        showLoginScreen,
        showProfileScreen,
        updateProfileDisplay,
        getInitials,
        getErrorMessage
    };
}
