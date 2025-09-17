(function () {
  const doc = document.documentElement;
  doc.classList.add("has-js");

  const yearEl = document.getElementById("current-year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear().toString();
  }

  const storageKey = "dcoric.dev:theme";
  const themeToggle = document.querySelector(".theme-toggle");
  const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");

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
    return stored === "light" || stored === "dark" ? stored : null;
  };

  const updateToggle = (theme, isManual) => {
    if (!themeToggle) return;
    const isDark = theme === "dark";
    const nextTheme = isDark ? "light" : "dark";
    const label = `Switch to ${nextTheme} theme`;
    themeToggle.setAttribute("aria-pressed", isDark ? "true" : "false");
    themeToggle.setAttribute("aria-label", label);
    const suffix = isManual ? "" : " (following system preference)";
    themeToggle.setAttribute("title", `${label}${suffix}`);
  };

  let storedPreference = getStoredPreference();

  const applyTheme = (theme, { persist = false } = {}) => {
    const normalized = theme === "dark" ? "dark" : "light";
    doc.dataset.theme = normalized;
    const isManual = persist || storedPreference !== null;
    updateToggle(normalized, isManual);
    if (persist) {
      storage.set(storageKey, normalized);
      storedPreference = normalized;
    }
  };

  const initialTheme = storedPreference ?? (prefersDarkScheme.matches ? "dark" : "light");
  applyTheme(initialTheme, { persist: false });

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const nextTheme = doc.dataset.theme === "dark" ? "light" : "dark";
      applyTheme(nextTheme, { persist: true });
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
