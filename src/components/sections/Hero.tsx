import React from 'react';
import { motion } from 'motion/react';

export default function Hero() {
  return (
    <div className="flex flex-col">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tighter leading-[1.06] mb-6 text-black"
      >
        Premium smart home systems.<br />
        <span className="gold-text">Planned, installed, and supported end-to-end.</span>
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="text-gray-600 text-base sm:text-lg leading-relaxed mb-8 font-medium max-w-2xl"
      >
        Build your ideal smart home with one specialist partner for product selection,
        clean installation, and after-sales support. Lighting, security, climate,
        curtains, and control systems in one reliable ecosystem.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-wrap items-center gap-3 mb-6"
      >
        <a
          href="#/products"
          className="rounded-full px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-black gold-bg border gold-border hover:brightness-95 transition-colors"
        >
          Start Your Order
        </a>
        <a
          href="https://wa.me/917092564791?text=Hello%20Elyra%20Zen!%20I%20want%20a%20free%20smart%20home%20consultation."
          target="_blank"
          rel="noreferrer"
          className="rounded-full border gold-border bg-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-black hover:bg-gray-100 transition-colors"
        >
          Book Free Consultation
        </a>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-wrap items-center gap-3"
      >
        <span className="rounded-full border gold-border bg-gray-50 px-4 py-2 text-[11px] uppercase tracking-widest font-bold text-gray-700">Home Automation</span>
        <span className="rounded-full border gold-border bg-gray-50 px-4 py-2 text-[11px] uppercase tracking-widest font-bold text-gray-700">Gate + CCTV</span>
        <span className="rounded-full border gold-border bg-gray-50 px-4 py-2 text-[11px] uppercase tracking-widest font-bold text-gray-700">Lighting + Locks</span>
      </motion.div>
    </div>
  );
}
