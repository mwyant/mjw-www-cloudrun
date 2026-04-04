/**
 * nebula.js
 * 
 * Draws a flowing blackness with starry sky and subtle nebula/fluid gradients
 * perfectly suited for an immersive Space Opera aesthetic.
 */

(function() {
  const canvas = document.getElementById('nebula-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d', { alpha: false }); // alpha: false for performance

  let width, height;
  let stars = [];
  const STAR_COUNT = 350; // Performance friendly
  const SPEED = 0.05;

  // Initialize Canvas Size
  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    initStars();
  }

  // Create Stars
  function initStars() {
    stars = [];
    for (let i = 0; i < STAR_COUNT; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        z: Math.random() * width, // depth for parallax
        radius: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.8 + 0.2,
        blinkSpeed: (Math.random() * 0.02) + 0.005,
        blinkDir: Math.random() > 0.5 ? 1 : -1
      });
    }
  }

  // Nebula "Clouds"
  // We'll draw large blurred radial gradients that shift slowly
  const nebulas = [
    { x: 0.2, y: 0.3, r: 0.6, color: 'rgba(75, 0, 130, 0.1)', vx: 0.0001, vy: 0.0002 },
    { x: 0.8, y: 0.7, r: 0.5, color: 'rgba(0, 0, 128, 0.1)', vx: -0.0002, vy: 0.0001 },
    { x: 0.5, y: 0.5, r: 0.7, color: 'rgba(139, 0, 139, 0.05)', vx: 0.00015, vy: -0.00015 }
  ];

  function drawNebulas() {
    for (let n of nebulas) {
      n.x += n.vx;
      n.y += n.vy;

      // Bounce off walls (normalized coordinates 0 to 1)
      if (n.x < -0.2 || n.x > 1.2) n.vx *= -1;
      if (n.y < -0.2 || n.y > 1.2) n.vy *= -1;

      const px = n.x * width;
      const py = n.y * height;
      const pr = n.r * Math.max(width, height);

      const gradient = ctx.createRadialGradient(px, py, 0, px, py, pr);
      gradient.addColorStop(0, n.color);
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = gradient;
      // We use lighter composite operation for the nebula to blend with black
      ctx.globalCompositeOperation = 'screen';
      ctx.fillRect(0, 0, width, height);
      ctx.globalCompositeOperation = 'source-over'; // reset
    }
  }

  function drawStars() {
    // Flowing blackness / clear background
    // Instead of clearing completely, we draw a semi-transparent black rectangle
    // to create a very subtle trail effect for moving stars.
    ctx.fillStyle = 'rgba(3, 0, 8, 0.4)';
    ctx.fillRect(0, 0, width, height);

    drawNebulas();

    // Move and draw stars
    for (let star of stars) {
      // Parallax movement (stars closer = faster)
      const starSpeed = (width - star.z) * SPEED * 0.001;
      star.y -= starSpeed;
      
      // Twinkle effect
      star.alpha += star.blinkSpeed * star.blinkDir;
      if (star.alpha >= 1) {
        star.alpha = 1;
        star.blinkDir = -1;
      } else if (star.alpha <= 0.1) {
        star.alpha = 0.1;
        star.blinkDir = 1;
      }

      // Wrap around top to bottom
      if (star.y < 0) {
        star.y = height;
        star.x = Math.random() * width;
        star.z = Math.random() * width;
      }

      // Calculate perspective size and brightness based on Z
      const perspectiveScale = (width - star.z) / width;
      const displayRadius = star.radius * perspectiveScale;
      const displayAlpha = star.alpha * perspectiveScale;

      ctx.beginPath();
      // Add slight blue/purple tint to stars to match theme
      ctx.fillStyle = `rgba(226, 232, 240, ${displayAlpha})`;
      ctx.arc(star.x, star.y, displayRadius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  let animationId;
  function animate() {
    drawStars();
    animationId = requestAnimationFrame(animate);
  }

  // Handle Resize Events (debounce for performance)
  let resizeTimeout;
  window.addEventListener('resize', () => {
    cancelAnimationFrame(animationId);
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      resize();
      animate();
    }, 200);
  });

  // Start
  resize();
  animate();
})();
