# 🌊 BlueMRV - Complete Blockchain-Powered Blue Carbon Platform

A comprehensive platform for monitoring, reporting, and verifying blue carbon restoration projects with blockchain integration, tokenized carbon credits, and marketplace functionality.

## 🏗️ Architecture Overview

### Frontend
- **React + TypeScript** - Type-safe web application
- **Tailwind CSS** - Modern UI styling
- **Framer Motion** - Smooth animations
- **Web3 Integration** - Wallet connectivity and blockchain interactions

### Backend Stack
- **Node.js/Express API** - Off-chain logic and middleware
- **Supabase** - Database, authentication, and serverless functions
- **IPFS** - Decentralized storage for plot evidence
- **Polygon Testnet** - Blockchain for smart contracts

### Smart Contracts (Solidity)
- **PlotRegistry** - Stores plantation records immutably
- **CarbonToken (ERC-1155)** - 1 token = 1 carbon credit
- **Marketplace** - Burns credits & mints voucher NFTs
- **VoucherNFT** - QR-coded vouchers for redemption

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Git
- MetaMask or compatible Web3 wallet
- Supabase account
- Polygon testnet MATIC tokens

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd bluemrv-platform
npm install
```

### 2. Environment Setup

Create `.env` file:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Blockchain Configuration
VITE_POLYGON_RPC_URL=https://rpc-mumbai.maticvigil.com
VITE_CHAIN_ID=80001
VITE_PLOT_REGISTRY_ADDRESS=0x...
VITE_CARBON_TOKEN_ADDRESS=0x...
VITE_MARKETPLACE_ADDRESS=0x...
VITE_VOUCHER_NFT_ADDRESS=0x...

# IPFS Configuration
VITE_IPFS_GATEWAY=https://ipfs.io/ipfs/
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_KEY=your_pinata_secret_key

# API Configuration
VITE_API_BASE_URL=http://localhost:3001
JWT_SECRET=your_jwt_secret
```

## 📊 Supabase Setup

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Note your Project URL and API keys

### Step 2: Database Migration

The database schema is already created in the migration files. Run:

```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
```

### Step 3: Storage Setup

1. Go to Supabase Dashboard → Storage
2. Create bucket named `plot-evidence`
3. Set bucket to public
4. Configure RLS policies (already in migrations)

### Step 4: Authentication Setup

1. Go to Authentication → Settings
2. Enable Email authentication
3. Disable email confirmation for demo
4. Add your domain to allowed origins

## 🔗 Blockchain Deployment

### Step 1: Smart Contract Development

Create `contracts/` directory with Solidity contracts:

```solidity
// contracts/PlotRegistry.sol
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";

contract PlotRegistry is Ownable {
    struct Plot {
        uint256 id;
        address owner;
        string ipfsHash;
        uint256 areaSqm;
        string ecosystemType;
        bool isVerified;
        uint256 survivalRate;
        uint256 estimatedCO2;
    }
    
    mapping(uint256 => Plot) public plots;
    uint256 public plotCounter;
    
    event PlotRegistered(uint256 indexed plotId, address indexed owner);
    event PlotVerified(uint256 indexed plotId, uint256 survivalRate, uint256 estimatedCO2);
    
    function registerPlot(
        string memory ipfsHash,
        uint256 areaSqm,
        string memory ecosystemType
    ) external returns (uint256) {
        plotCounter++;
        plots[plotCounter] = Plot({
            id: plotCounter,
            owner: msg.sender,
            ipfsHash: ipfsHash,
            areaSqm: areaSqm,
            ecosystemType: ecosystemType,
            isVerified: false,
            survivalRate: 0,
            estimatedCO2: 0
        });
        
        emit PlotRegistered(plotCounter, msg.sender);
        return plotCounter;
    }
    
    function verifyPlot(
        uint256 plotId,
        uint256 survivalRate,
        uint256 estimatedCO2
    ) external onlyOwner {
        require(plots[plotId].id != 0, "Plot does not exist");
        
        plots[plotId].isVerified = true;
        plots[plotId].survivalRate = survivalRate;
        plots[plotId].estimatedCO2 = estimatedCO2;
        
        emit PlotVerified(plotId, survivalRate, estimatedCO2);
    }
}
```

