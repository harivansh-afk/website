// click a project thumbnail to expand its media; click anywhere or esc closes.
// same zero-framework pattern as previews.js; degrades to the plain link.
(() => {
  const box = document.createElement("div");
  box.className = "lightbox";
  box.setAttribute("aria-hidden", "true");
  document.body.appendChild(box);

  function close() {
    box.classList.remove("on");
    box.innerHTML = "";
  }

  function open(thumb) {
    const src = thumb.querySelector("img, video");
    if (!src) return;
    box.innerHTML = "";
    const big = src.cloneNode(true);
    if (big.tagName === "VIDEO") {
      big.muted = true;
      big.autoplay = true;
      big.loop = true;
      big.playsInline = true;
    }
    box.appendChild(big);
    box.classList.add("on");
  }

  document.addEventListener("click", (e) => {
    if (box.classList.contains("on")) {
      e.preventDefault();
      close();
      return;
    }
    const thumb = e.target.closest && e.target.closest("a.thumb");
    if (!thumb) return;
    e.preventDefault();
    open(thumb);
  });

  addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });

  // #expand=<name> pins one open; used to screenshot the site itself
  const pinned = location.hash.match(/^#expand=([\w-]+)$/);
  if (pinned) {
    const media = document.querySelector(
      '.thumb :is(img, video)[src*="' + pinned[1] + '"]',
    );
    if (media) open(media.closest("a.thumb"));
  }
})();
