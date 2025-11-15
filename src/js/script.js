document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;
  const themeToggleButton = document.getElementById("theme-toggle-button");

  // === QUẢN LÝ HIỆU ỨNG GIAO DIỆN SÁNG ===
  let lightEffectIntervals = [];

  const initLightThemeEffects = () => {
    const container = document.getElementById("light-theme-dynamics");
    if (!container || container.children.length > 0) return;

    // 1. Tạo mặt trời
    const sun = document.createElement("div");
    sun.className = "sun";
    container.appendChild(sun);

    // 2. Tạo mây 3D ngẫu nhiên
    const createCloud = () => {
      const cloud = document.createElement("div");
      cloud.className = "cloud";
      const numParts = 3 + Math.floor(Math.random() * 4);
      for (let i = 0; i < numParts; i++) {
        const part = document.createElement("div");
        part.className = "cloud-part";
        const size = 50 + Math.random() * 100;
        part.style.width = `${size}px`;
        part.style.height = `${size * 0.7}px`;
        part.style.left = `${Math.random() * 100 - 50}px`;
        part.style.top = `${Math.random() * 40 - 20}px`;
        cloud.appendChild(part);
      }
      const isFar = Math.random() > 0.5;
      const topPosition = 5 + Math.random() * 50;
      if (isFar) {
        cloud.style.transform = `scale(${0.4 + Math.random() * 0.2})`;
        cloud.style.setProperty("--cloud-blur", "3px");
        cloud.style.animationDuration = `${60 + Math.random() * 40}s`;
        cloud.style.setProperty("--cloud-z-index", "1");
      } else {
        cloud.style.transform = `scale(${0.8 + Math.random() * 0.3})`;
        cloud.style.setProperty("--cloud-blur", "0px");
        cloud.style.animationDuration = `${30 + Math.random() * 20}s`;
        cloud.style.setProperty("--cloud-z-index", "15");
      }
      cloud.style.top = `${topPosition}%`;
      cloud.style.animationDelay = `-${Math.random() * 60}s`;
      container.appendChild(cloud);
    };
    for (let i = 0; i < 7; i++) createCloud();

    // 3. Tạo lá rơi
    const createFallingLeaf = () => {
      const leaf = document.createElement("div");
      leaf.className = "leaf";
      leaf.style.left = `${Math.random() * 100}vw`;
      leaf.style.animationDuration = `${8 + Math.random() * 7}s`;
      leaf.style.animationDelay = `${Math.random() * 5}s`;
      leaf.style.setProperty("--sway-direction", Math.random() > 0.5 ? 1 : -1);
      container.appendChild(leaf);
      leaf.addEventListener("animationend", () => leaf.remove());
    };
    lightEffectIntervals.push(setInterval(createFallingLeaf, 1800));

    // 4. Tạo đàn chim
    const createBirdFlock = () => {
      const flock = document.createElement("div");
      flock.className = "bird-flock";
      flock.style.top = `${10 + Math.random() * 20}%`;
      flock.style.animationDuration = `${15 + Math.random() * 10}s`;

      const numBirds = 3 + Math.floor(Math.random() * 3);
      for (let i = 0; i < numBirds; i++) {
        const birdContainer = document.createElement("div");
        birdContainer.className = "bird-container";
        const yPos = Math.abs(i - Math.floor(numBirds / 2));
        birdContainer.style.top = `${yPos * 25}px`;
        birdContainer.style.left = `${i * 40}px`;
        const birdImg = document.createElement("img");
        birdImg.src = "./src/image/bird.gif";
        birdImg.alt = "Flying bird";
        birdImg.className = "bird-gif";
        birdContainer.appendChild(birdImg);
        flock.appendChild(birdContainer);
      }
      container.appendChild(flock);
      flock.addEventListener("animationend", () => flock.remove());
    };
    lightEffectIntervals.push(setInterval(createBirdFlock, 15000));
  };

  const destroyLightThemeEffects = () => {
    const container = document.getElementById("light-theme-dynamics");
    if (container) container.innerHTML = "";
    lightEffectIntervals.forEach(clearInterval);
    lightEffectIntervals = [];
  };

  // === CANVAS CHO GIAO DIỆN TỐI ===
  let darkThemeAnimationFrameId = null;
  let darkThemeResizeHandler = null;

  const initDarkThemeCanvas = () => {
    if (document.getElementById("starfield-canvas")) return;

    const canvas = document.createElement("canvas");
    canvas.id = "starfield-canvas";
    Object.assign(canvas.style, {
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      zIndex: "-1",
      opacity: "0",
      transition: "opacity 1.2s ease",
    });
    document.body.prepend(canvas);

    const ctx = canvas.getContext("2d");
    let stars = [],
      particles = [],
      lightningBolts = [],
      shootingStars = [],
      ufoIcon = null;
    let lightningTimer = 0,
      ufoTimer = 0;
    const ufoImage = new Image();
    ufoImage.src = "./src/image/ufo.png";
    const lightningColors = [
      "rgba(150,200,255,1)",
      "rgba(200,220,255,1)",
      "rgba(220,200,255,1)",
    ];

    darkThemeResizeHandler = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const starCount = window.innerWidth < 768 ? 80 : 160;
      stars = Array.from({ length: starCount }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.2 + 0.3,
        a: Math.random(),
        s: 0.05 * Math.random() * 0.02,
        t: Math.random() * 0.02 + 0.01,
      }));
      particles = Array.from({ length: 20 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 3 + 1.5,
        a: 0.3 + Math.random() * 0.4,
        sy: 0.05 * Math.random() + 0.02,
      }));
      lightningBolts = [];
      shootingStars = [];
      ufoIcon = null;
    };

    function triggerLightning() {
      const startX = Math.random() * canvas.width,
        startY = Math.random() * (canvas.height * 0.8) - 100,
        segments = 8 + Math.floor(Math.random() * 8),
        intensity = Math.random() * 0.7 + 0.3,
        baseLineWidth = 2 + Math.random() * 2;
      let bolt = [],
        x = startX,
        y = startY;
      for (let i = 0; i < segments; i++) {
        x += (Math.random() - 0.5) * 80 * intensity;
        y += canvas.height * 0.05 * intensity;
        bolt.push({ x, y });
      }
      const color =
        lightningColors[Math.floor(Math.random() * lightningColors.length)];
      lightningBolts.push({
        path: bolt,
        a: 1,
        color,
        shadow: color.replace("1)", "0.9)"),
        lw: baseLineWidth,
        i: intensity,
      });
    }
    function drawLightning() {
      lightningBolts.forEach((bolt, i) => {
        ctx.globalAlpha = bolt.a;
        ctx.beginPath();
        ctx.moveTo(bolt.path[0].x, bolt.path[0].y);
        bolt.path.forEach((p) => ctx.lineTo(p.x, p.y));
        ctx.strokeStyle = bolt.color;
        ctx.lineWidth = bolt.lw;
        ctx.shadowBlur = 20 * bolt.i;
        ctx.shadowColor = bolt.shadow;
        ctx.stroke();
        if (Math.random() < 0.2) {
          const pIndex = Math.floor(Math.random() * (bolt.path.length - 1)) + 1,
            p = bolt.path[pIndex];
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(
            p.x + (Math.random() - 0.5) * 50,
            p.y + (Math.random() - 0.5) * 50
          );
          ctx.lineWidth = bolt.lw * 0.5;
          ctx.stroke();
        }
        bolt.a -= 0.05;
        if (bolt.a <= 0) lightningBolts.splice(i, 1);
      });
    }
    function spawnShootingStar() {
      const size = Math.random() * 2 + 1,
        speed = Math.random() * 8 + 4,
        angleDeviation = Math.random() * 0.5 - 0.25,
        fromLeft = Math.random() > 0.5;
      let x, y, angle;
      if (fromLeft) {
        x = Math.random() * canvas.width * 0.4;
        y = -10;
        angle = Math.PI * 0.3 + angleDeviation;
      } else {
        x = canvas.width + 10;
        y = Math.random() * canvas.height * 0.4;
        angle = Math.PI * 0.7 + angleDeviation;
      }
      shootingStars.push({
        x,
        y,
        size,
        speed,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        length: Math.random() * 50 + 30,
        a: 1,
      });
    }
    function drawShootingStars() {
      shootingStars.forEach((star, i) => {
        star.x += star.vx;
        star.y += star.vy;
        star.a -= 0.005;
        const tailX = star.x - (star.vx * star.length) / star.speed,
          tailY = star.y - (star.vy * star.length) / star.speed;
        ctx.globalAlpha = star.a;
        ctx.beginPath();
        ctx.moveTo(star.x, star.y);
        ctx.lineTo(tailX, tailY);
        ctx.strokeStyle = `rgba(255, 255, 255, ${star.a})`;
        ctx.lineWidth = star.size;
        ctx.shadowBlur = 10;
        ctx.shadowColor = "rgba(255, 255, 255, 0.8)";
        ctx.stroke();
        if (
          star.a <= 0 ||
          star.x > canvas.width + 50 ||
          star.x < -50 ||
          star.y > canvas.height + 50
        )
          shootingStars.splice(i, 1);
      });
    }
    function spawnUfoIcon() {
      if (!ufoImage.complete) return;
      const spawnType = Math.floor(Math.random() * 3);
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
      const colors = [
        "rgba(180,255,255,0.9)",
        "rgba(255,200,200,0.9)",
        "rgba(200,200,255,0.9)",
        "rgba(255,255,180,0.9)",
      ];
      ufoIcon = {
        x,
        y,
        vx,
        vy,
        color: colors[Math.floor(Math.random() * colors.length)],
        state: "flying",
        pauseTime: 0,
        a: 1,
        size: 60,
        flashTimer: 0,
      };
    }
    function drawUfoIcon() {
      if (!ufoIcon) return;
      const halfSize = ufoIcon.size / 2;
      ctx.save();
      ctx.globalAlpha = ufoIcon.a;
      if (ufoIcon.state === "flashing") {
        const flashSize = halfSize * (1 + ufoIcon.flashTimer / 10);
        ctx.shadowBlur = 50;
        ctx.shadowColor = "rgba(255, 255, 255, 1)";
        ctx.fillStyle = "rgba(255, 255, 255, 1)";
        ctx.beginPath();
        ctx.moveTo(ufoIcon.x - flashSize, ufoIcon.y);
        ctx.lineTo(ufoIcon.x, ufoIcon.y - flashSize);
        ctx.lineTo(ufoIcon.x + flashSize, ufoIcon.y);
        ctx.lineTo(ufoIcon.x, ufoIcon.y + flashSize);
        ctx.closePath();
        ctx.fill();
        ufoIcon.flashTimer--;
        if (ufoIcon.flashTimer <= 0) {
          ufoIcon = null;
          ctx.restore();
          return;
        }
      } else {
        ctx.shadowBlur = 20;
        ctx.shadowColor = ufoIcon.color;
        if (ufoImage.complete)
          ctx.drawImage(
            ufoImage,
            ufoIcon.x - halfSize,
            ufoIcon.y - halfSize,
            ufoIcon.size,
            ufoIcon.size
          );
        else {
          ctx.beginPath();
          ctx.arc(ufoIcon.x, ufoIcon.y, halfSize, 0, 2 * Math.PI);
          ctx.fillStyle = ufoIcon.color;
          ctx.fill();
        }
      }
      ctx.restore();
      if (ufoIcon.state === "flying") {
        ufoIcon.x += ufoIcon.vx;
        ufoIcon.y += ufoIcon.vy;
        if (Math.random() > 0.995) {
          ufoIcon.state = "pausing";
          ufoIcon.pauseTime = 60 + Math.random() * 60;
        }
      } else if (ufoIcon.state === "pausing") {
        ufoIcon.pauseTime--;
        if (ufoIcon.pauseTime <= 0) {
          if (Math.random() > 0.8) {
            ufoIcon.state = "flashing";
            ufoIcon.flashTimer = 10;
          } else {
            ufoIcon.vx = (Math.random() - 0.5) * 6;
            ufoIcon.vy = (Math.random() - 0.5) * 4;
            ufoIcon.state = "leaving";
          }
        }
      } else if (ufoIcon.state === "leaving") {
        ufoIcon.x += ufoIcon.vx;
        ufoIcon.y += ufoIcon.vy;
        if (
          ufoIcon.x < -150 ||
          ufoIcon.x > canvas.width + 150 ||
          ufoIcon.y < -150 ||
          ufoIcon.y > canvas.height + 150
        )
          ufoIcon = null;
      }
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
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
      particles.forEach((p) => {
        ctx.globalAlpha = p.a;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, 2 * Math.PI);
        ctx.fill();
        p.y += p.sy;
        if (p.y > canvas.height + p.r) p.y = -p.r;
      });
      lightningTimer++;
      if (lightningTimer > 90 + Math.random() * 90) {
        triggerLightning();
        lightningTimer = 0;
      }
      drawLightning();

      if (Math.random() < 0.009) spawnShootingStar();

      drawShootingStars();
      ufoTimer++;
      if (!ufoIcon && ufoTimer > 600 + Math.random() * 1000) {
        spawnUfoIcon();
        ufoTimer = 0;
      }
      drawUfoIcon();
      ctx.globalAlpha = 1;
      darkThemeAnimationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener("resize", darkThemeResizeHandler);
    darkThemeResizeHandler();
    animate();
    setTimeout(() => (canvas.style.opacity = "1"), 200);
  };

  const destroyDarkThemeCanvas = () => {
    const canvas = document.getElementById("starfield-canvas");
    if (canvas) {
      cancelAnimationFrame(darkThemeAnimationFrameId);
      if (darkThemeResizeHandler) {
        window.removeEventListener("resize", darkThemeResizeHandler);
        darkThemeResizeHandler = null;
      }
      canvas.style.opacity = "0";
      setTimeout(() => canvas.remove(), 1200);
    }
  };

  // === QUẢN LÝ GIAO DIỆN CHUNG ===
  const applyTheme = (theme) => {
    body.dataset.theme = theme;
    localStorage.setItem("theme", theme);

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const saveData = navigator.connection && navigator.connection.saveData;

    if (theme === "light") {
      destroyDarkThemeCanvas();
      if (!prefersReducedMotion && !saveData) {
        initLightThemeEffects();
      }
    } else {
      destroyLightThemeEffects();
      if (!prefersReducedMotion && !saveData) {
        initDarkThemeCanvas();
      }
    }
  };

  themeToggleButton.addEventListener("click", () => {
    const currentTheme = body.dataset.theme === "dark" ? "light" : "dark";
    applyTheme(currentTheme);
  });

  // === KHỞI TẠO BAN ĐẦU ===
  const init = () => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      applyTheme(savedTheme);
      return;
    }
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    applyTheme(prefersDark ? "dark" : "light");
  };

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

  // Chạy các hàm khởi tạo
  init();
  loadCarbonBadge();

  setTimeout(() => {
    document.body.classList.add("enhanced");
  }, 100);
});
