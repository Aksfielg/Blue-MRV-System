import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { QrCode, Check, X, Package, User, Calendar, Coins, Camera } from 'lucide-react';
import toast from 'react-hot-toast';

interface ScannedVoucher {
  voucherId: string;
  userId: string;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
  }>;
  totalCredits: number;
  timestamp: number;
  vendorInfo: {
    name: string;
    address: string;
    phone: string;
  };
}

interface RedeemedItem {
  voucherId: string;
  customerName: string;
  items: Array<{
    name: string;
    quantity: number;
  }>;
  totalValue: number;
  redeemedAt: string;
}

const VendorQRScanner: React.FC = () => {
  const [qrInput, setQrInput] = useState('');
  const [scannedVoucher, setScannedVoucher] = useState<ScannedVoucher | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recentRedemptions, setRecentRedemptions] = useState<RedeemedItem[]>([]);
  const [showScanner, setShowScanner] = useState(false);

  // Mock recent redemptions for demo
  React.useEffect(() => {
    const mockRedemptions: RedeemedItem[] = [
      {
        voucherId: 'voucher_1234567890',
        customerName: 'John Doe',
        items: [
          { name: 'Organic Tree Fertilizer Pro', quantity: 2 },
          { name: 'Native Tree Seedling Kit', quantity: 1 }
        ],
        totalValue: 55,
        redeemedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString() // 30 minutes ago
      },
      {
        voucherId: 'voucher_0987654321',
        customerName: 'Jane Smith',
        items: [
          { name: 'Professional Gardening Tool Set', quantity: 1 }
        ],
        totalValue: 40,
        redeemedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() // 2 hours ago
      }
    ];
    setRecentRedemptions(mockRedemptions);
  }, []);

  const handleScanQR = async () => {
    if (!qrInput.trim()) {
      toast.error('Please enter QR code data');
      return;
    }

    setIsProcessing(true);

    try {
      // Parse QR code data
      const voucherData: ScannedVoucher = JSON.parse(qrInput);
      
      // Validate voucher structure
      if (!voucherData.voucherId || !voucherData.items || !voucherData.totalCredits) {
        throw new Error('Invalid voucher format');
      }

      // Simulate API call to verify voucher
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Check if voucher is already redeemed (mock check)
      const isAlreadyRedeemed = recentRedemptions.some(r => r.voucherId === voucherData.voucherId);
      if (isAlreadyRedeemed) {
        throw new Error('This voucher has already been redeemed');
      }

      setScannedVoucher(voucherData);
      toast.success('Voucher verified successfully!');

    } catch (error: any) {
      console.error('QR scan error:', error);
      if (error.message.includes('JSON')) {
        toast.error('Invalid QR code format');
      } else {
        toast.error(error.message || 'Failed to verify voucher');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRedeemVoucher = async () => {
    if (!scannedVoucher) return;

    setIsProcessing(true);

    try {
      // Simulate API call to redeem voucher
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Add to recent redemptions
      const newRedemption: RedeemedItem = {
        voucherId: scannedVoucher.voucherId,
        customerName: 'Customer', // In real app, get from user profile
        items: scannedVoucher.items.map(item => ({
          name: item.name,
          quantity: item.quantity
        })),
        totalValue: scannedVoucher.totalCredits,
        redeemedAt: new Date().toISOString()
      };

      setRecentRedemptions(prev => [newRedemption, ...prev]);
      setScannedVoucher(null);
      setQrInput('');
      toast.success('Voucher redeemed successfully! Items can be collected.');

    } catch (error) {
      toast.error('Failed to redeem voucher');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)} hours ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)} days ago`;
    }
  };

  // Mock QR data for testing
  const mockQRData = JSON.stringify({
    voucherId: `voucher_${Date.now()}`,
    userId: 'user123',
    items: [
      { id: '1', name: 'Organic Tree Fertilizer Pro', quantity: 1, price: 15 },
      { id: '2', name: 'Native Tree Seedling Kit', quantity: 1, price: 25 }
    ],
    totalCredits: 40,
    timestamp: Date.now(),
    vendorInfo: {
      name: 'EcoMart Central',
      address: '123 Green Street, Eco City',
      phone: '+1 (555) 123-4567'
    }
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Vendor QR Scanner</h1>
        <p className="text-gray-600">Scan customer vouchers to process redemptions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* QR Scanner Section */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <QrCode className="text-blue-600" size={24} />
              Scan QR Code
            </h2>

            {!showScanner ? (
              <div className="text-center py-8">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Camera className="text-gray-400" size={32} />
                </div>
                <p className="text-gray-600 mb-4">Point camera at customer's QR code</p>
                <button
                  onClick={() => setShowScanner(true)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
                >
                  <Camera size={16} />
                  Open Camera Scanner
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-gray-100 rounded-lg p-4 text-center">
                  <QrCode className="mx-auto text-gray-400 mb-2" size={48} />
                  <p className="text-gray-600">Camera scanner would appear here</p>
                  <p className="text-sm text-gray-500">Use manual input below for demo</p>
                </div>
                <button
                  onClick={() => setShowScanner(false)}
                  className="w-full py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Close Scanner
                </button>
              </div>
            )}

            {/* Manual QR Input */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="font-semibold mb-3">Manual QR Code Input</h3>
              <textarea
                value={qrInput}
                onChange={(e) => setQrInput(e.target.value)}
                placeholder="Paste QR code data here..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
              />
              
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleScanQR}
                  disabled={isProcessing || !qrInput.trim()}
                  className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Verifying...
                    </>
                  ) : (
                    <>
                      <QrCode size={16} />
                      Verify Voucher
                    </>
                  )}
                </button>
                <button
                  onClick={() => setQrInput(mockQRData)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Use Demo QR
                </button>
              </div>
            </div>
          </div>

          {/* Scanned Voucher Details */}
          {scannedVoucher && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-lg p-6 border-2 border-green-200"
            >
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-green-700">
                <Check size={20} />
                Voucher Verified
              </h3>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Voucher ID:</span>
                    <p className="font-mono text-xs">{scannedVoucher.voucherId}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Date:</span>
                    <p>{new Date(scannedVoucher.timestamp).toLocaleDateString()}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Items to Redeem:</h4>
                  <div className="space-y-2">
                    {scannedVoucher.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span>{item.name}</span>
                        <div className="text-right">
                          <span className="font-semibold">Qty: {item.quantity}</span>
                          <p className="text-sm text-gray-600">{item.price} CC each</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                  <span className="font-semibold">Total Value:</span>
                  <span className="text-lg font-bold text-green-600 flex items-center gap-1">
                    <Coins size={16} />
                    {scannedVoucher.totalCredits} CC
                  </span>
                </div>

                <button
                  onClick={handleRedeemVoucher}
                  disabled={isProcessing}
                  className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Package size={16} />
                      Redeem Voucher
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Recent Redemptions */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Calendar className="text-purple-600" size={24} />
            Recent Redemptions
          </h2>

          {recentRedemptions.length === 0 ? (
            <div className="text-center py-8">
              <Package className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-600">No redemptions yet today</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentRedemptions.map((redemption, index) => (
                <motion.div
                  key={redemption.voucherId}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold flex items-center gap-2">
                        <User size={16} />
                        {redemption.customerName}
                      </p>
                      <p className="text-sm text-gray-600">
                        {formatTimeAgo(redemption.redeemedAt)}
                      </p>
                    </div>
                    <span className="text-green-600 font-bold flex items-center gap-1">
                      <Coins size={14} />
                      {redemption.totalValue} CC
                    </span>
                  </div>

                  <div className="space-y-1">
                    {redemption.items.map((item, itemIndex) => (
                      <p key={itemIndex} className="text-sm text-gray-700">
                        • {item.name} (x{item.quantity})
                      </p>
                    ))}
                  </div>

                  <p className="text-xs text-gray-500 mt-2 font-mono">
                    ID: {redemption.voucherId}
                  </p>
                </motion.div>
              ))}
            </div>
          )}

          {/* Daily Summary */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <h3 className="font-semibold mb-2">Today's Summary</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{recentRedemptions.length}</p>
                <p className="text-blue-700">Vouchers Redeemed</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">
                  {recentRedemptions.reduce((sum, r) => sum + r.totalValue, 0)}
                </p>
                <p className="text-green-700">Credits Processed</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorQRScanner;