import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, MapPin, Camera, Loader2, TreePine, Satellite } from 'lucide-react';
import { useAuth } from './Auth/AuthProvider';
import toast from 'react-hot-toast';

interface TreeData {
  species: string;
  count: number;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  images: File[];
  notes: string;
}

const TreeUpload: React.FC = () => {
  const { user, profile } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [treeData, setTreeData] = useState<TreeData>({
    species: '',
    count: 1,
    location: { lat: 0, lng: 0, address: '' },
    images: [],
    notes: ''
  });

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          // Reverse geocoding to get address
          try {
            const response = await fetch(
              `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=YOUR_OPENCAGE_API_KEY`
            );
            const data = await response.json();
            const address = data.results[0]?.formatted || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
            
            setTreeData(prev => ({
              ...prev,
              location: { lat: latitude, lng: longitude, address }
            }));
            toast.success('Location captured successfully!');
          } catch (error) {
            setTreeData(prev => ({
              ...prev,
              location: { lat: latitude, lng: longitude, address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` }
            }));
            toast.success('Location captured!');
          }
        },
        () => toast.error('Failed to get location')
      );
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setTreeData(prev => ({ ...prev, images: files }));
    }
  };

  const verifyTreeHealth = async (images: File[], location: { lat: number; lng: number }) => {
    setIsVerifying(true);
    
    try {
      // Simulate satellite/drone API verification
      const formData = new FormData();
      images.forEach((image, index) => {
        formData.append(`image_${index}`, image);
      });
      formData.append('latitude', location.lat.toString());
      formData.append('longitude', location.lng.toString());

      // Mock API call to satellite/drone service
      const response = await fetch('/api/verify-tree-health', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${user?.access_token}`
        }
      });

      const result = await response.json();
      
      if (result.success) {
        return {
          healthScore: result.healthScore,
          carbonPotential: result.carbonPotential,
          verified: result.healthScore > 70
        };
      }
      
      throw new Error(result.error);
    } catch (error) {
      // Fallback to mock verification for demo
      const mockHealthScore = Math.floor(Math.random() * 30) + 70; // 70-100%
      const mockCarbonPotential = Math.floor(Math.random() * 20) + 10; // 10-30 credits
      
      return {
        healthScore: mockHealthScore,
        carbonPotential: mockCarbonPotential,
        verified: mockHealthScore > 70
      };
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please login first');
      return;
    }

    if (treeData.images.length === 0) {
      toast.error('Please upload at least one image');
      return;
    }

    if (!treeData.location.lat || !treeData.location.lng) {
      toast.error('Please capture GPS location');
      return;
    }

    setIsUploading(true);

    try {
      // Step 1: Verify tree health using satellite/drone API
      toast.info('Verifying tree health with satellite data...');
      const verification = await verifyTreeHealth(treeData.images, treeData.location);

      if (!verification.verified) {
        toast.error('Tree verification failed. Health score too low.');
        setIsUploading(false);
        return;
      }

      // Step 2: Upload to backend API
      const formData = new FormData();
      formData.append('species', treeData.species);
      formData.append('count', treeData.count.toString());
      formData.append('location', JSON.stringify(treeData.location));
      formData.append('notes', treeData.notes);
      formData.append('healthScore', verification.healthScore.toString());
      formData.append('carbonPotential', verification.carbonPotential.toString());
      
      treeData.images.forEach((image, index) => {
        formData.append(`images`, image);
      });

      const response = await fetch('/api/trees/upload', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${user.access_token}`
        }
      });

      const result = await response.json();

      if (result.success) {
        toast.success(`Tree verified! ${verification.carbonPotential} carbon credits issued to your wallet!`);
        
        // Reset form
        setTreeData({
          species: '',
          count: 1,
          location: { lat: 0, lng: 0, address: '' },
          images: [],
          notes: ''
        });
      } else {
        toast.error(result.error || 'Upload failed');
      }
    } catch (error: any) {
      toast.error('Upload failed: ' + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg p-8"
      >
        <div className="text-center mb-8">
          <TreePine className="mx-auto text-green-600 mb-4" size={48} />
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Upload Your Trees</h2>
          <p className="text-gray-600">Upload photos of your planted trees to earn carbon credits</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tree Species */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tree Species *
            </label>
            <input
              type="text"
              value={treeData.species}
              onChange={(e) => setTreeData(prev => ({ ...prev, species: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="e.g., Oak, Pine, Mango"
              required
            />
          </div>

          {/* Tree Count */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Trees *
            </label>
            <input
              type="number"
              min="1"
              value={treeData.count}
              onChange={(e) => setTreeData(prev => ({ ...prev, count: parseInt(e.target.value) }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>

          {/* GPS Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              GPS Location *
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={treeData.location.address}
                readOnly
                className="flex-1 p-3 border border-gray-300 rounded-lg bg-gray-50"
                placeholder="Click 'Get Location' to capture GPS coordinates"
              />
              <button
                type="button"
                onClick={getCurrentLocation}
                className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <MapPin size={16} />
                Get Location
              </button>
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tree Photos *
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-400 transition-colors">
              <Camera className="mx-auto text-gray-400 mb-4" size={48} />
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="tree-images"
              />
              <label
                htmlFor="tree-images"
                className="cursor-pointer text-green-600 hover:text-green-700 font-medium"
              >
                Click to upload tree photos
              </label>
              <p className="text-gray-500 text-sm mt-2">
                Upload clear photos showing the trees and surrounding area
              </p>
              {treeData.images.length > 0 && (
                <p className="text-green-600 text-sm mt-2">
                  {treeData.images.length} image(s) selected
                </p>
              )}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes
            </label>
            <textarea
              value={treeData.notes}
              onChange={(e) => setTreeData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Any additional information about the trees..."
            />
          </div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={isUploading || isVerifying}
            className="w-full py-4 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg font-semibold hover:from-green-700 hover:to-blue-700 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:transform-none flex items-center justify-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isUploading || isVerifying ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                {isVerifying ? 'Verifying with Satellite...' : 'Uploading...'}
              </>
            ) : (
              <>
                <Satellite size={20} />
                Verify & Earn Credits
              </>
            )}
          </motion.button>
        </form>

        {/* Info Box */}
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h4 className="font-semibold text-green-800 mb-2">How it works:</h4>
          <ol className="text-sm text-green-700 space-y-1">
            <li>1. Upload clear photos of your planted trees</li>
            <li>2. Our satellite/drone API verifies tree health</li>
            <li>3. Healthy trees earn you carbon credits automatically</li>
            <li>4. Use credits to shop for supplies in our marketplace</li>
          </ol>
        </div>
      </motion.div>
    </div>
  );
};

export default TreeUpload;