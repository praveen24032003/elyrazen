import React from 'react';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Hero from './components/sections/Hero';
import Stats from './components/sections/Stats';
import ServicesList from './components/sections/ServicesList';
import { MessageSquare } from 'lucide-react';
import { useAuth } from './context/AuthContext';

const LiveFloorExperience = React.lazy(() => import('./components/sections/LiveFloorExperience'));
const BrandsMarquee = React.lazy(() => import('./components/sections/BrandsMarquee'));
const Products = React.lazy(() => import('./components/sections/Products'));
const About = React.lazy(() => import('./components/sections/About'));
const Solutions = React.lazy(() => import('./components/sections/Solutions'));
const CaseStudies = React.lazy(() => import('./components/sections/CaseStudies'));
const ConversionFunnels = React.lazy(() => import('./components/sections/ConversionFunnels'));
const AdminLeads = React.lazy(() => import('./components/sections/AdminLeads'));

type AppRoute = 'home' | 'products' | 'live-floor' | 'admin';

const ADMIN_EMAIL = 'elyrazen.in@gmail.com';

function getRouteFromHash(hash: string): AppRoute {
  const normalized = hash.toLowerCase();
  if (normalized.startsWith('#/admin')) return 'admin';
  if (normalized.startsWith('#/products')) return 'products';
  if (normalized.startsWith('#/live-floor')) return 'live-floor';
  return 'home';
}

export default function App() {
  const lazyFallback = <div className="h-40 rounded-2xl bg-gray-100 animate-pulse mt-10" />;
  const [route, setRoute] = React.useState<AppRoute>(() => getRouteFromHash(window.location.hash));
  const { user } = useAuth();
  const isAdminUser = user?.email?.toLowerCase() === ADMIN_EMAIL;

  React.useEffect(() => {
    const onHashChange = () => setRoute(getRouteFromHash(window.location.hash));
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  return (
    <div data-gold-tone="subtle" className="min-h-screen flex flex-col font-sans bg-[#f5f5f7] text-black">
      <Navbar route={route} isAdminUser={isAdminUser} />
      
      <main className="flex-1 max-w-[1400px] mx-auto w-full px-5 sm:px-8 lg:px-10 py-10 sm:py-12">
        {route === 'home' && (
          <>
            <section className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              <div className="lg:col-span-3 rounded-[34px] border border-gray-200 bg-white p-8 sm:p-10 shadow-sm">
                <Hero />
              </div>

              <div className="lg:col-span-2 flex flex-col gap-8">
                <Stats />
                <ServicesList />

                <div className="min-h-24 bg-white rounded-[28px] border border-gray-200 flex items-center justify-between px-6 py-4 transition-colors hover:bg-gray-50 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-white gold-bg border gold-border">
                      <MessageSquare className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-black">Live Consultant</div>
                      <div className="text-xs gold-text">Available now on WhatsApp</div>
                    </div>
                  </div>
                  <div className="text-right hidden sm:block">
                    <div className="text-sm font-bold text-black">+91 7092564791</div>
                    <div className="text-xs text-gray-500 font-medium">prasathkhan000@gmail.com</div>
                  </div>
                  <button
                    onClick={() => window.open('https://wa.me/917092564791', '_blank')}
                    className="px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider text-black gold-bg border gold-border hover:brightness-95 transition-colors ml-4"
                  >
                    Chat Now
                  </button>
                </div>
              </div>
            </section>

            <React.Suspense fallback={lazyFallback}>
              <div className="mt-10">
                <BrandsMarquee />
              </div>
              <CaseStudies />
              <About />
              <Solutions />
            </React.Suspense>
          </>
        )}

        {route === 'products' && (
          <React.Suspense fallback={lazyFallback}>
            <Products />
            <ConversionFunnels />
          </React.Suspense>
        )}

        {route === 'live-floor' && (
          <React.Suspense fallback={lazyFallback}>
            <LiveFloorExperience />
          </React.Suspense>
        )}

        {route === 'admin' && (
          <React.Suspense fallback={lazyFallback}>
            {isAdminUser ? (
              <AdminLeads />
            ) : (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
                Admin access is restricted to elyrazen.in@gmail.com.
              </div>
            )}
          </React.Suspense>
        )}
      </main>

      <Footer />
    </div>
  );
}
