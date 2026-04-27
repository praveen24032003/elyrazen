import React from 'react';

export default function Stats() {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="bg-white p-4 rounded-2xl flex-1 border border-gray-200 transition-all hover:border-[#d4af37] shadow-sm">
        <div className="text-3xl font-bold text-black tracking-tighter">1000+</div>
        <div className="text-[10px] uppercase tracking-widest gold-text font-bold">Projects Delivered</div>
      </div>
      <div className="bg-white p-4 rounded-2xl flex-1 border border-gray-200 transition-all hover:border-[#d4af37] shadow-sm">
        <div className="text-3xl font-bold text-black tracking-tighter">20+</div>
        <div className="text-[10px] uppercase tracking-widest gold-text font-bold">Brands Supported</div>
      </div>
    </div>
  );
}
