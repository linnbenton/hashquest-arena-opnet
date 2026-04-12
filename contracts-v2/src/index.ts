// @ts-nocheck

export function abort(
  _message: i32,
  _fileName: i32,
  _lineNumber: i32,
  _columnNumber: i32
): void {}

export function start(): i32 {
  return 0;
}

import { OP_NET } from "../node_modules/@btc-vision/btc-runtime/runtime/index";

/* 🎮 CONTRACT */
class HashQuestArena extends OP_NET {
  totalPlayers: i32 = 0;
  totalMinted: i32 = 0;
  actionCount: i32 = 0;

  totalTickets: i32 = 0;
  lastWinner: i32 = -1;

  onDeploy(): void {
    this.totalPlayers = 0;
    this.totalMinted = 0;
    this.actionCount = 0;
    this.totalTickets = 0;
    this.lastWinner = -1;
  }

  mintReward(): void {
    if (this.actionCount > 1000) return;
    this.actionCount += 1;
    this.totalMinted += 1;
  }

  addTicket(amount: i32): void {
    if (amount <= 0) return;
    this.totalTickets += amount;
  }

  drawWinner(): void {
    if (this.totalTickets <= 0) return;

    const seed = this.totalMinted + this.totalTickets + this.actionCount;
    this.lastWinner = seed % this.totalTickets;

    this.totalTickets = 0;
  }
}

let arena: HashQuestArena = new HashQuestArena();

/* DEPLOY */
export function onDeploy(_ptr: i32): i32 {
  arena.onDeploy();
  return 0;
}

/* 🔥 METHOD PARSER */
function parseMethod(input: string): void {
  if (input == "claim") {
    arena.mintReward();
    return;
  }

  if (input.startsWith("ticket:")) {
    const amount = I32.parseInt(input.split(":")[1]);
    arena.addTicket(amount);
    return;
  }

  if (input == "draw") {
    arena.drawWinner();
    return;
  }

  // fallback
  arena.mintReward();
}

/* 🔥 EXECUTE (UPGRADE) */
export function execute(ptr: i32): i32 {
  if (ptr == 0) {
    arena.mintReward();
    return 0;
  }

  const input = String.UTF8.decodeUnsafe(ptr, 100); // max 100 bytes
  parseMethod(input);

  return 0;
}

/* RECEIVE */
export function onReceive(): i32 {
  arena.mintReward();
  return 0;
}

/* READ */
export function getMinted(): i32 {
  return arena.totalMinted;
}

export function getTickets(): i32 {
  return arena.totalTickets;
}

export function getWinner(): i32 {
  return arena.lastWinner;
}