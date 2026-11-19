"use client";

import { useEffect, useState } from "react";

export const THEME_KEY = "han.theme";
export type Theme = "dark" | "light";

/** Runs before first paint (see app/layout.tsx) so a returning visitor never sees a flash of the wrong theme. */
export const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem("${THEME_KEY}");if(t!=="light"&&t!=="dark"){t=window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark"}document.documentElement.setAttribute("data-theme",t)}catch(e){document.documentElement.setAttribute("data-theme","dark")}})();`;

function current(): Theme {
  return document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    setTheme(current());
    // Follow the operating system until the user makes an explicit choice.
    const mq = window.matchMedia("(prefers-color-scheme: light)");
    const onChange = () => {
      let stored: string | null = null;
      try { stored = window.localStorage.getItem(THEME_KEY); } catch { /* storage unavailable */ }
      if (stored === "light" || stored === "dark") return;
      const next: Theme = mq.matches ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      setTheme(next);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const toggle = () => {
    const next: Theme = current() === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try { window.localStorage.setItem(THEME_KEY, next); } catch { /* ignore: the choice still applies for this visit */ }
    setTheme(next);
  };

  const toLight = theme === "dark";
  return (
    <button type="button" className="han-menu-toggle han-theme-toggle" onClick={toggle} aria-pressed={!toLight}
      aria-label={toLight ? "Switch to light mode" : "Switch to dark mode"} title={toLight ? "Light mode" : "Dark mode"}>
      <span aria-hidden>{toLight ? "☀" : "☾"}</span>
    </button>
  );
}
