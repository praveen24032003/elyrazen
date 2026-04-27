import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import axios from 'axios';
import { ShoppingCart, Minus, Plus, X, ArrowRight, ArrowLeft } from 'lucide-react';
import { trackEvent } from '../../lib/analytics';
import Toast from '../ui/Toast';

interface Product {
  id: string;
  _id?: string;
  name: string;
  description: string;
  category: string;
  brand?: string;
  protocol?: string;
  installAvailable?: boolean;
  popular?: boolean;
  imageUrl: string;
  price?: string;
}

type OrderMode = 'product-only' | 'with-installation';

type CartItem = {
  key: string;
  product: Product;
  mode: OrderMode;
  qty: number;
};

type CheckoutData = {
  fullName: string;
  phone: string;
  city: string;
  address: string;
  notes: string;
  website: string;
};

const initialCheckout: CheckoutData = {
  fullName: '',
  phone: '',
  city: '',
  address: '',
  notes: '',
  website: '',
};

export default function Products() {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [activeCategory, setActiveCategory] = React.useState<string>('All');
  const [activeBrand, setActiveBrand] = React.useState<string>('All');

  const [cart, setCart] = React.useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = React.useState(false);
  const [decisionProduct, setDecisionProduct] = React.useState<Product | null>(null);
  const [decisionIntent, setDecisionIntent] = React.useState<'request-now' | 'add-to-plan'>('request-now');

  const [checkoutStep, setCheckoutStep] = React.useState<1 | 2 | 3>(1);
  const [checkoutData, setCheckoutData] = React.useState<CheckoutData>(initialCheckout);
  const [isSubmittingLead, setIsSubmittingLead] = React.useState(false);
  const [submissionStatus, setSubmissionStatus] = React.useState('');
  const [submissionState, setSubmissionState] = React.useState<'idle' | 'error' | 'success'>('idle');
  const [submittedLeadId, setSubmittedLeadId] = React.useState('');
  const [requestStartedAt, setRequestStartedAt] = React.useState<number>(() => Date.now());
  const [toastState, setToastState] = React.useState<{ open: boolean; type: 'success' | 'error' | 'info'; title: string; message: string }>({
    open: false,
    type: 'info',
    title: '',
    message: '',
  });

  const MIN_FILL_TIME_MS = 2500;

  const showToast = (type: 'success' | 'error' | 'info', title: string, message: string) => {
    setToastState({ open: true, type, title, message });
  };

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

  const categories = React.useMemo(
    () => ['All', ...Array.from(new Set(products.map((product) => product.category))).sort()],
    [products],
  );

  const brands = React.useMemo(
    () => ['All', ...Array.from(new Set(products.map((product) => product.brand || 'Unbranded'))).sort()],
    [products],
  );

  const filteredProducts = React.useMemo(
    () =>
      products.filter((product) => {
        const categoryOk = activeCategory === 'All' || product.category === activeCategory;
        const brandOk = activeBrand === 'All' || (product.brand || 'Unbranded') === activeBrand;
        return categoryOk && brandOk;
      }),
    [products, activeCategory, activeBrand],
  );

  const popularProducts = React.useMemo(() => products.filter((product) => product.popular).slice(0, 4), [products]);

  const cartCount = React.useMemo(() => cart.reduce((sum, item) => sum + item.qty, 0), [cart]);
  const subtotalLabel = `${cartCount} item${cartCount === 1 ? '' : 's'}`;

  const openDecision = (product: Product, intent: 'request-now' | 'add-to-plan') => {
    setDecisionProduct(product);
    setDecisionIntent(intent);
  };

  const closeDecision = () => setDecisionProduct(null);

  const applyDecision = (mode: OrderMode) => {
    if (!decisionProduct) return;

    const key = `${decisionProduct.id || decisionProduct._id}-${mode}`;
    setCart((prev) => {
      const existing = prev.find((item) => item.key === key);
      if (existing) {
        return prev.map((item) => (item.key === key ? { ...item, qty: item.qty + 1 } : item));
      }
      return [...prev, { key, product: decisionProduct, mode, qty: 1 }];
    });

    if (decisionIntent === 'request-now') {
      setCheckoutStep(1);
      setSubmissionStatus('');
      setSubmissionState('idle');
      setSubmittedLeadId('');
      setRequestStartedAt(Date.now());
    }

    trackEvent('product_consultation_item_added', {
      mode,
      category: decisionProduct.category,
      brand: decisionProduct.brand || 'Unknown',
    });

    setIsCartOpen(true);
    closeDecision();
  };

  const removeFromCart = (key: string) => {
    setCart((prev) => prev.filter((item) => item.key !== key));
  };

  const updateQty = (key: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.key !== key) return item;
          return { ...item, qty: Math.max(1, item.qty + delta) };
        })
        .filter((item) => item.qty > 0),
    );
  };

  const updateMode = (key: string, mode: OrderMode) => {
    setCart((prev) => prev.map((item) => (item.key === key ? { ...item, mode } : item)));
  };

  const openCheckout = () => {
    if (!cart.length) return;
    setCheckoutStep(1);
    setSubmissionStatus('');
    setSubmissionState('idle');
    setSubmittedLeadId('');
    setRequestStartedAt(Date.now());
    setIsCartOpen(true);
  };

  const canProceedStep1 =
    checkoutData.fullName.trim().length > 1 &&
    checkoutData.phone.trim().length >= 10 &&
    checkoutData.city.trim().length > 1 &&
    checkoutData.address.trim().length > 5;

  const submitConsultationRequest = async () => {
    setIsSubmittingLead(true);
    setSubmissionStatus('');
    setSubmissionState('idle');

    if (checkoutData.website.trim()) {
      setSubmissionStatus('Invalid submission detected.');
      setSubmissionState('error');
      setIsSubmittingLead(false);
      trackEvent('lead_submit_blocked', { reason: 'honeypot', source: 'products_flow' });
      showToast('error', 'Blocked submission', 'Please retry using valid details.');
      return;
    }

    if (Date.now() - requestStartedAt < MIN_FILL_TIME_MS) {
      setSubmissionStatus('Please review your details and submit again.');
      setSubmissionState('error');
      setIsSubmittingLead(false);
      trackEvent('lead_submit_blocked', { reason: 'too_fast', source: 'products_flow' });
      showToast('error', 'Too fast', 'Please review your details and submit again.');
      return;
    }

    const orderLines = cart
      .map((item, index) => {
        const modeText = item.mode === 'with-installation' ? 'With Installation' : 'Product Only';
        return `${index + 1}. ${item.product.name} x${item.qty} (${modeText})`;
      })
      .join('\n');

    const leadMessage = [
      'Product Consultation Request',
      '',
      'Selected Items:',
      orderLines,
      '',
      `Address: ${checkoutData.address}`,
      `Notes: ${checkoutData.notes || 'None'}`,
    ].join('\n');

    try {
      const response = await axios.post('/api/leads', {
        name: checkoutData.fullName,
        phone: checkoutData.phone,
        city: checkoutData.city,
        service: 'Product Consultation',
        message: leadMessage,
        website: checkoutData.website,
        source: 'products_flow',
      });

      const createdLeadId = response.data?.id ? String(response.data.id) : '';
      setSubmittedLeadId(createdLeadId);
      setSubmissionStatus('Request submitted successfully.');
      setSubmissionState('success');
      trackEvent('lead_submit_success', {
        source: 'products_flow',
        items_count: cartCount,
        city: checkoutData.city,
      });
      showToast('success', 'Consultation request submitted', 'Our team will contact you shortly.');
      setCart([]);
      setCheckoutData(initialCheckout);
      setCheckoutStep(3);
      setRequestStartedAt(Date.now());
    } catch (error) {
      setSubmissionStatus('Submission failed. Please retry or use WhatsApp support.');
      setSubmissionState('error');
      trackEvent('lead_submit_failed', {
        source: 'products_flow',
        items_count: cartCount,
      });
      showToast('error', 'Submission failed', 'Please retry or use WhatsApp fallback.');
    } finally {
      setIsSubmittingLead(false);
    }
  };

  return (
    <section id="products" className="flex flex-col gap-6 h-full rounded-[34px] border border-gray-200 bg-white p-6 sm:p-8 shadow-sm">
      <Toast
        open={toastState.open}
        type={toastState.type}
        title={toastState.title}
        message={toastState.message}
        onClose={() => setToastState((prev) => ({ ...prev, open: false }))}
      />
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] gold-text mb-2">Product Universe</p>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-black">All-brand catalog with guided consultation flow</h2>
          <p className="mt-2 text-sm text-gray-600 max-w-2xl">
            Choose category and brand, select order mode, add to consultation list, then submit a structured request for our team.
          </p>
        </div>

        <button
          onClick={() => setIsCartOpen(true)}
          className="inline-flex items-center gap-2 rounded-full border gold-border bg-white px-4 py-2 text-xs font-bold uppercase tracking-wider text-black hover:bg-gray-100"
        >
          <ShoppingCart className="w-4 h-4" />
          Consultation List ({cartCount})
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-xl border gold-border bg-[#faf8ef] px-4 py-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] gold-text">Authorized Brands</p>
          <p className="mt-1 text-sm font-semibold text-black">Distributor-backed products only</p>
        </div>
        <div className="rounded-xl border gold-border bg-[#faf8ef] px-4 py-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] gold-text">Certified Install Team</p>
          <p className="mt-1 text-sm font-semibold text-black">Neat wiring and tested handover</p>
        </div>
        <div className="rounded-xl border gold-border bg-[#faf8ef] px-4 py-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] gold-text">Transparent Process</p>
          <p className="mt-1 text-sm font-semibold text-black">3-step guided request before team callback</p>
        </div>
        <div className="rounded-xl border gold-border bg-[#faf8ef] px-4 py-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] gold-text">Fast Response</p>
          <p className="mt-1 text-sm font-semibold text-black">Consultation support on chat</p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-64 bg-gray-100 rounded-[24px]" />
          ))}
        </div>
      ) : (
        <>
          <div className="rounded-2xl border border-gray-200 bg-[#fafafa] p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-3">Category Pages</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider transition ${
                    activeCategory === category
                      ? 'bg-black text-white'
                      : 'bg-white border border-gray-200 text-gray-500 hover:text-black'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-3">Brands</p>
            <div className="flex flex-wrap gap-2">
              {brands.map((brand) => (
                <button
                  key={brand}
                  onClick={() => setActiveBrand(brand)}
                  className={`rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider transition ${
                    activeBrand === brand
                      ? 'bg-black text-white'
                      : 'bg-white border border-gray-200 text-gray-500 hover:text-black'
                  }`}
                >
                  {brand}
                </button>
              ))}
            </div>
          </div>

          {popularProducts.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-3">Popular Picks</p>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {popularProducts.map((product) => (
                  <div key={`popular-${product.id || product._id}`} className="rounded-xl border border-gray-200 bg-white p-4">
                    <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">{product.brand || 'Brand'}</p>
                    <h3 className="text-sm font-bold text-black mt-1">{product.name}</h3>
                    <p className="text-xs text-gray-500 mt-1">{product.category}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id || product._id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
                className="group flex flex-col bg-white rounded-[26px] p-6 border border-gray-200 hover:border-gray-300 transition-all duration-500 min-h-[320px] shadow-sm"
              >
                <div className="flex flex-col h-full">
                  <div className="mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-0.5 block">
                      {product.category || 'Premium Service'}
                    </span>
                    <h3 className="text-lg font-bold tracking-tight text-black">{product.name}</h3>
                    <p className="text-gray-600 text-xs font-medium line-clamp-2">{product.description}</p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">
                      {product.brand || 'Brand'} • {product.protocol || 'Protocol'}
                    </p>
                  </div>

                  <div className="flex-1 relative my-3">
                    <div className="absolute inset-0 bg-gray-50 rounded-2xl border border-dashed border-gray-200 flex items-center justify-center overflow-hidden">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-700"
                          loading="lazy"
                          decoding="async"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">[ Product Image ]</span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => openDecision(product, 'request-now')}
                      className="flex-1 bg-black text-white text-[10px] font-bold py-2 rounded-full hover:bg-gray-800 transition-colors"
                    >
                      Request Consultation
                    </button>
                    <button
                      onClick={() => openDecision(product, 'add-to-plan')}
                      className="flex-1 bg-white text-black text-[10px] font-bold py-2 rounded-full border border-gray-300 hover:bg-gray-100 transition-colors"
                    >
                      Add to List
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <AnimatePresence>
            {decisionProduct && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[70] bg-black/40 flex items-center justify-center p-4"
              >
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 20, opacity: 0 }}
                  className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl"
                >
                  <h3 className="text-lg font-bold text-black">How should we handle this item?</h3>
                  <p className="text-sm text-gray-600 mt-2">{decisionProduct.name}</p>
                  <div className="mt-5 grid grid-cols-1 gap-3">
                    <button
                      onClick={() => applyDecision('product-only')}
                      className="rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-black hover:bg-gray-100"
                    >
                      Product Only (Delivery)
                    </button>
                    <button
                      onClick={() => applyDecision('with-installation')}
                      className="rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white hover:bg-gray-800"
                    >
                      Product + Professional Installation
                    </button>
                  </div>
                  <button onClick={closeDecision} className="mt-4 text-xs uppercase tracking-widest text-gray-500 hover:text-black">
                    Back
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {isCartOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[65] bg-black/30"
                  onClick={() => setIsCartOpen(false)}
                />
                <motion.aside
                  initial={{ x: 420 }}
                  animate={{ x: 0 }}
                  exit={{ x: 420 }}
                  transition={{ type: 'spring', stiffness: 280, damping: 28 }}
                  className="fixed right-0 top-0 z-[66] h-full w-full max-w-md bg-white border-l border-gray-200 shadow-2xl p-5 overflow-y-auto"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-black">Checkout Assistant</h3>
                    <button onClick={() => setIsCartOpen(false)} className="text-gray-500 hover:text-black">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2 mb-5">
                    {[1, 2, 3].map((step) => (
                      <div
                        key={step}
                        className={`h-1.5 flex-1 rounded-full ${checkoutStep >= step ? 'bg-black' : 'bg-gray-200'}`}
                      />
                    ))}
                  </div>

                  {checkoutStep === 1 && (
                    <div>
                      <p className="text-sm font-semibold text-black mb-3">Step 1 of 3: Tell us your delivery details</p>
                      <div className="space-y-3">
                        <input
                          value={checkoutData.fullName}
                          onChange={(e) => setCheckoutData((prev) => ({ ...prev, fullName: e.target.value }))}
                          placeholder="Your full name"
                          className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                        />
                        <input
                          value={checkoutData.phone}
                          onChange={(e) => setCheckoutData((prev) => ({ ...prev, phone: e.target.value }))}
                          placeholder="WhatsApp number"
                          className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                        />
                        <input
                          value={checkoutData.city}
                          onChange={(e) => setCheckoutData((prev) => ({ ...prev, city: e.target.value }))}
                          placeholder="City / Area"
                          className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                        />
                        <textarea
                          value={checkoutData.address}
                          onChange={(e) => setCheckoutData((prev) => ({ ...prev, address: e.target.value }))}
                          placeholder="Complete address"
                          rows={3}
                          className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                        />
                        <textarea
                          value={checkoutData.notes}
                          onChange={(e) => setCheckoutData((prev) => ({ ...prev, notes: e.target.value }))}
                          placeholder="Notes for our team (optional)"
                          rows={2}
                          className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                        />
                        <input
                          tabIndex={-1}
                          autoComplete="off"
                          value={checkoutData.website}
                          onChange={(e) => setCheckoutData((prev) => ({ ...prev, website: e.target.value }))}
                          className="hidden"
                          aria-hidden="true"
                          name="website"
                        />
                      </div>
                      <button
                        disabled={!canProceedStep1}
                        onClick={() => setCheckoutStep(2)}
                        className="mt-4 w-full rounded-xl bg-black py-2.5 text-white font-semibold disabled:opacity-50 inline-flex items-center justify-center gap-2"
                      >
                        Continue to Cart Review <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {checkoutStep === 2 && (
                    <div>
                      <p className="text-sm font-semibold text-black mb-3">Step 2 of 3: Review selected items</p>
                      {cart.length === 0 ? (
                        <p className="text-sm text-gray-500">Your cart is empty.</p>
                      ) : (
                        <AnimatePresence>
                          <div className="space-y-2">
                            {cart.map((item) => (
                              <motion.div
                                key={item.key}
                                layout
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: 40, height: 0, marginBottom: 0, paddingTop: 0, paddingBottom: 0 }}
                                transition={{ duration: 0.25 }}
                                className="rounded-xl border border-gray-200 px-3 py-2"
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <p className="text-sm font-semibold text-black">{item.product.name}</p>
                                    <p className="text-xs text-gray-500">{item.product.brand || 'Brand'} • {item.product.category}</p>
                                  </div>
                                  <button onClick={() => removeFromCart(item.key)} className="text-gray-400 hover:text-black">
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>

                                <div className="mt-2 flex items-center gap-2">
                                  <button onClick={() => updateQty(item.key, -1)} className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center"><Minus className="w-3.5 h-3.5" /></button>
                                  <span className="text-sm font-semibold">{item.qty}</span>
                                  <button onClick={() => updateQty(item.key, 1)} className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center"><Plus className="w-3.5 h-3.5" /></button>
                                </div>

                                <div className="mt-2 grid grid-cols-2 gap-2">
                                  <button
                                    onClick={() => updateMode(item.key, 'product-only')}
                                    className={`rounded-lg border px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${
                                      item.mode === 'product-only' ? 'border-black bg-black text-white' : 'border-gray-300 text-black'
                                    }`}
                                  >
                                    Delivery Only
                                  </button>
                                  <button
                                    onClick={() => updateMode(item.key, 'with-installation')}
                                    className={`rounded-lg border px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${
                                      item.mode === 'with-installation' ? 'border-black bg-black text-white' : 'border-gray-300 text-black'
                                    }`}
                                  >
                                    With Installation
                                  </button>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </AnimatePresence>
                      )}

                      <div className="mt-4 rounded-xl border border-gray-200 bg-[#fafafa] px-3 py-2">
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <span>Items Selected</span>
                          <span className="font-semibold text-black">{subtotalLabel}</span>
                        </div>
                      </div>

                      <div className="mt-4 flex gap-2">
                        <button onClick={() => setCheckoutStep(1)} className="flex-1 rounded-xl border border-gray-300 py-2.5 font-semibold inline-flex items-center justify-center gap-2">
                          <ArrowLeft className="w-4 h-4" /> Back to Details
                        </button>
                        <button
                          disabled={!cart.length}
                          onClick={() => setCheckoutStep(3)}
                          className="flex-1 rounded-xl bg-black py-2.5 text-white font-semibold disabled:opacity-50 inline-flex items-center justify-center gap-2"
                        >
                          Continue to Confirmation <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {checkoutStep === 3 && (
                    <div>
                      {submissionState === 'success' ? (
                        <div>
                          <p className="text-sm font-semibold text-black mb-3">Request submitted successfully</p>
                          <div className="rounded-xl border gold-border bg-[#faf8ef] p-3 text-xs text-gray-700 space-y-1">
                            <p><span className="font-semibold text-black">Lead ID:</span> {submittedLeadId || 'Generated'}</p>
                            <p><span className="font-semibold text-black">Next Step 1:</span> Consultant validation call</p>
                            <p><span className="font-semibold text-black">Next Step 2:</span> Site visit / requirement freeze</p>
                            <p><span className="font-semibold text-black">Next Step 3:</span> Proposal and project timeline</p>
                          </div>
                          <button
                            onClick={() => {
                              setCheckoutData(initialCheckout);
                              setSubmissionStatus('');
                              setSubmissionState('idle');
                              setSubmittedLeadId('');
                              setCheckoutStep(1);
                              setIsCartOpen(false);
                            }}
                            className="mt-3 w-full rounded-xl border border-gray-300 py-2 text-xs font-bold uppercase tracking-wider hover:bg-gray-100"
                          >
                            Close
                          </button>
                        </div>
                      ) : (
                        <>
                          <p className="text-sm font-semibold text-black mb-3">Step 3 of 3: Submit consultation request</p>
                          <div className="rounded-xl border border-gray-200 bg-[#fafafa] p-3 text-xs text-gray-700 space-y-1">
                            <p><span className="font-semibold text-black">Customer:</span> {checkoutData.fullName}</p>
                            <p><span className="font-semibold text-black">Phone:</span> {checkoutData.phone}</p>
                            <p><span className="font-semibold text-black">City:</span> {checkoutData.city}</p>
                            <p><span className="font-semibold text-black">Address:</span> {checkoutData.address}</p>
                            <p><span className="font-semibold text-black">Selected Items:</span> {subtotalLabel}</p>
                          </div>

                          <div className="mt-4 flex gap-2">
                            <button onClick={() => setCheckoutStep(2)} className="flex-1 rounded-xl border border-gray-300 py-2.5 font-semibold inline-flex items-center justify-center gap-2">
                              <ArrowLeft className="w-4 h-4" /> Back to Review
                            </button>
                            <button
                              onClick={submitConsultationRequest}
                              disabled={isSubmittingLead || cart.length === 0}
                              className="flex-1 rounded-xl bg-black py-2.5 text-white font-semibold hover:bg-gray-800 disabled:opacity-50"
                            >
                              {isSubmittingLead ? 'Submitting...' : 'Submit Request'}
                            </button>
                          </div>

                          <button
                            onClick={() => {
                              const quickText = `Hello Elyra Zen, I have submitted a consultation request. Name: ${checkoutData.fullName}, City: ${checkoutData.city}`;
                              window.open(`https://wa.me/917092564791?text=${encodeURIComponent(quickText)}`, '_blank');
                            }}
                            className="mt-3 w-full rounded-xl border border-gray-300 py-2 text-xs font-bold uppercase tracking-wider hover:bg-gray-100"
                          >
                            Optional: Notify on WhatsApp
                          </button>

                          {submissionStatus && (
                            <p className={`mt-3 text-xs font-semibold ${submissionState === 'error' ? 'text-red-600' : 'text-black'}`}>{submissionStatus}</p>
                          )}

                          {submissionState === 'error' && (
                            <button
                              onClick={submitConsultationRequest}
                              disabled={isSubmittingLead}
                              className="mt-2 w-full rounded-xl border border-gray-300 py-2 text-xs font-bold uppercase tracking-wider hover:bg-gray-100 disabled:opacity-60"
                            >
                              Retry Submission
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  )}

                  <button onClick={openCheckout} className="mt-5 w-full rounded-full border border-gray-300 py-2 text-xs font-bold uppercase tracking-wider hover:bg-gray-100">
                    Start Guided Request
                  </button>
                </motion.aside>
              </>
            )}
          </AnimatePresence>
        </>
      )}
    </section>
  );
}
