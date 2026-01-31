/*
  # Complete BlueMRV Platform Database Schema

  1. New Tables
    - `profiles` - User profiles with roles and wallet addresses
    - `plots` - Blue carbon restoration plot records with verification status
    - `listings` - Marketplace product listings from vendors
    - `vouchers` - Redeemed voucher tracking with QR codes
    - `verification_logs` - Complete MRV verification history
    - `transactions` - Credit transaction history

  2. Security
    - Enable RLS on all tables
    - Role-based access policies
    - Secure file storage for plot evidence

  3. Features
    - Credit balance tracking
    - Voucher QR code system
    - Complete audit trail
    - Multi-role support (NGO, Vendor, Admin, Community)
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User profiles with enhanced fields
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) NOT NULL PRIMARY KEY,
  wallet_address TEXT UNIQUE,
  full_name TEXT NOT NULL,
  organization TEXT,
  role TEXT NOT NULL DEFAULT 'community' CHECK (role IN ('community', 'ngo', 'vendor', 'verifier', 'admin')),
  phone TEXT,
  location JSONB,
  credit_balance INTEGER DEFAULT 0,
  total_credits_earned INTEGER DEFAULT 0,
  total_credits_spent INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enhanced plots table
CREATE TABLE IF NOT EXISTS plots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES profiles(id) NOT NULL,
  plot_nft_id BIGINT UNIQUE,
  project_name TEXT NOT NULL,
  ecosystem_type TEXT NOT NULL CHECK (ecosystem_type IN ('mangrove', 'seagrass', 'salt_marsh')),
  area_sqm DECIMAL NOT NULL,
  gps_coordinates JSONB NOT NULL,
  image_urls TEXT[] DEFAULT '{}',
  drone_data_url TEXT,
  ipfs_hash TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending_verification' CHECK (status IN ('pending_verification', 'verified', 'rejected')),
  survival_rate INTEGER DEFAULT 0 CHECK (survival_rate >= 0 AND survival_rate <= 100),
  estimated_co2 DECIMAL DEFAULT 0,
  credits_issued INTEGER DEFAULT 0,
  verification_notes TEXT,
  verifier_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  verified_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enhanced marketplace listings
CREATE TABLE IF NOT EXISTS listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID REFERENCES profiles(id) NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('fertilizer', 'seeds', 'equipment', 'tools', 'other')),
  price_bcc INTEGER NOT NULL CHECK (price_bcc > 0),
  image_url TEXT,
  available_quantity INTEGER DEFAULT 0,
  total_sold INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enhanced voucher system
CREATE TABLE IF NOT EXISTS vouchers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  voucher_nft_id BIGINT UNIQUE,
  listing_id UUID REFERENCES listings(id) NOT NULL,
  buyer_id UUID REFERENCES profiles(id) NOT NULL,
  vendor_id UUID REFERENCES profiles(id) NOT NULL,
  credits_spent INTEGER NOT NULL,
  qr_code TEXT NOT NULL,
  is_redeemed BOOLEAN DEFAULT FALSE,
  expiry_date TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
  issued_at TIMESTAMPTZ DEFAULT NOW(),
  redeemed_at TIMESTAMPTZ,
  redemption_location TEXT,
  notes TEXT
);

-- Transaction history table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('earned', 'spent', 'transferred_in', 'transferred_out')),
  amount INTEGER NOT NULL,
  description TEXT NOT NULL,
  reference_id UUID, -- Can reference plot_id, voucher_id, etc.
  reference_type TEXT, -- 'plot', 'voucher', 'transfer'
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Verification activity logs
CREATE TABLE IF NOT EXISTS verification_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plot_id UUID REFERENCES plots(id) NOT NULL,
  verifier_id UUID REFERENCES profiles(id) NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('submitted', 'verified', 'rejected', 'updated')),
  notes TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE plots ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Public profiles readable"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for plots
CREATE POLICY "Anyone can read plots"
  ON plots FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create own plots"
  ON plots FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Plot owners can update own plots"
  ON plots FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id);

CREATE POLICY "Verifiers can update verification status"
  ON plots FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('verifier', 'admin')
    )
  );

-- RLS Policies for listings
CREATE POLICY "Anyone can read active listings"
  ON listings FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Vendors can manage own listings"
  ON listings FOR ALL
  TO authenticated
  USING (
    auth.uid() = vendor_id OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- RLS Policies for vouchers
CREATE POLICY "Users can read own vouchers"
  ON vouchers FOR SELECT
  TO authenticated
  USING (auth.uid() = buyer_id OR auth.uid() = vendor_id);

CREATE POLICY "System can create vouchers"
  ON vouchers FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Vendors can update voucher status"
  ON vouchers FOR UPDATE
  TO authenticated
  USING (auth.uid() = vendor_id);

-- RLS Policies for transactions
CREATE POLICY "Users can read own transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can create transactions"
  ON transactions FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for verification logs
CREATE POLICY "Users can read logs for own plots"
  ON verification_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM plots 
      WHERE id = plot_id 
      AND owner_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('verifier', 'admin')
    )
  );

CREATE POLICY "Verifiers can create logs"
  ON verification_logs FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('verifier', 'admin')
    )
  );

-- Create storage bucket for plot evidence
INSERT INTO storage.buckets (id, name, public) 
VALUES ('plot-evidence', 'plot-evidence', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Anyone can view plot evidence"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'plot-evidence');

CREATE POLICY "Authenticated users can upload plot evidence"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'plot-evidence');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_plots_owner_id ON plots(owner_id);
CREATE INDEX IF NOT EXISTS idx_plots_status ON plots(status);
CREATE INDEX IF NOT EXISTS idx_plots_ecosystem_type ON plots(ecosystem_type);
CREATE INDEX IF NOT EXISTS idx_plots_created_at ON plots(created_at);
CREATE INDEX IF NOT EXISTS idx_listings_vendor_id ON listings(vendor_id);
CREATE INDEX IF NOT EXISTS idx_listings_category ON listings(category);
CREATE INDEX IF NOT EXISTS idx_listings_is_active ON listings(is_active);
CREATE INDEX IF NOT EXISTS idx_vouchers_buyer_id ON vouchers(buyer_id);
CREATE INDEX IF NOT EXISTS idx_vouchers_vendor_id ON vouchers(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vouchers_is_redeemed ON vouchers(is_redeemed);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_verification_logs_plot_id ON verification_logs(plot_id);

-- Insert sample data for demo
INSERT INTO profiles (id, wallet_address, full_name, organization, role, credit_balance, total_credits_earned) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', '0x1234567890123456789012345678901234567890', 'Coastal Development NGO', 'Marine Conservation Society', 'ngo', 127, 342),
  ('550e8400-e29b-41d4-a716-446655440002', '0x2345678901234567890123456789012345678901', 'Organic Supplies Co.', 'Green Agriculture Ltd', 'vendor', 0, 0),
  ('550e8400-e29b-41d4-a716-446655440003', '0x3456789012345678901234567890123456789012', 'Dr. Marine Scientist', 'NCCR Chennai', 'verifier', 0, 0),
  ('550e8400-e29b-41d4-a716-446655440004', '0x4567890123456789012345678901234567890123', 'Sundarbans Panchayat', 'Local Government', 'community', 89, 156)
ON CONFLICT (id) DO NOTHING;

INSERT INTO listings (vendor_id, name, description, category, price_bcc, available_quantity, image_url) VALUES
  ('550e8400-e29b-41d4-a716-446655440002', 'Organic Fertilizer Pack', 'Premium organic fertilizer suitable for coastal agriculture. Contains essential nutrients for healthy plant growth.', 'fertilizer', 15, 50, 'https://images.pexels.com/photos/4503269/pexels-photo-4503269.jpeg'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Mangrove Seedling Kit', 'High-quality mangrove seedlings with comprehensive planting guide and care instructions.', 'seeds', 25, 30, 'https://images.pexels.com/photos/1114690/pexels-photo-1114690.jpeg'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Solar Lamp Kit', 'Solar-powered lamps for coastal communities. Includes charging station and maintenance guide.', 'equipment', 35, 15, 'https://images.pexels.com/photos/1108572/pexels-photo-1108572.jpeg'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Sustainable Fishing Net Set', 'Eco-friendly fishing nets designed for coastal communities. Durable and sustainable materials.', 'equipment', 40, 20, 'https://images.pexels.com/photos/8968864/pexels-photo-8968864.jpeg')
ON CONFLICT DO NOTHING;