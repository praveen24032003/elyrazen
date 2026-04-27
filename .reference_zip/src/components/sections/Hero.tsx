import React from 'react';
import { motion } from 'motion/react';

export default function Hero() {
  return (
    <div className="flex flex-col">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="text-6xl font-bold tracking-tighter leading-[1.1] mb-6 text-black"
      >
        Smart living.<br />Simplified.
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="text-gray-500 text-lg leading-relaxed mb-8 font-medium"
      >
        Premium home automation designed with elegance and precision. 
        Seamlessly integrated, completely under your control.
      </motion.p>
    </div>
  );
}
