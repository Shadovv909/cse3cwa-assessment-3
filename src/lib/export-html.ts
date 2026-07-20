import { getPhonemeHint, phonemeOptions } from "@/data/phonemes";
import { getPhonemeKeyboard } from "@/lib/phoneme-keyboard";
import type {
  WordleConfig,
  WordSearchConfig,
  WordSearchGrid,
} from "@/types/activities";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function safeJson(value: unknown) {
  return JSON.stringify(value)
    .replaceAll("<", "\\u003c")
    .replaceAll(">", "\\u003e")
    .replaceAll("&", "\\u0026");
}

function generatedThemeCss(theme: "light" | "dark") {
  if (theme === "dark") {
    return `
      --background: #101722;
      --surface: #182332;
      --surface-strong: #223146;
      --text: #f4f7fb;
      --muted: #c0ccda;
      --border: #52657c;
      --brand: #80d6cf;
      --brand-strong: #a9ebe5;
      --accent: #ffc98b;
      --correct: #72d4ab;
      --present: #f1bf64;
      --absent: #bac6d5;
      --danger: #ff9b9b;
      color-scheme: dark;`;
  }

  return `
      --background: #f2f6fb;
      --surface: #ffffff;
      --surface-strong: #eaf1f8;
      --text: #17263b;
      --muted: #586a80;
      --border: #b8c7d8;
      --brand: #176b73;
      --brand-strong: #0c4e55;
      --accent: #9b451b;
      --correct: #227553;
      --present: #805100;
      --absent: #536176;
      --danger: #a12c37;
      color-scheme: light;`;
}

const sharedCss = `
    * { box-sizing: border-box; }
    html { min-width: 320px; }
    body {
      margin: 0;
      min-height: 100vh;
      background:
        radial-gradient(circle at top right, color-mix(in srgb, var(--brand) 12%, transparent), transparent 35rem),
        var(--background);
      color: var(--text);
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      line-height: 1.5;
    }
    button { font: inherit; }
    button:focus-visible, a:focus-visible {
      outline: 3px solid var(--accent);
      outline-offset: 3px;
    }
    .shell { width: min(980px, calc(100% - 2rem)); margin: 0 auto; padding: 2rem 0 3rem; }
    .masthead { display: flex; justify-content: space-between; gap: 1rem; align-items: center; margin-bottom: 1.4rem; }
    .brand { display: inline-flex; align-items: center; gap: .65rem; font-weight: 800; letter-spacing: -.02em; }
    .brand-mark { display: grid; place-items: center; width: 2.5rem; height: 2.5rem; border-radius: .8rem; background: var(--brand); color: #fff; }
    .badge { padding: .35rem .65rem; border: 1px solid var(--border); border-radius: 999px; color: var(--muted); font-size: .82rem; font-weight: 700; }
    .panel { background: color-mix(in srgb, var(--surface) 96%, transparent); border: 1px solid var(--border); border-radius: 1.3rem; box-shadow: 0 18px 45px rgba(18, 35, 54, .12); overflow: hidden; }
    .panel-header { padding: clamp(1.25rem, 4vw, 2.2rem); border-bottom: 1px solid var(--border); }
    .eyebrow { margin: 0 0 .35rem; color: var(--brand); font-size: .8rem; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; }
    h1 { margin: 0; font-size: clamp(1.8rem, 6vw, 3rem); line-height: 1.08; letter-spacing: -.04em; }
    h2, h3 { line-height: 1.18; }
    .lead { max-width: 65ch; margin: .8rem 0 0; color: var(--muted); }
    .meta { display: flex; flex-wrap: wrap; gap: .55rem; margin-top: 1.1rem; }
    .meta span { padding: .4rem .7rem; border-radius: .65rem; background: var(--surface-strong); color: var(--muted); font-size: .85rem; font-weight: 700; }
    .activity { padding: clamp(1rem, 4vw, 2rem); }
    .instructions { margin: 0 0 1.2rem; padding: .85rem 1rem; border-left: .28rem solid var(--brand); border-radius: .55rem; background: var(--surface-strong); color: var(--muted); }
    .status { min-height: 1.7rem; margin: 1rem 0; font-weight: 750; color: var(--brand-strong); }
    .actions { display: flex; flex-wrap: wrap; justify-content: center; gap: .7rem; margin-top: 1.25rem; }
    .action {
      min-height: 2.8rem;
      padding: .7rem 1rem;
      border: 1px solid var(--border);
      border-radius: .75rem;
      background: var(--surface);
      color: var(--text);
      cursor: pointer;
      font-weight: 750;
    }
    .action:hover:not(:disabled) { border-color: var(--brand); transform: translateY(-1px); }
    .action:disabled { cursor: not-allowed; opacity: .55; }
    .footer-note { margin: 1.2rem 0 0; text-align: center; color: var(--muted); font-size: .82rem; }
    @media (max-width: 540px) {
      .shell { width: min(100% - 1rem, 980px); padding-top: .8rem; }
      .masthead { align-items: flex-start; }
      .badge { display: none; }
    }
    @media (prefers-reduced-motion: reduce) { * { scroll-behavior: auto !important; transition: none !important; } }
`;

