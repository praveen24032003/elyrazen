import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import axios from 'axios';
import { Check, Info, X, Zap, Box } from 'lucide-react';

interface Product {
  id: string;
  _id?: string;
  name: string;
  description: string;
  category: string;
  imageUrl: string;
  price?: string;
}

export default function Products() {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [checkoutProduct, setCheckoutProduct] = useState<Product | null>(null);
  const [installPreference, setInstallPreference] = useState<'standard' | 'white-glove' | 'none'>('standard');

  React.useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await axios.get('/api/products');
        setProducts(response.data);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const handleFinalOrder = () => {
    if (!checkoutProduct) return;
    const phoneNumber = "917092564791";
    const installText = installPreference === 'none' 
      ? "I will handle installation myself." 
      : installPreference === 'standard' 
        ? "I would like standard professional installation." 
        : "I'm interested in the Premium White-Glove installation service.";
        
    const text = `Hello Elyra Zen! I'm interested in ordering the *${checkoutProduct.name}*.\n\n` +
      `Product Info: ${checkoutProduct.description}\n` +
      `Installation Preference: ${installText}\n\n` +
      `Please let me know the next steps for delivery and scheduling.`;
    
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(text)}`, '_blank');
    setCheckoutProduct(null);
  };

  return (
    <div className="flex flex-col gap-6 h-full">
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-64 bg-gray-100 rounded-[32px]" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 flex-1">
          {products.slice(0, 6).map((product, index) => (
            <motion.div
              key={product.id || product._id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="group flex flex-col bg-[#f5f5f7] rounded-[40px] p-8 border border-transparent hover:border-gray-200 transition-all duration-700 min-h-[450px]"
            >
              <div className="flex flex-col h-full">
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 bg-white px-2 py-1 rounded-md">
                      {product.category || 'Premium Service'}
                    </span>
                    {index === 0 && (
                      <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-2 py-1 rounded-md flex items-center gap-1">
                        <Zap className="w-3 h-3" /> Popular
                      </span>
                    )}
                  </div>
                  <h3 className="text-2xl font-bold tracking-tighter text-black mb-2">{product.name}</h3>
                  <p className="text-gray-500 text-sm font-medium leading-relaxed">{product.description}</p>
                </div>

                <div className="flex-1 relative my-6">
                  <div className="absolute inset-0 bg-white rounded-3xl border border-gray-100 flex items-center justify-center overflow-hidden shadow-sm group-hover:shadow-xl transition-all duration-700">
                    {product.imageUrl ? (
                      <img 
                        src={product.imageUrl} 
                        alt={product.name} 
                        className="w-full h-full object-contain p-10 group-hover:scale-110 transition-transform duration-[2000ms]"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-3 opacity-20">
                         <Box className="w-12 h-12" />
                         <span className="text-[10px] font-bold uppercase tracking-widest">[ Studio Render ]</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-4">
                   <button
                    onClick={() => {
                      setCheckoutProduct(product);
                      setInstallPreference('none');
                    }}
                    className="flex-1 bg-white text-black text-xs font-bold py-4 rounded-2xl border border-gray-200 hover:bg-gray-50 transition-all active:scale-95 shadow-sm"
                  >
                    Buy Unit
                  </button>
                  <button
                    onClick={() => {
                      setCheckoutProduct(product);
                      setInstallPreference('standard');
                    }}
                    className="flex-1 bg-black text-white text-xs font-bold py-4 rounded-2xl hover:bg-gray-800 transition-all active:scale-95 shadow-xl shadow-black/10"
                  >
                    Add Installation
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Checkout Modal */}
      <AnimatePresence>
        {checkoutProduct && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCheckoutProduct(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl bg-white rounded-[48px] shadow-2xl overflow-hidden p-10"
            >
              <button 
                onClick={() => setCheckoutProduct(null)}
                className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="mb-10">
                <h2 className="text-3xl font-bold tracking-tighter mb-2">Finalize Order</h2>
                <p className="text-gray-500 font-medium">Customize your Elyra Zen experience for {checkoutProduct.name}.</p>
              </div>

              <div className="space-y-6 mb-12">
                <div className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">Select Service Level</div>
                {[
                  { id: 'none', label: 'Unit Only', desc: 'Ships directly to your location. No service.', price: '+ ₹0' },
                  { id: 'standard', label: 'Professional Set-up', desc: 'In-home mounting, wiring, and basic configuration.', price: '+ ₹1,999' },
                  { id: 'white-glove', label: 'Premium White-Glove', desc: 'Holistic setup, AI training, and custom floor-plan sync.', price: '+ ₹4,999' }
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setInstallPreference(opt.id as any)}
                    className={`w-full p-6 rounded-3xl border-2 text-left transition-all flex items-center justify-between ${installPreference === opt.id ? 'border-black bg-black text-white' : 'border-gray-100 hover:border-gray-200'}`}
                  >
                    <div>
                      <div className="font-bold mb-1">{opt.label}</div>
                      <div className={`text-[11px] font-medium ${installPreference === opt.id ? 'text-gray-400' : 'text-gray-500'}`}>{opt.desc}</div>
                    </div>
                    <div className="text-xs font-mono font-bold">{opt.price}</div>
                  </button>
                ))}
              </div>

              <div className="bg-gray-50 p-6 rounded-3xl mb-12 flex items-center gap-4 border border-gray-100">
                <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl">
                  <Info className="w-6 h-6" />
                </div>
                <div className="text-xs text-gray-500 leading-relaxed">
                  Our specialists will contact you on WhatsApp to confirm system compatibility and schedule your installation window.
                </div>
              </div>

              <button
                onClick={handleFinalOrder}
                className="w-full bg-black text-white py-6 rounded-full font-bold uppercase tracking-widest text-sm hover:bg-gray-800 transition-all flex items-center justify-center gap-3 shadow-2xl shadow-black/20"
              >
                Confirm via WhatsApp
                <Check className="w-5 h-5" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
