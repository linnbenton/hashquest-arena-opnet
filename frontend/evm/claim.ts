import { connectMetaMaskGenLayer } from "./connect";
import { getContract } from "./contract";

export async function claimEVMReward() {
  const { signer, address } = await connectMetaMaskGenLayer();

  const contract = getContract(signer);

  console.log("🦊 CLAIM FROM:", address);

  const tx = await contract.claimReward();

  const receipt = await tx.wait();

if (receipt.status === 1) {

} else {
  
}

  return tx.hash;
}