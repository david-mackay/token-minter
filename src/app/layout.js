import './globals.css'
import { AppKit } from '../context/appkit'

export const metadata = {
  title: 'Ethereum Lockbox',
  description: 'Lock your Ethereum away until you complete your chores'
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