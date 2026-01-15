(function() {
  function updateIconFill(isLightMode) {
    const circles = document.querySelectorAll('#theme-toggle-circle, #theme-toggle-circle-desktop');
    circles.forEach(circle => {
      if (isLightMode) {
        circle.setAttribute('fill', 'none');
      } else {
        circle.setAttribute('fill', 'currentColor');
      }
    });
  }
  
  function initThemeToggle() {
    const themeToggleMobile = document.getElementById('theme-toggle-mobile');
    const themeToggleDesktop = document.getElementById('theme-toggle-desktop');
    const body = document.body;
    
    if (!themeToggleMobile && !themeToggleDesktop) {
      // Buttons not found, try again after a short delay
      setTimeout(initThemeToggle, 100);
      return;
    }
    
    // Check for saved theme preference or default to dark mode
    const currentTheme = localStorage.getItem('theme') || 'dark';
    
    // Apply theme on page load
    if (currentTheme === 'light') {
      body.classList.add('light-mode');
    }
    
    // Update icon fill state
    updateIconFill(currentTheme === 'light');
    
    // Handle toggle click for both buttons
    function handleToggle(e) {
      e.preventDefault();
      e.stopPropagation();
      body.classList.toggle('light-mode');
      
      // Save preference
      const newTheme = body.classList.contains('light-mode') ? 'light' : 'dark';
      localStorage.setItem('theme', newTheme);
      
      // Update icon fill state
      updateIconFill(newTheme === 'light');
    }
    
    if (themeToggleMobile) {
      themeToggleMobile.addEventListener('click', handleToggle);
    }
    
    if (themeToggleDesktop) {
      themeToggleDesktop.addEventListener('click', handleToggle);
    }
  }
  
  // Try to initialize immediately if DOM is ready, otherwise wait
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initThemeToggle);
  } else {
    initThemeToggle();
  }
})();
