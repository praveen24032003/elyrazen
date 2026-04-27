import React from 'react';

export default function ServicesList() {
  const services = [
    'Smart Lighting Systems',
    'Intelligent Climate Control',
    'AI Security Solutions',
    'Live Floor 3D Monitoring',
    'Remote Access Management'
  ];

  return (
    <div className="bg-black text-white p-8 rounded-[32px] mt-8 transition-transform hover:scale-[1.01] duration-500 shadow-xl shadow-black/10">
      <h3 className="text-xl font-bold mb-4 tracking-tight">Automation Services</h3>
      <ul className="text-gray-400 text-sm space-y-3">
        {services.map((service) => (
          <li key={service} className="flex items-center gap-3 group">
            <span className="w-1.5 h-1.5 bg-white rounded-full group-hover:scale-150 transition-transform"></span>
            <span className="group-hover:text-white transition-colors">{service}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
