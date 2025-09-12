document.addEventListener("DOMContentLoaded", () => {
  const initCanvas = () => {
    const canvas = document.createElement("canvas");
    canvas.id = "starfield-canvas";
    Object.assign(canvas.style, {
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      zIndex: "0",
      opacity: "0",
      transition: "opacity 1.2s ease",
    });
    document.body.prepend(canvas);

    const ctx = canvas.getContext("2d");

    let stars = [];
    let particles = [];
    let lightningBolts = [];
    let lightningTimer = 0;

    // UFO
    let ufo = null;
    let ufoTimer = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      // Stars
      const starCount = window.innerWidth < 768 ? 80 : 160;
      stars = Array.from({ length: starCount }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.2 + 0.3,
        a: Math.random(),
        s: 0.05 * Math.random() + 0.02,
        t: Math.random() * 0.02 + 0.01,
      }));

      // Particles (glowing dust)
      particles = Array.from({ length: 20 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 3 + 1.5,
        a: 0.3 + Math.random() * 0.4,
        sy: 0.05 * Math.random() + 0.02,
      }));
    };

    // Lightning effect
    function triggerLightning() {
      const startX = Math.random() * canvas.width;
      const startY = Math.random() * (canvas.height * 0.3);
      const segments = 6 + Math.floor(Math.random() * 5);

      let bolt = [];
      let x = startX;
      let y = startY;

      for (let i = 0; i < segments; i++) {
        x += (Math.random() - 0.5) * 60;
        y += canvas.height * 0.05;
        bolt.push({ x, y });
      }

      lightningBolts.push({ path: bolt, a: 1 });
    }

    // UFO logic
    function randomColor() {
      const colors = [
        "rgba(180,255,255,0.9)", // xanh ngọc
        "rgba(255,200,200,0.9)", // hồng nhạt
        "rgba(200,200,255,0.9)", // tím nhạt
        "rgba(255,255,180,0.9)", // vàng nhạt
      ];
      return colors[Math.floor(Math.random() * colors.length)];
    }

    function spawnUfo() {
      const spawnType = Math.floor(Math.random() * 3); // 0=trái/phải, 1=trên
      let x, y, vx, vy;

      if (spawnType === 0) {
        const fromLeft = Math.random() > 0.5;
        x = fromLeft ? -100 : canvas.width + 100;
        y = Math.random() * (canvas.height * 0.4) + 50;
        vx = fromLeft ? 2 + Math.random() * 3 : -(2 + Math.random() * 3);
        vy = (Math.random() - 0.5) * 1;
      } else {
        x = Math.random() * canvas.width;
        y = -80;
        vx = (Math.random() - 0.5) * 2;
        vy = 2 + Math.random() * 2;
      }

      ufo = {
        x,
        y,
        vx,
        vy,
        color: randomColor(),
        state: "flying",
        pauseTime: 0,
      };
    }

    function drawUfo() {
      if (!ufo) return;

      // UFO body
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(ufo.x, ufo.y, 30, 12, 0, 0, 2 * Math.PI);
      ctx.fillStyle = ufo.color;
      ctx.shadowBlur = 25;
      ctx.shadowColor = ufo.color;
      ctx.fill();
      ctx.restore();

      // Motion logic
      if (ufo.state === "flying") {
        ufo.x += ufo.vx;
        ufo.y += ufo.vy;
        if (Math.random() > 0.995) {
          ufo.state = "pausing";
          ufo.pauseTime = 60 + Math.random() * 60; // 1–2s
        }
      } else if (ufo.state === "pausing") {
        ufo.pauseTime--;
        if (ufo.pauseTime <= 0) {
          if (Math.random() > 0.7) {
            // đổi hướng
            ufo.vx = (Math.random() - 0.5) * 6;
            ufo.vy = (Math.random() - 0.5) * 4;
            ufo.state = "flying";
          } else if (Math.random() > 0.5) {
            // warp biến mất
            ufo = null;
            return;
          } else {
            // leaving nhanh
            ufo.vx *= 2;
            ufo.vy *= 2;
            ufo.state = "leaving";
          }
        }
      } else if (ufo.state === "leaving") {
        ufo.x += ufo.vx;
        ufo.y += ufo.vy;
        if (
          ufo.x < -150 ||
          ufo.x > canvas.width + 150 ||
          ufo.y < -150 ||
          ufo.y > canvas.height + 150
        ) {
          ufo = null;
        }
      }
    }

    // Animate all
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Stars
      ctx.fillStyle = "#fff";
      stars.forEach((s) => {
        ctx.globalAlpha = s.a;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, 2 * Math.PI);
        ctx.fill();
        s.x += s.s;
        if (s.x > canvas.width + s.r) s.x = -s.r;
        s.a += s.t * (Math.random() > 0.5 ? 1 : -1);
        s.a = Math.max(0.2, Math.min(1, s.a));
      });

      // Particles
      particles.forEach((p) => {
        ctx.globalAlpha = p.a;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, 2 * Math.PI);
        ctx.fill();
        p.y += p.sy;
        if (p.y > canvas.height + p.r) p.y = -p.r;
      });

      // Lightning
      lightningTimer++;
      if (lightningTimer > 180 + Math.random() * 180) {
        // 3–6s
        triggerLightning();
        lightningTimer = 0;
      }
      lightningBolts.forEach((bolt, i) => {
        ctx.globalAlpha = bolt.a;
        ctx.beginPath();
        ctx.moveTo(bolt.path[0].x, bolt.path[0].y);
        bolt.path.forEach((p) => ctx.lineTo(p.x, p.y));
        ctx.strokeStyle = "rgba(200,230,255,1)";
        ctx.lineWidth = 2;
        ctx.shadowBlur = 15;
        ctx.shadowColor = "rgba(150,200,255,0.8)";
        ctx.stroke();
        bolt.a -= 0.05;
        if (bolt.a <= 0) lightningBolts.splice(i, 1);
      });

      // UFO
      ufoTimer++;
      if (!ufo && ufoTimer > 900 + Math.random() * 1500) {
        // 15–40s
        spawnUfo();
        ufoTimer = 0;
      }
      drawUfo();

      ctx.globalAlpha = 1;
      requestAnimationFrame(animate);
    };

    window.addEventListener("resize", resize);
    resize();
    animate();
    setTimeout(() => (canvas.style.opacity = "1"), 200);
  };

  // Carbon Badge
  function loadCarbonBadge() {
    const container = document.getElementById("carbon-badge-container");
    if (!container) return;

    const badge = document.createElement("div");
    badge.id = "wcb";
    badge.className = "carbonbadge";
    container.appendChild(badge);

    const script = document.createElement("script");
    script.src = "./src/js/b.min.js";
    script.defer = true;
    container.appendChild(script);
  }

  // Pref check
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  const saveData = navigator.connection && navigator.connection.saveData;

  if (!prefersReducedMotion && !saveData) {
    initCanvas();
  }
  loadCarbonBadge();
});
