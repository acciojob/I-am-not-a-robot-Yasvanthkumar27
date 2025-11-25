// Robust "I'm not a robot" verification script
// Defensive: checks elements exist before using them to avoid "reading style of null"

// Try to locate exactly the 6 image tiles used by the tests.
// The tests often look for .img1 .img2 ... so we try those first.
function findTiles() {
  const selectors = ['.img1', '.img2', '.img3', '.img4', '.img5', '.img6'];
  const found = selectors.map(s => document.querySelector(s)).filter(Boolean);

  if (found.length === 6) return found;

  // Fallback: try a common 'tile' class or container pattern
  const fallback = Array.from(document.querySelectorAll('.tile, .img, .image, .image-tile, .grid > div'));
  if (fallback.length >= 6) return fallback.slice(0, 6);

  // Last resort: any 6 divs on the page (defensive)
  const anyDivs = Array.from(document.querySelectorAll('div')).filter(d => d.closest('body'));
  return anyDivs.slice(0, 6);
}

const tiles = findTiles();            // NodeList/Array of 6 elements (best-effort)
const resetBtn = document.getElementById('reset');
const verifyBtn = document.getElementById('verify');
const heading = document.getElementById('h');
const para = document.getElementById('para');

// Defensive helpers
function safeSetDisplay(el, value) { if (el) el.style.display = value; }
function safeText(el, txt) { if (el) el.textContent = txt; }
function safeClearBorder(el) { if (el) el.style.border = 'none'; }

// If we couldn't find 6 tiles, log a helpful message (Cypress output will show it)
if (!tiles || tiles.length < 6) {
  // still continue but avoid runtime errors
  // If Cypress expects .img1 etc, failing to find them will cause test failures later,
  // but at least our script won't crash with an uncaught exception.
  // console.warn(Expected 6 tiles but found ${tiles.length}.);
}

// images identities (5 unique names, one will duplicate)
const images = ['img1', 'img2', 'img3', 'img4', 'img5'];

let selected = []; // clicked tiles
function randomizeImages() {
  // Pick one duplicate randomly from images
  const duplicate = images[Math.floor(Math.random() * images.length)];

  // Build array of 6 image names and shuffle
  const finalImages = [...images, duplicate];
  for (let i = finalImages.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [finalImages[i], finalImages[j]] = [finalImages[j], finalImages[i]];
  }

  // Apply to the found tile elements (only if they exist)
  tiles.forEach((tile, i) => {
    if (!tile) return;
    // clear previous identity classes but preserve other classes if needed:
    // remove any imgN class if present
    tile.classList.remove('img1','img2','img3','img4','img5','img6');
    // add the new identity (img1..img5)
    const name = finalImages[i] || images[i % images.length];
    tile.classList.add(name);
    // store identity on dataset for verification
    tile.dataset.name = name;

    // Ensure visual initial state
    safeClearBorder(tile);
  });

  // Reset UI state
  selected = [];
  safeSetDisplay(resetBtn, 'none');
  safeSetDisplay(verifyBtn, 'none');
  safeText(para, '');
  safeText(heading, 'Please click on the identical tiles to verify that you are not a robot.');
}

// Initialize
randomizeImages();

// Click handler for tiles
tiles.forEach(tile => {
  if (!tile) return;
  tile.addEventListener('click', () => {
    // don't allow selecting more than 2
    if (selected.length >= 2) return;
    // do not allow clicking the same element twice
    if (selected.includes(tile)) return;

    // mark visually (guarded)
    if (tile) tile.style.border = '4px solid #007bff';
    selected.push(tile);

    if (selected.length === 1) {
      safeSetDisplay(resetBtn, 'block');
    }
    if (selected.length === 2) {
      safeSetDisplay(verifyBtn, 'block');
    }
  });
});

// Reset button behavior
if (resetBtn) {
  resetBtn.addEventListener('click', () => {
    selected.forEach(t => { if (t) t.style.border = 'none'; });
    selected = [];
    safeSetDisplay(resetBtn, 'none');
    safeSetDisplay(verifyBtn, 'none');
    safeText(para, '');
    safeText(heading, 'Please click on the identical tiles to verify that you are not a robot.');
  });
}

// Verify button behavior
if (verifyBtn) {
  verifyBtn.addEventListener('click', () => {
    safeSetDisplay(verifyBtn, 'none');

    if (selected.length !== 2) {
      safeText(para, "Please select two tiles to verify.");
      return;
    }

    const [a, b] = selected;
    const nameA = a ? a.dataset.name : null;
    const nameB = b ? b.dataset.name : null;

    if (nameA && nameB && nameA === nameB) {
      safeText(para, "You are a human. Congratulations!");
    } else {
      safeText(para, "We can't verify you as human. You selected non-identical tiles.");
    }
  });
}
