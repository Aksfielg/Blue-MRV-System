import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, Leaf, DollarSign } from 'lucide-react';

const Impact: React.FC = () => {
  const stats = [
    {
      icon: Leaf,
      value: "50,000+",
      label: "Hectares Restored",
      description: "Mangroves and seagrass ecosystems brought back to life",
      color: "text-green-500"
    },
    {
      icon: Users,
      value: "10,000+",
      label: "Community Members",
      description: "Coastal communities empowered through our platform",
      color: "text-blue-500"
    },
    {
      icon: TrendingUp,
      value: "200,000",
      label: "Carbon Credits Generated",
      description: "Tons of CO₂ equivalent sequestered and verified",
      color: "text-purple-500"
    },
    {
      icon: DollarSign,
      value: "₹2 Crore",
      label: "Community Earnings",
      description: "Direct economic benefits to coastal communities",
      color: "text-orange-500"
    }
  ];

  const impacts = [
    {
      title: "Environmental Impact",
      items: [
        "Enhanced coastal protection from storms and erosion",
        "Improved marine biodiversity and fish populations",
        "Significant carbon sequestration in blue carbon ecosystems",
        "Cleaner water quality in coastal areas"
      ],
      color: "bg-green-50 border-green-200"
    },
    {
      title: "Social Impact",
      items: [
        "Sustainable livelihoods for fishing communities",
        "Capacity building in digital technology and MRV",
        "Strengthened community organization and collaboration",
        "Preservation of traditional ecological knowledge"
      ],
      color: "bg-blue-50 border-blue-200"
    },
    {
      title: "Economic Impact",
      items: [
        "Direct income from carbon credit sales",
        "Reduced costs through credit-based supply purchases",
        "Enhanced property values in restored coastal areas",
        "New employment opportunities in restoration sector"
      ],
      color: "bg-purple-50 border-purple-200"
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
            Transforming Impact
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            BlueMRV is creating measurable change across environmental, social, and economic dimensions
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="text-center bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 ${stat.color} mb-4`}>
                <stat.icon size={32} />
              </div>
              <div className="text-3xl font-bold text-gray-800 mb-2">
                {stat.value}
              </div>
              <div className="text-lg font-semibold text-gray-700 mb-2">
                {stat.label}
              </div>
              <p className="text-sm text-gray-600">
                {stat.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Impact Categories */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {impacts.map((impact, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
              className={`${impact.color} rounded-xl p-8 border-2`}
            >
              <h3 className="text-xl font-bold text-gray-800 mb-6">
                {impact.title}
              </h3>
              <ul className="space-y-3">
                {impact.items.map((item, itemIndex) => (
                  <motion.li
                    key={itemIndex}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: (index * 0.2) + (itemIndex * 0.1) }}
                    viewport={{ once: true }}
                    className="flex items-start gap-3 text-gray-700"
                  >
                    <div className="w-2 h-2 bg-teal-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>{item}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Impact;