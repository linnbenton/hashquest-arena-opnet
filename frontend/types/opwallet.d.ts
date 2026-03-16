export {}

declare global {
  interface Window {
    opnet?: {
      address?: string
      connect?: () => Promise<void>
      disconnect?: () => void
      isConnected?: boolean
      request?: (args: { method: string; params?: any }) => Promise<any>
    }
  }
}
