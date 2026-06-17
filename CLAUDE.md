# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a personal portfolio website for Denis Ćorić, built as a static site using HTML, CSS, and vanilla JavaScript. The project has no build process or dependencies.

### Key Files

- `index.html` - Main page structure containing sections for skills, projects, metrics, and contact info
- `styles.css` - Styling with CSS custom properties for light/dark theming
- `script.js` - Theme toggle functionality and light animation effects wrapped in an IIFE to avoid global scope pollution

## Commands

### Running the site

```bash
open index.html
```

Or use a local server:

```bash
python3 -m http.server 8000
# Then visit http://localhost:8000/index.html
```

There are no build, lint, or test commands configured for this project.

## Code Structure

### Theme System (styles.css)

The site uses CSS custom properties (`--color-bg`, `--text-color`, etc.) defined on the `:root` element for theming. Four themes are available:

- **light** - Default light mode with blue/teal accents
- **dark** - Dark mode optimized for low-light environments
- **pride** - LGBT pride theme with rainbow gradient background (red, orange, yellow, green, blue, purple stripes)
- **pride-dark** - Pride colors on a dark background

Themes are applied via `data-theme` attribute on the `<html>` element.

### JavaScript Architecture (script.js)

The code uses an IIFE pattern to avoid polluting the global namespace:

```javascript
(() => {
    // All code here is scoped to this function
})();
```

Key features:
- Theme toggle cycles through all themes in order
- Individual theme selector buttons for direct selection (light, dark, pride light, pride dark)
- Active theme indicator shows current selection
- Persistence via localStorage
- System preference fallback when no stored preference exists

## Development Notes

When modifying files:

1. **HTML structure changes** - Ensure semantic tags are maintained and accessibility attributes (alt text, ARIA labels) are preserved
2. **CSS updates** - Add new styles to existing custom property variables rather than hardcoding values; keep dark mode consistency
3. **JavaScript additions** - Keep code within the IIFE scope or create named exports if modularization becomes necessary

## External References

The site uses GitHub-hosted images for metrics (GitHub stats, contribution streaks) from `github-readme-stats` and `streak-stats` dashboards.
