require("dotenv").config();

/* 🔥 FIX IMPORT */
const OPNet = require("opnet").default;

const PILL_CONTRACT =
  "opt1sqp5gx9k0nrqph3sy3aeyzt673dz7ygtqxcfdqfle";

const BYTECODE = "0x...";

const INITIAL_FUND = BigInt("1000000000000000000000");

async function main() {
  console.log("🚀 INIT OPNET...");

  const opnet = new OPNet({
    privateKey: process.env.PRIVATE_KEY,
    network: "testnet",
  });

  await opnet.init();

  console.log("👛 WALLET:", await opnet.getAddress());

  /* DEPLOY */
  const deployTx = await opnet.signDeployment({
    bytecode: BYTECODE,
    constructorArgs: [PILL_CONTRACT],
  });

  console.log("🧾 DEPLOY TX:", deployTx);

  /* FUND */
  const fundTx = await opnet.signInteraction({
    interaction: {
      contract: PILL_CONTRACT,
      method: "transfer",
      params: [
        CLAIM_CONTRACT,
        INITIAL_FUND.toString(),
      ],
      message: "0x",
    },
  });

  console.log("💸 FUND TX:", fundTx);

  console.log("🎉 DONE!");
}

main().catch(console.error);