"use client";

import { useState } from "react";
import { useSettings } from "@/components/settings/settings-provider";
import type {
  DensityPreference,
  ThemePreference,
} from "@/types/activities";

const themeOptions: Array<{
  value: ThemePreference;
  label: string;
  description: string;
}> = [
  {
    value: "light",
    label: "Light theme",
    description: "Bright surfaces with dark text for well-lit rooms.",
  },
  {
    value: "dark",
    label: "Dark theme",
    description: "Lower-luminance surfaces for dimmer environments.",
  },
];

const densityOptions: Array<{
  value: DensityPreference;
  label: string;
  description: string;
}> = [
  {
    value: "comfortable",
    label: "Comfortable spacing",
    description: "Larger gaps and controls for touch and relaxed scanning.",
  },
  {
    value: "compact",
    label: "Compact spacing",
    description: "Fits more builder controls on larger desktop screens.",
  },
];

export function SettingsPanel() {
  const { theme, density, setTheme, setDensity, resetSettings } = useSettings();
  const [message, setMessage] = useState(
    "Preferences are saved in browser cookies on this device.",
  );

  const chooseTheme = (value: ThemePreference) => {
    setTheme(value);
    setMessage(`${value === "light" ? "Light" : "Dark"} theme saved.`);
  };

  const chooseDensity = (value: DensityPreference) => {
    setDensity(value);
    setMessage(
      `${value === "comfortable" ? "Comfortable" : "Compact"} spacing saved.`,
    );
  };

  return (
    <div className="settings-layout">
      <section className="settings-card" aria-labelledby="theme-heading">
        <div className="settings-card__heading">
          <span className="settings-icon" aria-hidden="true">
            ◐
          </span>
          <div>
            <p className="eyebrow">Appearance</p>
            <h2 id="theme-heading">Theme</h2>
            <p>Choose a high-contrast visual mode for the builder.</p>
          </div>
        </div>
        <fieldset className="setting-choice-grid">
          <legend className="sr-only">Theme preference</legend>
          {themeOptions.map((option) => (
            <label className="setting-choice" key={option.value}>
              <input
                type="radio"
                name="theme"
                value={option.value}
                checked={theme === option.value}
                onChange={() => chooseTheme(option.value)}
              />
              <span className={`theme-swatch theme-swatch--${option.value}`}>
                <i />
                <i />
                <i />
              </span>
              <span>
                <strong>{option.label}</strong>
                <small>{option.description}</small>
              </span>
            </label>
          ))}
        </fieldset>
      </section>

      <section className="settings-card" aria-labelledby="density-heading">
        <div className="settings-card__heading">
          <span className="settings-icon" aria-hidden="true">
            ↕
          </span>
          <div>
            <p className="eyebrow">Layout</p>
            <h2 id="density-heading">Interface spacing</h2>
            <p>Adjust visual density without changing available features.</p>
          </div>
        </div>
        <fieldset className="setting-choice-grid">
          <legend className="sr-only">Spacing preference</legend>
          {densityOptions.map((option) => (
            <label className="setting-choice" key={option.value}>
              <input
                type="radio"
                name="density"
                value={option.value}
                checked={density === option.value}
                onChange={() => chooseDensity(option.value)}
              />
              <span className="density-swatch" data-density={option.value}>
                <i />
                <i />
                <i />
              </span>
              <span>
                <strong>{option.label}</strong>
                <small>{option.description}</small>
              </span>
            </label>
          ))}
        </fieldset>
      </section>

      <section className="settings-card settings-card--wide" aria-labelledby="privacy-heading">
        <div className="settings-card__heading">
          <span className="settings-icon" aria-hidden="true">
            ✓
          </span>
          <div>
            <p className="eyebrow">Local preferences</p>
            <h2 id="privacy-heading">Cookie behaviour</h2>
            <p>
              Only the theme and spacing choice are stored. Activity content is
              held in component state and is not sent to a server.
            </p>
          </div>
        </div>
        <div className="settings-summary">
          <dl>
            <div>
              <dt>Current theme</dt>
              <dd>{theme}</dd>
            </div>
            <div>
              <dt>Current spacing</dt>
              <dd>{density}</dd>
            </div>
            <div>
              <dt>Storage</dt>
              <dd>First-party cookies</dd>
            </div>
          </dl>
          <button
            className="button button--secondary"
            type="button"
            onClick={() => {
              resetSettings();
              setMessage("Saved preferences were cleared and defaults restored.");
            }}
          >
            Reset preferences
          </button>
        </div>
        <p className="settings-message" role="status" aria-live="polite">
          {message}
        </p>
      </section>
    </div>
  );
}
