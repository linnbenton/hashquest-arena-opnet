// OP_NET SAFE (NO PARAMETER)

let balance: i32 = 0;

// ❌ HAPUS PARAMETER
export function mint(): void {
  balance += 1; // dummy increment
}

export function balanceOf(): i32 {
  return balance;
}

// ❌ HAPUS PARAMETER
export function claim(): bool {
  mint();
  return true;
}

// WAJIB
export function start(): void {}

// WAJIB
export function onDeploy(): void {}