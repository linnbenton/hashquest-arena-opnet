export async function GET() {
  return Response.json([
    {
      address: "opt1abc123...",
      reward: 3.5
    },
    {
      address: "opt1xyz789...",
      reward: 7.2
    }
  ]);
}