export function buildWordleHtml(config: WordleConfig) {
  const keyboard = getPhonemeKeyboard(config.target, config.difficulty).map(
    (option) => ({
      symbol: option.symbol,
      label: option.label,
      hint: getPhonemeHint(option.symbol),
    }),
  );
  const data = safeJson({ config, keyboard });

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="A standalone phoneme Wordle classroom activity.">
  <title>${escapeHtml(config.title)}</title>
  <style>
    :root {${generatedThemeCss(config.theme)} }
    ${sharedCss}
    .play-layout { display: grid; grid-template-columns: minmax(15rem, 1fr) minmax(13rem, .72fr); gap: 1.2rem; align-items: start; }
    .board { display: grid; gap: .45rem; width: 100%; margin: 0 auto; }
    .board-row { display: grid; grid-template-columns: repeat(var(--tile-count), minmax(0, 1fr)); gap: .4rem; }
    .tile {
      position: relative;
      display: grid;
      place-items: center;
      min-width: 0;
      aspect-ratio: 1;
      border: 2px solid var(--border);
      border-radius: .72rem;
      background: var(--surface);
      font-size: clamp(.9rem, 3.5vw, 1.35rem);
      font-weight: 850;
    }
    .tile[data-status="correct"] { border-color: var(--correct); background: color-mix(in srgb, var(--correct) 22%, var(--surface)); }
    .tile[data-status="present"] { border-color: var(--present); background: color-mix(in srgb, var(--present) 20%, var(--surface)); }
    .tile[data-status="absent"] { border-color: var(--absent); background: color-mix(in srgb, var(--absent) 14%, var(--surface)); }
    .tile-icon { position: absolute; right: .28rem; bottom: .15rem; font-size: .72rem; line-height: 1; }
    .legend { display: flex; flex-wrap: wrap; justify-content: center; gap: .7rem; margin: .85rem 0; color: var(--muted); font-size: .8rem; }
    .legend span { display: inline-flex; align-items: center; gap: .3rem; }
    .legend-mark { display: inline-grid; place-items: center; width: 1.4rem; height: 1.4rem; border-radius: .4rem; border: 1px solid var(--border); font-weight: 900; }
    .keyboard-panel { padding: .9rem; border: 1px solid var(--border); border-radius: .9rem; background: var(--surface-strong); }
    .keyboard-panel h2 { margin: 0; font-size: 1rem; }
    .keyboard-panel p { margin: .25rem 0 .7rem; color: var(--muted); font-size: .78rem; }
    .keyboard { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: .42rem; max-height: 31rem; overflow-y: auto; }
    .key {
      display: grid;
      min-width: 0;
      min-height: 3.05rem;
      place-items: center;
      padding: .35rem;
      border: 1px solid var(--border);
      border-radius: .65rem;
      background: var(--surface);
      color: var(--text);
      cursor: pointer;
      font-weight: 850;
    }
    .key:hover:not(:disabled) { border-color: var(--brand); background: color-mix(in srgb, var(--brand) 12%, var(--surface)); }
    .key small { color: var(--muted); font-size: .64rem; font-weight: 750; }
    @media (max-width: 720px) { .play-layout { grid-template-columns: 1fr; } .keyboard { grid-template-columns: repeat(5, minmax(0, 1fr)); max-height: none; } }
    @media (max-width: 460px) { .keyboard { grid-template-columns: repeat(4, minmax(0, 1fr)); } .tile { border-radius: .5rem; } }
  </style>
</head>
<body>
  <main class="shell">
    <div class="masthead">
      <div class="brand"><span class="brand-mark" aria-hidden="true">/æ/</span> Phoneme Studio</div>
      <span class="badge">Standalone classroom activity</span>
    </div>
    <section class="panel" aria-labelledby="activity-title">
      <header class="panel-header">
        <p class="eyebrow">Phoneme Wordle</p>
        <h1 id="activity-title">${escapeHtml(config.title)}</h1>
        <p class="lead">Build the target sound sequence. A tick means the phoneme is in the correct position; a double arrow means it belongs elsewhere.</p>
        <div class="meta"><span>${config.target.length} phonemes</span><span>${config.maxAttempts} attempts</span><span>${escapeHtml(config.difficulty)} mode</span></div>
      </header>
      <div class="activity">
        <p id="instructions" class="instructions">Choose one phoneme at a time, then submit a complete row. Hover or focus on a key for its English-letter example.</p>
        <div class="play-layout">
          <div>
            <div id="board" class="board" role="grid" aria-label="Phoneme Wordle board" aria-describedby="instructions status"></div>
            <div class="legend" aria-label="Tile status legend">
              <span><b class="legend-mark">✓</b> correct place</span>
              <span><b class="legend-mark">↔</b> different place</span>
              <span><b class="legend-mark">×</b> not in answer</span>
            </div>
            <p id="status" class="status" role="status" aria-live="polite">Choose ${config.target.length} phonemes to begin.</p>
          </div>
          <section class="keyboard-panel" aria-labelledby="keyboard-title">
            <h2 id="keyboard-title">Phoneme keyboard</h2>
            <p>Choose symbols to build the current row.</p>
            <div id="keyboard" class="keyboard"></div>
          </section>
        </div>
        <div class="actions">
          <button id="delete" class="action" type="button">Delete last</button>
          <button id="submit" class="action" type="button">Submit guess</button>
          <button id="reset" class="action" type="button">Start again</button>
        </div>
      </div>
    </section>
    <p class="footer-note">Generated as one self-contained HTML file by Phoneme Studio.</p>
  </main>
  <script>
    const activity = ${data};
    const config = activity.config;
    const keyboardOptions = activity.keyboard;
    let guesses = [];
    let current = [];
    let finished = false;

    const board = document.getElementById("board");
    const keyboard = document.getElementById("keyboard");
    const status = document.getElementById("status");
    const submitButton = document.getElementById("submit");
    const deleteButton = document.getElementById("delete");

    function formatPhoneme(value) { return "/" + value + "/"; }

    function scoreGuess(guess, target) {
      const statuses = guess.map(function () { return "absent"; });
      const remaining = new Map();
      target.forEach(function (phoneme, index) {
        if (guess[index] === phoneme) statuses[index] = "correct";
        else remaining.set(phoneme, (remaining.get(phoneme) || 0) + 1);
      });
      guess.forEach(function (phoneme, index) {
        if (statuses[index] === "correct") return;
        const count = remaining.get(phoneme) || 0;
        if (count > 0) {
          statuses[index] = "present";
          remaining.set(phoneme, count - 1);
        }
      });
      return guess.map(function (phoneme, index) { return { phoneme: phoneme, status: statuses[index] }; });
    }

    function statusIcon(value) {
      if (value === "correct") return "✓";
      if (value === "present") return "↔";
      return "×";
    }

    function renderBoard() {
      board.innerHTML = "";
      board.style.setProperty("--tile-count", String(config.target.length));
      board.setAttribute("aria-rowcount", String(config.maxAttempts));
      board.setAttribute("aria-colcount", String(config.target.length));
      for (let rowIndex = 0; rowIndex < config.maxAttempts; rowIndex += 1) {
        const row = document.createElement("div");
        row.className = "board-row";
        row.setAttribute("role", "row");
        const submitted = guesses[rowIndex];
        const isCurrent = rowIndex === guesses.length && !finished;
        for (let columnIndex = 0; columnIndex < config.target.length; columnIndex += 1) {
          const tile = document.createElement("div");
          tile.className = "tile";
          tile.setAttribute("role", "gridcell");
          tile.setAttribute("aria-rowindex", String(rowIndex + 1));
          tile.setAttribute("aria-colindex", String(columnIndex + 1));
          if (submitted) {
            const item = submitted[columnIndex];
            tile.textContent = formatPhoneme(item.phoneme);
            tile.dataset.status = item.status;
            tile.setAttribute("aria-label", formatPhoneme(item.phoneme) + ", " + item.status);
            const icon = document.createElement("span");
            icon.className = "tile-icon";
            icon.setAttribute("aria-hidden", "true");
            icon.textContent = statusIcon(item.status);
            tile.appendChild(icon);
          } else if (isCurrent && current[columnIndex]) {
            tile.textContent = formatPhoneme(current[columnIndex]);
            tile.setAttribute("aria-label", formatPhoneme(current[columnIndex]) + ", not submitted");
          } else {
            tile.setAttribute("aria-label", "Empty phoneme tile");
          }
          row.appendChild(tile);
        }
        board.appendChild(row);
      }
    }

    function renderKeyboard() {
      keyboard.innerHTML = "";
      keyboardOptions.forEach(function (option) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "key";
        button.dataset.symbol = option.symbol;
        button.disabled = finished;
        button.title = option.hint;
        button.setAttribute("aria-label", "Choose " + option.hint);
        const symbol = document.createElement("span");
        symbol.textContent = formatPhoneme(option.symbol);
        button.appendChild(symbol);
        if (config.showHints) {
          const label = document.createElement("small");
          label.textContent = option.label;
          button.appendChild(label);
        }
        button.addEventListener("click", function () {
          if (finished || current.length >= config.target.length) return;
          current.push(option.symbol);
          status.textContent = current.length === config.target.length ? "Row complete. Submit your guess." : "Choose " + (config.target.length - current.length) + " more phoneme(s).";
          renderBoard();
        });
        keyboard.appendChild(button);
      });
    }

    function submitGuess() {
      if (finished) return;
      if (current.length !== config.target.length) {
        status.textContent = "Complete all " + config.target.length + " tiles before submitting.";
        return;
      }
      const scored = scoreGuess(current, config.target);
      guesses.push(scored);
      const won = scored.every(function (item) { return item.status === "correct"; });
      current = [];
      if (won) {
        finished = true;
        status.textContent = "Correct — the English word is “" + config.englishWord + "”.";
      } else if (guesses.length >= config.maxAttempts) {
        finished = true;
        status.textContent = "Activity complete. The English answer was “" + config.englishWord + "”.";
      } else {
        status.textContent = "Good try. Use the symbols to refine the next sequence.";
      }
      renderBoard();
      renderKeyboard();
      submitButton.disabled = finished;
      deleteButton.disabled = finished;
    }

    function deleteLast() {
      if (finished) return;
      current.pop();
      status.textContent = current.length ? "Current row contains " + current.length + " phoneme(s)." : "Choose " + config.target.length + " phonemes to begin.";
      renderBoard();
    }

    function resetGame() {
      guesses = [];
      current = [];
      finished = false;
      status.textContent = "Choose " + config.target.length + " phonemes to begin.";
      submitButton.disabled = false;
      deleteButton.disabled = false;
      renderBoard();
      renderKeyboard();
    }

    submitButton.addEventListener("click", submitGuess);
    deleteButton.addEventListener("click", deleteLast);
    document.getElementById("reset").addEventListener("click", resetGame);
    renderBoard();
    renderKeyboard();
  </script>
