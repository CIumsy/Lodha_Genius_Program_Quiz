import os
import sys

sys.path.insert(0, os.path.abspath("_extensions"))

project = "Upside Down Labs"
copyright = "2026, Upside Down Labs"
author = "Upside Down Labs"
release = "1.0.0"

extensions = ["udl_mcq"]

templates_path   = ["_templates"]
exclude_patterns = ["_build", "Thumbs.db", ".DS_Store"]

html_theme      = "furo"
html_static_path = ["_static"]
html_title      = "Upside Down Labs"
html_logo       = "LOGO.png"
html_favicon    = "LOGO.png"

html_theme_options = {
    "dark_logo"          : "LOGO.png",
    "sidebar_hide_name"   : True,
    "navigation_with_keys": True,
    "light_css_variables" : {
        # brand
        "color-brand-primary"                   : "#7c3aed",
        "color-brand-content"                   : "#7c3aed",
        # page / content — all white
        "color-background-primary"              : "#000000",
        "color-background-secondary"            : "#ffffff",
        # text — very dark for contrast
        "color-foreground-primary"              : "#111827",
        "color-foreground-secondary"            : "#6b7280",
        # sidebar — same white as content
        "color-sidebar-background"              : "#ffffff",
        "color-sidebar-background-border"       : "#f3f0ff",
        "color-sidebar-brand-text"              : "#111827",
        "color-sidebar-caption-text"            : "#9ca3af",
        "color-sidebar-link-text"               : "#374151",
        "color-sidebar-link-text--top-level"    : "#111827",
        "color-sidebar-item-background--current": "#f5f3ff",
        "color-sidebar-item-background--hover"  : "#fafafa",
        "color-sidebar-search-background"       : "#f9fafb",
        "color-sidebar-search-border-color"     : "#d8b4fe",
        "color-sidebar-search-icon"             : "#7c3aed",
    },
}
