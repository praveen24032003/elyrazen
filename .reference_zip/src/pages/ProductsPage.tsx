import React from 'react';
import ProductsGrid from '../components/sections/Products';
import { motion } from 'motion/react';
import { ShoppingBag, ShieldCheck, Truck } from 'lucide-react';

export default function ProductsPage() {
  return (
    <div className="bg-white">
      {/* Header Section */}
      <section className="pt-32 pb-20 px-10 bg-gray-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl font-bold tracking-tighter mb-6"
          >
            Store.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-500 max-w-2xl font-medium"
          >
            The best way to buy the products you love. Our curated selection of premium 
            smart home devices is ready to transform your living space.
          </motion.p>
        </div>
      </section>

      {/* Trust Badges */}
      <div className="px-10 py-12 flex flex-col md:flex-row gap-8 justify-center max-w-7xl mx-auto">
        <div className="flex items-center gap-4 text-sm font-semibold uppercase tracking-widest text-gray-400">
          <Truck className="w-5 h-5" />
          Free Installation*
        </div>
        <div className="flex items-center gap-4 text-sm font-semibold uppercase tracking-widest text-gray-400">
          <ShieldCheck className="w-5 h-5" />
          2 Year Warranty
        </div>
        <div className="flex items-center gap-4 text-sm font-semibold uppercase tracking-widest text-gray-400">
          <ShoppingBag className="w-5 h-5" />
          Expert Support
        </div>
      </div>

      {/* Main Grid */}
      <section className="px-10 pb-32">
        <div className="max-w-7xl mx-auto">
          <ProductsGrid />
        </div>
      </section>
    </div>
  );
}
