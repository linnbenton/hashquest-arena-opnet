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

  // 🔒 anti spam
  actionCount: i32 = 0;

  // 🎰 LOTTERY
  totalTickets: i32 = 0;
  lastWinner: i32 = -1;

  onDeploy(): void {
    this.totalPlayers = 0;
    this.totalMinted = 0;
    this.actionCount = 0;

    this.totalTickets = 0;
    this.lastWinner = -1;
  }

  /* ⛏️ MINING */
  mintReward(): void {
    if (this.actionCount > 1000) return;

    this.actionCount += 1;
    this.totalMinted += 1;
  }

  /* 🎟️ ADD TICKET */
  addTicket(amount: i32): void {
    if (amount <= 0) return;

    this.totalTickets += amount;
  }

  /* 🎰 DRAW WINNER */
  drawWinner(): void {
    if (this.totalTickets <= 0) return;

    // pseudo random ringan (AMAN untuk OP_NET)
    const seed = this.totalMinted + this.totalTickets + this.actionCount;

    this.lastWinner = seed % this.totalTickets;

    // reset setelah draw
    this.totalTickets = 0;
  }
}

let arena: HashQuestArena = new HashQuestArena();

/* DEPLOY */
export function onDeploy(_ptr: i32): i32 {
  arena.onDeploy();
  return 0;
}

/* EXECUTE */
export function execute(_ptr: i32): i32 {
  arena.mintReward();
  return 0;
}

/* RECEIVE */
export function onReceive(): i32 {
  arena.mintReward();
  return 0;
}

/* 🎟️ ENTRY LOTTERY */
export function addTicket(amount: i32): i32 {
  arena.addTicket(amount);
  return 0;
}

/* 🎰 DRAW */
export function drawWinner(): i32 {
  arena.drawWinner();
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