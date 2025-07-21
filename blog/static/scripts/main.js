// Mobile navigation functionality
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const mobileNav = document.querySelector('.mobile-nav');
    const mobileNavCross = document.querySelector('.mobile-nav-cross');

    if (hamburger && mobileNav) {
        hamburger.addEventListener('click', function() {
            mobileNav.classList.remove('hidden');
        });
    }

    if (mobileNavCross && mobileNav) {
        mobileNavCross.addEventListener('click', function() {
            mobileNav.classList.add('hidden');
        });
    }

    // Close mobile nav when clicking on a link
    const mobileNavLinks = document.querySelectorAll('.mobile-nav a');
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', function() {
            mobileNav.classList.add('hidden');
        });
    });
}); 