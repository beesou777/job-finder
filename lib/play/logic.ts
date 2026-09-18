// KamKhoj Play — pure, testable game logic (no React, no DOM).
// UI components must import from here; never duplicate this logic.

export type TTTCell = "X" | "O" | null;

export function tictactoeWinner(b: TTTCell[]): TTTCell | "draw" | null {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6],
  ];
  for (const [a, c, d] of lines) {
    if (b[a] && b[a] === b[c] && b[a] === b[d]) return b[a];
  }
  return b.every((x) => x) ? "draw" : null;
}

function minimaxScore(b: TTTCell[], isMax: boolean, ai: "X" | "O"): number {
  const w = tictactoeWinner(b);
  if (w === ai) return 10;
  if (w === "draw") return 0;
  if (w) return -10;
  const me: TTTCell = isMax ? ai : ai === "X" ? "O" : "X";
  let best = isMax ? -Infinity : Infinity;
  for (let i = 0; i < 9; i++) {
    if (!b[i]) {
      b[i] = me;
      const s = minimaxScore(b, !isMax, ai);
      b[i] = null;
      best = isMax ? Math.max(best, s) : Math.min(best, s);
    }
  }
  return best;
}

/** Best move index for `ai` on a 3x3 board. Returns -1 if full. */
export function tictactoeBestMove(board: TTTCell[], ai: "X" | "O"): number {
  let best = -Infinity;
  let move = -1;
  for (let i = 0; i < 9; i++) {
    if (!board[i]) {
      board[i] = ai;
      const s = minimaxScore(board, false, ai);
      board[i] = null;
      // prefer centre on ties for nicer play
      const tiebreak = i === 4 ? 0.5 : 0;
      if (s + tiebreak > best) {
        best = s + tiebreak;
        move = i;
      }
    }
  }
  return move;
}

// ---------- Connect Four ----------
export const CF_ROWS = 6;
export const CF_COLS = 7;
export type CFCell = 0 | 1 | 2; // 0 empty, 1 p1, 2 p2

export function connectFourWinner(b: CFCell[][]): CFCell | null {
  const R = b.length;
  const C = b[0]?.length ?? 0;
  const dirs = [
    [0, 1], [1, 0], [1, 1], [1, -1],
  ];
  for (let r = 0; r < R; r++) {
    for (let c = 0; c < C; c++) {
      const v = b[r][c];
      if (!v) continue;
      for (const [dr, dc] of dirs) {
        let ok = true;
        for (let k = 1; k < 4; k++) {
          const nr = r + dr * k;
          const nc = c + dc * k;
          if (nr < 0 || nr >= R || nc < 0 || nc >= C || b[nr][nc] !== v) {
            ok = false;
            break;
          }
        }
        if (ok) return v;
      }
    }
  }
  return null;
}

export function connectFourDrop(b: CFCell[][], col: number, p: CFCell): { row: number } | null {
  for (let r = b.length - 1; r >= 0; r--) {
    if (b[r][col] === 0) {
      b[r][col] = p;
      return { row: r };
    }
  }
  return null;
}

// ---------- Minesweeper ----------
export function mineNeighbors(rows: number, cols: number, r: number, c: number): Array<[number, number]> {
  const out: Array<[number, number]> = [];
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (!dr && !dc) continue;
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) out.push([nr, nc]);
    }
  }
  return out;
}

export function buildMinefield(
  rows: number,
  cols: number,
  mines: number,
  safeR: number,
  safeC: number,
  rand: () => number = Math.random,
): boolean[][] {
  const field: boolean[][] = Array.from({ length: rows }, () => Array(cols).fill(false));
  const forbidden = new Set<number>([safeR * cols + safeC]);
  // keep the 8 neighbours of first click safe too (friendlier boards)
  for (const [nr, nc] of mineNeighbors(rows, cols, safeR, safeC)) forbidden.add(nr * cols + nc);
  const candidates: number[] = [];
  for (let i = 0; i < rows * cols; i++) if (!forbidden.has(i)) candidates.push(i);
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }
  const count = Math.min(mines, candidates.length);
  for (let i = 0; i < count; i++) {
    field[Math.floor(candidates[i] / cols)][candidates[i] % cols] = true;
  }
  return field;
}

export function countAdjacentMines(field: boolean[][], r: number, c: number): number {
  let n = 0;
  for (const [nr, nc] of mineNeighbors(field.length, field[0].length, r, c)) {
    if (field[nr][nc]) n++;
  }
  return n;
}

// ---------- 2048 ----------
export type Board2048 = number[][]; // 0 = empty

export function slideRowLeft(row: number[]): { row: number[]; gained: number; moved: boolean } {
  const tiles = row.filter((v) => v !== 0);
  const out: number[] = [];
  let gained = 0;
  let i = 0;
  while (i < tiles.length) {
    if (i + 1 < tiles.length && tiles[i] === tiles[i + 1]) {
      const v = tiles[i] * 2;
      out.push(v);
      gained += v;
      i += 2;
    } else {
      out.push(tiles[i]);
      i += 1;
    }
  }
  while (out.length < row.length) out.push(0);
  return { row: out, gained, moved: out.some((v, idx) => v !== row[idx]) };
}

