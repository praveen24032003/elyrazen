import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle2 } from 'lucide-react';

export default function About() {
  return (
    <section id="philosophy" className="py-32 px-10 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-20 items-center">
          <div className="flex-1">
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-gray-400 mb-6">Our Philosophy</h2>
            <p className="text-4xl md:text-5xl font-bold tracking-tight text-black mb-8 leading-tight">
              Design that disappears into your lifestyle.
            </p>
            
            <div className="space-y-6">
              {[
                'Seamless architectural integration',
                'Intuitive control across all devices',
                'Bank-grade privacy and security'
              ].map((text) => (
                <div key={text} className="flex items-center gap-4 group">
                  <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center transition-transform group-hover:scale-110 shadow-lg shadow-black/20">
                    <CheckCircle2 className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-lg text-black font-semibold tracking-tight">{text}</span>
                </div>
              ))}
            </div>
            
            <div className="mt-12 group cursor-default">
              <div className="flex -space-x-3 mb-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-gray-200 overflow-hidden ring-1 ring-black/5 transition-transform group-hover:translate-x-2">
                    <img src={`https://picsum.photos/seed/user${i}/100/100`} alt="Client" referrerPolicy="no-referrer" />
                  </div>
                ))}
              </div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Trusted by 100+ Luxury Homeowners globally
              </p>
            </div>
          </div>
          
          <div className="flex-1 w-full flex flex-col gap-6">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-[#f5f5f7] rounded-[48px] p-12 relative overflow-hidden group border border-gray-100"
            >
              <div className="relative z-10">
                <blockquote className="text-2xl font-medium italic text-black mb-10 leading-relaxed">
                  "Elyra Zen didn't just automate my home; they elevated how I live every single day. The technology is invisible, but the difference is profound."
                </blockquote>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100">
                    <div className="w-8 h-8 bg-gray-100 rounded-full"></div>
                  </div>
                  <div>
                    <div className="font-bold text-black uppercase tracking-widest text-[10px]">Aesthetics Director</div>
                    <div className="text-gray-400 text-[10px] font-bold uppercase tracking-tight">Premium Client Case Study</div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-white/40 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-[2000ms]"></div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
