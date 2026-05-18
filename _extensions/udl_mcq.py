"""
udl_mcq — Sphinx extension for interactive multiple-choice questions.

Directive syntax
----------------
.. mcq:: Question text goes here?
   :correct: B
   :explanation: Optional explanation shown after answering.

   A. First option
   B. Second option (correct one)
   C. Third option
   D. Fourth option

The :correct: value can be a letter (A, B, C…) or a 1-based number (1, 2, 3…).
"""

import re
import uuid

from docutils import nodes
from docutils.parsers.rst import Directive, directives

OPTION_RE = re.compile(r"^([A-Za-z0-9])[.)]\s+(.+)$")
LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"


# ── Node ─────────────────────────────────────────────────────────────────────

class mcq_node(nodes.General, nodes.Element):
    pass


# ── Directive ─────────────────────────────────────────────────────────────────

class MCQDirective(Directive):
    required_arguments = 1          # the question
    optional_arguments = 0
    final_argument_whitespace = True
    has_content = True
    option_spec = {
        "correct": directives.unchanged_required,
        "explanation": directives.unchanged,
    }

    def run(self):
        question = self.arguments[0]
        correct_raw = self.options.get("correct", "").strip()
        explanation = self.options.get("explanation", "")

        options = []
        for line in self.content:
            line = line.strip()
            if not line:
                continue
            m = OPTION_RE.match(line)
            if m:
                options.append({"label": m.group(1).upper(), "text": m.group(2)})
            else:
                options.append({"label": LETTERS[len(options)], "text": line})

        correct_idx = _resolve_correct(correct_raw, options)

        node = mcq_node()
        node["question"] = question
        node["options"] = options
        node["correct_idx"] = correct_idx
        node["explanation"] = explanation
        node["mcq_id"] = "mcq-" + uuid.uuid4().hex[:8]
        return [node]


def _resolve_correct(raw, options):
    s = raw.upper()
    for i, opt in enumerate(options):
        if opt["label"] == s:
            return i
    try:
        return int(raw) - 1
    except (ValueError, TypeError):
        return 0


# ── HTML visitor ──────────────────────────────────────────────────────────────

def _esc(text):
    return (
        text.replace("&", "&amp;")
            .replace("<", "&lt;")
            .replace(">", "&gt;")
            .replace('"', "&quot;")
    )


def visit_mcq_html(self, node):
    q           = _esc(node["question"])
    opts        = node["options"]
    correct_idx = node["correct_idx"]
    explanation = _esc(node["explanation"])
    mid         = node["mcq_id"]

    parts = [
        f'<div class="udl-mcq" id="{mid}" data-correct="{correct_idx}">',
        f'  <div class="udl-mcq__question">{q}</div>',
        '  <div class="udl-mcq__options">',
    ]

    for i, opt in enumerate(opts):
        label = _esc(opt["label"])
        text  = _esc(opt["text"])
        parts.append(
            f'    <div class="udl-mcq__option" data-index="{i}"'
            f' role="radio" aria-checked="false" tabindex="0">'
            f'<span class="udl-mcq__option-label">{label}</span>'
            f'<span class="udl-mcq__option-text">{text}</span></div>'
        )

    parts += [
        "  </div>",
        '  <div class="udl-mcq__actions">',
        '    <button class="udl-mcq__submit" disabled>Submit</button>',
        '    <button class="udl-mcq__reset" style="display:none">Try Again</button>',
        "  </div>",
        '  <div class="udl-mcq__feedback" aria-live="polite"></div>',
    ]

    if explanation:
        parts.append(
            f'  <div class="udl-mcq__explanation" style="display:none">'
            f'<strong>Explanation:</strong> {explanation}</div>'
        )

    parts.append("</div>")
    self.body.append("\n".join(parts))


def depart_mcq_html(self, node):
    pass


def visit_mcq_skip(self, node):
    raise nodes.SkipNode


# ── Extension setup ───────────────────────────────────────────────────────────

def setup(app):
    app.add_node(
        mcq_node,
        html=(visit_mcq_html, depart_mcq_html),
        latex=(visit_mcq_skip, None),
        text=(visit_mcq_skip, None),
        man=(visit_mcq_skip, None),
    )
    app.add_directive("mcq", MCQDirective)
    app.add_css_file("css/udl_custom.css")
    app.add_js_file("js/udl_ui.js", priority=800)
    app.add_js_file("js/mcq.js")
    return {
        "version": "0.1.0",
        "parallel_read_safe": True,
        "parallel_write_safe": True,
    }
