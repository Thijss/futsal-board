export const COURT_WIDTH = 640;
export const COURT_HEIGHT = 1280;
export const startingPieces = [
  { id: "home-1", team: "home", number: 1, x: 50, y: 91 },
  { id: "home-2", team: "home", number: 2, x: 51, y: 62 },
  { id: "home-3", team: "home", number: 3, x: 10, y: 47 },
  { id: "home-4", team: "home", number: 4, x: 90, y: 51 },
  { id: "home-5", team: "home", number: 5, x: 46, y: 29 },
  { id: "away-1", team: "away", number: 1, x: 50, y: 7 },
  { id: "away-2", team: "away", number: 2, x: 50, y: 22 },
  { id: "away-3", team: "away", number: 3, x: 33, y: 36 },
  { id: "away-4", team: "away", number: 4, x: 69, y: 37 },
  { id: "away-5", team: "away", number: 5, x: 53, y: 47 },
  { id: "ball", x: 53, y: 59.8 },
];

export function initialPieces() {
  return startingPieces.map((piece) => ({ ...piece }));
}

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function pointOnCourt(clientX, clientY, rect) {
  return {
    x: clamp(((clientX - rect.left) / rect.width) * COURT_WIDTH, 0, COURT_WIDTH),
    y: clamp(((clientY - rect.top) / rect.height) * COURT_HEIGHT, 0, COURT_HEIGHT),
  };
}

export function positionPiece(piece, point) {
  return {
    ...piece,
    x: clamp((point.x / COURT_WIDTH) * 100, 4, 96),
    y: clamp((point.y / COURT_HEIGHT) * 100, 2, 98),
  };
}
