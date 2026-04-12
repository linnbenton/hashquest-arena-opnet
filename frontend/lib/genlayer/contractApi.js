const CONTRACT_ID = "0xB7af8585f93409624F47c51f5c2bEc57Bf10F15e";
const BASE_URL = `https://studio.genlayer.com/api/contract/${CONTRACT_ID}/call`;

async function validateGameplay(payload, player) {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      method: "play",
      args: [JSON.stringify(payload), player]
    })
  });

  return res.json();
}

module.exports = { validateGameplay };