import { describe, expect, it } from "vitest";
import { initialPieces, pointOnCourt, positionPiece } from "../src/js/board.js";

describe("board positions", () => {
  it("starts with five players per side and a ball, and reset copies do not share state", () => {
    const pieces = initialPieces();
    expect(pieces.filter((piece) => piece.team === "home")).toHaveLength(5);
    expect(pieces.filter((piece) => piece.team === "away")).toHaveLength(5);
    expect(pieces.filter((piece) => piece.id === "ball")).toHaveLength(1);
    const anchor = pieces.find((piece) => piece.id === "home-2");
    const ball = pieces.find((piece) => piece.id === "ball");
    expect(anchor).toMatchObject({ x: 51, y: 62 });
    expect(ball).toMatchObject({ x: 53, y: 59.8 });
    expect(Math.hypot(anchor.x - ball.x, anchor.y - ball.y)).toBeLessThan(3);
    expect(pieces.find((piece) => piece.id === "home-5").y).toBeLessThan(35);
    expect(pieces.find((piece) => piece.id === "home-3")).toMatchObject({ x: 10, y: 47 });
    expect(pieces.find((piece) => piece.id === "home-4")).toMatchObject({ x: 90, y: 51 });
    const defenders = [2, 3, 4, 5].map((number) => pieces.find((piece) => piece.id === `away-${number}`));
    expect(Math.abs(defenders[0].x - defenders[3].x)).toBeLessThan(5);
    expect(defenders[1].x).toBeLessThan(defenders[0].x);
    expect(defenders[2].x).toBeGreaterThan(defenders[0].x);
    expect(defenders[0].y).toBeLessThan(defenders[1].y);
    expect(Math.abs(defenders[1].y - defenders[2].y)).toBeLessThan(3);
    expect(defenders[2].y).toBeLessThan(defenders[3].y);
    expect(defenders[3].y - defenders[0].y).toBeLessThanOrEqual(25);
    pieces[0].x = 90;
    expect(initialPieces()[0].x).toBe(50);
  });

  it("maps screen coordinates into court coordinates regardless of display size", () => {
    const rect = { left: 20, top: 50, width: 320, height: 800 };
    expect(pointOnCourt(180, 450, rect)).toEqual({ x: 320, y: 640 });
    expect(pointOnCourt(-20, 900, rect)).toEqual({ x: 0, y: 1280 });
  });

  it("keeps dragged pieces inside the playable court", () => {
    const piece = initialPieces()[0];
    expect(positionPiece(piece, { x: -100, y: 1500 }).y).toBe(98);
    expect(positionPiece(piece, { x: -100, y: 1500 }).x).toBe(4);
    expect(positionPiece(piece, { x: 900, y: -100 })).toMatchObject({ x: 96, y: 2 });
    expect(piece).toMatchObject({ x: 50, y: 91 });
  });
});
