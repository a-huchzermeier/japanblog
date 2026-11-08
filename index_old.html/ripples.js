// Wasserringe: erscheinen im Teich, wenn die Maus sich darüber bewegt.
// Zeichnet auf ein eigenes Canvas über dem Koi, ohne den Fisch zu stören.
(function () {
  const pond = document.querySelector(".container");   // was ".pond"
  const koi = document.querySelector(".koi");
  if (!pond || !koi) return;


  const rippleSettings = {
    maxSize: 60,              // wie groß ein Ring maximal wird (px)
    animationSpeed: 2.2,      // wie schnell er wächst
    strokeColor: [51, 0, 0],
    spawnDistance: 14,        // Abstand zwischen zwei Ringen (px)
    lineWidth: 4,
  };

  const canvas = document.createElement("canvas");
  canvas.className = "ripples";
  canvas.setAttribute("aria-hidden", "true");
  canvas.style.cssText =
    "position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:2;";
  pond.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  const ripples = [];
  let last = { x: null, y: null };

  // Canvas an die echte Teichgröße anpassen (auch bei Fenstergröße / Zoom)
  const resize = () => {
    const rect = pond.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(rect.width * ratio);
    canvas.height = Math.round(rect.height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  };
  resize();

  if (window.ResizeObserver) new ResizeObserver(resize).observe(pond);
  window.addEventListener("resize", resize);

  const addRipple = (x, y) => {
    ripples.push({
      x,
      y,
      size: 2,
      opacity: 1,
      step: (rippleSettings.animationSpeed /
        (rippleSettings.maxSize - 2)) / 2,
    });
  };

  // Mausposition relativ zum Teich
  const positionInPond = (event) => {
    const rect = pond.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  };

  pond.addEventListener("mousemove", (event) => {
    const { x, y } = positionInPond(event);
    // nur einen neuen Ring setzen, wenn die Maus sich bewegt hat.
    // Sonst stapeln sich bei stillstehender Maus hunderte Ringe.
    if (
      last.x !== null &&
      Math.hypot(x - last.x, y - last.y) < rippleSettings.spawnDistance
    ) return;
    last.x = x;
    last.y = y;
    addRipple(x, y);
  });

  pond.addEventListener("mouseleave", () => {
    last.x = null;
    last.y = null;
  });

  // Auch auf Touch, damit es am Handy funktioniert
  pond.addEventListener("touchmove", (event) => {
    const touch = event.touches[0];
    if (!touch) return;
    const { x, y } = positionInPond(touch);
    addRipple(x, y);
  }, { passive: true });

  const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const [r, g, b] = rippleSettings.strokeColor;
    ctx.lineWidth = rippleSettings.lineWidth;

    for (let i = ripples.length - 1; i >= 0; i--) {
      const rip = ripples[i];
      rip.size += rippleSettings.animationSpeed;
      rip.opacity -= rip.step;

      if (rip.opacity <= 0 || rip.size >= rippleSettings.maxSize) {
        ripples.splice(i, 1);
        continue;
      }

      ctx.beginPath();
      ctx.strokeStyle =
        `rgba(${r}, ${g}, ${b}, ${Math.max(rip.opacity, 0)})`;
      ctx.arc(rip.x, rip.y, rip.size, 0, 2 * Math.PI);
      ctx.stroke();
    }
    requestAnimationFrame(draw);
  };
  requestAnimationFrame(draw);
})();
