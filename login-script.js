// Handle form submission
document.getElementById('signUpForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const fullName = document.getElementById('fullName').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const monthlyBudget = parseFloat(document.getElementById('monthlyBudget').value);
    
    // Create user object
    const user = {
        fullName: fullName,
        email: email,
        monthlyBudget: monthlyBudget,
        joinedDate: new Date().toISOString()
    };
    
    // Store user data
    localStorage.setItem('budgetShieldUser', JSON.stringify(user));
    
    // Initialize empty months data if not exists
    if (!localStorage.getItem('budgetShieldMonths')) {
        const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
        const monthsData = {
            [currentMonth]: {
                food: 0,
                travel: 0,
                college: 0,
                other: 0,
                isEditable: true
            }
        };
        localStorage.setItem('budgetShieldMonths', JSON.stringify(monthsData));
    }
    
    // Redirect to dashboard
    window.location.href = 'dashboard.html';
});

// Sign In link (placeholder)
document.getElementById('signInLink').addEventListener('click', function(e) {
    e.preventDefault();
    alert('Sign In feature coming soon! For now, please sign up to continue.');
});

// Carousel animation
let currentSlide = 0;
const features = [
    { icon: '📊', text: 'Track all your expenses in one place' },
    { icon: '💰', text: 'Set budgets and stay on track' },
    { icon: '📈', text: 'Visualize your spending patterns' }
];

function updateCarousel() {
    currentSlide = (currentSlide + 1) % features.length;
    const carouselItem = document.querySelector('.carousel-item');
    const dots = document.querySelectorAll('.dot');
    
    carouselItem.style.opacity = '0';
    
    setTimeout(() => {
        document.querySelector('.feature-icon').textContent = features[currentSlide].icon;
        carouselItem.querySelector('p').textContent = features[currentSlide].text;
        carouselItem.style.opacity = '1';
        
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentSlide);
        });
    }, 300);
}

// Auto-rotate carousel every 4 seconds
setInterval(updateCarousel, 4000);

// Check if user is already logged in
if (localStorage.getItem('budgetShieldUser')) {
    window.location.href = 'dashboard.html';
}
