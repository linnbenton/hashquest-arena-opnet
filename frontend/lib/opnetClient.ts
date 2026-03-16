// src/lib/opnetClient.ts

export async function callContract(method: string, args: any[] = []) {

  const opnet = (window as any).opnet

  if (!opnet || !opnet.request) {
    throw new Error("OPNet wallet not connected")
  }

  return await opnet.request({
    method: method,
    params: args
  })

}
