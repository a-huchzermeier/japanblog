const mapFrame = document.querySelector("#restaurant-map");
const mapTitle = document.querySelector("#map-title");

document.querySelectorAll(".map-button").forEach((button) => {
  button.addEventListener("click", () => {
    const restaurant = button.dataset.map;
    const search = encodeURIComponent(restaurant);

    mapFrame.src = `https://www.google.com/maps?q=${search}&output=embed`;
    mapTitle.textContent = restaurant;
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const root = document.getElementById("restaurant-carousel");
  if (!root) { console.error("Carousel not found"); return; }

  const viewport = root.querySelector(".rc-viewport");
  const track = root.querySelector(".rc-track");
  const slides = track.children;
  const prev = root.querySelector(".rc-prev");
  const next = root.querySelector(".rc-next");

  const AUTO_MS = 3500;   // Zeit zwischen den Bewegungen (in Millisekunden)
  let index = 0;
  let timer = null;

  function gap() {
    return parseFloat(getComputedStyle(track).columnGap) || 0;
  }
  function step() {
    return slides[0].getBoundingClientRect().width + gap();
  }
  function visibleCount() {
    return Math.max(1, Math.round((viewport.clientWidth + gap()) / step()));
  }

  function show(i) {
    const max = slides.length - visibleCount();
    if (max <= 0) { index = 0; }
    else if (i > max) { index = 0; }      // am Ende zurück zum Anfang
    else if (i < 0) { index = max; }      // am Anfang springt zum Ende
    else { index = i; }
    track.style.transform = `translateX(-${index * step()}px)`;
  }

  function startAuto() {
    stopAuto();
    timer = setInterval(() => show(index + 1), AUTO_MS);
  }
  function stopAuto() {
    if (timer) clearInterval(timer);
    timer = null;
  }

  prev.addEventListener("click", () => { show(index - 1); startAuto(); });
  next.addEventListener("click", () => { show(index + 1); startAuto(); });

  // Pause, solange die Maus auf dem Karussell ist
  root.addEventListener("mouseenter", stopAuto);
  root.addEventListener("mouseleave", startAuto);

  // Wischen auf dem Handy
  let startX = null;
  track.addEventListener("touchstart", (e) => {
    startX = e.touches[0].clientX;
    stopAuto();
  }, { passive: true });
  track.addEventListener("touchend", (e) => {
    if (startX !== null) {
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 50) show(index + (dx < 0 ? 1 : -1));
    }
    startX = null;
    startAuto();
  });

  window.addEventListener("resize", () => show(index));

  show(0);
  startAuto();
});
