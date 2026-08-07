export type PhonemeOption = {
  symbol: string;
  label: string;
  example: string;
  category: "Consonants" | "Vowels";
};

export const phonemeOptions: PhonemeOption[] = [
  { symbol: "p", label: "P", example: "pen", category: "Consonants" },
  { symbol: "t", label: "T", example: "top", category: "Consonants" },
  { symbol: "k", label: "K", example: "cat", category: "Consonants" },
  { symbol: "b", label: "B", example: "bad", category: "Consonants" },
  { symbol: "d", label: "D", example: "dog", category: "Consonants" },
  { symbol: "ɡ", label: "G", example: "go", category: "Consonants" },
  { symbol: "n", label: "N", example: "net", category: "Consonants" },
  { symbol: "m", label: "M", example: "moon", category: "Consonants" },
  { symbol: "ŋ", label: "NG", example: "ring", category: "Consonants" },
  { symbol: "f", label: "F", example: "fan", category: "Consonants" },
  { symbol: "s", label: "S", example: "sun", category: "Consonants" },
  { symbol: "θ", label: "TH", example: "thin", category: "Consonants" },
  { symbol: "ʃ", label: "SH", example: "ship", category: "Consonants" },
  { symbol: "v", label: "V", example: "van", category: "Consonants" },
  { symbol: "z", label: "Z", example: "zip", category: "Consonants" },
  { symbol: "ð", label: "TH", example: "then", category: "Consonants" },
  { symbol: "ʒ", label: "ZH", example: "vision", category: "Consonants" },
  { symbol: "l", label: "L", example: "log", category: "Consonants" },
  { symbol: "ɹ", label: "R", example: "ring", category: "Consonants" },
  { symbol: "w", label: "W", example: "win", category: "Consonants" },
  { symbol: "j", label: "Y", example: "yes", category: "Consonants" },
  { symbol: "h", label: "H", example: "hat", category: "Consonants" },
  { symbol: "tʃ", label: "CH", example: "chin", category: "Consonants" },
  { symbol: "dʒ", label: "J", example: "jam", category: "Consonants" },
  { symbol: "iː", label: "EE", example: "see", category: "Vowels" },
  { symbol: "ɪ", label: "I", example: "sit", category: "Vowels" },
  { symbol: "e", label: "E", example: "bed", category: "Vowels" },
  { symbol: "eː", label: "AIR", example: "pair", category: "Vowels" },
  { symbol: "æ", label: "A", example: "bad", category: "Vowels" },
  { symbol: "ɐ", label: "U", example: "sun", category: "Vowels" },
  { symbol: "ɐː", label: "AR", example: "bark", category: "Vowels" },
  { symbol: "ɜː", label: "ER", example: "bird", category: "Vowels" },
  { symbol: "ʉː", label: "OO", example: "boot", category: "Vowels" },
  { symbol: "ɔ", label: "O", example: "log", category: "Vowels" },
  { symbol: "oː", label: "OR", example: "fork", category: "Vowels" },
  { symbol: "ʊ", label: "OO", example: "book", category: "Vowels" },
  { symbol: "æɪ", label: "AY", example: "bait", category: "Vowels" },
  { symbol: "ɑe", label: "EYE", example: "bike", category: "Vowels" },
  { symbol: "oɪ", label: "OY", example: "choice", category: "Vowels" },
  { symbol: "əʉ", label: "OH", example: "boat", category: "Vowels" },
  { symbol: "æɔ", label: "OW", example: "cloud", category: "Vowels" },
  { symbol: "ɪə", label: "EAR", example: "beard", category: "Vowels" },
  { symbol: "ə", label: "UH", example: "about", category: "Vowels" },
];

export const phonemeBySymbol = new Map(
  phonemeOptions.map((option) => [option.symbol, option]),
);

export function formatPhoneme(symbol: string) {
  return `/${symbol}/`;
}

export function getPhonemeHint(symbol: string) {
  const option = phonemeBySymbol.get(symbol);
  if (!option) return formatPhoneme(symbol);
  return `${formatPhoneme(symbol)}: ${option.label} (as in '${option.example}')`;
}
