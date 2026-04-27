import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

type AppRoute = 'home' | 'products' | 'live-floor' | 'admin';

type NavbarProps = {
  route: AppRoute;
  isAdminUser?: boolean;
};

export default function Navbar({ route, isAdminUser = false }: NavbarProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const { user, signInWithGoogle, signOut } = useAuth();

  const navLinks = [
    { name: 'Home', href: '#/', key: 'home' as AppRoute },
    { name: 'Products', href: '#/products', key: 'products' as AppRoute },
    { name: 'Live Floor 3D', href: '#/live-floor', key: 'live-floor' as AppRoute },
    ...(isAdminUser ? [{ name: 'Admin', href: '#/admin', key: 'admin' as AppRoute }] : []),
  ];

  return (
    <nav className="h-20 px-5 sm:px-8 lg:px-10 flex items-center justify-between border-b border-gray-200 bg-white/95 backdrop-blur-xl sticky top-0 z-50">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center gold-ring-soft">
          <div className="w-4 h-4 rounded-full gold-bg"></div>
        </div>
        <span className="text-2xl font-bold tracking-tighter text-black uppercase">Elyra Zen</span>
      </div>

      {/* Desktop Links */}
      <div className="hidden md:flex gap-8 text-sm font-medium text-gray-500">
        {navLinks.map((link) => (
          <a
            key={link.name}
            href={link.href}
            className={`transition-colors hover:text-black ${
              route === link.key
                ? 'text-black'
                : link.key === 'products'
                  ? 'text-gray-700 font-semibold'
                  : ''
            }`}
          >
            {link.key === 'live-floor' && <Activity className="inline-block w-4 h-4 mr-1.5 -mt-0.5 gold-text" />}
            {link.name}
            {link.key === 'products' && <span className="ml-1 text-[9px] font-bold uppercase tracking-wider gold-text">Shop</span>}
          </a>
        ))}
      </div>

      <div className="hidden md:flex gap-4 items-center">
        {user ? (
          <>
            <span className="text-xs text-gray-500 max-w-44 truncate" title={user.email || ''}>
              {user.email}
            </span>
            <button
              onClick={() => signOut()}
              className="text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-black transition-colors"
            >
              Sign Out
            </button>
          </>
        ) : (
          <button
            onClick={async () => {
              try {
                await signInWithGoogle();
              } catch (error) {
                alert('Google sign-in is not configured yet.');
              }
            }}
            className="text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-black transition-colors"
          >
            Sign In with Google
          </button>
        )}
        <button 
          onClick={async () => {
            try {
              const res = await fetch('/api/seed', { method: 'POST' });
              const data = await res.json();
              if (res.ok) alert(`Database Seeded: ${data.count} products added.`);
              else alert(`Seeding failed: ${data.error}`);
            } catch (e) {
              alert('Cloud DB connection required for seeding.');
            }
          }}
          className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-black transition-colors"
        >
          Seed DB
        </button>
        <button 
          onClick={() => window.open('https://wa.me/917092564791', '_blank')}
          className="px-6 py-2 rounded-full text-sm font-semibold text-black gold-bg border gold-border hover:brightness-95 transition-colors"
        >
          Book Consultation
        </button>
      </div>

      {/* Mobile Menu Toggle */}
      <button
        className="md:hidden p-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="w-6 h-6 text-black" /> : <Menu className="w-6 h-6 text-black" />}
      </button>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-200 p-6 flex flex-col gap-4 shadow-xl"
          >
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className={`text-lg font-medium text-gray-500 hover:text-black ${
                  route === link.key
                    ? 'text-black'
                    : link.key === 'products'
                      ? 'text-gray-700 font-semibold'
                      : ''
                }`}
                onClick={() => setIsOpen(false)}
              >
                {link.key === 'live-floor' && <Activity className="inline-block w-4 h-4 mr-2 -mt-0.5 gold-text" />}
                {link.name}
                {link.key === 'products' && <span className="ml-2 text-[10px] uppercase tracking-wider gold-text">Shop</span>}
              </a>
            ))}
            <button
              onClick={async () => {
                try {
                  if (user) {
                    await signOut();
                  } else {
                    await signInWithGoogle();
                  }
                  setIsOpen(false);
                } catch (error) {
                  alert('Authentication setup is incomplete.');
                }
              }}
              className="text-left text-lg font-medium text-gray-600 hover:text-black"
            >
              {user ? 'Sign Out' : 'Sign In with Google'}
            </button>
            <button
              onClick={() => {
                window.open('https://wa.me/917092564791', '_blank');
                setIsOpen(false);
              }}
              className="bg-black text-white px-5 py-3 rounded-xl text-center font-semibold"
            >
              WhatsApp Support
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
