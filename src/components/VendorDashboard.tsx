import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, QrCode, Plus, Edit, Trash2, CheckCircle, Clock, DollarSign } from 'lucide-react';
import { supabase, Listing, Voucher } from '../lib/supabase';
import { scanAndRedeemVoucher } from '../lib/api';
import QRCode from 'react-qr-code';
import toast from 'react-hot-toast';

const VendorDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('products');
  const [listings, setListings] = useState<Listing[]>([]);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [qrScanResult, setQrScanResult] = useState<string>('');
  
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    category: 'fertilizer' as 'fertilizer' | 'seeds' | 'equipment' | 'tools' | 'other',
    price_bcc: '',
    available_quantity: '',
    image_url: ''
  });

  useEffect(() => {
    loadVendorData();
  }, []);

  const loadVendorData = async () => {
    try {
      // Load vendor's listings
      const { data: listingsData } = await supabase
        .from('listings')
        .select('*')
        .eq('vendor_id', 'demo-vendor-id') // In real app, get from auth
        .order('created_at', { ascending: false });

      // Load vendor's vouchers
      const { data: vouchersData } = await supabase
        .from('vouchers')
        .select(`
          *,
          listings(name, category),
          buyer_profile:profiles!vouchers_buyer_id_fkey(full_name, organization)
        `)
        .eq('vendor_id', 'demo-vendor-id')
        .order('issued_at', { ascending: false });

      setListings(listingsData || []);
      setVouchers(vouchersData || []);
    } catch (error) {
      console.error('Error loading vendor data:', error);
      toast.error('Failed to load vendor data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data, error } = await supabase
        .from('listings')
        .insert([{
          ...newProduct,
          vendor_id: 'demo-vendor-id',
          price_bcc: parseInt(newProduct.price_bcc),
          available_quantity: parseInt(newProduct.available_quantity)
        }])
        .select()
        .single();

      if (error) throw error;

      setListings(prev => [data, ...prev]);
      setNewProduct({
        name: '',
        description: '',
        category: 'fertilizer',
        price_bcc: '',
        available_quantity: '',
        image_url: ''
      });
      setShowAddProduct(false);
      toast.success('Product added successfully!');
    } catch (error: any) {
      toast.error('Failed to add product');
    }
  };

  const handleScanQR = async () => {
    if (!qrScanResult.trim()) {
      toast.error('Please enter QR code data');
      return;
    }

    try {
      const result = await scanAndRedeemVoucher(qrScanResult, 'demo-vendor-id');
      
      if (result.success) {
        toast.success(`Voucher redeemed: ${result.data.product_name}`);
        setQrScanResult('');
        loadVendorData(); // Refresh voucher list
      } else {
        toast.error(result.error || 'Invalid voucher');
      }
    } catch (error) {
      toast.error('Failed to process voucher');
    }
  };

  const stats = [
    { label: 'Active Products', value: listings.filter(l => l.is_active).length.toString(), icon: Package, color: 'text-blue-600' },
    { label: 'Total Sales', value: vouchers.filter(v => v.is_redeemed).length.toString(), icon: CheckCircle, color: 'text-green-600' },
    { label: 'Pending Vouchers', value: vouchers.filter(v => !v.is_redeemed).length.toString(), icon: Clock, color: 'text-yellow-600' },
    { label: 'Revenue (BCC)', value: vouchers.reduce((sum, v) => sum + (v.is_redeemed ? v.credits_spent : 0), 0).toString(), icon: DollarSign, color: 'text-purple-600' }
  ];

  const tabs = [
    { id: 'products', label: 'My Products', icon: Package },
    { id: 'vouchers', label: 'Vouchers', icon: QrCode },
    { id: 'scanner', label: 'QR Scanner', icon: QrCode }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'products':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Product Listings</h3>
              <button
                onClick={() => setShowAddProduct(true)}
                className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
              >
                <Plus size={16} />
                Add Product
              </button>
            </div>

            {showAddProduct && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-50 rounded-lg p-6 border border-gray-200"
              >
                <h4 className="font-semibold mb-4">Add New Product</h4>
                <form onSubmit={handleAddProduct} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Product Name"
                      value={newProduct.name}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                      className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                      required
                    />
                    <select
                      value={newProduct.category}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, category: e.target.value as any }))}
                      className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="fertilizer">Fertilizer</option>
                      <option value="seeds">Seeds</option>
                      <option value="equipment">Equipment</option>
                      <option value="tools">Tools</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <textarea
                    placeholder="Product Description"
                    value={newProduct.description}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    rows={3}
                    required
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="number"
                      placeholder="Price (BCC)"
                      value={newProduct.price_bcc}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, price_bcc: e.target.value }))}
                      className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                      required
                    />
                    <input
                      type="number"
                      placeholder="Available Quantity"
                      value={newProduct.available_quantity}
                      onChange={(e) => setNewProduct(prev => ({ ...prev, available_quantity: e.target.value }))}
                      className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                      required
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                    >
                      Add Product
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddProduct(false)}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((listing) => (
                <motion.div
                  key={listing.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-800">{listing.name}</h4>
                      <p className="text-sm text-gray-600 capitalize">{listing.category}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      listing.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {listing.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">{listing.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-teal-600">{listing.price_bcc} BCC</span>
                    <span className="text-sm text-gray-500">{listing.available_quantity} available</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        );

      case 'vouchers':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Voucher Management</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium text-gray-700">Pending Redemption</h4>
                {vouchers.filter(v => !v.is_redeemed).map((voucher) => (
                  <div key={voucher.id} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">{voucher.listings?.name}</span>
                      <span className="text-yellow-600 font-bold">{voucher.credits_spent} BCC</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      Buyer: {voucher.buyer_profile?.full_name}
                    </p>
                    <p className="text-xs text-gray-500">
                      Issued: {new Date(voucher.issued_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-gray-700">Redeemed</h4>
                {vouchers.filter(v => v.is_redeemed).map((voucher) => (
                  <div key={voucher.id} className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">{voucher.listings?.name}</span>
                      <span className="text-green-600 font-bold">{voucher.credits_spent} BCC</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      Buyer: {voucher.buyer_profile?.full_name}
                    </p>
                    <p className="text-xs text-gray-500">
                      Redeemed: {voucher.redeemed_at ? new Date(voucher.redeemed_at).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'scanner':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">QR Code Scanner</h3>
            
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="text-center mb-6">
                <QrCode className="mx-auto text-gray-400 mb-4" size={64} />
                <p className="text-gray-600">Scan customer voucher QR code</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    QR Code Data (for demo)
                  </label>
                  <textarea
                    value={qrScanResult}
                    onChange={(e) => setQrScanResult(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    rows={4}
                    placeholder='Paste QR code JSON data here...'
                  />
                </div>

                <button
                  onClick={handleScanQR}
                  className="w-full py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center justify-center gap-2"
                >
                  <QrCode size={16} />
                  Process Voucher
                </button>
              </div>

              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">Demo QR Data</h4>
                <pre className="text-xs text-blue-700 bg-blue-100 p-2 rounded overflow-x-auto">
{JSON.stringify({
  voucher_id: "voucher_1234567890",
  listing_id: "1",
  buyer_id: "user123",
  vendor_id: "demo-vendor-id",
  amount: 15,
  timestamp: Date.now()
}, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const vendorStats = [
    { label: 'Products Listed', value: listings.length.toString(), icon: Package, color: 'text-blue-600' },
    { label: 'Total Sales', value: vouchers.filter(v => v.is_redeemed).length.toString(), icon: CheckCircle, color: 'text-green-600' },
    { label: 'Pending Vouchers', value: vouchers.filter(v => !v.is_redeemed).length.toString(), icon: Clock, color: 'text-yellow-600' },
    { label: 'Credits Earned', value: vouchers.reduce((sum, v) => sum + (v.is_redeemed ? v.credits_spent : 0), 0).toString(), icon: DollarSign, color: 'text-purple-600' }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Vendor Dashboard</h1>
        <p className="text-gray-600">Manage your products and process voucher redemptions</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {vendorStats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white p-6 rounded-lg shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
              </div>
              <stat.icon className={stat.color} size={32} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-teal-500 text-teal-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
        
        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default VendorDashboard;