```solidity
// contracts/CarbonToken.sol
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CarbonToken is ERC1155, Ownable {
    uint256 public constant CARBON_CREDIT = 1;
    
    mapping(address => uint256) public creditBalances;
    
    event CreditsMinted(address indexed to, uint256 amount, uint256 plotId);
    event CreditsBurned(address indexed from, uint256 amount);
    
    constructor() ERC1155("https://api.bluemrv.org/metadata/{id}.json") {}
    
    function mintCredits(
        address to,
        uint256 amount,
        uint256 plotId
    ) external onlyOwner {
        _mint(to, CARBON_CREDIT, amount, "");
        creditBalances[to] += amount;
        
        emit CreditsMinted(to, amount, plotId);
    }
    
    function burnCredits(address from, uint256 amount) external onlyOwner {
        require(creditBalances[from] >= amount, "Insufficient credits");
        
        _burn(from, CARBON_CREDIT, amount);
        creditBalances[from] -= amount;
        
        emit CreditsBurned(from, amount);
    }
    
    function getCreditBalance(address account) external view returns (uint256) {
        return creditBalances[account];
    }
}
```

### Step 2: Deploy Contracts

Create deployment script:

```javascript
// scripts/deploy.js
const { ethers } = require("hardhat");

async function main() {
    // Deploy PlotRegistry
    const PlotRegistry = await ethers.getContractFactory("PlotRegistry");
    const plotRegistry = await PlotRegistry.deploy();
    await plotRegistry.deployed();
    console.log("PlotRegistry deployed to:", plotRegistry.address);
    
    // Deploy CarbonToken
    const CarbonToken = await ethers.getContractFactory("CarbonToken");
    const carbonToken = await CarbonToken.deploy();
    await carbonToken.deployed();
    console.log("CarbonToken deployed to:", carbonToken.address);
    
    // Deploy Marketplace
    const Marketplace = await ethers.getContractFactory("Marketplace");
    const marketplace = await Marketplace.deploy(carbonToken.address);
    await marketplace.deployed();
    console.log("Marketplace deployed to:", marketplace.address);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
```

Deploy to Polygon Mumbai:

```bash
npx hardhat run scripts/deploy.js --network mumbai
```

## 💳 Carbon Wallet Integration

### Step 1: Web3 Setup

```typescript
// src/lib/web3.ts
import { ethers } from 'ethers';

export class Web3Service {
    private provider: ethers.providers.Web3Provider | null = null;
    private signer: ethers.Signer | null = null;
    
    async connectWallet(): Promise<string> {
        if (!window.ethereum) {
            throw new Error('MetaMask not installed');
        }
        
        this.provider = new ethers.providers.Web3Provider(window.ethereum);
        await this.provider.send("eth_requestAccounts", []);
        this.signer = this.provider.getSigner();
        
        const address = await this.signer.getAddress();
        
        // Switch to Polygon Mumbai
        await this.switchToPolygon();
        
        return address;
    }
    
    private async switchToPolygon() {
        const chainId = '0x13881'; // Mumbai testnet
        
        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId }],
            });
        } catch (error: any) {
            if (error.code === 4902) {
                await this.addPolygonNetwork();
            }
        }
    }
    
    private async addPolygonNetwork() {
        await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
                chainId: '0x13881',
                chainName: 'Polygon Mumbai',
                nativeCurrency: {
                    name: 'MATIC',
                    symbol: 'MATIC',
                    decimals: 18
                },
                rpcUrls: ['https://rpc-mumbai.maticvigil.com'],
                blockExplorerUrls: ['https://mumbai.polygonscan.com/']
            }]
        });
    }
    
    async getCarbonBalance(address: string): Promise<string> {
        const contract = this.getCarbonTokenContract();
        const balance = await contract.getCreditBalance(address);
        return ethers.utils.formatUnits(balance, 0);
    }
    
    private getCarbonTokenContract() {
        const contractAddress = import.meta.env.VITE_CARBON_TOKEN_ADDRESS;
        const abi = [
            "function getCreditBalance(address account) view returns (uint256)",
            "function balanceOf(address account, uint256 id) view returns (uint256)"
        ];
        
        return new ethers.Contract(contractAddress, abi, this.signer);
    }
}

export const web3Service = new Web3Service();
```

### Step 2: Wallet Component

```typescript
// src/components/CarbonWallet.tsx
import React, { useState, useEffect } from 'react';
import { web3Service } from '../lib/web3';

export const CarbonWallet: React.FC = () => {
    const [isConnected, setIsConnected] = useState(false);
    const [address, setAddress] = useState('');
    const [balance, setBalance] = useState('0');
    
    const connectWallet = async () => {
        try {
            const walletAddress = await web3Service.connectWallet();
            setAddress(walletAddress);
            setIsConnected(true);
            
            const creditBalance = await web3Service.getCarbonBalance(walletAddress);
            setBalance(creditBalance);
        } catch (error) {
            console.error('Wallet connection failed:', error);
        }
    };
    
    return (
        <div className="wallet-container">
            {!isConnected ? (
                <button onClick={connectWallet} className="connect-btn">
                    Connect Wallet
                </button>
            ) : (
                <div className="wallet-info">
                    <p>Address: {address.slice(0, 6)}...{address.slice(-4)}</p>
                    <p>Carbon Credits: {balance} BCC</p>
                </div>
            )}
        </div>
    );
};
```

