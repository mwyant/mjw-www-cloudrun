(function () {
  const canvas = document.getElementById('nebula-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d', { alpha: false });
  let width, height, stars = [], fireflies = [];
  let mouseX = 0, mouseY = 0;
  let scrollY = 0, maxScroll = 0;
  const STAR_COUNT = 350, FIREFLY_COUNT = 45, SPEED = 0.05;

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    initStars();
    initFireflies();
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

  function initFireflies() {
    fireflies = [];
    for (let i = 0; i < FIREFLY_COUNT; i++) {
      fireflies.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.8 + 0.8,
        alpha: Math.random() * 0.4 + 0.2,
        speed: Math.random() * 0.6 + 0.3,
        angle: Math.random() * Math.PI * 2,
        drift: Math.random() * 0.02 + 0.01,
        oscillation: Math.random() * 30 + 10
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

  function drawScrollHaze() {
    const scrollPercent = maxScroll > 0 ? scrollY / maxScroll : 0;
    
    // Crimson Glow: More localized to corners, lower alpha (0.4 -> 0.2)
    const crimsonAlpha = Math.max(0, 0.2 * (1 - scrollPercent));
    if (crimsonAlpha > 0) {
      // Small Bottom Left Crimson
      const gLeft = ctx.createRadialGradient(0, height, 0, 0, height, width * 0.4);
      gLeft.addColorStop(0, `rgba(255, 0, 60, ${crimsonAlpha})`);
      gLeft.addColorStop(1, 'rgba(0, 0, 0, 0)');
      
      // Small Bottom Right Crimson
      const gRight = ctx.createRadialGradient(width, height, 0, width, height, width * 0.4);
      gRight.addColorStop(0, `rgba(255, 0, 60, ${crimsonAlpha})`);
      gRight.addColorStop(1, 'rgba(0, 0, 0, 0)');
      
      ctx.globalCompositeOperation = 'screen';
      ctx.fillStyle = gLeft;
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = gRight;
      ctx.fillRect(0, 0, width, height);
    }

    // Cerulean Glow: Much stronger (0.35 -> 0.6) and massive vertical reach
    const ceruleanAlpha = Math.max(0, 0.6 * scrollPercent);
    if (ceruleanAlpha > 0) {
      // Large central glow from the bottom
      const gCenter = ctx.createRadialGradient(width / 2, height, 0, width / 2, height, height * 2.0);
      gCenter.addColorStop(0, `rgba(0, 229, 255, ${ceruleanAlpha})`);
      gCenter.addColorStop(1, 'rgba(0, 0, 0, 0)');
      
      ctx.globalCompositeOperation = 'screen';
      ctx.fillStyle = gCenter;
      ctx.fillRect(0, 0, width, height);
    }
    
    ctx.globalCompositeOperation = 'source-over';
  }

  function drawStars() {
    ctx.fillStyle = 'rgba(3,0,8,1)';
    ctx.fillRect(0, 0, width, height);
    
    drawNebulas();
    drawScrollHaze();

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

      const parallaxX = mouseX * (1 - scale) * 40;
      const parallaxY = mouseY * (1 - scale) * 40;

      ctx.beginPath();
      ctx.fillStyle = `rgba(226,232,240,${a})`;
      ctx.arc(s.x + parallaxX, s.y + parallaxY, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawFireflies() {
    for (let f of fireflies) {
      f.y -= f.speed;
      f.angle += f.drift;
      const offsetX = Math.sin(f.angle) * f.oscillation;
      
      const currentAlpha = f.alpha + (Math.sin(f.angle * 2) * 0.1);

      if (f.y < -50) {
        f.y = height + 50;
        f.x = Math.random() * width;
      }

      const parallaxX = mouseX * 50;
      const parallaxY = mouseY * 50;

      ctx.beginPath();
      ctx.fillStyle = `rgba(0, 229, 255, ${Math.max(0.1, currentAlpha)})`;
      ctx.arc(f.x + offsetX + parallaxX, f.y + parallaxY, f.radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  let animId;
  function animate() {
    drawStars();
    drawFireflies();
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

  window.addEventListener('scroll', () => {
    scrollY = window.scrollY;
  }, { passive: true });

  resize();
  animate();
})();
