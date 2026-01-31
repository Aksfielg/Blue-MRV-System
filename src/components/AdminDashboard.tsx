import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, BarChart3, CheckCircle, XCircle, Clock, TrendingUp, Leaf, Coins, MapPin, Upload } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import { supabase, Plot, getPlots } from '../lib/supabase';
import { verifyPlantation } from '../lib/api';
import toast from 'react-hot-toast';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [plots, setPlots] = useState<Plot[]>([]);
  const [selectedPlot, setSelectedPlot] = useState<Plot | null>(null);
  const [verificationData, setVerificationData] = useState({
    survival_rate: '',
    estimated_co2: '',
    notes: ''
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const plotData = await getPlots();
      setPlots(plotData || []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerification = async (plotId: string, action: 'verified' | 'rejected') => {
    try {
      const result = await verifyPlantation(plotId, {
        survival_rate: parseInt(verificationData.survival_rate),
        estimated_co2: parseFloat(verificationData.estimated_co2),
        verifier_notes: verificationData.notes
      });

      if (result.success) {
        toast.success(`Plot ${action} successfully!`);
        setSelectedPlot(null);
        setVerificationData({ survival_rate: '', estimated_co2: '', notes: '' });
        loadDashboardData();
      } else {
        toast.error(result.error || 'Verification failed');
      }
    } catch (error: any) {
      toast.error('Network error during verification');
    }
  };

  // Mock data for charts
  const monthlyData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Plots Verified',
        data: [12, 19, 25, 32, 45, 38],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1
      },
      {
        label: 'Credits Issued',
        data: [120, 190, 250, 320, 450, 380],
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 1
      }
    ]
  };

  const ecosystemData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Mangroves',
        data: [8, 12, 15, 20, 28, 25],
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        tension: 0.4
      },
      {
        label: 'Seagrass',
        data: [3, 5, 7, 8, 12, 10],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        tension: 0.4
      },
      {
        label: 'Salt Marsh',
        data: [1, 2, 3, 4, 5, 3],
        borderColor: 'rgb(139, 92, 246)',
        backgroundColor: 'rgba(139, 92, 246, 0.2)',
        tension: 0.4
      }
    ]
  };

  const stats = [
    { label: 'Total Plots', value: plots.length.toString(), icon: Leaf, color: 'text-green-600', change: '+12%' },
    { label: 'Verified Plots', value: plots.filter(p => p.status === 'verified').length.toString(), icon: CheckCircle, color: 'text-blue-600', change: '+8%' },
    { label: 'Pending Review', value: plots.filter(p => p.status === 'pending_verification').length.toString(), icon: Clock, color: 'text-yellow-600', change: '+3%' },
    { label: 'Credits Issued', value: '2,847', icon: Coins, color: 'text-purple-600', change: '+25%' }
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'verification', label: 'Verification Queue', icon: CheckCircle },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'users', label: 'User Management', icon: Users }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white p-6 rounded-lg shadow-lg"
              >
                <h3 className="text-lg font-semibold mb-4">Monthly Progress</h3>
                <Bar data={monthlyData} options={{ responsive: true, maintainAspectRatio: false }} height={200} />
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white p-6 rounded-lg shadow-lg"
              >
                <h3 className="text-lg font-semibold mb-4">Ecosystem Trends</h3>
                <Line data={ecosystemData} options={{ responsive: true, maintainAspectRatio: false }} height={200} />
              </motion.div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="text-green-600" size={20} />
                    <div>
                      <p className="font-semibold">Plot Verified</p>
                      <p className="text-sm text-gray-600">Sundarbans Mangrove Project</p>
                    </div>
                  </div>
                  <span className="text-green-600 font-semibold">+25 BCC issued</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Upload className="text-blue-600" size={20} />
                    <div>
                      <p className="font-semibold">New Plot Submitted</p>
                      <p className="text-sm text-gray-600">Kerala Seagrass Restoration</p>
                    </div>
                  </div>
                  <span className="text-blue-600 font-semibold">Pending Review</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'verification':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Pending Verification</h3>
              {plots.filter(p => p.status === 'pending_verification').map((plot) => (
                <motion.div
                  key={plot.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-lg shadow-lg p-4 cursor-pointer hover:shadow-xl transition-shadow"
                  onClick={() => setSelectedPlot(plot)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-800">{plot.project_name}</h4>
                      <p className="text-sm text-gray-600">{plot.profiles?.full_name}</p>
                    </div>
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                      Pending
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Leaf size={14} />
                      <span>{plot.ecosystem_type}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin size={14} />
                      <span>{(plot.area_sqm / 10000).toFixed(2)} ha</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div>
              {selectedPlot ? (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white rounded-lg shadow-lg p-6 sticky top-4"
                >
                  <h3 className="text-lg font-semibold mb-4">Verify Plot</h3>
                  
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Evidence Photos</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedPlot.image_urls.map((url, index) => (
                        <img
                          key={index}
                          src={url}
                          alt={`Evidence ${index + 1}`}
                          className="w-full h-20 object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3 mb-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Project:</span>
                      <span className="font-medium">{selectedPlot.project_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Area:</span>
                      <span className="font-medium">{(selectedPlot.area_sqm / 10000).toFixed(2)} hectares</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className="font-medium capitalize">{selectedPlot.ecosystem_type}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Survival Rate (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={verificationData.survival_rate}
                        onChange={(e) => setVerificationData(prev => ({ ...prev, survival_rate: e.target.value }))}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-teal-500"
                        placeholder="85"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Estimated CO₂ (tCO₂e)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={verificationData.estimated_co2}
                        onChange={(e) => setVerificationData(prev => ({ ...prev, estimated_co2: e.target.value }))}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-teal-500"
                        placeholder="12.5"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Verification Notes
                      </label>
                      <textarea
                        value={verificationData.notes}
                        onChange={(e) => setVerificationData(prev => ({ ...prev, notes: e.target.value }))}
                        rows={3}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-teal-500"
                        placeholder="Verification observations..."
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleVerification(selectedPlot.id, 'verified')}
                        className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <CheckCircle size={16} />
                        Approve & Mint Credits
                      </button>
                      <button
                        onClick={() => handleVerification(selectedPlot.id, 'rejected')}
                        className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <XCircle size={16} />
                        Reject
                      </button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="bg-white rounded-lg shadow-lg p-6 text-center">
                  <Clock className="mx-auto text-gray-400 mb-4" size={48} />
                  <p className="text-gray-600">Select a plot to review verification details</p>
                </div>
              )}
            </div>
          </div>
        );

      case 'analytics':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-lg font-semibold mb-4">Ecosystem Distribution</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Mangroves</span>
                    <span className="font-semibold text-green-600">65%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                  </div>
                </div>
                <div className="space-y-3 mt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Seagrass</span>
                    <span className="font-semibold text-blue-600">25%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '25%' }}></div>
                  </div>
                </div>
                <div className="space-y-3 mt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Salt Marsh</span>
                    <span className="font-semibold text-purple-600">10%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: '10%' }}></div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-lg font-semibold mb-4">Regional Impact</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">West Bengal</span>
                    <span className="font-semibold">156 plots</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Tamil Nadu</span>
                    <span className="font-semibold">89 plots</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Kerala</span>
                    <span className="font-semibold">67 plots</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Gujarat</span>
                    <span className="font-semibold">43 plots</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-lg font-semibold mb-4">Credit Utilization</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Issued</span>
                    <span className="font-semibold text-green-600">2,847 BCC</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Redeemed</span>
                    <span className="font-semibold text-blue-600">1,234 BCC</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Available</span>
                    <span className="font-semibold text-purple-600">1,613 BCC</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'users':
        return (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">User Management</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Users className="text-green-600" size={20} />
                  </div>
                  <div>
                    <p className="font-semibold">Coastal Development NGO</p>
                    <p className="text-sm text-gray-600">Community • 15 plots submitted</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full">Active</span>
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="text-blue-600" size={20} />
                  </div>
                  <div>
                    <p className="font-semibold">Sundarbans Panchayat</p>
                    <p className="text-sm text-gray-600">Government • 8 plots submitted</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Active</span>
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <Users className="text-purple-600" size={20} />
                  </div>
                  <div>
                    <p className="font-semibold">Organic Supplies Co.</p>
                    <p className="text-sm text-gray-600">Vendor • 12 products listed</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">Vendor</span>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

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
        <h1 className="text-3xl font-bold text-gray-800 mb-2">NCCR Admin Dashboard</h1>
        <p className="text-gray-600">Monitor and manage India's blue carbon restoration projects</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
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
                <p className={`text-sm ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.change} this month
                </p>
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

export default AdminDashboard;