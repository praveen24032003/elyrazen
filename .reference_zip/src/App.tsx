import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import ProductsPage from './pages/ProductsPage';
import LiveFloor from './pages/LiveFloor';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-white flex flex-col font-sans selection:bg-black selection:text-white">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/live-floor" element={<LiveFloor />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
