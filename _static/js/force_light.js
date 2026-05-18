/* Force light mode — runs before page paint to avoid flash */
(function () {
  document.documentElement.setAttribute("data-theme", "light");
  if (typeof window.__theme !== "undefined") window.__theme = "light";
  var btn = document.querySelector(".theme-toggle");
  if (btn) btn.style.display = "none";
})();
