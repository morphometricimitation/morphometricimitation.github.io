document.addEventListener('DOMContentLoaded', function () {
  const section = document.querySelector('#interactive-retargeting');
  if (!section) return;
  const host = section.querySelector('[data-viewer-host]');
  const frame = host.querySelector('iframe');
  const status = section.querySelector('[data-viewer-status]');

  function showStatus(message) {
    status.textContent = message;
    status.hidden = !message;
  }

  // Messages work even when browser isolation prevents reading the frame's DOM.
  window.addEventListener('message', function (event) {
    if (event.source !== frame.contentWindow || !event.data ||
        event.data.type !== 'mmi-viewer-status') return;
    host.removeAttribute('aria-busy');
    showStatus(event.data.error
      ? 'The 3D scene could not start in this browser. Try opening the viewer in a new tab.'
      : '');
  });
  function checkViewer() {
    frame.contentWindow.postMessage({type: 'mmi-viewer-check'}, '*');
  }
  frame.addEventListener('load', checkViewer);
  frame.addEventListener('error', function () {
    host.removeAttribute('aria-busy');
    showStatus('The viewer could not load. Refresh the page or open it in a new tab.');
  });
  checkViewer();
});
