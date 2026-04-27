import React from 'react';
import { motion } from 'motion/react';
import { Lightbulb, Shield, Thermometer, Music, Smartphone, Zap } from 'lucide-react';

export default function Solutions() {
  const solutions = [
    { title: 'Smart Lighting', icon: Lightbulb, desc: 'Automate your lighting based on mood, time, or presence.' },
    { title: 'Intelligent Security', icon: Shield, desc: 'Advanced surveillance and biometric access for total peace of mind.' },
    { title: 'Climate Control', icon: Thermometer, desc: 'Precise temperature management that adapts to your environment.' },
    { title: 'Home Entertainment', icon: Music, desc: 'Seamlessly integrate audio and visual across every room.' },
    { title: 'Remote Access', icon: Smartphone, desc: 'Control your entire home from anywhere in the world.' },
    { title: 'Energy Efficiency', icon: Zap, desc: 'Monitor and optimize energy consumption automatically.' },
  ];

  return (
    <section id="solutions" className="py-32 px-10 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="mb-20">
          <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-gray-400 mb-4">Integrated Expertice</h2>
          <p className="text-4xl font-bold tracking-tight text-black max-w-xl">
            Intelligent components for a unified living experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {solutions.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.05 }}
              className="bg-[#f5f5f7] p-10 rounded-[32px] flex flex-col items-start group transition-all hover:bg-white hover:shadow-xl hover:shadow-black/5"
            >
              <div className="p-3 bg-white rounded-xl mb-6 shadow-sm ring-1 ring-black/5 group-hover:scale-110 transition-transform">
                <item.icon className="w-6 h-6 text-black" />
              </div>
              <h3 className="text-xl font-bold tracking-tight mb-3">{item.title}</h3>
              <p className="text-gray-500 text-sm font-medium leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