</body>
</html>`;
}

export function buildWordSearchHtml(
  config: WordSearchConfig,
  grid: WordSearchGrid,
) {
  const hints = Object.fromEntries(
    phonemeOptions.map((option) => [option.symbol, getPhonemeHint(option.symbol)]),
  );
  const data = safeJson({ config, grid, hints });

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="A standalone phoneme Word Search classroom activity.">
  <title>${escapeHtml(config.title)}</title>
  <style>
    :root {${generatedThemeCss(config.theme)} }
    ${sharedCss}
    .search-layout { display: grid; grid-template-columns: minmax(0, 1fr) minmax(14rem, .42fr); gap: 1.3rem; align-items: start; }
    .grid-wrap { overflow-x: auto; padding: .35rem; }
    .search-grid { display: grid; grid-template-columns: repeat(var(--grid-size), minmax(2.15rem, 1fr)); gap: .3rem; min-width: min-content; }
    .cell {
      position: relative;
      display: grid;
      place-items: center;
      aspect-ratio: 1;
      min-width: 2.15rem;
      border: 1px solid var(--border);
      border-radius: .55rem;
      background: var(--surface);
      color: var(--text);
      cursor: pointer;
      font-weight: 850;
    }
    .cell:hover { border-color: var(--brand); background: var(--surface-strong); }
    .cell[data-start="true"] { outline: 3px solid var(--accent); outline-offset: 1px; }
    .cell[data-found="true"] { border-color: var(--correct); background: color-mix(in srgb, var(--correct) 23%, var(--surface)); }
    .cell[data-found="true"]::after { content: "✓"; position: absolute; right: .16rem; bottom: .02rem; font-size: .62rem; color: var(--correct); }
    .word-panel { padding: 1rem; border: 1px solid var(--border); border-radius: 1rem; background: var(--surface-strong); }
    .word-panel h2 { margin: 0 0 .7rem; font-size: 1rem; }
    .word-list { display: grid; gap: .55rem; margin: 0; padding: 0; list-style: none; }
    .word-item { position: relative; padding: .65rem 2rem .65rem .7rem; border: 1px solid var(--border); border-radius: .7rem; background: var(--surface); }
    .word-item[data-found="true"] { border-color: var(--correct); background: color-mix(in srgb, var(--correct) 15%, var(--surface)); }
    .word-sequence { display: flex; flex-wrap: wrap; gap: .28rem; font-weight: 800; }
    .word-item small { display: block; margin-top: .25rem; color: var(--muted); }
    .word-item b { position: absolute; top: 50%; right: .7rem; color: var(--correct); transform: translateY(-50%); }
    @media (max-width: 760px) { .search-layout { grid-template-columns: 1fr; } .word-panel { order: -1; } .word-list { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
    @media (max-width: 540px) { .cell { min-width: 2rem; border-radius: .42rem; font-size: .84rem; } .word-list { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
  <main class="shell">
    <div class="masthead">
      <div class="brand"><span class="brand-mark" aria-hidden="true">/æ/</span> Phoneme Studio</div>
      <span class="badge">Standalone classroom activity</span>
    </div>
    <section class="panel" aria-labelledby="activity-title">
      <header class="panel-header">
        <p class="eyebrow">Phoneme Word Search</p>
        <h1 id="activity-title">${escapeHtml(config.title)}</h1>
        <p class="lead">Select the first and last tile of a straight phoneme sequence. Sequences may appear horizontally, vertically or diagonally according to the difficulty.</p>
        <div class="meta"><span>${config.words.length} target words</span><span>${config.gridSize} × ${config.gridSize} grid</span><span>${escapeHtml(config.difficulty)} mode</span></div>
      </header>
      <div class="activity">
        <p id="instructions" class="instructions">Choose a starting tile, then choose the ending tile. The activity checks the intended line in either direction. Press Escape to clear a starting tile.</p>
        <div class="search-layout">
          <div class="grid-wrap"><div id="grid" class="search-grid" role="group" aria-label="Phoneme word search grid" aria-describedby="instructions status"></div></div>
          <aside class="word-panel" aria-labelledby="targets-title">
            <h2 id="targets-title">Target sequences</h2>
            <ul id="word-list" class="word-list"></ul>
          </aside>
        </div>
        <p id="status" class="status" role="status" aria-live="polite">Choose the first tile of a target sequence.</p>
        <div class="actions"><button id="reset" class="action" type="button">Start again</button></div>
      </div>
    </section>
    <p class="footer-note">Generated as one self-contained HTML file by Phoneme Studio.</p>
  </main>
  <script>
    const activity = ${data};
    const config = activity.config;
    const gridData = activity.grid;
    const hints = activity.hints;
    const gridElement = document.getElementById("grid");
    const wordList = document.getElementById("word-list");
    const status = document.getElementById("status");
    let start = null;
    let foundWords = new Set();
    let foundCells = new Set();

    function key(cell) { return cell.row + ":" + cell.col; }
    function formatPhoneme(value) { return "/" + value + "/"; }
    function coordinatePathsEqual(first, second) {
      return first.length === second.length && first.every(function (value, index) {
        return value.row === second[index].row && value.col === second[index].col;
      });
    }

    function lineBetween(first, second) {
      const rowDifference = second.row - first.row;
      const colDifference = second.col - first.col;
      const straight = rowDifference === 0 || colDifference === 0 || Math.abs(rowDifference) === Math.abs(colDifference);
      if (!straight) return null;
      const rowStep = Math.sign(rowDifference);
      const colStep = Math.sign(colDifference);
      const length = Math.max(Math.abs(rowDifference), Math.abs(colDifference));
      return Array.from({ length: length + 1 }, function (_, index) {
        return { row: first.row + rowStep * index, col: first.col + colStep * index };
      });
    }

    function findPlacement(path) {
      const reverse = [...path].reverse();
      return gridData.placements.find(function (placement) {
        return !foundWords.has(placement.wordId) && (coordinatePathsEqual(placement.cells, path) || coordinatePathsEqual(placement.cells, reverse));
      });
    }

    function renderGrid() {
      gridElement.innerHTML = "";
      gridElement.style.setProperty("--grid-size", String(config.gridSize));
      gridData.cells.forEach(function (row, rowIndex) {
        row.forEach(function (phoneme, colIndex) {
          const button = document.createElement("button");
          button.type = "button";
          button.className = "cell";
          button.dataset.row = String(rowIndex);
          button.dataset.col = String(colIndex);
          const cell = { row: rowIndex, col: colIndex };
          const isStart = Boolean(start && start.row === rowIndex && start.col === colIndex);
          const isFound = foundCells.has(key(cell));
          button.dataset.start = String(isStart);
          button.dataset.found = String(isFound);
          button.setAttribute("aria-pressed", String(isStart));
          button.textContent = formatPhoneme(phoneme);
          button.title = hints[phoneme] || formatPhoneme(phoneme);
          button.setAttribute("aria-label", "Row " + (rowIndex + 1) + ", column " + (colIndex + 1) + ", " + (hints[phoneme] || formatPhoneme(phoneme)) + (isFound ? ", found" : ""));
          button.addEventListener("click", function () { selectCell(cell); });
          gridElement.appendChild(button);
        });
      });
    }

    function renderWords() {
      wordList.innerHTML = "";
      config.words.forEach(function (word) {
        const found = foundWords.has(word.id);
        const item = document.createElement("li");
        item.className = "word-item";
        item.dataset.found = String(found);
        const sequence = document.createElement("div");
        sequence.className = "word-sequence";
        sequence.textContent = word.phonemes.map(formatPhoneme).join(" ");
        item.appendChild(sequence);
        const hint = document.createElement("small");
        hint.textContent = config.showEnglishHints || found ? word.english : "English hint hidden";
        item.appendChild(hint);
        if (found) {
          const mark = document.createElement("b");
          mark.setAttribute("aria-label", "Found");
          mark.textContent = "✓";
          item.appendChild(mark);
        }
        wordList.appendChild(item);
      });
    }

    function selectCell(cell) {
      if (!start) {
        start = cell;
        status.textContent = "Starting tile selected. Now choose the final tile in a straight line.";
        renderGrid();
        return;
      }
      const path = lineBetween(start, cell);
      start = null;
      if (!path) {
        status.textContent = "That selection is not horizontal, vertical or diagonal. Try again.";
        renderGrid();
        return;
      }
      const placement = findPlacement(path);
      const word = placement && config.words.find(function (item) { return item.id === placement.wordId; });
      if (!placement || !word) {
        status.textContent = "That line does not match an unfound target sequence.";
      } else {
        foundWords.add(word.id);
        placement.cells.forEach(function (coordinate) { foundCells.add(key(coordinate)); });
        status.textContent = foundWords.size === config.words.length ? "Excellent — every target sequence has been found." : "Found “" + word.english + "”. " + (config.words.length - foundWords.size) + " sequence(s) remain.";
      }
      renderGrid();
      renderWords();
    }

    function resetGame() {
      start = null;
      foundWords = new Set();
      foundCells = new Set();
      status.textContent = "Choose the first tile of a target sequence.";
      renderGrid();
      renderWords();
    }

    gridElement.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && start) {
        start = null;
        status.textContent = "Starting tile cleared. Choose a new first tile.";
        renderGrid();
      }
    });
    document.getElementById("reset").addEventListener("click", resetGame);
    renderGrid();
    renderWords();
  </script>
</body>
</html>`;
}
