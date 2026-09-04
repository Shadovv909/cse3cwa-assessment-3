"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type {
  DensityPreference,
  ThemePreference,
} from "@/types/activities";

const THEME_COOKIE = "phoneme-theme";
const DENSITY_COOKIE = "phoneme-density";
const COOKIE_AGE = 60 * 60 * 24 * 365;

type SettingsContextValue = {
  theme: ThemePreference;
  density: DensityPreference;
  setTheme: (theme: ThemePreference) => void;
  setDensity: (density: DensityPreference) => void;
  resetSettings: () => void;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

function readCookie(name: string) {
  if (typeof document === "undefined") return null;
  const prefix = `${name}=`;
  const match = document.cookie
    .split(";")
    .map((entry) => entry.trim())
    .find((entry) => entry.startsWith(prefix));
  return match ? decodeURIComponent(match.slice(prefix.length)) : null;
}

function writeCookie(name: string, value: string) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${COOKIE_AGE}; samesite=lax`;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; path=/; max-age=0; samesite=lax`;
}

export const settingsInitScript = `
(function () {
  try {
    var cookies = document.cookie.split(';').map(function (entry) { return entry.trim(); });
    function valueOf(name) {
      var prefix = name + '=';
      var match = cookies.find(function (entry) { return entry.indexOf(prefix) === 0; });
      return match ? decodeURIComponent(match.slice(prefix.length)) : null;
    }
    var savedTheme = valueOf('${THEME_COOKIE}');
    var savedDensity = valueOf('${DENSITY_COOKIE}');
    var theme = savedTheme === 'dark' || savedTheme === 'light'
      ? savedTheme
      : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.dataset.theme = theme;
    document.documentElement.dataset.density = savedDensity === 'compact' ? 'compact' : 'comfortable';
  } catch (error) {
    document.documentElement.dataset.theme = 'light';
    document.documentElement.dataset.density = 'comfortable';
  }
})();`;

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemePreference>("light");
  const [density, setDensityState] =
    useState<DensityPreference>("comfortable");

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const savedTheme = readCookie(THEME_COOKIE);
      const savedDensity = readCookie(DENSITY_COOKIE);
      const initialTheme: ThemePreference =
        savedTheme === "light" || savedTheme === "dark"
          ? savedTheme
          : window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light";
      const initialDensity: DensityPreference =
        savedDensity === "compact" ? "compact" : "comfortable";

      setThemeState(initialTheme);
      setDensityState(initialDensity);
      document.documentElement.dataset.theme = initialTheme;
      document.documentElement.dataset.density = initialDensity;
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  const setTheme = (nextTheme: ThemePreference) => {
    setThemeState(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
    writeCookie(THEME_COOKIE, nextTheme);
  };

  const setDensity = (nextDensity: DensityPreference) => {
    setDensityState(nextDensity);
    document.documentElement.dataset.density = nextDensity;
    writeCookie(DENSITY_COOKIE, nextDensity);
  };

  const resetSettings = () => {
    const nextTheme: ThemePreference = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches
      ? "dark"
      : "light";
    setThemeState(nextTheme);
    setDensityState("comfortable");
    document.documentElement.dataset.theme = nextTheme;
    document.documentElement.dataset.density = "comfortable";
    deleteCookie(THEME_COOKIE);
    deleteCookie(DENSITY_COOKIE);
  };

  const value = { theme, density, setTheme, setDensity, resetSettings };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used inside SettingsProvider");
  }
  return context;
}
