      const pondEl = document.getElementById('liquid-chrome');
      function rainDrop() {
        if (!document.hidden) {
          const r = pondEl.getBoundingClientRect();
          // keep drops away from the very edge
          const x = r.left + r.width  * (0.1 + Math.random() * 0.8);
          const y = r.top  + r.height * (0.1 + Math.random() * 0.8);
          window.dispatchEvent(new PointerEvent('pointerdown', { clientX: x, clientY: y }));
        }
        // next drop in 2 to 6 seconds
        setTimeout(rainDrop, 2000 + Math.random() * 4000);
      }
      setTimeout(rainDrop, 1500);

      // 1. Pfad-Animation (wie bisher)
  gsap.registerPlugin(MotionPathPlugin);

  const swim = gsap.to(".koi", {
    duration: 60,
    repeat: -1,
    ease: "none",
    motionPath: {
      path: "#route",
      align: "#route",
      autoRotate: true,
      alignOrigin: [0.5, 0.5],
    },
  });

  const koiElement = document.querySelector(".koi");
  koiElement.addEventListener("mouseenter", () => {
    gsap.to(swim, { timeScale: 3, duration: 0.4 });
  });
  koiElement.addEventListener("mouseleave", () => {
    gsap.to(swim, { timeScale: 1, duration: 1 });
  });

  // 2. Schwanz-Wackeln (Canvas)
  const canvas = document.querySelector(".koi");
  const ctx = canvas.getContext("2d");
  const img = new Image();
  img.src = "images/Koi_fish_dunkler.png";

  img.onload = () => {
    const slices = 40;
    const sliceW = img.width / slices;
    const drawW = canvas.width / slices;

    const draw = (time) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < slices; i++) {
        const t = 1 - i / slices; // bei Fisch nach links statt rechts: i / slices
        const offset = Math.sin(time / 200 + i * 0.3) * 12 * t * t;

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
