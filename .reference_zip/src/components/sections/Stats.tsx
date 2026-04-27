import React from 'react';
import { motion } from 'motion/react';

export default function Stats() {
  return (
    <div className="flex gap-3 mt-6">
      <div className="bg-gray-50 p-4 rounded-2xl flex-1 border border-gray-100 transition-all hover:bg-white hover:border-gray-200">
        <div className="text-3xl font-bold text-black tracking-tighter">100+</div>
        <div className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Clients Served</div>
      </div>
      <div className="bg-gray-50 p-4 rounded-2xl flex-1 border border-gray-100 transition-all hover:bg-white hover:border-gray-200">
        <div className="text-3xl font-bold text-black tracking-tighter">1+</div>
        <div className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Years Excellence</div>
      </div>
    </div>
  );
}
