import React from 'react';

export default function Footer() {
  return (
    <footer className="min-h-16 px-5 sm:px-8 lg:px-10 py-4 flex flex-col md:flex-row items-center justify-between gap-3 text-[11px] text-gray-500 border-t border-gray-200 bg-white uppercase tracking-widest">
      <div>© 2026 Elyra Zen Home Systems</div>
      <div className="flex gap-8">
        <a href="#" className="hover:text-[#9f7b21] transition-colors">Privacy</a>
        <a href="#" className="hover:text-[#9f7b21] transition-colors">Terms</a>
        <a href="#" className="hover:text-[#9f7b21] transition-colors">Support</a>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full gold-bg"></span>
        System Status: Online
      </div>
    </footer>
  );
}
