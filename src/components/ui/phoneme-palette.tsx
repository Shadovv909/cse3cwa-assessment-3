import {
  formatPhoneme,
  getPhonemeHint,
  phonemeOptions,
} from "@/data/phonemes";

export function PhonemePalette({
  onSelect,
  disabled = false,
  labelledBy,
}: {
  onSelect: (symbol: string) => void;
  disabled?: boolean;
  labelledBy?: string;
}) {
  const groups = ["Consonants", "Vowels"] as const;

  return (
    <div className="phoneme-palette" aria-labelledby={labelledBy}>
      {groups.map((group) => (
        <section className="palette-group" key={group}>
          <h4>{group}</h4>
          <div className="palette-grid">
            {phonemeOptions
              .filter((option) => option.category === group)
              .map((option) => (
                <button
                  className="palette-button"
                  type="button"
                  key={`${option.symbol}-${option.example}`}
                  disabled={disabled}
                  title={getPhonemeHint(option.symbol)}
                  data-hint={getPhonemeHint(option.symbol)}
                  onClick={() => onSelect(option.symbol)}
                >
                  <span>{formatPhoneme(option.symbol)}</span>
                  <small>{option.label}</small>
                  <span className="sr-only">Add {getPhonemeHint(option.symbol)}</span>
                </button>
              ))}
          </div>
        </section>
      ))}
    </div>
  );
}
