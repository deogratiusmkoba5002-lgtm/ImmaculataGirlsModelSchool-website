/* ==========================
   CINEMATIC GALLERY
   ==========================*/

(() => {
  const gallery = document.querySelector("#cinematic-gallery");
  if (!gallery) return;

  const stage = document.querySelector("#gallery-stage");
  const thumbTrack = document.querySelector("#gallery-thumbnails");
  const pauseIndicator = document.querySelector("#gallery-pause-indicator");
  const prevBtn = document.querySelector("#gallery-prev");
  const nextBtn = document.querySelector("#gallery-next");

  const images = [
    { src: "assets/images/gallery/IMG-20260724-WA0000.jpg", caption: "Students"},
    { src: "assets/images/gallery/IMG-20260724-WA0001.jpg", caption: "Students,Principal and Father"},
    { src: "assets/images/gallery/IMG-20260724-WA0002.jpg", caption: "Students on local tour"},
    { src: "assets/images/gallery/IMG-20260724-WA0005.jpg", caption: "After morning jogging"},
    { src: "assets/images/gallery/IMG-20260724-WA0007.jpg", caption: "Students and staff"},
    { src: "assets/images/gallery/IMG-20260724-WA0008.jpg", caption: "Assembly"},
    { src: "assets/images/gallery/IMG-20260724-WA0017.jpg", caption: "A word with Sister"},
    { src: "assets/images/gallery/IMG-20260724-WA0018.jpg", caption: "Principal acknowledging high perfomers on school parade"},
    { src: "assets/images/gallery/IMG-20260724-WA0021.jpg", caption: "Examination room"},
  ];

  const WINDOW_SIZE = 5;
  const DWELL_MS = 4000;
  const FLY_MS = 900;
  const FADE_MS = 600;

  let currentIndex = 0;
  let paused = false;
  let dwellTimer = null;
  let dwellStart = 0;
  let dwellRemaining = DWELL_MS;
  let heroEl = null;
  let advancing = false;

  function imgAt(i) {
    return images[((i % images.length) + images.length) % images.length];
  }

  function withFallback(imgEl, onFail) {
    imgEl.onerror = () => {
      imgEl.style.display = "none";
      if (onFail) onFail();
    };
  }

  function renderThumbnails() {
    thumbTrack.innerHTML = "";
    for (let i = 0; i < WINDOW_SIZE; i++) {
      const idx = currentIndex + i;
      const data = imgAt(idx);

      const thumb = document.createElement("div");
      thumb.className = "gallery-thumb";
      thumb.dataset.index = idx;
      if (i === 0) thumb.classList.add("is-active-slot");

      const img = document.createElement("img");
      img.src = data.src;
      img.alt = data.caption || "";
      withFallback(img);
      thumb.appendChild(img);
      thumbTrack.appendChild(thumb);
    }
  }

  function getActiveThumb() {
    return thumbTrack.querySelector(`.gallery-thumb[data-index="${currentIndex}"]`);
  }

  function flyUpFromThumb() {
    const thumb = getActiveThumb();
    const data = imgAt(currentIndex);

    const hero = document.createElement("div");
    hero.className = "gallery-hero";

    const img = document.createElement("img");
    img.src = data.src;
    img.alt = data.caption || "";
    withFallback(img);
    hero.appendChild(img);

    if (data.caption) {
      const cap = document.createElement("div");
      cap.className = "gallery-caption";
      cap.textContent = data.caption;
      hero.appendChild(cap);
    }

    stage.appendChild(hero);
    heroEl = hero;

    if (thumb) {
      const startRect = thumb.getBoundingClientRect();
      const stageRect = stage.getBoundingClientRect();

      hero.style.width = startRect.width + "px";
      hero.style.height = startRect.height + "px";
      hero.style.left = (startRect.left - stageRect.left) + "px";
      hero.style.top = (startRect.top - stageRect.top) + "px";
      hero.style.borderRadius = "6px";

      thumb.classList.add("is-flying");

      // forcing reflow so the browser registers the starting rect
      void hero.offsetHeight;

      requestAnimationFrame(() => {
        hero.style.width = "100%";
        hero.style.height = "100%";
        hero.style.left = "0px";
        hero.style.top = "0px";
        hero.style.borderRadius = "0px";
      });
    } else {
      hero.style.width = "100%";
      hero.style.height = "100%";
      hero.style.left = "0px";
      hero.style.top = "0px";
      hero.style.opacity = "0";
      requestAnimationFrame(() => { hero.style.opacity = "1"; });
    }

    setTimeout(() => {
      if (heroEl === hero) {
        hero.classList.add("ken-burns");
        if (paused) hero.classList.add("is-paused");
      }
    }, FLY_MS);

    startDwellTimer();
  }

  function startDwellTimer(customMs) {
    dwellRemaining = customMs != null ? customMs : DWELL_MS;
    dwellStart = Date.now();
    clearTimeout(dwellTimer);
    if (!paused) {
      dwellTimer = setTimeout(fadeAndAdvance, dwellRemaining);
    }
  }

  function fadeAndAdvance() {
    if (!heroEl) return;
    const dyingHero = heroEl;
    heroEl = null;
    dyingHero.classList.remove("ken-burns", "is-paused");
    dyingHero.classList.add("is-fading");
    setTimeout(() => {
      dyingHero.remove();
      advanceCycle(1);
    }, FADE_MS);
  }

  function advanceCycle(step) {
    currentIndex = (((currentIndex + step) % images.length) + images.length) % images.length;
    renderThumbnails();
    advancing = false;
    setTimeout(() => { if (!paused) flyUpFromThumb(); }, 150);
  }

  function goTo(step) {
    if (advancing) return;
    advancing = true;
    clearTimeout(dwellTimer);

    if (heroEl) {
      const dying = heroEl;
      heroEl = null;
      dying.classList.remove("ken-burns", "is-paused");
      dying.classList.add("is-fading");
      setTimeout(() => {
        dying.remove();
        advanceCycle(step);
      }, FADE_MS);
    } else {
      advanceCycle(step);
    }
  }

  function setPaused(next) {
    if (next === paused) return;
    paused = next;

    if (paused) {
      clearTimeout(dwellTimer);
      dwellRemaining -= (Date.now() - dwellStart);
      if (heroEl) heroEl.classList.add("is-paused");
      showIndicator("▶️");
    } else {
      if (heroEl) heroEl.classList.remove("is-paused");
      dwellStart = Date.now();
      dwellTimer = setTimeout(fadeAndAdvance, Math.max(dwellRemaining, 300));
      flashIndicator("⏸️");
    }
  }

  function showIndicator(symbol) {
    pauseIndicator.textContent = symbol;
    pauseIndicator.classList.remove("visible");
    void pauseIndicator.offsetHeight;
    pauseIndicator.classList.add("visible");
  }

  function flashIndicator(symbol) {
    pauseIndicator.textContent = symbol;
    pauseIndicator.classList.remove("visible");
    void pauseIndicator.offsetHeight;
    pauseIndicator.classList.add("visible");
    setTimeout(() => pauseIndicator.classList.remove("visible"), 800);
  }

  // -------- TAPPING TO PAUSE --------
  gallery.addEventListener("click", (e) => {
    if (e.target.closest(".gallery-nav")) return;
    setPaused(!paused);
  });

  // -------- spacebar + arrow keys, only while gallery is in view --------
  document.addEventListener("keydown", (e) => {
    const rect = gallery.getBoundingClientRect();
    const inView = rect.top < window.innerHeight && rect.bottom > 0;
    if (!inView) return;

    if (e.code === "Space") {
      e.preventDefault();
      setPaused(!paused);
    } else if (e.code === "ArrowRight") {
      goTo(1);
    } else if (e.code === "ArrowLeft") {
      goTo(-1);
    }
  });

  if (prevBtn) prevBtn.addEventListener("click", () => goTo(-1));
  if (nextBtn) nextBtn.addEventListener("click", () => goTo(1));

  // -------- swipe on touch devices --------
  let touchStartX = 0;
  gallery.addEventListener("touchstart", (e) => {
    touchStartX = e.changedTouches[0].clientX;
  }, { passive: true });

  gallery.addEventListener("touchend", (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 50) goTo(dx < 0 ? 1 : -1);
  }, { passive: true });

  // ---- boot ----
  renderThumbnails();
  flyUpFromThumb();
})();