## 🔌 API Development

### Step 1: Express Server Setup

```javascript
// server/index.js
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const { ethers } = require('ethers');

const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Blockchain setup
const provider = new ethers.providers.JsonRpcProvider(process.env.POLYGON_RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// Upload Plantation API
app.post('/api/plots/upload', async (req, res) => {
    try {
        const { project_name, ecosystem_type, area_sqm, gps_coordinates, notes, user_id } = req.body;
        
        // 1. Upload to IPFS (implement IPFS upload)
        const ipfsHash = await uploadToIPFS(req.files);
        
        // 2. Save to Supabase
        const { data: plot, error } = await supabase
            .from('plots')
            .insert([{
                owner_id: user_id,
                project_name,
                ecosystem_type,
                area_sqm,
                gps_coordinates,
                notes,
                ipfs_hash: ipfsHash,
                status: 'pending_verification'
            }])
            .select()
            .single();
            
        if (error) throw error;
        
        // 3. Register on blockchain
        const plotRegistry = new ethers.Contract(
            process.env.PLOT_REGISTRY_ADDRESS,
            plotRegistryABI,
            wallet
        );
        
        const tx = await plotRegistry.registerPlot(
            ipfsHash,
            area_sqm,
            ecosystem_type
        );
        
        await tx.wait();
        
        res.json({ success: true, plot_id: plot.id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Verification API
app.post('/api/plots/verify', async (req, res) => {
    try {
        const { plot_id, survival_rate, estimated_co2, verifier_id } = req.body;
        
        // 1. Update Supabase
        const { error } = await supabase
            .from('plots')
            .update({
                status: 'verified',
                survival_rate,
                estimated_co2,
                verifier_id,
                verified_at: new Date().toISOString()
            })
            .eq('id', plot_id);
            
        if (error) throw error;
        
        // 2. Calculate and mint credits
        const creditsToMint = Math.floor((estimated_co2 * survival_rate) / 100);
        
        const carbonToken = new ethers.Contract(
            process.env.CARBON_TOKEN_ADDRESS,
            carbonTokenABI,
            wallet
        );
        
        const { data: plot } = await supabase
            .from('plots')
            .select('profiles!plots_owner_id_fkey(wallet_address)')
            .eq('id', plot_id)
            .single();
            
        const tx = await carbonToken.mintCredits(
            plot.profiles.wallet_address,
            creditsToMint,
            plot_id
        );
        
        await tx.wait();
        
        res.json({ success: true, credits_minted: creditsToMint });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Marketplace API
app.post('/api/marketplace/purchase', async (req, res) => {
    try {
        const { listing_id, buyer_id, buyer_wallet } = req.body;
        
        // 1. Get listing details
        const { data: listing } = await supabase
            .from('listings')
            .select('*')
            .eq('id', listing_id)
            .single();
            
        // 2. Burn credits and mint voucher NFT
        const marketplace = new ethers.Contract(
            process.env.MARKETPLACE_ADDRESS,
            marketplaceABI,
            wallet
        );
        
        const tx = await marketplace.purchaseItem(
            buyer_wallet,
            listing.price_bcc,
            listing_id
        );
        
        const receipt = await tx.wait();
        const voucherTokenId = receipt.events[0].args.tokenId;
        
        // 3. Generate QR code
        const qrData = JSON.stringify({
            voucher_id: voucherTokenId,
            listing_id,
            buyer_wallet,
            amount: listing.price_bcc
        });
        
        // 4. Save voucher to Supabase
        const { data: voucher } = await supabase
            .from('vouchers')
            .insert([{
                voucher_nft_id: voucherTokenId,
                listing_id,
                buyer_id,
                vendor_id: listing.vendor_id,
                credits_spent: listing.price_bcc,
                qr_code: qrData
            }])
            .select()
            .single();
            
        res.json({ success: true, voucher, qr_code: qrData });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(3001, () => {
    console.log('API server running on port 3001');
});
```

## 🎯 User Roles & Authentication

### Step 1: Role-Based Access

