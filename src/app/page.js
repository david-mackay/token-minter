"use client";

import { useAppKit } from "@reown/appkit/react";
import { useAppKitAccount } from "@reown/appkit/react";
import { useAppKitProvider } from "@reown/appkit/react";
import { useAppKitNetwork } from "@reown/appkit/react";
import { useCallback, useMemo } from "react";
import { ethers } from "ethers";

export default function Home() {
  const { open } = useAppKit();
  const { address, isConnected, caipAddress, status } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider('eip155');
  const { caipNetwork, caipNetworkId, chainId, switchNetwork, addNetwork } =
    useAppKitNetwork();

  // Network-specific configuration
  const configByNetwork = useMemo(
    () => ({
      "eip155:1": {
        recipient: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
        amount: ethers.utils.parseEther("0.05"),
        currency: "ETH",
      },
      "eip155:42161": {
        recipient: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
        amount: ethers.utils.parseEther("0.05"),
        currency: "ETH",
      },
      "solana:mainnet": {
        recipient: "3Kc1BzGvqxMYG8J2fYhBFRGR7kWqnLxZqeYv4FrM85L4",
        amount: "500000000",
        currency: "SOL",
      },
      "solana:testnet": {
        recipient: "3Kc1BzGvqxMYG8J2fYhBFRGR7kWqnLxZqeYv4FrM85L4",
        amount: "500000000",
        currency: "SOL",
      },
      "solana:devnet": {
        recipient: "3Kc1BzGvqxMYG8J2fYhBFRGR7kWqnLxZqeYv4FrM85L4",
        amount: "500000000",
        currency: "SOL",
      },
    }),
    []
  );

  const handlePayment = useCallback(async () => {
    if (!caipNetworkId || !walletProvider) {
      alert("Please connect your wallet first");
      return;
    }

    const config = configByNetwork[caipNetworkId];
    if (!config) {
      alert("Unsupported network");
      return;
    }
    console.log(caipNetworkId)
    try {
      let tx;
      if (caipNetworkId.startsWith("solana:")) {
        // For Solana transactions
        const provider = walletProvider;
        const transaction = new solana.Transaction().add(
          solana.SystemProgram.transfer({
            fromPubkey: address,
            toPubkey: config.recipient,
            lamports: config.amount,
          })
        );
        tx = await provider.sendTransaction(transaction);
      } else {
        // For Ethereum transactions
        const provider = new ethers.providers.Web3Provider(
          walletProvider,
          chainId
        );
        const signer = provider.getSigner(address);
        tx = await signer.sendTransaction({
          to: config.recipient,
          value: config.amount,
        });
      }

      await tx.wait();
      console.log("Time to mint");
      const response = await fetch('/api/mint-nft', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address,
          network: caipNetworkId.startsWith('solana:') ? 'solana' : 'ethereum',
        }),
      });
  
      if (!response.ok) {
        throw new Error('Minting failed');
      }
  
      alert("Payment successful! NFT minting initiated.");
    } catch (error) {
      console.error("Payment or minting failed:", error);
      alert("Payment or minting failed. Please try again.");
    }
  }, [caipNetworkId, walletProvider, address, chainId, configByNetwork]);

  const connectWallet = () => {
    open();
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-b from-blue-500 to-purple-600">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-8 text-white">
          Multi-Chain NFT Minter
        </h1>
        {!isConnected ? (
          <div>
            <p className="text-white mb-4">
              Connect your Ethereum or Solana wallet:
            </p>
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
            {caipNetworkId && configByNetwork[caipNetworkId] && (
              <p className="text-white mb-4">
                Mint price:{" "}
                {ethers.utils.formatUnits(
                  configByNetwork[caipNetworkId].amount
                )}{" "}
                {configByNetwork[caipNetworkId].currency}
              </p>
            )}
            <button
              onClick={handlePayment}
              className="bg-green-500 text-white font-bold py-2 px-4 rounded-full hover:bg-green-600 transition duration-300 mb-4"
            >
              Mint NFT
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
