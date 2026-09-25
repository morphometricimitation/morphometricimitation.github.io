document.addEventListener('DOMContentLoaded', function () {
  const gallery = document.querySelector('#selected-videos');
  if (!gallery) return;

  const track = gallery.querySelector('.object-gallery');
  const columns = Array.from(track.querySelectorAll('.object-column'));
  const previousButtons = gallery.querySelectorAll('[data-gallery-previous]');
  const nextButtons = gallery.querySelectorAll('[data-gallery-next]');
  const status = gallery.querySelector('[data-gallery-status]');
  const videos = Array.from(track.querySelectorAll('video'));
  const nearby = new WeakMap();
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let first = 0;

  function visibleCount() {
    return window.innerWidth < 640 ? 1 : window.innerWidth < 1024 ? 2 : 3;
  }

  function syncVideo(video) {
    const active = !video.closest('.object-column').hidden;
    if (!active) {
      video.pause();
      if (video.hasAttribute('src')) {
        video.removeAttribute('src');
        video.load();
      }
      return;
    }

    if (!nearby.get(video)) {
      video.pause();
      return;
    }

    if (video.getAttribute('src') !== video.dataset.src) {
      video.src = video.dataset.src;
      video.load();
    }
    if (!reducedMotion.matches) {
      const playing = video.play();
      if (playing) playing.catch(function () { /* Native controls remain available. */ });
    }
  }

  function render() {
    const count = visibleCount();
    first = Math.max(0, Math.min(first, columns.length - count));
    columns.forEach(function (column, index) {
      column.hidden = index < first || index >= first + count;
    });
    previousButtons.forEach(function (button) { button.disabled = first === 0; });
    nextButtons.forEach(function (button) { button.disabled = first + count >= columns.length; });
    status.textContent = count === 1
      ? 'Category ' + (first + 1) + ' of ' + columns.length
      : 'Categories ' + (first + 1) + '\u2013' + Math.min(first + count, columns.length) + ' of ' + columns.length;
    videos.forEach(syncVideo);
  }

  previousButtons.forEach(function (button) {
    button.addEventListener('click', function () { first -= 1; render(); });
  });
  nextButtons.forEach(function (button) {
    button.addEventListener('click', function () { first += 1; render(); });
  });
  window.addEventListener('resize', render);

  gallery.querySelectorAll('[data-video-choice]').forEach(function (select) {
    select.addEventListener('change', function () {
      const video = select.closest('.gallery-card').querySelector('video');
      video.dataset.src = select.value;
      video.setAttribute('aria-label', select.dataset.object + ' \u2014 ' + select.selectedOptions[0].textContent);
      syncVideo(video);
    });
  });

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        nearby.set(entry.target, entry.isIntersecting);
        syncVideo(entry.target);
      });
    }, { rootMargin: '100px 0px' });
    videos.forEach(function (video) { observer.observe(video); });
  } else {
    videos.forEach(function (video) { nearby.set(video, true); });
  }

  render();
});
