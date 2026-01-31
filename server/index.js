const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');
const { ethers } = require('ethers');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Import route modules
const treesRouter = require('./routes/trees');
const marketplaceRouter = require('./routes/marketplace');
const usersRouter = require('./routes/users');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// File upload configuration
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Initialize services
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Blockchain setup
const provider = new ethers.providers.JsonRpcProvider(process.env.POLYGON_RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// Smart Contract ABIs (simplified for demo)
const plotRegistryABI = [
  "function registerPlot(string memory ipfsHash, uint256 areaSqm, string memory ecosystemType) external returns (uint256)",
  "function verifyPlot(uint256 plotId, uint256 survivalRate, uint256 estimatedCO2) external",
  "function getPlot(uint256 plotId) external view returns (tuple(uint256 id, address owner, string ipfsHash, uint256 areaSqm, string ecosystemType, bool isVerified, uint256 survivalRate, uint256 estimatedCO2))"
];

const carbonTokenABI = [
  "function mintCredits(address to, uint256 amount, uint256 plotId) external",
  "function burnCredits(address from, uint256 amount) external",
  "function getCreditBalance(address account) external view returns (uint256)",
  "function balanceOf(address account, uint256 id) external view returns (uint256)"
];

const marketplaceABI = [
  "function purchaseItem(address buyer, uint256 creditAmount, uint256 listingId) external returns (uint256)",
  "function createListing(string memory name, uint256 price, uint256 quantity) external returns (uint256)"
];

const voucherNFTABI = [
  "function mintVoucher(address to, uint256 listingId, uint256 creditAmount, string memory qrData) external returns (uint256)",
  "function redeemVoucher(uint256 tokenId) external",
  "function isRedeemed(uint256 tokenId) external view returns (bool)"
];

// Contract instances
const plotRegistry = new ethers.Contract(
  process.env.PLOT_REGISTRY_ADDRESS,
  plotRegistryABI,
  wallet
);

const carbonToken = new ethers.Contract(
  process.env.CARBON_TOKEN_ADDRESS,
  carbonTokenABI,
  wallet
);

const marketplace = new ethers.Contract(
  process.env.MARKETPLACE_ADDRESS,
  marketplaceABI,
  wallet
);

const voucherNFT = new ethers.Contract(
  process.env.VOUCHER_NFT_ADDRESS,
  voucherNFTABI,
  wallet
);

// Authentication middleware
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// Role-based authorization middleware
const authorizeRole = (roles) => {
  return async (req, res, next) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', req.user.id)
        .single();

      if (!profile || !roles.includes(profile.role)) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }
      req.userRole = profile.role;
      next();
    } catch (error) {
      return res.status(500).json({ error: 'Authorization check failed' });
    }
  };
};

// Use route modules
app.use('/api/trees', treesRouter);
app.use('/api/marketplace', marketplaceRouter);
app.use('/api/users', usersRouter);

// ==================== AUTHENTICATION ROUTES ====================

// User Registration
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, full_name, organization, role, phone } = req.body;

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });

    if (authError) throw authError;

    // Create profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert([{
        id: authData.user.id,
        full_name,
        organization,
        role,
        phone
      }])
      .select()
      .single();

    if (profileError) throw profileError;

    res.json({
      success: true,
      user: authData.user,
      profile
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// User Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    res.json({
      success: true,
      user: data.user,
      profile,
      session: data.session
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ==================== GENERAL API ROUTES ====================

// Get user profile
app.get('/api/profile', authenticateToken, async (req, res) => {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (error) throw error;

    res.json({ success: true, profile });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'BlueMRV API is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('API Error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 BlueMRV API server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;