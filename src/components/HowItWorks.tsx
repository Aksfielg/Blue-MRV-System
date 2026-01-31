import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Satellite, Coins, ShoppingBag, ChevronLeft, ChevronRight } from 'lucide-react';

const HowItWorks: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      id: 1,
      title: "Data Collection",
      icon: Camera,
      color: "bg-green-500",
      description: "Communities and NGOs use our mobile app to record plantation efforts",
      details: [
        "GPS-tagged location recording",
        "High-resolution photos and videos",
        "Species and quantity documentation",
        "Offline-first for remote areas"
      ],
      visual: "🌱📱"
    },
    {
      id: 2,
      title: "Blockchain Storage",
      icon: Satellite,
      color: "bg-blue-500",
      description: "All data is immutably stored on blockchain with IPFS for media",
      details: [
        "Tamper-proof data storage",
        "IPFS for decentralized media",
        "Smart contract automation",
        "Transparent audit trail"
      ],
      visual: "🔒⛓️"
    },
    {
      id: 3,
      title: "AI Verification",
      icon: Satellite,
      color: "bg-purple-500",
      description: "Drone imagery and AI analyze survival rates and carbon sequestration",
      details: [
        "NDVI analysis for plant health",
        "Automated survival rate calculation",
        "Biomass estimation algorithms",
        "Human oversight validation"
      ],
      visual: "🤖🛰️"
    },
    {
      id: 4,
      title: "Credit Generation",
      icon: Coins,
      color: "bg-yellow-500",
      description: "Verified restoration automatically generates tokenized carbon credits",
      details: [
        "ERC-1155 carbon credit tokens",
        "Automated smart contract minting",
        "Real-time credit calculation",
        "Transparent issuance records"
      ],
      visual: "💰🪙"
    },
    {
      id: 5,
      title: "Marketplace Redemption",
      icon: ShoppingBag,
      color: "bg-orange-500",
      description: "Communities use credits to purchase essential supplies and equipment",
      details: [
        "Organic fertilizers and seeds",
        "Fishing nets and equipment",
        "Solar lamps and tools",
        "Government-verified vendors"
      ],
      visual: "🛒🌾"
    }
  ];

  const nextStep = () => {
    setActiveStep((prev) => (prev + 1) % steps.length);
  };

  const prevStep = () => {
    setActiveStep((prev) => (prev - 1 + steps.length) % steps.length);
  };

  return (
    <section className="py-20 bg-gradient-to-br from-teal-900 via-blue-900 to-purple-900 text-white">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            How BlueMRV Works
          </h2>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            A seamless flow from restoration to reward, powered by blockchain technology
          </p>
        </motion.div>

        {/* Interactive Step Display */}
        <div className="relative">
          {/* Step Navigation */}
          <div className="flex justify-center mb-12">
            <div className="flex items-center gap-4 bg-white/10 rounded-full p-2 backdrop-blur-sm">
              {steps.map((step, index) => (
                <button
                  key={step.id}
                  onClick={() => setActiveStep(index)}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                    index === activeStep
                      ? step.color + ' text-white scale-110'
                      : 'bg-white/20 text-white/60 hover:bg-white/30'
                  }`}
                >
                  <step.icon size={20} />
                </button>
              ))}
            </div>
          </div>

          {/* Step Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
            >
              {/* Content */}
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  {(() => {
                    const IconComponent = steps[activeStep].icon;
                    return (
                  <div className={`${steps[activeStep].color} w-16 h-16 rounded-full flex items-center justify-center`}>
                    <IconComponent size={28} />
                  </div>
                    );
                  })()}
                  <div>
                    <h3 className="text-2xl font-bold">Step {activeStep + 1}</h3>
                    <p className="text-blue-100">{steps[activeStep].title}</p>
                  </div>
                </div>

                <p className="text-lg text-blue-50">
                  {steps[activeStep].description}
                </p>

                <ul className="space-y-2">
                  {steps[activeStep].details.map((detail, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-3 text-blue-100"
                    >
                      <div className="w-2 h-2 bg-teal-400 rounded-full"></div>
                      {detail}
                    </motion.li>
                  ))}
                </ul>
              </div>

              {/* Visual */}
              <div className="relative">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.6 }}
                  className="bg-white/10 rounded-2xl p-12 text-center backdrop-blur-sm"
                >
                  <div className="text-6xl mb-4">
                    {steps[activeStep].visual}
                  </div>
                  <div className="text-xl font-semibold">
                    {steps[activeStep].title}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Arrows */}
          <div className="flex justify-between items-center mt-12">
            <button
              onClick={prevStep}
              className="flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 rounded-full transition-colors backdrop-blur-sm"
            >
              <ChevronLeft size={20} />
              Previous
            </button>
            <div className="flex gap-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === activeStep ? 'bg-teal-400 w-8' : 'bg-white/30'
                  }`}
                />
              ))}
            </div>
            <button
              onClick={nextStep}
              className="flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 rounded-full transition-colors backdrop-blur-sm"
            >
              Next
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;