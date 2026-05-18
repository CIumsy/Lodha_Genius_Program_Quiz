(function () {
  "use strict";

  /* ── 1. Force light mode before paint ─────────────────────────────────── */
  document.documentElement.setAttribute("data-theme", "light");

  document.addEventListener("DOMContentLoaded", function () {

    /* Hide theme toggle */
    var toggle = document.querySelector("button.theme-toggle");
    if (toggle) toggle.style.display = "none";

    /* ── 2. Style h2 headings by content ────────────────────────────────── */
    document.querySelectorAll("article h2").forEach(function (h2) {
      var text = h2.textContent.trim().toLowerCase();
      if (text.includes("quiz") || text.includes("check")) {
        h2.classList.add("udl-h2--quiz");
        h2.innerHTML = "🧪 " + h2.innerHTML;
      } else if (text.match(/hour\s*1/)) {
        h2.innerHTML = "⏱ " + h2.innerHTML;
      } else if (text.match(/hour\s*2/)) {
        h2.innerHTML = "⏱ " + h2.innerHTML;
      } else if (text.match(/hour\s*3/)) {
        h2.innerHTML = "⏱ " + h2.innerHTML;
      } else if (text.includes("hour")) {
        h2.innerHTML = "⏱ " + h2.innerHTML;
      }
    });

    /* ── 3. Add 🔬 icon to activity/challenge h3 ─────────────────────────── */
    document.querySelectorAll("article h3").forEach(function (h3) {
      var text = h3.textContent.trim().toLowerCase();
      if (text.includes("activity") || text.includes("challenge")) {
        h3.innerHTML = "🔬 " + h3.innerHTML;
      }
    });

    /* ── 4. Number each MCQ ──────────────────────────────────────────────── */
    var mcqs = document.querySelectorAll(".udl-mcq");
    if (mcqs.length > 0) {
      mcqs.forEach(function (mcq, i) {
        var badge = document.createElement("span");
        badge.className = "udl-mcq-number";
        badge.textContent = "Q" + (i + 1);
        badge.style.cssText =
          "position:absolute;top:-10px;left:1.2rem;" +
          "background:#7c3aed;color:#fff;font-size:0.72rem;" +
          "font-weight:800;padding:2px 10px;border-radius:999px;" +
          "letter-spacing:0.06em;";
        mcq.style.position = "relative";
        mcq.insertBefore(badge, mcq.firstChild);
      });
    }

    /* ── 5. Build left-sidebar navigation ────────────────────────────────── */
    buildSidebarNav();
  });

  /* ─────────────────────────────────────────────────────────────────────────
     Sidebar nav builder
     Headings in Sphinx/Furo don't carry id="" on the element itself.
     The anchor is stored in the child  <a class="headerlink" href="#slug">.
     We read that href to build our sidebar links.
  ───────────────────────────────────────────────────────────────────────── */
  function getAnchor(heading) {
    var hl = heading.querySelector("a.headerlink");
    return hl ? hl.getAttribute("href") : null;  /* e.g. "#hour-1-getting-started" */
  }

  function getLabel(heading) {
    /* Text content minus the pilcrow "¶" and the headerlink text */
    var clone = heading.cloneNode(true);
    var hl = clone.querySelector("a.headerlink");
    if (hl) hl.remove();
    return clone.textContent.replace(/¶/g, "").trim();
  }

  function buildSidebarNav() {
    var sidebarTree = document.querySelector(".sidebar-tree");
    if (!sidebarTree) return;

    /* Furo renders main content inside  <article role="main" id="furo-main-content"> */
    var article = document.getElementById("furo-main-content") ||
                  document.querySelector("article[role='main']") ||
                  document.querySelector("article");
    if (!article) return;

    /* Collect h1 + h2 (hours & quiz heading) — skip h3 for cleaner sidebar */
    var headings = Array.from(article.querySelectorAll("h1, h2"));
    if (headings.length === 0) return;

    /* Build nav list */
    var nav = document.createElement("ul");
    nav.className = "udl-sidebar-nav";

    headings.forEach(function (h) {
      var anchor = getAnchor(h);
      if (!anchor) return;

      var li = document.createElement("li");
      var a  = document.createElement("a");
      a.href        = anchor;
      a.textContent = getLabel(h);
      a.className   = "reference internal";
      li.appendChild(a);
      li.className  = h.tagName === "H1" ? "udl-nav-h1" : "udl-nav-h2";

      /* store anchor on element for scroll observer */
      li.dataset.anchor = anchor;
      nav.appendChild(li);
    });

    /* ── Extra link: Score (directly after last heading, no divider) ──────── */
    var scorePanel = document.querySelector(".udl-score-panel");

    if (scorePanel) {
      if (!scorePanel.id) scorePanel.id = "udl-score";
      var liScore = document.createElement("li");
      liScore.className = "udl-nav-h2 udl-nav-score";
      liScore.dataset.anchor = "#udl-score";
      var aScore = document.createElement("a");
      aScore.href        = "#udl-score";
      aScore.textContent = "📊 Score";
      aScore.className   = "reference internal";
      liScore.appendChild(aScore);
      nav.appendChild(liScore);
    }

    sidebarTree.innerHTML = "";
    sidebarTree.appendChild(nav);

    /* ── Scroll-based active highlight using IntersectionObserver ──────── */
    setupScrollHighlight(nav, article, headings);
  }

  function setupScrollHighlight(nav, article, headings) {
    if (!("IntersectionObserver" in window)) return;

    var allLinks = nav.querySelectorAll("a.reference");
    var currentAnchor = null;

    /* build a map  href → element  so we can observe each heading */
    var targets = [];
    headings.forEach(function (h) {
      var anchor = getAnchor(h);
      if (anchor) targets.push({ el: h, anchor: anchor });
    });

    if (targets.length === 0) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          /* find which heading this is */
          targets.forEach(function (t) {
            if (t.el === entry.target) currentAnchor = t.anchor;
          });
        }
      });
      /* highlight matching sidebar link */
      allLinks.forEach(function (link) {
        var isActive = link.getAttribute("href") === currentAnchor;
        link.parentElement.classList.toggle("udl-nav-active", isActive);
      });
    }, { rootMargin: "0px 0px -55% 0px", threshold: 0 });

    targets.forEach(function (t) { observer.observe(t.el); });
  }

})();
