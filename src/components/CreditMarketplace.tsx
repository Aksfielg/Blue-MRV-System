import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Coins, Package, QrCode, Check, Star, Plus, Minus, X, Filter, Search, Heart } from 'lucide-react';
import { useAuth } from './Auth/AuthProvider';
import QRCode from 'react-qr-code';
import toast from 'react-hot-toast';

interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  originalPrice?: number;
  image: string;
  vendor: string;
  rating: number;
  reviewCount: number;
  inStock: number;
  discount?: number;
  isPopular?: boolean;
  isFavorite?: boolean;
}

interface CartItem extends Product {
  quantity: number;
}

interface Voucher {
  id: string;
  items: CartItem[];
  totalCredits: number;
  qrCode: string;
  issuedAt: string;
  vendorInfo: {
    name: string;
    address: string;
    phone: string;
  };
}

const CreditMarketplace: React.FC = () => {
  const { user, profile } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [userCredits, setUserCredits] = useState<number>(0);
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'popular' | 'price-low' | 'price-high' | 'rating'>('popular');

  const categories = [
    { id: 'all', name: 'All Products', icon: '🛍️' },
    { id: 'fertilizer', name: 'Fertilizers', icon: '🌱' },
    { id: 'seeds', name: 'Seeds', icon: '🌾' },
    { id: 'tools', name: 'Tools', icon: '🛠️' },
    { id: 'equipment', name: 'Equipment', icon: '⚡' },
    { id: 'organic', name: 'Organic', icon: '🍃' }
  ];

  useEffect(() => {
    loadMarketplaceData();
    loadUserCredits();
  }, [user]);

  useEffect(() => {
    filterAndSortProducts();
  }, [products, selectedCategory, searchQuery, sortBy]);

  const loadMarketplaceData = async () => {
    try {
      // Enhanced mock products with more variety
      const mockProducts: Product[] = [
        {
          id: '1',
          name: 'Organic Tree Fertilizer Pro',
          description: 'Premium organic fertilizer with slow-release nutrients, perfect for young trees and saplings. Enriched with mycorrhizae.',
          category: 'fertilizer',
          price: 15,
          originalPrice: 20,
          image: 'https://images.pexels.com/photos/4503269/pexels-photo-4503269.jpeg',
          vendor: 'Green Supplies Co.',
          rating: 4.8,
          reviewCount: 124,
          inStock: 45,
          discount: 25,
          isPopular: true
        },
        {
          id: '2',
          name: 'Native Tree Seedling Kit',
          description: 'Variety pack of 20 native tree seedlings with comprehensive planting guide and care instructions.',
          category: 'seeds',
          price: 25,
          image: 'https://images.pexels.com/photos/1114690/pexels-photo-1114690.jpeg',
          vendor: 'Forest Nursery Ltd.',
          rating: 4.9,
          reviewCount: 89,
          inStock: 32,
          isPopular: true
        },
        {
          id: '3',
          name: 'Professional Gardening Tool Set',
          description: 'Complete 12-piece tool set including pruning shears, hand trowel, weeder, and more. Ergonomic design.',
          category: 'tools',
          price: 40,
          originalPrice: 55,
          image: 'https://images.pexels.com/photos/1108572/pexels-photo-1108572.jpeg',
          vendor: 'EcoTools Ltd.',
          rating: 4.7,
          reviewCount: 156,
          inStock: 28,
          discount: 27
        },
        {
          id: '4',
          name: 'Solar Watering System',
          description: 'Automated solar-powered drip irrigation system. Perfect for maintaining young trees without electricity.',
          category: 'equipment',
          price: 60,
          image: 'https://images.pexels.com/photos/8968864/pexels-photo-8968864.jpeg',
          vendor: 'SolarGrow Tech',
          rating: 4.6,
          reviewCount: 73,
          inStock: 15
        },
        {
          id: '5',
          name: 'Compost Maker Kit',
          description: 'Complete composting system with bins, thermometer, and organic starter. Turn waste into nutrient-rich soil.',
          category: 'organic',
          price: 35,
          image: 'https://images.pexels.com/photos/4503269/pexels-photo-4503269.jpeg',
          vendor: 'Eco Solutions',
          rating: 4.5,
          reviewCount: 92,
          inStock: 22
        },
        {
          id: '6',
          name: 'Bamboo Plant Stakes',
          description: 'Set of 50 natural bamboo stakes for supporting young plants and trees. Biodegradable and sustainable.',
          category: 'tools',
          price: 12,
          image: 'https://images.pexels.com/photos/1108572/pexels-photo-1108572.jpeg',
          vendor: 'Bamboo Works',
          rating: 4.4,
          reviewCount: 67,
          inStock: 78
        },
        {
          id: '7',
          name: 'Organic Pest Control Spray',
          description: 'Natural, non-toxic pest control solution made from neem oil and essential oils. Safe for plants and environment.',
          category: 'organic',
          price: 18,
          originalPrice: 24,
          image: 'https://images.pexels.com/photos/4503269/pexels-photo-4503269.jpeg',
          vendor: 'Natural Guard',
          rating: 4.6,
          reviewCount: 134,
          inStock: 56,
          discount: 25
        },
        {
          id: '8',
          name: 'Fruit Tree Grafting Kit',
          description: 'Professional grafting tools and supplies for creating fruit tree varieties. Includes grafting tape and sealant.',
          category: 'tools',
          price: 45,
          image: 'https://images.pexels.com/photos/1108572/pexels-photo-1108572.jpeg',
          vendor: 'Orchard Pro',
          rating: 4.8,
          reviewCount: 45,
          inStock: 18
        },
        {
          id: '9',
          name: 'Wildflower Seed Mix',
          description: 'Native wildflower seeds that attract pollinators and support local ecosystem. Covers 100 sq ft.',
          category: 'seeds',
          price: 8,
          image: 'https://images.pexels.com/photos/1114690/pexels-photo-1114690.jpeg',
          vendor: 'Wild Bloom',
          rating: 4.7,
          reviewCount: 203,
          inStock: 95,
          isPopular: true
        },
        {
          id: '10',
          name: 'Smart Plant Monitor',
          description: 'IoT device that monitors soil moisture, light, and temperature. Sends alerts to your phone.',
          category: 'equipment',
          price: 75,
          originalPrice: 95,
          image: 'https://images.pexels.com/photos/8968864/pexels-photo-8968864.jpeg',
          vendor: 'TechGarden',
          rating: 4.5,
          reviewCount: 87,
          inStock: 12,
          discount: 21
        },
        {
          id: '11',
          name: 'Mycorrhizal Fungi Inoculant',
          description: 'Beneficial fungi that form symbiotic relationships with plant roots, improving nutrient uptake.',
          category: 'organic',
          price: 22,
          image: 'https://images.pexels.com/photos/4503269/pexels-photo-4503269.jpeg',
          vendor: 'BioGrow',
          rating: 4.9,
          reviewCount: 76,
          inStock: 34
        },
        {
          id: '12',
          name: 'Pruning Saw Set',
          description: 'Professional-grade folding saw and pole saw for tree maintenance. Sharp, durable blades.',
          category: 'tools',
          price: 55,
          image: 'https://images.pexels.com/photos/1108572/pexels-photo-1108572.jpeg',
          vendor: 'CutRight Tools',
          rating: 4.6,
          reviewCount: 112,
          inStock: 25
        },
        {
          id: '13',
          name: 'Rainwater Collection System',
          description: 'Complete system for collecting and storing rainwater. Includes 50-gallon barrel and filtration.',
          category: 'equipment',
          price: 85,
          originalPrice: 110,
          image: 'https://images.pexels.com/photos/8968864/pexels-photo-8968864.jpeg',
          vendor: 'AquaHarvest',
          rating: 4.4,
          reviewCount: 58,
          inStock: 8,
          discount: 23
        },
        {
          id: '14',
          name: 'Heirloom Vegetable Seeds',
          description: 'Collection of 15 heirloom vegetable varieties. Non-GMO, open-pollinated seeds with growing guide.',
          category: 'seeds',
          price: 30,
          image: 'https://images.pexels.com/photos/1114690/pexels-photo-1114690.jpeg',
          vendor: 'Heritage Seeds',
          rating: 4.8,
          reviewCount: 167,
          inStock: 41
        },
        {
          id: '15',
          name: 'Worm Composting Bin',
          description: 'Stackable worm composting system that turns kitchen scraps into rich vermicompost.',
          category: 'organic',
          price: 65,
          image: 'https://images.pexels.com/photos/4503269/pexels-photo-4503269.jpeg',
          vendor: 'Worm Works',
          rating: 4.7,
          reviewCount: 94,
          inStock: 19
        }
      ];
      
      setProducts(mockProducts);
    } catch (error) {
      toast.error('Failed to load marketplace');
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserCredits = async () => {
    if (!user) return;
    
    try {
      // Mock credits for demo - in real app, fetch from API
      setUserCredits(Math.floor(Math.random() * 200) + 100);
    } catch (error) {
      setUserCredits(150); // Fallback credits
    }
  };

  const filterAndSortProducts = () => {
    let filtered = products;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort products
    switch (sortBy) {
      case 'popular':
        filtered.sort((a, b) => (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0) || b.reviewCount - a.reviewCount);
        break;
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
    }

    setFilteredProducts(filtered);
  };

  const addToCart = (product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: Math.min(item.quantity + 1, product.inStock) }
            : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
    toast.success(`${product.name} added to cart!`);
  };

  const updateCartQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity === 0) {
      removeFromCart(productId);
      return;
    }

    setCart(prevCart =>
      prevCart.map(item =>
        item.id === productId
          ? { ...item, quantity: Math.min(newQuantity, item.inStock) }
          : item
      )
    );
  };

  const removeFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  const getTotalCredits = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const handleCheckout = async () => {
    if (!user) {
      toast.error('Please login to purchase');
      return;
    }

    const totalCredits = getTotalCredits();
    if (userCredits < totalCredits) {
      toast.error('Insufficient carbon credits');
      return;
    }

    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setIsPurchasing(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Generate voucher
      const voucher: Voucher = {
        id: `voucher_${Date.now()}`,
        items: [...cart],
        totalCredits,
        qrCode: JSON.stringify({
          voucherId: `voucher_${Date.now()}`,
          userId: user.id,
          items: cart.map(item => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            price: item.price
          })),
          totalCredits,
          timestamp: Date.now(),
          vendorInfo: {
            name: 'EcoMart Central',
            address: '123 Green Street, Eco City',
            phone: '+1 (555) 123-4567'
          }
        }),
        issuedAt: new Date().toISOString(),
        vendorInfo: {
          name: 'EcoMart Central',
          address: '123 Green Street, Eco City',
          phone: '+1 (555) 123-4567'
        }
      };

      setSelectedVoucher(voucher);
      setUserCredits(prev => prev - totalCredits);
      setCart([]);
      setShowCart(false);
      toast.success('Purchase successful! Your voucher is ready.');

    } catch (error) {
      toast.error('Purchase failed. Please try again.');
    } finally {
      setIsPurchasing(false);
    }
  };

  const toggleFavorite = (productId: string) => {
    setProducts(prevProducts =>
      prevProducts.map(product =>
        product.id === productId
          ? { ...product, isFavorite: !product.isFavorite }
          : product
      )
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Carbon Credit Marketplace</h1>
          <p className="text-gray-600">Redeem your earned carbon credits for eco-friendly products</p>
        </div>
        
        {/* Cart Button */}
        <div className="flex items-center gap-4">
          {user && (
            <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-xl p-4 text-white">
              <div className="flex items-center gap-2">
                <Coins size={24} />
                <div>
                  <p className="text-sm opacity-90">Your Credits</p>
                  <p className="text-xl font-bold">{userCredits} CC</p>
                </div>
              </div>
            </div>
          )}
          
          <button
            onClick={() => setShowCart(true)}
            className="relative bg-white border-2 border-green-600 text-green-600 rounded-full p-3 hover:bg-green-50 transition-colors"
          >
            <ShoppingCart size={24} />
            {getTotalItems() > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                {getTotalItems()}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="mb-8 space-y-4">
        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-colors ${
                selectedCategory === category.id
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span>{category.icon}</span>
              {category.name}
            </button>
          ))}
        </div>

        {/* Sort Options */}
        <div className="flex items-center gap-4">
          <span className="text-gray-600 font-medium">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          >
            <option value="popular">Most Popular</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group"
          >
            <div className="relative">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              
              {/* Badges */}
              <div className="absolute top-3 left-3 flex flex-col gap-1">
                {product.isPopular && (
                  <span className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                    🔥 Popular
                  </span>
                )}
                {product.discount && (
                  <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                    -{product.discount}%
                  </span>
                )}
              </div>

              {/* Favorite Button */}
              <button
                onClick={() => toggleFavorite(product.id)}
                className="absolute top-3 right-3 p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
              >
                <Heart
                  size={16}
                  className={product.isFavorite ? 'text-red-500 fill-current' : 'text-gray-400'}
                />
              </button>

              {/* Stock Status */}
              <div className="absolute bottom-3 right-3 bg-white/90 rounded-full px-2 py-1">
                <span className={`text-xs font-medium ${
                  product.inStock > 10 ? 'text-green-600' : 
                  product.inStock > 0 ? 'text-orange-600' : 'text-red-600'
                }`}>
                  {product.inStock > 0 ? `${product.inStock} left` : 'Out of stock'}
                </span>
              </div>
            </div>

            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-1">
                {product.name}
              </h3>
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                {product.description}
              </p>
              
              {/* Rating */}
              <div className="flex items-center gap-1 mb-3">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className={i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  {product.rating} ({product.reviewCount})
                </span>
              </div>

              {/* Vendor */}
              <p className="text-xs text-gray-500 mb-3">by {product.vendor}</p>
              
              {/* Price */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-green-600 flex items-center gap-1">
                    <Coins size={16} />
                    {product.price} CC
                  </span>
                  {product.originalPrice && (
                    <span className="text-sm text-gray-400 line-through">
                      {product.originalPrice} CC
                    </span>
                  )}
                </div>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={() => addToCart(product)}
                disabled={!user || product.inStock === 0}
                className={`w-full py-2 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                  !user
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : product.inStock === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700 transform hover:scale-105'
                }`}
              >
                {!user ? (
                  'Login Required'
                ) : product.inStock === 0 ? (
                  'Out of Stock'
                ) : (
                  <>
                    <Plus size={16} />
                    Add to Cart
                  </>
                )}
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Shopping Cart Sidebar */}
      <AnimatePresence>
        {showCart && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setShowCart(false)}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col h-full">
                {/* Cart Header */}
                <div className="flex items-center justify-between p-6 border-b">
                  <h2 className="text-xl font-bold">Shopping Cart</h2>
                  <button
                    onClick={() => setShowCart(false)}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto p-6">
                  {cart.length === 0 ? (
                    <div className="text-center py-12">
                      <ShoppingCart className="mx-auto text-gray-400 mb-4" size={48} />
                      <p className="text-gray-600">Your cart is empty</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {cart.map((item) => (
                        <div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm">{item.name}</h4>
                            <p className="text-green-600 font-bold">{item.price} CC</p>
                            <div className="flex items-center gap-2 mt-2">
                              <button
                                onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                                className="p-1 hover:bg-gray-100 rounded"
                              >
                                <Minus size={14} />
                              </button>
                              <span className="px-2 py-1 bg-gray-100 rounded text-sm">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                                className="p-1 hover:bg-gray-100 rounded"
                                disabled={item.quantity >= item.inStock}
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Cart Footer */}
                {cart.length > 0 && (
                  <div className="border-t p-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-lg font-semibold">Total:</span>
                      <span className="text-xl font-bold text-green-600 flex items-center gap-1">
                        <Coins size={20} />
                        {getTotalCredits()} CC
                      </span>
                    </div>
                    
                    <button
                      onClick={handleCheckout}
                      disabled={isPurchasing || userCredits < getTotalCredits()}
                      className={`w-full py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                        isPurchasing || userCredits < getTotalCredits()
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                    >
                      {isPurchasing ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Processing...
                        </>
                      ) : userCredits < getTotalCredits() ? (
                        'Insufficient Credits'
                      ) : (
                        <>
                          <QrCode size={16} />
                          Checkout & Get QR
                        </>
                      )}
                    </button>
                    
                    {userCredits < getTotalCredits() && (
                      <p className="text-red-500 text-sm mt-2 text-center">
                        You need {getTotalCredits() - userCredits} more credits
                      </p>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Voucher Modal */}
      {selectedVoucher && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedVoucher(null)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="bg-white rounded-xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="text-green-600" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Purchase Successful!</h3>
              <p className="text-gray-600">Show this QR code at the store to collect your items</p>
            </div>

            {/* QR Code */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <div className="text-center mb-4">
                <QRCode value={selectedVoucher.qrCode} size={200} />
              </div>
              <div className="text-center">
                <p className="font-mono text-xs text-gray-500 mb-2">Voucher ID: {selectedVoucher.id}</p>
                <p className="text-sm text-gray-600">Valid for 30 days</p>
              </div>
            </div>

            {/* Purchase Summary */}
            <div className="space-y-3 mb-6">
              <h4 className="font-semibold text-gray-800">Items Purchased:</h4>
              {selectedVoucher.items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>{item.name} x{item.quantity}</span>
                  <span className="font-semibold">{item.price * item.quantity} CC</span>
                </div>
              ))}
              <div className="border-t pt-2 flex justify-between font-bold">
                <span>Total:</span>
                <span className="text-green-600">{selectedVoucher.totalCredits} CC</span>
              </div>
            </div>

            {/* Vendor Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-blue-800 mb-2">Pickup Location:</h4>
              <p className="text-blue-700 text-sm">
                <strong>{selectedVoucher.vendorInfo.name}</strong><br />
                {selectedVoucher.vendorInfo.address}<br />
                📞 {selectedVoucher.vendorInfo.phone}
              </p>
            </div>

            {/* Instructions */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-yellow-800 mb-2">How to Redeem:</h4>
              <ol className="text-yellow-700 text-sm space-y-1">
                <li>1. Visit the pickup location above</li>
                <li>2. Show this QR code to the shopkeeper</li>
                <li>3. They will scan it to verify your purchase</li>
                <li>4. Collect your eco-friendly products!</li>
              </ol>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setSelectedVoucher(null)}
                className="flex-1 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  // In real app, this would save/share the QR code
                  toast.success('Voucher saved to your account!');
                }}
                className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <Package size={16} />
                Save Voucher
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default CreditMarketplace;