export type Move2048 = "left" | "right" | "up" | "down";

export function move2048(board: Board2048, dir: Move2048): { board: Board2048; gained: number; moved: boolean } {
  const n = board.length;
  const clone: Board2048 = board.map((r) => [...r]);
  let gained = 0;
  let moved = false;
  const apply = (get: (i: number) => number[], set: (i: number, row: number[]) => void, size: number) => {
    for (let i = 0; i < size; i++) {
      const r = slideRowLeft(get(i));
      set(i, r.row);
      gained += r.gained;
      if (r.moved) moved = true;
    }
  };
  if (dir === "left") {
    apply((i) => clone[i], (i, row) => { clone[i] = row; }, n);
  } else if (dir === "right") {
    apply(
      (i) => [...clone[i]].reverse(),
      (i, row) => { clone[i] = [...row].reverse(); },
      n,
    );
  } else if (dir === "up") {
    apply(
      (i) => clone.map((row) => row[i]),
      (i, row) => { row.forEach((v, r) => { clone[r][i] = v; }); },
      n,
    );
  } else {
    apply(
      (i) => clone.map((row) => row[i]).reverse(),
      (i, row) => { [...row].reverse().forEach((v, r) => { clone[r][i] = v; }); },
      n,
    );
  }
  return { board: clone, gained, moved };
}

export function canMove2048(board: Board2048): boolean {
  const n = board.length;
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (board[r][c] === 0) return true;
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (c + 1 < n && board[r][c] === board[r][c + 1]) return true;
      if (r + 1 < n && board[r][c] === board[r + 1][c]) return true;
    }
  }
  return false;
}

// ---------- Sudoku ----------
export function sudokuValid(board: number[][], r: number, c: number, val: number): boolean {
  for (let i = 0; i < 9; i++) {
    if (i !== c && board[r][i] === val) return false;
    if (i !== r && board[i][c] === val) return false;
  }
  const br = Math.floor(r / 3) * 3;
  const bc = Math.floor(c / 3) * 3;
  for (let dr = 0; dr < 3; dr++) {
    for (let dc = 0; dc < 3; dc++) {
      const nr = br + dr;
      const nc = bc + dc;
      if ((nr !== r || nc !== c) && board[nr][nc] === val) return false;
    }
  }
  return true;
}

export function sudokuComplete(board: number[][]): boolean {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const v = board[r][c];
      if (v < 1 || v > 9 || !sudokuValid(board, r, c, v)) return false;
    }
  }
  return true;
}

// ---------- Sliding puzzle ----------
export function slidingSolvable(tiles: number[]): boolean {
  // tiles: flat array with 0 = blank
  const arr = tiles.filter((v) => v !== 0);
  let inv = 0;
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) if (arr[i] > arr[j]) inv++;
  }
  const size = Math.round(Math.sqrt(tiles.length));
  if (size % 2 === 1) return inv % 2 === 0;
  const blankRowFromBottom = size - Math.floor(tiles.indexOf(0) / size);
  return (inv + blankRowFromBottom) % 2 === 1;
}

// ---------- Snake ----------
export interface SnakePoint { x: number; y: number }

export function snakeNext(head: SnakePoint, dir: SnakePoint): SnakePoint {
  return { x: head.x + dir.x, y: head.y + dir.y };
}

export function snakeHitsSelf(body: SnakePoint[], next: SnakePoint, grows: boolean): boolean {
  const check = grows ? body : body.slice(0, -1);
  return check.some((s) => s.x === next.x && s.y === next.y);
}

export function snakeHitsWall(next: SnakePoint, cols: number, rows: number): boolean {
  return next.x < 0 || next.y < 0 || next.x >= cols || next.y >= rows;
}

// ---------- Typing ----------
export function typingWpm(charsTyped: number, seconds: number): number {
  if (seconds <= 0) return 0;
  return Math.round(charsTyped / 5 / (seconds / 60));
}

export function typingAccuracy(correct: number, incorrect: number): number {
  const total = correct + incorrect;
  if (total <= 0) return 100;
  return Math.round((correct / total) * 1000) / 10;
}

// ---------- Scramble ----------
export function scrambleWord(word: string, rand: () => number = Math.random): string {
  const letters = word.split("");
  for (let tries = 0; tries < 12; tries++) {
    for (let i = letters.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [letters[i], letters[j]] = [letters[j], letters[i]];
    }
    const joined = letters.join("");
    if (joined !== word && letters.length > 1) return joined;
  }
  // fallback: rotate instead of returning the original
  if (letters.length > 1) {
    const first = letters.shift() as string;
    letters.push(first);
    if (letters.join("") === word) letters.reverse();
  }
  return letters.join("");
}
