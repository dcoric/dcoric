(function () {
  const doc = document.documentElement;
  doc.classList.add("has-js");

  const yearEl = document.getElementById("current-year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear().toString();
  }

  const storageKey = "dcoric.dev:theme";
  const themeToggle = document.querySelector(".theme-toggle");
  const themeSelector = document.querySelector(".theme-selector");
  const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");

  const validThemes = ["light", "dark", "pride", "pride-dark"];

  const storage = {
    get(key) {
      try {
        return window.localStorage.getItem(key);
      } catch (error) {
        return null;
      }
    },
    set(key, value) {
      try {
        window.localStorage.setItem(key, value);
      } catch (error) {
        /* ignore storage failures */
      }
    },
  };

  const getStoredPreference = () => {
    const stored = storage.get(storageKey);
    return validThemes.includes(stored) ? stored : null;
  };

  const updateToggle = (theme, isManual) => {
    if (!themeToggle) return;
    const isDark = theme === "dark" || theme === "pride-dark";
    const nextTheme = isDark ? "light" : "dark";
    const label = `Switch to ${nextTheme} theme`;
    themeToggle.setAttribute("aria-pressed", isDark ? "true" : "false");
    themeToggle.setAttribute("aria-label", label);
    const suffix = isManual ? "" : " (following system preference)";
    themeToggle.setAttribute("title", `${label}${suffix}`);
  };

  const updateThemeSelector = (theme) => {
    if (!themeSelector) return;
    const buttons = themeSelector.querySelectorAll("button[data-theme]");
    buttons.forEach((btn) => {
      btn.classList.toggle("active-theme", btn.dataset.theme === theme);
    });
  };

  let storedPreference = getStoredPreference();

  const applyTheme = (theme, { persist = false } = {}) => {
    if (!validThemes.includes(theme)) {
      console.warn(`Invalid theme: ${theme}`);
      return;
    }
    doc.dataset.theme = theme;
    updateToggle(theme, true);
    updateThemeSelector(theme);
    if (persist) {
      storage.set(storageKey, theme);
      storedPreference = theme;
    }
  };

  const initialTheme = storedPreference ?? (prefersDarkScheme.matches ? "dark" : "light");
  applyTheme(initialTheme, { persist: false });

  // Toggle button - cycles through themes in order
  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const currentTheme = doc.dataset.theme;
      const currentIndex = validThemes.indexOf(currentTheme);
      const nextIndex = (currentIndex + 1) % validThemes.length;
      applyTheme(validThemes[nextIndex], { persist: true });
    });
  }

  // Theme selector buttons - direct selection
  if (themeSelector) {
    themeSelector.addEventListener("click", (e) => {
      const button = e.target.closest('button[data-theme]');
      if (button) {
        applyTheme(button.dataset.theme, { persist: true });
      }
    });
  }

  if (!storedPreference) {
    const handleSystemChange = (event) => {
      if (storedPreference) {
        return;
      }
      applyTheme(event.matches ? "dark" : "light", { persist: false });
    };

    if (typeof prefersDarkScheme.addEventListener === "function") {
      prefersDarkScheme.addEventListener("change", handleSystemChange);
    } else if (typeof prefersDarkScheme.addListener === "function") {
      prefersDarkScheme.addListener(handleSystemChange);
    }
  }

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (!prefersReducedMotion.matches) {
    const hero = document.querySelector(".hero");
    if (hero) {
      hero.classList.add("hero--animate");

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              hero.classList.add("hero--visible");
              observer.disconnect();
            }
          });
        },
        { threshold: 0.25 }
      );

      observer.observe(hero);
    }
  }
})();
