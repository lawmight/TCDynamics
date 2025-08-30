// Global variables
let currentDay = 1;
let completedDays = 1; // Start with day 1 completed

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeWebsite();
});

// Initialize website functionality
function initializeWebsite() {
    updateProgress();
    setupEventListeners();
    setupSmoothScrolling();
    setupFormHandling();
    animateOnScroll();
}

// Update progress bar and day counter
function updateProgress() {
    const progressBar = document.getElementById('progressBar');
    const currentDayElement = document.getElementById('currentDay');
    
    if (progressBar && currentDayElement) {
        const progressPercentage = (completedDays / 30) * 100;
        progressBar.style.width = progressPercentage + '%';
        currentDayElement.textContent = currentDay;
        
        // Update progress text color based on completion
        if (progressPercentage >= 100) {
            progressBar.style.background = 'linear-gradient(90deg, #4CAF50, #45a049)';
        }
    }
}

// Setup event listeners
function setupEventListeners() {
    // Newsletter form submission
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', handleNewsletterSubmit);
    }
    
    // Contact form submission
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactSubmit);
    }
    
    // Mobile menu toggle (if needed)
    setupMobileMenu();
}

// Setup smooth scrolling for navigation links
function setupSmoothScrolling() {
    const navLinks = document.querySelectorAll('a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const headerHeight = document.querySelector('header').offsetHeight;
                const targetPosition = targetSection.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Toggle day content visibility
function toggleContent(dayNumber) {
    const content = document.getElementById(`content-${dayNumber}`);
    const button = event.target;
    
    if (content && button) {
        const isVisible = content.classList.contains('show');
        
        if (isVisible) {
            content.classList.remove('show');
            button.textContent = 'Voir mon expérience';
            button.classList.remove('active');
        } else {
            content.classList.add('show');
            button.textContent = 'Masquer l\'expérience';
            button.classList.add('active');
        }
    }
}

// Handle newsletter form submission
async function handleNewsletterSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const emailInput = form.querySelector('input[type="email"]');
    const submitButton = form.querySelector('button');
    const email = emailInput.value.trim();
    
    // Basic email validation
    if (!isValidEmail(email)) {
        showAlert('Veuillez fournir une adresse email valide.', 'error');
        return;
    }
    
    // Disable form during submission
    submitButton.disabled = true;
    submitButton.textContent = 'Inscription...';
    
    try {
        // Simulate API call (replace with actual endpoint)
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        showAlert('Merci pour votre inscription ! Vous recevrez bientôt nos mises à jour.', 'success');
        emailInput.value = '';
        
    } catch (error) {
        showAlert('Une erreur s\'est produite. Veuillez réessayer.', 'error');
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'S\'abonner';
    }
}

// Handle contact form submission
async function handleContactSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const submitButton = form.querySelector('.submit-btn');
    
    // Get form data
    const name = formData.get('name').trim();
    const email = formData.get('email').trim();
    const message = formData.get('message').trim();
    
    // Validate form data
    if (!name || !email || !message) {
        showAlert('Tous les champs sont requis.', 'error');
        return;
    }
    
    if (!isValidEmail(email)) {
        showAlert('Veuillez fournir une adresse email valide.', 'error');
        return;
    }
    
    // Disable form during submission
    submitButton.disabled = true;
    submitButton.textContent = 'Envoi en cours...';
    
    try {
        // Prepare data for Azure Function
        const data = {
            name: name,
            email: email,
            message: message
        };
        
        // Send to Azure Function
        const response = await fetch('https://tcdynamics-api.azurewebsites.net/api/ContactForm', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showAlert(result.message, 'success');
            form.reset();
        } else {
            showAlert(result.message || 'Une erreur s\'est produite.', 'error');
        }
        
    } catch (error) {
        console.error('Contact form error:', error);
        showAlert('Une erreur s\'est produite lors de l\'envoi. Veuillez réessayer.', 'error');
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Envoyer le message';
    }
}

// Email validation helper
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Show alert messages
function showAlert(message, type = 'info') {
    // Remove existing alerts
    const existingAlerts = document.querySelectorAll('.alert');
    existingAlerts.forEach(alert => alert.remove());
    
    // Create new alert
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    
    // Insert alert at the top of the form
    const form = document.querySelector('.contact-form') || document.querySelector('.newsletter-form');
    if (form) {
        form.insertBefore(alert, form.firstChild);
        
        // Auto-remove alert after 5 seconds
        setTimeout(() => {
            if (alert.parentNode) {
                alert.remove();
            }
        }, 5000);
    }
}

// Setup mobile menu (if needed)
function setupMobileMenu() {
    const mobileMenuButton = document.querySelector('.mobile-menu-button');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileMenuButton && navLinks) {
        mobileMenuButton.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            this.classList.toggle('active');
        });
    }
}

// Animate elements on scroll
function animateOnScroll() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe day cards
    const dayCards = document.querySelectorAll('.day-card');
    dayCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
}

// Mark day as completed
function markDayAsCompleted(dayNumber) {
    if (dayNumber <= 30 && dayNumber > 0) {
        const dayCard = document.querySelector(`[data-day="${dayNumber}"]`);
        if (dayCard) {
            const statusElement = dayCard.querySelector('.day-status');
            if (statusElement) {
                statusElement.textContent = 'Terminé';
                statusElement.className = 'day-status status-completed';
            }
        }
        
        if (dayNumber > completedDays) {
            completedDays = dayNumber;
            updateProgress();
        }
    }
}

// Update current day
function updateCurrentDay(dayNumber) {
    if (dayNumber >= 1 && dayNumber <= 30) {
        currentDay = dayNumber;
        updateProgress();
    }
}

// Utility function to format dates
function formatDate(date) {
    return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Utility function to calculate days since start
function getDaysSinceStart(startDate) {
    const today = new Date();
    const start = new Date(startDate);
    const diffTime = Math.abs(today - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}

// Initialize with current progress (example)
function initializeProgress() {
    // Example: Set start date and calculate current day
    const startDate = new Date('2025-01-01'); // Set your actual start date
    const daysSinceStart = getDaysSinceStart(startDate);
    
    if (daysSinceStart <= 30) {
        updateCurrentDay(daysSinceStart);
        // Mark completed days
        for (let i = 1; i <= Math.min(daysSinceStart, 30); i++) {
            markDayAsCompleted(i);
        }
    }
}

// Export functions for potential external use
window.TCDynamics = {
    toggleContent,
    markDayAsCompleted,
    updateCurrentDay,
    showAlert,
    updateProgress
};
