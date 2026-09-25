document.addEventListener('DOMContentLoaded', function () {
  const section = document.querySelector('#rl-results');
  if (!section) return;
  const videos = Array.from(section.querySelectorAll('video'));
  const panels = Array.from(section.querySelectorAll('[data-rl-panel]'));
  const tabs = Array.from(section.querySelectorAll('[data-rl-tab]'));
  const visible = new WeakMap();
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function update(video) {
    if (video.closest('[data-rl-panel]').hidden) {
      video.pause();
      if (video.hasAttribute('src')) {
        video.removeAttribute('src');
        video.load();
      }
      return;
    }
    if (!visible.get(video) || document.hidden) {
      video.pause();
      return;
    }
    if (!video.hasAttribute('src')) {
      video.src = video.dataset.src;
      video.load();
    }
    if (!reducedMotion.matches) {
      video.play().catch(function () { /* Native controls remain available. */ });
    }
  }

  function selectObject(index, focus) {
    tabs.forEach(function (tab, i) {
      tab.setAttribute('aria-selected', String(i === index));
      tab.tabIndex = i === index ? 0 : -1;
      panels[i].hidden = i !== index;
    });
    videos.forEach(update);
    if (focus) tabs[index].focus();
  }
  tabs.forEach(function (tab, index) {
    tab.addEventListener('click', function () { selectObject(index, false); });
    tab.addEventListener('keydown', function (event) {
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next !== undefined) {
        event.preventDefault();
        selectObject(next, true);
      }
    });
  });
  section.querySelector('[data-rl-tabs]').hidden = false;
  selectObject(0, false);

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        visible.set(entry.target, entry.isIntersecting);
        update(entry.target);
      });
    }, { threshold: 0.1 });
    videos.forEach(function (video) { observer.observe(video); });
  } else {
    videos.forEach(function (video) { visible.set(video, true); update(video); });
  }
  document.addEventListener('visibilitychange', function () { videos.forEach(update); });
  reducedMotion.addEventListener('change', function () {
    videos.forEach(function (video) {
      if (reducedMotion.matches) video.pause();
      else update(video);
    });
  });
});
