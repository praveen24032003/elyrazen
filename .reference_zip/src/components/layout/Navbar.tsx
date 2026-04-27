import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, Box, ShoppingCart, Activity } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = React.useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Products', href: '/products' },
    { name: 'Live Floor', href: '/live-floor', icon: Activity },
  ];

  const activeLinkClass = "text-black border-b-2 border-black pb-1 font-bold";
  const inactiveLinkClass = "text-gray-500 hover:text-black";

  return (
    <nav className="h-20 px-10 flex items-center justify-between border-b border-gray-100 bg-white sticky top-0 z-[1001]">
      <Link to="/" className="flex items-center gap-2 group">
        <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center transition-transform group-hover:rotate-12">
          <div className="w-4 h-4 bg-white rounded-full"></div>
        </div>
        <span className="text-2xl font-bold tracking-tighter text-black uppercase">Elyra Zen</span>
      </Link>

      {/* Desktop Links */}
      <div className="hidden md:flex gap-12 text-sm font-medium">
        {navLinks.map((link) => (
          <Link
            key={link.name}
            to={link.href}
            className={`transition-all flex items-center gap-2 ${location.pathname === link.href ? activeLinkClass : inactiveLinkClass}`}
          >
            {link.icon && <link.icon className="w-4 h-4" />}
            {link.name}
          </Link>
        ))}
      </div>

      <div className="hidden md:flex items-center gap-6">
        <button 
          onClick={() => window.open('https://wa.me/917092564791', '_blank')}
          className="bg-black text-white px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-all active:scale-95 shadow-xl shadow-black/10 flex items-center gap-3"
        >
          <ShoppingCart className="w-4 h-4" />
          Request Quote
        </button>
      </div>

      {/* Mobile Menu Toggle */}
      <button
        className="md:hidden p-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-100 p-8 flex flex-col gap-6 shadow-2xl z-[1000]"
          >
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className={`text-2xl font-bold tracking-tighter ${location.pathname === link.href ? 'text-black' : 'text-gray-400'}`}
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <button
              onClick={() => {
                window.open('https://wa.me/917092564791', '_blank');
                setIsOpen(false);
              }}
              className="bg-black text-white px-5 py-4 rounded-2xl text-center font-bold uppercase tracking-widest text-sm"
            >
              Contact Specialist
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
