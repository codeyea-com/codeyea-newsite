/* Adapted from the preserved storiesMotion, keeping its entrance and word timings. */
(() => {
  document.querySelectorAll('[data-server-features]').forEach((section) => {
    if (section.dataset.specsReady) return;
    section.dataset.specsReady = 'true';
    const slides = [...section.querySelectorAll('.cy-spec-slide')];
    const reduce = matchMedia('(prefers-reduced-motion:reduce)');
    const meter = section.querySelector('.cy-spec-meter-progress');
    const indexLabel = section.querySelector('.cy-spec-index');
    const status = section.querySelector('.cy-spec-status');
    const touch = section.querySelector('.cy-spec-slides');
    const rtl = section.dir === 'rtl';
    let active = 0;
    let animations = [];
    let pointer = null;
    let inView = false;
    let hovered = false;
    let keyboardFocus = false;
    let autoplayTimer;
    const autoplayDelay = 7000;

    function scheduleAutoplay() {
      clearTimeout(autoplayTimer);
      if (!inView || document.hidden || reduce.matches || hovered || keyboardFocus || pointer || slides.length < 2) return;
      autoplayTimer = setTimeout(() => change(1, false), autoplayDelay);
    }

    slides.forEach((slide) => {
      const p = slide.querySelector('p');
      p.setAttribute('aria-label', p.textContent);
      p.replaceChildren(...p.textContent.split(/(\s+)/).map((word) => {
        if (!word.trim()) return document.createTextNode(word);
        const span = document.createElement('span');
        span.className = 'cy-spec-word';
        span.setAttribute('aria-hidden', 'true');
        span.textContent = word;
        return span;
      }));
    });

    function stop() {
      animations.forEach((animation) => {
        animation.onfinish = null;
        animation.cancel();
      });
      animations = [];
    }

    function settle() {
      slides.forEach((slide, i) => {
        slide.hidden = i !== active;
        slide.setAttribute('aria-hidden', String(i !== active));
      });
    }

    function change(direction, announce = true) {
      stop();
      const previous = active;
      active = (active + direction + slides.length) % slides.length;
      settle();
      const current = slides[active];
      indexLabel.textContent = String(active + 1);
      meter.style.strokeDashoffset = String(100 - (active + 1) / slides.length * 100);
      if (announce) status.textContent = `${status.dataset.statusLabel} ${active + 1} / ${slides.length}: ${current.querySelector('strong').textContent}`;
      scheduleAutoplay();
      if (reduce.matches) return;
      const movement = rtl ? -direction : direction;
      const outgoingSlide = slides[previous];
      outgoingSlide.hidden = false;
      outgoingSlide.setAttribute('aria-hidden', 'true');
      const outgoing = outgoingSlide.animate([
        { opacity: 1, transform: 'translateX(0)' },
        { opacity: 0, transform: `translateX(${-movement * 22}px)` },
      ], { duration: 250, fill: 'forwards' });
      animations.push(outgoing);
      outgoing.onfinish = () => {
        outgoingSlide.hidden = true;
        outgoing.cancel();
      };
      current.querySelectorAll('.cy-spec-word').forEach((word, i) => animations.push(word.animate([
        { opacity: 0, transform: `translateX(${movement * 30}px)` },
        { opacity: 1, transform: 'translateX(0)' },
      ], { duration: 700, delay: 90 + i * 12, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards' })));
      animations.push(indexLabel.animate([
        { opacity: 0, transform: 'translateY(14px)' },
        { opacity: 1, transform: 'none' },
      ], { duration: 600, easing: 'ease-out' }));
    }

    section.querySelectorAll('[data-spec-dir]').forEach((button) => {
      button.addEventListener('click', () => change(Number(button.dataset.specDir)));
    });
    section.addEventListener('keydown', (event) => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault();
      change((event.key === 'ArrowRight' ? 1 : -1) * (rtl ? -1 : 1));
    });
    touch.addEventListener('pointerdown', (event) => {
      if (event.pointerType === 'touch') {
        pointer = { x: event.clientX, y: event.clientY };
        scheduleAutoplay();
      }
    });
    touch.addEventListener('pointerup', (event) => {
      if (!pointer) return;
      const dx = event.clientX - pointer.x;
      const dy = event.clientY - pointer.y;
      pointer = null;
      if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy)) change((dx < 0 ? 1 : -1) * (rtl ? -1 : 1));
      else scheduleAutoplay();
    });
    touch.addEventListener('pointercancel', () => { pointer = null; scheduleAutoplay(); });
    section.addEventListener('pointerenter', (event) => {
      if (event.pointerType !== 'mouse' && event.pointerType !== 'pen') return;
      hovered = true;
      scheduleAutoplay();
    });
    section.addEventListener('pointerleave', () => {
      hovered = false;
      scheduleAutoplay();
    });
    section.addEventListener('focusin', (event) => {
      keyboardFocus = event.target.matches(':focus-visible');
      scheduleAutoplay();
    });
    section.addEventListener('focusout', () => queueMicrotask(() => {
      keyboardFocus = section.contains(document.activeElement) && document.activeElement.matches(':focus-visible');
      scheduleAutoplay();
    }));
    document.addEventListener('visibilitychange', scheduleAutoplay);
    const visibility = new IntersectionObserver((entries) => {
      inView = entries[0].isIntersecting && entries[0].intersectionRatio >= 0.15;
      scheduleAutoplay();
    }, { threshold: 0.15 });
    visibility.observe(section);
    const observer = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) return;
      observer.disconnect();
      if (reduce.matches) return;
      section.querySelectorAll('header,.cy-spec-rule,.cy-spec-layout').forEach((element, i) => animations.push(element.animate([
        { opacity: 0, transform: 'translateY(25px)' },
        { opacity: 1, transform: 'none' },
      ], { duration: 1200, delay: i * 140, easing: 'cubic-bezier(.165,.84,.44,1)', fill: 'backwards' })));
    }, { threshold: 0.15 });
    observer.observe(section);
    reduce.addEventListener('change', () => {
      if (reduce.matches) {
        stop();
        settle();
      }
      scheduleAutoplay();
    });
  });
})();
