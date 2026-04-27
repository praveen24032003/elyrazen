import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="h-16 px-10 flex items-center justify-between text-[11px] text-gray-400 border-t border-gray-100 bg-white uppercase tracking-widest mt-auto">
      <div className="flex gap-8 items-center">
        <div>© 2024 Elyra Zen Home Systems</div>
        <div className="hidden md:flex gap-6">
          <Link to="/" className="hover:text-black transition-colors">Home</Link>
          <Link to="/products" className="hover:text-black transition-colors">Products</Link>
          <Link to="/live-floor" className="hover:text-black transition-colors">Live Floor</Link>
        </div>
      </div>
      <div className="flex gap-8">
        <a href="#" className="hover:text-black transition-colors">Privacy</a>
        <a href="#" className="hover:text-black transition-colors">Terms</a>
      </div>
      <div className="hidden sm:flex items-center gap-2">
        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
        System: Active
      </div>
    </footer>
  );
}
