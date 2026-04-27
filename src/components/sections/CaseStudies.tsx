import React from 'react';
import { motion } from 'motion/react';
import axios from 'axios';

type CaseStudy = {
  id: string;
  title: string;
  location: string;
  propertyType: string;
  scope: string[];
  result: string;
  highlight: string;
  imageUrl: string;
};

export default function CaseStudies() {
  const [items, setItems] = React.useState<CaseStudy[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchCaseStudies() {
      try {
        const response = await axios.get('/api/case-studies');
        setItems(response.data);
      } catch (error) {
        console.error('Failed to fetch case studies:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCaseStudies();
  }, []);

  return (
    <section id="case-studies" className="rounded-[34px] border border-gray-200 bg-white p-6 sm:p-8 mt-10 shadow-sm">
      <div className="mb-8">
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] gold-text mb-2">Case Studies</p>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-black">Real installations. Measurable outcomes.</h2>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-72 rounded-2xl bg-gray-100" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {items.map((item, index) => (
            <motion.article
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className="rounded-2xl border border-gray-200 bg-white overflow-hidden hover:border-[#d4af37] transition-colors"
            >
              <div className="h-40 overflow-hidden border-b border-gray-200">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="h-full w-full object-cover"
                  loading="lazy"
                  decoding="async"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="p-5">
                <p className="text-[10px] uppercase tracking-widest gold-text font-bold">
                  {item.propertyType} • {item.location}
                </p>
                <h3 className="mt-2 text-lg font-bold text-black">{item.title}</h3>
                <p className="mt-2 text-sm text-gray-600">{item.highlight}</p>
                <p className="mt-2 text-xs text-black font-semibold">{item.result}</p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {item.scope.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border gold-border bg-[#faf8ef] px-2.5 py-1 text-[10px] uppercase tracking-wider text-gray-600"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      )}
    </section>
  );
}
