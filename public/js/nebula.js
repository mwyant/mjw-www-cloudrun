(function () {
  const canvas = document.getElementById('nebula-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d', { alpha: false });
  let width, height, stars = [];
  let mouseX = 0, mouseY = 0;
  const STAR_COUNT = 350, SPEED = 0.05;

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    initStars();
  }

  function initStars() {
    stars = [];
    for (let i = 0; i < STAR_COUNT; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        z: Math.random() * width,
        radius: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.8 + 0.2,
        blinkSpeed: (Math.random() * 0.02) + 0.005,
        blinkDir: Math.random() > 0.5 ? 1 : -1
      });
    }
  }

  const nebulas = [
    { x: 0.1, y: 0.2, r: 0.7, color: 'rgba(255,0,60,0.08)', vx: 0.0001, vy: 0.00015 },
    { x: 0.9, y: 0.8, r: 0.6, color: 'rgba(0,229,255,0.08)', vx: -0.00015, vy: 0.0001 },
    { x: 0.5, y: 0.5, r: 0.8, color: 'rgba(0,0,50,0.05)', vx: 0.0001, vy: -0.0001 }
  ];

  function drawNebulas() {
    for (let n of nebulas) {
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < -0.2 || n.x > 1.2) n.vx *= -1;
      if (n.y < -0.2 || n.y > 1.2) n.vy *= -1;

      // Mouse Parallax Offset (subtle)
      const offsetX = mouseX * 20;
      const offsetY = mouseY * 20;

      const px = n.x * width + offsetX;
      const py = n.y * height + offsetY;
      const pr = n.r * Math.max(width, height);

      const g = ctx.createRadialGradient(px, py, 0, px, py, pr);
      g.addColorStop(0, n.color);
      g.addColorStop(1, 'rgba(0,0,0,0)');

      ctx.fillStyle = g;
      ctx.globalCompositeOperation = 'screen';
      ctx.fillRect(0, 0, width, height);
      ctx.globalCompositeOperation = 'source-over';
    }
  }

  function drawStars() {
    ctx.fillStyle = 'rgba(3,0,8,0.4)';
    ctx.fillRect(0, 0, width, height);
    drawNebulas();

    for (let s of stars) {
      const speed = (width - s.z) * SPEED * 0.001;
      s.y -= speed;
      s.alpha += s.blinkSpeed * s.blinkDir;

      if (s.alpha >= 1) { s.alpha = 1; s.blinkDir = -1; }
      else if (s.alpha <= 0.1) { s.alpha = 0.1; s.blinkDir = 1; }

      if (s.y < 0) {
        s.y = height;
        s.x = Math.random() * width;
        s.z = Math.random() * width;
      }

      const scale = (width - s.z) / width;
      const r = s.radius * scale;
      const a = s.alpha * scale;

      // Mouse Parallax for Stars (faster movement)
      const parallaxX = mouseX * (1 - scale) * 40;
      const parallaxY = mouseY * (1 - scale) * 40;

      ctx.beginPath();
      ctx.fillStyle = `rgba(226,232,240,${a})`;
      ctx.arc(s.x + parallaxX, s.y + parallaxY, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  let animId;
  function animate() {
    drawStars();
    animId = requestAnimationFrame(animate);
  }

  let resTimeout;
  window.addEventListener('resize', () => {
    cancelAnimationFrame(animId);
    clearTimeout(resTimeout);
    resTimeout = setTimeout(() => {
      resize();
      animate();
    }, 200);
  });

  window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth) - 0.5;
    mouseY = (e.clientY / window.innerHeight) - 0.5;
  });

  resize();
  animate();
})();
