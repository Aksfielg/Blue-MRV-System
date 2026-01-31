# 🌊 BlueMRV - Complete Blockchain-Powered Blue Carbon Platform

<img width="1893" height="921" alt="image" src="https://github.com/user-attachments/assets/1221abdb-d1e8-4f4f-a606-75589076b20d" />

<img width="1873" height="744" alt="image" src="https://github.com/user-attachments/assets/3e3e1406-711b-4b7b-9083-6ac71925671a" />

<img width="1872" height="847" alt="image" src="https://github.com/user-attachments/assets/b64e26df-42ae-43da-8c4c-2b6a07698c98" />

<img width="1880" height="837" alt="image" src="https://github.com/user-attachments/assets/23e14056-fbcb-45e8-b79c-83360248e3dd" />



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
