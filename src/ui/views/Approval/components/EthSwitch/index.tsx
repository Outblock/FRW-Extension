const networkColor = (network: string) => {
  switch (network) {
    case 'mainnet':
      return '#41CC5D';
    case 'testnet':
      return '#FF8A00';
    case 'crescendo':
      return '#CCAF21';
    case 'emulator':
      return '#4A90E2';
  }
};
// ... existing code ...
