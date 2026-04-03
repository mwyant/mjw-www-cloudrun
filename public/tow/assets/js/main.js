const navLinks = document.querySelectorAll('.nav-links a');
let path = window.location.pathname;
const lastSegment = path.substring(path.lastIndexOf('/') + 1);
const normalized = lastSegment ? lastSegment.toLowerCase() : 'index.html';

navLinks.forEach(link => {
  const hrefName = link.getAttribute('href').split('/').pop().toLowerCase();
  if (hrefName === normalized || (normalized === '' && hrefName === 'index.html')) {
    link.classList.add('active');
  }
});
