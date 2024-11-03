'use client'

import { createAppKit } from '@reown/appkit/react'
import { Ethers5Adapter } from '@reown/appkit-adapter-ethers5'
import { SolanaAdapter } from '@reown/appkit-adapter-solana'
import { mainnet, arbitrum, solana, solanaTestnet, solanaDevnet } from '@reown/appkit/networks'
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets'

// 1. Get projectId at https://cloud.reown.com
const projectId = 'c2d62c326c8f0490623d8990db1984f2'

// 2. Create a metadata object
const metadata = {
  name: 'Multi-Chain NFT Minter',
  description: 'A dApp for minting NFTs on Ethereum and Solana',
  url: 'https://your-website-url.com', // Replace with your actual URL
  icons: ['https://your-icon-url.com/icon.png'] // Replace with your actual icon URL
}

// 3. Set up Solana Adapter
const solanaAdapter = new SolanaAdapter({
  wallets: [new PhantomWalletAdapter(), new SolflareWalletAdapter()]
})

// 4. Create the AppKit instance
createAppKit({
  adapters: [
    new Ethers5Adapter(),
    solanaAdapter
  ],
  metadata: metadata,
  networks: [mainnet, arbitrum, solana, solanaTestnet, solanaDevnet],
  projectId,
  features: {
    analytics: true // Optional - defaults to your Cloud configuration
  }
})

export function AppKit({ children }) {
  return children
}