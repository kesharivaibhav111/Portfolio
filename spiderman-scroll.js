(() => {
  const companion = document.querySelector('.spiderman-scroll');
  if (!companion) return;

  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const state = {
    currentY: 76,
    targetY: 76,
    currentTilt: 0,
    targetTilt: 0,
    currentSway: 0,
    targetSway: 0,
    currentSwing: 0,
    targetSwing: 0,
    previousScrollY: window.scrollY,
    scrollRange: 1,
    viewportHeight: window.innerHeight,
    minY: 76,
    maxY: 76,
    frameId: 0,
    settleTimer: 0
  };

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  const isCompact = () => window.innerWidth < 600;
  const isTablet = () => window.innerWidth >= 600 && window.innerWidth < 1024;

  const updateMetrics = () => {
    const compact = isCompact();
    const tablet = isTablet();
    const figureHeight = compact ? 69 : tablet ? 78 : 96;
    state.viewportHeight = Math.max(1, window.innerHeight);
    state.minY = compact ? 74 : tablet ? 84 : 96;
    state.maxY = Math.max(state.minY, state.viewportHeight - figureHeight - (compact ? 8 : 12));
    state.scrollRange = Math.max(1, document.documentElement.scrollHeight - state.viewportHeight);
  };

  const writeMotion = () => {
    const handOffset = isCompact() ? 4 : 6;
    const webStretch = clamp((state.currentY + handOffset) / state.viewportHeight, .025, 1.1);
    companion.style.setProperty('--spider-y', `${state.currentY.toFixed(2)}px`);
    companion.style.setProperty('--spider-tilt', `${state.currentTilt.toFixed(2)}deg`);
    companion.style.setProperty('--spider-sway', `${state.currentSway.toFixed(2)}px`);
    companion.style.setProperty('--spider-swing', `${state.currentSwing.toFixed(2)}deg`);
    companion.style.setProperty('--spider-web-stretch', webStretch.toFixed(4));
  };

  const setTargetFromScroll = () => {
    const scrollY = window.scrollY;
    const progress = clamp(scrollY / state.scrollRange, 0, 1);
    const direction = scrollY - state.previousScrollY;
    state.targetY = state.minY + (state.maxY - state.minY) * progress;

    if (direction) {
      const force = clamp(Math.abs(direction) * .18, 2.5, 9.5);
      const sign = direction > 0 ? 1 : -1;
      state.targetTilt = sign * force;
      state.targetSway = sign * Math.min(1.9, force * .22);
      state.targetSwing = sign * Math.min(2.2, force * .24);
    }

    state.previousScrollY = scrollY;
  };

  const needsFrame = () => (
    Math.abs(state.targetY - state.currentY) > .05 ||
    Math.abs(state.targetTilt - state.currentTilt) > .05 ||
    Math.abs(state.targetSway - state.currentSway) > .03 ||
    Math.abs(state.targetSwing - state.currentSwing) > .03
  );

  const render = () => {
    state.frameId = 0;
    if (reducedMotionQuery.matches) {
      state.currentY = state.targetY;
      state.currentTilt = 0;
      state.currentSway = 0;
      state.currentSwing = 0;
      writeMotion();
      return;
    }

    state.currentY += (state.targetY - state.currentY) * .16;
    state.currentTilt += (state.targetTilt - state.currentTilt) * .2;
    state.currentSway += (state.targetSway - state.currentSway) * .18;
    state.currentSwing += (state.targetSwing - state.currentSwing) * .18;
    writeMotion();

    if (needsFrame()) state.frameId = window.requestAnimationFrame(render);
  };

  const requestRender = () => {
    if (!state.frameId) state.frameId = window.requestAnimationFrame(render);
  };

  const settleMotion = () => {
    window.clearTimeout(state.settleTimer);
    state.settleTimer = window.setTimeout(() => {
      state.targetTilt = 0;
      state.targetSway = 0;
      state.targetSwing = 0;
      requestRender();
    }, 140);
  };

  const onScroll = () => {
    setTargetFromScroll();
    requestRender();
    settleMotion();
  };

  const onResize = () => {
    updateMetrics();
    setTargetFromScroll();
    state.currentY = state.targetY;
    state.currentTilt = 0;
    state.currentSway = 0;
    state.currentSwing = 0;
    writeMotion();
  };

  const onMotionPreferenceChange = () => {
    if (reducedMotionQuery.matches && state.frameId) {
      window.cancelAnimationFrame(state.frameId);
      state.frameId = 0;
    }
    onResize();
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onResize, { passive: true });
  window.addEventListener('load', onResize, { once: true });
  window.addEventListener('pagehide', () => {
    if (state.frameId) window.cancelAnimationFrame(state.frameId);
    window.clearTimeout(state.settleTimer);
  }, { once: true });
  reducedMotionQuery.addEventListener?.('change', onMotionPreferenceChange);

  onResize();
})();
