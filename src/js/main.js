import { COURT_HEIGHT, COURT_WIDTH, initialPieces, pointOnCourt, positionPiece } from "./board.js";

const pitch = document.querySelector("#pitch");
const piecesLayer = document.querySelector("#pieces");
const drawings = document.querySelector("#drawings");
const drawButton = document.querySelector("#drawButton");

let pieces = initialPieces();
let gesture = null;
let drawMode = false;
let drawingPath = null;
let drawingPointerId = null;

function renderPieces() {
  piecesLayer.replaceChildren(...pieces.map((piece) => {
    const element = document.createElement("button");
    element.type = "button";
    element.className = piece.id === "ball"
      ? "piece ball"
      : `piece player ${piece.team}${piece.number === 1 ? " goalkeeper" : ""}`;
    element.disabled = drawMode;
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
  if (event.button !== 0 || gesture || drawingPointerId !== null) return;
  if (drawMode) {
    if (event.target.closest("button")) return;
    const point = courtPoint(event);
    drawingPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    drawingPath.setAttribute("d", `M ${point.x} ${point.y}`);
    drawings.append(drawingPath);
    drawingPointerId = event.pointerId;
    pitch.setPointerCapture(event.pointerId);
    event.preventDefault();
    return;
  }
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
    pointerId: event.pointerId,
    id: piece.id,
    offsetX: (piece.x / 100) * COURT_WIDTH - point.x,
    offsetY: (piece.y / 100) * COURT_HEIGHT - point.y,
  };
  element.classList.add("dragging");
  pitch.setPointerCapture(event.pointerId);
  event.preventDefault();
});

pitch.addEventListener("pointermove", (event) => {
  if (drawingPointerId === event.pointerId && drawingPath) {
    const point = courtPoint(event);
    drawingPath.setAttribute("d", `${drawingPath.getAttribute("d")} L ${point.x} ${point.y}`);
    return;
  }
  if (!gesture || gesture.pointerId !== event.pointerId) return;
  const point = courtPoint(event);
  const index = pieces.findIndex((piece) => piece.id === gesture.id);
  pieces[index] = positionPiece(pieces[index], {
    x: point.x + gesture.offsetX,
    y: point.y + gesture.offsetY,
  });
  setPiecePosition(piecesLayer.querySelector(`[data-id="${gesture.id}"]`), pieces[index]);
});

function finishGesture(event) {
  if (drawingPointerId === event.pointerId) {
    drawingPointerId = null;
    drawingPath = null;
    return;
  }
  if (!gesture || gesture.pointerId !== event.pointerId) return;
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
  if (!direction || drawMode) return;
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

drawButton.addEventListener("click", () => {
  drawMode = !drawMode;
  pitch.classList.toggle("drawing-mode", drawMode);
  drawButton.setAttribute("aria-pressed", String(drawMode));
  for (const piece of piecesLayer.children) {
    piece.disabled = drawMode;
  }
});

document.querySelector("#resetButton").addEventListener("click", () => {
  pieces = initialPieces();
  renderPieces();
  drawings.replaceChildren();
});

renderPieces();
