(() => {
  const companion = document.querySelector('.spiderman-scroll');
  if (!companion) return;

  const desktopQuery = window.matchMedia('(min-width: 1024px)');
  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  let currentY = 118;
  let targetY = 118;
  let currentTilt = 0;
  let targetTilt = 0;
  let previousScrollY = window.scrollY;
  let frameId = 0;
  let enabled = false;

  const setMotion = () => {
    companion.style.setProperty('--spider-y', `${currentY.toFixed(2)}px`);
    companion.style.setProperty('--spider-tilt', `${currentTilt.toFixed(2)}deg`);
    companion.style.setProperty('--spider-web-scale', Math.max(.01, (currentY + 5) / window.innerHeight).toFixed(4));
  };

  const measureScrollTarget = () => {
    const scrollY = window.scrollY;
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const minY = 112;
    const maxY = Math.max(minY, window.innerHeight - 88);
    targetY = minY + (scrollY / maxScroll) * (maxY - minY);
    const direction = scrollY - previousScrollY;
    targetTilt = direction > 0 ? 9 : direction < 0 ? -8 : 0;
    previousScrollY = scrollY;
  };

  const render = () => {
    frameId = 0;
    currentY += (targetY - currentY) * .16;
    currentTilt += (targetTilt - currentTilt) * .18;
    setMotion();

    if (Math.abs(targetY - currentY) > .08 || Math.abs(targetTilt - currentTilt) > .08) {
      frameId = window.requestAnimationFrame(render);
    }
  };

  const requestRender = () => {
    if (!frameId) frameId = window.requestAnimationFrame(render);
  };

  const onScroll = () => {
    measureScrollTarget();
    requestRender();
  };

  const onResize = () => {
    measureScrollTarget();
    currentY = targetY;
    currentTilt = 0;
    setMotion();
  };

  const setEnabled = () => {
    enabled = desktopQuery.matches && !reducedMotionQuery.matches;
    if (!enabled) {
      if (frameId) window.cancelAnimationFrame(frameId);
      frameId = 0;
      currentY = 118;
      targetY = 118;
      currentTilt = 0;
      targetTilt = 0;
      setMotion();
      return;
    }
    previousScrollY = window.scrollY;
    onResize();
  };

  window.addEventListener('scroll', () => {
    if (enabled) onScroll();
  }, { passive: true });
  window.addEventListener('resize', () => {
    if (enabled) onResize();
  }, { passive: true });
  desktopQuery.addEventListener?.('change', setEnabled);
  reducedMotionQuery.addEventListener?.('change', setEnabled);

  setEnabled();
})();
