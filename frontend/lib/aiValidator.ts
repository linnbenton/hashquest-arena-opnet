import { validateClaim } from "./genlayer/contract.js";

export async function runAIValidation(input: any) {
  const result = validateClaim(input);

  return {
    decision: result.status,
    confidence:
      result.status === "ACCEPT"
        ? 0.9
        : result.status === "SUSPICIOUS"
        ? 0.6
        : 0.2,
    reason: result.reason,
  };
}