"use client";

import { useAppKit } from "@reown/appkit/react";
import { useAppKitAccount } from "@reown/appkit/react";
import { useAppKitProvider } from "@reown/appkit/react";
import { useAppKitNetwork } from "@reown/appkit/react";
import { useCallback, useMemo, useState, useEffect } from "react";
import { ethers } from "ethers";

// Add the TaskLock contract ABI
const TASKLOCK_ABI = [
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "taskIndex",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "TaskCompleted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "taskIndex",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "description",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "TaskCreated",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_taskIndex",
        "type": "uint256"
      }
    ],
    "name": "completeTask",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "description",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "_tokenAddress",
        "type": "address"
      }
    ],
    "name": "createTask",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "viewMyTasks",
    "outputs": [
      {
        "components": [
          {
            "internalType": "string",
            "name": "description",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "token",
            "type": "address"
          },
          {
            "internalType": "bool",
            "name": "completed",
            "type": "bool"
          }
        ],
        "internalType": "struct TaskManager.Task[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "stateMutability": "payable",
    "type": "receive"
  }
];

// Add your deployed contract address
const TASKLOCK_SEPOLIA_ADDRESS = "0x71eedC607D2d4534D5122e448701020Ea34c32D7";
const TASKLOCK_OPTIMISM_ADDRESS = "0xCA33856D8F8795ba559F212756DC56E44983cAD1";


export default function Home() {
  const { open } = useAppKit();
  const { address, isConnected } = useAppKitAccount();
  const { walletProvider } = useAppKitProvider("eip155");
  const { chainId } = useAppKitNetwork();

  const [tasks, setTasks] = useState([]);
  const [newTaskAmount, setNewTaskAmount] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const CONTRACT_ADDRESSES = {
    11155111: TASKLOCK_SEPOLIA_ADDRESS, // Sepolia Testnet
    10: TASKLOCK_OPTIMISM_ADDRESS, // Optimism Mainnet
  };

  const getContract = useCallback(() => {
    const contractAddress = CONTRACT_ADDRESSES[chainId];
    if (!contractAddress) {
      alert("Unsupported network. Please switch to Sepolia or Optimism.");
      return null;
    }
    const provider = new ethers.providers.Web3Provider(walletProvider, chainId);
    const signer = provider.getSigner(address);
    return new ethers.Contract(contractAddress, TASKLOCK_ABI, signer);
  }, [walletProvider, address, chainId]);

  const fetchTasks = useCallback(async () => {
    if (!isConnected || !address) return;
    try {
      const contract = getContract();
      if (!contract) return;
      const userTasks = await contract.viewMyTasks();
      setTasks(userTasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  }, [isConnected, address, getContract]);

  const createNewTask = async () => {
    if (!newTaskAmount || !newTaskDescription || !isConnected) return;
    setLoading(true);
    try {
      const contract = getContract();
      if (!contract) return;
      const amount = ethers.utils.parseEther(newTaskAmount);
      const tx = await contract.createTask(newTaskDescription, amount, "0x0000000000000000000000000000000000000000", {
        value: amount,
      });
      await tx.wait();
      await fetchTasks();
      setNewTaskAmount("");
      setNewTaskDescription("");
    } catch (error) {
      console.error("Error creating task:", error);
      alert("Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  const completeTask = async (taskId) => {
    setLoading(true);
    try {
      const contract = getContract();
      if (!contract) return;
      const tx = await contract.completeTask(taskId);
      await tx.wait();
      await fetchTasks();
    } catch (error) {
      console.error("Error completing task:", error);
      alert("Failed to complete task");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isConnected) {
      fetchTasks();
    }
  }, [isConnected, fetchTasks]);

  const connectWallet = () => {
    open();
  };

  const activeTasks = tasks.filter((task) => !task.completed);
  const completedTasks = tasks.filter((task) => task.completed);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-12 bg-gradient-to-b from-blue-500 to-purple-600">
      <div className="text-center mb-8">
        <h1 className="text-5xl font-bold mb-4 text-white">Money Locker</h1>
        <p className="text-white text-lg mb-8">
          Lock your money up until you complete a task. Currently live on the Optimism network.
        </p>

        {!isConnected ? (
          <div>
            <p className="text-white mb-4">Connect your wallet to manage tasks:</p>
            <button
              onClick={connectWallet}
              className="bg-white text-blue-500 font-bold py-2 px-4 rounded-full hover:bg-blue-100 transition duration-300"
            >
              Connect Wallet
            </button>
          </div>
        ) : (
          <div>
            <w3m-account-button className="flex flex-col items-center justify-center text-white mb-2"></w3m-account-button>

            {/* Tasks Section */}
            <div className="mb-8">
              
              {/* Active Tasks */}
              <div className="mb-6">
                {/* <h3 className="inline-block text-2xl font-bold text-blue-200 mb-2">Active Tasks</h3> */}
                <div className="space-y-4">
                  {activeTasks.length > 0 ? (
                    activeTasks.map((task, index) => (
                      <div key={index} className="inline-block p-4 rounded-lg shadow text-white">
                        <p>{task.description}</p>
                        <p className="text-green-500 font-bold">Locked: {ethers.utils.formatEther(task.amount)} <img src="https://icons.iconarchive.com/icons/cjdowner/cryptocurrency-flat/1024/Ethereum-ETH-icon.png" className="inline ml" alt="ETH" width="18" height="18"/></p>
                        <p className="text-red-800 font-bold">Active</p>
                        <button
                          onClick={() => completeTask(index)}
                          disabled={loading}
                          className="bg-blue-500 text-white font-bold py-1 px-3 rounded-full hover:bg-green-500 transition duration-300 mt-2"
                        >
                          Complete Task
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-white">No active tasks found.</p>
                  )}
                </div>
              </div>

              {/* Completed Tasks */}
              <div>
                {/* <h3 className="inline-block text-2xl font-bold text-green-300 mb-2">Completed Tasks</h3> */}
                <div className="space-y-4">
                  {completedTasks.length > 0 ? (
                    completedTasks.map((task, index) => (
                      <div key={index} className="inline-block p-4 rounded-lg shadow text-white">
                        <p>{task.description}</p>
                        <p className="text-green-500 font-bold">Amount: {ethers.utils.formatEther(task.amount)} <img src="https://icons.iconarchive.com/icons/cjdowner/cryptocurrency-flat/1024/Ethereum-ETH-icon.png" className="inline ml" alt="ETH" width="18" height="18"/></p>
                        <p className="text-green-500 font-bold">Completed</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-white">No completed tasks found.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Create New Task Section */}
            <div className="mt-8">
              <h2 className="text-2xl font-bold text-white mb-4">Create a New Task</h2>
              <input
                type="text"
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
                placeholder="Task Description"
                className="mr-2 p-2 rounded"
              />
              <input
                type="number"
                step="0.01"
                value={newTaskAmount}
                onChange={(e) => setNewTaskAmount(e.target.value)}
                placeholder="Amount of ETH"
                className="mr-2 p-2 rounded"
              />
              <button
                onClick={createNewTask}
                disabled={loading}
                className="bg-green-500 text-white font-bold py-2 px-4 rounded-full hover:bg-green-600 transition duration-300"
              >
                Create New Task
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}