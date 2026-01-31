/*
  # BlueMRV Platform Database Schema

  1. New Tables
    - `profiles` - User profiles linked to authentication
    - `plots` - Blue carbon restoration plot records
    - `listings` - Marketplace product listings
    - `vouchers` - Redeemed voucher tracking
    - `verification_logs` - MRV verification history

  2. Security
    - Enable RLS on all tables
    - Add policies for role-based access
    - Secure file storage for plot evidence

  3. Storage
    - Create bucket for plot evidence (photos, drone data)
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) NOT NULL PRIMARY KEY,
  wallet_address TEXT UNIQUE,
  full_name TEXT NOT NULL,
  organization TEXT,
  role TEXT NOT NULL DEFAULT 'community' CHECK (role IN ('community', 'ngo', 'vendor', 'verifier', 'admin')),
  phone TEXT,
  location JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Blue carbon restoration plots
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
  verification_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  verified_at TIMESTAMPTZ
);

-- Marketplace product listings
CREATE TABLE IF NOT EXISTS listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID REFERENCES profiles(id) NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('fertilizer', 'seeds', 'equipment', 'tools', 'other')),
  price_bcc INTEGER NOT NULL CHECK (price_bcc > 0),
  image_url TEXT,
  available_quantity INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Voucher redemption tracking
CREATE TABLE IF NOT EXISTS vouchers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  voucher_nft_id BIGINT UNIQUE,
  listing_id UUID REFERENCES listings(id) NOT NULL,
  buyer_id UUID REFERENCES profiles(id) NOT NULL,
  vendor_id UUID REFERENCES profiles(id) NOT NULL,
  credits_spent INTEGER NOT NULL,
  qr_code TEXT NOT NULL,
  is_redeemed BOOLEAN DEFAULT FALSE,
  issued_at TIMESTAMPTZ DEFAULT NOW(),
  redeemed_at TIMESTAMPTZ
);

-- Verification activity logs
CREATE TABLE IF NOT EXISTS verification_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plot_id UUID REFERENCES plots(id) NOT NULL,
  verifier_id UUID REFERENCES profiles(id) NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('submitted', 'verified', 'rejected')),
  notes TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE plots ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE vouchers ENABLE ROW LEVEL SECURITY;
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

CREATE POLICY "Anyone can read public profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for plots
CREATE POLICY "Users can read all plots"
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

CREATE POLICY "Verifiers can update plot verification"
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
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND (role = 'vendor' OR role = 'admin')
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

CREATE POLICY "Vendors can update voucher redemption"
  ON vouchers FOR UPDATE
  TO authenticated
  USING (auth.uid() = vendor_id);

-- RLS Policies for verification logs
CREATE POLICY "Users can read verification logs for own plots"
  ON verification_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM plots 
      WHERE id = plot_id 
      AND owner_id = auth.uid()
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
CREATE INDEX IF NOT EXISTS idx_listings_vendor_id ON listings(vendor_id);
CREATE INDEX IF NOT EXISTS idx_listings_category ON listings(category);
CREATE INDEX IF NOT EXISTS idx_vouchers_buyer_id ON vouchers(buyer_id);
CREATE INDEX IF NOT EXISTS idx_vouchers_vendor_id ON vouchers(vendor_id);