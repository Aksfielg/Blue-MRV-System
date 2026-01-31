import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, FileX, DollarSign, Users } from 'lucide-react';

const Problem: React.FC = () => {
  const problems = [
    {
      icon: AlertTriangle,
      title: "No Transparent MRV System",
      description: "India lacks a decentralized system to monitor and verify blue carbon restoration efforts",
      color: "text-red-500"
    },
    {
      icon: FileX,
      title: "Data Manipulation Risks",
      description: "Traditional systems are vulnerable to fraud and data tampering, reducing trust",
      color: "text-orange-500"
    },
    {
      icon: DollarSign,
      title: "Delayed Rewards",
      description: "Communities wait months/years to receive benefits from their restoration work",
      color: "text-yellow-500"
    },
    {
      icon: Users,
      title: "Limited Accessibility",
      description: "Coastal communities and NGOs lack access to carbon credit markets",
      color: "text-purple-500"
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
            The Challenge
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Blue carbon ecosystems are crucial for climate action, but current monitoring 
            and reward systems are broken
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {problems.map((problem, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow"
            >
              <div className="mb-4">
                <problem.icon className={`${problem.color} mb-3`} size={40} />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {problem.title}
                </h3>
              </div>
              <p className="text-gray-600">
                {problem.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Problem;