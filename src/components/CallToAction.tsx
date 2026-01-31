import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Mail, Phone, MapPin } from 'lucide-react';

const CallToAction: React.FC = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-teal-600 via-blue-700 to-purple-700 text-white">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Ready to Transform Blue Carbon?
          </h2>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
            Join the revolution in coastal ecosystem restoration. Start your blue carbon project today 
            and earn verifiable credits that make a real difference.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* CTA Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-teal-400 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white font-bold">1</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Start Your Project</h3>
                  <p className="text-blue-100">Register your coastal restoration initiative and begin data collection</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-blue-400 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white font-bold">2</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Verify & Earn</h3>
                  <p className="text-blue-100">Get your restoration verified and earn tokenized carbon credits</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-purple-400 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white font-bold">3</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Redeem & Grow</h3>
                  <p className="text-blue-100">Use credits for supplies, tools, and continued restoration efforts</p>
                </div>
              </div>
            </div>

            <motion.div
              className="flex flex-col sm:flex-row gap-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <button className="px-8 py-4 bg-white text-teal-600 rounded-full text-lg font-semibold hover:bg-gray-100 transform hover:scale-105 transition-all shadow-lg flex items-center justify-center gap-2">
                Launch Your Project
                <ArrowRight size={20} />
              </button>
              <button className="px-8 py-4 border-2 border-white/30 text-white rounded-full text-lg font-semibold hover:bg-white/10 transform hover:scale-105 transition-all backdrop-blur-sm">
                Schedule Demo
              </button>
            </motion.div>
          </motion.div>

          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 space-y-6"
          >
            <h3 className="text-2xl font-bold mb-6">Get Started Today</h3>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-teal-400 rounded-lg flex items-center justify-center">
                  <Mail size={20} />
                </div>
                <div>
                  <p className="font-semibold">Email Us</p>
                  <p className="text-blue-100">hello@bluemrv.org</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-400 rounded-lg flex items-center justify-center">
                  <Phone size={20} />
                </div>
                <div>
                  <p className="font-semibold">Call Us</p>
                  <p className="text-blue-100">+91 98765 43210</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-purple-400 rounded-lg flex items-center justify-center">
                  <MapPin size={20} />
                </div>
                <div>
                  <p className="font-semibold">Visit Us</p>
                  <p className="text-blue-100">NCCR Chennai, Tamil Nadu</p>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-white/20">
              <p className="text-sm text-blue-100">
                Partner with government agencies, NGOs, and coastal communities 
                to scale blue carbon restoration across India's coastline.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;