// Temporary mock wallet hook for initial deployment
export function useWallet() {
  return {
    connected: false,
    publicKey: null,
    connecting: false,
    connect: () => {},
    disconnect: () => {},
  };
}