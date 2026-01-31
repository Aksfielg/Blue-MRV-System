import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Leaf, Shield, Coins } from 'lucide-react';

const Hero: React.FC = () => {
  const [isAnimating, setIsAnimating] = useState(true);

  const steps = [
    { id: 1, title: "Plant & Record", icon: Leaf, color: "bg-green-500", description: "Communities plant mangroves and record data via mobile app" },
    { id: 2, title: "Verify & Validate", icon: Shield, color: "bg-blue-500", description: "AI + Drone verification ensures authenticity" },
    { id: 3, title: "Earn Credits", icon: Coins, color: "bg-yellow-500", description: "Verified restoration generates tokenized carbon credits" },
    { id: 4, title: "Redeem Rewards", icon: ArrowRight, color: "bg-purple-500", description: "Use credits for organic fertilizers and farming supplies" }
  ];

  return (
    <section className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-green-50 flex items-center justify-center px-4 py-20">
      <div className="max-w-7xl mx-auto text-center">
        {/* Main Title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-12"
        >
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-teal-600 via-blue-600 to-green-600 bg-clip-text text-transparent mb-6">
            BlueMRV
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 mb-4">
            Blockchain-Powered Blue Carbon Restoration
          </p>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
            Empowering coastal communities to restore marine ecosystems while earning verifiable carbon credits 
            they can use for essential supplies
          </p>
        </motion.div>

        {/* Visual Flow Animation */}
        <div className="relative mb-16">
          {/* Flow Steps */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {steps.map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ 
                  opacity: 1, 
                  scale: isAnimating ? [0.8, 1.1, 1] : 1,
                }}
                transition={{
                  duration: 1.5,
                  delay: index * 0.5,
                  repeat: isAnimating ? Infinity : 0,
                  repeatDelay: 2
                }}
                className="relative"
              >
                {/* Connection Line */}
                {index < steps.length - 1 && (
                  <motion.div
                    className="hidden md:block absolute top-1/2 left-full w-8 h-0.5 bg-gradient-to-r from-teal-400 to-blue-400 transform -translate-y-1/2"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: isAnimating ? 1 : 1 }}
                    transition={{ delay: (index + 1) * 0.5, duration: 0.8 }}
                  />
                )}

                {/* Step Card */}
                <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                  <div className={`${step.color} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <step.icon className="text-white" size={24} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-600">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Link 
            to="/upload"
            className="px-8 py-4 bg-teal-600 text-white rounded-full text-lg font-semibold hover:bg-teal-700 transform hover:scale-105 transition-all shadow-lg inline-block text-center"
          >
            Upload Your Trees
          </Link>
          <Link 
            to="/marketplace"
            className="px-8 py-4 border-2 border-teal-600 text-teal-600 rounded-full text-lg font-semibold hover:bg-teal-50 transform hover:scale-105 transition-all inline-block text-center"
          >
            Browse Marketplace
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;