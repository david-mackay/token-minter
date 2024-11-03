'use client'

import { useAppKit } from '@reown/appkit/react'
import { useAppKitAccount } from '@reown/appkit/react'
 
// This component handles the connection to the user's wallet and displays the mint NFT button.
export default function Home() {
  const { open } = useAppKit()
  const { isConnected } = useAppKitAccount()

  
  // Opens the wallet connection modal.
  const connectWallet = () => {
    open()
  }

  // Mints an NFT. This function is currently a placeholder and does not implement the actual minting logic.
  const mintNFT = () => {
    if (!isConnected) {
      alert('Please connect a wallet first')
      return
    }
    

    alert('Minting functionality not implemented yet')
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-b from-blue-500 to-purple-600">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-8 text-white">Multi-Chain NFT Minter</h1>
        
        {!isConnected ? (
          <div>
            <p className="text-white mb-4">Connect your Ethereum or Solana wallet:</p>
            <button
              onClick={connectWallet}
              className="bg-white text-blue-500 font-bold py-2 px-4 rounded-full hover:bg-blue-100 transition duration-300 mr-4 mb-4"
            >
              Connect Wallet
            </button>
          </div>
        ) : (
          <div>
            <w3m-account-button className="text-white mb-2"></w3m-account-button>
            <button 
              onClick={mintNFT} 
              className="bg-green-500 text-white font-bold py-2 px-4 rounded-full hover:bg-green-600 transition duration-300 mb-4"
            >
              Mint NFT
            </button>
          </div>
        )}
      </div>
    </main>
  )
}