import { COURT_HEIGHT, COURT_WIDTH, initialPieces, pointOnCourt, positionPiece } from "./board.js";

const pitch = document.querySelector("#pitch");
const piecesLayer = document.querySelector("#pieces");

let pieces = initialPieces();
let gesture = null;

function renderPieces() {
  piecesLayer.replaceChildren(...pieces.map((piece) => {
    const element = document.createElement("button");
    element.type = "button";
    element.className = piece.id === "ball"
      ? "piece ball"
      : `piece player ${piece.team}${piece.number === 1 ? " goalkeeper" : ""}`;
    element.dataset.id = piece.id;
    element.setAttribute("aria-label", piece.id === "ball" ? "Ball" : `${piece.team === "home" ? "Home" : "Away"} player ${piece.number}`);
    element.title = element.getAttribute("aria-label");
    setPiecePosition(element, piece);
    return element;
  }));
}

function setPiecePosition(element, piece) {
  element.style.left = `${piece.x}%`;
  element.style.top = `${piece.y}%`;
}

function courtPoint(event) {
  return pointOnCourt(event.clientX, event.clientY, pitch.getBoundingClientRect());
}

pitch.addEventListener("pointerdown", (event) => {
  if (event.button !== 0 || gesture) return;
  let element = null;
  let shortestDistance = 24;
  for (const candidate of piecesLayer.children) {
    const rect = candidate.getBoundingClientRect();
    const distance = Math.hypot(event.clientX - rect.left - rect.width / 2, event.clientY - rect.top - rect.height / 2);
    if (distance < shortestDistance) {
      shortestDistance = distance;
      element = candidate;
    }
  }
  if (!element) return;
  const piece = pieces.find((item) => item.id === element.dataset.id);
  if (!piece) return;
  const point = courtPoint(event);
  gesture = {
    id: piece.id,
    offsetX: (piece.x / 100) * COURT_WIDTH - point.x,
    offsetY: (piece.y / 100) * COURT_HEIGHT - point.y,
  };
  element.classList.add("dragging");
  pitch.setPointerCapture(event.pointerId);
  event.preventDefault();
});

pitch.addEventListener("pointermove", (event) => {
  if (!gesture) return;
  const point = courtPoint(event);
  const index = pieces.findIndex((piece) => piece.id === gesture.id);
  pieces[index] = positionPiece(pieces[index], {
    x: point.x + gesture.offsetX,
    y: point.y + gesture.offsetY,
  });
  setPiecePosition(piecesLayer.querySelector(`[data-id="${gesture.id}"]`), pieces[index]);
});

function finishGesture() {
  if (!gesture) return;
  piecesLayer.querySelector(".dragging")?.classList.remove("dragging");
  gesture = null;
}

pitch.addEventListener("pointerup", finishGesture);
pitch.addEventListener("pointercancel", finishGesture);

piecesLayer.addEventListener("keydown", (event) => {
  const directions = {
    ArrowLeft: [-1, 0], ArrowRight: [1, 0],
    ArrowUp: [0, -1], ArrowDown: [0, 1],
  };
  const direction = directions[event.key];
  if (!direction) return;
  const element = event.target.closest(".piece");
  if (!element) return;
  event.preventDefault();
  const index = pieces.findIndex((piece) => piece.id === element.dataset.id);
  const piece = pieces[index];
  const step = event.shiftKey ? 5 : 1;
  pieces[index] = positionPiece(piece, {
    x: (piece.x + direction[0] * step) * COURT_WIDTH / 100,
    y: (piece.y + direction[1] * step) * COURT_HEIGHT / 100,
  });
  setPiecePosition(element, pieces[index]);
});

document.querySelector("#resetButton").addEventListener("click", () => {
  pieces = initialPieces();
  renderPieces();
});

renderPieces();
