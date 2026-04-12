const { validateClaim } = require("../frontend/lib/contract.js");

async function runTests() {
  const testCases = [
    {
      name: "Normal Player",
      input: {
        miningRate: 80,
        timeElapsed: 20,
        userPattern: {
          repetition: 0.2,
          variance: 0.5,
          sessionTime: 30
        }
      }
    },
    {
      name: "Bot-like Player",
      input: {
        miningRate: 150,
        timeElapsed: 2,
        userPattern: {
          repetition: 0.95,
          variance: 0.05,
          sessionTime: 5
        }
      }
    },
    {
      name: "Suspicious Player",
      input: {
        miningRate: 90,
        timeElapsed: 8,
        userPattern: {
          repetition: 0.7,
          variance: 0.2,
          sessionTime: 8
        }
      }
    }
  ];

  for (const test of testCases) {
    const result = validateClaim(test.input);
    console.log(`\n=== ${test.name} ===`);
    console.log(result);
  }
}

runTests();