```typescript
// src/hooks/useAuth.ts
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export type UserRole = 'community' | 'ngo' | 'vendor' | 'verifier' | 'admin';

export const useAuth = () => {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                loadProfile(session.user.id);
            } else {
                setLoading(false);
            }
        });
        
        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                setUser(session?.user ?? null);
                if (session?.user) {
                    await loadProfile(session.user.id);
                } else {
                    setProfile(null);
                    setLoading(false);
                }
            }
        );
        
        return () => subscription.unsubscribe();
    }, []);
    
    const loadProfile = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();
                
            if (error) throw error;
            setProfile(data);
        } catch (error) {
            console.error('Error loading profile:', error);
        } finally {
            setLoading(false);
        }
    };
    
    const signUp = async (email: string, password: string, userData: {
        full_name: string;
        organization?: string;
        role: UserRole;
        phone?: string;
    }) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: userData
            }
        });
        
        if (error) throw error;
        
        // Create profile
        if (data.user) {
            await supabase.from('profiles').insert([{
                id: data.user.id,
                ...userData
            }]);
        }
        
        return data;
    };
    
    const signIn = async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        
        if (error) throw error;
        return data;
    };
    
    const signOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    };
    
    return {
        user,
        profile,
        loading,
        signUp,
        signIn,
        signOut
    };
};
```

### Step 2: Registration Component

```typescript
// src/components/Auth/Register.tsx
import React, { useState } from 'react';
import { useAuth, UserRole } from '../../hooks/useAuth';

export const Register: React.FC = () => {
    const { signUp } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        full_name: '',
        organization: '',
        role: 'community' as UserRole,
        phone: ''
    });
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await signUp(formData.email, formData.password, {
                full_name: formData.full_name,
                organization: formData.organization,
                role: formData.role,
                phone: formData.phone
            });
        } catch (error) {
            console.error('Registration failed:', error);
        }
    };
    
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                required
            />
            
            <input
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                required
            />
            
            <input
                type="text"
                placeholder="Full Name"
                value={formData.full_name}
                onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                required
            />
            
            <input
                type="text"
                placeholder="Organization (Optional)"
                value={formData.organization}
                onChange={(e) => setFormData(prev => ({ ...prev, organization: e.target.value }))}
            />
            
            <select
                value={formData.role}
                onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as UserRole }))}
            >
                <option value="community">Community Member</option>
                <option value="ngo">NGO</option>
                <option value="vendor">Vendor</option>
                <option value="verifier">Verifier</option>
            </select>
            
            <button type="submit" className="w-full bg-teal-600 text-white py-2 rounded">
                Get Started
            </button>
        </form>
    );
};
```

## 🚀 Deployment

### Frontend Deployment (Vercel)

```bash
# Build the project
npm run build

# Deploy to Vercel
npx vercel --prod
```

### Backend Deployment (Railway/Heroku)

```bash
# Add to package.json
{
  "scripts": {
    "start": "node server/index.js",
    "dev": "nodemon server/index.js"
  }
}

# Deploy to Railway
railway login
railway init
railway up
```

### Environment Variables for Production

Set these in your deployment platform:

```env
SUPABASE_URL=your_production_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
POLYGON_RPC_URL=https://polygon-rpc.com
PRIVATE_KEY=your_deployer_private_key
PLOT_REGISTRY_ADDRESS=deployed_contract_address
CARBON_TOKEN_ADDRESS=deployed_contract_address
MARKETPLACE_ADDRESS=deployed_contract_address
```

## 📱 Features Overview

### 🌱 For Communities/NGOs
- **Plot Registration**: Upload restoration data with GPS and photos
- **Credit Earning**: Receive BCC tokens after verification
- **Marketplace Access**: Spend credits on supplies and equipment
- **Progress Tracking**: Monitor restoration impact

### 🏪 For Vendors
- **Product Listings**: List supplies with BCC pricing
- **QR Voucher System**: Process redemptions via QR scanning
- **Sales Analytics**: Track performance and earnings

### 🔍 For Verifiers
- **Plot Review**: Analyze submitted restoration data
- **AI Integration**: Use drone imagery for verification
- **Credit Issuance**: Mint tokens based on verified impact

### 👨‍💼 For Admins
- **System Oversight**: Monitor all platform activity
- **User Management**: Manage roles and permissions
- **Analytics Dashboard**: Track platform-wide metrics

## 🔧 Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Deploy contracts
npx hardhat run scripts/deploy.js --network mumbai

# Start API server
npm run server

# Database migrations
supabase db push
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

MIT License - Built for environmental and social impact.

---

**🌊 Built with ❤️ for India's blue carbon future**