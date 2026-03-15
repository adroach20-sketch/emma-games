// =====================================================================
// INIT — restores companion from save on page load.
// Must load LAST (after all other scripts).
// =====================================================================
(function init() {
  const save = loadSave();
  if (save.companion) {
    state.companion = { emoji: save.companion, name: save.companionName };
    // Pre-select the saved companion button on the welcome screen
    document.querySelectorAll('.companion-btn').forEach(btn => {
      const emojiEl = btn.querySelector('.companion-emoji');
      if (emojiEl && emojiEl.textContent === save.companion) {
        btn.classList.add('selected');
        document.getElementById('start-btn').classList.add('visible');
      }
    });
  }
})();
