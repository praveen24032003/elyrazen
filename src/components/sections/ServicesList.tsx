import React from 'react';

export default function ServicesList() {
  const services = [
    'Home + Gate Automation',
    'CCTV + Smart Security',
    'Curtain + Blind Automation',
    'Home Theatre Integration',
    'Premium Switches + Panels',
    'Remote App + Voice Control',
  ];

  return (
    <div className="bg-white text-black p-7 rounded-[30px] transition-transform hover:scale-[1.01] duration-500 border border-gray-200 shadow-sm gold-ring-soft">
      <h3 className="text-lg font-bold mb-4 tracking-tight gold-text">Automation Services</h3>
      <ul className="text-gray-600 text-sm space-y-3">
        {services.map((service) => (
          <li key={service} className="flex items-center gap-3 group">
            <span className="w-1.5 h-1.5 rounded-full gold-bg group-hover:scale-150 transition-transform"></span>
            <span className="group-hover:text-black transition-colors">{service}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
