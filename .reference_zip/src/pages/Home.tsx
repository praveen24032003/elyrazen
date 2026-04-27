import React from 'react';
import Hero from '../components/sections/Hero';
import Stats from '../components/sections/Stats';
import Products from '../components/sections/Products';
import Solutions from '../components/sections/Solutions';
import About from '../components/sections/About';
import ServicesList from '../components/sections/ServicesList';
import { MessageSquare } from 'lucide-react';

export default function Home() {
  return (
    <div className="max-w-[1400px] mx-auto w-full">
      {/* Split Layout Section */}
      <div className="flex flex-col lg:flex-row px-10 py-12 gap-12">
        {/* Left: Hero, Stats, Services */}
        <div className="w-full lg:w-[40%] flex flex-col justify-between gap-12">
          <div className="flex flex-col gap-8">
            <Hero />
            <Stats />
          </div>
          <ServicesList />
        </div>

        {/* Right: Product Grid & Banner */}
        <div className="flex-1 flex flex-col gap-8">
          <Products />
          
          {/* Feature Banner */}
          <div className="h-24 bg-gray-50 rounded-[32px] border border-gray-100 flex items-center justify-between px-8 transition-colors hover:bg-gray-100/50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div>
                <div className="text-sm font-bold">Live Consultant</div>
                <div className="text-xs text-gray-500">Available now on WhatsApp</div>
              </div>
            </div>
            <div className="text-right hidden sm:block">
              <div className="text-sm font-bold text-black">+91 7092564791</div>
              <div className="text-xs text-gray-400 font-medium">prasathkhan000@gmail.com</div>
            </div>
            <button 
              onClick={() => window.open('https://wa.me/917092564791', '_blank')}
              className="bg-black text-white px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors ml-4"
            >
              Chat Now
            </button>
          </div>
        </div>
      </div>

      {/* Extended Sections */}
      <About />
      <Solutions />
    </div>
  );
}
