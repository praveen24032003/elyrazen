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
    <section id="solutions" className="py-24 px-2 sm:px-0">
      <div className="max-w-7xl mx-auto">
        <div className="mb-14">
          <h2 className="text-sm font-bold uppercase tracking-[0.2em] gold-text mb-4">Integrated Expertise</h2>
          <p className="text-3xl sm:text-4xl font-bold tracking-tight text-black max-w-2xl">
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
              className="bg-white p-8 rounded-[28px] border border-gray-200 flex flex-col items-start group transition-all hover:border-[#d4af37] hover:-translate-y-0.5 shadow-sm"
            >
              <div className="p-3 bg-[#faf8ef] border gold-border rounded-xl mb-6 group-hover:scale-110 transition-transform">
                <item.icon className="w-6 h-6 gold-text" />
              </div>
              <h3 className="text-xl font-bold tracking-tight mb-3 text-black">{item.title}</h3>
              <p className="text-gray-600 text-sm font-medium leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
