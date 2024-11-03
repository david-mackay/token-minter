import './globals.css'
import { AppKit } from '../context/appkit'

export const metadata = {
  title: 'Multi-Chain NFT Minter',
  description: 'Mint NFTs on Ethereum and Solana'
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AppKit>{children}</AppKit>
      </body>
    </html>
  )
}