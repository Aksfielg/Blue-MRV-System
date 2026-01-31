import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wallet, ExternalLink, Copy, Check } from 'lucide-react';
import { web3Service } from '../lib/web3';
import { useAuth } from './Auth/AuthProvider';
import toast from 'react-hot-toast';

interface WalletConnectProps {
  onWalletConnected?: (address: string) => void;
}

const WalletConnect: React.FC<WalletConnectProps> = ({ onWalletConnected }) => {
  const { updateProfile, profile } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [creditBalance, setCreditBalance] = useState<string>('0');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    checkConnection();
  }, []);

  useEffect(() => {
    if (walletAddress) {
      loadCreditBalance();
    }
  }, [walletAddress]);

  const checkConnection = async () => {
    if (window.ethereum) {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length > 0) {
        setWalletAddress(accounts[0]);
        setIsConnected(true);
        onWalletConnected?.(accounts[0]);
      }
    }
  };

  const handleConnectWallet = async () => {
    setIsLoading(true);
    try {
      const address = await web3Service.connectWallet();
      
      setWalletAddress(address);
      setIsConnected(true);
      onWalletConnected?.(address);
      
      // Update user profile with wallet address
      if (profile && !profile.wallet_address) {
        await updateProfile({ wallet_address: address });
      }
      
      toast.success('Demo wallet connected successfully!');
    } catch (error: any) {
      console.error('Failed to connect wallet:', error);
      toast.error('Failed to connect wallet');
    } finally {
      setIsLoading(false);
    }
  };

  const loadCreditBalance = async () => {
    try {
      const balance = await web3Service.getCarbonBalance(walletAddress);
      setCreditBalance(balance);
    } catch (error) {
      console.error('Failed to load credit balance:', error);
    }
  };

  const copyAddress = async () => {
    await navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    toast.success('Address copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (!isConnected) {
    return (
      <motion.button
        onClick={handleConnectWallet}
        disabled={isLoading}
        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-600 to-blue-600 text-white rounded-full font-semibold hover:from-teal-700 hover:to-blue-700 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Wallet size={20} />
        {isLoading ? 'Connecting...' : 'Connect MetaMask'}
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-xl p-4 shadow-lg border border-gray-200"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-gray-700">Connected</span>
        </div>
        <button
          onClick={copyAddress}
          className="flex items-center gap-1 text-gray-500 hover:text-gray-700 transition-colors"
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
        </button>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Address:</span>
          <span className="font-mono text-sm">{formatAddress(walletAddress)}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">BCC Balance:</span>
          <span className="font-bold text-teal-600">{parseFloat(creditBalance).toFixed(2)} BCC</span>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-200">
        <p className="text-xs text-gray-500">Polygon Mumbai Testnet</p>
      </div>
    </motion.div>
  );
};

export default WalletConnect;