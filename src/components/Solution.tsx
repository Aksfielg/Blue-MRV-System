import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Smartphone, Zap, ShoppingCart, BarChart3, Globe } from 'lucide-react';

const Solution: React.FC = () => {
  const features = [
    {
      icon: Smartphone,
      title: "Mobile Data Collection",
      description: "Intuitive app for field workers to record plantation data, GPS coordinates, and upload photos/videos",
      color: "bg-blue-500"
    },
    {
      icon: Shield,
      title: "Blockchain Registry",
      description: "Immutable ledger ensuring all restoration data is transparent, verifiable, and tamper-proof",
      color: "bg-green-500"
    },
    {
      icon: Zap,
      title: "Smart Verification",
      description: "AI-powered drone analysis combined with human verification for accurate MRV",
      color: "bg-purple-500"
    },
    {
      icon: ShoppingCart,
      title: "Credit Marketplace",
      description: "Use earned carbon credits to purchase organic fertilizers, seeds, and farming supplies",
      color: "bg-orange-500"
    },
    {
      icon: BarChart3,
      title: "Admin Dashboard",
      description: "Comprehensive monitoring tools for NCCR to track national blue carbon progress",
      color: "bg-teal-500"
    },
    {
      icon: Globe,
      title: "Community Access",
      description: "Easy onboarding for NGOs, coastal panchayats, and local communities",
      color: "bg-indigo-500"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
            Our Solution
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            A comprehensive blockchain-powered platform that makes blue carbon restoration 
            transparent, rewarding, and immediately beneficial for communities
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all hover:-translate-y-2"
            >
              <div className={`${feature.color} w-14 h-14 rounded-lg flex items-center justify-center mb-6`}>
                <feature.icon className="text-white" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Solution;