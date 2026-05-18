(function () {
  "use strict";

  /* ── Shared score state ─────────────────────────────────────────────────── */
  var scoreState  = {};   /* mcqId -> { answered: bool, correct: bool } */
  var scorePanel  = null;
  var totalMCQs   = 0;

  function getScore() {
    var answered = 0, correct = 0;
    Object.keys(scoreState).forEach(function (id) {
      var s = scoreState[id];
      if (s.answered) { answered++; if (s.correct) correct++; }
    });
    return { answered: answered, correct: correct, total: totalMCQs };
  }

  function motivationMsg(pct, answered, total) {
    if (answered === 0)    return "Answer questions to see your score!";
    if (answered < total)  {
      if (pct === 100)     return "\uD83D\uDD25 Perfect so far — keep it up!";
      if (pct >= 80)       return "\uD83D\uDCAA Great progress — almost there!";
      return "\uD83D\uDCDA Keep going — you're making progress.";
    }
    /* all answered */
    if (pct === 100) return "\uD83C\uDFC6 Perfect score! Outstanding work!";
    if (pct >= 90)  return "\uD83C\uDF1F Excellent! You have mastered this topic.";
    if (pct >= 70)  return "\uD83D\uDC4D Great job! Strong understanding.";
    if (pct >= 50)  return "\uD83D\uDCAC Nice effort! Review highlighted answers and try again.";
    return "\uD83D\uDCDA Keep studying — every expert was once a beginner!";
  }

  function updateScorePanel() {
    if (!scorePanel) return;
    var s    = getScore();
    var pct  = s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0;
    var dispPct = s.answered > 0 ? Math.round((s.correct / s.total) * 100) : 0;

    scorePanel.querySelector(".udl-score__fraction").textContent =
      s.correct + " / " + s.total + " correct";
    scorePanel.querySelector(".udl-score__answered").textContent =
      s.answered + " of " + s.total + " answered";
    scorePanel.querySelector(".udl-score__pct").textContent = dispPct + "%";
    scorePanel.querySelector(".udl-score__bar-fill").style.width = dispPct + "%";
    scorePanel.querySelector(".udl-score__message").textContent =
      motivationMsg(dispPct, s.answered, s.total);

    /* colour the bar based on percentage */
    var fill = scorePanel.querySelector(".udl-score__bar-fill");
    fill.className = "udl-score__bar-fill";
    if (s.answered === 0)       fill.classList.add("udl-score__bar-fill--empty");
    else if (dispPct >= 80)     fill.classList.add("udl-score__bar-fill--good");
    else if (dispPct >= 50)     fill.classList.add("udl-score__bar-fill--mid");
    else                        fill.classList.add("udl-score__bar-fill--low");
  }

  function createScorePanel(total) {
    var el = document.createElement("div");
    el.className = "udl-score-panel";
    el.innerHTML = [
      '<div class="udl-score__header">',
      '  <span class="udl-score__icon">\uD83D\uDCCA</span>',
      '  <span class="udl-score__title">Quiz Score</span>',
      '  <span class="udl-score__pct">0%</span>',
      '</div>',
      '<div class="udl-score__bar-track">',
      '  <div class="udl-score__bar-fill udl-score__bar-fill--empty" style="width:0%"></div>',
      '</div>',
      '<div class="udl-score__meta">',
      '  <span class="udl-score__fraction">0 / ' + total + ' correct</span>',
      '  <span class="udl-score__answered">0 of ' + total + ' answered</span>',
      '</div>',
      '<div class="udl-score__message">Answer questions to see your score!</div>',
    ].join("\n");
    return el;
  }

  /* ── Per-MCQ initialiser ────────────────────────────────────────────────── */

  function initMCQ(container) {
    var mcqId       = container.id;
    var options     = container.querySelectorAll(".udl-mcq__option");
    var submitBtn   = container.querySelector(".udl-mcq__submit");
    var resetBtn    = container.querySelector(".udl-mcq__reset");
    var feedback    = container.querySelector(".udl-mcq__feedback");
    var explanation = container.querySelector(".udl-mcq__explanation");
    var correctIdx  = parseInt(container.dataset.correct, 10);

    var selectedIdx = null;
    var answered    = false;

    function selectOption(idx) {
      if (answered) return;
      selectedIdx = idx;
      options.forEach(function (opt, i) {
        opt.classList.toggle("selected", i === idx);
        opt.setAttribute("aria-checked", i === idx ? "true" : "false");
      });
      submitBtn.disabled = false;
    }

    options.forEach(function (opt, idx) {
      opt.addEventListener("click", function () { selectOption(idx); });
      opt.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          selectOption(idx);
        }
      });
    });

    submitBtn.addEventListener("click", function () {
      if (selectedIdx === null || answered) return;
      answered = true;

      submitBtn.style.display = "none";
      resetBtn.style.display  = "inline-block";

      var isCorrect = selectedIdx === correctIdx;

      options[selectedIdx].classList.add(isCorrect ? "correct" : "incorrect");
      if (!isCorrect) options[correctIdx].classList.add("correct");

      options.forEach(function (opt) {
        opt.style.cursor = "default";
        opt.setAttribute("tabindex", "-1");
      });

      feedback.className   = "udl-mcq__feedback " + (isCorrect ? "correct" : "incorrect");
      feedback.textContent = isCorrect
        ? "\u2713 Correct! Well done."
        : "\u2717 Incorrect. The correct answer is highlighted above.";

      if (explanation) explanation.style.display = "block";

      /* update score */
      scoreState[mcqId] = { answered: true, correct: isCorrect };
      updateScorePanel();
    });

    resetBtn.addEventListener("click", function () {
      answered    = false;
      selectedIdx = null;

      submitBtn.disabled      = true;
      submitBtn.style.display = "inline-block";
      resetBtn.style.display  = "none";

      options.forEach(function (opt) {
        opt.classList.remove("selected", "correct", "incorrect");
        opt.style.cursor = "pointer";
        opt.setAttribute("aria-checked", "false");
        opt.setAttribute("tabindex", "0");
      });

      feedback.className   = "udl-mcq__feedback";
      feedback.textContent = "";
      if (explanation) explanation.style.display = "none";

      /* remove this question from score until re-answered */
      scoreState[mcqId] = { answered: false, correct: false };
      updateScorePanel();
    });
  }

  /* ── Boot ────────────────────────────────────────────────────────────────── */

  document.addEventListener("DOMContentLoaded", function () {
    var mcqs = document.querySelectorAll(".udl-mcq");
    totalMCQs = mcqs.length;

    if (totalMCQs === 0) return;

    /* initialise state map */
    mcqs.forEach(function (m) {
      scoreState[m.id] = { answered: false, correct: false };
    });

    /* inject score panel after the last MCQ */
    scorePanel = createScorePanel(totalMCQs);
    mcqs[mcqs.length - 1].insertAdjacentElement("afterend", scorePanel);

    /* wire up each MCQ */
    mcqs.forEach(initMCQ);
  });
})();
