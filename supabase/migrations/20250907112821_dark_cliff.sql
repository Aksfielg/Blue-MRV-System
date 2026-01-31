/*
  # Add Trees and Marketplace Tables

  1. New Tables
    - `trees` - Individual tree records with health verification
    - `marketplace_products` - Products available for purchase with credits
    - `vouchers` - Purchase vouchers with QR codes

  2. Storage
    - Create bucket for tree images

  3. Security
    - Enable RLS on all new tables
    - Add appropriate policies
*/

-- Trees table for individual tree uploads
CREATE TABLE IF NOT EXISTS trees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) NOT NULL,
  species TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 1,
  location JSONB NOT NULL,
  image_urls TEXT[] DEFAULT '{}',
  notes TEXT,
  health_score INTEGER CHECK (health_score >= 0 AND health_score <= 100),
  carbon_potential INTEGER DEFAULT 0,
  vegetation_index DECIMAL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Marketplace products table
CREATE TABLE IF NOT EXISTS marketplace_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID REFERENCES profiles(id) NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('fertilizer', 'seeds', 'tools', 'equipment', 'other')),
  price INTEGER NOT NULL CHECK (price > 0),
  image_url TEXT,
  stock_quantity INTEGER DEFAULT 0,
  total_sold INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enhanced vouchers table
CREATE TABLE IF NOT EXISTS vouchers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES marketplace_products(id) NOT NULL,
  buyer_id UUID REFERENCES profiles(id) NOT NULL,
  vendor_id UUID REFERENCES profiles(id) NOT NULL,
  credits_spent INTEGER NOT NULL,
  qr_code TEXT NOT NULL,
  qr_code_image TEXT,
  blockchain_tx_hash TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'redeemed', 'expired')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  redeemed_at TIMESTAMPTZ,
  redeemed_by UUID REFERENCES profiles(id)
);

-- Enhanced transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('earned', 'spent', 'transferred_in', 'transferred_out')),
  amount INTEGER NOT NULL,
  description TEXT NOT NULL,
  reference_id UUID,
  reference_type TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE trees ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for trees
CREATE POLICY "Users can read all trees"
  ON trees FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create own trees"
  ON trees FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own trees"
  ON trees FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for marketplace_products
CREATE POLICY "Anyone can read active products"
  ON marketplace_products FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Vendors can manage own products"
  ON marketplace_products FOR ALL
  TO authenticated
  USING (
    auth.uid() = vendor_id OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'vendor')
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

-- Create storage bucket for tree images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('tree-images', 'tree-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for tree images
CREATE POLICY "Anyone can view tree images"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'tree-images');

CREATE POLICY "Authenticated users can upload tree images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'tree-images');

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_trees_user_id ON trees(user_id);
CREATE INDEX IF NOT EXISTS idx_trees_status ON trees(status);
CREATE INDEX IF NOT EXISTS idx_trees_created_at ON trees(created_at);
CREATE INDEX IF NOT EXISTS idx_marketplace_products_vendor_id ON marketplace_products(vendor_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_products_category ON marketplace_products(category);
CREATE INDEX IF NOT EXISTS idx_marketplace_products_is_active ON marketplace_products(is_active);
CREATE INDEX IF NOT EXISTS idx_vouchers_buyer_id ON vouchers(buyer_id);
CREATE INDEX IF NOT EXISTS idx_vouchers_vendor_id ON vouchers(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vouchers_status ON vouchers(status);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(transaction_type);

-- Insert sample marketplace products
INSERT INTO marketplace_products (vendor_id, name, description, category, price, stock_quantity, image_url) VALUES
  ('550e8400-e29b-41d4-a716-446655440002', 'Organic Tree Fertilizer', 'Premium organic fertilizer perfect for young trees and saplings', 'fertilizer', 15, 100, 'https://images.pexels.com/photos/4503269/pexels-photo-4503269.jpeg'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Tree Seedling Kit', 'Variety pack of native tree seedlings with planting guide', 'seeds', 25, 50, 'https://images.pexels.com/photos/1114690/pexels-photo-1114690.jpeg'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Gardening Tool Set', 'Complete set of tools for tree planting and maintenance', 'tools', 40, 30, 'https://images.pexels.com/photos/1108572/pexels-photo-1108572.jpeg'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Solar Watering System', 'Automated solar-powered watering system for trees', 'equipment', 60, 20, 'https://images.pexels.com/photos/8968864/pexels-photo-8968864.jpeg')
ON CONFLICT DO NOTHING;