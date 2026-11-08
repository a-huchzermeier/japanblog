// Koi: schwimmt entlang eines SVG-Pfads, dreht sich weich in Kurven (ohne Spin),
// wird beim Hover schneller, wackelt mit dem Schwanz und weicht anderen Kois aus.
gsap.registerPlugin(MotionPathPlugin);

const kois = [];           // alle Fische, in der Reihenfolge im HTML
const MIN_DIST = 340;      // px: ab diesem Abstand bremst der hintere Fisch
const BODY_LENGTH = 0.7;   // Anteil der Canvas-Breite, den der Fisch lang ist (Schwanz bis Kopf)
const TURN_SMOOTHING = 10;  // höher = folgt der Kurve direkter, niedriger = träger und weicher

function createKoi(canvas) {
  // Ohne data-Attribute im HTML gelten diese Standardwerte (wie in deiner bisherigen Version)
  const { src = "images/Koi_fish_dunkler.png", path = "#route", duration = 1000, start = 0 } = canvas.dataset;

  let hovering = false;
  const speed = { v: 1 };   // Grundtempo (Hover / zufälliges Gleiten)
  const avoid = { v: 1 };   // Ausweich-Bremse: 1 = frei, ~0 = steht fast

  // ---------- Ausrichtung: Richtung vom Schwanz zum Kopf, direkt aus dem Pfad ----------
  const pathEl = document.querySelector(path);
  if (!pathEl) { console.warn("Koi: Pfad nicht gefunden:", path); return; }
  const total = pathEl.getTotalLength();
  const wrapLen = v => ((v % total) + total) % total;
  const wrapAngle = d => ((d % 360) + 540) % 360 - 180;   // kürzester Weg, immer -180..180

  function headingAt(progress) {
    const m = pathEl.getScreenCTM();                       // berücksichtigt die Skalierung des SVG
    const pxPerUnit = (Math.abs(m.a) + Math.abs(m.d)) / 2;
    const half = (canvas.width * BODY_LENGTH / 2) / pxPerUnit;
    const s = progress * total;
    const head = pathEl.getPointAtLength(wrapLen(s + half));
    const tail = pathEl.getPointAtLength(wrapLen(s - half));
    const dx = head.x - tail.x, dy = head.y - tail.y;
    const sx = m.a * dx + m.c * dy;                         // Vektor in Bildschirm-Pixel
    const sy = m.b * dx + m.d * dy;
    return Math.atan2(sy, sx) * 180 / Math.PI;
  }

  let angle = null, lastTime = performance.now();

  // ---------- Schwimmen entlang des Pfads ----------
  const swim = gsap.to(canvas, {
    duration: +duration,
    repeat: -1,
    ease: "none",
    motionPath: { path, align: path, autoRotate: false, alignOrigin: [0.5, 0.5] },
    onUpdate() {
      const target = headingAt(swim.progress());
      const now = performance.now();
      const dt = Math.min((now - lastTime) / 1000, 0.1);    // unabhängig von der Framerate
      lastTime = now;

      if (angle === null) angle = target;                   // beim Start nicht erst hindrehen
      else angle += wrapAngle(target - angle) * (1 - Math.exp(-dt * TURN_SMOOTHING));
      angle = wrapAngle(angle);

      gsap.set(canvas, { rotation: angle });
    },
  });
  swim.progress(+start);

  // Tempo = Grundtempo * Ausweich-Bremse
  gsap.ticker.add(() => swim.timeScale(speed.v * avoid.v));

  kois.push({ canvas, avoid, braking: false });

  // ---------- Hover: schneller ----------
  canvas.addEventListener("mouseenter", () => {
    hovering = true;
    gsap.killTweensOf(speed);
    gsap.to(speed, { v: 3, duration: 0.6 });
  });
  canvas.addEventListener("mouseleave", () => {
    hovering = false;
    gsap.killTweensOf(speed);
    gsap.to(speed, { v: 1, duration: 1, onComplete: glide });
  });

  // ---------- Zufällig schneller/langsamer gleiten ----------
  function glide() {
    if (hovering) return;
    gsap.to(speed, {
      v: gsap.utils.random(0.7, 1.1),
      duration: gsap.utils.random(5, 7),
      ease: "sine.inOut",
      onComplete: glide,
    });
  }
  glide();

  // ---------- Schwanz-Wackeln ----------
  const ctx = canvas.getContext("2d");
  const img = new Image();
  img.src = src;
  const phase = Math.random() * 1000;   // jeder Fisch wackelt versetzt

  img.onload = () => {
    const slices = 40;
    const sliceW = img.width / slices;
    const drawW = canvas.width / slices;
    const draw = (time) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < slices; i++) {
        const t = 1 - i / slices;       // Fisch schaut nach rechts, Schwanz links
        const offset = Math.sin((time + phase) / 320 + i * 0.3) * 12 * t * t;
        ctx.drawImage(
          img,
          i * sliceW, 0, sliceW, img.height,
          i * drawW, 20 + offset, drawW + 1, canvas.height - 40
        );
      }
      requestAnimationFrame(draw);
    };
    requestAnimationFrame(draw);
  };
}

document.querySelectorAll(".koi").forEach(createKoi);
