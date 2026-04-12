import { ethers } from "ethers";
import ABI from "../abi/Reward.json";

const CONTRACT_ADDRESS = "0xB7af8585f93409624F47c51f5c2bEc57Bf10F15e";

export function getContract(signer: any) {
  return new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
}