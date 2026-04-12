async function testSpam() {
  for (let i = 0; i < 20; i++) {
    const res = await fetch("http://localhost:3000/api/claim", {
      method: "POST",
      body: JSON.stringify({ wallet: "bot_test_1" }),
      headers: { "Content-Type": "application/json" }
    });

    const data = await res.json();

    console.log("REQ", i, "→", data);
  }
}

testSpam();