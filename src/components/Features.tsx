import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Shield, Globe, Smartphone, BarChart3, Coins, Users, Leaf } from 'lucide-react';

const Features: React.FC = () => {
  const features = [
    {
      icon: Zap,
      title: "Instant Verification",
      description: "AI-powered analysis provides rapid verification of restoration efforts",
      stat: "< 24 hours",
      color: "from-yellow-400 to-orange-500"
    },
    {
      icon: Shield,
      title: "Tamper-Proof Records",
      description: "Blockchain technology ensures all data is immutable and verifiable",
      stat: "100% Secure",
      color: "from-blue-400 to-blue-600"
    },
    {
      icon: Globe,
      title: "Global Standards",
      description: "Aligned with international carbon accounting and MRV methodologies",
      stat: "IPCC Compliant",
      color: "from-green-400 to-teal-500"
    },
    {
      icon: Smartphone,
      title: "Mobile-First Design",
      description: "Intuitive mobile app works offline in remote coastal areas",
      stat: "Offline Ready",
      color: "from-purple-400 to-pink-500"
    },
    {
      icon: BarChart3,
      title: "Real-Time Analytics",
      description: "Comprehensive dashboards for monitoring progress and impact",
      stat: "Live Data",
      color: "from-indigo-400 to-purple-600"
    },
    {
      icon: Coins,
      title: "Tokenized Credits",
      description: "ERC-1155 tokens represent verifiable carbon credits",
      stat: "1:1 tCO₂e",
      color: "from-amber-400 to-yellow-600"
    },
    {
      icon: Users,
      title: "Community Focused",
      description: "Designed for NGOs, panchayats, and coastal communities",
      stat: "Multi-Stakeholder",
      color: "from-teal-400 to-cyan-500"
    },
    {
      icon: Leaf,
      title: "Ecosystem Impact",
      description: "Track biodiversity and ecosystem health improvements",
      stat: "Multi-Benefit",
      color: "from-emerald-400 to-green-600"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
            Platform Features
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Built with cutting-edge technology to ensure reliability, transparency, and user-friendliness
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
              className="group relative overflow-hidden bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-100 hover:border-teal-200 hover:shadow-xl transition-all"
            >
              {/* Gradient Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity`} />
              
              {/* Content */}
              <div className="relative z-10">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br ${feature.color} text-white mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon size={20} />
                </div>
                
                <h3 className="text-lg font-semibold text-gray-800 mb-2 group-hover:text-teal-700 transition-colors">
                  {feature.title}
                </h3>
                
                <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                  {feature.description}
                </p>
                
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-white bg-gradient-to-r ${feature.color}`}>
                  {feature.stat}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;