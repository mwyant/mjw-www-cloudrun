document.addEventListener('DOMContentLoaded', () => {
  /* -------------------------------------
     Scroll Reveal Animations
  ------------------------------------- */
  const fadeUpElements = document.querySelectorAll('.fade-up');

  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -10% 0px',
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target); // Only animate once
      }
    });
  }, observerOptions);

  fadeUpElements.forEach(el => observer.observe(el));

  /* -------------------------------------
     Mobile Navigation Toggle
  ------------------------------------- */
  const navToggle = document.querySelector('.mobile-menu-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      // Very simple mobile toggle using inline styles for prototype
      // In production, you might want to use classes and transitions
      if (navLinks.style.display === 'flex') {
        navLinks.style.display = 'none';
      } else {
        navLinks.style.display = 'flex';
        navLinks.style.flexDirection = 'column';
        navLinks.style.position = 'absolute';
        navLinks.style.top = '100%';
        navLinks.style.left = '0';
        navLinks.style.width = '100%';
        navLinks.style.backgroundColor = 'rgba(3, 0, 8, 0.95)';
        navLinks.style.padding = '1rem';
        navLinks.style.borderBottom = '1px solid rgba(139, 92, 246, 0.2)';
      }
    });
  }

  // Hide mobile menu on link click
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 768) {
        navLinks.style.display = 'none';
      }
    });
  });

  // Handle resize edge cases
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768 && navLinks.style.display === 'none') {
      navLinks.style.display = '';
      navLinks.style.flexDirection = '';
      navLinks.style.position = '';
      navLinks.style.backgroundColor = '';
      navLinks.style.padding = '';
      navLinks.style.borderBottom = '';
    }
  });

  /* -------------------------------------
     Smooth Scrolling for Anchors
  ------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        // Account for fixed header
        const headerOffset = 80;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
  
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
});
